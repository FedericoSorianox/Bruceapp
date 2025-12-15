/**
 * API Route para gestión de notas con MongoDB
 * Migración completa de JSON Server a Mongoose con búsqueda optimizada.
 */

import { NextResponse } from 'next/server';
import { withUserDB, connectToUserDB, getNotaModel } from '@/lib/mongodb';
import type { NotaDocument } from '@/lib/models';
import type { FilterQuery, Model } from 'mongoose';


/**
 * GET /api/notas - Lista notas desde la base de datos compartida filtrando por usuario
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withUserDB(async (request: Request, userEmail: string) => {
  try {
    // Obtener la conexión a la base de datos principal
    const connection = await connectToUserDB(userEmail);

    // Verificar si la conexión es válida (no es mock)
    if (connection.readyState === 99) {
      console.warn('⚠️ Conexión mock detectada - retornando datos vacíos');
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
        message: 'Base de datos no disponible temporalmente'
      });
    }

    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('q');
    const category = url.searchParams.get('category');
    // const author = url.searchParams.get('author'); // Ya no permitimos filtrar por cualquier autor
    const priority = url.searchParams.get('priority');
    const sort = url.searchParams.get('_sort') || 'date';
    const order = url.searchParams.get('_order') || 'desc';
    const page = parseInt(url.searchParams.get('_page') || '1');
    const limit = parseInt(url.searchParams.get('_limit') || '50');

    // FILTRO DE SEGURIDAD: Solo notas del usuario
    // Asumimos que el modelo Nota usa 'author' para el email del propietario
    const query: FilterQuery<NotaDocument> = {
      activo: true,
      author: userEmail // 🔒 FILTRO DE SEGURIDAD
    };

    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Obtener el modelo específico para esta conexión
    const NotaModel = getNotaModel(connection) as Model<NotaDocument>;

    // Campos válidos para ordenamiento (solo campos indexados y seguros)
    const validSortFields = ['title', 'date', 'category', 'priority', 'author', 'fechaCreacion', 'fechaActualizacion'];
    const safeSort = validSortFields.includes(sort) ? sort : 'date';

    // Construir el objeto de ordenamiento dinámicamente con campo validado
    const sortOrder: Record<string, 1 | -1> = {};
    sortOrder[safeSort] = order === 'desc' ? -1 : 1;

    let notasQuery;

    try {
      if (searchQuery) {
        notasQuery = NotaModel.find(
          { ...query, $text: { $search: searchQuery } },
          { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' }, ...sortOrder });
      } else {
        notasQuery = NotaModel.find(query).sort(sortOrder);
      }

      const notas = await notasQuery
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await NotaModel.countDocuments(searchQuery ? { ...query, $text: { $search: searchQuery } } : query);

      return NextResponse.json({
        success: true,
        data: notas,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });

    } catch (queryError) {
      console.error('Error en consulta de notas:', queryError);
      return NextResponse.json(
        { success: false, error: 'Error en consulta de base de datos', message: 'No se pudieron consultar las notas' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error en GET /api/notas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor', message: 'No se pudieron cargar las notas' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/notas - Crea nueva nota en la base de datos compartida
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = withUserDB(async (request: Request, userEmail: string) => {
  try {
    // Obtener la conexión a la base de datos principal
    const connection = await connectToUserDB(userEmail);

    // Verificar si la conexión es válida (no es mock)
    if (connection.readyState === 99) {
      return NextResponse.json(
        { success: false, error: 'Base de datos no disponible', message: 'La base de datos no está disponible temporalmente' },
        { status: 503 }
      );
    }

    const notaData = await request.json();
    const notaConFechas = {
      ...notaData,
      date: notaData.date || new Date().toISOString().split('T')[0],
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaActualizacion: new Date().toISOString().split('T')[0],
      author: userEmail // 🔒 Forzar autor al usuario autenticado
    };

    // Obtener el modelo específico para esta conexión
    const NotaModel = getNotaModel(connection) as Model<NotaDocument>;

    const nuevaNota = new NotaModel(notaConFechas);
    const notaGuardada = await nuevaNota.save();

    return NextResponse.json({
      success: true,
      data: notaGuardada.toJSON(),
      message: 'Nota creada exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/notas:', error);

    // Type guard para verificar si es un error de validación de Mongoose
    const isValidationError = (err: unknown): err is { name: string; errors: Record<string, { message: string }> } => {
      return typeof err === 'object' && err !== null && 'name' in err && 'errors' in err;
    };

    if (isValidationError(error) && error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Error interno del servidor', message: 'No se pudo crear la nota' },
      { status: 500 }
    );
  }
});