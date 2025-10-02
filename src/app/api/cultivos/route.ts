/**
 * API Route para gestión de cultivos con MongoDB
 * 
 * Esta API sirve como puente entre el frontend y MongoDB usando Mongoose.
 * Proporciona operaciones CRUD optimizadas para la gestión de cultivos.
 * 
 * Endpoints:
 * - GET /api/cultivos - Obtiene todos los cultivos con filtros opcionales
 * - POST /api/cultivos - Crea un nuevo cultivo
 * 
 * Características:
 * - Conexión optimizada a MongoDB
 * - Validaciones de esquema automáticas
 * - Búsqueda full-text
 * - Paginación eficiente
 * - Auditoría de permisos
 */

import { NextResponse } from 'next/server';
import { withUserDB, getCultivoModel, connectToUserDB } from '@/lib/mongodb';
import type { Cultivo as CultivoType } from '@/types/cultivo';
import { FilterQuery } from 'mongoose';
import type { CultivoDocument } from '@/lib/models/Cultivo';


// Las interfaces y funciones de db.json han sido reemplazadas por MongoDB
// Todas las operaciones ahora usan Mongoose para interactuar con MongoDB

/**
 * GET /api/cultivos
 *
 * Obtiene cultivos desde la base de datos específica del usuario con soporte para búsqueda y ordenamiento
 * Parámetros de query soportados:
 * - q: búsqueda full-text en nombre, genética, sustrato, notas
 * - _sort: campo por el cual ordenar (nombre, fechaComienzo, metrosCuadrados, etc.)
 * - _order: dirección del ordenamiento (asc, desc)
 * - activo: filtrar por cultivos activos (true/false)
 * - _page: número de página para paginación
 * - _limit: límite de resultados por página
 */
export const GET = withUserDB(async (request: Request, userEmail: string) => {
  try {
    // Obtener la conexión específica del usuario
    const connection = await connectToUserDB(userEmail);

    // Obtener parámetros de la URL
    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('q');
    const sortBy = url.searchParams.get('_sort') as keyof CultivoType || 'fechaCreacion';
    const sortOrder = url.searchParams.get('_order') || 'desc';
    const activoFilter = url.searchParams.get('activo');
    const page = parseInt(url.searchParams.get('_page') || '1');
    const limit = parseInt(url.searchParams.get('_limit') || '50');

    // Construir query de MongoDB con filtros base
    const query: FilterQuery<CultivoDocument> = {};

    // Aplicar filtro por estado activo
    if (activoFilter !== null) {
      query.activo = activoFilter === 'true';
    }

    // Obtener el modelo específico para esta conexión
    const CultivoModel = getCultivoModel(connection) as any;

    // Todos los cultivos del usuario (ya estamos en su DB específica)
    let cultivosQuery;

    if (searchQuery) {
      cultivosQuery = CultivoModel.find(
        {
          ...query,
          $text: { $search: searchQuery }
        },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' }, [sortBy]: sortOrder === 'desc' ? -1 : 1 });
    } else {
      cultivosQuery = CultivoModel.find(query).sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });
    }

    // Paginación
    if (page > 1) {
      cultivosQuery = cultivosQuery.skip((page - 1) * limit);
    }
    cultivosQuery = cultivosQuery.limit(limit);

    // Ejecutar y transformar
    const cultivosDocs = await cultivosQuery;
    const cultivos = cultivosDocs.map((doc: any) => doc.toJSON());

    // Total para paginación
    const total = await CultivoModel.countDocuments(
      searchQuery
        ? { ...query, $text: { $search: searchQuery } }
        : query
    );

    return NextResponse.json({
      success: true,
      data: cultivos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    });

  } catch (error) {
    console.error('Error en GET /api/cultivos:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error de base de datos',
          message: `No se pudieron cargar los cultivos: ${error.message}`
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron cargar los cultivos'
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/cultivos
 *
 * Crea un nuevo cultivo en la base de datos específica del usuario
 */
export const POST = withUserDB(async (request: Request, userEmail: string) => {
  try {
    // Obtener la conexión específica del usuario
    const connection = await connectToUserDB(userEmail);

    // Leer el body de la petición
    const newCultivoData = await request.json();

    // Agregar campos de auditoría automáticamente
    const cultivoDataConAuditoria = {
      ...newCultivoData,
      fechaCreacion: newCultivoData.fechaCreacion || new Date().toISOString().split('T')[0],
      activo: newCultivoData.activo ?? true,
      creadoPor: userEmail, // Todos los cultivos en esta DB pertenecen al usuario
    };

    // Obtener el modelo específico para esta conexión
    const CultivoModel = getCultivoModel(connection) as any;

    // Crear nuevo cultivo usando el modelo específico (validaciones automáticas)
    const nuevoCultivo = new CultivoModel(cultivoDataConAuditoria);

    // Guardar en MongoDB (las validaciones del esquema se ejecutan automáticamente)
    const cultivoGuardado = await nuevoCultivo.save();

    // Devolver respuesta exitosa con el cultivo creado
    return NextResponse.json({
      success: true,
      data: cultivoGuardado.toJSON(), // Usar toJSON() para aplicar transformaciones
      message: 'Cultivo creado exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/cultivos:', error);

    // Type guard para verificar si es un error de validación de Mongoose
    const isValidationError = (err: unknown): err is { name: string; errors: Record<string, { message: string }> } => {
      return typeof err === 'object' && err !== null && 'name' in err && 'errors' in err && err.errors !== undefined;
    };

    // Type guard para verificar si es un error con código
    const isErrorWithCode = (err: unknown): err is { code: number } => {
      return typeof err === 'object' && err !== null && 'code' in err;
    };

    // Type guard para verificar si es un error de MongoDB/Mongoose
    const isMongooseError = (err: unknown): err is { name: string } => {
      return typeof err === 'object' && err !== null && 'name' in err;
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

    // Manejar errores de duplicación (índices únicos)
    if (isErrorWithCode(error) && error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflicto',
          message: 'Ya existe un cultivo con esos datos'
        },
        { status: 409 }
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
    if (isMongooseError(error) && (error.name === 'MongoError' || error.name === 'MongooseError')) {
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
        message: 'No se pudo crear el cultivo'
      },
      { status: 500 }
    );
  }
});
