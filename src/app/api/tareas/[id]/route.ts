/**
 * API Route para gestión de tareas de cultivo individuales
 *
 * Esta API maneja operaciones CRUD para tareas específicas por ID.
 *
 * Endpoints:
 * - GET /api/tareas/[id] - Obtiene una tarea específica
 * - PATCH /api/tareas/[id] - Actualiza una tarea existente
 * - DELETE /api/tareas/[id] - Elimina una tarea
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { TareaCultivo } from '@/types/planificacion';
import type { Cultivo } from '@/types/cultivo';
import type { Note } from '@/lib/services/notes';

// Función para validar permisos desde token (simulación)
function validarPermisos(token: string | null): { email: string; role: 'admin' | 'user' } | null {
  if (!token || !token.startsWith('fake-')) return null;

  try {
    const decoded = atob(token.replace('fake-', ''));
    const role: 'admin' | 'user' = decoded === 'admin@bruce.app' ? 'admin' : 'user';
    return { email: decoded, role };
  } catch {
    return null;
  }
}

// Función para verificar si el usuario puede eliminar tareas
function puedeEliminarTarea(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user?.role === 'admin';
}

// Función para verificar si el usuario puede editar recursos
function puedeEditarRecursos(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user !== null;
}

/**
 * Interfaz para una persona en la base de datos
 */
interface Person {
  id: string;
  name: string;
  number: string;
}

/**
 * Interfaz para el esquema completo de la base de datos
 */
interface DatabaseSchema {
  persons: Person[];
  sampleNotes: Note[];
  cultivos: Cultivo[];
  tareas: TareaCultivo[];
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

    // Asegurar que existe el array de tareas
    if (!database.tareas) {
      database.tareas = [];
    }

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
 * GET /api/tareas/[id]
 *
 * Obtiene una tarea específica por su ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validar que se proporcione un ID
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID requerido',
          message: 'Se debe proporcionar un ID de tarea'
        },
        { status: 400 }
      );
    }

    // Leer la base de datos actual
    const database = readDatabase();

    // Buscar la tarea por ID
    const tarea = database.tareas.find(t => t.id === id);

    if (!tarea) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tarea no encontrada',
          message: `No se encontró la tarea con ID: ${id}`
        },
        { status: 404 }
      );
    }

    // Devolver respuesta exitosa con la tarea encontrada
    return NextResponse.json({
      success: true,
      data: tarea,
      message: 'Tarea encontrada exitosamente'
    });

  } catch (error) {
    console.error('Error en GET /api/tareas/[id]:', error);

    // Devolver error al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo obtener la tarea'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tareas/[id]
 *
 * Actualiza una tarea existente parcialmente
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 🔒 VALIDACIÓN DE PERMISOS
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    const user = validarPermisos(token);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autorizado',
          message: 'Token de autenticación inválido o faltante'
        },
        { status: 401 }
      );
    }

    if (!puedeEditarRecursos(user)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permisos insuficientes',
          message: 'No tienes permisos para editar tareas'
        },
        { status: 403 }
      );
    }

    // Validar que se proporcione un ID
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID requerido',
          message: 'Se debe proporcionar un ID de tarea'
        },
        { status: 400 }
      );
    }

    // Leer el body de la petición (campos a actualizar)
    const updates: Partial<TareaCultivo> = await request.json();

    // Validar que no se intente cambiar el ID
    if ('id' in updates) {
      delete updates.id;
    }

    // Validar el título si se está actualizando
    if (updates.titulo !== undefined &&
        (typeof updates.titulo !== 'string' || updates.titulo.trim() === '')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: 'El título de la tarea debe ser una cadena de texto no vacía'
        },
        { status: 400 }
      );
    }

    // Leer la base de datos actual
    const database = readDatabase();

    // Buscar la tarea por ID
    const tareaIndex = database.tareas.findIndex(t => t.id === id);

    if (tareaIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tarea no encontrada',
          message: `No se encontró la tarea con ID: ${id}`
        },
        { status: 404 }
      );
    }

    // Aplicar las actualizaciones a la tarea existente
    const updatedTarea: TareaCultivo = {
      ...database.tareas[tareaIndex],
      ...updates,
      fechaActualizacion: new Date().toISOString().split('T')[0], // Actualizar fecha automáticamente
    };

    // Actualizar la tarea en el array
    database.tareas[tareaIndex] = updatedTarea;

    // Guardar los cambios en db.json
    writeDatabase(database);

    // Devolver respuesta exitosa con la tarea actualizada
    return NextResponse.json({
      success: true,
      data: updatedTarea,
      message: 'Tarea actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en PATCH /api/tareas/[id]:', error);

    // Verificar si es un error de JSON inválido
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: 'El formato de los datos enviados no es válido'
        },
        { status: 400 }
      );
    }

    // Devolver error al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar la tarea'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tareas/[id]
 *
 * Elimina una tarea existente
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 🔒 VALIDACIÓN DE PERMISOS
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    const user = validarPermisos(token);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autorizado',
          message: 'Token de autenticación inválido o faltante'
        },
        { status: 401 }
      );
    }

    if (!puedeEliminarTarea(user)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permisos insuficientes',
          message: 'Solo los administradores pueden eliminar tareas'
        },
        { status: 403 }
      );
    }

    // Validar que se proporcione un ID
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID requerido',
          message: 'Se debe proporcionar un ID de tarea'
        },
        { status: 400 }
      );
    }

    // Leer la base de datos actual
    const database = readDatabase();

    // Buscar la tarea por ID
    const tareaIndex = database.tareas.findIndex(t => t.id === id);

    if (tareaIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tarea no encontrada',
          message: `No se encontró la tarea con ID: ${id}`
        },
        { status: 404 }
      );
    }

    // Guardar la tarea antes de eliminarla (por si necesitamos rollback)
    const tareaToDelete = database.tareas[tareaIndex];

    // Eliminar la tarea del array
    database.tareas.splice(tareaIndex, 1);

    // Guardar los cambios en db.json
    writeDatabase(database);

    // Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      data: tareaToDelete,
      message: 'Tarea eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/tareas/[id]:', error);

    // Devolver error al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo eliminar la tarea'
      },
      { status: 500 }
    );
  }
}
