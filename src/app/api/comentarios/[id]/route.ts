/**
 * API Route para comentarios individuales con MongoDB - Sistema Multi-tenant
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { withUserDB, connectToUserDB, getComentarioModel } from '@/lib/mongodb';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return withUserDB(async (req: Request, userEmail: string, mongooseInstance?: mongoose.Mongoose) => {
    try {
      // Conectar a la base de datos específica del usuario
      const userConnection = await connectToUserDB(userEmail);

      // Obtener el modelo Comentario específico para esta conexión
      const ComentarioModel = getComentarioModel(userConnection);
    
      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
      }

      const comentario = await ComentarioModel.findById(params.id).lean();
      if (!comentario) {
        return NextResponse.json({ success: false, error: 'Comentario no encontrado' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: { ...comentario, id: comentario._id.toString(), _id: undefined }
      });
    } catch (error) {
      console.error('Error en GET /api/comentarios/[id]:', error);
      return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
  })(request, { params });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return withUserDB(async (req: Request, userEmail: string, mongooseInstance?: mongoose.Mongoose) => {
    try {
      // Conectar a la base de datos específica del usuario
      const userConnection = await connectToUserDB(userEmail);

      // Obtener el modelo Comentario específico para esta conexión
      const ComentarioModel = getComentarioModel(userConnection);

      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
      }

      const updates = await req.json();
      delete updates._id; delete updates.id;

      const comentario = await ComentarioModel.findByIdAndUpdate(
        params.id,
        { ...updates, fechaActualizacion: new Date().toISOString() },
        { new: true, runValidators: true, lean: true }
      );

      if (!comentario) {
        return NextResponse.json({ success: false, error: 'Comentario no encontrado' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: { ...comentario, id: comentario._id.toString(), _id: undefined }
      });
    } catch (error) {
      console.error('Error en PATCH /api/comentarios/[id]:', error);
      return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
  })(request, { params });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return withUserDB(async (req: Request, userEmail: string, mongooseInstance?: mongoose.Mongoose) => {
    try {
      // Conectar a la base de datos específica del usuario
      const userConnection = await connectToUserDB(userEmail);

      // Obtener el modelo Comentario específico para esta conexión
      const ComentarioModel = getComentarioModel(userConnection);

      if (!mongoose.Types.ObjectId.isValid(params.id)) {
        return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
      }

      const comentario = await ComentarioModel.findByIdAndDelete(params.id).lean();
      if (!comentario) {
        return NextResponse.json({ success: false, error: 'Comentario no encontrado' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: { ...comentario, id: comentario._id.toString(), _id: undefined }
      });
    } catch (error) {
      console.error('Error en DELETE /api/comentarios/[id]:', error);
      return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
  })(request, { params });
}