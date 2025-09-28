/**
 * API Route para gestión de tareas de cultivo
 *
 * Esta API sirve como puente entre el frontend y los datos almacenados
 * en db.json. Proporciona operaciones CRUD para la gestión de tareas de cultivo.
 *
 * Endpoints:
 * - GET /api/tareas - Obtiene todas las tareas con filtros opcionales
 * - POST /api/tareas - Crea una nueva tarea
 */

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { TareaCultivo } from '@/types/planificacion';

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

// Función para verificar si el usuario puede crear tareas
function puedeCrearTarea(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user?.role === 'admin';
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
 * Interfaz para el esquema completo de la base de datos
 */
interface DatabaseSchema {
  persons: any[];
  sampleNotes: any[];
  cultivos: any[];
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
 * GET /api/tareas
 *
 * Obtiene todas las tareas desde db.json con soporte para búsqueda y filtros
 * Parámetros de query soportados:
 * - cultivoId: filtrar por cultivo específico
 * - tipo: filtrar por tipo de tarea
 * - estado: filtrar por estado de tarea
 * - prioridad: filtrar por prioridad
 * - fechaDesde: tareas desde esta fecha
 * - fechaHasta: tareas hasta esta fecha
 * - esRecurrente: filtrar por tareas recurrentes
 * - q: búsqueda full-text en título y descripción
 * - _sort: campo por el cual ordenar
 * - _order: dirección del ordenamiento (asc, desc)
 */
export async function GET(request: Request) {
  try {
    // Leer la base de datos
    const database = readDatabase();

    // Extraer las tareas
    const tareas = database.tareas || [];

    // Obtener parámetros de la URL
    const url = new URL(request.url);
    const cultivoId = url.searchParams.get('cultivoId');
    const tipo = url.searchParams.get('tipo');
    const estado = url.searchParams.get('estado');
    const prioridad = url.searchParams.get('prioridad');
    const fechaDesde = url.searchParams.get('fechaDesde');
    const fechaHasta = url.searchParams.get('fechaHasta');
    const esRecurrente = url.searchParams.get('esRecurrente');
    const searchQuery = url.searchParams.get('q');
    const sortBy = url.searchParams.get('_sort');
    const sortOrder = url.searchParams.get('_order');

    // Validar que las tareas tengan el formato correcto
    const validatedTareas = tareas.filter((tarea: TareaCultivo) => {
      return (
        tarea.id &&
        tarea.titulo &&
        typeof tarea.titulo === 'string'
      );
    });

    // Aplicar filtros
    let filteredTareas = validatedTareas;

    // Filtro por cultivo
    if (cultivoId) {
      filteredTareas = filteredTareas.filter((tarea: TareaCultivo) =>
        tarea.cultivoId === cultivoId
      );
    }

    // Filtro por tipo
    if (tipo) {
      filteredTareas = filteredTareas.filter((tarea: TareaCultivo) =>
        tarea.tipo === tipo
      );
    }

    // Filtro por estado
    if (estado) {
      filteredTareas = filteredTareas.filter((tarea: TareaCultivo) =>
        tarea.estado === estado
      );
    }

    // Filtro por prioridad
    if (prioridad) {
      filteredTareas = filteredTareas.filter((tarea: TareaCultivo) =>
        tarea.prioridad === prioridad
      );
    }

    // Filtro por fechas
    if (fechaDesde) {
      filteredTareas = filteredTareas.filter((tarea: TareaCultivo) =>
        tarea.fechaProgramada >= fechaDesde
      );
    }

    if (fechaHasta) {
      filteredTareas = filteredTareas.filter((tarea: TareaCultivo) =>
        tarea.fechaProgramada <= fechaHasta
      );
    }

    // Filtro por recurrentes
    if (esRecurrente !== null) {
      const recurrente = esRecurrente === 'true';
      filteredTareas = filteredTareas.filter((tarea: TareaCultivo) =>
        tarea.esRecurrente === recurrente
      );
    }

    // Aplicar búsqueda si hay query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTareas = filteredTareas.filter((tarea: TareaCultivo) => {
        return (
          tarea.titulo.toLowerCase().includes(query) ||
          (tarea.descripcion && tarea.descripcion.toLowerCase().includes(query))
        );
      });
    }

    // Aplicar ordenamiento
    if (sortBy && [
      'titulo', 'fechaProgramada', 'fechaCreacion', 'tipo', 'estado', 'prioridad'
    ].includes(sortBy)) {
      filteredTareas.sort((a: TareaCultivo, b: TareaCultivo) => {
        const aValue = a[sortBy as keyof TareaCultivo] || '';
        const bValue = b[sortBy as keyof TareaCultivo] || '';

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;

        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      data: filteredTareas,
      total: filteredTareas.length
    });

  } catch (error) {
    console.error('Error en GET /api/tareas:', error);

    // Devolver error al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron cargar las tareas'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tareas
 *
 * Crea una nueva tarea y la guarda en db.json
 */
export async function POST(request: Request) {
  try {
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

    if (!puedeCrearTarea(user)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permisos insuficientes',
          message: 'Solo los administradores pueden crear tareas'
        },
        { status: 403 }
      );
    }

    // Leer el body de la petición
    const newTarea: Omit<TareaCultivo, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'recordatorioEnviado'> = await request.json();

    // Validar campos obligatorios
    if (!newTarea.titulo || typeof newTarea.titulo !== 'string' || newTarea.titulo.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: 'El título de la tarea es obligatorio'
        },
        { status: 400 }
      );
    }

    if (!newTarea.cultivoId || typeof newTarea.cultivoId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: 'El ID del cultivo es obligatorio'
        },
        { status: 400 }
      );
    }

    if (!newTarea.fechaProgramada || typeof newTarea.fechaProgramada !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: 'La fecha programada es obligatoria'
        },
        { status: 400 }
      );
    }

    // Leer la base de datos actual
    const database = readDatabase();

    // Generar un ID único para la nueva tarea
    const newId = String(Date.now());

    // Crear la tarea completa con ID y campos automáticos
    const tareaToAdd: TareaCultivo = {
      id: newId,
      ...newTarea,
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaActualizacion: new Date().toISOString().split('T')[0],
      estado: newTarea.estado || 'pendiente',
      recordatorioEnviado: false,
    };

    // Agregar la nueva tarea al array
    if (!database.tareas) {
      database.tareas = [];
    }
    database.tareas = [...database.tareas, tareaToAdd];

    // Guardar los cambios en db.json
    writeDatabase(database);

    // Devolver respuesta exitosa con la tarea creada
    return NextResponse.json({
      success: true,
      data: tareaToAdd,
      message: 'Tarea creada exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/tareas:', error);

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
        message: 'No se pudo crear la tarea'
      },
      { status: 500 }
    );
  }
}
