/**
 * API Route para gestión de cultivos
 * 
 * Esta API sirve como puente entre el frontend y los datos almacenados
 * en db.json. Proporciona operaciones CRUD para la gestión de cultivos.
 * 
 * Endpoints:
 * - GET /api/cultivos - Obtiene todos los cultivos con filtros opcionales
 * - POST /api/cultivos - Crea un nuevo cultivo
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

// Función para verificar si el usuario puede crear cultivos
function puedeCrearCultivo(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user?.role === 'admin';
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
 * GET /api/cultivos
 *
 * Obtiene todos los cultivos desde db.json con soporte para búsqueda y ordenamiento
 * Parámetros de query soportados:
 * - q: búsqueda full-text en nombre, genética, sustrato, notas
 * - _sort: campo por el cual ordenar (nombre, fechaComienzo, metrosCuadrados, etc.)
 * - _order: dirección del ordenamiento (asc, desc)
 * - activo: filtrar por cultivos activos (true/false)
 * Incluye manejo de errores y validación de datos
 */
export async function GET(request: Request) {
  try {
    // Leer la base de datos
    const database = readDatabase();

    // Extraer los cultivos
    const cultivos = database.cultivos || [];

    // Obtener parámetros de la URL
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('q');
    const sortBy = url.searchParams.get('_sort');
    const sortOrder = url.searchParams.get('_order');
    const activoFilter = url.searchParams.get('activo');

    // Validar que los cultivos tengan el formato correcto (solo campos obligatorios)
    const validatedCultivos = cultivos.filter((cultivo: Cultivo) => {
      return (
        cultivo.id &&
        cultivo.nombre &&
        typeof cultivo.nombre === 'string'
      );
    });

    // Aplicar búsqueda si hay query
    let filteredCultivos = validatedCultivos;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredCultivos = validatedCultivos.filter((cultivo: Cultivo) => {
        return (
          cultivo.nombre.toLowerCase().includes(query) ||
          (cultivo.genetica && cultivo.genetica.toLowerCase().includes(query)) ||
          (cultivo.sustrato && cultivo.sustrato.toLowerCase().includes(query)) ||
          (cultivo.notas && cultivo.notas.toLowerCase().includes(query))
        );
      });
    }

    // Aplicar filtro por estado activo
    if (activoFilter !== null) {
      const isActivo = activoFilter === 'true';
      filteredCultivos = filteredCultivos.filter((cultivo: Cultivo) => {
        return cultivo.activo === isActivo;
      });
    }

    // Aplicar ordenamiento
    if (sortBy && ['nombre', 'fechaComienzo', 'metrosCuadrados', 'numeroplantas', 'fechaCreacion'].includes(sortBy)) {
      filteredCultivos.sort((a: Cultivo, b: Cultivo) => {
        const aValue = a[sortBy as keyof Cultivo] || '';
        const bValue = b[sortBy as keyof Cultivo] || '';

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;

        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      data: filteredCultivos,
      total: filteredCultivos.length
    });

  } catch (error) {
    console.error('Error en GET /api/cultivos:', error);

    // Devolver error al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron cargar los cultivos'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cultivos
 *
 * Crea un nuevo cultivo y lo guarda en db.json
 */
export async function POST(request: Request) {
  try {
    // 🔒 VALIDACIÓN DE PERMISOS
    // Verificar token de autenticación
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

    if (!puedeCrearCultivo(user)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permisos insuficientes',
          message: 'Solo los administradores pueden crear cultivos'
        },
        { status: 403 }
      );
    }

    // Leer el body de la petición
    const newCultivo: Omit<Cultivo, 'id'> = await request.json();

    // Validar campos obligatorios
    if (!newCultivo.nombre || typeof newCultivo.nombre !== 'string' || newCultivo.nombre.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: 'El nombre del cultivo es obligatorio'
        },
        { status: 400 }
      );
    }

    // Leer la base de datos actual
    const database = readDatabase();

    // Generar un ID único para el nuevo cultivo
    const newId = String(Date.now());

    // Crear el cultivo completo con ID y campos automáticos
    const cultivoToAdd: Cultivo = {
      id: newId,
      ...newCultivo,
      fechaCreacion: newCultivo.fechaCreacion || new Date().toISOString().split('T')[0],
      activo: newCultivo.activo ?? true, // Por defecto activo
    };

    // Agregar el nuevo cultivo al array
    if (!database.cultivos) {
      database.cultivos = [];
    }
    database.cultivos = [...database.cultivos, cultivoToAdd];

    // Guardar los cambios en db.json
    writeDatabase(database);

    // Devolver respuesta exitosa con el cultivo creado
    return NextResponse.json({
      success: true,
      data: cultivoToAdd,
      message: 'Cultivo creado exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/cultivos:', error);

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
        message: 'No se pudo crear el cultivo'
      },
      { status: 500 }
    );
  }
}
