/**
 * Hook personalizado para manejar el estado y operaciones CRUD de planificación de cultivos
 * Gestiona tareas, recordatorios y eventos de calendario para cultivos
 * Sigue el mismo patrón que useCultivos para consistencia en la aplicación
 * 'use client' indica que este código se ejecuta solo en el cliente (no en SSR)
 */
'use client';

// Importaciones necesarias de React
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';

// Importación de tipos desde el módulo de tipos de planificación
import type {
  TareaCultivo,
  ListaTareasParams,
  TareaCreacion,
  EstadisticasPlanificacion,
  TipoTarea,
  EstadoTarea,
  PrioridadTarea
} from '@/types/planificacion';

// Importación de funciones de servicio, renombradas para evitar conflictos de nombres
import {
  listTareas as sListTareas,
  createTarea as sCreateTarea,
  updateTarea as sUpdateTarea,
  removeTarea as sRemoveTarea,
  getTarea,
  getTareasPorCultivo,
  getEstadisticasPlanificacion as sGetEstadisticasPlanificacion,
  getTareasVencidas,
  getTareasParaRecordatorio,
  marcarRecordatoriosEnviados
} from '../services/planificacion';

/**
 * Hook personalizado para manejar el estado completo de la planificación
 * Incluye carga de datos, filtros, y operaciones CRUD con UI optimista
 * @param initial - Parámetros iniciales de lista (orden por defecto: fecha descendente)
 * @returns Objeto con estado y funciones para manipular las tareas de planificación
 */
