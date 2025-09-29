/**
 * API Route para notas individuales con MongoDB
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Nota } from '@/lib/models';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const nota = await Nota.findById(params.id).lean();
    if (!nota) {
      return NextResponse.json({ success: false, error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...nota, id: nota._id.toString(), _id: undefined }
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

    const nota = await Nota.findByIdAndUpdate(
      params.id,
      { ...updates, fechaActualizacion: new Date().toISOString().split('T')[0] },
      { new: true, runValidators: true, lean: true }
    );

    if (!nota) {
      return NextResponse.json({ success: false, error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...nota, id: nota._id.toString(), _id: undefined }
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

    const nota = await Nota.findByIdAndDelete(params.id).lean();
    if (!nota) {
      return NextResponse.json({ success: false, error: 'Nota no encontrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...nota, id: nota._id.toString(), _id: undefined }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}