/**
 * Servicio client-side para gestión de comentarios de cultivos
 * Maneja operaciones CRUD de comentarios/notas específicas por cultivo
 */

import type { 
  ComentarioCultivo, 
  FiltrosComentarios, 
  ApiResponseChat,
  TipoComentario,
  PrioridadComentario
} from '@/types/chat';

// Configuración base
const API_BASE = '/api/comentarios';

/**
 * Obtiene comentarios con filtros opcionales
 * @param filtros - Criterios de filtrado y paginación
 * @param signal - Señal de aborto para cancelar petición
 * @returns Promise con array de comentarios
 */
export async function obtenerComentarios(
  filtros: FiltrosComentarios = {},
  signal?: AbortSignal
): Promise<ComentarioCultivo[]> {
  try {
    // Construir URL con parámetros de consulta
    const url = new URL(API_BASE, window.location.origin);
    
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    const response = await fetch(url, { signal });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Error al obtener comentarios`);
    }

    const data: ApiResponseChat<ComentarioCultivo[]> = await response.json();
    
    if (!data.success || !Array.isArray(data.data)) {
      throw new Error(data.error || 'Respuesta inválida del servidor');
    }

    return data.data;
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    throw error;
  }
}

/**
 * Obtiene comentarios específicos de un cultivo
 * @param cultivoId - ID del cultivo
 * @param signal - Señal de aborto
 * @returns Promise con array de comentarios del cultivo
 */
export async function obtenerComentariosCultivo(
  cultivoId: string,
  signal?: AbortSignal
): Promise<ComentarioCultivo[]> {
  return obtenerComentarios({ 
    cultivoId,
    _sort: 'fecha',
    _order: 'desc'
  }, signal);
}

/**
 * Obtiene un comentario específico por ID
 * @param id - ID del comentario
 * @param signal - Señal de aborto
 * @returns Promise con el comentario
 */
export async function obtenerComentario(
  id: string,
  signal?: AbortSignal
): Promise<ComentarioCultivo> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, { signal });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Comentario no encontrado`);
    }

    const data: ApiResponseChat<ComentarioCultivo> = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Comentario no encontrado');
    }

    return data.data;
  } catch (error) {
    console.error('Error al obtener comentario:', error);
    throw error;
  }
}

/**
 * Crea un nuevo comentario
 * @param comentario - Datos del comentario (sin ID)
 * @returns Promise con el comentario creado
 */
export async function crearComentario(
  comentario: Omit<ComentarioCultivo, 'id' | 'fecha' | 'fechaActualizacion'>
): Promise<ComentarioCultivo> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comentario)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Error al crear comentario`);
    }

    const data: ApiResponseChat<ComentarioCultivo> = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Error al crear comentario');
    }

    return data.data;
  } catch (error) {
    console.error('Error al crear comentario:', error);
    throw error;
  }
}

/**
 * Actualiza un comentario existente
 * @param id - ID del comentario
 * @param cambios - Campos a actualizar
 * @returns Promise con el comentario actualizado
 */
export async function actualizarComentario(
  id: string,
  cambios: Partial<Omit<ComentarioCultivo, 'id' | 'fecha'>>
): Promise<ComentarioCultivo> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cambios)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Error al actualizar comentario`);
    }

    const data: ApiResponseChat<ComentarioCultivo> = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Error al actualizar comentario');
    }

    return data.data;
  } catch (error) {
    console.error('Error al actualizar comentario:', error);
    throw error;
  }
}

/**
 * Elimina un comentario
 * @param id - ID del comentario a eliminar
 * @returns Promise que resuelve cuando se elimina
 */
export async function eliminarComentario(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Error al eliminar comentario`);
    }

    const data: ApiResponseChat = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error al eliminar comentario');
    }
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    throw error;
  }
}


/**
 * Utilitarios para crear comentarios rápidamente
 */

/**
 * Crea un comentario rápido con valores por defecto
 * @param cultivoId - ID del cultivo
 * @param titulo - Título del comentario
 * @param contenido - Contenido del comentario
 * @param autor - Autor del comentario
 * @param tipo - Tipo de comentario (por defecto: observacion)
 * @param prioridad - Prioridad (por defecto: media)
 * @returns Datos del comentario listo para crear
 */
export function crearComentarioRapido(
  cultivoId: string,
  titulo: string,
  contenido: string,
  autor: string,
  tipo: TipoComentario = 'observacion',
  prioridad: PrioridadComentario = 'media'
): Omit<ComentarioCultivo, 'id' | 'fecha' | 'fechaActualizacion'> {
  return {
    cultivoId,
    titulo,
    contenido,
    autor,
    tipo,
    prioridad,
    tags: [],
    imagenes: []
  };
}

/**
 * Filtra comentarios por tipo
 * @param comentarios - Array de comentarios
 * @param tipo - Tipo a filtrar
 * @returns Comentarios filtrados
 */
export function filtrarPorTipo(
  comentarios: ComentarioCultivo[], 
  tipo: TipoComentario
): ComentarioCultivo[] {
  return comentarios.filter(c => c.tipo === tipo);
}

/**
 * Filtra comentarios por prioridad
 * @param comentarios - Array de comentarios
 * @param prioridad - Prioridad a filtrar
 * @returns Comentarios filtrados
 */
export function filtrarPorPrioridad(
  comentarios: ComentarioCultivo[], 
  prioridad: PrioridadComentario
): ComentarioCultivo[] {
  return comentarios.filter(c => c.prioridad === prioridad);
}

/**
 * Ordena comentarios por fecha (más recientes primero)
 * @param comentarios - Array de comentarios
 * @returns Comentarios ordenados
 */
export function ordenarPorFecha(comentarios: ComentarioCultivo[]): ComentarioCultivo[] {
  return [...comentarios].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
}

/**
 * Obtiene estadísticas básicas de comentarios
 * @param comentarios - Array de comentarios
 * @returns Estadísticas calculadas
 */
export function obtenerEstadisticasComentarios(comentarios: ComentarioCultivo[]) {
  const stats = {
    total: comentarios.length,
    porTipo: {} as Record<TipoComentario, number>,
    porPrioridad: {} as Record<PrioridadComentario, number>,
    conImagenes: 0,
    ultimaActividad: null as string | null
  };

  comentarios.forEach(comentario => {
    // Contar por tipo
    stats.porTipo[comentario.tipo] = (stats.porTipo[comentario.tipo] || 0) + 1;
    
    // Contar por prioridad
    stats.porPrioridad[comentario.prioridad] = (stats.porPrioridad[comentario.prioridad] || 0) + 1;
    
    // Contar con imágenes
    if (comentario.imagenes && comentario.imagenes.length > 0) {
      stats.conImagenes++;
    }
    
    // Última actividad
    if (!stats.ultimaActividad || comentario.fecha > stats.ultimaActividad) {
      stats.ultimaActividad = comentario.fecha;
    }
  });

  return stats;
}
