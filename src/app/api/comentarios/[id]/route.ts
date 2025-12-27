/**
 * API Route para comentarios individuales con MongoDB - Sistema Multi-tenant
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { withUserDB, connectToUserDB, getComentarioModel } from '@/lib/mongodb';

export const GET = withUserDB(async (request, userEmail) => {
  try {
    const connection = await connectToUserDB(userEmail);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ComentarioModel = getComentarioModel(connection) as any;

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    // Buscar comentario
    // 🔒 TODO: Verificar si necesitamos filtrar por 'creadoPor' aquí también o si los comentarios son públicos para el cultivo. 
    // Por ahora, al estar en DB única, SI necesitamos filtrar por autor O por cultivo que pertenezca al autor.
    // Asumiremos que el comentario tiene 'creadoPor' por consistencia.
    const comentario = await ComentarioModel.findOne({
      _id: id,
      creadoPor: userEmail // 🔒 FILTRO DE SEGURIDAD
    }).lean();

    if (!comentario) {
      return NextResponse.json({ success: false, error: 'Comentario no encontrado o no autorizado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...comentario, id: comentario._id.toString(), _id: undefined }
    });
  } catch (error) {
    console.error('Error en GET /api/comentarios/[id]:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
});

export const PATCH = withUserDB(async (request, userEmail) => {
  try {
    const connection = await connectToUserDB(userEmail);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ComentarioModel = getComentarioModel(connection) as any;

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const updates = await request.json();
    delete updates._id; delete updates.id;
    delete updates.creadoPor; // No permitir cambiar autor

    const comentario = await ComentarioModel.findOneAndUpdate(
      { _id: id, creadoPor: userEmail }, // 🔒 FILTRO DE SEGURIDAD
      { ...updates, fechaActualizacion: new Date().toISOString() },
      { new: true, runValidators: true, lean: true }
    );

    if (!comentario) {
      return NextResponse.json({ success: false, error: 'Comentario no encontrado o no autorizado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...comentario, id: comentario._id.toString(), _id: undefined }
    });
  } catch (error) {
    console.error('Error en PATCH /api/comentarios/[id]:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
});

export const DELETE = withUserDB(async (request, userEmail) => {
  try {
    const connection = await connectToUserDB(userEmail);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ComentarioModel = getComentarioModel(connection) as any;

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const comentario = await ComentarioModel.findOneAndDelete({
      _id: id,
      creadoPor: userEmail // 🔒 FILTRO DE SEGURIDAD
    }).lean();

    if (!comentario) {
      return NextResponse.json({ success: false, error: 'Comentario no encontrado o no autorizado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...comentario, id: comentario._id.toString(), _id: undefined }
    });
  } catch (error) {
    console.error('Error en DELETE /api/comentarios/[id]:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
});