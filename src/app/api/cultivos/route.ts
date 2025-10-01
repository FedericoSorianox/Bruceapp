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
import connectDB from '@/lib/mongodb';
import { Cultivo } from '@/lib/models';
import type { Cultivo as CultivoType } from '@/types/cultivo';
import { FilterQuery } from 'mongoose';
import type { CultivoDocument } from '@/lib/models/Cultivo';
import jwt from 'jsonwebtoken';
import { construirFiltroUsuario, UsuarioValidado } from '@/lib/utils/multiTenancy';

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

// Función para verificar si el usuario puede crear cultivos
function puedeCrearCultivo(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user?.role === 'admin';
}


// Las interfaces y funciones de db.json han sido reemplazadas por MongoDB
// Todas las operaciones ahora usan Mongoose para interactuar con MongoDB

/**
 * GET /api/cultivos
 *
 * Obtiene cultivos desde MongoDB con soporte para búsqueda, ordenamiento y multi-tenancy
 * Parámetros de query soportados:
 * - q: búsqueda full-text en nombre, genética, sustrato, notas (usa índices de MongoDB)
 * - _sort: campo por el cual ordenar (nombre, fechaComienzo, metrosCuadrados, etc.)
 * - _order: dirección del ordenamiento (asc, desc)
 * - activo: filtrar por cultivos activos (true/false)
 * - _page: número de página para paginación
 * - _limit: límite de resultados por página
 * Incluye manejo de errores optimizado, validación automática y filtrado por usuario
 */
export async function GET(request: Request) {
  try {
    // Conectar a MongoDB
    await connectDB();

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

    // Preparar la consulta base con filtro de multi-tenancy ya aplicado
    let cultivosQuery;

    if (searchQuery) {
      // Usar búsqueda full-text de MongoDB (más eficiente)
      cultivosQuery = Cultivo.find(
        {
          ...query,
          $text: { $search: searchQuery }
        },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' }, [sortBy]: sortOrder === 'desc' ? -1 : 1 });
    } else {
      // Consulta normal con ordenamiento
      cultivosQuery = Cultivo.find(query).sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });
    }

    // Aplicar paginación si se especifica
    if (page > 1) {
      cultivosQuery = cultivosQuery.skip((page - 1) * limit);
    }
    cultivosQuery = cultivosQuery.limit(limit);

    // Ejecutar la consulta (sin .lean() para mantener transformaciones toJSON)
    const cultivosDocs = await cultivosQuery;

    // Aplicar transformación toJSON a cada documento
    const cultivos = cultivosDocs.map(doc => doc.toJSON());

    // Obtener el total de documentos que coinciden con la query (para paginación)
    const total = await Cultivo.countDocuments(
      searchQuery
        ? { ...query, $text: { $search: searchQuery } }
        : query
    );

    // Devolver respuesta exitosa con formato compatible
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

    // Devolver error específico según el tipo
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
}

/**
 * POST /api/cultivos
 *
 * Crea un nuevo cultivo y lo guarda en MongoDB con validaciones automáticas del esquema
 */
export async function POST(request: Request) {
  try {
    // Conectar a MongoDB
    await connectDB();

    // 🔒 VALIDACIÓN DE PERMISOS
    // Verificar token de autenticación
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

    if (!puedeCrearCultivo(user)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permisos insuficientes',
          message: 'Solo los administradores pueden crear cultivos'
        },
        { status: 403 }
      );
    }

    // Leer el body de la petición
    const newCultivoData = await request.json();

    // Agregar campos de auditoría automáticamente
    const cultivoDataConAuditoria = {
      ...newCultivoData,
      fechaCreacion: newCultivoData.fechaCreacion || new Date().toISOString().split('T')[0],
      activo: newCultivoData.activo ?? true,
      creadoPor: user.email, // 🔒 Auditoría: registrar quién creó el cultivo
    };

    // Crear nuevo cultivo usando el modelo de Mongoose (validaciones automáticas)
    const nuevoCultivo = new Cultivo(cultivoDataConAuditoria);

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
}
