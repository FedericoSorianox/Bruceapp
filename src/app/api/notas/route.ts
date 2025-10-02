/**
 * API Route para gestión de notas con MongoDB
 * Migración completa de JSON Server a Mongoose con búsqueda optimizada.
 */

import { NextResponse } from 'next/server';
import { withUserDB, connectToUserDB, getNotaModel } from '@/lib/mongodb';
import type { NotaDocument } from '@/lib/models';
import type { FilterQuery, Model } from 'mongoose';


/**
 * GET /api/notas - Lista notas desde la base de datos específica del usuario
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withUserDB(async (request: Request, userEmail: string) => {
  try {
    // Obtener la conexión específica del usuario
    const connection = await connectToUserDB(userEmail);

    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('q');
    const category = url.searchParams.get('category');
    const author = url.searchParams.get('author');
    const priority = url.searchParams.get('priority');
    const page = parseInt(url.searchParams.get('_page') || '1');
    const limit = parseInt(url.searchParams.get('_limit') || '50');

    const query: FilterQuery<NotaDocument> = { activo: true };

    if (category) query.category = category;
    if (author) query.author = { $regex: author, $options: 'i' };
    if (priority) query.priority = priority;

    // Obtener el modelo específico para esta conexión
    const NotaModel = getNotaModel(connection) as Model<NotaDocument>;

    let notasQuery;

    if (searchQuery) {
      notasQuery = NotaModel.find(
        { ...query, $text: { $search: searchQuery } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' }, date: -1 });
    } else {
      notasQuery = NotaModel.find(query).sort({ date: -1 });
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

  } catch (error) {
    console.error('Error en GET /api/notas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor', message: 'No se pudieron cargar las notas' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/notas - Crea nueva nota en la base de datos del usuario
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = withUserDB(async (request: Request, userEmail: string) => {
  try {
    // Obtener la conexión específica del usuario
    const connection = await connectToUserDB(userEmail);

    const notaData = await request.json();
    const notaConFechas = {
      ...notaData,
      date: notaData.date || new Date().toISOString().split('T')[0],
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaActualizacion: new Date().toISOString().split('T')[0],
      author: notaData.author || userEmail
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