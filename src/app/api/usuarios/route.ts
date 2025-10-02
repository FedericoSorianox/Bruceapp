/**
 * API Route para gestión de usuarios del sistema
 *
 * Esta API permite a los administradores gestionar usuarios del sistema.
 * Proporciona operaciones CRUD para usuarios con control de permisos.
 *
 * Endpoints:
 * - GET /api/usuarios - Lista usuarios (solo admins)
 * - POST /api/usuarios - Crea un nuevo usuario (solo admins)
 *
 * Características:
 * - Solo administradores pueden gestionar usuarios
 * - Los usuarios creados quedan asociados al admin que los creó
 * - Validación automática de datos
 * - Hash automático de passwords
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
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
 * GET /api/usuarios
 *
 * Lista usuarios del sistema con filtros opcionales
 * Solo accesible para administradores
 *
 * Parámetros de query:
 * - role: filtrar por rol ('admin' | 'user')
 * - activo: filtrar por estado (true/false)
 * - creadoPor: filtrar usuarios creados por un admin específico
 */
export async function GET(request: Request) {
  try {
    // Conectar a MongoDB
    await connectDB();

    // 🔒 VALIDACIÓN DE PERMISOS
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    const user = validarPermisos(token);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Permisos insuficientes',
          message: 'Solo los administradores pueden gestionar usuarios'
        },
        { status: 403 }
      );
    }

    // Obtener parámetros de la URL
    const url = new URL(request.url);
    const roleFilter = url.searchParams.get('role');
    const activoFilter = url.searchParams.get('activo');
    const creadoPorFilter = url.searchParams.get('creadoPor');

    // Construir query de MongoDB
    const query: any = {};

    if (roleFilter && ['admin', 'user'].includes(roleFilter)) {
      query.role = roleFilter;
    }

    if (activoFilter !== null) {
      query.activo = activoFilter === 'true';
    }

    if (creadoPorFilter) {
      query.creadoPor = creadoPorFilter;
    }

    // Ejecutar consulta
    const usuarios = await Usuario.find(query)
      .sort({ fechaCreacion: -1 })
      .lean();

    // Obtener estadísticas
    const stats = await Usuario.getStats();

    return NextResponse.json({
      success: true,
      data: usuarios,
      stats,
      message: 'Usuarios obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error en GET /api/usuarios:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Error de base de datos',
          message: `No se pudieron cargar los usuarios: ${error.message}`
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron cargar los usuarios'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/usuarios
 *
 * Crea un nuevo usuario en el sistema
 * Solo accesible para administradores
 */
export async function POST(request: Request) {
  try {
    // Conectar a MongoDB
    await connectDB();

    // 🔒 VALIDACIÓN DE PERMISOS
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || null;
    const user = validarPermisos(token);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Permisos insuficientes',
          message: 'Solo los administradores pueden crear usuarios'
        },
        { status: 403 }
      );
    }

    // Leer datos de la petición
    const { email, password, role } = await request.json();

    // 🔍 VALIDACIONES BÁSICAS
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: 'Email y password son obligatorios'
        },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: 'El email debe contener @'
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: 'La contraseña debe tener al menos 6 caracteres'
        },
        { status: 400 }
      );
    }

    // Validar rol (si se especifica)
    if (role && !['admin', 'user'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Datos inválidos',
          message: 'El rol debe ser "admin" o "user"'
        },
        { status: 400 }
      );
    }

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      email: email.toLowerCase().trim(),
      password, // Se hashea automáticamente en el pre-save middleware
      role: role || 'user',
      creadoPor: user.email, // Asociar al admin que lo creó
      activo: true
    });

    // Guardar en MongoDB (validaciones automáticas del schema)
    const usuarioGuardado = await nuevoUsuario.save();

    // Devolver respuesta exitosa (sin incluir password)
    return NextResponse.json({
      success: true,
      data: {
        id: usuarioGuardado.id,
        email: usuarioGuardado.email,
        role: usuarioGuardado.role,
        creadoPor: usuarioGuardado.creadoPor,
        fechaCreacion: usuarioGuardado.fechaCreacion,
        activo: usuarioGuardado.activo
      },
      message: 'Usuario creado exitosamente'
    });

  } catch (error) {
    console.error('Error en POST /api/usuarios:', error);

    // Type guard para verificar si es un error de validación de Mongoose
    const isValidationError = (err: unknown): err is { name: string; errors: Record<string, { message: string }> } => {
      return typeof err === 'object' && err !== null && 'name' in err && 'errors' in err && err.errors !== undefined;
    };

    // Type guard para verificar si es un error con código
    const isErrorWithCode = (err: unknown): err is { code: number } => {
      return typeof err === 'object' && err !== null && 'code' in err;
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
          message: 'Ya existe un usuario con este email'
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

    // Error genérico
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo crear el usuario'
      },
      { status: 500 }
    );
  }
}
