/**
 * Servicio client-side para gestión de Chat IA y Motor de Conocimiento Agronómico
 * Integra cálculos determinísticos de 0 tokens desde la Base de Conocimiento (KB)
 * y consultas híbridas Micro-RAG con acciones consistentes ejecutables.
 */

import type {
  MensajeChat,
  PayloadOpenAI,
  ApiResponseChat,
  ContextoCultivo,
  ImagenMensaje,
  ImagenPayload,
  AccionConocimiento,
} from '@/types/chat';
import type { Cultivo } from '@/types/cultivo';
import {
  calcularObjetivosAgronomicos,
  generarRespuestaConocimientoLocal,
  type ObjetivosCalculadosKB,
} from '@/lib/knowledge/agronomicKnowledgeBase';

const API_BASE = '/api';

/**
 * Convierte una URL de imagen a base64
 */
export async function convertirUrlABase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return compressImage(blob);
  } catch (error) {
    throw new Error(
      `Error al descargar la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
}

/**
 * Redimensiona y comprime una imagen usando Canvas
 */
const compressImage = async (
  source: File | Blob,
  maxWidth: number = 1024,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo obtener contexto del canvas'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const base64Url = canvas.toDataURL('image/jpeg', quality);
      const base64 = base64Url.split(',')[1];
      resolve(base64);
    };
    img.onerror = () => reject(new Error('Error al cargar la imagen para compresión'));

    reader.readAsDataURL(source);
  });
};

/**
 * Convierte archivo de imagen a base64 con compresión automática
 */
export async function convertirImagenABase64(file: File): Promise<string> {
  return compressImage(file);
}

/**
 * Procesa archivos de imagen para el chat
 */
export async function procesarImagenes(files: FileList): Promise<ImagenMensaje[]> {
  const imagenes: ImagenMensaje[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!file.type.startsWith('image/')) {
      throw new Error(`El archivo ${file.name} no es una imagen válida`);
    }

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
        uploadedAt: new Date().toISOString(),
      };

      imagenes.push(imagen);
    } catch (error) {
      throw new Error(
        `Error al procesar la imagen ${file.name}: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      );
    }
  }

  return imagenes;
}

/**
 * Envía mensaje al motor híbrido de IA y retorna respuesta completa (texto, acciones KB y telemetría de tokens)
 */
export async function enviarMensajeDetalladoIA(
  mensaje: string,
  contexto: ContextoCultivo,
  imagenes?: ImagenMensaje[],
  historial?: MensajeChat[],
  email?: string,
  modo: PayloadOpenAI['modo'] = 'auto'
): Promise<ApiResponseChat<string>> {
  const tieneImagenes = Boolean(imagenes && imagenes.length > 0);

  // Fast-path en cliente: si no hay imágenes y la Base de Conocimiento resuelve al 100% la consulta,
  // devolvemos de inmediato sin latencia de red ni gasto de tokens.
  const localKB = generarRespuestaConocimientoLocal(mensaje, contexto, tieneImagenes);
  if ((modo === 'kb_only' || localKB.esSuficienteSinLLM) && !tieneImagenes) {
    return {
      success: true,
      data: localKB.respuesta,
      message: 'Resuelto por Base de Conocimiento Local (0 tokens)',
      accionesSugeridas: localKB.accionesSugeridas,
      fuentesConocimiento: localKB.fuentesConocimiento,
      tokens: {
        prompt: 0,
        completion: 0,
        total: 0,
        fuente: 'kb_local',
      },
    };
  }

  try {
    const imagenesPayload: ImagenPayload[] | undefined = imagenes
      ?.filter((img): img is ImagenMensaje & { base64: string } => Boolean(img.base64))
      .map((img) => ({
        base64: img.base64,
        mimeType: img.mimeType,
        nombre: img.name,
      }));

    const payload: PayloadOpenAI = {
      message: mensaje,
      email,
      cultivoContext: contexto,
      imagenes: imagenesPayload,
      historialReciente: historial?.slice(-4),
      modo,
    };

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        success: true,
        data: localKB.respuesta,
        message: 'Resuelto por Base de Conocimiento Local (Fallback)',
        accionesSugeridas: localKB.accionesSugeridas,
        fuentesConocimiento: localKB.fuentesConocimiento,
        tokens: {
          prompt: 0,
          completion: 0,
          total: 0,
          fuente: 'kb_local',
        },
      };
    }

    const data: ApiResponseChat<string> = await response.json();

    if (!data.success || !data.data) {
      return {
        success: true,
        data: localKB.respuesta,
        accionesSugeridas: localKB.accionesSugeridas,
        fuentesConocimiento: localKB.fuentesConocimiento,
        tokens: {
          prompt: 0,
          completion: 0,
          total: 0,
          fuente: 'kb_local',
        },
      };
    }

    return data;
  } catch (error) {
    console.warn('Usando respuesta de Base de Conocimiento Local ante error de red:', error);
    return {
      success: true,
      data: localKB.respuesta,
      accionesSugeridas: localKB.accionesSugeridas,
      fuentesConocimiento: localKB.fuentesConocimiento,
      tokens: {
        prompt: 0,
        completion: 0,
        total: 0,
        fuente: 'kb_local',
      },
    };
  }
}

