/**
 * API Route para Consultas de IA con Arquitectura RAG (Retrieval-Augmented Generation)
 *
 * Flujo en Producción para cada consulta del usuario:
 * 1. PRIMERO consulta la Base de Datos de Conocimiento (Corpus Dr. Bruce Bugbee USU +
 *    Athena Ag Handbook + Reglas y API Key guardadas en MongoDB `Conocimiento`).
 * 2. SEGUNDO cruza esa referencia con TODO el Contexto Completo del Cultivo (física de sala,
 *    PPFD/DLI, sustrato, genética, etapa fenológica, objetivos actuales, notas y bitácora).
 * 3. TERCERO envía esa referencia + el contexto a la IA (OpenAI `gpt-4o-mini` o n8n) para
 *    que use tokens razonando sobre la base científica oficial y responda al usuario.
 * 4. Si no hay API Key o la red externa falla, responde con el analizador conversacional
 *    de la Base de Conocimiento Local (calculando VPD, pH, EC y acciones específicas al dato del usuario).
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
import { resolveOpenAiApiKey } from '@/lib/knowledge/aiConfig';

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
    let openAiKeyDB = '';
    try {
      await connectDB();
      const docKB = await Conocimiento.findOne({ clave: 'corpus_custom_bugbee_athena' }).lean();
      if (docKB?.contenido) {
        apuntesPersonalizadosDB = docKB.contenido;
      }
      if (docKB?.openAiApiKey) {
        openAiKeyDB = docKB.openAiApiKey;
      }
    } catch {
      // Continuar con el corpus estático si MongoDB no responde en este instante
    }

    const resultadoKB = generarRespuestaConocimientoLocal(
      payload.message,
      payload.cultivoContext,
      tieneImagenes,
      payload.historialReciente
    );

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
    // (b) Diagnóstico pre-calculado por el motor determinístico (VPD real, desvíos de temperatura/pH/EC)
    // (c) Contexto Completo del Cultivo (métricas, fechas, notas, bitácora)
    const rag = construirPromptComprimidoRAG(
      payload.message,
      payload.cultivoContext,
      apuntesPersonalizadosDB,
      payload.historialReciente
    );

    const systemPromptConCalculo = `${rag.systemPrompt}\n--- 3. PRE-CÁLCULO CIENTÍFICO DE LA BASE DE CONOCIMIENTO PARA ESTA CONSULTA ---\n${resultadoKB.respuesta}\n\nINSTRUCCIÓN: Usa los datos exactos del Pre-Cálculo Científico y del Contexto del Cultivo para darle al usuario una respuesta directa, clara y conversacional a su mensaje, manteniendo continuidad con el historial. No uses tablas con barras "|", usa listas con viñetas claras.`;

    const activeOpenAiKey = resolveOpenAiApiKey(openAiKeyDB);

    // PASO 3A: Ejecutar IA con OpenAI (`gpt-4o-mini`) fundamentada en la Base de Conocimiento
    if (activeOpenAiKey) {
      try {
        const openai = new OpenAI({ apiKey: activeOpenAiKey });

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
          .filter((m) => m.tipo === 'user' || m.tipo === 'assistant')
          .slice(-6)
          .map((m) => ({
            role: m.tipo === 'user' ? ('user' as const) : ('assistant' as const),
            content: m.contenido.substring(0, 450),
          }));

        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          temperature: 0.25,
          max_tokens: 450,
          messages: [
            { role: 'system', content: systemPromptConCalculo },
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
            accionesSugeridas: resultadoKB.accionesSugeridas,
            fuentesConocimiento: rag.fuentesKB,
            tokens: {
              prompt: completion.usage?.prompt_tokens ?? 280,
              completion: completion.usage?.completion_tokens ?? 160,
              total: completion.usage?.total_tokens ?? 440,
              fuente: 'kb_rag_llm',
            },
          });
        }
      } catch (openAiError) {
        console.warn('⚠️ OpenAI directo falló, probando webhook n8n o motor local:', openAiError);
      }
    }

    // PASO 3B: Si no hay OpenAI Key activa, enviar el Prompt RAG + Contexto a n8n
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          email: payload.email,
          message: `${systemPromptConCalculo}\n\nCONSULTA DEL USUARIO: ${payload.message}`,
          userQuestion: payload.message,
          knowledgeBaseReference: systemPromptConCalculo,
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
              accionesSugeridas: resultadoKB.accionesSugeridas,
              fuentesConocimiento: rag.fuentesKB,
              tokens: {
                prompt: 260,
                completion: 160,
                total: 420,
                fuente: 'n8n_webhook',
              },
            });
          }
        }
      }
    } catch (n8nError) {
      console.warn('⚠️ Webhook n8n no disponible, usando analizador de Base de Conocimiento:', n8nError);
    }

    // PASO 4: Respuesta del Analizador Conversacional de la Base de Conocimiento (con cálculo de VPD/pH/EC específico)
    return NextResponse.json<ApiResponseChat>({
      success: true,
      data: resultadoKB.respuesta,
      message: 'Respuesta generada por Analizador de Base de Conocimiento (Bruce Bugbee + Athena)',
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
    openAiConfigured: Boolean(resolveOpenAiApiKey()),
    n8nWebhookUrl: N8N_WEBHOOK_URL,
  });
}
