/**
 * API Route para Chat con IA especializada en Cannabis Medicinal
 * Integra con OpenAI GPT-4o Mini para análisis de texto e imágenes
 * 
 * Esta API actúa como un profesor especialista de la Universidad de Utah
 * en estudios científicos de cannabis medicinal, proporcionando consejos
 * expertos para maximizar la producción y calidad.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionContentPart } from 'openai/resources/chat/completions';
import type { PayloadOpenAI, ApiResponseChat, ContextoCultivo, ImagenPayload } from '@/types/chat';

// Inicializar cliente de OpenAI
// La API key debe estar configurada en las variables de entorno (.env.local)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Configura tu API key en .env.local
});

// Modelos recomendados por OpenAI a septiembre 2025
const MODELO_MULTIMODAL = 'gpt-4o-mini';
const MODELO_TEXTO = 'gpt-4o-mini';

/**
 * Construye el prompt del sistema que define el comportamiento de la IA
 * Este prompt instruye a la IA para actuar como un profesor especialista
 * @param contexto - Información completa del cultivo
 * @returns Prompt del sistema optimizado para OpenAI
 */
function construirPromptSistema(contexto: ContextoCultivo): string {
  return `Eres un profesor especialista en estudios científicos de cannabis medicinal de la Universidad de Utah, con más de 20 años de experiencia en cultivo interior y optimización de producción.

CONTEXTO DEL CULTIVO ACTUAL:
- Nombre: ${contexto.nombre}
- Genética: ${contexto.genetica || 'No especificada'}
- Sustrato: ${contexto.sustrato || 'No especificado'}
- Área: ${contexto.metrosCuadrados || 'No especificada'} m²
- Plantas: ${contexto.numeroplantas || 'No especificado'}
- Macetas: ${contexto.litrosMaceta || 'No especificado'} L cada una
- Potencia LED: ${contexto.potenciaLamparas || 'No especificada'} W
- Días desde inicio: ${contexto.diasDesdeInicio || 'No calculado'}
- Densidad: ${contexto.plantasPorM2 || 'No calculada'} plantas/m²
- Watts/m²: ${contexto.wattsPorM2 || 'No calculado'}
- Estado: ${contexto.activo ? 'Activo' : 'Finalizado'}
- Notas del cultivo: ${contexto.notas || 'Sin notas'}

INSTRUCCIONES:
1. Analiza SIEMPRE el contexto específico de este cultivo antes de responder
2. Proporciona consejos científicamente respaldados para maximizar producción y calidad
3. Considera las variables ambientales, genética, y etapa del cultivo
4. Si recibes imágenes, analiza detalladamente los síntomas visuales
5. Sugiere soluciones prácticas y específicas para el setup actual
6. Menciona rangos óptimos de pH, EC, temperatura, humedad cuando sea relevante
7. Explica el razonamiento científico detrás de tus recomendaciones
8. Adapta tus consejos al tamaño y configuración específica del cultivo
9. Mantén un tono profesional pero accesible, como un mentor experimentado

ESPECIALIDADES:
- Diagnóstico visual de deficiencias nutricionales
- Optimización de espectros lumínicos LED
- Manejo integrado de plagas en interior
- Maximización de cannabinoides y terpenos
- Técnicas de entrenamiento de plantas (LST, SCROG, etc.)
- Optimización de cosecha y curado
- Análisis de densidad de tricomas

Responde siempre en español y usa el contexto específico del cultivo para personalizar tus recomendaciones.`;
}

/**
 * Construye el prompt del usuario incluyendo el contexto y mensaje
 * @param mensaje - Mensaje del usuario
 * @param imagenes - Array de imágenes en base64 (opcional)
 * @returns Array de contenido para OpenAI
 */
function construirMensajeUsuario(mensaje: string, imagenes?: ImagenPayload[]): ChatCompletionContentPart[] {
  const contenido: ChatCompletionContentPart[] = [
    {
      type: 'text',
      text: mensaje
    }
  ];

  // Agregar imágenes si están presentes
  if (imagenes && imagenes.length > 0) {
    imagenes.forEach((imagen) => {
      contenido.push({
        type: 'image_url',
        image_url: {
          url: `data:${imagen.mimeType};base64,${imagen.base64}`,
          detail: 'high' // Análisis detallado para mejor diagnóstico
        }
      });
    });
  }

  return contenido;
}

