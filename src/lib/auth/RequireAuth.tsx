'use client';

import { useEffect, Suspense } from 'react';
import { useAuth } from './AuthProvider';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

/**
 * 🛡️ COMPONENTE REQUIREAUTH - Guardián de Rutas Protegidas
 *
 * Funcionalidad:
 * - Protege rutas que requieren autenticación
 * - Redirige a login si no hay sesión activa
 * - Preserva la URL destino para redirect post-login
 * - Muestra estados de carga mejorados
 * - Maneja la hidratación SSR de forma segura
 *
 * Flujo de protección:
 * 1. Verifica si el AuthProvider está listo (hidratado)
 * 2. Valida si existe token de autenticación
 * 3. Redirige a login con URL de retorno si no hay token
 * 4. Renderiza contenido protegido si todo está OK
 *
 * @param children - Componentes hijos que requieren autenticación
 * @returns JSX protegido por autenticación o estado de carga
 */

// Componente interno que usa useSearchParams
function RequireAuthContent({ children }: { children: React.ReactNode }) {
  // 🎣 HOOKS DE AUTENTICACIÓN Y NAVEGACIÓN
  const { ready, token } = useAuth();        // Estado de autenticación global
  const pathname = usePathname();            // Ruta actual sin query params
  const search   = useSearchParams();        // Query parameters actuales
  const router   = useRouter();              // Router de Next.js para navegación

  /**
   * 🔗 CONSTRUCCIÓN DE URL COMPLETA
   * 
   * Reconstruye la URL completa (pathname + search params) 
   * para poder regresar exactamente aquí después del login
   */
  const here = search && search.toString()
    ? `${pathname}?${search.toString()}` // Con query params
    : pathname;                          // Solo pathname

  /**
   * 🚨 EFECTO DE PROTECCIÓN
   * 
   * Se ejecuta cuando cambian:
   * - ready: Estado de hidratación del AuthProvider
   * - token: Token de autenticación 
   * - router: Instancia del router
   * - here: URL actual completa
   */
  useEffect(() => {
    // ⏳ Espera a que termine la hidratación
    if (!ready) return;
    
    // 🚨 Sin token -> Redirige a login con URL de retorno
    if (!token) {
      console.log('🚨 Acceso denegado - redirigiendo a login desde:', here);
      router.replace(`/login?next=${encodeURIComponent(here)}`);
    }
  }, [ready, token, router, here]);

  /**
   * 🎬 ESTADOS DE RENDERIZADO
   */
  
  // ⏳ ESTADO: Hidratando o verificando autenticación
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          {/* 🌀 Spinner animado */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          
          {/* 📝 Mensaje de carga */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Inicializando aplicación...
            </p>
            <p className="text-sm text-gray-500">
              Verificando sesión guardada
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🔒 ESTADO: Sin autenticación - Verificando credenciales
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center space-y-4">
          {/* 🔐 Icono de candado */}
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          {/* 📝 Mensaje de redirección */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Acceso restringido
            </p>
            <p className="text-sm text-gray-500">
              Redirigiendo al login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ESTADO: Autenticado - Renderiza contenido protegido
  return <>{children}</>;
}

// Componente principal que envuelve RequireAuthContent en Suspense
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          {/* 🌀 Spinner animado */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>

          {/* 📝 Mensaje de carga */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Inicializando aplicación...
            </p>
            <p className="text-sm text-gray-500">
              Verificando autenticación
            </p>
          </div>
        </div>
      </div>
    }>
      <RequireAuthContent>{children}</RequireAuthContent>
    </Suspense>
  );
}

/**
 * 🛡️ COMPONENTE REQUIREROLE - Guardián de Rutas con Control de Roles
 *
 * Funcionalidad:
 * - Protege rutas que requieren un rol específico
 * - Requiere autenticación previa (debe usarse dentro de RequireAuth)
 * - Redirige a login si no tiene el rol requerido
 * - Muestra estados de carga y error apropiados
 *
 * Flujo de protección:
 * 1. Verifica si el usuario está autenticado
 * 2. Valida si el usuario tiene el rol requerido
 * 3. Redirige a login con URL de retorno si no tiene permisos
 * 4. Renderiza contenido si tiene permisos
 *
 * @param children - Componentes hijos que requieren el rol específico
 * @param role - Rol requerido ('admin' | 'user')
 * @param fallback - Contenido opcional a mostrar mientras carga
 * @returns JSX protegido por autenticación y rol específico
 */

// Componente interno que usa useSearchParams
function RequireRoleContent({
  children,
  role,
  fallback
}: {
  children: React.ReactNode;
  role: 'admin' | 'user';
  fallback?: React.ReactNode;
}) {
  // 🎣 HOOKS DE AUTENTICACIÓN Y NAVEGACIÓN
  const { ready, user, hasRole } = useAuth();        // Estado de autenticación global
  const pathname = usePathname();            // Ruta actual sin query params
  const search   = useSearchParams();        // Query parameters actuales
  const router   = useRouter();              // Router de Next.js para navegación

  /**
   * 🔗 CONSTRUCCIÓN DE URL COMPLETA
   *
   * Reconstruye la URL completa (pathname + search params)
   * para poder regresar exactamente aquí después del login
   */
  const here = search && search.toString()
    ? `${pathname}?${search.toString()}` // Con query params
    : pathname;                          // Solo pathname

  /**
   * 🚨 EFECTO DE PROTECCIÓN POR ROL
   *
   * Se ejecuta cuando cambian:
   * - ready: Estado de hidratación del AuthProvider
   * - user: Usuario autenticado actual
   * - router: Instancia del router
   * - here: URL actual completa
   */
  useEffect(() => {
    // ⏳ Espera a que termine la hidratación
    if (!ready) return;

    // 🚨 Sin usuario -> Redirige a login
    if (!user) {
      console.log('🚨 Acceso denegado - usuario no autenticado, redirigiendo a login desde:', here);
      router.replace(`/login?next=${encodeURIComponent(here)}`);
      return;
    }

    // 🚨 Sin rol requerido -> Redirige a login
    if (!hasRole(role)) {
      console.log('🚨 Acceso denegado - usuario no tiene rol', role, ', redirigiendo a login desde:', here);
      router.replace(`/login?next=${encodeURIComponent(here)}`);
      return;
    }
  }, [ready, user, hasRole, role, router, here]);

  /**
   * 🎬 ESTADOS DE RENDERIZADO
   */

  // ⏳ ESTADO: Hidratando o verificando autenticación/rol
  if (!ready) {
    return fallback || (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          {/* 🌀 Spinner animado */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>

          {/* 📝 Mensaje de carga */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Verificando permisos...
            </p>
            <p className="text-sm text-gray-500">
              Cargando perfil de usuario
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🔒 ESTADO: Sin permisos - Verificando credenciales
  if (!user || !hasRole(role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center space-y-4">
          {/* 🔐 Icono de candado */}
          <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {/* 📝 Mensaje de redirección */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Permisos insuficientes
            </p>
            <p className="text-sm text-gray-500">
              Redirigiendo al login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ESTADO: Autorizado - Renderiza contenido protegido por rol
  return <>{children}</>;
}

// Componente principal que envuelve RequireRoleContent en Suspense
export function RequireRole({
  children,
  role,
  fallback
}: {
  children: React.ReactNode;
  role: 'admin' | 'user';
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback || (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          {/* 🌀 Spinner animado */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>

          {/* 📝 Mensaje de carga */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Verificando permisos...
            </p>
            <p className="text-sm text-gray-500">
              Cargando perfil de usuario
            </p>
          </div>
        </div>
      </div>
    )}>
      <RequireRoleContent role={role} fallback={fallback}>{children}</RequireRoleContent>
    </Suspense>
  );
}
