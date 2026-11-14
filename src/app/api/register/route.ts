import { NextRequest, NextResponse } from 'next/server';
import connectDB, { getDatabaseName } from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bruce-app-development-secret-key-2024';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 días
};

export async function POST(request: NextRequest) {
  try {
    const globalConnection = await connectDB();
    const { email, password, nombre, redirectUrl } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    const UsuarioGlobal = globalConnection.models.Usuario || globalConnection.model('Usuario', Usuario.schema);
    const normalizedEmail = email.toLowerCase().trim();

    const existente = await UsuarioGlobal.findOne({ email: normalizedEmail, activo: true });
    if (existente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un usuario registrado con este email' },
        { status: 409 }
      );
    }

    const nuevoUsuario = new UsuarioGlobal({
      email: normalizedEmail,
      password,
      nombre: nombre?.trim() || normalizedEmail.split('@')[0],
      role: 'admin',
      activo: true,
      subscripcionActiva: true,
      planSubscripcion: 'premium',
      fechaVencimientoSubscripcion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    const guardado = await nuevoUsuario.save();
    const dbName = getDatabaseName(guardado.email);

    const tokenPayload = {
      email: guardado.email,
      role: guardado.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    const jwtToken = jwt.sign(tokenPayload, JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      token: jwtToken,
      user: { email: guardado.email, role: guardado.role, nombre: guardado.nombre },
      database: dbName,
      requiresPayment: false,
      redirectTo: redirectUrl && redirectUrl.startsWith('/') ? redirectUrl : '/cultivo',
      message: 'Cuenta creada exitosamente.',
    });

    response.cookies.set('auth-token', jwtToken, COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error('🚨 Error en register:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor al registrar usuario' },
      { status: 500 }
    );
  }
}
