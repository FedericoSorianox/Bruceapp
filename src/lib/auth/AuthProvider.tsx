'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { getToken, setToken, clearToken } from './storage';

/**
 * 👤 TIPOS TYPESCRIPT - Definición de estructuras de datos
 *
 * User: Información básica del usuario autenticado con rol
 * AuthContextType: Interface completa del contexto de autenticación
 */
type User = {
  email: string;
  role: 'admin' | 'user';
};
type AuthContextType = {
  ready: boolean;           // ✅ ¿Ya completamos la hidratación inicial?
  token: string | null;     // 🔑 Token de autenticación actual
  user: User | null;        // 👤 Datos del usuario autenticado
  login: (email: string, password: string) => Promise<void>; // 🔐 Función de login
  logout: () => void;       // 🚪 Función de logout
  hasRole: (role: 'admin' | 'user') => boolean; // 🔍 Verificar si usuario tiene rol específico
  // 🔒 Sistema de permisos específico para operaciones
  canCreateCultivo: () => boolean; // ✅ ¿Puede crear cultivos?
  canDeleteCultivo: () => boolean; // ✅ ¿Puede eliminar cultivos?
  canCreateTarea: () => boolean; // ✅ ¿Puede crear tareas?
  canDeleteTarea: () => boolean; // ✅ ¿Puede eliminar tareas?
  canEditRecursos: () => boolean; // ✅ ¿Puede editar cultivos y tareas?
};

/**
 * 🏗️ CONTEXTO DE AUTENTICACIÓN
 * Context API de React para estado global de autenticación
 */
const AuthCtx = createContext<AuthContextType | null>(null);

