/**
 * API Route para gestión de tareas individuales con MongoDB
 * 
 * Operaciones CRUD para tareas específicas por ID usando Mongoose.
 * Seguridad reforzada para arquitectura multi-tenant de base de datos única.
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { withUserDB, connectToUserDB, getTareaModel } from '@/lib/mongodb';

/**
 * GET /api/tareas/[id] - Obtiene tarea específica verificando propiedad
 */
export const GET = withUserDB(async (request, userEmail) => {
  try {
    const connection = await connectToUserDB(userEmail);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const TareaModel = getTareaModel(connection) as any;

    // Extraer ID desde la URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido', message: 'El ID proporcionado no es válido' },
        { status: 400 }
      );
    }

    // Buscar tarea por ID Y usuario creador
    const tarea = await TareaModel.findOne({
      _id: id,
      creadoPor: userEmail // 🔒 FILTRO DE SEGURIDAD
    }).lean();

    if (!tarea) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada', message: `No se encontró la tarea o no tienes permisos` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...tarea, id: tarea._id.toString(), _id: undefined },
      message: 'Tarea encontrada exitosamente'
    });

  } catch (error) {
    console.error('Error en GET /api/tareas/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor', message: 'No se pudo obtener la tarea' },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/tareas/[id] - Actualiza tarea específica verificando propiedad
 */
export const PATCH = withUserDB(async (request, userEmail) => {
  try {
    const connection = await connectToUserDB(userEmail);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const TareaModel = getTareaModel(connection) as any;

    // Extraer ID desde la URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido', message: 'El ID proporcionado no es válido' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    delete updates._id;
    delete updates.id;
    delete updates.creadoPor; // No permitir cambiar el creador

    const updatesConAuditoria = {
      ...updates,
      fechaActualizacion: new Date().toISOString().split('T')[0],
      editadoPor: userEmail
    };

    // Actualizar SOLO si pertenece al usuario
    const tareaActualizada = await TareaModel.findOneAndUpdate(
      { _id: id, creadoPor: userEmail }, // 🔒 FILTRO DE SEGURIDAD
      updatesConAuditoria,
      { new: true, runValidators: true, lean: true }
    );

    if (!tareaActualizada) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada', message: `No se encontró la tarea o no tienes permisos` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...tareaActualizada, id: tareaActualizada._id.toString(), _id: undefined },
      message: 'Tarea actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en PATCH /api/tareas/[id]:', error);

    // Type guard para verificar si es un error de validación de Mongoose
    const isValidationError = (err: unknown): err is { name: string; errors: Record<string, { message: string }> } => {
      return typeof err === 'object' && err !== null && 'name' in err && 'errors' in err;
    };

    if (isValidationError(error) && error.name === 'ValidationError') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', message: 'Errores de validación', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Error interno del servidor', message: 'No se pudo actualizar la tarea' },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/tareas/[id] - Elimina tarea específica verificando propiedad
 */
export const DELETE = withUserDB(async (request, userEmail) => {
  try {
    const connection = await connectToUserDB(userEmail);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const TareaModel = getTareaModel(connection) as any;

    // Extraer ID desde la URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido', message: 'El ID proporcionado no es válido' },
        { status: 400 }
      );
    }

    // Eliminar SOLO si pertenece al usuario
    const tareaEliminada = await TareaModel.findOneAndDelete({
      _id: id,
      creadoPor: userEmail // 🔒 FILTRO DE SEGURIDAD
    }).lean();

    if (!tareaEliminada) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada', message: `No se encontró la tarea o no tienes permisos` },
        { status: 404 }
      );
    }

    console.log(`🗑️ Tarea eliminada por ${userEmail}:`, {
      id: tareaEliminada._id,
      titulo: tareaEliminada.titulo,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: { ...tareaEliminada, id: tareaEliminada._id.toString(), _id: undefined },
      message: 'Tarea eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/tareas/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor', message: 'No se pudo eliminar la tarea' },
      { status: 500 }
    );
  }
});