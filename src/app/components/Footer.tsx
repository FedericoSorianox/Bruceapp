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
    <footer className="mt-auto bg-gray-900 text-gray-400 border-t border-gray-800" data-testid="main-footer">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
          {/* Sección de Brand/Logo */}
          <div className="col-span-1 lg:col-span-2 space-y-4" data-testid="footer-brand">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent" data-testid="footer-logo">
                🌱 CanopIA
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              Plataforma integral de inteligencia agrícola. Optimizamos tu producción con datos precisos y tecnología de vanguardia.
            </p>
            <div className="flex space-x-4 pt-2">
              {/* Redes Sociales (Placeholder icons) */}
              {['twitter', 'github', 'linkedin'].map((social) => (
                <a key={social} href="#" className="text-gray-500 hover:text-green-400 transition-colors">
                  <span className="sr-only">{social}</span>
                  <div className="h-6 w-6 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                    <span className="text-xs">🔗</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Sección de Navegación */}
          <div data-testid="footer-navigation">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-200">
              Producto
            </h3>
            <ul className="space-y-3">
              {[
                { label: 'Inicio', href: '/' },
                { label: 'Cultivo', href: '/cultivo' },
                { label: 'Notas', href: '/notas' },
                { label: 'Blog', href: '/blog' } // Future proofing
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-green-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sección de Contacto/Información */}
          <div data-testid="footer-contact">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-200">
              Soporte
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm hover:text-green-400 transition-colors">Centro de Ayuda</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-green-400 transition-colors">Estado del Servicio</a>
              </li>
              <li className="pt-2">
                <a
                  href="mailto:contacto@canopia.app"
                  className="flex items-center text-sm text-green-400 hover:text-green-300 transition-colors group"
                >
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">✉️</span>
                  contacto@canopia.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-gray-500">
              © {currentYear} CanopIA Inc. Todos los derechos reservados.
            </p>

            <div className="flex space-x-6">
              <Link prefetch={false} href="/privacidad" className="text-xs text-gray-500 hover:text-green-400 transition-colors">
                Privacidad
              </Link>
              <Link prefetch={false} href="/terminos" className="text-xs text-gray-500 hover:text-green-400 transition-colors">
                Términos
              </Link>
              <Link prefetch={false} href="/cookies" className="text-xs text-gray-500 hover:text-green-400 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
