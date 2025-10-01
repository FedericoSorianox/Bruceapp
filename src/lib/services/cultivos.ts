/**
 * Servicio para gestión de cultivos
 * Proporciona funciones para operaciones CRUD con la API de cultivos
 * Incluye cálculos automáticos de fases del cultivo
 * Sigue el mismo patrón que el servicio de notas para consistencia
 *
 * 🔒 Sistema de permisos implementado:
 * - Solo administradores pueden crear/eliminar cultivos
 * - Todos los usuarios pueden editar cultivos (con auditoría)
 * - Se registra quién crea y quién edita cada cultivo
 */

/**
 * Calcula los días y semanas actuales de las fases del cultivo
 * @param cultivo - Datos del cultivo
 * @returns Objeto con métricas calculadas de fases
 */
export function calcularMetricasFases(cultivo: Cultivo) {
  const hoy = new Date();
  const metricas = {
    diasVegetacionActual: 0,
    diasFloracionActual: 0,
    semanaVegetacion: 0,
    semanaFloracion: 0,
    faseActual: 'vegetacion' as 'vegetacion' | 'floracion'
  };

  if (!cultivo.fechaComienzo) return metricas;

  const fechaInicio = new Date(cultivo.fechaComienzo);

  if (cultivo.fechaInicioFloracion) {
    // El cultivo está en fase de floración
    const fechaFloracion = new Date(cultivo.fechaInicioFloracion);

    // Días en vegetación = desde inicio hasta inicio floración
    const diffVegetacion = Math.abs(fechaFloracion.getTime() - fechaInicio.getTime());
    metricas.diasVegetacionActual = Math.ceil(diffVegetacion / (1000 * 60 * 60 * 24));

    // Días en floración = desde inicio floración hasta hoy
    const diffFloracion = Math.abs(hoy.getTime() - fechaFloracion.getTime());
    metricas.diasFloracionActual = Math.ceil(diffFloracion / (1000 * 60 * 60 * 24));

    metricas.faseActual = 'floracion';
  } else {
    // El cultivo está en fase de vegetación
    const diffVegetacion = Math.abs(hoy.getTime() - fechaInicio.getTime());
    metricas.diasVegetacionActual = Math.ceil(diffVegetacion / (1000 * 60 * 60 * 24));
    metricas.faseActual = 'vegetacion';
  }

  // Calcular semanas (división entera + 1 para mostrar semana actual)
  metricas.semanaVegetacion = Math.floor(metricas.diasVegetacionActual / 7) + 1;
  if (metricas.diasFloracionActual > 0) {
    metricas.semanaFloracion = Math.floor(metricas.diasFloracionActual / 7) + 1;
  }

  return metricas;
}

/**
 * Marca el inicio de la fase de floración para un cultivo
 * @param cultivoId - ID del cultivo
 * @param fechaInicioFloracion - Fecha de inicio de floración (por defecto hoy)
 * @returns Promise con el cultivo actualizado
 */
