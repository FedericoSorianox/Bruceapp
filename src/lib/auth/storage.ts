/**
 * 💾 STORAGE UTILITIES - Manejo Seguro de Tokens de Autenticación
 *
 * Módulo que proporciona funciones seguras para manejar el almacenamiento
 * del token de autenticación en localStorage y cookies, con protección completa
 * para Server-Side Rendering (SSR) de Next.js.
 *
 * Características:
 * - ✅ Compatible con SSR/SSG - verifica si estamos en cliente o servidor
 * - 🔑 Manejo centralizado de las claves de storage y cookies
 * - 🛡️ Protección contra errores de hidratación
 * - 🍪 Soporte para cookies HTTP-only para middleware
 * - 🎯 API simple y consistente
 * - 📦 Exportación limpia de constantes
 */

/**
 * 🔑 CLAVES CONSTANTES PARA ALMACENAMIENTO
 *
 * Claves únicas utilizadas para almacenar el token de autenticación.
 * Centralizadas para evitar inconsistencias y facilitar cambios futuros.
 */
const KEY = 'auth_token';
const COOKIE_NAME = 'auth-token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 días
};

/**
 * 📖 OBTENER TOKEN DE AUTENTICACIÓN
 * 
 * Función que recupera el token de autenticación desde localStorage
 * de manera segura, verificando que estemos en el cliente.
 * 
 * Casos de uso:
 * - Inicialización del AuthProvider
 * - Verificación de sesión existente
 * - Hidratación del estado de autenticación
 * 
 * @returns {string | null} Token si existe y estamos en cliente, null en caso contrario
 * 
 * Comportamiento:
 * - En servidor (SSR): retorna null (no existe localStorage)
 * - En cliente sin token: retorna null
 * - En cliente con token: retorna el valor almacenado
 */
export function getToken(): string | null {
  // 🚨 PROTECCIÓN SSR - Verifica que estemos en el navegador
  if (typeof window === 'undefined') {
    return null; // En servidor no existe localStorage
  }
  
  // 📱 Recupera token del localStorage del navegador
  return localStorage.getItem(KEY);
}

/**
 * 💾 GUARDAR TOKEN DE AUTENTICACIÓN
 * 
 * Función que almacena el token de autenticación en localStorage
 * de manera segura, verificando que estemos en el cliente.
 * 
 * Casos de uso:
 * - Después de login exitoso
 * - Renovación de tokens
 * - Persistencia de sesión
 * 
 * @param {string} token - Token de autenticación a almacenar
 * 
 * Comportamiento:
 * - En servidor (SSR): no hace nada (protección)
 * - En cliente: guarda el token en localStorage
 */
export function setToken(token: string) {
  // 🚨 PROTECCIÓN SSR - Verifica que estemos en el navegador
  if (typeof window === 'undefined') {
    return; // En servidor no se puede acceder a localStorage
  }
  
  // 💾 Almacena token en localStorage del navegador
  localStorage.setItem(KEY, token);
}

/**
 * 🗑️ LIMPIAR TOKEN DE AUTENTICACIÓN
 * 
 * Función que elimina el token de autenticación del localStorage
 * de manera segura, verificando que estemos en el cliente.
 * 
 * Casos de uso:
 * - Logout de usuario
 * - Token corrupto o inválido
 * - Limpieza de datos de autenticación
 * 
 * Comportamiento:
 * - En servidor (SSR): no hace nada (protección)
 * - En cliente: elimina el token del localStorage
 */
export function clearToken() {
  // 🚨 PROTECCIÓN SSR - Verifica que estemos en el navegador
  if (typeof window === 'undefined') {
    return; // En servidor no se puede acceder a localStorage
  }
  
  // 🗑️ Elimina token del localStorage del navegador
  localStorage.removeItem(KEY);
}

/**
 * 🍪 OBTENER TOKEN DESDE COOKIES (para middleware)
 *
 * Función que recupera el token de autenticación desde las cookies HTTP-only.
 * Utilizada principalmente por el middleware de Next.js para validación server-side.
 *
 * @param {Request} request - Objeto Request de Next.js (solo en middleware)
 * @returns {string | null} Token si existe en las cookies, null en caso contrario
 */
export function getTokenFromCookies(request: Request): string | null {
  const cookies = request.headers.get('cookie');
  if (!cookies) return null;

  // Parsear cookies manualmente
  const cookiePairs = cookies.split(';').map(c => c.trim());
  for (const pair of cookiePairs) {
    const [name, value] = pair.split('=');
    if (name === COOKIE_NAME && value) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

/**
 * 💾 GUARDAR TOKEN EN LOCALSTORAGE
 *
 * Función que almacena el token de autenticación en localStorage del navegador.
 * Las cookies HTTP-only se manejan por separado en el middleware.
 *
 * @param {string} token - Token de autenticación a almacenar
 */
export function setTokenWithCookies(token: string) {
  // Guardar en localStorage (cliente)
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY, token);
  }
}

/**
 * 🗑️ LIMPIAR TOKEN DE LOCALSTORAGE
 *
 * Función que elimina el token de autenticación del localStorage del navegador.
 * Las cookies HTTP-only se manejan por separado en el middleware.
 */
export function clearTokenWithCookies() {
  // Limpiar localStorage (cliente)
  if (typeof window !== 'undefined') {
    localStorage.removeItem(KEY);
  }
}

/**
 * 🍪 SETEAR COOKIE HTTP-ONLY (para middleware)
 *
 * Función para setear una cookie HTTP-only desde el middleware de Next.js.
 * Solo debe usarse en el contexto del middleware.
 *
 * @param {import('next/server').NextResponse} response - Objeto NextResponse
 * @param {string} token - Token de autenticación a almacenar
 */
export function setAuthCookie(response: any, token: string) {
  response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

/**
 * 🍪 LIMPIAR COOKIE HTTP-ONLY (para middleware)
 *
 * Función para eliminar la cookie HTTP-only desde el middleware de Next.js.
 * Solo debe usarse en el contexto del middleware.
 *
 * @param {import('next/server').NextResponse} response - Objeto NextResponse
 */
export function clearAuthCookie(response: any) {
  response.cookies.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });
}

/**
 * 📤 EXPORTACIÓN DE CONSTANTES
 *
 * Exporta las claves de storage y cookies para uso en otros módulos
 * que necesiten acceder directamente o hacer debugging.
 */
export { KEY as AUTH_STORAGE_KEY, COOKIE_NAME as AUTH_COOKIE_NAME, COOKIE_OPTIONS };
