// ==========================================
// HOOK PERSONALIZADO: usePosts
// ==========================================
// Este hook maneja la lógica de obtener posts del backend y aplicar paginación.
// Es reutilizable en cualquier componente que necesite mostrar posts paginados.

// PASO 1: Importaciones necesarias
// - useState y useEffect: hooks de React para manejar estado y efectos secundarios
// - Note: tipo de datos que viene del backend (de la página de notas)
import { useState, useEffect } from 'react';
import { Note } from '../../app/notas/page';

// PASO 2: Definición de tipos
// Interface que representa cómo queremos mostrar un post en el frontend
interface Post {
  id: string;      // Identificador único del post
  title: string;   // Título del post
  body: string;    // Contenido del post (mapeado desde content del backend)
}

// Interface que define qué retorna el hook
interface UsePostsReturn {
  data: Post[];           // Array de posts para la página actual
  totalPages: number;     // Número total de páginas disponibles
  loading: boolean;       // Estado de carga mientras se obtienen los datos
  error: string | null;   // Mensaje de error si algo falla
}


/**
 * Custom hook to fetch and paginate blog posts
 * PASO 3: Función principal del hook
 * @param page - Current page number (1-based) - Página actual (empezando desde 1)
 * @param pageSize - Number of posts per page - Cantidad de posts por página
 * @returns Object containing posts data, pagination info, loading state, and error
 */
export function usePosts(page: number, pageSize: number): UsePostsReturn {
  // PASO 4: Estado del hook
  // Mantenemos el estado de los posts, paginación, carga y errores
  const [data, setData] = useState<Post[]>([]);           // Posts de la página actual
  const [totalPages, setTotalPages] = useState(0);        // Total de páginas
  const [loading, setLoading] = useState(true);          // Estado de carga inicial
  const [error, setError] = useState<string | null>(null); // Error si ocurre

  // PASO 5: Efecto que se ejecuta cuando cambian page o pageSize
  // Este useEffect maneja la lógica asíncrona de obtener los datos
  useEffect(() => {
    // PASO 6: Función asíncrona interna para hacer el fetch
    const fetchPosts = async () => {
      try {
        // PASO 6.1: Preparar el estado para la nueva petición
        setLoading(true);    // Mostrar loading
        setError(null);      // Limpiar errores previos

        // PASO 6.2: Hacer petición HTTP al backend
        // Llamamos al endpoint /api/notas que nos devuelve todas las notas
        const response = await fetch('/api/notas');

        // PASO 6.3: Verificar que la respuesta HTTP sea exitosa (status 200-299)
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        // PASO 6.4: Convertir respuesta a JSON
        const result = await response.json();

        // PASO 6.5: Verificar que la respuesta del backend sea exitosa
        // El backend probablemente retorna { success: true, data: [...], message?: string }
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch posts');
        }

        // PASO 6.6: Transformar los datos del backend al formato frontend
        // El backend nos da "notes" con campo "content", pero queremos "posts" con "body"
        const posts: Post[] = result.data.map((note: Note) => ({
          id: note.id,
          title: note.title,
          body: note.content, // Mapeamos content -> body
        }));

        // PASO 6.7: Calcular la paginación del lado del cliente
        // Como tenemos todos los datos, calculamos cuántas páginas necesitamos
        const totalItems = posts.length;
        const calculatedTotalPages = Math.ceil(totalItems / pageSize);

        // PASO 6.8: Obtener solo los posts de la página actual
        // Cálculo de índices para el slice del array
        const startIndex = (page - 1) * pageSize;  // Índice inicial (0-based)
        const endIndex = startIndex + pageSize;     // Índice final (no inclusivo)
        const paginatedPosts = posts.slice(startIndex, endIndex);

        // PASO 6.9: Actualizar el estado con los datos obtenidos
        setData(paginatedPosts);         // Posts de la página actual
        setTotalPages(calculatedTotalPages); // Total de páginas

      } catch (err) {
        // PASO 6.10: Manejo de errores
        // Si ocurre algún error, lo guardamos en el estado
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        // PASO 6.11: Siempre ejecutar al final (éxito o error)
        // Dejar de mostrar el loading
        setLoading(false);
      }
    };

    // PASO 7: Ejecutar la función de fetch
    // Llamamos a fetchPosts inmediatamente cuando el efecto se ejecuta
    fetchPosts();
  }, [page, pageSize]); // PASO 8: Dependencias del useEffect
  // El efecto se vuelve a ejecutar cada vez que cambian page o pageSize

  // PASO 9: Retornar el estado actual del hook
  // Los componentes que usan este hook reciben estos valores
  return { data, totalPages, loading, error };
}

// PASO 10: Export default (opcional, ya que exportamos la función nombrada arriba)
export default usePosts;