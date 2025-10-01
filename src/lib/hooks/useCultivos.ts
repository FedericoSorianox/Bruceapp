/**
 * Hook personalizado para manejar el estado y operaciones CRUD de cultivos
 * Sigue el mismo patrón que useNotes para consistencia en la aplicación
 * 'use client' indica que este código se ejecuta solo en el cliente (no en SSR)
 */
'use client';

// Importaciones necesarias de React
import { useCallback, useEffect, useState } from 'react';

// Importación de tipos desde el módulo de tipos de cultivos
import type { Cultivo, ListaCultivosParams, CultivoCreacion } from '@/types/cultivo';

// Importación del hook de autenticación
import { useAuth } from '@/lib/auth/AuthProvider';

// Importación de funciones de servicio, renombradas para evitar conflictos de nombres
import {
  listCultivos,
  createCultivo as sCreate,
  updateCultivo as sUpdate,
  removeCultivo as sRemove,
  getCultivo,
  getEstadisticasCultivos
} from '../services/cultivos';

/**
 * Hook personalizado para manejar el estado completo de los cultivos
 * Incluye carga de datos, filtros, y operaciones CRUD con UI optimista
 * @param initial - Parámetros iniciales de lista (orden por defecto: nombre ascendente)
 * @returns Objeto con estado y funciones para manipular los cultivos
 */
