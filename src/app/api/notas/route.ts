/**
 * API Route para gestión de notas
 * 
 * Esta API sirve como puente entre el frontend y los datos almacenados
 * en db.json. Proporciona operaciones CRUD para las notas agrícolas.
 * 
 * Endpoints:
 * - GET /api/notas - Obtiene todas las notas
 * - POST /api/notas - Crea una nueva nota (futuro)
 * - PUT /api/notas/[id] - Actualiza una nota (futuro)
 * - DELETE /api/notas/[id] - Elimina una nota (futuro)
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Note} from '../../../lib/services/notes';

/**
 * Interfaz para representar una persona en la base de datos
 */
interface Person {
  name: string;
  number: string;
  id: string;
}

/**
 * Interfaz para el esquema completo de la base de datos
 */
interface DatabaseSchema {
  persons: Person[];
  sampleNotes: Note[];
}

/**
 * Función para leer datos del archivo db.json
 *
 * @returns {DatabaseSchema} - Datos de la base de datos
 * @throws {Error} - Si no se puede leer el archivo
 */
const readDatabase = (): DatabaseSchema => {
  try {
    // Construir la ruta al archivo db.json desde la raíz del proyecto
    const dbPath = path.join(process.cwd(), 'db.json');

    // Leer el archivo de forma síncrona
    const data = fs.readFileSync(dbPath, 'utf8');

    // Parsear el JSON
    const database: DatabaseSchema = JSON.parse(data);

    return database;
  } catch (error) {
    console.error('Error leyendo db.json:', error);
    throw new Error('No se pudo cargar la base de datos');
  }
};

/**
 * Función para escribir datos al archivo db.json
 *
 * @param database - Datos de la base de datos a escribir
 * @throws {Error} - Si no se puede escribir el archivo
 */
const writeDatabase = (database: DatabaseSchema): void => {
  try {
    // Construir la ruta al archivo db.json desde la raíz del proyecto
    const dbPath = path.join(process.cwd(), 'db.json');

    // Convertir a JSON con formato legible
    const data = JSON.stringify(database, null, 2);

    // Escribir el archivo de forma síncrona
    fs.writeFileSync(dbPath, data, 'utf8');
  } catch (error) {
    console.error('Error escribiendo db.json:', error);
    throw new Error('No se pudo guardar la base de datos');
  }
};

/**
 * GET /api/notas
 *
 * Obtiene todas las notas desde db.json con soporte para búsqueda y ordenamiento
 * Parámetros de query soportados:
 * - q: búsqueda full-text en title, content, author, cropArea
 * - _sort: campo por el cual ordenar (title, date, author, priority)
 * - _order: dirección del ordenamiento (asc, desc)
 * Incluye manejo de errores y validación de datos
 */
export async function GET(request: Request) {
  try {
    // Leer la base de datos
    const database = readDatabase();

    // Extraer las notas
    const notes = database.sampleNotes || [];

    // Obtener parámetros de la URL
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('q');
    const sortBy = url.searchParams.get('_sort');
    const sortOrder = url.searchParams.get('_order');

    // Validar que las notas tengan el formato correcto (solo campos obligatorios)
    const validatedNotes = notes.filter((note: Note) => {
      return (
        note.id &&
        note.title &&
        note.content
      );
    });

    // Aplicar búsqueda si hay query
    let filteredNotes = validatedNotes;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredNotes = validatedNotes.filter((note: Note) => {
        return (
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          (note.author || '').toLowerCase().includes(query) ||
          (note.cropArea || '').toLowerCase().includes(query) ||
          (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
        );
      });
    }

    // Aplicar ordenamiento
    if (sortBy && ['title', 'date', 'author', 'priority'].includes(sortBy)) {
      filteredNotes.sort((a: Note, b: Note) => {
        const aValue = (a[sortBy as keyof Note] as string) || '';
        const bValue = (b[sortBy as keyof Note] as string) || '';

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;

        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      data: filteredNotes,
      total: filteredNotes.length
    });

  } catch (error) {
    console.error('Error en GET /api/notas:', error);

    // Devolver error al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron cargar las notas'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notas
 *
 * Crea una nueva nota y la guarda en db.json
 */
export async function POST(request: Request) {
  try {
    // Leer el body de la petición
    const newNote: Omit<Note, 'id'> = await request.json();

    // Leer la base de datos actual
    const database = readDatabase();

    // Generar un ID único para la nueva nota
    const newId = String(Date.now());

    // Crear la nota completa con ID
    const noteToAdd: Note = {
      id: newId,
      ...newNote,
    };

    // Agregar la nueva nota al array
    database.sampleNotes = [...database.sampleNotes, noteToAdd];

    // Guardar los cambios en db.json
    writeDatabase(database);

    // Devolver respuesta exitosa con la nota creada
    return NextResponse.json({
      success: true,
      data: noteToAdd,
      message: 'Nota creada exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/notas:', error);

    // Devolver error al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo crear la nota'
      },
      { status: 500 }
    );
  }
}
