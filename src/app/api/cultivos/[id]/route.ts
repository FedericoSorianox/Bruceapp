/**
 * API Route para gestión de cultivos individuales con MongoDB
 *
 * Esta API maneja operaciones CRUD para cultivos específicos por ID usando Mongoose.
 * Proporciona validaciones automáticas del esquema y manejo optimizado de errores.
 *
 * Endpoints:
 * - GET /api/cultivos/[id] - Obtiene un cultivo específico
 * - PATCH /api/cultivos/[id] - Actualiza un cultivo existente
 * - DELETE /api/cultivos/[id] - Elimina un cultivo
 * 
 * Características:
 * - Validación automática de ObjectId de MongoDB
 * - Validaciones de esquema con Mongoose
 * - Auditoría de cambios
 * - Manejo optimizado de errores de base de datos
 */

import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Cultivo } from '@/lib/models';

// Función para validar permisos desde token (simulación)
function validarPermisos(token: string | null): { email: string; role: 'admin' | 'user' } | null {
  if (!token || !token.startsWith('fake-')) return null;

  try {
    const decoded = atob(token.replace('fake-', ''));
    const role: 'admin' | 'user' = decoded === 'admin@bruce.app' ? 'admin' : 'user';
    return { email: decoded, role };
  } catch {
    return null;
  }
}

// Función para verificar si el usuario puede eliminar cultivos
function puedeEliminarCultivo(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user?.role === 'admin';
}

// Función para verificar si el usuario puede editar recursos
function puedeEditarRecursos(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user !== null;
}

