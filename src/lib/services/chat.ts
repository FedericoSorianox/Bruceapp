/**
 * Servicio client-side para gestión de chat con IA
 * Maneja comunicación con OpenAI y persistencia de mensajes
 */

import type {
  MensajeChat,
  PayloadOpenAI,
  ApiResponseChat,
  ContextoCultivo,
  ImagenMensaje,
  ImagenPayload
} from '@/types/chat';
import type { Cultivo } from '@/types/cultivo';

// Configuración base
const API_BASE = '/api';

/**
 * Convierte una URL de imagen a base64
 * Útil para procesar imágenes de la galería
 * @param url - URL de la imagen
 * @returns Promise con string base64
 */
export async function convertirUrlABase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Error al leer el blob de la imagen'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error(`Error al descargar la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Convierte archivo de imagen a base64
 * @param file - Archivo de imagen
 * @returns Promise con string base64
 */
export async function convertirImagenABase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remover el prefijo "data:image/...;base64," para obtener solo el base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Procesa archivos de imagen para el chat
 * @param files - FileList de imágenes seleccionadas
 * @returns Promise con array de ImagenMensaje procesadas
 */
export async function procesarImagenes(files: FileList): Promise<ImagenMensaje[]> {
  const imagenes: ImagenMensaje[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error(`El archivo ${file.name} no es una imagen válida`);
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`La imagen ${file.name} es demasiado grande (máximo 10MB)`);
    }

    try {
      const base64 = await convertirImagenABase64(file);
      const url = URL.createObjectURL(file);

      const imagen: ImagenMensaje = {
        id: `img_${Date.now()}_${i}`,
        name: file.name,
        url,
        base64,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };

      imagenes.push(imagen);
    } catch (error) {
      throw new Error(`Error al procesar la imagen ${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  return imagenes;
}

/**
 * Envía mensaje al chat de IA con contexto del cultivo
 * @param mensaje - Texto del mensaje del usuario
 * @param contexto - Contexto completo del cultivo
 * @param imagenes - Imágenes adjuntas (opcional)
 * @param historial - Historial reciente de mensajes (opcional)
 * @returns Promise con la respuesta de la IA
 */
export async function enviarMensajeIA(
  mensaje: string,
  contexto: ContextoCultivo,
  imagenes?: ImagenMensaje[],
  historial?: MensajeChat[],
  email?: string
): Promise<string> {
  try {
    // Preparar payload para OpenAI
    const imagenesPayload: ImagenPayload[] | undefined = imagenes
      ?.filter((img): img is ImagenMensaje & { base64: string } => Boolean(img.base64))
      .map((img) => ({
        base64: img.base64,
        mimeType: img.mimeType,
        nombre: img.name
      }));

    const payload: PayloadOpenAI = {
      message: mensaje,
      email,
      cultivoContext: contexto,
      imagenes: imagenesPayload,
      historialReciente: historial
    };

    // Enviar petición a la API
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Error en la petición`);
    }

    const data: ApiResponseChat<string> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error || 'La IA no pudo generar una respuesta');
    }

    return data.data;
  } catch (error) {
    console.error('Error al enviar mensaje a IA:', error);
    throw error;
  }
}

/**
 * Crea un nuevo mensaje de chat del usuario
 * @param cultivoId - ID del cultivo
 * @param contenido - Contenido del mensaje
 * @param imagenes - Imágenes adjuntas (opcional)
 * @returns Nuevo mensaje de chat
 */
export function crearMensajeUsuario(
  cultivoId: string,
  contenido: string,
  imagenes?: ImagenMensaje[]
): MensajeChat {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    cultivoId,
    tipo: 'user',
    contenido,
    imagenes,
    tipoContenido: imagenes && imagenes.length > 0 ?
      (contenido.trim() ? 'mixed' : 'image') : 'text',
    timestamp: new Date().toISOString(),
    procesando: false,
    activo: true
  };
}

/**
 * Crea un nuevo mensaje de respuesta de la IA
 * @param cultivoId - ID del cultivo
 * @param contenido - Respuesta de la IA
 * @param mensajeUsuarioId - ID del mensaje del usuario al que responde
 * @returns Nuevo mensaje de chat de la IA
 */
export function crearMensajeIA(
  cultivoId: string,
  contenido: string,
  mensajeUsuarioId?: string
): MensajeChat {
  return {
    id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    cultivoId,
    tipo: 'assistant',
    contenido,
    tipoContenido: 'text',
    timestamp: new Date().toISOString(),
    procesando: false,
    respuestaA: mensajeUsuarioId,
    activo: true
  };
}

/**
 * Crea un mensaje del sistema (ej: "Analizando imagen...")
 * @param cultivoId - ID del cultivo
 * @param contenido - Mensaje del sistema
 * @returns Nuevo mensaje del sistema
 */
