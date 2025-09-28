/**
 * 💾 STORAGE UTILITIES - Manejo Seguro de Tokens de Autenticación
 * 
 * Módulo que proporciona funciones seguras para manejar el almacenamiento
 * del token de autenticación en localStorage, con protección completa
 * para Server-Side Rendering (SSR) de Next.js.
 * 
 * Características:
 * - ✅ Compatible con SSR/SSG - verifica si estamos en cliente o servidor
 * - 🔑 Manejo centralizado de la clave de storage 
 * - 🛡️ Protección contra errores de hidratación
 * - 🎯 API simple y consistente
 * - 📦 Exportación limpia de constantes
 */

/**
 * 🔑 CLAVE CONSTANTE PARA LOCALSTORAGE
 * 
 * Clave única utilizada para almacenar el token de autenticación.
 * Centralizada para evitar inconsistencias y facilitar cambios futuros.
 */
const KEY = 'auth_token';

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
 * 📤 EXPORTACIÓN DE CONSTANTES
 * 
 * Exporta la clave de storage para uso en otros módulos
 * que necesiten acceder directamente o hacer debugging.
 */
export { KEY as AUTH_STORAGE_KEY };
