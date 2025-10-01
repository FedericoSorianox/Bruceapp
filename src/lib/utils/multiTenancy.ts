/**
 * Utilidades para Multi-tenancy y Filtrado por Usuario
 *
 * Este módulo proporciona funciones helper para implementar el sistema de multi-tenancy
 * donde cada usuario solo puede ver y gestionar sus propios datos y los de sus sub-usuarios.
 *
 * Reglas de Multi-tenancy:
 * - Admin: Ve sus datos + datos de usuarios que creó
 * - User: Ve sus datos + datos del admin que lo creó
 */

import { Usuario } from '@/lib/models';

/**
 * Tipo para representar un usuario validado
 */
export type UsuarioValidado = {
  email: string;
  role: 'admin' | 'user';
};

/**
 * Función helper para obtener emails de usuarios creados por un admin
 * @param adminEmail - Email del admin
 * @returns Array de emails de usuarios creados por este admin
 */
export async function getUsuariosCreadosPor(adminEmail: string): Promise<string[]> {
  try {
    const usuarios = await Usuario.find({
      creadoPor: adminEmail,
      activo: true
    }).select('email').lean();

    return usuarios.map(u => u.email);
  } catch (error) {
    console.error('Error obteniendo usuarios creados por admin:', error);
    return [];
  }
}

/**
 * Construye el filtro de MongoDB para multi-tenancy basado en el usuario
 *
 * Reglas:
 * - Admin: Puede ver sus propios datos + datos de usuarios que creó
 * - User: Puede ver sus propios datos + datos del admin que lo creó
 *
 * @param user - Usuario validado con email y role
 * @returns Objeto de filtro para MongoDB
 */
export async function construirFiltroUsuario(user: UsuarioValidado): Promise<any> {
  if (user.role === 'admin') {
    // Admin ve sus datos y los de usuarios que creó
    const usuariosCreados = await getUsuariosCreadosPor(user.email);

    return {
      $or: [
        { creadoPor: user.email },           // Datos que creó él
        { creadoPor: { $in: usuariosCreados } } // Datos de usuarios que creó
      ]
    };
  } else {
    // User normal ve sus datos y los de su admin creador
    try {
      const usuarioDoc = await Usuario.findOne({
        email: user.email,
        activo: true
      }).select('creadoPor').lean();

      const adminCreador = usuarioDoc?.creadoPor;

      if (adminCreador) {
        return {
          $or: [
            { creadoPor: user.email },           // Sus propios datos
            { creadoPor: adminCreador }          // Datos de su admin
          ]
        };
      } else {
        // Si no tiene admin creador, solo ve sus propios datos
        return { creadoPor: user.email };
      }
    } catch (error) {
      console.error('Error obteniendo admin creador:', error);
      // En caso de error, solo mostrar sus propios datos
      return { creadoPor: user.email };
    }
  }
}

/**
 * Verifica si un usuario puede acceder a un recurso específico
 *
 * @param user - Usuario que intenta acceder
 * @param recursoCreadoPor - Email del usuario que creó el recurso
 * @returns true si puede acceder, false si no
 */
export async function puedeAccederARecurso(
  user: UsuarioValidado,
  recursoCreadoPor: string
): Promise<boolean> {

  // Si el recurso fue creado por el mismo usuario, siempre puede acceder
  if (recursoCreadoPor === user.email) {
    return true;
  }

  if (user.role === 'admin') {
    // Admin puede acceder a recursos de usuarios que creó
    const usuariosCreados = await getUsuariosCreadosPor(user.email);
    return usuariosCreados.includes(recursoCreadoPor);
  } else {
    // User puede acceder a recursos de su admin creador
    try {
      const usuarioDoc = await Usuario.findOne({
        email: user.email,
        activo: true
      }).select('creadoPor').lean();

      return usuarioDoc?.creadoPor === recursoCreadoPor;
    } catch (error) {
      console.error('Error verificando acceso a recurso:', error);
      return false;
    }
  }
}

/**
 * Verifica si un usuario puede crear recursos
 * Solo admins pueden crear recursos
 *
 * @param user - Usuario a verificar
 * @returns true si puede crear, false si no
 */
export function puedeCrearRecursos(user: UsuarioValidado | null): boolean {
  return user?.role === 'admin';
}

/**
 * Verifica si un usuario puede editar un recurso específico
 *
 * Reglas:
 * - Admin: Puede editar cualquier recurso al que tenga acceso
 * - User: Puede editar solo sus propios recursos
 *
 * @param user - Usuario que intenta editar
 * @param recursoCreadoPor - Email del creador del recurso
 * @returns true si puede editar, false si no
 */
export async function puedeEditarRecurso(
  user: UsuarioValidado,
  recursoCreadoPor: string
): Promise<boolean> {

  // Solo puede editar si puede acceder al recurso
  const puedeAcceder = await puedeAccederARecurso(user, recursoCreadoPor);
  if (!puedeAcceder) return false;

  // Para usuarios normales, solo pueden editar sus propios recursos
  if (user.role === 'user') {
    return recursoCreadoPor === user.email;
  }

  // Admins pueden editar cualquier recurso al que tengan acceso
  return true;
}

/**
 * Verifica si un usuario puede eliminar un recurso específico
 *
 * Reglas:
 * - Admin: Puede eliminar cualquier recurso al que tenga acceso
 * - User: NO puede eliminar recursos (solo lectura)
 *
 * @param user - Usuario que intenta eliminar
 * @param recursoCreadoPor - Email del creador del recurso
 * @returns true si puede eliminar, false si no
 */
export async function puedeEliminarRecurso(
  user: UsuarioValidado,
  recursoCreadoPor: string
): Promise<boolean> {

  // Solo admins pueden eliminar recursos
  if (user.role !== 'admin') return false;

  // Solo puede eliminar si puede acceder al recurso
  return await puedeAccederARecurso(user, recursoCreadoPor);
}

/**
 * Función helper para obtener el filtro de usuarios disponibles para un admin
 * Útil para mostrar listas de usuarios que un admin puede gestionar
 *
 * @param adminEmail - Email del admin
 * @returns Filtro MongoDB para usuarios que este admin puede ver
 */
export function getFiltroUsuariosVisibles(adminEmail: string) {
  // Un admin solo puede ver usuarios que él mismo creó
  return {
    creadoPor: adminEmail,
    activo: true
  };
}
