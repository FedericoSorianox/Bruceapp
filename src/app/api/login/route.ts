import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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
    await connectDB();

    const body = await request.json();
    const { email, password, redirectUrl, demo } = body;

    // Modo Acceso Rápido / Demo
    if (demo === true) {
      const demoEmail = 'test@canopia.app';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let demoUser = await (Usuario as any).findByEmail(demoEmail);

      if (!demoUser) {
        demoUser = await Usuario.create({
          email: demoEmail,
          password: 'password123',
          nombre: 'Cultivador Principal',
          role: 'admin',
          activo: true,
          subscripcionActiva: true,
          planSubscripcion: 'premium',
          fechaVencimientoSubscripcion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });
      }

      const tokenPayload = {
        email: demoUser.email,
        role: demoUser.role || 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      };

      const jwtToken = jwt.sign(tokenPayload, JWT_SECRET);
      const response = NextResponse.json({
        success: true,
        token: jwtToken,
        user: {
          email: demoUser.email,
          role: demoUser.role || 'admin',
          nombre: demoUser.nombre || 'Cultivador Principal',
        },
        redirectTo: redirectUrl && redirectUrl.startsWith('/') ? redirectUrl : '/cultivo',
      });

      response.cookies.set('auth-token', jwtToken, COOKIE_OPTIONS);
      return response;
    }

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usuario = await (Usuario as any).findByEmail(email.toLowerCase().trim());

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const isPasswordValid = await usuario.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const tokenPayload = {
      email: usuario.email,
      role: usuario.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };

    const jwtToken = jwt.sign(tokenPayload, JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      token: jwtToken,
      user: {
        email: usuario.email,
        role: usuario.role,
        nombre: usuario.nombre,
      },
      ...(redirectUrl && redirectUrl.startsWith('/') ? { redirectTo: redirectUrl } : {}),
    });

    response.cookies.set('auth-token', jwtToken, COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error('🚨 Error en login:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
