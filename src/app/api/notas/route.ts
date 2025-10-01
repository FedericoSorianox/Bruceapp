/**
 * API Route para gestión de notas con MongoDB
 * Migración completa de JSON Server a Mongoose con búsqueda optimizada.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Nota } from '@/lib/models';
import jwt from 'jsonwebtoken';
import { construirFiltroUsuario } from '@/lib/utils/multiTenancy';

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
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      role: 'admin' | 'user';
      exp: number;
    };

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      console.warn('🚨 Token JWT expirado');
      return null;
    }

    if (decoded.email && decoded.role) {
      return { email: decoded.email, role: decoded.role };
    }

    console.warn('🚨 Token JWT con datos inválidos');
    return null;

  } catch (error) {
    console.error('🚨 Error al validar token JWT:', error);
    return null;
  }
}

/**
 * GET /api/notas - Lista notas con filtros, búsqueda full-text y multi-tenancy
 */
export async function GET(request: Request) {
  try {
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

    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('q');
    const category = url.searchParams.get('category');
    const author = url.searchParams.get('author');
    const priority = url.searchParams.get('priority');
    const page = parseInt(url.searchParams.get('_page') || '1');
    const limit = parseInt(url.searchParams.get('_limit') || '50');

    let query: any = { activa: true };

    if (category) query.category = category;
    if (author) query.author = { $regex: author, $options: 'i' };
    if (priority) query.priority = priority;

    // 🔒 APLICAR FILTRO DE MULTI-TENANCY
    const filtroUsuario = await construirFiltroUsuario(user);
    Object.assign(query, filtroUsuario);

    let notasQuery;
    
    if (searchQuery) {
      notasQuery = Nota.find(
        { ...query, $text: { $search: searchQuery } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' }, date: -1 });
    } else {
      notasQuery = Nota.find(query).sort({ date: -1 });
    }

    const notas = await notasQuery
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Nota.countDocuments(searchQuery ? { ...query, $text: { $search: searchQuery } } : query);

    return NextResponse.json({
      success: true,
      data: notas,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error en GET /api/notas:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor', message: 'No se pudieron cargar las notas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notas - Crea nueva nota
 */
export async function POST(request: Request) {
  try {
    await connectDB();

    const notaData = await request.json();
    const notaConFechas = {
      ...notaData,
      date: notaData.date || new Date().toISOString().split('T')[0],
      fechaCreacion: new Date().toISOString().split('T')[0],
      fechaActualizacion: new Date().toISOString().split('T')[0]
    };

    const nuevaNota = new Nota(notaConFechas);
    const notaGuardada = await nuevaNota.save();

    return NextResponse.json({
      success: true,
      data: notaGuardada.toJSON(),
      message: 'Nota creada exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/notas:', error);

    // Type guard para verificar si es un error de validación de Mongoose
    const isValidationError = (err: unknown): err is { name: string; errors: Record<string, { message: string }> } => {
      return typeof err === 'object' && err !== null && 'name' in err && 'errors' in err;
    };

    if (isValidationError(error) && error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Error interno del servidor', message: 'No se pudo crear la nota' },
      { status: 500 }
    );
  }
}