/**
 * 🎯 PROVEEDOR DE AUTENTICACIÓN
 * 
 * Componente que:
 * - Mantiene el estado global de autenticación
 * - Maneja la hidratación desde localStorage
 * - Provee funciones de login/logout
 * - Valida y limpia tokens corruptos/inválidos
 * 
 * @param children - Componentes hijos que tendrán acceso al contexto
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 📊 ESTADOS LOCALES DEL PROVEEDOR
  const [ready, setReady]   = useState(false);        // Control de hidratación
  const [token, setTok]     = useState<string | null>(null);  // Token actual
  const [user, setUser]     = useState<User | null>(null);    // Usuario actual

  /**
   * 🚀 INICIALIZACIÓN Y HIDRATACIÓN
   * 
   * useEffect que se ejecuta al montar el componente:
   * 1. Intenta recuperar token desde localStorage
   * 2. Valida la integridad del token
   * 3. Decodifica los datos del usuario
   * 4. Limpia tokens inválidos/corruptos
   * 5. Marca como listo para usar
   */
  useEffect(() => {
    const t = getToken(); // Intenta obtener token guardado
    
    if (t) {
      try {
        // 🔍 VALIDACIÓN MEJORADA DEL TOKEN
        // Verifica que el token tenga el formato esperado
        if (!t.startsWith('fake-')) {
          console.warn('🚨 Token con formato inválido detectado, limpiando...');
          clearToken();
          setReady(true);
          return;
        }

        // 🔓 Decodifica el contenido del token
        const decoded = atob(t.replace('fake-', ''));
        
        // ✅ VALIDACIÓN ADICIONAL DEL CONTENIDO
        // Verifica que el contenido decodificado sea un email válido
        if (decoded && decoded.includes('@') && decoded.length > 3) {
          // Determinar rol basado en el email (demo: admin@bruce.app es admin)
          const role: 'admin' | 'user' = decoded === 'admin@bruce.app' ? 'admin' : 'user';

          setTok(t);
          setUser({ email: decoded, role });
          console.log('✅ Sesión restaurada exitosamente para:', decoded, 'con rol:', role);
        } else {
          console.warn('🚨 Token contiene datos inválidos, limpiando...');
          clearToken(); // Limpia token con datos inválidos
        }
        
      } catch (error) {
        // 🛡️ MANEJO DE TOKENS CORRUPTOS
        console.error('🚨 Error al decodificar token, posiblemente corrupto:', error);
        clearToken(); // Limpia token corrupto
      }
    }
    
    // ✅ Marca como listo independientemente del resultado
    setReady(true);
  }, []);

  /**
   * 🔐 FUNCIÓN DE LOGIN
   * 
   * Simula el proceso de autenticación:
   * 1. Valida formato del email
   * 2. Genera token fake para demo
   * 3. Guarda en localStorage y estado
   * 4. Actualiza información del usuario
   * 
   * @param email - Email del usuario (debe contener @)
   * @param password - Password (ignorado en esta demo)
   * @throws Error si el email es inválido
   */
  async function login(email: string, password: string) {
    // 🔍 VALIDACIÓN DE EMAIL
    if (!email.includes('@')) {
      throw new Error('Email inválido - debe contener @');
    }
    
    // 🎭 NOTA: En esta demo, el password se ignora intencionalmente
    // En producción, aquí validarías el password contra tu backend
    console.log('🔐 Login attempt for:', email, '(password length:', password.length, ')');

    // 🎭 GENERACIÓN DE TOKEN FAKE (solo para demo)
    const fake = `fake-${btoa(email)}`;

    // 👑 DETERMINAR ROL BASADO EN EMAIL
    // Demo: admin@bruce.app tiene rol admin, otros tienen rol user
    const role: 'admin' | 'user' = email === 'admin@bruce.app' ? 'admin' : 'user';

    // 💾 PERSISTENCIA - Guardar en localStorage y estado
    setToken(fake);     // Guarda en localStorage
    setTok(fake);       // Actualiza estado local
    setUser({ email, role }); // Actualiza datos del usuario con rol

    console.log('✅ Login exitoso para:', email, 'con rol:', role);
  }

  /**
   * 🚪 FUNCIÓN DE LOGOUT
   * 
   * Limpia toda la información de autenticación:
   * 1. Elimina token de localStorage
   * 2. Resetea estado local del token
   * 3. Resetea datos del usuario
   */
  function logout() {
    clearToken();    // 🗑️ Elimina de localStorage
    setTok(null);    // 🔄 Resetea estado del token
    setUser(null);   // 🔄 Resetea datos del usuario
    
    console.log('✅ Logout exitoso - sesión terminada');
  }

  /**
   * 🔍 FUNCIÓN PARA VERIFICAR ROLES
   *
   * Verifica si el usuario actual tiene un rol específico
   * @param role - Rol a verificar ('admin' | 'user')
   * @returns true si el usuario tiene el rol especificado
   */
  const hasRole = useCallback((role: 'admin' | 'user'): boolean => {
    return user?.role === role;
  }, [user?.role]);

  /**
   * 🔒 SISTEMA DE PERMISOS ESPECÍFICO PARA OPERACIONES
   *
   * Funciones que determinan si el usuario actual puede realizar acciones específicas
   * basado en su rol y las restricciones del sistema
   */

  /**
   * ✅ ¿Puede crear cultivos?
   * Solo los administradores pueden crear cultivos
   * Los usuarios normales NO pueden crear cultivos
   */
  const canCreateCultivo = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user?.role]);

  /**
   * ✅ ¿Puede eliminar cultivos?
   * Solo los administradores pueden eliminar cultivos
   * Los usuarios normales NO pueden eliminar cultivos
   */
  const canDeleteCultivo = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user?.role]);

  /**
   * ✅ ¿Puede crear tareas?
   * Solo los administradores pueden crear tareas
   * Los usuarios normales NO pueden crear tareas
   */
  const canCreateTarea = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user?.role]);

  /**
   * ✅ ¿Puede eliminar tareas?
   * Solo los administradores pueden eliminar tareas
   * Los usuarios normales NO pueden eliminar tareas
   */
  const canDeleteTarea = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user?.role]);

  /**
   * ✅ ¿Puede editar recursos (cultivos y tareas)?
   * Todos los usuarios pueden editar recursos, pero se registra quién lo hace
   * Los administradores tienen control total
   * Los usuarios normales pueden editar pero con registro de auditoría
   */
  const canEditRecursos = useCallback((): boolean => {
    return user !== null; // Cualquier usuario autenticado puede editar
  }, [user]);

  /**
   * 🎁 OPTIMIZACIÓN CON USEMEMO
   *
   * Memoiza el valor del contexto para evitar re-renders innecesarios.
   * Solo se recalcula cuando cambian ready, token, user, login, logout o las funciones de permisos.
   */
  const value = useMemo(
    () => ({
      ready,
      token,
      user,
      login,
      logout,
      hasRole,
      canCreateCultivo,
      canDeleteCultivo,
      canCreateTarea,
      canDeleteTarea,
      canEditRecursos
    }),
    [ready, token, user, hasRole, canCreateCultivo, canDeleteCultivo, canCreateTarea, canDeleteTarea, canEditRecursos]
  );

  // 🌐 PROVEEDOR DEL CONTEXTO
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/**
 * 🪝 HOOK PERSONALIZADO PARA USAR EL CONTEXTO
 * 
 * Hook que:
 * - Obtiene el contexto de autenticación
 * - Valida que se use dentro del AuthProvider
 * - Proporciona typesafe access al contexto
 * 
 * @returns AuthContextType con todas las funciones y estado de auth
 * @throws Error si se usa fuera del AuthProvider
 */
export function useAuth() {
  const ctx = useContext(AuthCtx);
  
  // 🛡️ VALIDACIÓN DE USO CORRECTO
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  
  return ctx;
}
