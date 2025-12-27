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
 */

import { NextResponse } from 'next/server';
import { withUserDB, getCultivoModel, connectToUserDB } from '@/lib/mongodb';

/**
 * GET /api/cultivos/[id]
 *
 * Obtiene un cultivo específico por su ID desde la base de datos global
 * Verifica que el cultivo pertenezca al usuario solicitante
 */
export const GET = withUserDB(async (request, userEmail) => {
  try {
    // Obtener la conexión a la base de datos principal
    const connection = await connectToUserDB(userEmail);

    // Extraer ID desde la URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

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

    // Obtener el modelo específico para esta conexión
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CultivoModel = getCultivoModel(connection) as any;

    // Buscar el cultivo por ID Y por creador (seguridad)
    const cultivo = await CultivoModel.findOne({
      _id: id,
      creadoPor: userEmail // 🔒 FILTRO DE SEGURIDAD
    }).lean();

    if (!cultivo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cultivo no encontrado o no autorizado',
          message: `No se encontró el cultivo o no tienes permisos para verlo`
        },
        { status: 404 }
      );
    }

    // Devolver el cultivo encontrado
    return NextResponse.json({
      success: true,
      data: {
        ...cultivo,
        id: cultivo._id.toString()
      }
    });

  } catch (error) {
    console.error('Error en GET /api/cultivos/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo obtener el cultivo'
      },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/cultivos/[id]
 *
 * Actualiza un cultivo existente verificando la propiedad del usuario
 */
export const PATCH = withUserDB(async (request, userEmail) => {
  try {
    // console.log('🔍 PATCH /api/cultivos/[id] - Iniciando actualización...');
    // console.log('👤 Usuario:', userEmail);

    // Obtener la conexión a la base de datos principal
    const connection = await connectToUserDB(userEmail);

    // Extraer ID desde la URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

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

    // Validar formato del ID
    if (!/^[a-f\d]{24}$/i.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID inválido',
          message: 'El ID del cultivo no tiene un formato válido'
        },
        { status: 400 }
      );
    }

    // Leer datos del request
    const updates = await request.json();

    // Obtener el modelo específico para esta conexión
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CultivoModel = getCultivoModel(connection) as any;

    // Agregar auditoría automáticamente
    const updatesConAuditoria = {
      ...updates,
      fechaActualizacion: new Date().toISOString().split('T')[0],
      editadoPor: userEmail
    };

    // Actualizar el cultivo en MongoDB SOLO si pertenece al usuario
    const cultivoActualizado = await CultivoModel.findOneAndUpdate(
      { _id: id, creadoPor: userEmail }, // 🔒 FILTRO DE SEGURIDAD
      updatesConAuditoria,
      {
        new: true,
        runValidators: true
      }
    ).lean();

    if (!cultivoActualizado) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cultivo no encontrado o no autorizado',
          message: `No se encontró el cultivo o no tienes permisos para modificarlo`
        },
        { status: 404 }
      );
    }

    // Devolver el cultivo actualizado
    return NextResponse.json({
      success: true,
      data: {
        ...cultivoActualizado,
        id: cultivoActualizado._id.toString()
      },
      message: 'Cultivo actualizado exitosamente'
    });

  } catch (error) {
    console.error('💥 Error en PATCH /api/cultivos/[id]:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar el cultivo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/cultivos/[id]
 *
 * Elimina un cultivo existente verificando la propiedad del usuario
 */
export const DELETE = withUserDB(async (request, userEmail) => {
  try {
    // Obtener la conexión a la base de datos principal
    const connection = await connectToUserDB(userEmail);

    // Extraer ID desde la URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

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

    // Obtener el modelo específico para esta conexión
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CultivoModel = getCultivoModel(connection) as any;

    // Buscar y eliminar el cultivo SOLO si pertenece al usuario
    const cultivoEliminado = await CultivoModel.findOneAndDelete({
      _id: id,
      creadoPor: userEmail // 🔒 FILTRO DE SEGURIDAD
    }).lean();

    if (!cultivoEliminado) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cultivo no encontrado o no autorizado',
          message: `No se encontró el cultivo o no tienes permisos para eliminarlo`
        },
        { status: 404 }
      );
    }

    // Log de auditoría
    console.log(`🗑️ Cultivo eliminado por ${userEmail}:`, {
      id: cultivoEliminado._id,
      nombre: cultivoEliminado.nombre,
      timestamp: new Date().toISOString()
    });

    // Devolver confirmación de eliminación
    return NextResponse.json({
      success: true,
      message: 'Cultivo eliminado exitosamente',
      data: {
        id: cultivoEliminado._id.toString(),
        nombre: cultivoEliminado.nombre
      }
    });

  } catch (error) {
    console.error('Error en DELETE /api/cultivos/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo eliminar el cultivo'
      },
      { status: 500 }
    );
  }
});