import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
import jwt from 'jsonwebtoken';

/**
 * 🔐 ENDPOINT DE LOGIN - Autenticación de Usuarios
 *
 * Este endpoint maneja la autenticación de usuarios generando tokens JWT válidos.
 * Valida credenciales contra la base de datos MongoDB.
 *
 * Ruta: POST /api/login
 *
 * Body esperado:
 * {
 *   "email": "usuario@ejemplo.com",
 *   "password": "password123"
 * }
 *
 * Respuesta exitosa:
 * {
 *   "success": true,
 *   "token": "jwt_token_aqui",
 *   "user": {
 *     "email": "usuario@ejemplo.com",
 *     "role": "admin" | "user"
 *   }
 * }
 */

/**
 * 🔑 CONFIGURACIÓN JWT
 * JWT secret para firmar tokens - debe coincidir con las APIs del servidor
 */
const JWT_SECRET = process.env.JWT_SECRET || 'bruce-app-development-secret-key-2024';

/**
 * 🍪 CONFIGURACIÓN DE COOKIES HTTP-ONLY
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 días
};

export async function POST(request: NextRequest) {
  try {
    // Conectar a MongoDB
    await connectDB();

    // 📥 OBTENER DATOS DEL REQUEST
    const { email, password, redirectUrl } = await request.json();

    // 🔍 VALIDACIONES BÁSICAS
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y password son requeridos' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // 🔐 VALIDACIÓN DE CREDENCIALES CONTRA BASE DE DATOS
    const usuario = await Usuario.findByEmail(email.toLowerCase().trim()) as any;

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar password usando el método del modelo
    const isPasswordValid = await usuario.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // 🔐 GENERACIÓN DE TOKEN JWT
    const tokenPayload = {
      email: usuario.email,
      role: usuario.role,
      iat: Math.floor(Date.now() / 1000), // Issued at time
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expires in 24 hours
    };

    const jwtToken = jwt.sign(tokenPayload, JWT_SECRET);

    // 🚀 REDIRECCIÓN AUTOMÁTICA SI SE SOLICITA
    if (redirectUrl && redirectUrl.startsWith('/')) {
      const redirectResponse = NextResponse.redirect(new URL(redirectUrl, request.url));
      // 🍪 SETEAR COOKIE HTTP-ONLY ANTES DE REDIRIGIR
      redirectResponse.cookies.set('auth-token', jwtToken, COOKIE_OPTIONS);
      return redirectResponse;
    }

    // ✅ RESPUESTA NORMAL CON COOKIE HTTP-ONLY
    const response = NextResponse.json({
      success: true,
      token: jwtToken,
      user: {
        email: usuario.email,
        role: usuario.role
      }
    });

    // 🍪 SETEAR COOKIE HTTP-ONLY PARA MIDDLEWARE
    response.cookies.set('auth-token', jwtToken, COOKIE_OPTIONS);

    return response;

  } catch (error) {
    console.error('🚨 Error en login:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