export function usePlanificacion(
  initial: ListaTareasParams = { _sort: 'fechaProgramada', _order: 'asc' }
) {
  // Estado de parámetros de consulta (filtros, ordenamiento, paginación)
  const [params, setParams] = useState<ListaTareasParams>(initial);

  // Estado del array de tareas
  const [tareas, setTareas] = useState<TareaCultivo[]>([]);

  // Estado de carga (true mientras se obtienen datos del servidor)
  const [loading, setLoading] = useState(true);

  // Estado de error (string con mensaje de error o null si no hay error)
  const [error, setError] = useState<string | null>(null);

  // Estado adicional para estadísticas de planificación
  const [estadisticas, setEstadisticas] = useState<EstadisticasPlanificacion | null>(null);

  // Estado para tareas que necesitan recordatorio
  const [tareasParaRecordatorio, setTareasParaRecordatorio] = useState<TareaCultivo[]>([]);

  // Autenticación para obtener el token
  const { token } = useAuth();

  // Efecto que se ejecuta cuando cambian los parámetros para recargar las tareas
  useEffect(() => {
    // Crea un AbortController para poder cancelar peticiones pendientes
    const controller = new AbortController();

    // Función asíncrona auto-ejecutada para cargar las tareas
    (async () => {
      try {
        // Inicia el estado de carga y limpia errores previos
        setLoading(true);
        setError(null);

        // Llama al servicio para obtener las tareas con los parámetros actuales
        const data = await sListTareas(params, controller.signal, token || undefined);

        // Actualiza el estado con las tareas obtenidas
        setTareas(data);

        // Carga estadísticas si no hay filtros específicos
        if (!params.cultivoId && !params.q) {
          try {
            const stats = await sGetEstadisticasPlanificacion(params.cultivoId, token || undefined);
            setEstadisticas(stats);
          } catch (statsError) {
            console.warn('Error al cargar estadísticas de planificación:', statsError);
          }
        }

        // Carga tareas para recordatorio
        try {
          const tareasRecordatorio = await getTareasParaRecordatorio(token || undefined);
          setTareasParaRecordatorio(tareasRecordatorio);
        } catch (recordatorioError) {
          console.warn('Error al cargar tareas para recordatorio:', recordatorioError);
        }
      } catch (e: unknown) {
        // Solo maneja errores que no sean de cancelación de petición
        const error = e as Error;
        if (error?.name !== 'AbortError') {
          setError(error?.message ?? 'Error desconocido al cargar tareas');
        }
      } finally {
        // Siempre marca como terminado el estado de carga
        setLoading(false);
      }
    })();

    // Función de cleanup: aborta la petición si el componente se desmonta o params cambia
    return () => controller.abort();
  }, [params, token]); // Se ejecuta cuando cambian los parámetros de consulta

  // Funciones helper para actualizar los parámetros de filtro de manera segura

  /**
   * Establece el query de búsqueda (se filtra por contenido de tareas)
   * @param q - Término de búsqueda
   */
  const setQuery = useCallback((q: string) => {
    setParams((p: ListaTareasParams) => ({ ...p, q }));
  }, []);

  /**
   * Establece el campo y dirección de ordenamiento
   * @param key - Campo por el cual ordenar
   * @param order - Dirección del ordenamiento (asc/desc)
   */
  const setSort = useCallback((key: keyof TareaCultivo, order: 'asc' | 'desc') => {
    setParams((p: ListaTareasParams) => ({ ...p, _sort: key, _order: order }));
  }, []);

  /**
   * Establece filtro por cultivo específico
   * @param cultivoId - ID del cultivo para filtrar tareas
   */
  const setFiltroCultivo = useCallback((cultivoId: string | undefined) => {
    setParams((p: ListaTareasParams) => ({ ...p, cultivoId }));
  }, []);

  /**
   * Establece filtro por tipo de tarea
   * @param tipo - Tipo de tarea para filtrar
   */
  const setFiltroTipo = useCallback((tipo: TipoTarea | undefined) => {
    setParams((p: ListaTareasParams) => ({ ...p, tipo }));
  }, []);

  /**
   * Establece filtro por estado de tarea
   * @param estado - Estado para filtrar tareas
   */
  const setFiltroEstado = useCallback((estado: EstadoTarea | undefined) => {
    setParams((p: ListaTareasParams) => ({ ...p, estado }));
  }, []);

  /**
   * Establece filtro por prioridad de tarea
   * @param prioridad - Prioridad para filtrar tareas
   */
  const setFiltroPrioridad = useCallback((prioridad: PrioridadTarea | undefined) => {
    setParams((p: ListaTareasParams) => ({ ...p, prioridad }));
  }, []);

  /**
   * Establece filtro por rango de fechas
   * @param fechaDesde - Fecha de inicio del rango
   * @param fechaHasta - Fecha de fin del rango
   */
  const setFiltroFechas = useCallback((fechaDesde: string | undefined, fechaHasta: string | undefined) => {
    setParams((p: ListaTareasParams) => ({ ...p, fechaDesde, fechaHasta }));
  }, []);

  /**
   * Establece la página y límite de resultados para paginación
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   */
  const setPageLimit = useCallback((page: number, limit: number) => {
    setParams((p: ListaTareasParams) => ({ ...p, _page: page, _limit: limit }));
  }, []);

  // Funciones de acciones CRUD con UI optimista (actualiza UI inmediatamente, luego sincroniza con servidor)

  /**
   * Crea una nueva tarea con UI optimista
   * Primero actualiza la UI localmente, luego sincroniza con el servidor
   * @param payload - Datos de la tarea a crear
   * @returns Promise con la tarea creada
   */
  const create = useCallback(async (payload: TareaCreacion) => {
    // Crea una tarea optimista con ID temporal para mostrar inmediatamente en UI
    const optimistic: TareaCultivo = {
      id: String(Date.now()),
      ...payload,
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaActualizacion: new Date().toISOString().split('T')[0],
      estado: payload.estado || 'pendiente',
      recordatorioEnviado: false,
    };

    // Agrega la tarea optimista al array de tareas (UI se actualiza instantáneamente)
    setTareas(prev => [...prev, optimistic]);

    try {
      // Intenta guardar en el servidor
      const saved = await sCreateTarea(payload, token || undefined);

      // Reconciliación: reemplaza la tarea optimista con la guardada
      setTareas(prev => prev.map(t => (t.id === optimistic.id ? saved : t)));

      // Actualiza estadísticas después de crear
      try {
        const stats = await sGetEstadisticasPlanificacion(payload.cultivoId, token || undefined);
        setEstadisticas(stats);
      } catch (statsError) {
        console.warn('Error al actualizar estadísticas:', statsError);
      }

      // Retorna la tarea guardada
      return saved;
    } catch (e) {
      // En caso de error, remueve la tarea optimista de la UI
      setTareas(prev => prev.filter(t => t.id !== optimistic.id));

      // Re-lanza el error para que lo maneje el componente que llama
      throw e;
    }
  }, [token]);

  /**
   * Actualiza una tarea con UI optimista
   * Aplica cambios inmediatamente en UI, mantiene backup para poder revertir si falla
   * @param id - ID de la tarea a actualizar
   * @param patch - Campos a actualizar
   * @returns Promise con la tarea actualizada
   */
  const update = useCallback(async (id: string, patch: Partial<TareaCultivo>) => {
    // Variable para almacenar el estado original de la tarea (para rollback si falla)
    let backup: TareaCultivo | undefined;

    // Aplica los cambios optimistas y guarda backup del estado original
    setTareas(prev => prev.map(t => {
      if (t.id === id) {
        backup = t; // Guarda el estado original
        return { ...t, ...patch }; // Aplica los cambios
      }
      return t;
    }));

    try {
      // Intenta actualizar en el servidor
      const updated = await sUpdateTarea(id, patch, token || undefined);

      // Actualiza con la respuesta del servidor (por si hay campos calculados)
      setTareas(prev => prev.map(t => (t.id === id ? updated : t)));

      // Actualiza estadísticas si cambió el estado
      if ('estado' in patch) {
        try {
          const stats = await sGetEstadisticasPlanificacion(undefined, token || undefined);
          setEstadisticas(stats);
        } catch (statsError) {
          console.warn('Error al actualizar estadísticas:', statsError);
        }
      }

      return updated;
    } catch (e) {
      // En caso de error, revierte al estado original usando el backup
      if (backup) {
        setTareas(prev => prev.map(t => (t.id === id ? backup! : t)));
      }

      // Re-lanza el error para que lo maneje el componente que llama
      throw e;
    }
  }, [token]);

  /**
   * Elimina una tarea con UI optimista
   * Remueve inmediatamente de UI, mantiene backup para restaurar si falla
   * @param id - ID de la tarea a eliminar
   * @returns Promise con true si la eliminación fue exitosa
   */
  const remove = useCallback(async (id: string) => {
    // Variable para almacenar la tarea eliminada (para rollback si falla)
    let backup: TareaCultivo | undefined;

    // Remueve la tarea de la UI y guarda backup
    setTareas(prev => {
      backup = prev.find(t => t.id === id); // Encuentra y guarda la tarea a eliminar
      return prev.filter(t => t.id !== id); // Filtra removiendo la tarea
    });

    try {
      // Intenta eliminar en el servidor
      await sRemoveTarea(id, token || undefined);

      // Actualiza estadísticas después de eliminar
      try {
        const stats = await sGetEstadisticasPlanificacion(undefined, token || undefined);
        setEstadisticas(stats);
      } catch (statsError) {
        console.warn('Error al actualizar estadísticas:', statsError);
      }

      return true;
    } catch (e) {
      // En caso de error, restaura la tarea eliminada usando el backup
      if (backup) {
        setTareas(prev => [backup!, ...prev]);
      }

      // Re-lanza el error para que lo maneje el componente que llama
      throw e;
    }
  }, [token]);

  /**
   * Marca una tarea como completada
   * @param id - ID de la tarea a completar
   * @returns Promise con la tarea actualizada
   */
  const completar = useCallback(async (id: string) => {
    return update(id, { estado: 'completada', fechaCompletada: new Date().toISOString().split('T')[0] });
  }, [update]);

  /**
   * Marca una tarea como en progreso
   * @param id - ID de la tarea a iniciar
   * @returns Promise con la tarea actualizada
   */
  const iniciar = useCallback(async (id: string) => {
    return update(id, { estado: 'en_progreso' });
  }, [update]);

  /**
   * Cancela una tarea
   * @param id - ID de la tarea a cancelar
   * @returns Promise con la tarea actualizada
   */
  const cancelar = useCallback(async (id: string) => {
    return update(id, { estado: 'cancelada' });
  }, [update]);

  /**
   * Obtiene una tarea específica por ID
   * @param id - ID de la tarea a obtener
   * @returns Promise con la tarea
   */
  const getById = useCallback(async (id: string) => {
    try {
      return await getTarea(id);
    } catch (error) {
      console.error(`Error al obtener tarea ${id}:`, error);
      throw error;
    }
  }, []);

  /**
   * Obtiene tareas para un cultivo específico
   * @param cultivoId - ID del cultivo
   * @returns Promise con las tareas del cultivo
   */
  const getTareasCultivo = useCallback(async (cultivoId: string) => {
    try {
      return await getTareasPorCultivo(cultivoId);
    } catch (error) {
      console.error(`Error al obtener tareas del cultivo ${cultivoId}:`, error);
      throw error;
    }
  }, []);

  /**
   * Obtiene tareas vencidas
   * @returns Promise con las tareas vencidas
   */
  const getVencidas = useCallback(async () => {
    try {
      return await getTareasVencidas();
    } catch (error) {
      console.error('Error al obtener tareas vencidas:', error);
      throw error;
    }
  }, []);

  /**
   * Procesa recordatorios pendientes
   * @returns Promise con el resultado del procesamiento
   */
  const procesarRecordatorios = useCallback(async () => {
    try {
      const tareasRecordatorio = await getTareasParaRecordatorio();
      setTareasParaRecordatorio(tareasRecordatorio);

      if (tareasRecordatorio.length > 0) {
        const tareaIds = tareasRecordatorio.map(t => t.id);
        await marcarRecordatoriosEnviados(tareaIds);

        // Actualizar tareas locales para reflejar que se enviaron recordatorios
        setTareas(prev => prev.map(tarea =>
          tareaIds.includes(tarea.id)
            ? { ...tarea, recordatorioEnviado: true }
            : tarea
        ));
      }

      return tareasRecordatorio;
    } catch (error) {
      console.error('Error al procesar recordatorios:', error);
      throw error;
    }
  }, []);

  /**
   * Refresca los datos de tareas
   * @returns Promise que se resuelve cuando se completó la actualización
   */
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await sListTareas(params, undefined, token || undefined);

      setTareas(data);

      // Recargar estadísticas
      try {
        const stats = await sGetEstadisticasPlanificacion(params.cultivoId, token || undefined);
        setEstadisticas(stats);
      } catch (statsError) {
        console.warn('Error al recargar estadísticas:', statsError);
      }

      // Recargar tareas para recordatorio
      try {
        const tareasRecordatorio = await getTareasParaRecordatorio(token || undefined);
        setTareasParaRecordatorio(tareasRecordatorio);
      } catch (recordatorioError) {
        console.warn('Error al recargar tareas para recordatorio:', recordatorioError);
      }
    } catch (error) {
      console.error('Error al refrescar tareas:', error);
      setError('Error al refrescar los datos');
    } finally {
      setLoading(false);
    }
  }, [params, token]);

  // Retorna el objeto con todos los estados y funciones disponibles para usar el hook
  return {
    tareas,              // Array de tareas actual
    loading,             // Estado de carga
    error,               // Mensaje de error (o null)
    params,              // Parámetros actuales de consulta
    estadisticas,        // Estadísticas calculadas de planificación
    tareasParaRecordatorio, // Tareas que necesitan recordatorio

    // Funciones de filtrado y ordenamiento
    setQuery,            // Función para cambiar el filtro de búsqueda
    setSort,             // Función para cambiar el ordenamiento
    setFiltroCultivo,    // Función para filtrar por cultivo
    setFiltroTipo,       // Función para filtrar por tipo
    setFiltroEstado,     // Función para filtrar por estado
    setFiltroPrioridad,  // Función para filtrar por prioridad
    setFiltroFechas,     // Función para filtrar por fechas
    setPageLimit,        // Función para cambiar paginación

    // Funciones CRUD
    create,              // Función para crear tareas con UI optimista
    update,              // Función para actualizar tareas con UI optimista
    remove,              // Función para eliminar tareas con UI optimista
    completar,           // Función para completar tareas
    iniciar,             // Función para iniciar tareas
    cancelar,            // Función para cancelar tareas

    // Funciones auxiliares
    getById,             // Función para obtener tarea por ID
    getTareasCultivo,    // Función para obtener tareas de un cultivo
    getVencidas,         // Función para obtener tareas vencidas
    procesarRecordatorios, // Función para procesar recordatorios
    refresh              // Función para refrescar datos
  };
}