/**
 * Maneja peticiones POST al endpoint de chat
 * Procesa mensajes de texto e imágenes con OpenAI GPT-4o Mini
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar que la API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY no está configurada en las variables de entorno');
      return NextResponse.json<ApiResponseChat>({
        success: false,
        error: 'Configuración de OpenAI no encontrada'
      }, { status: 500 });
    }

    // Parsear el body de la petición
    const payload: PayloadOpenAI = await request.json();
    
    // Validar datos requeridos
    if (!payload.mensaje || !payload.cultivoContext) {
      return NextResponse.json<ApiResponseChat>({
        success: false,
        error: 'Faltan datos requeridos: mensaje y contexto del cultivo'
      }, { status: 400 });
    }

    // Construir mensajes para OpenAI
    const mensajesOpenAI: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: construirPromptSistema(payload.cultivoContext)
      }
    ];

    // Agregar historial reciente si existe (últimos 5 mensajes para contexto)
    if (payload.historialReciente && payload.historialReciente.length > 0) {
      const historialLimitado = payload.historialReciente.slice(-5);
      
      historialLimitado.forEach(msg => {
        if (msg.tipo === 'user') {
          const imagenesHistorial: ImagenPayload[] | undefined = msg.imagenes
            ?.filter((img): img is typeof img & { base64: string } => Boolean(img.base64))
            .map((img) => ({
              base64: img.base64,
              mimeType: img.mimeType,
              nombre: img.name
            }));

          mensajesOpenAI.push({
            role: 'user',
            content: construirMensajeUsuario(msg.contenido, imagenesHistorial)
          });
        } else if (msg.tipo === 'assistant') {
          mensajesOpenAI.push({
            role: 'assistant',
            content: msg.contenido
          });
        }
      });
    }

    // Agregar mensaje actual del usuario
    mensajesOpenAI.push({
      role: 'user' as const,
      content: construirMensajeUsuario(payload.mensaje, payload.imagenes)
    });

    const modeloSeleccionado = payload.imagenes && payload.imagenes.length > 0 ? MODELO_MULTIMODAL : MODELO_TEXTO;

    console.log('Enviando petición a OpenAI...');
    console.log('Modelo a usar:', modeloSeleccionado);
    
    // Llamar a OpenAI
    const completion = await openai.chat.completions.create({
      model: modeloSeleccionado,
      messages: mensajesOpenAI,
      max_tokens: 1500, // Limite razonable para respuestas detalladas
      temperature: 0.7, // Balance entre creatividad y precisión
      top_p: 0.9,       // Enfoque en respuestas de alta probabilidad
    });

    // Extraer la respuesta
    const respuestaIA = completion.choices[0]?.message?.content;
    
    if (!respuestaIA) {
      throw new Error('OpenAI no retornó una respuesta válida');
    }

    console.log('Respuesta exitosa de OpenAI');
    console.log('Tokens usados:', completion.usage);

    // Retornar respuesta exitosa
    return NextResponse.json<ApiResponseChat>({
      success: true,
      data: respuestaIA,
      message: 'Respuesta generada exitosamente',
      tokens: completion.usage ? {
        prompt: completion.usage.prompt_tokens,
        completion: completion.usage.completion_tokens,
        total: completion.usage.total_tokens
      } : undefined
    });

  } catch (error) {
    console.error('Error en API de chat:', error);
    
    // Manejar errores específicos de OpenAI
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json<ApiResponseChat>({
          success: false,
          error: 'Límite de peticiones excedido. Intenta nuevamente en unos minutos.'
        }, { status: 429 });
      }
      
      if (error.message.includes('insufficient_quota')) {
        return NextResponse.json<ApiResponseChat>({
          success: false,
          error: 'Cuota de OpenAI agotada. Contacta al administrador.'
        }, { status: 402 });
      }
      
      if (error.message.includes('invalid_api_key')) {
        return NextResponse.json<ApiResponseChat>({
          success: false,
          error: 'API key de OpenAI inválida.'
        }, { status: 401 });
      }
    }

    // Error genérico
    return NextResponse.json<ApiResponseChat>({
      success: false,
      error: 'Error interno del servidor. Intenta nuevamente.',
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
    message: 'Servicio de chat con IA activo',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.OPENAI_API_KEY
  });
}
