/**
 * API Route para gestión de tareas de cultivo con MongoDB
 * 
 * Migración completa de JSON Server a MongoDB usando Mongoose.
 * Incluye validaciones automáticas, gestión de tareas recurrentes y auditoría.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Tarea } from '@/lib/models';
import type { TareaCultivo } from '@/types/planificacion';

// Funciones de permisos (reutilizadas)
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

function puedeCrearTarea(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user?.role === 'admin';
}

function puedeEditarRecursos(user: { email: string; role: 'admin' | 'user' } | null): boolean {
  return user !== null;
}

/**
 * GET /api/tareas - Lista tareas con filtros MongoDB optimizados
 */
export async function GET(request: Request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const cultivoId = url.searchParams.get('cultivoId');
    const tipo = url.searchParams.get('tipo');
    const estado = url.searchParams.get('estado');
    const fechaDesde = url.searchParams.get('fechaDesde');
    const fechaHasta = url.searchParams.get('fechaHasta');
    const page = parseInt(url.searchParams.get('_page') || '1');
    const limit = parseInt(url.searchParams.get('_limit') || '50');

    // Construir query de MongoDB
    let query: any = {};
    if (cultivoId) query.cultivoId = cultivoId;
    if (tipo) query.tipo = tipo;
    if (estado) query.estado = estado;
    if (fechaDesde || fechaHasta) {
      query.fechaProgramada = {};
      if (fechaDesde) query.fechaProgramada.$gte = fechaDesde;
      if (fechaHasta) query.fechaProgramada.$lte = fechaHasta;
    }

    // Ejecutar consulta con paginación
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
}

/**
 * POST /api/tareas - Crea nueva tarea con validaciones automáticas
 */
export async function POST(request: Request) {
  try {
    await connectDB();

    // Validación de permisos
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    const user = validarPermisos(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado', message: 'Token de autenticación inválido' },
        { status: 401 }
      );
    }

    if (!puedeCrearTarea(user)) {
      return NextResponse.json(
        { success: false, error: 'Permisos insuficientes', message: 'Solo administradores pueden crear tareas' },
        { status: 403 }
      );
    }

    // Leer datos y agregar auditoría
    const tareaData = await request.json();
    const tareaConAuditoria = {
      ...tareaData,
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaActualizacion: new Date().toISOString().split('T')[0],
      creadoPor: user.email,
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

    if (error.name === 'ValidationError') {
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
}