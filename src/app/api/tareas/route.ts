/**
 * API Route para gestión de tareas de cultivo con MongoDB
 * 
 * Migración completa de JSON Server a MongoDB usando Mongoose.
 * Incluye validaciones automáticas, gestión de tareas recurrentes y auditoría.
 */

import { NextResponse } from 'next/server';
import connectDB, { withUserDB } from '@/lib/mongodb';
import { Tarea } from '@/lib/models';
import type { TareaCultivo } from '@/types/planificacion';
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

function puedeCrearTarea(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user?.role === 'admin';
}

function puedeEditarRecursos(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user !== null;
}

/**
 * GET /api/tareas - Lista tareas desde la base de datos específica del usuario
 */
export const GET = withUserDB(async (request: Request, userEmail: string, mongooseInstance?: any) => {
  try {
    const url = new URL(request.url);
    const cultivoId = url.searchParams.get('cultivoId');
    const tipo = url.searchParams.get('tipo');
    const estado = url.searchParams.get('estado');
    const fechaDesde = url.searchParams.get('fechaDesde');
    const fechaHasta = url.searchParams.get('fechaHasta');
    const page = parseInt(url.searchParams.get('_page') || '1');
    const limit = parseInt(url.searchParams.get('_limit') || '50');

    // Construir query de MongoDB con filtros base
    let query: any = {};
    if (cultivoId) query.cultivoId = cultivoId;
    if (tipo) query.tipo = tipo;
    if (estado) query.estado = estado;
    if (fechaDesde || fechaHasta) {
      query.fechaProgramada = {};
      if (fechaDesde) query.fechaProgramada.$gte = fechaDesde;
      if (fechaHasta) query.fechaProgramada.$lte = fechaHasta;
    }

    // Ejecutar consulta con paginación (ya estamos en la DB del usuario)
    const tareas = await Tarea.find(query)
      .sort({ fechaProgramada: 1, horaProgramada: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Tarea.countDocuments(query);

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
 * POST /api/tareas - Crea nueva tarea en la base de datos del usuario
 */
export const POST = withUserDB(async (request: Request, userEmail: string, mongooseInstance?: any) => {
  try {
    // Leer datos y agregar auditoría
    const tareaData = await request.json();
    const tareaConAuditoria = {
      ...tareaData,
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaActualizacion: new Date().toISOString().split('T')[0],
      creadoPor: userEmail,
      recordatorioEnviado: false
    };

    // Crear y guardar con validaciones automáticas
    const nuevaTarea = new Tarea(tareaConAuditoria);
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