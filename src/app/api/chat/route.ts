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
// URL del Webhook de n8n (hardcoded por requerimiento)
const N8N_WEBHOOK_URL = 'https://federicosoriano.app.n8n.cloud/webhook/chat-canopia';

/**
 * Maneja peticiones POST al endpoint de chat
 * Reenvía el payload al webhook de n8n y retorna la respuesta procesada
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar configuración (ya no es necesario verificar env var)
    // if (!N8N_WEBHOOK_URL) { ... }

    // 2. Parsear y validar el body
    const payload: PayloadOpenAI = await request.json();

    if (!payload.message || !payload.cultivoContext) {
      return NextResponse.json<ApiResponseChat>({
        success: false,
        error: 'Faltan datos requeridos: message y contexto del cultivo'
      }, { status: 400 });
    }

    // 3. Enviar a n8n
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: payload.email,
        message: payload.message,
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
    const textResponse = await n8nResponse.text();
    let n8nData;

    try {
      if (!textResponse) {
        throw new Error('Respuesta vacía del servicio n8n');
      }

      // Intentar parsear como JSON
      try {
        n8nData = JSON.parse(textResponse);
      } catch {
        // Si falla el parseo, verificar si es un error HTML (común en 500s/502s)
        if (textResponse.trim().toLowerCase().startsWith('<!doctype html') ||
          textResponse.trim().toLowerCase().startsWith('<html')) {
          console.error('❌ Error del servicio (HTML recibido):', textResponse.substring(0, 200));
          throw new Error('El servicio de IA no está disponible momentáneamente (Error de servidor).');
        }

        // Si no es HTML, asumir que la respuesta es texto plano válido (la IA respondió directo sin JSON)
        console.log('⚠️ La respuesta no es JSON, usando texto plano:', textResponse.substring(0, 50));
        n8nData = { output: textResponse };
      }

    } catch (parseError) {
      console.error('❌ Error procesando respuesta de n8n:', parseError);
      throw parseError instanceof Error ? parseError : new Error('Error procesando respuesta del servidor');
    }

    // Adaptar según la estructura real que definas en n8n o el texto plano recuperado
    // Normalizar la respuesta (n8n a veces devuelve un array)
    const responseItem = Array.isArray(n8nData) ? n8nData[0] : n8nData;

    const respuestaIA = responseItem?.output ||
      responseItem?.response ||
      responseItem?.text ||
      responseItem?.message ||
      (typeof responseItem === 'string' ? responseItem : "No se recibió respuesta interpretables.");

    if (respuestaIA === "No se recibió respuesta interpretables.") {
      console.error('❌ Estructura de respuesta n8n no reconocida:', JSON.stringify(n8nData, null, 2));
    } else {
      console.log('✅ Respuesta procesada correctamente');
    }

    return NextResponse.json<ApiResponseChat>({
      success: true,
      data: respuestaIA,
      message: 'Respuesta generada', // Mensaje genérico
      tokens: n8nData.tokens // Opcional
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