export async function iniciarFloracion(cultivoId: string, fechaInicioFloracion?: string): Promise<Cultivo> {
  const fecha = fechaInicioFloracion || new Date().toISOString().split('T')[0];

  const res = await fetch(`${API_BASE}/${R}/${cultivoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fechaInicioFloracion: fecha,
      fechaActualizacion: new Date().toISOString().split('T')[0]
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`No se pudo marcar el inicio de floración: ${errorText}`);
  }

  return res.json();
}

import type {
  Cultivo,
  CultivoCreacion,
  ListaCultivosParams,
  ApiResponseCultivos
} from '@/types/cultivo';

// Configuración base de la API
// API_BASE: URL base de las rutas API de Next.js (locales)
const API_BASE = '/api';
// R: Nombre del recurso de cultivos en la API (endpoint)
const R = 'cultivos';

/**
 * Helper para construir URLs absolutas correctamente
 * Maneja tanto el lado del cliente como SSR
 * @param path - Ruta relativa a construir
 * @returns URL absoluta válida
 */
const buildApiUrl = (path: string): string => {
  // En el lado del cliente, usar el origen actual
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  // Fallback para SSR (Server Side Rendering)
  // MongoDB API está integrada en Next.js, no necesitamos URL externa
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
};

/**
 * Lista todos los cultivos con parámetros opcionales de filtrado, ordenamiento y paginación
 * @param params - Parámetros de consulta (búsqueda, orden, paginación)
 * @param signal - Señal de aborto opcional para cancelar la petición
 * @param token - Token de autenticación opcional
 * @returns Promise con array de cultivos
 */
export async function listCultivos(
  params: ListaCultivosParams = {},
  signal?: AbortSignal,
  token?: string
): Promise<Cultivo[]> {
  // Construye la URL absoluta usando nuestro helper
  const url = new URL(buildApiUrl(`${API_BASE}/${R}`));

  // Agrega los parámetros de consulta a la URL si no son undefined o null
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  try {
    // Realiza la petición GET con soporte para cancelación y autenticación
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, { signal, headers });

    // Lanza error si la respuesta no es exitosa
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    // Parsea la respuesta y extrae los datos del formato API local
    const response: ApiResponseCultivos<Cultivo[]> = await res.json();
    
    // Las rutas API locales retornan { success: true, data: [...] }
    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }
    
    // Fallback directo si no tiene el formato esperado
    return Array.isArray(response) ? response as Cultivo[] : [];
  } catch (error) {
    console.error('Error al listar cultivos:', error);
    throw error;
  }
}

/**
 * Obtiene un cultivo específico por su ID
 * @param id - ID del cultivo a obtener
 * @param signal - Señal de aborto opcional para cancelar la petición
 * @param token - Token de autenticación opcional
 * @returns Promise con el cultivo encontrado
 */
export async function getCultivo(id: string, signal?: AbortSignal, token?: string): Promise<Cultivo> {
  try {
    // Realiza petición GET para obtener el cultivo específico
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/${R}/${id}`, { signal, headers });

    // Lanza error si el cultivo no se encuentra
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    // Parsea la respuesta JSON
    const jsonResponse = await res.json();
    
    // Verifica si es una respuesta con formato ApiResponse
    if (jsonResponse.success !== undefined && jsonResponse.data) {
      return jsonResponse.data as Cultivo;
    }
    
    // Si no tiene el formato de ApiResponse, asume que es directamente un Cultivo
    // Verifica que tenga las propiedades mínimas requeridas
    if (jsonResponse.id && jsonResponse.nombre) {
      return jsonResponse as Cultivo;
    }
    
    throw new Error('Respuesta de API en formato inesperado o datos faltantes');
  } catch (error) {
    console.error(`Error al obtener cultivo ${id}:`, error);
    throw error;
  }
}

/**
 * Crea un nuevo cultivo en el servidor
 * @param cultivo - Datos del cultivo sin el ID (se genera automáticamente)
 * @param token - Token de autenticación opcional
 * @returns Promise con el cultivo creado incluyendo el ID generado
 * @throws Error si el usuario no tiene permisos para crear cultivos
 */
export async function createCultivo(cultivo: CultivoCreacion, token?: string): Promise<Cultivo> {
  try {
    // Agrega campos automáticos antes de enviar
    const cultivoConFechas: CultivoCreacion = {
      ...cultivo,
      fechaCreacion: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
      activo: cultivo.activo ?? true, // Por defecto activo si no se especifica
      // 🔒 Auditoría: la validación y registro de usuario se hace en el componente
    };

    // Realiza petición POST para crear el cultivo (la API local genera el ID)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/${R}`, {
      method: 'POST',
      headers, // Especifica que enviamos JSON y autenticación
      body: JSON.stringify(cultivoConFechas), // Envía solo los datos sin ID
    });

    // Lanza error si la creación falla
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`No se pudo crear el cultivo: ${errorText}`);
    }

    // Parsea la respuesta JSON
    const jsonResponse = await res.json();
    
    // Verifica si es una respuesta con formato ApiResponse
    if (jsonResponse.success !== undefined && jsonResponse.data) {
      return jsonResponse.data as Cultivo;
    }
    
    // Si no tiene el formato de ApiResponse, asume que es directamente un Cultivo
    // Verifica que tenga las propiedades mínimas requeridas
    if (jsonResponse.id && jsonResponse.nombre) {
      return jsonResponse as Cultivo;
    }
    
    throw new Error('Error al crear cultivo: respuesta en formato inesperado');
  } catch (error) {
    console.error('Error al crear cultivo:', error);
    throw error;
  }
}

