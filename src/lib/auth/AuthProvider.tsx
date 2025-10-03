'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { getToken, setTokenWithCookies, clearTokenWithCookies } from './storage';
import { puedeCrearRecursos, puedeEditarRecursoCliente, puedeEliminarRecursoCliente } from '@/lib/utils/multiTenancy.client';

/**
 * 👤 TIPOS TYPESCRIPT - Definición de estructuras de datos
 *
 * User: Información básica del usuario autenticado con rol
 * AuthContextType: Interface completa del contexto de autenticación
 */
type User = {
  email: string;
  role: 'admin' | 'user';
  subscriptionStatus?: 'trial' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  hasActiveSubscription?: boolean;
  trialExpired?: boolean;
  trialEndDate?: string;
  exemptFromPayments?: boolean;
};
type AuthContextType = {
  ready: boolean;           // ✅ ¿Ya completamos la hidratación inicial?
  token: string | null;     // 🔑 Token de autenticación actual
  user: User | null;        // 👤 Datos del usuario autenticado
  login: (email: string, password: string, redirectUrl?: string) => Promise<void>; // 🔐 Función de login
  register: (email: string, password: string, redirectUrl?: string) => Promise<void>; // 🆕 Registro público de admin
  logout: () => void;       // 🚪 Función de logout
  hasRole: (role: 'admin' | 'user') => boolean; // 🔍 Verificar si usuario tiene rol específico
  // 🔒 Sistema de permisos multi-tenancy
  canCreateCultivo: () => boolean; // ✅ ¿Puede crear cultivos?
  canDeleteCultivo: (cultivoCreadoPor: string) => boolean; // ✅ ¿Puede eliminar cultivos?
  canCreateTarea: () => boolean; // ✅ ¿Puede crear tareas?
  canDeleteTarea: (tareaCreadoPor: string) => boolean; // ✅ ¿Puede eliminar tareas?
  canEditRecursos: (recursoCreadoPor: string) => boolean; // ✅ ¿Puede editar cultivos y tareas?
  canCreateUsuario: () => boolean; // ✅ ¿Puede crear usuarios?
  canViewUsuarios: () => boolean; // ✅ ¿Puede ver usuarios?
  // 💳 Sistema de suscripciones
  checkSubscription: () => Promise<boolean>; // ✅ Verificar estado de suscripción
  hasActiveSubscription: () => boolean; // ✅ ¿Tiene suscripción activa?
  isExemptFromPayments: () => boolean; // ✅ ¿Está exento de pagos?
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
   * 1. Intenta recuperar token desde localStorage y cookies
   * 2. Valida la integridad del token
   * 3. Decodifica los datos del usuario
   * 4. Limpia tokens inválidos/corruptos
   * 5. Marca como listo para usar
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const t = getToken(); // Intenta obtener token guardado

      if (t) {
        try {
          // 🔍 VALIDACIÓN JWT DEL TOKEN VIA API
          // Verifica el token usando el endpoint del servidor
          const response = await fetch('/api/verify-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: t }),
          });

          const data = await response.json();

          if (response.ok && data.valid) {
            // ✅ TOKEN VÁLIDO
            setTok(t);
            setUser(data.user);
            console.log('✅ Sesión restaurada exitosamente para:', data.user.email, 'con rol:', data.user.role);
          } else {
            // 🚨 TOKEN INVÁLIDO
            console.warn('🚨 Token inválido, limpiando...', data.error);
            clearTokenWithCookies();
          }

        } catch (error) {
          // 🛡️ MANEJO DE ERRORES DE RED O SERVIDOR
          console.error('🚨 Error al validar token JWT:', error);
          clearTokenWithCookies(); // Limpia token si hay error de validación
        }
      }

      // ✅ Marca como listo independientemente del resultado
      setReady(true);
    };

    initializeAuth();
  }, []);

  /**
   * 🔐 FUNCIÓN DE LOGIN
   *
   * Realiza la autenticación contra el endpoint del servidor:
   * 1. Envía credenciales al endpoint /api/login
   * 2. Recibe token JWT válido del servidor
   * 3. Guarda en localStorage y estado
   * 4. Actualiza información del usuario
   *
   * @param email - Email del usuario
   * @param password - Password del usuario
   * @param redirectUrl - URL opcional para redirección automática desde el servidor
   * @throws Error si las credenciales son inválidas o hay error de conexión
   */
  async function login(email: string, password: string, redirectUrl?: string) {
    try {
      // 🔍 VALIDACIÓN BÁSICA DE EMAIL
      if (!email.includes('@')) {
        throw new Error('Email inválido - debe contener @');
      }

      console.log('🔐 Login attempt for:', email);

      // 🌐 PETICIÓN AL ENDPOINT DE LOGIN
      const requestBody: any = { email, password };
      if (redirectUrl) {
        requestBody.redirectUrl = redirectUrl;
      }

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // 🛡️ VERIFICAR SI ES UNA REDIRECCIÓN
      if (response.redirected) {
        // 🚀 El servidor hizo una redirección automática
        window.location.href = response.url;
        return; // No continuar con el procesamiento normal
      }

      const data = await response.json();

      // 🛡️ VALIDACIÓN DE RESPUESTA
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error de autenticación');
      }

      // ✅ LOGIN EXITOSO
      const { token, user: userData } = data;

      // 💾 PERSISTENCIA - Guardar en localStorage, cookies y estado
      setTokenWithCookies(token); // Guarda en localStorage y cookies
      setTok(token);             // Actualiza estado local
      setUser(userData);         // Actualiza datos del usuario

      console.log('✅ Login exitoso para:', userData.email, 'con rol:', userData.role);

    } catch (error) {
      console.error('🚨 Error en login:', error);
      throw error; // Re-lanza el error para que lo maneje el componente
    }
  }

  /**
   * 🆕 FUNCIÓN DE REGISTRO (CREAR ADMIN/TENANT)
   *
   * Crea un nuevo admin con su propio tenant y autentica de inmediato.
   *
   * @param email - Email del usuario
   * @param password - Password del usuario
   * @param redirectUrl - URL opcional para redirección automática desde el servidor
   */
  async function register(email: string, password: string, redirectUrl?: string) {
    try {
      if (!email.includes('@')) {
        throw new Error('Email inválido - debe contener @');
      }
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      console.log('🆕 Register attempt for:', email);

      // 🌐 PETICIÓN AL ENDPOINT DE REGISTER
      const requestBody: any = { email, password };
      if (redirectUrl) {
        requestBody.redirectUrl = redirectUrl;
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      // 🛡️ VERIFICAR SI ES UNA REDIRECCIÓN
      if (response.redirected) {
        // 🚀 El servidor hizo una redirección automática
        window.location.href = response.url;
        return; // No continuar con el procesamiento normal
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'No se pudo crear la cuenta');
      }

      const { token, user: userData, requiresPayment, paymentUrl, trialEndsAt } = data;

      // Actualizar userData con info de suscripción
      const userWithSubscription = {
        ...userData,
        subscriptionStatus: 'trial',
        trialEndDate: trialEndsAt,
        hasActiveSubscription: true, // Durante período de prueba
        exemptFromPayments: false
      };

      setTokenWithCookies(token);
      setTok(token);
      setUser(userWithSubscription);

      console.log('✅ Registro exitoso para:', userData.email);

      // 🔄 REDIRECCIONAMIENTO POST-REGISTRO
      // Si requiere pago, redirigir automáticamente al pago de MercadoPago
      if (requiresPayment && paymentUrl) {
        console.log('💳 Redirigiendo a MercadoPago...');
        window.location.href = paymentUrl;
        return; // No continuar con navegación normal
      }

    } catch (error) {
      console.error('🚨 Error en register:', error);
      throw error;
    }
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
    clearTokenWithCookies(); // 🗑️ Elimina de localStorage y cookies
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
   * 🔒 SISTEMA DE PERMISOS MULTI-TENANCY
   *
   * Funciones que determinan si el usuario actual puede realizar acciones específicas
   * basado en su rol, el sistema de multi-tenancy y las restricciones del sistema
   */

  /**
   * ✅ ¿Puede crear cultivos?
   * Solo los administradores pueden crear cultivos
   */
  const canCreateCultivo = useCallback((): boolean => {
    return puedeCrearRecursos(user);
  }, [user]);

  /**
   * ✅ ¿Puede eliminar cultivos?
   * Solo los administradores pueden eliminar cultivos que tienen acceso
   */
  const canDeleteCultivo = useCallback((cultivoCreadoPor: string): boolean => {
    return puedeEliminarRecursoCliente(user, cultivoCreadoPor);
  }, [user]);

  /**
   * ✅ ¿Puede crear tareas?
   * Solo los administradores pueden crear tareas
   */
  const canCreateTarea = useCallback((): boolean => {
    return puedeCrearRecursos(user);
  }, [user]);

  /**
   * ✅ ¿Puede eliminar tareas?
   * Solo los administradores pueden eliminar tareas que tienen acceso
   */
  const canDeleteTarea = useCallback((tareaCreadoPor: string): boolean => {
    return puedeEliminarRecursoCliente(user, tareaCreadoPor);
  }, [user]);

  /**
   * ✅ ¿Puede editar recursos (cultivos y tareas)?
   * Depende del recurso específico y quién lo creó
   */
  const canEditRecursos = useCallback((recursoCreadoPor: string): boolean => {
    return puedeEditarRecursoCliente(user, recursoCreadoPor);
  }, [user]);

  /**
   * ✅ ¿Puede crear usuarios?
   * Solo administradores pueden crear usuarios
   */
  const canCreateUsuario = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user?.role]);

  /**
   * ✅ ¿Puede ver usuarios creados por él?
   * Solo administradores pueden gestionar usuarios
   */
  const canViewUsuarios = useCallback((): boolean => {
    return user?.role === 'admin';
  }, [user?.role]);

  /**
   * 💳 Verificar estado de suscripción del usuario
   * Consulta el API para obtener el estado actual de la suscripción
   */
  const checkSubscription = useCallback(async (): Promise<boolean> => {
    if (!token) return false;

    try {
      const response = await fetch('/api/subscription/manage', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const subscription = data.subscription;

        // Actualizar estado del usuario con info de suscripción
        setUser(prev => prev ? {
          ...prev,
          subscriptionStatus: subscription.status,
          hasActiveSubscription: subscription.hasActiveSubscription,
          trialExpired: subscription.trialExpired,
          trialEndDate: subscription.trialEndDate,
          exemptFromPayments: subscription.exemptFromPayments
        } : null);

        return subscription.hasActiveSubscription;
      }

      return false;
    } catch (error) {
      console.error('Error verificando suscripción:', error);
      return false;
    }
  }, [token]);

  /**
   * ✅ ¿Tiene suscripción activa?
   * Verifica si el usuario tiene acceso completo (suscripción o exento)
   */
  const hasActiveSubscription = useCallback((): boolean => {
    if (user?.exemptFromPayments) return true;
    return user?.hasActiveSubscription || false;
  }, [user]);

  /**
   * ✅ ¿Está exento del sistema de pagos?
   * Algunos usuarios pueden tener acceso completo sin pagar
   */
  const isExemptFromPayments = useCallback((): boolean => {
    return user?.exemptFromPayments || false;
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
      register,
      logout,
      hasRole,
      canCreateCultivo,
      canDeleteCultivo,
      canCreateTarea,
      canDeleteTarea,
      canEditRecursos,
      canCreateUsuario,
      canViewUsuarios,
      checkSubscription,
      hasActiveSubscription,
      isExemptFromPayments
    }),
    [ready, token, user, hasRole, canCreateCultivo, canDeleteCultivo, canCreateTarea, canDeleteTarea, canEditRecursos, canCreateUsuario, canViewUsuarios, checkSubscription, hasActiveSubscription, isExemptFromPayments]
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
