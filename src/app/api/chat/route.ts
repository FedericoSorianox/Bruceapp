/**
 * API Route para Chat con IA especializada en Cannabis Medicinal
 * Integra con n8n para orquestar la lógica de IA y procesamiento de imágenes
 * 
 * Esta API actúa como un proxy hacia el workflow de n8n que maneja:
 * - Análisis de contexto del cultivo
 * - Procesamiento de imágenes (Cloudinary + Vision)
 * - Generación de respuestas con LLM (OpenAI/Anthropic gestionado en n8n)
 */

import { NextRequest, NextResponse } from 'next/server';
import type { PayloadOpenAI, ApiResponseChat } from '@/types/chat';

// URL del Webhook de n8n definida en variables de entorno
const N8N_WEBHOOK_URL = process.env.N8N_CHAT_WEBHOOK_URL;

/**
 * Maneja peticiones POST al endpoint de chat
 * Reenvía el payload al webhook de n8n y retorna la respuesta procesada
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar configuración
    if (!N8N_WEBHOOK_URL) {
      console.error('❌ N8N_CHAT_WEBHOOK_URL no definida en variables de entorno');
      return NextResponse.json<ApiResponseChat>({
        success: false,
        error: 'Servicio de IA no configurado correctamente (backend)'
      }, { status: 503 });
    }

    // 2. Parsear y validar el body
    const payload: PayloadOpenAI = await request.json();

    if (!payload.mensaje || !payload.cultivoContext) {
      return NextResponse.json<ApiResponseChat>({
        success: false,
        error: 'Faltan datos requeridos: mensaje y contexto del cultivo'
      }, { status: 400 });
    }

    // 3. Enviar a n8n
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mensaje: payload.mensaje,
        contexto: payload.cultivoContext,
        historial: payload.historialReciente || [],
        imagenes: payload.imagenes || [],
        timestamp: new Date().toISOString()
      })
    });

    if (!n8nResponse.ok) {
      throw new Error(`Error en n8n: ${n8nResponse.status} ${n8nResponse.statusText}`);
    }

    // 4. Procesar respuesta de n8n
    const n8nData = await n8nResponse.json();

    // Se espera que n8n retorne { response: string, tokens?: object }
    // Adaptar según la estructura real que definas en n8n
    const respuestaIA = n8nData.output || n8nData.response || n8nData.text || "No se recibió respuesta del orquestador.";

    console.log('✅ Respuesta recibida de n8n');

    return NextResponse.json<ApiResponseChat>({
      success: true,
      data: respuestaIA,
      message: 'Respuesta generada vía n8n',
      tokens: n8nData.tokens // Opcional, si n8n lo devuelve
    });

  } catch (error) {
    console.error('❌ Error en API de chat (Proxy n8n):', error);

    return NextResponse.json<ApiResponseChat>({
      success: false,
      error: 'Error al comunicarse con el servicio de inteligencia artificial.',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * Maneja peticiones GET para verificar el estado del servicio
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Servicio de chat (Proxy n8n) activo',
    configured: !!process.env.N8N_CHAT_WEBHOOK_URL
  });
}
