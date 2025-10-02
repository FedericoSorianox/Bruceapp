/**
 * API Route para comentarios individuales con MongoDB
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Comentario from '@/lib/models/Comentario';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const comentario = await Comentario.findById(params.id).lean();
    if (!comentario) {
      return NextResponse.json({ success: false, error: 'Comentario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...comentario, id: comentario._id.toString(), _id: undefined }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const updates = await request.json();
    delete updates._id; delete updates.id;

    const comentario = await Comentario.findByIdAndUpdate(
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
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const comentario = await Comentario.findByIdAndDelete(params.id).lean();
    if (!comentario) {
      return NextResponse.json({ success: false, error: 'Comentario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...comentario, id: comentario._id.toString(), _id: undefined }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}