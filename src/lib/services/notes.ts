// Configuración base de la API
// API_BASE: URL base de las rutas API de Next.js (locales)
const API_BASE = '/api';
// R: Nombre del recurso de notas en la API (endpoint)
const R = 'notas';

// Tipos de prioridad disponibles para las notas
export type Priority = 'baja' | 'media' | 'alta';

// Estructura de datos para una nota
export type Note = {
  id: string;          // Identificador único de la nota
  title: string;       // Título de la nota
  content: string;     // Contenido de la nota
  category?: string;   // Categoría opcional de la nota
  tags?: string[];     // Array de etiquetas opcionales
  date?: string;       // Fecha de creación/modificación opcional
  author?: string;     // Autor de la nota opcional
  priority?: Priority; // Prioridad de la nota (baja, media, alta)
  hasImages?: boolean; // Indica si la nota contiene imágenes
  cropArea?: string;   // Área de cultivo relacionada (probablemente para agricultura)
};

// Parámetros para filtrar y paginar la lista de notas
export type ListParams = {
  q?: string;           // Query de búsqueda opcional
  _sort?: keyof Note;   // Campo por el cual ordenar
  _order?: 'asc' | 'desc'; // Dirección del ordenamiento
  _page?: number;       // Número de página para paginación
  _limit?: number;      // Límite de resultados por página
};

/**
 * Lista todas las notas con parámetros opcionales de filtrado, ordenamiento y paginación
 * @param params - Parámetros de consulta (búsqueda, orden, paginación)
 * @param signal - Señal de aborto opcional para cancelar la petición
 * @returns Promise con array de notas
 */
export async function listNotes(params: ListParams = {}, signal?: AbortSignal): Promise<Note[]> {
  // Construye la URL base con el endpoint de notas
  const url = `${API_BASE}/${R}`;

  // Agrega los parámetros de consulta a la URL si no son undefined o null
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) searchParams.set(k, String(v));
  });

  // Construye la URL final con parámetros de consulta
  const finalUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;

  // Realiza la petición GET con soporte para cancelación
  const res = await fetch(finalUrl, { signal });

  // Lanza error si la respuesta no es exitosa
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  // Parsea la respuesta y extrae los datos del formato API local
  const response = await res.json();
  // Las rutas API locales retornan { success: true, data: [...] }
  if (response.success && Array.isArray(response.data)) {
    return response.data;
  }
  // Fallback directo si no tiene el formato esperado
  return Array.isArray(response) ? response : [];
}

/**
 * Crea una nueva nota en el servidor
 * @param note - Datos de la nota sin el ID (se genera automáticamente)
 * @returns Promise con la nota creada incluyendo el ID generado
 */
export async function createNote(note: Omit<Note, 'id'>): Promise<Note> {
  // Realiza petición POST para crear la nota (la API local genera el ID)
  const res = await fetch(`${API_BASE}/${R}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }, // Especifica que enviamos JSON
    body: JSON.stringify(note), // Envía solo los datos sin ID
  });

  // Lanza error si la creación falla
  if (!res.ok) throw new Error('No se pudo crear');

  // Parsea la respuesta y extrae los datos del formato API local
  const response = await res.json();
  // Las rutas API locales retornan { success: true, data: nota, message: "..." }
  if (response.success && response.data) {
    return response.data;
  }
  // Fallback directo si no tiene el formato esperado
  return response;
}

/**
 * Actualiza parcialmente una nota existente
 * @param id - ID de la nota a actualizar
 * @param patch - Campos a actualizar (solo los campos modificados)
 * @returns Promise con la nota actualizada
 */
export async function updateNote(id: string, patch: Partial<Note>): Promise<Note> {
  // Realiza petición PATCH para actualizar solo los campos especificados
  const res = await fetch(`${API_BASE}/${R}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }, // Especifica que enviamos JSON
    body: JSON.stringify(patch), // Convierte los cambios a JSON string
  });

  // Lanza error si la actualización falla
  if (!res.ok) throw new Error('No se pudo actualizar');

  // Parsea la respuesta y extrae los datos del formato API local
  const response = await res.json();
  // Las rutas API locales retornan { success: true, data: nota, message: "..." }
  if (response.success && response.data) {
    return response.data;
  }
  // Fallback directo si no tiene el formato esperado
  return response;
}

/**
 * Elimina una nota del servidor
 * @param id - ID de la nota a eliminar
 * @returns Promise con true si la eliminación fue exitosa
 */
export async function removeNote(id: string): Promise<boolean> {
  // Realiza petición DELETE para eliminar la nota
  const res = await fetch(`${API_BASE}/${R}/${id}`, { method: 'DELETE' });

  // Lanza error si la eliminación falla
  if (!res.ok) throw new Error('No se pudo borrar');

  // Retorna true indicando que la eliminación fue exitosa
  return true;
}
