/**
 * Tipos de datos para el sistema de gestión de cultivos
 * Define la estructura de datos y tipos relacionados con los cultivos
 */

/**
 * Interfaz para las notas del sistema
 * Notas agrícolas para documentar observaciones, tareas y conocimientos
 */
export interface Nota {
  id: string;                    // ID único de la nota
  title: string;                 // Título de la nota
  content: string;               // Contenido de la nota
  category?: string;             // Categoría de la nota
  tags?: string[];               // Etiquetas para categorización
  date?: string;                 // Fecha de la nota
  author?: string;               // Autor de la nota
  priority?: string;             // Prioridad de la nota
  hasImages?: boolean;           // Indica si tiene imágenes adjuntas
  cropArea?: string;             // Área del cultivo relacionada
  fechaCreacion: string;         // Fecha de creación
  fechaActualizacion?: string;   // Fecha de última actualización
  activo: boolean;               // Indica si la nota está activa
  destacado?: boolean;           // Indica si es una nota destacada
  creadoPor?: string;            // Email del usuario que creó la nota
  editadoPor?: string;           // Email del usuario que editó por última vez
}

/**
 * Interfaz que define una imagen en la galería del cultivo
 * Estructura para almacenar información de cada imagen asociada al cultivo
 */
export interface ImagenCultivo {
  id: string;                    // Identificador único de la imagen
  url: string;                   // URL de la imagen almacenada
  nombre: string;                // Nombre descriptivo de la imagen
  descripcion?: string;          // Descripción opcional de la imagen
  fechaTomada?: string;          // Fecha cuando se tomó la foto (formato YYYY-MM-DD)
  fechaSubida: string;           // Fecha cuando se subió la imagen (automática)
  tamaño?: number;               // Tamaño del archivo en bytes
  tipo?: string;                 // Tipo MIME de la imagen (ej: "image/jpeg")
}

/**
 * Interfaz principal que define la estructura completa de un cultivo
 * Contiene todos los campos necesarios para la gestión integral del cultivo
 */
export interface Cultivo {
  id: string;                    // Identificador único del cultivo
  nombre: string;                // Nombre del cultivo (campo obligatorio)
  sustrato?: string;             // Tipo de sustrato utilizado (ej: "Fibra de coco", "Turba")
  metrosCuadrados?: number;      // Área total del cultivo en metros cuadrados
  fechaComienzo?: string;        // Fecha de inicio del cultivo (formato YYYY-MM-DD)
  numeroplantas?: number;        // Cantidad total de plantas en el cultivo
  litrosMaceta?: number;         // Capacidad en litros de cada maceta/contenedor
  potenciaLamparas?: number;     // Potencia total de las lámparas en watts
  genetica?: string;             // Información sobre la genética/variedad de la planta
  fechaCreacion?: string;        // Fecha de creación del registro (automática)
  fechaActualizacion?: string;   // Fecha de última actualización (automática)
  activo?: boolean;              // Indica si el cultivo está activo o finalizado
  notas?: string;                // Notas adicionales sobre el cultivo
  galeria?: ImagenCultivo[];     // Galería de imágenes del cultivo

  // 🔒 Auditoría de permisos - Sistema de rastreo de ediciones
  creadoPor?: string;            // Email del usuario que creó el cultivo
  editadoPor?: string;           // Email del usuario que editó por última vez

  // Control de fases del cultivo
  fechaInicioFloracion?: string; // Fecha cuando comenzó la fase de floración (formato YYYY-MM-DD)
  diasVegetacionActual?: number; // Días actuales en fase vegetación (calculado automáticamente)
  diasFloracionActual?: number;  // Días actuales en fase floración (calculado automáticamente)
  semanaVegetacion?: number;     // Semana actual de vegetación (calculado: díasVegetacionActual / 7)
  semanaFloracion?: number;      // Semana actual de floración (calculado: diasFloracionActual / 7)

  // Objetivos nutricionales (mostrados desde IA, no editables manualmente)
  ecObjetivo?: number;           // Nivel de EC objetivo en ppm (desde IA)
  phObjetivo?: number;           // Nivel de pH objetivo (desde IA)
  aguaDiariaObjetivo?: number;   // Cantidad de agua diaria objetivo en litros

  // Condiciones ambientales por fase
  tempObjetivoVegetacion?: number; // Temperatura objetivo en fase vegetación (°C)
  tempObjetivoFloracion?: number;  // Temperatura objetivo en fase floración (°C)
  humedadObjetivoVegetacion?: number; // Humedad objetivo en fase vegetación (%)
  humedadObjetivoFloracion?: number;  // Humedad objetivo en fase floración (%)
}

/**
 * Tipo para crear un nuevo cultivo (sin el campo id que se genera automáticamente)
 * Se usa en formularios de creación y en las funciones de servicio
 */
export type CultivoCreacion = Omit<Cultivo, 'id'>;

/**
 * Tipo para actualizar un cultivo existente (todos los campos opcionales excepto id)
 * Permite actualizaciones parciales de cualquier campo
 */
export type CultivoActualizacion = Partial<Omit<Cultivo, 'id'>> & { id: string };

/**
 * Parámetros para filtrar y paginar la lista de cultivos
 * Sigue el mismo patrón que el sistema de notas para consistencia
 */
export interface ListaCultivosParams {
  q?: string;                    // Query de búsqueda en nombre, genética, etc.
  _sort?: keyof Cultivo;         // Campo por el cual ordenar
  _order?: 'asc' | 'desc';       // Dirección del ordenamiento
  _page?: number;                // Número de página para paginación
  _limit?: number;               // Límite de resultados por página
  activo?: boolean;              // Filtrar por cultivos activos/inactivos
}

/**
 * Respuesta de la API para operaciones de cultivos
 * Proporciona estructura consistente para todas las respuestas
 */
export interface ApiResponseCultivos<T = unknown> {
  success: boolean;              // Indica si la operación fue exitosa
  data?: T;                      // Datos retornados (cultivo o array de cultivos)
  message?: string;              // Mensaje descriptivo de la operación
  error?: string;                // Mensaje de error en caso de fallo
  total?: number;                // Total de registros (útil para paginación)
}

/**
 * Estados posibles del cultivo para mejor gestión
 * Permite categorizar el estado actual del cultivo
 */
export type EstadoCultivo = 
  | 'planificacion'              // En fase de planificación
  | 'germinacion'                // Etapa de germinación
  | 'crecimiento'                // Fase de crecimiento vegetativo
  | 'floracion'                  // Etapa de floración
  | 'cosecha'                    // Listo para cosecha
  | 'finalizado'                 // Cultivo terminado
  | 'pausado';                   // Temporalmente pausado

/**
 * Métricas básicas del cultivo para dashboard y estadísticas
 * Información calculada y de seguimiento
 */
export interface MetricasCultivo {
  diasDesdeInicio: number;       // Días transcurridos desde el inicio
  plantasPorM2: number;          // Densidad de plantas por metro cuadrado
  consumoEnergiaPorM2: number;   // Watts por metro cuadrado
  eficienciaEspacial: number;    // Indicador de uso eficiente del espacio
  estadoActual: EstadoCultivo;   // Estado actual del cultivo
}
