/**
 * Tipos de datos para el sistema de planificación de cultivos
 * Define la estructura de datos para tareas, recordatorios y eventos de calendario
 */

/**
 * Tipos de tareas de cultivo disponibles
 * Categoriza las actividades que se pueden realizar en un cultivo
 */
export type TipoTarea =
  | 'siembra'         // Siembra de semillas o trasplante
  | 'riego'          // Riego manual o programado
  | 'fertilizacion'  // Aplicación de fertilizantes
  | 'poda'           // Poda de plantas
  | 'cosecha'        // Cosecha de frutos/producción
  | 'mantenimiento'  // Limpieza, desinfección, etc.
  | 'monitoreo'      // Control de plagas, medición de pH/EC
  | 'otro';          // Categoría genérica para tareas específicas

/**
 * Estados posibles de una tarea
 * Controla el ciclo de vida de cada tarea
 */
export type EstadoTarea =
  | 'pendiente'      // Tarea programada pero no ejecutada
  | 'en_progreso'    // Tarea actualmente siendo ejecutada
  | 'completada'     // Tarea finalizada exitosamente
  | 'cancelada'      // Tarea cancelada antes de completarse
  | 'vencida';       // Tarea que no se completó en la fecha programada

/**
 * Prioridades de las tareas
 * Permite organizar tareas por importancia
 */
export type PrioridadTarea =
  | 'baja'           // Tarea opcional o de bajo impacto
  | 'media'          // Tarea importante pero no crítica
  | 'alta'           // Tarea crítica que debe hacerse
  | 'urgente';       // Tarea que requiere atención inmediata

/**
 * Frecuencia de repetición de tareas
 * Para tareas que se repiten regularmente
 */
export type FrecuenciaRepeticion =
  | 'diaria'         // Se repite cada día
  | 'semanal'        // Se repite cada semana
  | 'quincenal'      // Se repite cada 15 días
  | 'mensual'        // Se repite cada mes
  | 'personalizada'; // Frecuencia personalizada

/**
 * Interfaz principal que define una tarea de cultivo
 * Contiene toda la información necesaria para gestionar una tarea
 */
export interface TareaCultivo {
  id: string;                    // Identificador único de la tarea
  cultivoId: string;             // ID del cultivo al que pertenece
  titulo: string;                // Título descriptivo de la tarea
  descripcion?: string;          // Descripción detallada opcional
  tipo: TipoTarea;               // Categoría de la tarea
  estado: EstadoTarea;           // Estado actual de la tarea
  prioridad: PrioridadTarea;     // Nivel de prioridad
  fechaProgramada: string;       // Fecha programada (formato YYYY-MM-DD)
  horaProgramada?: string;       // Hora programada (formato HH:MM, opcional)
  fechaCreacion: string;         // Fecha de creación (automática)
  fechaActualizacion: string;    // Fecha de última actualización
  fechaCompletada?: string;      // Fecha de completación (si aplica)
  duracionEstimada?: number;     // Duración estimada en minutos
  notas?: string;                // Notas adicionales post-ejecución

  // 🔒 Auditoría de permisos - Sistema de rastreo de ediciones
  creadoPor?: string;            // Email del usuario que creó la tarea
  editadoPor?: string;           // Email del usuario que editó por última vez

  // Configuración de repetición
  esRecurrente: boolean;         // Indica si es una tarea recurrente
  frecuencia?: FrecuenciaRepeticion; // Frecuencia de repetición
  intervaloPersonalizado?: number; // Días entre repeticiones (para personalizada)
  fechaFinRepeticion?: string;   // Fecha hasta la cual se repite
  tareaPadreId?: string;         // ID de la tarea original (para tareas generadas)

  // Recordatorios
  recordatorioActivado: boolean; // Si tiene recordatorios activados
  minutosRecordatorio?: number;  // Minutos antes para recordar
  recordatorioEnviado: boolean;  // Si ya se envió el recordatorio
}

/**
 * Tipo para crear una nueva tarea (sin campos automáticos)
 * Se usa en formularios de creación
 */
export type TareaCreacion = Omit<TareaCultivo,
  | 'id'
  | 'fechaCreacion'
  | 'fechaActualizacion'
  | 'fechaCompletada'
  | 'recordatorioEnviado'
> & {
  // Campos que se pueden establecer opcionalmente durante la creación
  fechaCreacion?: string;
  fechaActualizacion?: string;
  recordatorioEnviado?: boolean;
};

/**
 * Tipo para actualizar una tarea existente
 * Permite actualizaciones parciales
 */
export type TareaActualizacion = Partial<Omit<TareaCultivo, 'id'>> & { id: string };

/**
 * Parámetros para filtrar tareas de cultivo
 * Permite búsquedas y filtrados avanzados
 */
export interface ListaTareasParams {
  cultivoId?: string;            // Filtrar por cultivo específico
  tipo?: TipoTarea;              // Filtrar por tipo de tarea
  estado?: EstadoTarea;          // Filtrar por estado
  prioridad?: PrioridadTarea;    // Filtrar por prioridad
  fechaDesde?: string;           // Tareas desde esta fecha
  fechaHasta?: string;           // Tareas hasta esta fecha
  esRecurrente?: boolean;        // Solo tareas recurrentes o no recurrentes
  q?: string;                    // Búsqueda por texto en título/descripción
  _sort?: keyof TareaCultivo;    // Campo por ordenar
  _order?: 'asc' | 'desc';       // Dirección del orden
  _page?: number;                // Paginación
  _limit?: number;               // Límite por página
}

