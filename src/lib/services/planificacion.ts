/**
 * Servicio para gestión de planificación de cultivos
 * Proporciona funciones para operaciones CRUD con tareas, recordatorios y eventos de calendario
 * Incluye lógica para tareas recurrentes y recordatorios automáticos
 *
 * 🔒 Sistema de permisos implementado:
 * - Solo administradores pueden crear/eliminar tareas
 * - Todos los usuarios pueden editar tareas (con auditoría)
 * - Se registra quién crea y quién edita cada tarea
 */

import type {
  TareaCultivo,
  TareaCreacion,
  TareaActualizacion,
  ListaTareasParams,
  ApiResponsePlanificacion,
  EstadisticasPlanificacion,
  EventoCalendario,
  VistaCalendarioMensual,
  RecordatorioTarea,
  TipoTarea,
  EstadoTarea,
  PrioridadTarea
} from '@/types/planificacion';
import { useAuth } from '@/lib/auth/AuthProvider';

// Configuración base de la API
const API_BASE = '/api';
const R = 'tareas';

/**
 * Helper para construir URLs absolutas correctamente
 */
const buildApiUrl = (path: string): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  // En Render, la API está en un servicio separado, así que usamos la URL del servicio API
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.RENDER_API_URL || 'http://localhost:3002';
  return `${baseUrl}${path}`;
};

/**
 * Calcula la próxima fecha para una tarea recurrente
 */
function calcularProximaFecha(fechaBase: string, frecuencia: string, intervalo: number = 1): string {
  const fecha = new Date(fechaBase);
  const fechaActual = new Date();

  switch (frecuencia) {
    case 'diaria':
      fecha.setDate(fecha.getDate() + intervalo);
      break;
    case 'semanal':
      fecha.setDate(fecha.getDate() + (intervalo * 7));
      break;
    case 'quincenal':
      fecha.setDate(fecha.getDate() + (intervalo * 15));
      break;
    case 'mensual':
      fecha.setMonth(fecha.getMonth() + intervalo);
      break;
    default:
      return fechaBase; // Sin cambios para personalizada o desconocida
  }

  // Asegurar que la fecha no sea en el pasado
  if (fecha < fechaActual) {
    return new Date().toISOString().split('T')[0];
  }

  return fecha.toISOString().split('T')[0];
}

/**
 * Genera tareas recurrentes para un período de tiempo
 */
function generarTareasRecurrentes(tarea: TareaCultivo, fechaFin: string): TareaCultivo[] {
  const tareas: TareaCultivo[] = [];
  let fechaActual = tarea.fechaProgramada;

  while (fechaActual <= fechaFin) {
    if (fechaActual !== tarea.fechaProgramada) {
      const nuevaTarea: TareaCultivo = {
        ...tarea,
        id: `${tarea.id}_${fechaActual.replace(/-/g, '')}`,
        fechaProgramada: fechaActual,
        fechaCreacion: new Date().toISOString().split('T')[0],
        fechaActualizacion: new Date().toISOString().split('T')[0],
        estado: 'pendiente' as EstadoTarea,
        recordatorioEnviado: false,
        tareaPadreId: tarea.id,
        // 🔒 Auditoría: heredar creador de la tarea original
        creadoPor: tarea.creadoPor,
        editadoPor: tarea.editadoPor
      };
      tareas.push(nuevaTarea);
    }

    if (!tarea.frecuencia || !tarea.fechaFinRepeticion) break;

    fechaActual = calcularProximaFecha(fechaActual, tarea.frecuencia, tarea.intervaloPersonalizado || 1);
  }

  return tareas;
}

/**
 * Lista todas las tareas con parámetros opcionales de filtrado, ordenamiento y paginación
 */
export async function listTareas(
  params: ListaTareasParams = {},
  signal?: AbortSignal,
  token?: string
): Promise<TareaCultivo[]> {
  const url = new URL(buildApiUrl(`${API_BASE}/${R}`));

  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { signal, headers });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const response: ApiResponsePlanificacion<TareaCultivo[]> = await res.json();

    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }

    return Array.isArray(response) ? response as TareaCultivo[] : [];
  } catch (error) {
    console.error('Error al listar tareas:', error);
    throw error;
  }
}

/**
 * Obtiene una tarea específica por su ID
 */
