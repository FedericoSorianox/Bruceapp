"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * Genera un nombre simplificado y legible a partir del email
 * @param email - Email del usuario
 * @returns Nombre simplificado para mostrar en la UI
 */
function getSimplifiedName(email: string): string {
  // Extraer la parte antes del @
  const localPart = email.split('@')[0];

  // Dividir por puntos y tomar máximo 2 partes
  const parts = localPart.split('.').slice(0, 2);

  // Capitalizar cada parte y unir con espacio
  const simplifiedName = parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

  return simplifiedName;
}

/**
 * Header Component - Navegación principal de la aplicación
 *
 * Características:
 * - Navegación responsive con menú móvil
 * - Links activos con estilos dinámicos
 * - Logo/brand clickeable que lleva al home
 * - Accesibilidad completa con ARIA labels
 * - Diseño modern con Tailwind CSS
 */
const Header = () => {
  // Estado para controlar el menú móvil (hamburger menu)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hooks para obtener la ruta actual, router y autenticación
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, ready } = useAuth();

  /**
   * Función para determinar si un link está activo
   * @param href - Ruta del link a verificar
   * @returns true si la ruta actual coincide con el href
   */
  const isActiveLink = (href: string) => {
    return pathname === href;
  };

  /**
   * Función para alternar el estado del menú móvil
   * Utilizamos el prefijo "handle" según las mejores prácticas
   */
  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * Función para cerrar el menú cuando se hace click en un link
   * Mejora la UX en dispositivos móviles
   */
  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  /**
   * Función para manejar el click en login
   * Redirige a la página de login
   */
  const handleLoginClick = () => {
    router.push('/login');
    handleCloseMenu(); // Cerrar menú móvil si está abierto
  };

  /**
   * Función para manejar el click en logout
   * Cierra la sesión del usuario
   */
  const handleLogoutClick = () => {
    logout();
    handleCloseMenu(); // Cerrar menú móvil si está abierto
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300 supports-[backdrop-filter]:bg-white/60"
      data-testid="main-header"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand - Siempre visible */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              data-testid="header-logo"
              className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105"
              aria-label="Ir al inicio - CanopIA"
            >
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                CanopIA
              </span>
            </Link>
          </div>

          {/* Navegación Desktop - Oculta en móvil */}
          <div className="hidden md:flex md:items-center md:space-x-8" data-testid="desktop-navigation">
            {/* Links de navegación */}
            <nav className="flex items-baseline space-x-1">
              {[
                { label: 'Inicio', href: '/' },
                ...(user ? [
                  { label: 'Cultivo', href: '/cultivo' },
                  { label: 'Notas', href: '/notas' }
                ] : [])
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-green-50 hover:text-green-700 
                    ${isActiveLink(link.href)
                      ? "bg-green-50 text-green-700 shadow-sm ring-1 ring-green-100"
                      : "text-gray-600 hover:bg-green-50/50"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Área de autenticación - Desktop */}
            <div className="flex items-center pl-4 border-l border-gray-200" data-testid="desktop-auth-section">
              {ready && (
                <>
                  {user ? (
                    // Usuario autenticado - mostrar info y logout
                    <div className="flex items-center gap-3" data-testid="user-info-desktop">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-200 text-emerald-700 font-semibold shadow-inner">
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700 text-xs">
                            {getSimplifiedName(user.email)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleLogoutClick}
                        data-testid="logout-button-desktop"
                        className="rounded-full p-2 text-gray-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
                        aria-label="Cerrar sesión"
                        title="Cerrar sesión"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    // Usuario no autenticado - mostrar botón de login
                    <button
                      onClick={handleLoginClick}
                      data-testid="login-button-desktop"
                      className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:shadow-lg hover:brightness-110 active:scale-95"
                      aria-label="Iniciar sesión"
                    >
                      Iniciar Sesión
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Botón de menú móvil - Solo visible en móvil */}
          <div className="md:hidden">
            <button
              onClick={handleToggleMenu}
              data-testid="mobile-menu-toggle"
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors duration-200 hover:bg-gray-100 focus:outline-none"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil - Desplegable */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full border-t border-gray-100 bg-white/95 backdrop-blur-xl shadow-lg md:hidden glass-panel-enter" data-testid="mobile-menu">
          <div className="space-y-2 px-4 pt-4 pb-6">
            {[
              { label: 'Inicio', href: '/', icon: '🏠' },
              ...(user ? [
                { label: 'Cultivo', href: '/cultivo', icon: '🌱' },
                { label: 'Notas', href: '/notas', icon: '📝' }
              ] : [])
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleCloseMenu}
                className={`flex items-center space-x-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 
                  ${isActiveLink(link.href)
                    ? "bg-green-50 text-green-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Área de autenticación - Móvil */}
            {ready && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{getSimplifiedName(user.email)}</span>
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full w-fit">
                          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogoutClick}
                      className="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-red-600 transition-colors hover:bg-red-50"
                    >
                      <span>🚪</span>
                      <span className="font-medium">Cerrar Sesión</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-center text-white font-medium shadow-md active:scale-95 transition-all"
                  >
                    Iniciar Sesión
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
