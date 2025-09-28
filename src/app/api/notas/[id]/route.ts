/**
 * API Route para gestión de notas individuales
 *
 * Esta API maneja operaciones CRUD para notas específicas por ID.
 *
 * Endpoints:
 * - PATCH /api/notas/[id] - Actualiza una nota existente
 * - DELETE /api/notas/[id] - Elimina una nota
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Note } from '../../../../app/notas/page';

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
 * PATCH /api/notas/[id]
 *
 * Actualiza una nota existente parcialmente
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Leer el body de la petición (campos a actualizar)
    const updates: Partial<Note> = await request.json();

    // Leer la base de datos actual
    const database = readDatabase();

    // Buscar la nota por ID
    const noteIndex = database.sampleNotes.findIndex(note => note.id === id);

    if (noteIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nota no encontrada',
          message: `No se encontró la nota con ID: ${id}`
        },
        { status: 404 }
      );
    }

    // Aplicar las actualizaciones a la nota existente
    const updatedNote: Note = {
      ...database.sampleNotes[noteIndex],
      ...updates,
    };

    // Actualizar la nota en el array
    database.sampleNotes[noteIndex] = updatedNote;

    // Guardar los cambios en db.json
    writeDatabase(database);

    // Devolver respuesta exitosa con la nota actualizada
    return NextResponse.json({
      success: true,
      data: updatedNote,
      message: 'Nota actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en PATCH /api/notas/[id]:', error);

    // Devolver error al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar la nota'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notas/[id]
 *
 * Elimina una nota existente
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Leer la base de datos actual
    const database = readDatabase();

    // Buscar la nota por ID
    const noteIndex = database.sampleNotes.findIndex(note => note.id === id);

    if (noteIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nota no encontrada',
          message: `No se encontró la nota con ID: ${id}`
        },
        { status: 404 }
      );
    }

    // Guardar la nota antes de eliminarla (por si necesitamos rollback)
    const noteToDelete = database.sampleNotes[noteIndex];

    // Eliminar la nota del array
    database.sampleNotes.splice(noteIndex, 1);

    // Guardar los cambios en db.json
    writeDatabase(database);

    // Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      data: noteToDelete,
      message: 'Nota eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/notas/[id]:', error);

    // Devolver error al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo eliminar la nota'
      },
      { status: 500 }
    );
  }
}
