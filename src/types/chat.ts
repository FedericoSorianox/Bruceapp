/**
 * Tipos de datos para el sistema de chat con IA
 * Define estructuras para mensajes, conversaciones y análisis de imágenes
 */

/**
 * Tipo de mensaje en el chat
 * 'user': Mensaje enviado por el usuario
 * 'assistant': Respuesta generada por la IA
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
  tipo: TipoMensaje;            // Tipo de mensaje (user/assistant/system)
  contenido: string;             // Texto del mensaje
  imagenes?: ImagenMensaje[];    // Array de imágenes adjuntas (opcional)
  tipoContenido: TipoContenido; // Tipo de contenido del mensaje
  timestamp: string;             // Fecha y hora del mensaje (ISO string)
  procesando?: boolean;          // Indica si el mensaje se está procesando
  error?: string;                // Mensaje de error si hubo problemas
  respuestaA?: string;           // ID del mensaje al que responde (solo para mensajes de IA)
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
 * Contexto completo del cultivo para la IA
 * Información que se envía a OpenAI para que tenga contexto completo
 */
export interface ContextoCultivo {
  // Información básica del cultivo
  id: string;
  nombre: string;
  genetica?: string;
  sustrato?: string;
  fechaComienzo?: string;
  
  // Especificaciones técnicas
  metrosCuadrados?: number;
  numeroplantas?: number;
  litrosMaceta?: number;
  potenciaLamparas?: number;
  
  // Métricas calculadas
  diasDesdeInicio?: number;
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
 * Payload para enviar a la API de OpenAI
 * Estructura optimizada para GPT-4 Vision
 */
export interface PayloadOpenAI {
  cultivoContext: ContextoCultivo;    // Contexto completo del cultivo
  mensaje: string;                    // Mensaje del usuario
  imagenes?: ImagenPayload[];         // Imágenes con base64 y metadatos
  historialReciente?: MensajeChat[];  // Últimos mensajes para contexto
}

/**
 * Respuesta de la API de chat
 * Formato estandarizado para todas las respuestas
 */
export interface ApiResponseChat<T = unknown> {
  success: boolean;              // Indica si la operación fue exitosa
  data?: T;                      // Datos retornados
  message?: string;              // Mensaje descriptivo
  error?: string;                // Mensaje de error si hubo problemas
  tokens?: {                     // Información de tokens usados (OpenAI)
    prompt: number;
    completion: number;
    total: number;
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