/**
 * Envía mensaje al chat de IA con contexto del cultivo (retorna string para compatibilidad)
 */
export async function enviarMensajeIA(
  mensaje: string,
  contexto: ContextoCultivo,
  imagenes?: ImagenMensaje[],
  historial?: MensajeChat[],
  email?: string
): Promise<string> {
  const res = await enviarMensajeDetalladoIA(mensaje, contexto, imagenes, historial, email);
  return res.data || '';
}

/**
 * Crea un nuevo mensaje de chat del usuario
 */
export function crearMensajeUsuario(
  cultivoId: string,
  contenido: string,
  imagenes?: ImagenMensaje[]
): MensajeChat {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    cultivoId,
    tipo: 'user',
    contenido,
    imagenes,
    tipoContenido:
      imagenes && imagenes.length > 0 ? (contenido.trim() ? 'mixed' : 'image') : 'text',
    timestamp: new Date().toISOString(),
    procesando: false,
    activo: true,
  };
}

/**
 * Crea un nuevo mensaje de respuesta de la IA enriquecido con acciones y fuentes de la KB
 */
export function crearMensajeIA(
  cultivoId: string,
  contenido: string,
  mensajeUsuarioId?: string,
  extras?: {
    accionesSugeridas?: AccionConocimiento[];
    fuentesConocimiento?: string[];
    tokensUsados?: MensajeChat['tokensUsados'];
  }
): MensajeChat {
  return {
    id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    cultivoId,
    tipo: 'assistant',
    contenido,
    tipoContenido: 'text',
    timestamp: new Date().toISOString(),
    procesando: false,
    respuestaA: mensajeUsuarioId,
    accionesSugeridas: extras?.accionesSugeridas,
    fuentesConocimiento: extras?.fuentesConocimiento,
    tokensUsados: extras?.tokensUsados,
    activo: true,
  };
}

/**
 * Crea un mensaje del sistema (ej: "Analizando imagen...")
 */
