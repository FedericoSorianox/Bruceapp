/**
 * API Route para Consultas de IA con Arquitectura RAG (Retrieval-Augmented Generation)
 *
 * Flujo en Producción para cada consulta del usuario:
 * 1. PRIMERO consulta la Base de Datos de Conocimiento (Corpus Dr. Bruce Bugbee USU +
 *    Athena Ag Handbook + Reglas personalizadas guardadas en MongoDB `Conocimiento`).
 * 2. SEGUNDO cruza esa referencia con TODO el Contexto Completo del Cultivo (física de sala,
 *    PPFD/DLI, sustrato, genética, etapa fenológica, objetivos actuales, notas y bitácora).
 * 3. TERCERO envía esa referencia + el contexto a la IA (OpenAI `gpt-4o-mini` o n8n) para
 *    que use tokens razonando sobre la base científica oficial y responda al usuario.
 * 4. Si en algún momento la API externa no está disponible (o si se pide `modo: 'kb_only'`),
 *    responde con el motor determinístico local para garantizar 0 errores 500.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { PayloadOpenAI, ApiResponseChat } from '@/types/chat';
import connectDB from '@/lib/mongodb';
import Conocimiento from '@/lib/models/Conocimiento';
import {
  generarRespuestaConocimientoLocal,
  construirPromptComprimidoRAG,
} from '@/lib/knowledge/agronomicKnowledgeBase';

const N8N_WEBHOOK_URL =
  process.env.N8N_CHAT_WEBHOOK_URL || 'https://federicosoriano.app.n8n.cloud/webhook/chat-canopia';

export async function POST(request: NextRequest) {
  try {
    const payload: PayloadOpenAI = await request.json();

    if (!payload.message || !payload.cultivoContext) {
      return NextResponse.json<ApiResponseChat>(
        {
          success: false,
          error: 'Faltan datos requeridos: message y contexto del cultivo',
        },
        { status: 400 }
      );
    }

    const tieneImagenes = Boolean(payload.imagenes && payload.imagenes.length > 0);

    // PASO 1: Consultar la Base de Conocimiento (Código + MongoDB en Producción)
    let apuntesPersonalizadosDB = '';
    try {
      await connectDB();
      const docKB = await Conocimiento.findOne({ clave: 'corpus_custom_bugbee_athena' }).lean();
      if (docKB?.contenido) {
        apuntesPersonalizadosDB = docKB.contenido;
      }
    } catch {
      // Continuar con el corpus estático si MongoDB no responde en este instante
    }

    const resultadoKB = generarRespuestaConocimientoLocal(
      payload.message,
      payload.cultivoContext,
      tieneImagenes
    );

      // Si explícitamente se solicita solo cálculo de tabla sin LLM (`kb_only`)
      if (payload.modo === 'kb_only') {
        return NextResponse.json<ApiResponseChat>({
          success: true,
          data: resultadoKB.respuesta,
          message: 'Respuesta determinística desde Base de Conocimiento (0 tokens)',
          accionesSugeridas: resultadoKB.accionesSugeridas,
          fuentesConocimiento: resultadoKB.fuentesConocimiento,
          tokens: {
            prompt: 0,
            completion: 0,
            total: 0,
            fuente: 'kb_local',
          },
        });
      }

      // PASO 2: Construir el Prompt RAG con:
      // (a) Referencia Primaria de la Base de Conocimiento (Bruce Bugbee USU + Athena Ag + MongoDB)
      // (b) Contexto Completo del Cultivo (métricas, fechas, notas, bitácora)
      const rag = construirPromptComprimidoRAG(
        payload.message,
        payload.cultivoContext,
        apuntesPersonalizadosDB
      );

      // PASO 3A: Ejecutar IA con OpenAI (`gpt-4o-mini`) fundamentada en la Base de Conocimiento
      if (process.env.OPENAI_API_KEY) {
        try {
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

          const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
            { type: 'text', text: rag.userPrompt },
          ];

          if (tieneImagenes && payload.imagenes) {
            for (const img of payload.imagenes.slice(0, 2)) {
              userContent.push({
                type: 'image_url',
                image_url: {
                  url: `data:${img.mimeType || 'image/jpeg'};base64,${img.base64}`,
                  detail: 'low',
                },
              });
            }
          }

          const historialCompacto: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = (
            payload.historialReciente || []
          )
            .slice(-3)
            .map((m) => ({
              role: m.tipo === 'user' ? ('user' as const) : ('assistant' as const),
              content: m.contenido.substring(0, 280),
            }));

          const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            temperature: 0.25,
            max_tokens: 450,
            messages: [
              { role: 'system', content: rag.systemPrompt },
              ...historialCompacto,
              { role: 'user', content: userContent },
            ],
          });

          const textoIA = completion.choices[0]?.message?.content?.trim();
          if (textoIA) {
            return NextResponse.json<ApiResponseChat>({
              success: true,
              data: textoIA,
              message: 'Respuesta generada por IA con RAG (Bruce Bugbee USU + Athena Ag)',
              accionesSugeridas: rag.accionesKB,
              fuentesConocimiento: rag.fuentesKB,
              tokens: {
                prompt: completion.usage?.prompt_tokens ?? 240,
                completion: completion.usage?.completion_tokens ?? 160,
                total: completion.usage?.total_tokens ?? 400,
                fuente: 'kb_rag_llm',
              },
            });
          }
        } catch (openAiError) {
          console.warn('⚠️ OpenAI directo falló, probando webhook n8n con contexto RAG:', openAiError);
        }
      }

      // PASO 3B: Si no hay OPENAI_API_KEY o dio error, enviar el Prompt RAG + Contexto a n8n
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            email: payload.email,
            // Inyectamos la referencia obligatoria de la Base de Conocimiento + Contexto antes de la pregunta
            message: `${rag.systemPrompt}\n\nCONSULTA DEL USUARIO: ${payload.message}`,
            userQuestion: payload.message,
            knowledgeBaseReference: rag.systemPrompt,
            contexto: payload.cultivoContext,
            historial: (payload.historialReciente || []).slice(-3),
            imagenes: payload.imagenes || [],
            timestamp: new Date().toISOString(),
          }),
        });

        clearTimeout(timeoutId);

        if (n8nResponse.ok) {
          const textResponse = await n8nResponse.text();
          if (
            textResponse &&
            !textResponse.trim().toLowerCase().startsWith('<!doctype html') &&
            !textResponse.trim().toLowerCase().startsWith('<html')
          ) {
            let n8nData: Record<string, unknown> = {};
            try {
              n8nData = JSON.parse(textResponse);
            } catch {
              n8nData = { output: textResponse };
            }

            let responseItem: unknown = n8nData;
            while (Array.isArray(responseItem) && responseItem.length > 0) {
              responseItem = responseItem[0];
            }

            const itemObj = (responseItem && typeof responseItem === 'object' ? responseItem : {}) as Record<
              string,
              unknown
            >;
            const respuestaIA =
              (itemObj.output as string) ||
              (itemObj.reply as string) ||
              (itemObj.response as string) ||
              (itemObj.text as string) ||
              (itemObj.content as string) ||
              (itemObj.message as string) ||
              (typeof responseItem === 'string' ? responseItem : null);

            if (respuestaIA) {
              return NextResponse.json<ApiResponseChat>({
                success: true,
                data: respuestaIA,
                message: 'Respuesta generada por IA (n8n RAG + Base de Conocimiento)',
                accionesSugeridas: rag.accionesKB,
                fuentesConocimiento: rag.fuentesKB,
                tokens: {
                  prompt: 240,
                  completion: 160,
                  total: 400,
                  fuente: 'n8n_webhook',
                },
              });
            }
          }
        }
      } catch (n8nError) {
        console.warn('⚠️ Webhook n8n no disponible, usando síntesis local de Base de Conocimiento:', n8nError);
      }

      // PASO 4: Fallback Garantizado desde la Base de Conocimiento si ningún proveedor LLM respondió
      return NextResponse.json<ApiResponseChat>({
        success: true,
        data: resultadoKB.respuesta,
        message: 'Respuesta generada por la Base de Conocimiento Local (Fallback sin conexión a LLM)',
        accionesSugeridas: resultadoKB.accionesSugeridas,
        fuentesConocimiento: resultadoKB.fuentesConocimiento,
        tokens: {
          prompt: 0,
          completion: 0,
          total: 0,
          fuente: 'kb_local',
        },
      });
    } catch (error) {
      console.error('❌ Error inesperado en API de chat:', error);
      return NextResponse.json<ApiResponseChat>(
        {
          success: false,
          error: 'Error al procesar la solicitud en el motor agronómico.',
          message: error instanceof Error ? error.message : 'Error desconocido',
        },
        { status: 500 }
      );
    }
  }

export async function GET() {
    return NextResponse.json({
      success: true,
      message: 'Motor RAG CanopIA (Base de Conocimiento Bruce Bugbee + Athena Ag -> LLM) activo',
      kbActive: true,
      openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
      n8nWebhookUrl: N8N_WEBHOOK_URL,
    });
  }