export function useCultivos(initial: ListaCultivosParams = { _sort: 'nombre', _order: 'asc' }) {
  // Hook de autenticación para obtener el token
  const { token } = useAuth();

  // Estado de parámetros de consulta (filtros, ordenamiento, paginación)
  const [params, setParams] = useState<ListaCultivosParams>(initial);

  // Estado del array de cultivos
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);

  // Estado de carga (true mientras se obtienen datos del servidor)
  const [loading, setLoading] = useState(true);

  // Estado de error (string con mensaje de error o null si no hay error)
  const [error, setError] = useState<string | null>(null);

  // Estado adicional para estadísticas de cultivos
  const [estadisticas, setEstadisticas] = useState<{
    total: number;
    activos: number;
    finalizados: number;
    totalMetrosCuadrados: number;
    totalPlantas: number;
  } | null>(null);

  // Efecto que se ejecuta cuando cambian los parámetros para recargar los cultivos
  useEffect(() => {
    // Crea un AbortController para poder cancelar peticiones pendientes
    const controller = new AbortController();

    // Función asíncrona auto-ejecutada para cargar los cultivos
    (async () => {
      try {
        // Inicia el estado de carga y limpia errores previos
        setLoading(true);
        setError(null);

        // Llama al servicio para obtener los cultivos con los parámetros actuales
        const data = await listCultivos(params, controller.signal, token || undefined);

        // Actualiza el estado con los cultivos obtenidos
        setCultivos(data);

        // Carga estadísticas si es la primera carga o cambió el filtro de activos
        if (!params.q) {
          try {
            const stats = await getEstadisticasCultivos();
            setEstadisticas(stats);
          } catch (statsError) {
            console.warn('Error al cargar estadísticas:', statsError);
          }
        }
      } catch (e: unknown) {
        // Solo maneja errores que no sean de cancelación de petición
        const error = e as Error;
        if (error?.name !== 'AbortError') {
          setError(error?.message ?? 'Error desconocido al cargar cultivos');
        }
      } finally {
        // Siempre marca como terminado el estado de carga
        setLoading(false);
      }
    })();

    // Función de cleanup: aborta la petición si el componente se desmonta o params cambia
    return () => controller.abort();
  }, [params, token]); // Se ejecuta cuando cambian los parámetros de consulta o el token

  // Funciones helper para actualizar los parámetros de filtro de manera segura

  /**
   * Establece el query de búsqueda (se filtra por contenido de cultivos)
   * @param q - Término de búsqueda
   */
  const setQuery = useCallback((q: string) => {
    setParams((p: ListaCultivosParams) => ({ ...p, q }));
  }, []);

  /**
   * Establece el campo y dirección de ordenamiento
   * @param key - Campo por el cual ordenar
   * @param order - Dirección del ordenamiento (asc/desc)
   */
  const setSort = useCallback((key: keyof Cultivo, order: 'asc' | 'desc') => {
    setParams((p: ListaCultivosParams) => ({ ...p, _sort: key, _order: order }));
  }, []);

  /**
   * Establece filtro por estado activo/inactivo
   * @param activo - true para cultivos activos, false para inactivos, undefined para todos
   */
  const setFiltroActivo = useCallback((activo?: boolean) => {
    setParams((p: ListaCultivosParams) => ({ ...p, activo }));
  }, []);

  /**
   * Establece la página y límite de resultados para paginación
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   */
  const setPageLimit = useCallback((page: number, limit: number) => {
    setParams((p: ListaCultivosParams) => ({ ...p, _page: page, _limit: limit }));
  }, []);

  // Funciones de acciones CRUD con UI optimista (actualiza UI inmediatamente, luego sincroniza con servidor)

  /**
   * Crea un nuevo cultivo con UI optimista
   * Primero actualiza la UI localmente, luego sincroniza con el servidor
   * @param payload - Datos del cultivo a crear
   * @returns Promise con el cultivo creado
   */
  const create = useCallback(async (payload: CultivoCreacion) => {
    // Crea un cultivo optimista con ID temporal para mostrar inmediatamente en UI
    const optimistic: Cultivo = { 
      id: String(Date.now()), 
      ...payload,
      fechaCreacion: new Date().toISOString().split('T')[0],
      activo: payload.activo ?? true,
    };

    // Agrega el cultivo optimista al inicio del array de cultivos (UI se actualiza instantáneamente)
    setCultivos(prev => [optimistic, ...prev]);

    try {
      // Intenta guardar en el servidor
      const saved = await sCreate(payload, token || undefined);

      // Reconciliación: reemplaza el cultivo optimista con el guardado (puede tener ID diferente)
      setCultivos(prev => prev.map(c => (c.id === optimistic.id ? saved : c)));

      // Actualiza estadísticas después de crear
      try {
        const stats = await getEstadisticasCultivos();
        setEstadisticas(stats);
      } catch (statsError) {
        console.warn('Error al actualizar estadísticas:', statsError);
      }

      // Retorna el cultivo guardado
      return saved;
    } catch (e) {
      // En caso de error, remueve el cultivo optimista de la UI
      setCultivos(prev => prev.filter(c => c.id !== optimistic.id));

      // Re-lanza el error para que lo maneje el componente que llama
      throw e;
    }
  }, [token]);

  /**
   * Actualiza un cultivo con UI optimista
   * Aplica cambios inmediatamente en UI, mantiene backup para poder revertir si falla
   * @param id - ID del cultivo a actualizar
   * @param patch - Campos a actualizar
   * @returns Promise con el cultivo actualizado
   */
  const update = useCallback(async (id: string, patch: Partial<Cultivo>) => {
    // Variable para almacenar el estado original del cultivo (para rollback si falla)
    let backup: Cultivo | undefined;

    // Aplica los cambios optimistas y guarda backup del estado original
    setCultivos(prev => prev.map(c => {
      if (c.id === id) {
        backup = c; // Guarda el estado original
        return { ...c, ...patch }; // Aplica los cambios
      }
      return c;
    }));

    try {
      // Intenta actualizar en el servidor
      const updated = await sUpdate(id, patch, token || undefined);

      // Actualiza con la respuesta del servidor (por si hay campos calculados)
      setCultivos(prev => prev.map(c => (c.id === id ? updated : c)));

      // Actualiza estadísticas si cambió el estado activo
      if ('activo' in patch) {
        try {
          const stats = await getEstadisticasCultivos();
          setEstadisticas(stats);
        } catch (statsError) {
          console.warn('Error al actualizar estadísticas:', statsError);
        }
      }

      return updated;
    } catch (e) {
      // En caso de error, revierte al estado original usando el backup
      if (backup) {
        setCultivos(prev => prev.map(c => (c.id === id ? backup! : c)));
      }

      // Re-lanza el error para que lo maneje el componente que llama
      throw e;
    }
  }, [token]);

  /**
   * Elimina un cultivo con UI optimista
   * Remueve inmediatamente de UI, mantiene backup para restaurar si falla
   * @param id - ID del cultivo a eliminar
   * @returns Promise con true si la eliminación fue exitosa
   */
  const remove = useCallback(async (id: string) => {
    // Variable para almacenar el cultivo eliminado (para rollback si falla)
    let backup: Cultivo | undefined;

    // Remueve el cultivo de la UI y guarda backup
    setCultivos(prev => {
      backup = prev.find(c => c.id === id); // Encuentra y guarda el cultivo a eliminar
      return prev.filter(c => c.id !== id); // Filtra removiendo el cultivo
    });

    try {
      // Intenta eliminar en el servidor
      await sRemove(id, token || undefined);

      // Actualiza estadísticas después de eliminar
      try {
        const stats = await getEstadisticasCultivos();
        setEstadisticas(stats);
      } catch (statsError) {
        console.warn('Error al actualizar estadísticas:', statsError);
      }

      return true;
    } catch (e) {
      // En caso de error, restaura el cultivo eliminado usando el backup
      if (backup) {
        setCultivos(prev => [backup!, ...prev]);
      }

      // Re-lanza el error para que lo maneje el componente que llama
      throw e;
    }
  }, [token]);

  /**
   * Finaliza un cultivo (marca como inactivo)
   * @param id - ID del cultivo a finalizar
   * @returns Promise con el cultivo actualizado
   */
  const finalizar = useCallback(async (id: string) => {
    return update(id, { activo: false });
  }, [update]);

  /**
   * Reactiva un cultivo finalizado
   * @param id - ID del cultivo a reactivar
   * @returns Promise con el cultivo actualizado
   */
  const reactivar = useCallback(async (id: string) => {
    return update(id, { activo: true });
  }, [update]);

  /**
   * Obtiene un cultivo específico por ID
   * @param id - ID del cultivo a obtener
   * @returns Promise con el cultivo
   */
  const getById = useCallback(async (id: string) => {
    try {
      return await getCultivo(id, undefined, token || undefined);
    } catch (error) {
      console.error(`Error al obtener cultivo ${id}:`, error);
      throw error;
    }
  }, [token]);

  // Retorna el objeto con todos los estados y funciones disponibles para usar el hook
  return {
    cultivos,       // Array de cultivos actual
    loading,        // Estado de carga
    error,          // Mensaje de error (o null)
    params,         // Parámetros actuales de consulta
    estadisticas,   // Estadísticas calculadas de cultivos
    setQuery,       // Función para cambiar el filtro de búsqueda
    setSort,        // Función para cambiar el ordenamiento
    setFiltroActivo, // Función para filtrar por estado activo/inactivo
    setPageLimit,   // Función para cambiar paginación
    create,         // Función para crear cultivos con UI optimista
    update,         // Función para actualizar cultivos con UI optimista
    remove,         // Función para eliminar cultivos con UI optimista
    finalizar,      // Función para finalizar cultivos
    reactivar,      // Función para reactivar cultivos
    getById,        // Función para obtener cultivo por ID
  };
}