/**
 * Evento del calendario de cultivo
 * Representa una tarea en el contexto del calendario
 */
export interface EventoCalendario {
  id: string;                    // ID de la tarea
  titulo: string;                // Título de la tarea
  tipo: TipoTarea;               // Tipo de tarea
  fecha: string;                 // Fecha del evento (YYYY-MM-DD)
  hora?: string;                 // Hora del evento (HH:MM)
  estado: EstadoTarea;           // Estado actual
  prioridad: PrioridadTarea;     // Prioridad
  descripcion?: string;          // Descripción breve
  duracion?: number;             // Duración en minutos
  esRecurrente: boolean;         // Si es evento recurrente
  tarea: TareaCultivo;           // Referencia completa a la tarea
}

/**
 * Vista mensual del calendario
 * Estructura para mostrar un mes completo
 */
export interface VistaCalendarioMensual {
  mes: number;                   // Mes (1-12)
  anio: number;                  // Año
  dias: DiaCalendario[];         // Array de días del mes
}

/**
 * Día individual en el calendario
 * Contiene información de un día específico
 */
export interface DiaCalendario {
  fecha: string;                 // Fecha en formato YYYY-MM-DD
  diaSemana: number;             // Día de la semana (0-6, 0=domingo)
  diaMes: number;                // Día del mes (1-31)
  esHoy: boolean;                // Si es el día actual
  esMesActual: boolean;          // Si pertenece al mes actual
  eventos: EventoCalendario[];   // Eventos del día
  tieneEventos: boolean;         // Si tiene eventos programados
}

/**
 * Recordatorio de tarea
 * Configuración de notificaciones para tareas
 */
export interface RecordatorioTarea {
  id: string;                    // ID único del recordatorio
  tareaId: string;               // ID de la tarea relacionada
  titulo: string;                // Título del recordatorio
  minutosAntes: number;          // Minutos antes de la tarea
  activo: boolean;               // Si está activo
  ultimoEnviado?: string;        // Última vez que se envió
  proximoEnvio?: string;         // Próxima fecha de envío
}

/**
 * Estadísticas de planificación
 * Métricas sobre las tareas y planificación
 */
export interface EstadisticasPlanificacion {
  totalTareas: number;           // Total de tareas programadas
  tareasPendientes: number;      // Tareas aún no completadas
  tareasCompletadas: number;     // Tareas completadas
  tareasVencidas: number;        // Tareas que pasaron su fecha
  tareasHoy: number;             // Tareas programadas para hoy
  tareasSemana: number;          // Tareas programadas para esta semana
  tareasRecurrentes: number;     // Tareas que se repiten
  productividad: number;         // Porcentaje de tareas completadas a tiempo
}

/**
 * Respuesta de la API para operaciones de planificación
 * Formato consistente para todas las respuestas
 */
export interface ApiResponsePlanificacion<T = unknown> {
  success: boolean;              // Indica si la operación fue exitosa
  data?: T;                      // Datos retornados
  message?: string;              // Mensaje descriptivo
  error?: string;                // Mensaje de error
  total?: number;                // Total de registros (paginación)
}

/**
 * Configuración de notificaciones
 * Opciones para personalizar los recordatorios
 */
export interface ConfiguracionNotificaciones {
  recordatoriosActivados: boolean; // Si los recordatorios están activos
  tiempoRecordatorioDefecto: number; // Minutos por defecto para recordar
  notificacionesSonido: boolean;   // Si usar sonido en notificaciones
  notificacionesDesktop: boolean;  // Si mostrar notificaciones del sistema
  diasAnticipacion: number;        // Días de anticipación para mostrar tareas
}

/**
 * Plantilla de tarea
 * Para crear tareas repetitivas rápidamente
 */
export interface PlantillaTarea {
  id: string;                    // ID único de la plantilla
  titulo: string;                // Título de la plantilla
  descripcion: string;           // Descripción de la tarea
  tipo: TipoTarea;               // Tipo de tarea
  prioridad: PrioridadTarea;     // Prioridad por defecto
  duracionEstimada?: number;     // Duración estimada
  esRecurrente: boolean;         // Si es recurrente por defecto
  frecuencia?: FrecuenciaRepeticion; // Frecuencia por defecto
  activo: boolean;               // Si la plantilla está activa
}

/**
 * Tipo para valores que pueden almacenarse en campos de tareas
 * Union de todos los tipos posibles de valores en TareaCultivo
 */
export type ValorCampoTarea =
  | string
  | number
  | boolean
  | TipoTarea
  | EstadoTarea
  | PrioridadTarea
  | FrecuenciaRepeticion
  | null
  | undefined;

/**
 * Historial de cambios de tarea
 * Para auditar modificaciones en tareas
 */
export interface HistorialCambioTarea {
  id: string;                    // ID único del cambio
  tareaId: string;               // ID de la tarea modificada
  campo: string;                 // Campo que se modificó
  valorAnterior?: ValorCampoTarea; // Valor anterior
  valorNuevo?: ValorCampoTarea;    // Valor nuevo
  fechaCambio: string;           // Fecha del cambio
  usuarioId?: string;            // ID del usuario que hizo el cambio
  tipoCambio: 'creacion' | 'actualizacion' | 'completado' | 'cancelado';
}