export function crearMensajeSistema(cultivoId: string, contenido: string): MensajeChat {
  return {
    id: `sys_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    cultivoId,
    tipo: 'system',
    contenido,
    tipoContenido: 'text',
    timestamp: new Date().toISOString(),
    procesando: true,
    activo: true,
  };
}

/**
 * Gestiona la conversación completa con la IA y adjunta las Acciones de la Base de Conocimiento
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
  const mensajeUsuario = crearMensajeUsuario(cultivoId, mensaje, imagenes);
  onMensajeCreado(mensajeUsuario);

  if (imagenes && imagenes.length > 0) {
    const mensajeSistema = crearMensajeSistema(
      cultivoId,
      `Analizando ${imagenes.length} imagen${imagenes.length > 1 ? 'es' : ''} contra Base de Conocimiento...`
    );
    onMensajeCreado(mensajeSistema);
  }

  try {
    const respuestaDetallada = await enviarMensajeDetalladoIA(
      mensaje,
      contexto,
      imagenes,
      historial,
      email
    );

    return crearMensajeIA(cultivoId, respuestaDetallada.data || '', mensajeUsuario.id, {
      accionesSugeridas: respuestaDetallada.accionesSugeridas,
      fuentesConocimiento: respuestaDetallada.fuentesConocimiento,
      tokensUsados: respuestaDetallada.tokens,
    });
  } catch (error) {
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
 */
export function limpiarImagenes(imagenes: ImagenMensaje[]): void {
  imagenes.forEach((imagen) => {
    if (imagen.url.startsWith('blob:')) {
      URL.revokeObjectURL(imagen.url);
    }
  });
}

/**
 * Valida el contexto del cultivo antes de enviar a IA
 */
export function validarContextoCultivo(contexto: ContextoCultivo): boolean {
  return !!(contexto.id && contexto.nombre);
}

/**
 * Prepara el contexto del cultivo desde un objeto Cultivo
 */
export function prepararContextoCultivo(cultivo: Cultivo): ContextoCultivo {
  let diasDesdeInicio: number | undefined;
  let plantasPorM2: number | undefined;
  let wattsPorM2: number | undefined;
  let litrosTotales: number | undefined;

  if (cultivo.fechaComienzo) {
    const inicio = new Date(cultivo.fechaComienzo);
    const hoy = new Date();
    const diffTime = Math.max(0, hoy.getTime() - inicio.getTime());
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

  const galeriaImagenes = cultivo.galeria?.map((imagen) => ({
    id: imagen.id,
    nombre: imagen.nombre,
    descripcion: imagen.descripcion,
    fechaTomada: imagen.fechaTomada,
    fechaSubida: imagen.fechaSubida,
  }));

  return {
    id: cultivo.id,
    nombre: cultivo.nombre,
    genetica: cultivo.genetica,
    sustrato: cultivo.sustrato,
    fechaComienzo: cultivo.fechaComienzo,
    fechaInicioFloracion: cultivo.fechaInicioFloracion,
    metrosCuadrados: cultivo.metrosCuadrados,
    numeroplantas: cultivo.numeroplantas,
    litrosMaceta: cultivo.litrosMaceta,
    potenciaLamparas: cultivo.potenciaLamparas,
    phObjetivo: cultivo.phObjetivo,
    ecObjetivo: cultivo.ecObjetivo,
    tempObjetivoVegetacion: cultivo.tempObjetivoVegetacion,
    tempObjetivoFloracion: cultivo.tempObjetivoFloracion,
    humedadObjetivoVegetacion: cultivo.humedadObjetivoVegetacion,
    humedadObjetivoFloracion: cultivo.humedadObjetivoFloracion,
    diasDesdeInicio,
    plantasPorM2,
    wattsPorM2,
    litrosTotales,
    activo: cultivo.activo,
    notas: cultivo.notas,
    galeriaImagenes,
  };
}

/**
 * Calcula todos los objetivos óptimos de nutrición, clima y riego de una sola vez
 * directamente desde la Base de Conocimiento Agronómica (0 tokens, 0ms, sin fallos de red).
 */
export function consultarTodosLosObjetivosKB(
  contexto: ContextoCultivo
): ObjetivosCalculadosKB {
  return calcularObjetivosAgronomicos(contexto);
}

/**
 * Consulta recomendación específica de pH desde la Base de Conocimiento (0 tokens, consistente)
 */
export async function consultarRecomendacionPH(contexto: ContextoCultivo): Promise<number | null> {
  return calcularObjetivosAgronomicos(contexto).phObjetivo;
}

/**
 * Consulta recomendación específica de EC desde la Base de Conocimiento (0 tokens, consistente)
 */
export async function consultarRecomendacionEC(contexto: ContextoCultivo): Promise<number | null> {
  return calcularObjetivosAgronomicos(contexto).ecObjetivo;
}

/**
 * Consulta recomendación de temperatura para una fase específica desde la Base de Conocimiento (0 tokens)
 */
export async function consultarRecomendacionTemperatura(
  contexto: ContextoCultivo,
  fase: 'vegetacion' | 'floracion'
): Promise<number | null> {
  const objetivos = calcularObjetivosAgronomicos(contexto);
  return fase === 'vegetacion'
    ? objetivos.tempObjetivoVegetacion
    : objetivos.tempObjetivoFloracion;
}

/**
 * Consulta recomendación de humedad para una fase específica desde la Base de Conocimiento (0 tokens)
 */
export async function consultarRecomendacionHumedad(
  contexto: ContextoCultivo,
  fase: 'vegetacion' | 'floracion'
): Promise<number | null> {
  const objetivos = calcularObjetivosAgronomicos(contexto);
  return fase === 'vegetacion'
    ? objetivos.humedadObjetivoVegetacion
    : objetivos.humedadObjetivoFloracion;
}
