/**
 * API Route para notas individuales con MongoDB
 * 
 * Operaciones CRUD para notas específicas por ID usando Mongoose.
 * Seguridad reforzada para arquitectura multi-tenant de base de datos única.
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { withUserDB, connectToUserDB, getNotaModel } from '@/lib/mongodb';

/**
 * GET /api/notas/[id] - Obtiene nota específica verificando propiedad
 */
export const GET = withUserDB(async (request, userEmail) => {
  try {
    const connection = await connectToUserDB(userEmail);
    const NotaModel = getNotaModel(connection) as any;

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    // Buscar nota por ID Y autor (seguridad)
    const nota = await NotaModel.findOne({
      _id: id,
      author: userEmail // 🔒 FILTRO DE SEGURIDAD
    }).lean();

    if (!nota) {
      return NextResponse.json({ success: false, error: 'Nota no encontrada o no autorizada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...nota, id: nota._id.toString(), _id: undefined }
    });
  } catch (error) {
    console.error('Error en GET /api/notas/[id]:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
});

/**
 * PATCH /api/notas/[id] - Actualiza nota específica verificando propiedad
 */
export const PATCH = withUserDB(async (request, userEmail) => {
  try {
    const connection = await connectToUserDB(userEmail);
    const NotaModel = getNotaModel(connection) as any;

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    const updates = await request.json();
    delete updates._id; delete updates.id;
    delete updates.author; // No permitir cambiar autor

    const updatesConAuditoria = {
      ...updates,
      fechaActualizacion: new Date().toISOString().split('T')[0]
    };

    // Actualizar SOLO si pertenece al usuario
    const nota = await NotaModel.findOneAndUpdate(
      { _id: id, author: userEmail }, // 🔒 FILTRO DE SEGURIDAD
      updatesConAuditoria,
      { new: true, runValidators: true, lean: true }
    );

    if (!nota) {
      return NextResponse.json({ success: false, error: 'Nota no encontrada o no autorizada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...nota, id: nota._id.toString(), _id: undefined }
    });
  } catch (error) {
    console.error('Error en PATCH /api/notas/[id]:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
});

/**
 * DELETE /api/notas/[id] - Elimina nota específica verificando propiedad
 */
export const DELETE = withUserDB(async (request, userEmail) => {
  try {
    const connection = await connectToUserDB(userEmail);
    const NotaModel = getNotaModel(connection) as any;

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 });
    }

    // Eliminar SOLO si pertenece al usuario
    const nota = await NotaModel.findOneAndDelete({
      _id: id,
      author: userEmail // 🔒 FILTRO DE SEGURIDAD
    }).lean();

    if (!nota) {
      return NextResponse.json({ success: false, error: 'Nota no encontrada o no autorizada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...nota, id: nota._id.toString(), _id: undefined }
    });
  } catch (error) {
    console.error('Error en DELETE /api/notas/[id]:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
});