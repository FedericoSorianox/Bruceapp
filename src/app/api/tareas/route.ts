/**
 * API Route para gestión de tareas de cultivo con MongoDB
 * 
 * Migración completa de JSON Server a MongoDB usando Mongoose.
 * Incluye validaciones automáticas, gestión de tareas recurrentes y auditoría.
 */

import { NextResponse } from 'next/server';
// import connectDB, { withUserDB, connectToUserDB, getTareaModel } from '@/lib/mongodb';
import { withUserDB, connectToUserDB, getTareaModel } from '@/lib/mongodb';
// import type { TareaCultivo } from '@/types/planificacion';
import type { TareaDocument } from '@/lib/models';
import type { Model } from 'mongoose';
// import { construirFiltroUsuario, UsuarioValidado } from '@/lib/utils/multiTenancy';

/**
 * 🔐 JWT CONFIGURATION
 * JWT secret for token verification (must match frontend)
 */


/**
 * GET /api/tareas - Lista tareas desde la base de datos compartida filtrando por usuario
 */
export const GET = withUserDB(async (request: Request, userEmail: string) => {
  try {
    // Obtener la conexión a la base de datos principal
    const connection = await connectToUserDB(userEmail);

    const url = new URL(request.url);
    const cultivoId = url.searchParams.get('cultivoId');
    const tipo = url.searchParams.get('tipo');
    const estado = url.searchParams.get('estado');
    const fechaDesde = url.searchParams.get('fechaDesde');
    const fechaHasta = url.searchParams.get('fechaHasta');
    const page = parseInt(url.searchParams.get('_page') || '1');
    const limit = parseInt(url.searchParams.get('_limit') || '50');

    // Construir query de MongoDB con filtros base Y filtro de usuario
    // Construir query de MongoDB con filtros base Y filtro de usuario
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      creadoPor: userEmail // 🔒 FILTRO DE SEGURIDAD
    };

    if (cultivoId) query.cultivoId = cultivoId;
    if (tipo) query.tipo = tipo;
    if (estado) query.estado = estado;
    if (fechaDesde || fechaHasta) {
      query.fechaProgramada = {};
      if (fechaDesde) query.fechaProgramada.$gte = fechaDesde;
      if (fechaHasta) query.fechaProgramada.$lte = fechaHasta;
    }

    // Obtener el modelo específico para esta conexión
    const TareaModel = getTareaModel(connection) as Model<TareaDocument>;

    // Ejecutar consulta con paginación
    const tareas = await TareaModel.find(query)
      .sort({ fechaProgramada: 1, horaProgramada: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await TareaModel.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: tareas,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error en GET /api/tareas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor', message: 'No se pudieron cargar las tareas' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/tareas - Crea nueva tarea en la base de datos compartida
 */
export const POST = withUserDB(async (request: Request, userEmail: string) => {
  try {
    // Obtener la conexión a la base de datos principal
    const connection = await connectToUserDB(userEmail);

    // Leer datos y agregar auditoría
    const tareaData = await request.json();
    const tareaConAuditoria = {
      ...tareaData,
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaActualizacion: new Date().toISOString().split('T')[0],
      creadoPor: userEmail, // 🔒 Se asigna al usuario actual
      recordatorioEnviado: false
    };

    // Obtener el modelo específico para esta conexión
    const TareaModel = getTareaModel(connection) as Model<TareaDocument>;

    // Crear y guardar con validaciones automáticas
    const nuevaTarea = new TareaModel(tareaConAuditoria);
    const tareaGuardada = await nuevaTarea.save();

    return NextResponse.json({
      success: true,
      data: tareaGuardada.toJSON(),
      message: 'Tarea creada exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/tareas:', error);

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
      { success: false, error: 'Error interno del servidor', message: 'No se pudo crear la tarea' },
      { status: 500 }
    );
  }
});