/**
 * Actualiza parcialmente un cultivo existente
 * @param id - ID del cultivo a actualizar
 * @param patch - Campos a actualizar (solo los campos modificados)
 * @param token - Token de autenticación opcional
 * @returns Promise con el cultivo actualizado
 * @throws Error si el usuario no tiene permisos para editar cultivos
 */
export async function updateCultivo(id: string, patch: Partial<Cultivo>, token?: string): Promise<Cultivo> {
  try {
    // Agrega fecha de actualización automáticamente
    const patchConFecha = {
      ...patch,
      fechaActualizacion: new Date().toISOString().split('T')[0],
      // 🔒 Auditoría: la validación se hace en el componente
    };

    // Realiza petición PATCH para actualizar solo los campos especificados
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/${R}/${id}`, {
      method: 'PATCH',
      headers, // Especifica que enviamos JSON y autenticación
      body: JSON.stringify(patchConFecha), // Convierte los cambios a JSON string
    });

    // Lanza error si la actualización falla
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`No se pudo actualizar el cultivo: ${errorText}`);
    }

    // Parsea la respuesta JSON
    const jsonResponse = await res.json();
    
    // Verifica si es una respuesta con formato ApiResponse
    if (jsonResponse.success !== undefined && jsonResponse.data) {
      return jsonResponse.data as Cultivo;
    }
    
    // Si no tiene el formato de ApiResponse, asume que es directamente un Cultivo
    // Verifica que tenga las propiedades mínimas requeridas
    if (jsonResponse.id && jsonResponse.nombre) {
      return jsonResponse as Cultivo;
    }
    
    throw new Error('Error al actualizar cultivo: respuesta en formato inesperado');
  } catch (error) {
    console.error(`Error al actualizar cultivo ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina un cultivo del servidor
 * @param id - ID del cultivo a eliminar
 * @param token - Token de autenticación opcional
 * @returns Promise con true si la eliminación fue exitosa
 * @throws Error si el usuario no tiene permisos para eliminar cultivos
 */
export async function removeCultivo(id: string, token?: string): Promise<boolean> {
  try {
    // Realiza petición DELETE para eliminar el cultivo
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/${R}/${id}`, { method: 'DELETE', headers });

    // Lanza error si la eliminación falla
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`No se pudo eliminar el cultivo: ${errorText}`);
    }

    // Retorna true indicando que la eliminación fue exitosa
    return true;
  } catch (error) {
    console.error(`Error al eliminar cultivo ${id}:`, error);
    throw error;
  }
}

/**
 * Marca un cultivo como finalizado (cambia activo a false)
 * @param id - ID del cultivo a finalizar
 * @returns Promise con el cultivo actualizado
 */
export async function finalizarCultivo(id: string): Promise<Cultivo> {
  return updateCultivo(id, { 
    activo: false, 
    fechaActualizacion: new Date().toISOString().split('T')[0] 
  });
}

/**
 * Reactiva un cultivo finalizado (cambia activo a true)
 * @param id - ID del cultivo a reactivar
 * @returns Promise con el cultivo actualizado
 */
export async function reactivarCultivo(id: string): Promise<Cultivo> {
  return updateCultivo(id, { 
    activo: true, 
    fechaActualizacion: new Date().toISOString().split('T')[0] 
  });
}

/**
 * Obtiene estadísticas básicas de todos los cultivos
 * @returns Promise con estadísticas resumidas
 */
export async function getEstadisticasCultivos(): Promise<{
  total: number;
  activos: number;
  finalizados: number;
  totalMetrosCuadrados: number;
  totalPlantas: number;
}> {
  try {
    const cultivos = await listCultivos();
    
    const estadisticas = cultivos.reduce((acc, cultivo) => {
      acc.total += 1;
      if (cultivo.activo) acc.activos += 1;
      else acc.finalizados += 1;
      acc.totalMetrosCuadrados += cultivo.metrosCuadrados || 0;
      acc.totalPlantas += cultivo.numeroplantas || 0;
      return acc;
    }, {
      total: 0,
      activos: 0,
      finalizados: 0,
      totalMetrosCuadrados: 0,
      totalPlantas: 0,
    });

    return estadisticas;
  } catch (error) {
    console.error('Error al obtener estadísticas de cultivos:', error);
    throw error;
  }
}
