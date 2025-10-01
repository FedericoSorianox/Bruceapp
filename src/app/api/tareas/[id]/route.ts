/**
 * API Route para gestión de tareas individuales con MongoDB
 * 
 * Operaciones CRUD para tareas específicas por ID usando Mongoose.
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Tarea } from '@/lib/models';

// Funciones de permisos reutilizadas
function validarPermisos(token: string | null): { email: string; role: 'admin' | 'user' } | null {
  if (!token) return null;

  // Para desarrollo: aceptar tokens fake
  if (token.startsWith('fake-')) {
    const email = token.replace('fake-', '');
    const role: 'admin' | 'user' = email === 'admin@bruce.app' ? 'admin' : 'user';
    return { email, role };
  }

  // TODO: Implementar validación JWT real para producción
  return null;
}

function puedeEliminarTarea(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user?.role === 'admin';
}

function puedeEditarRecursos(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user !== null;
}

/**
 * GET /api/tareas/[id] - Obtiene tarea específica
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido', message: 'El ID proporcionado no es válido' },
        { status: 400 }
      );
    }

    const tarea = await Tarea.findById(id).lean();
    if (!tarea) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada', message: `No se encontró la tarea con ID: ${id}` },
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
}

/**
 * PATCH /api/tareas/[id] - Actualiza tarea específica
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const { id } = params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    const user = validarPermisos(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado', message: 'Token de autenticación inválido' },
        { status: 401 }
      );
    }

    if (!puedeEditarRecursos(user)) {
      return NextResponse.json(
        { success: false, error: 'Permisos insuficientes', message: 'No tienes permisos para editar tareas' },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido', message: 'El ID proporcionado no es válido' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    delete updates._id;
    delete updates.id;

    const updatesConAuditoria = {
      ...updates,
      fechaActualizacion: new Date().toISOString().split('T')[0],
      editadoPor: user.email
    };

    const tareaActualizada = await Tarea.findByIdAndUpdate(
      id,
      updatesConAuditoria,
      { new: true, runValidators: true, lean: true }
    );

    if (!tareaActualizada) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada', message: `No se encontró la tarea con ID: ${id}` },
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
}

/**
 * DELETE /api/tareas/[id] - Elimina tarea específica
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const { id } = params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    const user = validarPermisos(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado', message: 'Token de autenticación inválido' },
        { status: 401 }
      );
    }

    if (!puedeEliminarTarea(user)) {
      return NextResponse.json(
        { success: false, error: 'Permisos insuficientes', message: 'Solo administradores pueden eliminar tareas' },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido', message: 'El ID proporcionado no es válido' },
        { status: 400 }
      );
    }

    const tareaEliminada = await Tarea.findByIdAndDelete(id).lean();

    if (!tareaEliminada) {
      return NextResponse.json(
        { success: false, error: 'Tarea no encontrada', message: `No se encontró la tarea con ID: ${id}` },
        { status: 404 }
      );
    }

    console.log(`🗑️ Tarea eliminada por ${user.email}:`, {
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
}