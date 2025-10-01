/**
 * API Route para gestión de tareas individuales con MongoDB
 * 
 * Operaciones CRUD para tareas específicas por ID usando Mongoose.
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Tarea } from '@/lib/models';
import jwt from 'jsonwebtoken';

/**
 * 🔐 JWT CONFIGURATION
 * JWT secret for token verification (must match frontend)
 */
const JWT_SECRET = process.env.JWT_SECRET || 'bruce-app-development-secret-key-2024';

/**
 * 🔍 Función para validar permisos desde token JWT
 * Extrae la información del usuario del token JWT válido
 */
function validarPermisos(token: string | null): { email: string; role: 'admin' | 'user' } | null {
  if (!token) return null;

  try {
    // 🔐 Validar y decodificar token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      role: 'admin' | 'user';
      exp: number;
    };

    // ✅ Verificar que el token no haya expirado
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      console.warn('🚨 Token JWT expirado');
      return null;
    }

    // ✅ Verificar que el token contenga datos válidos
    if (decoded.email && decoded.role) {
      return { email: decoded.email, role: decoded.role };
    }

    console.warn('🚨 Token JWT con datos inválidos');
    return null;

  } catch (error) {
    // 🛡️ Manejo de tokens JWT inválidos o corruptos
    console.error('🚨 Error al validar token JWT:', error);
    return null;
  }
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

    // Interface para errores de validación de Mongoose
    interface MongooseValidationError {
      message: string;
    }

    if (isValidationError(error) && error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: MongooseValidationError) => err.message);
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