import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies } from '@/lib/auth/storage';
import jwt from 'jsonwebtoken';

/**
 * 🔍 ENDPOINT DE DEBUG PARA VALIDACIÓN JWT
 * Simula exactamente lo que hace el middleware para validar JWT
 */

function validateTokenDirect(token: string): { valid: boolean; user?: { email: string; role: string }; error?: string } {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'bruce-app-development-secret-key-2024';
    
    console.log('🔍 Debug JWT - Secret length:', JWT_SECRET.length);
    console.log('🔍 Debug JWT - Token length:', token.length);
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      role: 'admin' | 'user';
      exp: number;
    };

    console.log('✅ Debug JWT - Valid for user:', decoded.email);
    
    return {
      valid: true,
      user: {
        email: decoded.email,
        role: decoded.role
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Debug JWT - Error:', errorMessage);
    return { 
      valid: false, 
      error: errorMessage 
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Obtener token
    const token = getTokenFromCookies(request);
    
    if (!token) {
      return NextResponse.json({
        success: false,
        debug: {
          message: 'No token found',
          tokenPresent: false
        }
      });
    }
    
    // Validar token usando la misma función del middleware
    const validation = validateTokenDirect(token);
    
    return NextResponse.json({
      success: true,
      debug: {
        tokenPresent: true,
        tokenLength: token.length,
        validation: validation,
        jwtSecret: process.env.JWT_SECRET ? 'Present' : 'Missing',
        jwtSecretLength: (process.env.JWT_SECRET || 'bruce-app-development-secret-key-2024').length
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown'
      }
    });
  }
}
