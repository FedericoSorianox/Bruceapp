import Link from "next/link";

/**
 * Footer Component - Pie de página de la aplicación
 *
 * Características:
 * - Información de copyright dinámico
 * - Links de navegación secundaria
 * - Información de contacto/social
 * - Diseño responsive
 * - Server component (no necesita estado)
 */
const Footer = () => {
  // Obtener el año actual para copyright dinámico
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Sección de Brand/Logo */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4 flex items-center">
              <span className="text-2xl font-bold text-green-400">
                🌱 Bruce
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-gray-300">
              Tu compañero digital para el cultivo inteligente. Gestiona tus
              cultivos, toma notas detalladas y optimiza tu producción agrícola
              con tecnología moderna.
            </p>
          </div>

          {/* Sección de Navegación */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-green-400">
              Navegación
            </h3>
            <nav>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-gray-300 transition-colors duration-200 hover:text-green-400"
                    aria-label="Ir a página principal"
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cultivo"
                    className="text-sm text-gray-300 transition-colors duration-200 hover:text-green-400"
                    aria-label="Ir a sección de cultivos"
                  >
                    Cultivo
                  </Link>
                </li>
                <li>
                  <Link
                    href="/notas"
                    className="text-sm text-gray-300 transition-colors duration-200 hover:text-green-400"
                    aria-label="Ir a sección de notas"
                  >
                    Notas
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Sección de Contacto/Información */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-green-400">
              Contacto
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-300">
                <svg
                  className="mr-2 h-4 w-4 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:contacto@bruce.app"
                  className="transition-colors duration-200 hover:text-green-400"
                  aria-label="Enviar email a contacto@bruce.app"
                >
                  contacto@bruce.app
                </a>
              </div>

              <div className="flex items-center text-gray-300">
                <svg
                  className="mr-2 h-4 w-4 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9a9 9 0 01-9-9m9 0a9 9 0 00-9 9"
                  />
                </svg>
                <span>Agricultura Inteligente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="mt-8 border-t border-gray-700 pt-8">
          <div className="flex flex-col items-center justify-between sm:flex-row">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {currentYear} Bruce App. Todos los derechos reservados.
            </div>

            {/* Links legales/adicionales */}
            <div className="mt-4 flex space-x-6 sm:mt-0">
              <a
                href="/privacidad"
                className="text-sm text-gray-400 transition-colors duration-200 hover:text-green-400"
                aria-label="Ver política de privacidad"
              >
                Privacidad
              </a>
              <a
                href="/terminos"
                className="text-sm text-gray-400 transition-colors duration-200 hover:text-green-400"
                aria-label="Ver términos de servicio"
              >
                Términos
              </a>
              <a
                href="/ayuda"
                className="text-sm text-gray-400 transition-colors duration-200 hover:text-green-400"
                aria-label="Obtener ayuda"
              >
                Ayuda
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