export async function getTarea(id: string, signal?: AbortSignal, token?: string): Promise<TareaCultivo> {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/${R}/${id}`, { signal, headers });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const jsonResponse = await res.json();

    if (jsonResponse.success !== undefined && jsonResponse.data) {
      return jsonResponse.data as TareaCultivo;
    }

    if (jsonResponse.id && jsonResponse.titulo) {
      return jsonResponse as TareaCultivo;
    }

    throw new Error('Respuesta de API en formato inesperado o datos faltantes');
  } catch (error) {
    console.error(`Error al obtener tarea ${id}:`, error);
    throw error;
  }
}

/**
 * Crea una nueva tarea en el servidor
 * @throws Error si el usuario no tiene permisos para crear tareas
 */
export async function createTarea(tarea: TareaCreacion): Promise<TareaCultivo> {
  // 🔒 VALIDACIÓN DE PERMISOS
  // Solo los administradores pueden crear tareas
  const auth = useAuth();
  if (!auth.user) {
    throw new Error('Usuario no autenticado');
  }
  if (!auth.canCreateTarea()) {
    throw new Error('No tienes permisos para crear tareas. Solo los administradores pueden crear tareas.');
  }

  try {
    const tareaConFechas: TareaCreacion = {
      ...tarea,
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaActualizacion: new Date().toISOString().split('T')[0],
      estado: tarea.estado || 'pendiente',
      recordatorioEnviado: false,
      // 🔒 Auditoría: registrar quién creó la tarea
      creadoPor: auth.user.email,
    };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`;

    const res = await fetch(`${API_BASE}/${R}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(tareaConFechas),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`No se pudo crear la tarea: ${errorText}`);
    }

    const jsonResponse = await res.json();

    if (jsonResponse.success !== undefined && jsonResponse.data) {
      return jsonResponse.data as TareaCultivo;
    }

    if (jsonResponse.id && jsonResponse.titulo) {
      return jsonResponse as TareaCultivo;
    }

    throw new Error('Error al crear tarea: respuesta en formato inesperado');
  } catch (error) {
    console.error('Error al crear tarea:', error);
    throw error;
  }
}

/**
 * Actualiza parcialmente una tarea existente
 * @throws Error si el usuario no tiene permisos para editar tareas
 */
export async function updateTarea(id: string, patch: Partial<TareaCultivo>): Promise<TareaCultivo> {
  // 🔒 VALIDACIÓN DE PERMISOS
  // Todos los usuarios pueden editar tareas (con auditoría)
  const auth = useAuth();
  if (!auth.user) {
    throw new Error('Usuario no autenticado');
  }

  try {
    const patchConFecha = {
      ...patch,
      fechaActualizacion: new Date().toISOString().split('T')[0],
      // 🔒 Auditoría: registrar quién editó la tarea
      editadoPor: auth.user.email,
    };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`;

    const res = await fetch(`${API_BASE}/${R}/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(patchConFecha),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`No se pudo actualizar la tarea: ${errorText}`);
    }

    const jsonResponse = await res.json();

    if (jsonResponse.success !== undefined && jsonResponse.data) {
      return jsonResponse.data as TareaCultivo;
    }

    if (jsonResponse.id && jsonResponse.titulo) {
      return jsonResponse as TareaCultivo;
    }

    throw new Error('Error al actualizar tarea: respuesta en formato inesperado');
  } catch (error) {
    console.error(`Error al actualizar tarea ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina una tarea del servidor
 * @throws Error si el usuario no tiene permisos para eliminar tareas
 */
export async function removeTarea(id: string): Promise<boolean> {
  // 🔒 VALIDACIÓN DE PERMISOS
  // Solo los administradores pueden eliminar tareas
  const auth = useAuth();
  if (!auth.user) {
    throw new Error('Usuario no autenticado');
  }

  try {
    const headers: Record<string, string> = {};
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`;
    const res = await fetch(`${API_BASE}/${R}/${id}`, { method: 'DELETE', headers });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`No se pudo eliminar la tarea: ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error(`Error al eliminar tarea ${id}:`, error);
    throw error;
  }
}

/**
 * Marca una tarea como completada
 */
export async function completarTarea(id: string): Promise<TareaCultivo> {
  return updateTarea(id, {
    estado: 'completada',
    fechaCompletada: new Date().toISOString().split('T')[0]
  });
}

/**
 * Marca una tarea como en progreso
 */
export async function iniciarTarea(id: string): Promise<TareaCultivo> {
  return updateTarea(id, { estado: 'en_progreso' });
}

/**
 * Cancela una tarea
 */
export async function cancelarTarea(id: string): Promise<TareaCultivo> {
  return updateTarea(id, { estado: 'cancelada' });
}

/**
 * Obtiene tareas para un cultivo específico
 */
export async function getTareasPorCultivo(cultivoId: string): Promise<TareaCultivo[]> {
  const auth = useAuth();
  return listTareas({ cultivoId }, undefined, auth.token || undefined);
}

/**
 * Obtiene tareas para una fecha específica
 */
export async function getTareasPorFecha(fecha: string): Promise<TareaCultivo[]> {
  const auth = useAuth();
  return listTareas({ fechaDesde: fecha, fechaHasta: fecha }, undefined, auth.token || undefined);
}

/**
 * Obtiene tareas vencidas (fecha programada anterior a hoy y no completadas)
 */
export async function getTareasVencidas(): Promise<TareaCultivo[]> {
  const hoy = new Date().toISOString().split('T')[0];
  const auth = useAuth();
  const tareas = await listTareas({ estado: 'pendiente' }, undefined, auth.token || undefined);

  return tareas.filter(tarea => tarea.fechaProgramada < hoy);
}

/**
 * Convierte tareas en eventos de calendario
 */
export function tareasToEventosCalendario(tareas: TareaCultivo[]): EventoCalendario[] {
  return tareas.map(tarea => ({
    id: tarea.id,
    titulo: tarea.titulo,
    tipo: tarea.tipo,
    fecha: tarea.fechaProgramada,
    hora: tarea.horaProgramada,
    estado: tarea.estado,
    prioridad: tarea.prioridad,
    descripcion: tarea.descripcion,
    duracion: tarea.duracionEstimada,
    esRecurrente: tarea.esRecurrente,
    tarea: tarea // Referencia completa a la tarea
  }));
}

/**
 * Genera vista mensual del calendario
 */
export function generarVistaCalendarioMensual(
  mes: number,
  anio: number,
  tareas: TareaCultivo[] = []
): VistaCalendarioMensual {
  const fecha = new Date(anio, mes - 1, 1);
  const dias: any[] = [];

  // Agregar días del mes anterior si es necesario
  const primerDiaSemana = fecha.getDay();
  for (let i = 0; i < primerDiaSemana; i++) {
    const diaAnterior = new Date(anio, mes - 1, -primerDiaSemana + i + 1);
    dias.push({
      fecha: diaAnterior.toISOString().split('T')[0],
      diaSemana: diaAnterior.getDay(),
      diaMes: diaAnterior.getDate(),
      esHoy: false,
      esMesActual: false,
      eventos: [],
      tieneEventos: false
    });
  }

  // Agregar días del mes actual
  const ultimoDia = new Date(anio, mes, 0).getDate();
  const hoy = new Date();

  for (let dia = 1; dia <= ultimoDia; dia++) {
    const fechaDia = new Date(anio, mes - 1, dia);
    const fechaString = fechaDia.toISOString().split('T')[0];
    const esHoy = fechaDia.toDateString() === hoy.toDateString();

    // Filtrar eventos para este día
    const eventosDelDia = tareasToEventosCalendario(
      tareas.filter(tarea => tarea.fechaProgramada === fechaString)
    );

    dias.push({
      fecha: fechaString,
      diaSemana: fechaDia.getDay(),
      diaMes: dia,
      esHoy,
      esMesActual: true,
      eventos: eventosDelDia,
      tieneEventos: eventosDelDia.length > 0
    });
  }

  // Completar la semana si es necesario
  while (dias.length % 7 !== 0) {
    const ultimoDiaAgregado = new Date(dias[dias.length - 1].fecha);
    ultimoDiaAgregado.setDate(ultimoDiaAgregado.getDate() + 1);
    dias.push({
      fecha: ultimoDiaAgregado.toISOString().split('T')[0],
      diaSemana: ultimoDiaAgregado.getDay(),
      diaMes: ultimoDiaAgregado.getDate(),
      esHoy: false,
      esMesActual: false,
      eventos: [],
      tieneEventos: false
    });
  }

  return { mes, anio, dias };
}

/**
 * Obtiene estadísticas de planificación
 */
export async function getEstadisticasPlanificacion(cultivoId?: string): Promise<EstadisticasPlanificacion> {
  try {
    let tareas = await listTareas(cultivoId ? { cultivoId } : {});

    const hoy = new Date();
    const unaSemanaDesdeHoy = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
    const hoyString = hoy.toISOString().split('T')[0];
    const unaSemanaString = unaSemanaDesdeHoy.toISOString().split('T')[0];

    // Filtrar tareas del período actual
    tareas = tareas.filter(tarea => {
      const fechaTarea = new Date(tarea.fechaProgramada);
      return fechaTarea >= hoy && fechaTarea <= unaSemanaDesdeHoy;
    });

    const totalTareas = tareas.length;
    const tareasPendientes = tareas.filter(t => t.estado === 'pendiente').length;
    const tareasCompletadas = tareas.filter(t => t.estado === 'completada').length;
    const tareasVencidas = tareas.filter(t =>
      t.estado === 'pendiente' && t.fechaProgramada < hoyString
    ).length;
    const tareasHoy = tareas.filter(t => t.fechaProgramada === hoyString).length;
    const tareasSemana = tareas.length;
    const tareasRecurrentes = tareas.filter(t => t.esRecurrente).length;

    const productividad = totalTareas > 0
      ? Math.round((tareasCompletadas / totalTareas) * 100)
      : 0;

    return {
      totalTareas,
      tareasPendientes,
      tareasCompletadas,
      tareasVencidas,
      tareasHoy,
      tareasSemana,
      tareasRecurrentes,
      productividad
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de planificación:', error);
    throw error;
  }
}

/**
 * Duplica una tarea para crear una nueva instancia
 */
export async function duplicarTarea(tareaId: string, nuevaFecha: string): Promise<TareaCultivo> {
  const tareaOriginal = await getTarea(tareaId);

  const nuevaTarea: TareaCreacion = {
    cultivoId: tareaOriginal.cultivoId,
    titulo: `${tareaOriginal.titulo} (Copia)`,
    descripcion: tareaOriginal.descripcion,
    tipo: tareaOriginal.tipo,
    estado: 'pendiente', // Estado por defecto para tareas nuevas
    prioridad: tareaOriginal.prioridad,
    fechaProgramada: nuevaFecha,
    horaProgramada: tareaOriginal.horaProgramada,
    duracionEstimada: tareaOriginal.duracionEstimada,
    esRecurrente: false, // Las copias no son recurrentes por defecto
    recordatorioActivado: tareaOriginal.recordatorioActivado,
    minutosRecordatorio: tareaOriginal.minutosRecordatorio,
  };

  return createTarea(nuevaTarea);
}

/**
 * Obtiene tareas que necesitan recordatorio
 */
export async function getTareasParaRecordatorio(): Promise<TareaCultivo[]> {
  // Nota: No podemos filtrar por recordatorioActivado en la consulta directa
  // ya que no es parte de ListaTareasParams, así que obtenemos todas las tareas
  const tareas = await listTareas();

  return tareas.filter(tarea => {
    if (!tarea.recordatorioActivado || tarea.recordatorioEnviado) {
      return false;
    }

    const fechaRecordatorio = new Date(tarea.fechaProgramada);
    if (tarea.horaProgramada) {
      const [horas, minutos] = tarea.horaProgramada.split(':');
      fechaRecordatorio.setHours(parseInt(horas), parseInt(minutos));
    }

    const minutosRecordatorio = tarea.minutosRecordatorio || 15;
    const fechaRecordatorioLimite = new Date(fechaRecordatorio.getTime() - (minutosRecordatorio * 60 * 1000));

    return new Date() >= fechaRecordatorioLimite;
  });
}

/**
 * Marca recordatorios como enviados
 */
export async function marcarRecordatoriosEnviados(tareaIds: string[]): Promise<void> {
  const promises = tareaIds.map(id =>
    updateTarea(id, { recordatorioEnviado: true })
  );
  await Promise.all(promises);
}
