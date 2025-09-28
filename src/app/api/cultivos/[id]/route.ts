/**
 * API Route para gestión de cultivos individuales
 *
 * Esta API maneja operaciones CRUD para cultivos específicos por ID.
 *
 * Endpoints:
 * - GET /api/cultivos/[id] - Obtiene un cultivo específico
 * - PATCH /api/cultivos/[id] - Actualiza un cultivo existente
 * - DELETE /api/cultivos/[id] - Elimina un cultivo
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Cultivo } from '@/types/cultivo';

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

// Función para verificar si el usuario puede eliminar cultivos
function puedeEliminarCultivo(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user?.role === 'admin';
}

// Función para verificar si el usuario puede editar recursos
function puedeEditarRecursos(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user !== null;
}

/**
 * Interfaz para representar una persona en la base de datos
 */
interface Person {
  name: string;
  number: string;
  id: string;
}

/**
 * Interfaz para una nota en la base de datos
 */
interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  date?: string;
  author?: string;
  priority?: string;
  hasImages?: boolean;
  cropArea?: string;
}

/**
 * Interfaz para el esquema completo de la base de datos
 */
interface DatabaseSchema {
  persons: Person[];
  sampleNotes: Note[];
  cultivos: Cultivo[];
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

    // Asegurar que existe el array de cultivos
    if (!database.cultivos) {
      database.cultivos = [];
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
 * GET /api/cultivos/[id]
 *
 * Obtiene un cultivo específico por su ID
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
          message: 'Se debe proporcionar un ID de cultivo'
        },
        { status: 400 }
      );
    }

    // Leer la base de datos actual
    const database = readDatabase();

    // Buscar el cultivo por ID
    const cultivo = database.cultivos.find(c => c.id === id);

    if (!cultivo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cultivo no encontrado',
          message: `No se encontró el cultivo con ID: ${id}`
        },
        { status: 404 }
      );
    }

    // Devolver respuesta exitosa con el cultivo encontrado
    return NextResponse.json({
      success: true,
      data: cultivo,
      message: 'Cultivo encontrado exitosamente'
    });

  } catch (error) {
    console.error('Error en GET /api/cultivos/[id]:', error);

    // Devolver error al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo obtener el cultivo'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cultivos/[id]
 *
 * Actualiza un cultivo existente parcialmente
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
          message: 'No tienes permisos para editar cultivos'
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
          message: 'Se debe proporcionar un ID de cultivo'
        },
        { status: 400 }
      );
    }

    // Leer el body de la petición (campos a actualizar)
    const updates: Partial<Cultivo> = await request.json();

    // Validar que no se intente cambiar el ID
    if ('id' in updates) {
      delete updates.id;
    }

    // Validar el nombre si se está actualizando
    if (updates.nombre !== undefined && 
        (typeof updates.nombre !== 'string' || updates.nombre.trim() === '')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: 'El nombre del cultivo debe ser una cadena de texto no vacía'
        },
        { status: 400 }
      );
    }

    // Leer la base de datos actual
    const database = readDatabase();

    // Buscar el cultivo por ID
    const cultivoIndex = database.cultivos.findIndex(c => c.id === id);

    if (cultivoIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cultivo no encontrado',
          message: `No se encontró el cultivo con ID: ${id}`
        },
        { status: 404 }
      );
    }

    // Aplicar las actualizaciones al cultivo existente
    const updatedCultivo: Cultivo = {
      ...database.cultivos[cultivoIndex],
      ...updates,
      fechaActualizacion: new Date().toISOString().split('T')[0], // Actualizar fecha automáticamente
    };

    // Actualizar el cultivo en el array
    database.cultivos[cultivoIndex] = updatedCultivo;

    // Guardar los cambios en db.json
    writeDatabase(database);

    // Devolver respuesta exitosa con el cultivo actualizado
    return NextResponse.json({
      success: true,
      data: updatedCultivo,
      message: 'Cultivo actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error en PATCH /api/cultivos/[id]:', error);

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
        message: 'No se pudo actualizar el cultivo'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cultivos/[id]
 *
 * Elimina un cultivo existente
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

    if (!puedeEliminarCultivo(user)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permisos insuficientes',
          message: 'Solo los administradores pueden eliminar cultivos'
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
          message: 'Se debe proporcionar un ID de cultivo'
        },
        { status: 400 }
      );
    }

    // Leer la base de datos actual
    const database = readDatabase();

    // Buscar el cultivo por ID
    const cultivoIndex = database.cultivos.findIndex(c => c.id === id);

    if (cultivoIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cultivo no encontrado',
          message: `No se encontró el cultivo con ID: ${id}`
        },
        { status: 404 }
      );
    }

    // Guardar el cultivo antes de eliminarlo (por si necesitamos rollback)
    const cultivoToDelete = database.cultivos[cultivoIndex];

    // Eliminar el cultivo del array
    database.cultivos.splice(cultivoIndex, 1);

    // Guardar los cambios en db.json
    writeDatabase(database);

    // Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      data: cultivoToDelete,
      message: 'Cultivo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/cultivos/[id]:', error);

    // Devolver error al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo eliminar el cultivo'
      },
      { status: 500 }
    );
  }
}
