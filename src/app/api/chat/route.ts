/**
 * API Route para el Motor Híbrido de IA y Base de Conocimiento Agronómica (CanopIA)
 *
 * Arquitectura inteligente de 3 niveles para máxima consistencia y mínimo uso de tokens:
 * 1. Fast-Path Determinístico (0 Tokens): Resuelve consultas de pH, EC, clima, VPD, planes de tareas
 *    y patologías tipificadas directamente desde `agronomicKnowledgeBase.ts`.
 * 2. Micro-RAG de Bajo Consumo (`gpt-4o-mini` / n8n con contexto comprimido <180 tokens):
 *    Para consultas abiertas o análisis de fotos, inyecta únicamente el protocolo exacto de la KB.
 * 3. Resiliencia Total (Zero-500 Guarantee): Si el proveedor externo (n8n / OpenAI) falla o da timeout,
 *    responde automáticamente con el diagnóstico y acciones de la Base de Conocimiento local.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { PayloadOpenAI, ApiResponseChat } from '@/types/chat';
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

    // PASO 1: Consultar la Base de Conocimiento Agronómica Local (0 Tokens)
    const resultadoKB = generarRespuestaConocimientoLocal(
      payload.message,
      payload.cultivoContext,
      tieneImagenes
    );

    // Si el modo es 'kb_only' o la Base de Conocimiento cubre el 100% de la consulta sin necesitar visión
    if (payload.modo === 'kb_only' || (resultadoKB.esSuficienteSinLLM && !tieneImagenes)) {
      return NextResponse.json<ApiResponseChat>({
        success: true,
        data: resultadoKB.respuesta,
        message: 'Respuesta determinística desde Base de Conocimiento CanopIA (0 tokens)',
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

    // PASO 2: Construir prompt Micro-RAG ultra-comprimido fundamentado en la Base de Conocimiento
    const rag = construirPromptComprimidoRAG(payload.message, payload.cultivoContext);

    // Intentar primero con OpenAI SDK directo (gpt-4o-mini: rápido, consistente, muy pocos tokens)
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
                detail: 'low', // 'low' consume solo 85 tokens por imagen manteniendo precisión diagnóstica
              },
            });
          }
        }

        // Incluir como máximo los últimos 2 mensajes de historial comprimidos para ahorrar tokens
        const historialCompacto: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = (
          payload.historialReciente || []
        )
          .slice(-2)
          .map((m) => ({
            role: m.tipo === 'user' ? ('user' as const) : ('assistant' as const),
            content: m.contenido.substring(0, 220),
          }));

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          max_tokens: 320,
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
            message: 'Respuesta generada con Micro-RAG CanopIA',
            accionesSugeridas: rag.accionesKB,
            fuentesConocimiento: rag.fuentesKB,
            tokens: {
              prompt: completion.usage?.prompt_tokens ?? 160,
              completion: completion.usage?.completion_tokens ?? 120,
              total: completion.usage?.total_tokens ?? 280,
              fuente: 'kb_rag_llm',
            },
          });
        }
      } catch (openAiError) {
        console.warn('⚠️ OpenAI directo no disponible, intentando webhook o fallback KB:', openAiError);
      }
    }

    // PASO 3: Intentar Webhook n8n con timeout corto (4.5s) enviando el contexto ya enriquecido por la KB
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          email: payload.email,
          message: `${rag.systemPrompt}\n\nConsulta del usuario: ${payload.message}`,
          contexto: payload.cultivoContext,
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
              message: 'Respuesta generada vía n8n + KB',
              accionesSugeridas: rag.accionesKB,
              fuentesConocimiento: rag.fuentesKB,
              tokens: {
                prompt: 180,
                completion: 140,
                total: 320,
                fuente: 'n8n_webhook',
              },
            });
          }
        }
      }
    } catch (n8nError) {
      console.warn('⚠️ Webhook n8n no disponible, activando Motor de Conocimiento Local:', n8nError);
    }

    // PASO 4: Fallback Garantizado desde la Base de Conocimiento Local (nunca devuelve 500)
    return NextResponse.json<ApiResponseChat>({
      success: true,
      data: resultadoKB.respuesta,
      message: 'Respuesta generada por la Base de Conocimiento Agronómica Local (0 tokens)',
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
    message: 'Motor Híbrido CanopIA (Base de Conocimiento + Micro-RAG) activo',
    kbActive: true,
    openAiConfigured: Boolean(process.env.OPENAI_API_KEY),
  });
}