/**
 * Helper para validar ObjectId de MongoDB
 * @param id - ID a validar
 * @returns true si es un ObjectId válido
 */
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * GET /api/cultivos/[id]
 *
 * Obtiene un cultivo específico por su ID desde MongoDB
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Conectar a MongoDB
    await connectDB();

    const { id } = params;

    // Validar que se proporcione un ID
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID requerido',
          message: 'Se debe proporcionar un ID de cultivo'
        },
        { status: 400 }
      );
    }

    // Validar formato de ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID inválido',
          message: 'El ID proporcionado no tiene un formato válido'
        },
        { status: 400 }
      );
    }

    // Buscar el cultivo por ID en MongoDB
    const cultivo = await Cultivo.findById(id).lean();

    if (!cultivo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cultivo no encontrado',
          message: `No se encontró el cultivo con ID: ${id}`
        },
        { status: 404 }
      );
    }

    // Convertir _id a id para compatibilidad
    const cultivoTransformado = {
      ...cultivo,
      id: cultivo._id.toString(),
      _id: undefined
    };

    // Devolver respuesta exitosa con el cultivo encontrado
    return NextResponse.json({
      success: true,
      data: cultivoTransformado,
      message: 'Cultivo encontrado exitosamente'
    });

  } catch (error) {
    console.error('Error en GET /api/cultivos/[id]:', error);

    // Type guard para verificar si es un error de MongoDB
    const isMongoError = (err: unknown): err is { name: string } => {
      return typeof err === 'object' && err !== null && 'name' in err;
    };

    // Type guard para verificar si es un error de Cast de MongoDB
    const isCastError = (err: unknown): err is { name: string; path: string; message: string } => {
      return typeof err === 'object' && err !== null && 'name' in err && 'path' in err && 'message' in err;
    };

    // Manejo específico de errores de MongoDB
    if (isCastError(error) && error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          error: 'ID inválido',
          message: 'El ID proporcionado no es válido'
        },
        { status: 400 }
      );
    }

    // Error de conexión a base de datos
    if (isMongoError(error) && (error.name === 'MongoError' || error.name === 'MongooseError')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error de base de datos',
          message: 'No se pudo conectar a la base de datos'
        },
        { status: 503 }
      );
    }

    // Devolver error genérico al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo obtener el cultivo'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cultivos/[id]
 *
 * Actualiza un cultivo existente parcialmente en MongoDB
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Conectar a MongoDB
    await connectDB();

    const { id } = params;

    // 🔒 VALIDACIÓN DE PERMISOS
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    const user = validarPermisos(token);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autorizado',
          message: 'Token de autenticación inválido o faltante'
        },
        { status: 401 }
      );
    }

    if (!puedeEditarRecursos(user)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permisos insuficientes',
          message: 'No tienes permisos para editar cultivos'
        },
        { status: 403 }
      );
    }

    // Validar que se proporcione un ID
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID requerido',
          message: 'Se debe proporcionar un ID de cultivo'
        },
        { status: 400 }
      );
    }

    // Validar formato de ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID inválido',
          message: 'El ID proporcionado no tiene un formato válido'
        },
        { status: 400 }
      );
    }

    // Leer el body de la petición (campos a actualizar)
    const updates = await request.json();

    // Validar que no se intente cambiar campos no permitidos
    const camposNoPermitidos = ['_id', 'id'];
    camposNoPermitidos.forEach(campo => {
      if (campo in updates) {
        delete updates[campo];
      }
    });

    // Agregar auditoría automáticamente
    const updatesConAuditoria = {
      ...updates,
      fechaActualizacion: new Date().toISOString().split('T')[0],
      editadoPor: user.email, // 🔒 Auditoría: registrar quién editó
    };

    // Actualizar el cultivo en MongoDB con validaciones automáticas
    const cultivoActualizado = await Cultivo.findByIdAndUpdate(
      id,
      updatesConAuditoria,
      { 
        new: true, // Retornar el documento actualizado
        runValidators: true, // Ejecutar validaciones del esquema
        lean: true // Mejor performance
      }
    );

    if (!cultivoActualizado) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cultivo no encontrado',
          message: `No se encontró el cultivo con ID: ${id}`
        },
        { status: 404 }
      );
    }

    // Convertir _id a id para compatibilidad
    const cultivoTransformado = {
      ...cultivoActualizado,
      id: cultivoActualizado._id.toString(),
      _id: undefined
    };

    // Devolver respuesta exitosa con el cultivo actualizado
    return NextResponse.json({
      success: true,
      data: cultivoTransformado,
      message: 'Cultivo actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error en PATCH /api/cultivos/[id]:', error);

    // Type guard para verificar si es un error de validación de Mongoose
    const isValidationError = (err: unknown): err is { name: string; errors: Record<string, { message: string }> } => {
      return typeof err === 'object' && err !== null && 'name' in err && 'errors' in err;
    };

    // Type guard para verificar si es un error de MongoDB
    const isMongoError = (err: unknown): err is { name: string } => {
      return typeof err === 'object' && err !== null && 'name' in err;
    };

    // Type guard para verificar si es un error de Cast de MongoDB
    const isCastError = (err: unknown): err is { name: string; path: string; message: string } => {
      return typeof err === 'object' && err !== null && 'name' in err && 'path' in err && 'message' in err;
    };

    // Manejar errores de validación de Mongoose
    if (isValidationError(error) && error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: 'Errores de validación',
          details: validationErrors
        },
        { status: 400 }
      );
    }

    // Manejo de errores de tipo de datos
    if (isCastError(error) && error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: `Error en el campo ${error.path}: ${error.message}`
        },
        { status: 400 }
      );
    }

    // Verificar si es un error de JSON inválido
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: 'El formato de los datos enviados no es válido'
        },
        { status: 400 }
      );
    }

    // Error de conexión a base de datos
    if (isMongoError(error) && (error.name === 'MongoError' || error.name === 'MongooseError')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error de base de datos',
          message: 'No se pudo conectar a la base de datos'
        },
        { status: 503 }
      );
    }

    // Devolver error genérico al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar el cultivo'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cultivos/[id]
 *
 * Elimina un cultivo existente de MongoDB
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Conectar a MongoDB
    await connectDB();

    const { id } = params;

    // 🔒 VALIDACIÓN DE PERMISOS
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    const user = validarPermisos(token);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autorizado',
          message: 'Token de autenticación inválido o faltante'
        },
        { status: 401 }
      );
    }

    if (!puedeEliminarCultivo(user)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permisos insuficientes',
          message: 'Solo los administradores pueden eliminar cultivos'
        },
        { status: 403 }
      );
    }

    // Validar que se proporcione un ID
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID requerido',
          message: 'Se debe proporcionar un ID de cultivo'
        },
        { status: 400 }
      );
    }

    // Validar formato de ObjectId
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID inválido',
          message: 'El ID proporcionado no tiene un formato válido'
        },
        { status: 400 }
      );
    }

    // TODO: Aquí deberías verificar si hay datos relacionados antes de eliminar
    // Por ejemplo, tareas, comentarios, mensajes de chat, etc.
    // y decidir si hacer eliminación en cascada o soft delete

    // Buscar y eliminar el cultivo en una sola operación
    const cultivoEliminado = await Cultivo.findByIdAndDelete(id).lean();

    if (!cultivoEliminado) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cultivo no encontrado',
          message: `No se encontró el cultivo con ID: ${id}`
        },
        { status: 404 }
      );
    }

    // Convertir _id a id para compatibilidad
    const cultivoTransformado = {
      ...cultivoEliminado,
      id: cultivoEliminado._id.toString(),
      _id: undefined
    };

    // Log de auditoría para eliminación
    console.log(`🗑️ Cultivo eliminado por ${user.email}:`, {
      id: cultivoEliminado._id,
      nombre: cultivoEliminado.nombre,
      timestamp: new Date().toISOString()
    });

    // Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      data: cultivoTransformado,
      message: 'Cultivo eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en DELETE /api/cultivos/[id]:', error);

    // Type guard para verificar si es un error de Cast de MongoDB
    const isCastError = (err: unknown): err is { name: string; path: string; message: string } => {
      return typeof err === 'object' && err !== null && 'name' in err && 'path' in err && 'message' in err;
    };

    // Type guard para verificar si es un error de MongoDB
    const isMongoError = (err: unknown): err is { name: string } => {
      return typeof err === 'object' && err !== null && 'name' in err;
    };

    // Manejo de errores de tipo de datos
    if (isCastError(error) && error.name === 'CastError') {
      return NextResponse.json(
        {
          success: false,
          error: 'ID inválido',
          message: 'El ID proporcionado no es válido'
        },
        { status: 400 }
      );
    }

    // Error de conexión a base de datos
    if (isMongoError(error) && (error.name === 'MongoError' || error.name === 'MongooseError')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error de base de datos',
          message: 'No se pudo conectar a la base de datos'
        },
        { status: 503 }
      );
    }

    // Devolver error genérico al cliente
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo eliminar el cultivo'
      },
      { status: 500 }
    );
  }
}