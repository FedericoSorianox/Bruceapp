/**
 * Utilidades de Multi-tenancy para Cliente
 *
 * Versiones client-safe de las funciones de multi-tenancy que no requieren
 * acceso a base de datos. Estas funciones se usan en componentes del cliente
 * para validaciones rápidas, pero la validación final se hace en el servidor.
 */

export type UsuarioValidado = {
  email: string;
  role: 'admin' | 'user';
};

/**
 * Verifica si un usuario puede crear recursos (client-safe)
 * Solo admins pueden crear recursos
 *
 * @param user - Usuario a verificar
 * @returns true si puede crear, false si no
 */
export function puedeCrearRecursos(user: UsuarioValidado | null): boolean {
  return user?.role === 'admin';
}

/**
 * Verifica si un usuario puede eliminar un recurso específico (client-safe)
 *
 * Esta es una versión simplificada para el cliente. La validación real
 * se hace en el servidor. En el cliente asumimos que:
 * - Users solo pueden eliminar sus propios recursos
 * - Admins pueden eliminar recursos (server valida la jerarquía)
 *
 * @param user - Usuario que intenta eliminar
 * @param recursoCreadoPor - Email del creador del recurso
 * @returns true si parece poder eliminar, false si definitivamente no
 */
export function puedeEliminarRecursoCliente(
  user: UsuarioValidado | null,
  recursoCreadoPor: string
): boolean {
  if (!user) return false;

  // Users solo pueden eliminar sus propios recursos
  if (user.role === 'user') {
    return recursoCreadoPor === user.email;
  }

  // Admins pueden intentar eliminar (server valida)
  return user.role === 'admin';
}

/**
 * Verifica si un usuario puede editar un recurso específico (client-safe)
 *
 * Similar a eliminar, versión simplificada para cliente.
 * - Users pueden editar sus propios recursos
 * - Admins pueden editar recursos a los que tienen acceso
 *
 * @param user - Usuario que intenta editar
 * @param recursoCreadoPor - Email del creador del recurso
 * @returns true si parece poder editar, false si definitivamente no
 */
export function puedeEditarRecursoCliente(
  user: UsuarioValidado | null,
  recursoCreadoPor: string
): boolean {
  if (!user) return false;

  // Todos pueden editar sus propios recursos
  if (recursoCreadoPor === user.email) {
    return true;
  }

  // Users no pueden editar recursos de otros
  if (user.role === 'user') {
    return false;
  }

  // Admins pueden intentar editar recursos de otros (server valida)
  return user.role === 'admin';
}
