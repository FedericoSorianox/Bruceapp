import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * 🔍 ENDPOINT DE VERIFICACIÓN DE TOKEN
 *
 * Verifica si un token JWT es válido sin necesidad de decodificarlo en el cliente.
 * Esto permite validar tokens existentes de manera segura usando el secreto del servidor.
 *
 * Ruta: POST /api/verify-token
 *
 * Body esperado:
 * {
 *   "token": "jwt_token_aqui"
 * }
 *
 * Respuesta exitosa:
 * {
 *   "valid": true,
 *   "user": {
 *     "email": "usuario@ejemplo.com",
 *     "role": "admin" | "user"
 *   }
 * }
 *
 * Respuesta inválida:
 * {
 *   "valid": false,
 *   "error": "Token inválido o expirado"
 * }
 */

/**
 * 🔑 CONFIGURACIÓN JWT
 * JWT secret para verificar tokens - debe coincidir con las APIs del servidor
 */
const JWT_SECRET = process.env.JWT_SECRET || 'bruce-app-development-secret-key-2024';

export async function POST(request: NextRequest) {
  try {
    // 📥 OBTENER TOKEN DEL REQUEST
    const { token } = await request.json();

    // 🔍 VALIDACIONES BÁSICAS
    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token es requerido' },
        { status: 400 }
      );
    }

    // 🔐 VERIFICACIÓN DEL TOKEN JWT
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      role: 'admin' | 'user';
      exp: number;
    };

    // ✅ TOKEN VÁLIDO
    return NextResponse.json({
      valid: true,
      user: {
        email: decoded.email,
        role: decoded.role
      }
    });

  } catch (error) {
    // 🚨 TOKEN INVÁLIDO O EXPIRADO
    console.error('🚨 Error verificando token:', error);
    return NextResponse.json(
      { valid: false, error: 'Token inválido o expirado' },
      { status: 401 }
    );
  }
}
