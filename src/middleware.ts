import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTokenFromCookies } from './lib/auth/storage';
import jwt from 'jsonwebtoken';

/**
 * 🛡️ MIDDLEWARE DE AUTENTICACIÓN PARA NEXT.JS
 *
 * Funcionalidad:
 * - Protege rutas que requieren autenticación (/cultivo, /notas)
 * - Verifica tokens JWT desde cookies HTTP-only
 * - Redirige automáticamente al login si no hay sesión válida
 * - Preserva la URL destino para redirect post-login
 * - Permite acceso público a rutas como /, /login, /register, etc.
 *
 * Flujo de protección:
 * 1. Verifica si la ruta actual requiere protección
 * 2. Si requiere protección, valida el token JWT desde cookies
 * 3. Si el token es válido, permite el acceso
 * 4. Si el token no es válido, redirige al login con URL de retorno
 */

// 📋 RUTAS QUE REQUIEREN AUTENTICACIÓN
const protectedRoutes = ['/cultivo', '/notas'];

// 🚫 RUTAS PÚBLICAS (no requieren autenticación)
const publicRoutes = ['/', '/login', '/register', '/blog', '/subscription-required'];

// 🔍 RUTAS DE API PROTEGIDAS
const protectedApiRoutes = ['/api/cultivos', '/api/notas', '/api/tareas', '/api/comentarios', '/api/galeria'];

// 🌐 RUTAS DE API PÚBLICAS
const publicApiRoutes = ['/api/login', '/api/register', '/api/verify-token', '/api/subscription'];

/**
 * 🔐 VERIFICACIÓN DE TOKEN JWT DIRECTA (SIN FETCH)
 * Valida el token directamente en el middleware para evitar loops
 */
function validateTokenDirect(token: string): { valid: boolean; user?: { email: string; role: string } } {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'bruce-app-development-secret-key-2024';
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      role: 'admin' | 'user';
      exp: number;
    };

    return {
      valid: true,
      user: {
        email: decoded.email,
        role: decoded.role
      }
    };
  } catch (error) {
    console.error('❌ Error validando token directo:', error instanceof Error ? error.message : 'Unknown');
    return { valid: false };
  }
}

/**
 * 🎯 FUNCIÓN PRINCIPAL DEL MIDDLEWARE
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🔍 Determinar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  const isProtectedApiRoute = protectedApiRoutes.some(route =>
    pathname.startsWith(route)
  );

  // ✅ Si es ruta pública, permitir acceso
  if (publicRoutes.includes(pathname) || publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ✅ Si no es ruta protegida, permitir acceso
  if (!isProtectedRoute && !isProtectedApiRoute) {
    return NextResponse.next();
  }

  // 🔑 Intentar obtener token de las cookies usando la función utilitaria
  const token = getTokenFromCookies(request);

  console.log('🔍 Middleware check para:', pathname, '| Token existe:', !!token);

  if (!token) {
    // 🚨 Sin token - Redirigir al login
    console.log('🚨 Middleware: Acceso denegado - sin token para ruta:', pathname);

    if (isProtectedApiRoute) {
      // Para APIs, devolver error 401
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    } else {
      // Para páginas, redirigir al login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      console.log('🔄 Redirigiendo a:', loginUrl.toString());
      return NextResponse.redirect(loginUrl);
    }
  }

  // ✅ Validar token
  const validation = validateTokenDirect(token);

  if (!validation.valid) {
    // 🚨 Token inválido - Redirigir al login
    console.log('🚨 Middleware: Token inválido para ruta:', pathname, '| Validation result:', JSON.stringify(validation));

    if (isProtectedApiRoute) {
      // Para APIs, devolver error 401
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    } else {
      // Para páginas, redirigir al login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      console.log('🔄 Redirigiendo por token inválido a:', loginUrl.toString());
      return NextResponse.redirect(loginUrl);
    }
  }

  // ✅ Token válido - Permitir acceso
  console.log('✅ Middleware: Acceso permitido para usuario:', validation.user?.email);
  return NextResponse.next();
}

/**
 * 🎛️ CONFIGURACIÓN DEL MIDDLEWARE
 * Define qué rutas serán procesadas por el middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - procesadas por el matcher de arriba
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
