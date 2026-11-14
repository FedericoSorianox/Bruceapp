'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Cultivo, ListaCultivosParams, CultivoCreacion } from '@/types/cultivo';
import { useAuth } from '@/lib/auth/AuthProvider';
import {
  listCultivos,
  createCultivo as sCreate,
  updateCultivo as sUpdate,
  removeCultivo as sRemove,
  getCultivo,
  iniciarFloracion as sIniciarFloracion,
} from '../services/cultivos';

export function useCultivos(initial: ListaCultivosParams = { _sort: 'nombre', _order: 'asc' }) {
  const { token } = useAuth();
  const [params, setParams] = useState<ListaCultivosParams>(initial);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const data = await listCultivos(params, signal, token || undefined);
      if (!signal?.aborted) {
        setCultivos(data);
      }
    } catch (e: unknown) {
      const err = e as Error;
      if (err?.name !== 'AbortError' && !signal?.aborted) {
        setError(err?.message ?? 'Error desconocido al cargar cultivos');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [params, token]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // Cálculo instantáneo en memoria sin peticiones redundantes a la red
  const estadisticas = useMemo(() => {
    return cultivos.reduce(
      (acc, cultivo) => {
        acc.total += 1;
        if (cultivo.activo !== false) acc.activos += 1;
        else acc.finalizados += 1;
        acc.totalMetrosCuadrados += cultivo.metrosCuadrados || 0;
        acc.totalPlantas += cultivo.numeroplantas || 0;
        return acc;
      },
      {
        total: 0,
        activos: 0,
        finalizados: 0,
        totalMetrosCuadrados: 0,
        totalPlantas: 0,
      }
    );
  }, [cultivos]);

  const setQuery = useCallback((q: string) => {
    setParams((p: ListaCultivosParams) => ({ ...p, q }));
  }, []);

  const setSort = useCallback((key: keyof Cultivo, order: 'asc' | 'desc') => {
    setParams((p: ListaCultivosParams) => ({ ...p, _sort: key, _order: order }));
  }, []);

  const setFiltroActivo = useCallback((activo?: boolean) => {
    setParams((p: ListaCultivosParams) => ({ ...p, activo }));
  }, []);

  const setPageLimit = useCallback((page: number, limit: number) => {
    setParams((p: ListaCultivosParams) => ({ ...p, _page: page, _limit: limit }));
  }, []);

  const create = useCallback(async (payload: CultivoCreacion) => {
    const optimistic: Cultivo = {
      id: String(Date.now()),
      ...payload,
      fechaCreacion: new Date().toISOString().split('T')[0],
      activo: payload.activo ?? true,
    };

    setCultivos(prev => [optimistic, ...prev]);

    try {
      const saved = await sCreate(payload, token || undefined);
      setCultivos(prev => prev.map(c => (c.id === optimistic.id ? saved : c)));
      return saved;
    } catch (e) {
      setCultivos(prev => prev.filter(c => c.id !== optimistic.id));
      throw e;
    }
  }, [token]);

  const update = useCallback(async (id: string, patch: Partial<Cultivo>) => {
    let backup: Cultivo | undefined;

    setCultivos(prev => prev.map(c => {
      if (c.id === id) {
        backup = c;
        return { ...c, ...patch };
      }
      return c;
    }));

    try {
      const updated = await sUpdate(id, patch, token || undefined);
      setCultivos(prev => prev.map(c => (c.id === id ? updated : c)));
      return updated;
    } catch (e) {
      if (backup) {
        setCultivos(prev => prev.map(c => (c.id === id ? backup! : c)));
      }
      throw e;
    }
  }, [token]);

  const remove = useCallback(async (id: string) => {
    let backup: Cultivo | undefined;

    setCultivos(prev => {
      backup = prev.find(c => c.id === id);
      return prev.filter(c => c.id !== id);
    });

    try {
      await sRemove(id, token || undefined);
      return true;
    } catch (e) {
      if (backup) {
        setCultivos(prev => [backup!, ...prev]);
      }
      throw e;
    }
  }, [token]);

  const finalizar = useCallback(async (id: string) => {
    return update(id, { activo: false });
  }, [update]);

  const reactivar = useCallback(async (id: string) => {
    return update(id, { activo: true });
  }, [update]);

  const iniciarFloracion = useCallback(async (id: string, fecha?: string) => {
    const updated = await sIniciarFloracion(id, fecha, token || undefined);
    setCultivos(prev => prev.map(c => (c.id === id ? updated : c)));
    return updated;
  }, [token]);

  const getById = useCallback(async (id: string) => {
    return await getCultivo(id, undefined, token || undefined);
  }, [token]);

  return {
    cultivos,
    loading,
    error,
    params,
    estadisticas,
    setQuery,
    setSort,
    setFiltroActivo,
    setPageLimit,
    create,
    update,
    remove,
    finalizar,
    reactivar,
    iniciarFloracion,
    getById,
    refresh: () => load(),
  };
}