export function crearMensajeSistema(
  cultivoId: string,
  contenido: string
): MensajeChat {
  return {
    id: `sys_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    cultivoId,
    tipo: 'system',
    contenido,
    tipoContenido: 'text',
    timestamp: new Date().toISOString(),
    procesando: true,
    activo: true
  };
}

/**
 * Gestiona la conversación completa con la IA
 * Incluye crear mensajes del usuario, del sistema, y obtener respuesta de IA
 * @param cultivoId - ID del cultivo
 * @param mensaje - Mensaje del usuario
 * @param contexto - Contexto del cultivo
 * @param imagenes - Imágenes adjuntas
 * @param historial - Historial de mensajes
 * @param onMensajeCreado - Callback cuando se crea un nuevo mensaje
 * @returns Promise con el mensaje de respuesta de la IA
 */
export async function gestionarConversacionIA(
  cultivoId: string,
  mensaje: string,
  contexto: ContextoCultivo,
  imagenes: ImagenMensaje[] | undefined,
  historial: MensajeChat[],
  onMensajeCreado: (mensaje: MensajeChat) => void,
  email?: string
): Promise<MensajeChat> {
  // 1. Crear y enviar mensaje del usuario
  const mensajeUsuario = crearMensajeUsuario(cultivoId, mensaje, imagenes);
  onMensajeCreado(mensajeUsuario);

  // 2. Crear mensaje del sistema si hay imágenes
  let mensajeSistema: MensajeChat | undefined;
  if (imagenes && imagenes.length > 0) {
    mensajeSistema = crearMensajeSistema(
      cultivoId,
      `Analizando ${imagenes.length} imagen${imagenes.length > 1 ? 'es' : ''}...`
    );
    onMensajeCreado(mensajeSistema);
  }

  try {
    // 3. Obtener respuesta de la IA
    const respuestaIA = await enviarMensajeIA(mensaje, contexto, imagenes, historial, email);

    // 4. Crear mensaje de respuesta de la IA
    const mensajeIA = crearMensajeIA(cultivoId, respuestaIA, mensajeUsuario.id);

    // 5. Remover mensaje del sistema si existe
    if (mensajeSistema) {
      // El componente debe manejar la remoción del mensaje del sistema
    }

    return mensajeIA;
  } catch (error) {
    // Crear mensaje de error
    const mensajeError = crearMensajeIA(
      cultivoId,
      `❌ Error: ${error instanceof Error ? error.message : 'No se pudo obtener respuesta de la IA'}`
    );
    mensajeError.error = error instanceof Error ? error.message : 'Error desconocido';

    return mensajeError;
  }
}

/**
 * Libera recursos de imágenes (URLs temporales)
 * @param imagenes - Array de imágenes a limpiar
 */
export function limpiarImagenes(imagenes: ImagenMensaje[]): void {
  imagenes.forEach(imagen => {
    if (imagen.url.startsWith('blob:')) {
      URL.revokeObjectURL(imagen.url);
    }
  });
}

/**
 * Valida el contexto del cultivo antes de enviar a IA
 * @param contexto - Contexto a validar
 * @returns true si es válido, false en caso contrario
 */
export function validarContextoCultivo(contexto: ContextoCultivo): boolean {
  return !!(contexto.id && contexto.nombre);
}

/**
 * Prepara el contexto del cultivo desde un objeto Cultivo
 * @param cultivo - Objeto cultivo completo
 * @returns Contexto preparado para la IA
 */
export function prepararContextoCultivo(cultivo: Cultivo): ContextoCultivo {
  // Calcular métricas si es posible
  let diasDesdeInicio: number | undefined;
  let plantasPorM2: number | undefined;
  let wattsPorM2: number | undefined;
  let litrosTotales: number | undefined;

  if (cultivo.fechaComienzo) {
    const inicio = new Date(cultivo.fechaComienzo);
    const hoy = new Date();
    const diffTime = Math.abs(hoy.getTime() - inicio.getTime());
    diasDesdeInicio = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  if (cultivo.numeroplantas && cultivo.metrosCuadrados) {
    plantasPorM2 = cultivo.numeroplantas / cultivo.metrosCuadrados;
  }

  if (cultivo.potenciaLamparas && cultivo.metrosCuadrados) {
    wattsPorM2 = cultivo.potenciaLamparas / cultivo.metrosCuadrados;
  }

  if (cultivo.litrosMaceta && cultivo.numeroplantas) {
    litrosTotales = cultivo.litrosMaceta * cultivo.numeroplantas;
  }

  // Preparar información de la galería para contexto de IA (sin datos de imagen binarios)
  const galeriaImagenes = cultivo.galeria?.map(imagen => ({
    id: imagen.id,
    nombre: imagen.nombre,
    descripcion: imagen.descripcion,
    fechaTomada: imagen.fechaTomada,
    fechaSubida: imagen.fechaSubida
  }));

  return {
    id: cultivo.id,
    nombre: cultivo.nombre,
    genetica: cultivo.genetica,
    sustrato: cultivo.sustrato,
    fechaComienzo: cultivo.fechaComienzo,
    metrosCuadrados: cultivo.metrosCuadrados,
    numeroplantas: cultivo.numeroplantas,
    litrosMaceta: cultivo.litrosMaceta,
    potenciaLamparas: cultivo.potenciaLamparas,
    diasDesdeInicio,
    plantasPorM2,
    wattsPorM2,
    litrosTotales,
    activo: cultivo.activo,
    notas: cultivo.notas,
    galeriaImagenes
  };
}

/**
 * Consulta recomendación específica de pH a la IA
 * @param contexto - Contexto del cultivo
 * @returns Promise con la recomendación de pH
 */
export async function consultarRecomendacionPH(contexto: ContextoCultivo): Promise<number | null> {
  try {
    const mensaje = `Basado en este cultivo de cannabis, ¿cuál sería el valor óptimo de pH para el agua de riego? Proporciona solo el valor numérico (ej: 6.2). Considera la genética, fase actual, sustrato y condiciones ambientales.`;

    const respuesta = await enviarMensajeIA(mensaje, contexto);

    // Extraer el valor numérico de la respuesta
    const match = respuesta.match(/(\d+\.?\d*)/);
    if (match) {
      const valor = parseFloat(match[1]);
      // Validar que esté en rango típico de pH (0-14)
      if (valor >= 0 && valor <= 14) {
        return valor;
      }
    }

    console.warn('No se pudo extraer un valor de pH válido de la respuesta:', respuesta);
    return null;
  } catch (error) {
    console.error('Error al consultar recomendación de pH:', error);
    return null;
  }
}

/**
 * Consulta recomendación específica de EC a la IA
 * @param contexto - Contexto del cultivo
 * @returns Promise con la recomendación de EC
 */
export async function consultarRecomendacionEC(contexto: ContextoCultivo): Promise<number | null> {
  try {
    const mensaje = `Basado en este cultivo de cannabis, ¿cuál sería el valor óptimo de EC (conductividad eléctrica) en mS para el agua de riego? Proporciona solo el valor numérico (ej: 1.8). Considera la genética, fase actual, sustrato y condiciones ambientales.`;

    const respuesta = await enviarMensajeIA(mensaje, contexto);

    // Extraer el valor numérico de la respuesta
    const match = respuesta.match(/(\d+\.?\d*)/);
    if (match) {
      const valor = parseFloat(match[1]);
      // Validar que esté en rango típico de EC para cannabis (0.8-3.0)
      if (valor >= 0.1 && valor <= 5.0) {
        return valor;
      }
    }

    console.warn('No se pudo extraer un valor de EC válido de la respuesta:', respuesta);
    return null;
  } catch (error) {
    console.error('Error al consultar recomendación de EC:', error);
    return null;
  }
}

/**
 * Consulta recomendación de temperatura para una fase específica
 * @param contexto - Contexto del cultivo
 * @param fase - Fase del cultivo ('vegetacion' | 'floracion')
 * @returns Promise con la recomendación de temperatura
 */
export async function consultarRecomendacionTemperatura(contexto: ContextoCultivo, fase: 'vegetacion' | 'floracion'): Promise<number | null> {
  try {
    const nombreFase = fase === 'vegetacion' ? 'vegetación' : 'floración';
    const mensaje = `Basado en este cultivo de cannabis en fase de ${nombreFase}, ¿cuál sería la temperatura ambiente óptima en grados Celsius? Proporciona solo el valor numérico (ej: 25). Considera la genética, fase actual, sustrato y otras condiciones ambientales.`;

    const respuesta = await enviarMensajeIA(mensaje, contexto);

    // Extraer el valor numérico de la respuesta
    const match = respuesta.match(/(\d+\.?\d*)/);
    if (match) {
      const valor = parseFloat(match[1]);
      // Validar que esté en rango típico de temperatura para cannabis (15-35°C)
      if (valor >= 10 && valor <= 40) {
        return valor;
      }
    }

    console.warn('No se pudo extraer un valor de temperatura válido de la respuesta:', respuesta);
    return null;
  } catch (error) {
    console.error('Error al consultar recomendación de temperatura:', error);
    return null;
  }
}

/**
 * Consulta recomendación de humedad para una fase específica
 * @param contexto - Contexto del cultivo
 * @param fase - Fase del cultivo ('vegetacion' | 'floracion')
 * @returns Promise con la recomendación de humedad
 */
export async function consultarRecomendacionHumedad(contexto: ContextoCultivo, fase: 'vegetacion' | 'floracion'): Promise<number | null> {
  try {
    const nombreFase = fase === 'vegetacion' ? 'vegetación' : 'floración';
    const mensaje = `Basado en este cultivo de cannabis en fase de ${nombreFase}, ¿cuál sería el porcentaje óptimo de humedad relativa del ambiente? Proporciona solo el valor numérico (ej: 65). Considera la genética, fase actual, sustrato y otras condiciones ambientales.`;

    const respuesta = await enviarMensajeIA(mensaje, contexto);

    // Extraer el valor numérico de la respuesta
    const match = respuesta.match(/(\d+\.?\d*)/);
    if (match) {
      const valor = parseFloat(match[1]);
      // Validar que esté en rango de humedad (0-100%)
      if (valor >= 0 && valor <= 100) {
        return valor;
      }
    }

    console.warn('No se pudo extraer un valor de humedad válido de la respuesta:', respuesta);
    return null;
  } catch (error) {
    console.error('Error al consultar recomendación de humedad:', error);
    return null;
  }
}
