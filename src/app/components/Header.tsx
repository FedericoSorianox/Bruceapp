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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand - Siempre visible */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-green-600 transition-colors duration-200 hover:text-green-700"
              aria-label="Ir al inicio - Bruce App"
            >
              🌱 Bruce
            </Link>
          </div>

          {/* Navegación Desktop - Oculta en móvil */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {/* Links de navegación */}
            <nav className="flex items-baseline space-x-8">
              <Link
                href="/"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-green-50 hover:text-green-600 ${
                  isActiveLink("/")
                    ? "bg-green-50 text-green-600"
                    : "text-gray-900"
                }`}
                aria-label="Página principal"
                aria-current={isActiveLink("/") ? "page" : undefined}
              >
                Inicio
              </Link>
              {/* Solo mostrar Cultivo y Notas si el usuario está autenticado */}
              {user && (
                <>
                  <Link
                    href="/cultivo"
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-green-50 hover:text-green-600 ${
                      isActiveLink("/cultivo")
                        ? "bg-green-50 text-green-600"
                        : "text-gray-700"
                    }`}
                    aria-label="Sección de cultivos"
                    aria-current={isActiveLink("/cultivo") ? "page" : undefined}
                  >
                    Cultivo
                  </Link>
                  <Link
                    href="/notas"
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-green-50 hover:text-green-600 ${
                      isActiveLink("/notas")
                        ? "bg-green-50 text-green-600"
                        : "text-gray-700"
                    }`}
                    aria-label="Sección de notas"
                    aria-current={isActiveLink("/notas") ? "page" : undefined}
                  >
                    Notas
                  </Link>
                </>
              )}
            </nav>

            {/* Área de autenticación - Desktop */}
            <div className="flex items-center space-x-4">
              {ready && (
                <>
                  {user ? (
                    // Usuario autenticado - mostrar info y logout
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-600">👤</span>
                          <span className="font-medium">{getSimplifiedName(user.email)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleLogoutClick}
                        className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
                        aria-label="Cerrar sesión"
                      >
                        Salir
                      </button>
                    </div>
                  ) : (
                    // Usuario no autenticado - mostrar botón de login
                    <button
                      onClick={handleLoginClick}
                      className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
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
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 transition-colors duration-200 hover:bg-green-50 hover:text-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none focus:ring-inset"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              tabIndex={0}
            >
              {/* Icon de hamburger/X usando SVG para mejor control */}
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isMenuOpen ? (
                  // Icon de X para cerrar
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  // Icon de hamburger para abrir
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil - Desplegable */}
      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-white shadow-lg md:hidden">
          <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
            <Link
              href="/"
              onClick={handleCloseMenu}
              className={`block rounded-md px-3 py-2 text-base font-medium transition-colors duration-200 hover:bg-green-50 hover:text-green-600 ${
                isActiveLink("/")
                  ? "bg-green-50 text-green-600"
                  : "text-gray-900"
              }`}
              aria-label="Ir a página principal"
              aria-current={isActiveLink("/") ? "page" : undefined}
            >
              Inicio
            </Link>
            {/* Solo mostrar Cultivo y Notas si el usuario está autenticado */}
            {user && (
              <>
                <Link
                  href="/cultivo"
                  onClick={handleCloseMenu}
                  className={`block rounded-md px-3 py-2 text-base font-medium transition-colors duration-200 hover:bg-green-50 hover:text-green-600 ${
                    isActiveLink("/cultivo")
                      ? "bg-green-50 text-green-600"
                      : "text-gray-700"
                  }`}
                  aria-label="Ir a sección de cultivos"
                  aria-current={isActiveLink("/cultivo") ? "page" : undefined}
                >
                  Cultivo
                </Link>
                <Link
                  href="/notas"
                  onClick={handleCloseMenu}
                  className={`block rounded-md px-3 py-2 text-base font-medium transition-colors duration-200 hover:bg-green-50 hover:text-green-600 ${
                    isActiveLink("/notas")
                      ? "bg-green-50 text-green-600"
                      : "text-gray-700"
                  }`}
                  aria-label="Ir a sección de notas"
                  aria-current={isActiveLink("/notas") ? "page" : undefined}
                >
                  Notas
                </Link>
              </>
            )}

            {/* Área de autenticación - Móvil */}
            {ready && (
              <div className="border-t border-gray-200 pt-4 pb-2">
                {user ? (
                  // Usuario autenticado - mostrar info y logout
                  <div className="space-y-3">
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <span className="text-gray-600">👤</span>
                        <span className="font-medium">{getSimplifiedName(user.email)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogoutClick}
                      className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-700 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
                      aria-label="Cerrar sesión"
                    >
                      🚪 Salir
                    </button>
                  </div>
                ) : (
                  // Usuario no autenticado - mostrar botón de login
                  <button
                    onClick={handleLoginClick}
                    className="block w-full rounded-md bg-green-600 px-3 py-2 text-left text-base font-medium text-white transition-colors duration-200 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                    aria-label="Iniciar sesión"
                  >
                    🔐 Iniciar Sesión
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
