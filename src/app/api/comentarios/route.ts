/**
 * API Route para gestión de comentarios con MongoDB
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Comentario } from '@/lib/models';

export async function GET(request: Request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const cultivoId = url.searchParams.get('cultivoId');
    const tipo = url.searchParams.get('tipo');
    const prioridad = url.searchParams.get('prioridad');
    const resuelto = url.searchParams.get('resuelto');
    const page = parseInt(url.searchParams.get('_page') || '1');
    const limit = parseInt(url.searchParams.get('_limit') || '50');

    let query: any = { activo: true };
    if (cultivoId) query.cultivoId = cultivoId;
    if (tipo) query.tipo = tipo;
    if (prioridad) query.prioridad = prioridad;
    if (resuelto !== null) query.resuelto = resuelto === 'true';

    const comentarios = await Comentario.find(query)
      .sort({ fecha: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Comentario.countDocuments(query);

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
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const comentarioData = await request.json();
    const comentarioConFechas = {
      ...comentarioData,
      fecha: new Date().toISOString(),
      fechaActualizacion: undefined,
      resuelto: false,
      activo: true,
      destacado: false,
      numeroEdiciones: 0
    };

    const nuevoComentario = new Comentario(comentarioConFechas);
    const comentarioGuardado = await nuevoComentario.save();

    return NextResponse.json({
      success: true,
      data: comentarioGuardado.toJSON(),
      message: 'Comentario creado exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/comentarios:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
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
}