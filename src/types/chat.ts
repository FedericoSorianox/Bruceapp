/**
 * Tipos de datos para el sistema de chat con IA y Base de Conocimiento Agronómica
 * Define estructuras para mensajes, conversaciones, acciones consistentes y análisis de imágenes
 */

import type { TipoTarea, PrioridadTarea } from './planificacion';

/**
 * Tipo de mensaje en el chat
 * 'user': Mensaje enviado por el usuario
 * 'assistant': Respuesta generada por la IA / Base de Conocimiento
 * 'system': Mensajes del sistema (ej: "Analizando imagen...")
 */
export type TipoMensaje = 'user' | 'assistant' | 'system';

/**
 * Tipo de contenido del mensaje
 * 'text': Solo texto
 * 'image': Mensaje con imagen adjunta
 * 'mixed': Texto + imagen
 */
export type TipoContenido = 'text' | 'image' | 'mixed';

/**
 * Acción estandarizada proveniente de la Base de Conocimiento Agronómica
 * Permite que el usuario ejecute o agende tareas y ajustes con 1 clic de forma consistente
 */
export interface AccionConocimiento {
  id: string;
  codigoKB: string;              // Código único en la Base de Conocimiento (ej: 'KB-ACT-RIEGO-COCO-FLORA')
  tipoAccion: 'crear_tarea' | 'actualizar_parametros';
  titulo: string;
  descripcion: string;
  categoriaTarea?: TipoTarea;
  prioridad?: PrioridadTarea;
  diasOffset?: number;           // En cuántos días programar (0 = hoy, 1 = mañana, etc.)
  duracionEstimada?: number;     // Minutos estimados
  parametrosObjetivo?: {
    phObjetivo?: number;
    ecObjetivo?: number;
    tempObjetivoVegetacion?: number;
    tempObjetivoFloracion?: number;
    humedadObjetivoVegetacion?: number;
    humedadObjetivoFloracion?: number;
    aguaDiariaObjetivo?: number;
  };
}

/**
 * Información de imagen adjunta al mensaje
 * Contiene datos necesarios para el análisis de IA
 */
export interface ImagenMensaje {
  id: string;                    // ID único de la imagen
  name: string;                  // Nombre original del archivo
  url: string;                   // URL temporal o base64 para mostrar en UI
  base64?: string;               // Datos base64 para enviar a OpenAI
  mimeType: string;              // Tipo MIME (image/jpeg, image/png, etc.)
  size: number;                  // Tamaño del archivo en bytes
  uploadedAt: string;            // Timestamp de subida
}

/**
 * Estructura principal de un mensaje del chat
 * Contiene toda la información necesaria para mostrar y procesar el mensaje
 */
export interface MensajeChat {
  id: string;                    // ID único del mensaje
  cultivoId: string;             // ID del cultivo al que pertenece el chat
  tipo: TipoMensaje;             // Tipo de mensaje (user/assistant/system)
  contenido: string;             // Texto del mensaje
  imagenes?: ImagenMensaje[];    // Array de imágenes adjuntas (opcional)
  tipoContenido: TipoContenido;  // Tipo de contenido del mensaje
  timestamp: string;             // Fecha y hora del mensaje (ISO string)
  procesando?: boolean;          // Indica si el mensaje se está procesando
  error?: string;                // Mensaje de error si hubo problemas
  respuestaA?: string;           // ID del mensaje al que responde (solo para mensajes de IA)
  tokensUsados?: {               // Métricas de tokens (0 cuando resuelve por Base de Conocimiento local)
    prompt: number;
    completion: number;
    total: number;
    fuente?: 'kb_local' | 'kb_rag_llm' | 'n8n_webhook';
  };
  accionesSugeridas?: AccionConocimiento[]; // Acciones consistentes extraídas de la Base de Conocimiento
  fuentesConocimiento?: string[]; // IDs/Títulos de los protocolos de la KB utilizados
  contextoEnviado?: boolean;     // Indica si se envió contexto del cultivo con este mensaje
  versionContexto?: string;      // Versión del contexto del cultivo enviado
  calificacion?: number;         // Calificación del usuario (1-5 estrellas)
  feedback?: string;             // Feedback del usuario sobre la respuesta
  usuarioId?: string;            // ID del usuario que envió el mensaje
  ipAddress?: string;            // IP del usuario para analytics
  activo: boolean;               // Indica si el mensaje está activo
  destacado?: boolean;           // Indica si es un mensaje destacado
}

/**
 * Información simplificada de imagen de galería para contexto de IA
 * Versión reducida que se incluye en el contexto del cultivo
 */
export interface ImagenGaleriaContexto {
  id: string;                    // ID de la imagen
  nombre: string;                // Nombre descriptivo
  descripcion?: string;          // Descripción de la imagen
  fechaTomada?: string;          // Fecha cuando se tomó la foto
  fechaSubida: string;           // Fecha de subida
}

/**
 * Contexto completo del cultivo para la IA y el Motor de Conocimiento
 */
export interface ContextoCultivo {
  // Información básica del cultivo
  id: string;
  nombre: string;
  genetica?: string;
  sustrato?: string;
  fechaComienzo?: string;
  fechaInicioFloracion?: string;

  // Especificaciones técnicas
  metrosCuadrados?: number;
  numeroplantas?: number;
  litrosMaceta?: number;
  potenciaLamparas?: number;

  // Objetivos actuales configurados
  phObjetivo?: number;
  ecObjetivo?: number;
  tempObjetivoVegetacion?: number;
  tempObjetivoFloracion?: number;
  humedadObjetivoVegetacion?: number;
  humedadObjetivoFloracion?: number;

