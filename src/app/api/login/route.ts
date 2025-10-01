import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * 🔐 ENDPOINT DE LOGIN - Autenticación de Usuarios
 *
 * Este endpoint maneja la autenticación de usuarios generando tokens JWT válidos.
 * En producción, aquí se debería validar contra una base de datos real.
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
 * 👥 USUARIOS DEMO
 * En producción, esto debería venir de una base de datos
 */
const DEMO_USERS = [
  {
    email: 'admin@bruce.app',
    password: 'admin123',
    role: 'admin' as const
  },
  {
    email: 'user@bruce.app',
    password: 'user123',
    role: 'user' as const
  }
];

export async function POST(request: NextRequest) {
  try {
    // 📥 OBTENER DATOS DEL REQUEST
    const { email, password } = await request.json();

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

    // 🔐 VALIDACIÓN DE CREDENCIALES
    // En producción: validar contra base de datos
    const user = DEMO_USERS.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // 🔐 GENERACIÓN DE TOKEN JWT
    const tokenPayload = {
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000), // Issued at time
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expires in 24 hours
    };

    const jwtToken = jwt.sign(tokenPayload, JWT_SECRET);

    // ✅ RESPUESTA EXITOSA
    return NextResponse.json({
      success: true,
      token: jwtToken,
      user: {
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('🚨 Error en login:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
