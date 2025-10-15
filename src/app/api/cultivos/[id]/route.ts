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
 * Obtiene un cultivo específico por su ID desde la base de datos del usuario
 */
export const GET = withUserDB(async (request, userEmail) => {
  try {
    // Obtener la conexión específica del usuario
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
    const CultivoModel = getCultivoModel(connection) as any;

    // Buscar el cultivo por ID en la DB del usuario
    const cultivo = await CultivoModel.findById(id).lean();

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
 * Actualiza un cultivo existente parcialmente en la base de datos del usuario
 */
export const PATCH = withUserDB(async (request, userEmail) => {
  try {
    console.log('🔍 PATCH /api/cultivos/[id] - Iniciando actualización...');
    console.log('👤 Usuario:', userEmail);

    // Obtener la conexión específica del usuario
    const connection = await connectToUserDB(userEmail);
    console.log('🔗 Conexión DB obtenida:', connection.readyState);

    // Extraer ID desde la URL
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    console.log('🆔 ID del cultivo:', id);

    // Validar que se proporcione un ID
    if (!id) {
      console.error('❌ Error: ID de cultivo no proporcionado');
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
      console.error('❌ Error: ID de cultivo inválido:', id);
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
    console.log('📝 Datos a actualizar:', Object.keys(updates));

    // Obtener el modelo específico para esta conexión
    const CultivoModel = getCultivoModel(connection) as any;

    // Validar que el modelo se haya obtenido correctamente
    if (!CultivoModel) {
      console.error('❌ Error: No se pudo obtener el modelo Cultivo');
      return NextResponse.json(
        {
          success: false,
          error: 'Error de configuración',
          message: 'No se pudo inicializar el modelo de cultivo'
        },
        { status: 500 }
      );
    }

    // Agregar auditoría automáticamente
    const updatesConAuditoria = {
      ...updates,
      fechaActualizacion: new Date().toISOString().split('T')[0],
      editadoPor: userEmail
    };

    console.log('🔄 Ejecutando findByIdAndUpdate...');

    // Actualizar el cultivo en MongoDB
    const cultivoActualizado = await CultivoModel.findByIdAndUpdate(
      id,
      updatesConAuditoria,
      {
        new: true,
        runValidators: true
      }
    ).lean();

    if (!cultivoActualizado) {
      console.error('❌ Error: Cultivo no encontrado con ID:', id);
      return NextResponse.json(
        {
          success: false,
          error: 'Cultivo no encontrado',
          message: `No se encontró el cultivo con ID: ${id}`
        },
        { status: 404 }
      );
    }

    console.log('✅ Cultivo actualizado exitosamente:', cultivoActualizado._id);

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
    
    // Log detallado del error
    if (error instanceof Error) {
      console.error('📋 Detalles del error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

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
 * Elimina un cultivo existente de la base de datos del usuario
 */
export const DELETE = withUserDB(async (request, userEmail) => {
  try {
    // Obtener la conexión específica del usuario
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
    const CultivoModel = getCultivoModel(connection) as any;

    // Buscar y eliminar el cultivo
    const cultivoEliminado = await CultivoModel.findByIdAndDelete(id).lean();

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