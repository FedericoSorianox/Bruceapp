'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import type {
  TareaCultivo,
  ListaTareasParams,
  TareaCreacion,
  EstadisticasPlanificacion,
  TipoTarea,
  EstadoTarea,
  PrioridadTarea
} from '@/types/planificacion';
import {
  listTareas as sListTareas,
  createTarea as sCreateTarea,
  updateTarea as sUpdateTarea,
  removeTarea as sRemoveTarea,
  getTarea,
  getTareasPorCultivo,
  getTareasVencidas,
  marcarRecordatoriosEnviados
} from '../services/planificacion';

export type UsePlanificacionReturn = ReturnType<typeof usePlanificacion>;

export function usePlanificacion(
  initial: ListaTareasParams = { _sort: 'fechaProgramada', _order: 'asc' }
) {
  const [params, setParams] = useState<ListaTareasParams>(initial);
  const [tareas, setTareas] = useState<TareaCultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Sincronizar cultivoId si cambia desde las props externas
  useEffect(() => {
    if (initial.cultivoId !== params.cultivoId) {
      setParams(prev => ({ ...prev, cultivoId: initial.cultivoId }));
    }
  }, [initial.cultivoId, params.cultivoId]);

  const fetchTareas = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const data = await sListTareas(params, signal, token || undefined);
      if (!signal?.aborted) {
        setTareas(data);
      }
    } catch (e: unknown) {
      const err = e as Error;
      if (err?.name !== 'AbortError' && !signal?.aborted) {
        setError(err?.message ?? 'Error desconocido al cargar tareas');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [params, token]);

  useEffect(() => {
    const controller = new AbortController();
    fetchTareas(controller.signal);
    return () => controller.abort();
  }, [fetchTareas]);

  // Calcular estadísticas instantáneamente en memoria sin triplicar peticiones HTTP
  const estadisticas = useMemo<EstadisticasPlanificacion>(() => {
    const hoy = new Date().toISOString().split('T')[0];
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    const inicioSemanaStr = inicioSemana.toISOString().split('T')[0];
    const finSemanaStr = finSemana.toISOString().split('T')[0];

    const stats: EstadisticasPlanificacion = {
      totalTareas: tareas.length,
      tareasPendientes: 0,
      tareasCompletadas: 0,
      tareasVencidas: 0,
      tareasHoy: 0,
      tareasSemana: 0,
      tareasRecurrentes: 0,
      productividad: 0,
    };

    for (const tarea of tareas) {
      if (tarea.estado === 'completada') {
        stats.tareasCompletadas++;
      } else if (tarea.estado === 'pendiente' || tarea.estado === 'en_progreso') {
        stats.tareasPendientes++;
        if (tarea.fechaProgramada < hoy) {
          stats.tareasVencidas++;
        }
      } else if (tarea.estado === 'vencida') {
        stats.tareasVencidas++;
      }

      if (tarea.fechaProgramada === hoy) {
        stats.tareasHoy++;
      }
      if (tarea.fechaProgramada >= inicioSemanaStr && tarea.fechaProgramada <= finSemanaStr) {
        stats.tareasSemana++;
      }
      if (tarea.esRecurrente) {
        stats.tareasRecurrentes++;
      }
    }

    const totalRelevante = stats.tareasCompletadas + stats.tareasVencidas;
    stats.productividad = totalRelevante > 0
      ? Math.round((stats.tareasCompletadas / totalRelevante) * 100)
      : (stats.totalTareas > 0 && stats.tareasPendientes === 0 ? 100 : 100);

    return stats;
  }, [tareas]);

  // Calcular recordatorios en memoria sin llamada de red extra
  const tareasParaRecordatorio = useMemo<TareaCultivo[]>(() => {
    const ahora = new Date();
    const hoy = ahora.toISOString().split('T')[0];
    return tareas.filter(tarea => {
      if (tarea.estado !== 'pendiente' || !tarea.recordatorioActivado || tarea.recordatorioEnviado) {
        return false;
      }
      if (tarea.fechaProgramada === hoy && tarea.horaProgramada) {
        const [horas, minutos] = tarea.horaProgramada.split(':').map(Number);
        const horaTarea = new Date();
        horaTarea.setHours(horas, minutos, 0, 0);
        const tiempoRecordatorio = new Date(horaTarea.getTime() - (tarea.minutosRecordatorio || 30) * 60000);
        return ahora >= tiempoRecordatorio && ahora < horaTarea;
      }
      return false;
    });
  }, [tareas]);

  const setQuery = useCallback((q: string) => {
    setParams((p: ListaTareasParams) => ({ ...p, q }));
  }, []);

  const setSort = useCallback((key: keyof TareaCultivo, order: 'asc' | 'desc') => {
    setParams((p: ListaTareasParams) => ({ ...p, _sort: key, _order: order }));
  }, []);

  const setFiltroCultivo = useCallback((cultivoId: string | undefined) => {
    setParams((p: ListaTareasParams) => ({ ...p, cultivoId }));
  }, []);

  const setFiltroTipo = useCallback((tipo: TipoTarea | undefined) => {
    setParams((p: ListaTareasParams) => ({ ...p, tipo }));
  }, []);

  const setFiltroEstado = useCallback((estado: EstadoTarea | undefined) => {
    setParams((p: ListaTareasParams) => ({ ...p, estado }));
  }, []);

  const setFiltroPrioridad = useCallback((prioridad: PrioridadTarea | undefined) => {
    setParams((p: ListaTareasParams) => ({ ...p, prioridad }));
  }, []);

  const setFiltroFechas = useCallback((fechaDesde: string | undefined, fechaHasta: string | undefined) => {
    setParams((p: ListaTareasParams) => ({ ...p, fechaDesde, fechaHasta }));
  }, []);

  const setPageLimit = useCallback((page: number, limit: number) => {
    setParams((p: ListaTareasParams) => ({ ...p, _page: page, _limit: limit }));
  }, []);

  const create = useCallback(async (payload: TareaCreacion) => {
    const optimistic: TareaCultivo = {
      id: String(Date.now()),
      ...payload,
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaActualizacion: new Date().toISOString().split('T')[0],
      estado: payload.estado || 'pendiente',
      recordatorioEnviado: false,
    };

    setTareas(prev => [...prev, optimistic]);

    try {
      const saved = await sCreateTarea(payload, token || undefined);
      setTareas(prev => prev.map(t => (t.id === optimistic.id ? saved : t)));
      return saved;
    } catch (e) {
      setTareas(prev => prev.filter(t => t.id !== optimistic.id));
      throw e;
    }
  }, [token]);

  const update = useCallback(async (id: string, patch: Partial<TareaCultivo>) => {
    let backup: TareaCultivo | undefined;

    setTareas(prev => prev.map(t => {
      if (t.id === id) {
        backup = t;
        return { ...t, ...patch };
      }
      return t;
    }));

    try {
      const updated = await sUpdateTarea(id, patch, token || undefined);
      setTareas(prev => prev.map(t => (t.id === id ? updated : t)));
      return updated;
    } catch (e) {
      if (backup) {
        setTareas(prev => prev.map(t => (t.id === id ? backup! : t)));
      }
      throw e;
    }
  }, [token]);

  const remove = useCallback(async (id: string) => {
    let backup: TareaCultivo | undefined;

    setTareas(prev => {
      backup = prev.find(t => t.id === id);
      return prev.filter(t => t.id !== id);
    });

    try {
      await sRemoveTarea(id, token || undefined);
      return true;
    } catch (e) {
      if (backup) {
        setTareas(prev => [backup!, ...prev]);
      }
      throw e;
    }
  }, [token]);

  const completar = useCallback(async (id: string) => {
    return update(id, { estado: 'completada', fechaCompletada: new Date().toISOString().split('T')[0] });
  }, [update]);

  const iniciar = useCallback(async (id: string) => {
    return update(id, { estado: 'en_progreso' });
  }, [update]);

  const cancelar = useCallback(async (id: string) => {
    return update(id, { estado: 'cancelada' });
  }, [update]);

  const getById = useCallback(async (id: string) => {
    return await getTarea(id);
  }, []);

  const getTareasCultivo = useCallback(async (cultivoId: string) => {
    return await getTareasPorCultivo(cultivoId);
  }, []);

  const getVencidas = useCallback(async () => {
    return await getTareasVencidas();
  }, []);

  const procesarRecordatorios = useCallback(async () => {
    if (tareasParaRecordatorio.length > 0) {
      const tareaIds = tareasParaRecordatorio.map(t => t.id);
      await marcarRecordatoriosEnviados(tareaIds);
      setTareas(prev => prev.map(tarea =>
        tareaIds.includes(tarea.id)
          ? { ...tarea, recordatorioEnviado: true }
          : tarea
      ));
    }
    return tareasParaRecordatorio;
  }, [tareasParaRecordatorio]);

  const refresh = useCallback(async () => {
    await fetchTareas();
  }, [fetchTareas]);

  return {
    tareas,
    loading,
    error,
    params,
    estadisticas,
    tareasParaRecordatorio,
    setQuery,
    setSort,
    setFiltroCultivo,
    setFiltroTipo,
    setFiltroEstado,
    setFiltroPrioridad,
    setFiltroFechas,
    setPageLimit,
    create,
    update,
    remove,
    completar,
    iniciar,
    cancelar,
    getById,
    getTareasCultivo,
    getVencidas,
    procesarRecordatorios,
    refresh
  };
}
