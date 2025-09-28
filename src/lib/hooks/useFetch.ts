'use client';

/**
 * Hook personalizado useFetch - Maneja peticiones HTTP de forma genérica
 *
 * Este hook encapsula la lógica común para hacer fetch requests en React,
 * proporcionando estados de loading, error y data, además de manejo de abort
 * para cancelar peticiones cuando el componente se desmonta o las dependencias cambian.
 *
 * Uso típico en componentes:
 * const { data, loading, error, refetch } = useFetch(fetcherFunction, [deps]);
 */

import { useEffect, useRef, useState, useCallback, DependencyList } from 'react';

/**
 * Tipo genérico para la función fetcher
 * - Recibe un AbortSignal para poder cancelar la petición
 * - Retorna una Promise con el tipo de dato esperado T
 */
type Fetcher<T> = (signal: AbortSignal) => Promise<T>;

/**
 * Hook useFetch principal
 * @param fetcher - Función que realiza la petición HTTP
 * @param deps - Array de dependencias para volver a ejecutar el fetch (opcional)
 * @returns Objeto con { data, loading, error, refetch }
 */
export function useFetch<T>(fetcher: Fetcher<T>, deps: DependencyList = []) {
  // Estado para almacenar los datos obtenidos de la API
  const [data, setData] = useState<T | null>(null);

  // Estado para indicar si la petición está en curso
  const [loading, setLoading] = useState(true);

  // Estado para almacenar errores de la petición
  const [error, setError] = useState<string | null>(null);

  // Referencia para almacenar las dependencias y evitar re-renders innecesarios
  const depsRef = useRef(deps);

  /**
   * Función que ejecuta la petición HTTP
   * - Es memoizada con useCallback para evitar re-creaciones innecesarias
   * - Maneja el ciclo completo: loading → petición → éxito/error → loading false
   * - Usa el signal del AbortController para poder cancelar la petición
   */
  const run = useCallback(async (signal: AbortSignal) => {
    // Inicia el estado de carga y limpia errores previos
    setLoading(true);
    setError(null);

    try {
      // Ejecuta la función fetcher con el signal para abort
      const res = await fetcher(signal);

      // Si la petición fue exitosa, actualiza los datos
      setData(res);

    } catch (e: unknown) {
      // Manejo seguro de errores - solo captura errores que no sean por abort
      // AbortError se lanza cuando cancelamos la petición intencionalmente
      if (e instanceof Error && e.name !== 'AbortError') {
        setError(e.message);
      }
      // Si es AbortError, no hacemos nada (es comportamiento esperado)
    } finally {
      // Siempre termina el estado de carga, haya éxito o error
      setLoading(false);
    }
  }, [fetcher]);

  /**
   * useEffect que ejecuta la petición cuando el componente monta o las deps cambian
   * - Crea un AbortController para poder cancelar la petición
   * - Ejecuta run() con el signal del controller
   * - Retorna función de cleanup que aborta la petición si el componente se desmonta
   */
  useEffect(() => {
    // Creamos un nuevo AbortController para esta ejecución
    const controller = new AbortController();

    // Ejecutamos la petición con el signal para poder abortarla
    run(controller.signal);

    // Función de cleanup: aborta la petición si el componente se desmonta
    // o si las dependencias cambian (lo que causa re-ejecución del effect)
    return () => controller.abort();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, ...depsRef.current]);

  /**
   * Función para volver a ejecutar la petición manualmente
   * - Útil cuando queremos refrescar datos sin cambiar dependencias
   * - Crea su propio AbortController ya que es una ejecución independiente
   * - Retorna la Promise para que el caller pueda esperar si es necesario
   */
  const refetch = useCallback(() => {
    const controller = new AbortController();
    return run(controller.signal);
  }, [run]);

  // Retornamos el objeto con todos los estados y la función refetch
  return { data, loading, error, refetch };
}
