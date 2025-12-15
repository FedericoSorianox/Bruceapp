/**
 * API Route para gestión de comentarios con MongoDB - Sistema Multi-tenant
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { withUserDB, connectToUserDB, getComentarioModel } from '@/lib/mongodb';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GET = withUserDB(async (request: Request, userEmail: string) => {
  try {
    // Conectar a la base de datos principal
    const connection = await connectToUserDB(userEmail);

    // Obtener el modelo Comentario específico para esta conexión
    const ComentarioModel = getComentarioModel(connection) as any;

    const url = new URL(request.url);
    const cultivoId = url.searchParams.get('cultivoId');
    const tipo = url.searchParams.get('tipo');
    const prioridad = url.searchParams.get('prioridad');
    const resuelto = url.searchParams.get('resuelto');
    const page = parseInt(url.searchParams.get('_page') || '1');
    const limit = parseInt(url.searchParams.get('_limit') || '50');

    // FILTRO DE SEGURIDAD: Solo comentarios creados por el usuario
    const query: Record<string, unknown> = {
      activo: true,
      creadoPor: userEmail // 🔒 Filtrar por creador
    };

    if (cultivoId) query.cultivoId = cultivoId;
    if (tipo) query.tipo = tipo;
    if (prioridad) query.prioridad = prioridad;
    if (resuelto !== null) query.resuelto = resuelto === 'true';

    const comentarios = await ComentarioModel.find(query)
      .sort({ fecha: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await ComentarioModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: comentarios,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error en GET /api/comentarios:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const POST = withUserDB(async (request: Request, userEmail: string) => {
  try {
    // Conectar a la base de datos principal
    const connection = await connectToUserDB(userEmail);

    // Obtener el modelo Comentario específico para esta conexión
    const ComentarioModel = getComentarioModel(connection) as any;

    const comentarioData = await request.json();
    const comentarioConFechas = {
      ...comentarioData,
      fecha: new Date().toISOString(),
      fechaActualizacion: undefined,
      resuelto: false,
      activo: true,
      destacado: false,
      numeroEdiciones: 0,
      creadoPor: userEmail // 🔒 Asignar creador automáticamente
    };

    const nuevoComentario = new ComentarioModel(comentarioConFechas);
    const comentarioGuardado = await nuevoComentario.save();

    return NextResponse.json({
      success: true,
      data: comentarioGuardado.toJSON(),
      message: 'Comentario creado exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/comentarios:', error);

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
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
});