// Hook personalizado para manejar el estado y operaciones CRUD de notas
// 'use client' indica que este código se ejecuta solo en el cliente (no en SSR)
'use client';

// Importaciones necesarias de React
import { useCallback, useEffect, useState } from 'react';

// Importación de tipos desde el módulo de servicios de notas
import type { Note, ListParams } from '../services/notes';

// Importación de funciones de servicio, renombradas para evitar conflictos de nombres
import { listNotes, createNote as sCreate, updateNote as sUpdate, removeNote as sRemove } from '../services/notes';

/**
 * Hook personalizado para manejar el estado completo de las notas
 * Incluye carga de datos, filtros, y operaciones CRUD con UI optimista
 * @param initial - Parámetros iniciales de lista (orden por defecto: título ascendente)
 * @returns Objeto con estado y funciones para manipular las notas
 */
export function useNotes(initial: ListParams = { _sort: 'title', _order: 'asc' }) {
  // Estado de parámetros de consulta (filtros, ordenamiento, paginación)
  const [params, setParams] = useState<ListParams>(initial);

  // Estado del array de notas
  const [notes, setNotes] = useState<Note[]>([]);

  // Estado de carga (true mientras se obtienen datos del servidor)
  const [loading, setLoading] = useState(true);

  // Estado de error (string con mensaje de error o null si no hay error)
  const [error, setError] = useState<string | null>(null);

  // Efecto que se ejecuta cuando cambian los parámetros para recargar las notas
  useEffect(() => {
    // Crea un AbortController para poder cancelar peticiones pendientes
    const controller = new AbortController();

    // Función asíncrona auto-ejecutada para cargar las notas
    (async () => {
      try {
        // Inicia el estado de carga y limpia errores previos
        setLoading(true);
        setError(null);

        // Llama al servicio para obtener las notas con los parámetros actuales
        const data = await listNotes(params, controller.signal);

        // Actualiza el estado con las notas obtenidas
        setNotes(data);
      } catch (e: unknown) {
        // Solo maneja errores que no sean de cancelación de petición
        const error = e as Error;
        if (error?.name !== 'AbortError') setError(error?.message ?? 'Error desconocido');
      } finally {
        // Siempre marca como terminado el estado de carga
        setLoading(false);
      }
    })();

    // Función de cleanup: aborta la petición si el componente se desmonta o params cambia
    return () => controller.abort();
  }, [params]); // Se ejecuta cuando cambian los parámetros de consulta

  // Funciones helper para actualizar los parámetros de filtro de manera segura
  // Establece el query de búsqueda (se filtra por contenido de notas)
  const setQuery = useCallback((q: string) => setParams((p: ListParams) => ({ ...p, q })), []);

  // Establece el campo y dirección de ordenamiento
  const setSort = useCallback((key: keyof Note, order: 'asc' | 'desc') => setParams((p: ListParams) => ({ ...p, _sort: key, _order: order })), []);

  // Establece la página y límite de resultados para paginación
  const setPageLimit = useCallback((page: number, limit: number) => setParams((p: ListParams) => ({ ...p, _page: page, _limit: limit })), []);

  // Funciones de acciones CRUD con UI optimista (actualiza UI inmediatamente, luego sincroniza con servidor)

  /**
   * Crea una nueva nota con UI optimista
   * Primero actualiza la UI localmente, luego sincroniza con el servidor
   */
  const create = useCallback(async (payload: Omit<Note, 'id'>) => {
    // Crea una nota optimista con ID temporal para mostrar inmediatamente en UI
    const optimistic = { id: String(Date.now()), ...payload };

    // Agrega la nota optimista al inicio del array de notas (UI se actualiza instantáneamente)
    setNotes(prev => [optimistic, ...prev]);

    try {
      // Intenta guardar en el servidor
      const saved = await sCreate(payload);

      // Reconciliación: reemplaza la nota optimista con la guardada (puede tener ID diferente)
      setNotes(prev => prev.map(n => (n.id === optimistic.id ? saved : n)));

      // Retorna la nota guardada
      return saved;
    } catch (e) {
      // En caso de error, remueve la nota optimista de la UI
      setNotes(prev => prev.filter(n => n.id !== optimistic.id));

      // Re-lanza el error para que lo maneje el componente que llama
      throw e;
    }
  }, []);

  /**
   * Actualiza una nota con UI optimista
   * Aplica cambios inmediatamente en UI, mantiene backup para poder revertir si falla
   */
  const update = useCallback(async (id: string, patch: Partial<Note>) => {
    // Variable para almacenar el estado original de la nota (para rollback si falla)
    let backup: Note | undefined;

    // Aplica los cambios optimistas y guarda backup del estado original
    setNotes(prev => prev.map(n => {
      if (n.id === id) {
        backup = n; // Guarda el estado original
        return { ...n, ...patch }; // Aplica los cambios
      }
      return n;
    }));

    try {
      // Intenta actualizar en el servidor
      return await sUpdate(id, patch);
    } catch (e) {
      // En caso de error, revierte al estado original usando el backup
      if (backup) setNotes(prev => prev.map(n => (n.id === id ? backup! : n)));

      // Re-lanza el error para que lo maneje el componente que llama
      throw e;
    }
  }, []);

  /**
   * Elimina una nota con UI optimista
   * Remueve inmediatamente de UI, mantiene backup para restaurar si falla
   */
  const remove = useCallback(async (id: string) => {
    // Variable para almacenar la nota eliminada (para rollback si falla)
    let backup: Note | undefined;

    // Remueve la nota de la UI y guarda backup
    setNotes(prev => {
      backup = prev.find(n => n.id === id); // Encuentra y guarda la nota a eliminar
      return prev.filter(n => n.id !== id); // Filtra removiendo la nota
    });

    try {
      // Intenta eliminar en el servidor
      await sRemove(id);
      return true;
    } catch (e) {
      // En caso de error, restaura la nota eliminada usando el backup
      if (backup) setNotes(prev => [backup!, ...prev]);

      // Re-lanza el error para que lo maneje el componente que llama
      throw e;
    }
  }, []);

  // Retorna el objeto con todos los estados y funciones disponibles para usar el hook
  return {
    notes,        // Array de notas actual
    loading,      // Estado de carga
    error,        // Mensaje de error (o null)
    params,       // Parámetros actuales de consulta
    setQuery,     // Función para cambiar el filtro de búsqueda
    setSort,      // Función para cambiar el ordenamiento
    setPageLimit, // Función para cambiar paginación
    create,       // Función para crear notas con UI optimista
    update,       // Función para actualizar notas con UI optimista
    remove        // Función para eliminar notas con UI optimista
  };
}