  // Métricas calculadas
  diasDesdeInicio?: number;
  faseActual?: 'vegetacion' | 'floracion';
  semanaActual?: number;
  diasFaseActual?: number;
  plantasPorM2?: number;
  wattsPorM2?: number;
  litrosTotales?: number;

  // Estado y notas
  activo?: boolean;
  notas?: string;

  // Galería de imágenes del cultivo (información contextual)
  galeriaImagenes?: ImagenGaleriaContexto[];

  // Comentarios recientes del cultivo
  comentariosRecientes?: ComentarioCultivo[];
}

/**
 * Estructura de imagen lista para ser enviada al backend
 * Incluye metadatos imprescindibles para reconstruir la imagen
 */
export interface ImagenPayload {
  base64: string;                     // Cadena base64 sin encabezado data:
  mimeType: string;                   // Tipo MIME original (image/jpeg, image/png, etc.)
  nombre?: string;                    // Nombre descriptivo de la imagen
}

/**
 * Payload para enviar a la API de Chat / Motor Híbrido IA
 */
export interface PayloadOpenAI {
  cultivoContext: ContextoCultivo;    // Contexto completo del cultivo
  message: string;                    // Mensaje del usuario
  email?: string;                     // Email del usuario (opcional)
  imagenes?: ImagenPayload[];         // Imágenes con base64 y metadatos
  historialReciente?: MensajeChat[];  // Últimos mensajes para contexto
  modo?: 'auto' | 'kb_only' | 'diagnostico'; // Control de consumo de tokens
}

/**
 * Respuesta de la API de chat
 * Formato estandarizado para todas las respuestas
 */
export interface ApiResponseChat<T = unknown> {
  success: boolean;              // Indica si la operación fue exitosa
  data?: T;                      // Datos retornados (texto de respuesta)
  message?: string;              // Mensaje descriptivo
  error?: string;                // Mensaje de error si hubo problemas
  accionesSugeridas?: AccionConocimiento[]; // Acciones consistentes de la KB
  fuentesConocimiento?: string[]; // Artículos/Protocolos de la KB consultados
  tokens?: {                     // Información de tokens usados y fuente
    prompt: number;
    completion: number;
    total: number;
    fuente?: 'kb_local' | 'kb_rag_llm' | 'n8n_webhook';
  };
}

/**
 * Comentario/nota específica de un cultivo
 * Sistema para agregar observaciones y notas al cultivo
 */
export interface ComentarioCultivo {
  id: string;                    // ID único del comentario
  cultivoId: string;             // ID del cultivo al que pertenece
  titulo: string;                // Título breve del comentario
  contenido: string;             // Contenido detallado del comentario
  autor: string;                 // Usuario que creó el comentario
  fecha: string;                 // Fecha de creación (ISO string)
  fechaActualizacion?: string;   // Fecha de última modificación
  tipo: TipoComentario;          // Categoría del comentario
  prioridad: PrioridadComentario; // Nivel de importancia
  imagenes?: ImagenMensaje[];    // Imágenes adjuntas al comentario
  tags?: string[];               // Etiquetas para categorización
  // ===== ESTADO Y SEGUIMIENTO =====
  resuelto?: boolean;            // Indica si el comentario está resuelto
  resuelto_por?: string;         // Usuario que resolvió el comentario
  fechaResolucion?: string;      // Fecha cuando se resolvió
  creadoPor?: string;            // Email del usuario que creó el comentario
  editadoPor?: string;           // Usuario que editó el comentario
  activo: boolean;               // Indica si el comentario está activo
  destacado?: boolean;           // Indica si es un comentario destacado
  numeroEdiciones?: number;      // Número de veces que se editó
}

/**
 * Tipos de comentarios para categorización
 * Ayuda a organizar las observaciones por categoría
 */
export type TipoComentario =
  | 'observacion'              // Observación general
  | 'problema'                 // Problema detectado
  | 'solucion'                 // Solución aplicada
  | 'fertilizacion'            // Relacionado con nutrientes
  | 'riego'                    // Manejo del agua
  | 'plagas'                   // Detección/control de plagas
  | 'enfermedad'               // Problemas de salud de plantas
  | 'cosecha'                  // Información de cosecha
  | 'mantenimiento';           // Mantenimiento de equipos

/**
 * Niveles de prioridad para comentarios
 * Sistema de clasificación por importancia
 */
export type PrioridadComentario = 'baja' | 'media' | 'alta' | 'critica';

/**
 * Parámetros para filtrar comentarios
 * Opciones de búsqueda y filtrado
 */
export interface FiltrosComentarios {
  cultivoId?: string;            // Filtrar por cultivo específico
  tipo?: TipoComentario;         // Filtrar por tipo de comentario
  prioridad?: PrioridadComentario; // Filtrar por prioridad
  autor?: string;                // Filtrar por autor
  fechaDesde?: string;           // Fecha inicio del rango
  fechaHasta?: string;           // Fecha fin del rango
  q?: string;                    // Búsqueda en título y contenido
  _sort?: keyof ComentarioCultivo; // Campo para ordenar
  _order?: 'asc' | 'desc';       // Dirección del ordenamiento
  _page?: number;                // Número de página
  _limit?: number;               // Límite de resultados
}

/**
 * Estadísticas del chat para un cultivo
 * Métricas de uso y actividad
 */
export interface EstadisticasChat {
  cultivoId: string;             // ID del cultivo
  totalMensajes: number;         // Total de mensajes en el chat
  mensajesUsuario: number;       // Mensajes enviados por el usuario
  mensajesIA: number;            // Respuestas de la IA
  imagenesAnalizadas: number;    // Total de imágenes procesadas
  ultimaActividad: string;       // Fecha del último mensaje
  tokensUsados: number;          // Total de tokens de OpenAI consumidos
  comentariosTotales: number;    // Total de comentarios del cultivo
}
