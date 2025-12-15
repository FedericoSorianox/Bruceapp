import Link from "next/link";

/**
 * Hero Component - Sección principal de bienvenida
 *
 * Características:
 * - Mensaje principal impactante
 * - Call-to-action prominente
 * - Diseño moderno con gradientes
 * - Responsive design
 * - Server component para mejor SEO
 * - Información clara del valor propuesto
 * - Accesibilidad mejorada con contraste adecuado
 */
const Hero = () => {
  return (
    <section
      className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24"
      aria-labelledby="hero-title"
      role="banner"
      data-testid="hero-section"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge/Etiqueta superior - Glass Style */}
          <div className="mb-8 inline-flex items-center rounded-full bg-green-100/50 backdrop-blur-md border border-green-200/50 px-5 py-2 text-sm font-semibold text-green-800 shadow-sm" data-testid="hero-badge">
            <span className="mr-2 text-lg" aria-hidden="true">🚀</span>
            Nueva Era en Agricultura Digital
          </div>

          {/* Título principal */}
          <h1
            id="hero-title"
            data-testid="hero-title"
            className="mb-8 text-5xl font-extrabold text-gray-900 sm:text-6xl lg:text-7xl tracking-tight"
          >
            Cultiva el{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent relative">
              Futuro
              {/* Underline decoration */}
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-green-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>{" "}
            con CanopIA
          </h1>

          {/* Subtítulo/Descripción */}
          <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-600 sm:text-2xl font-light" data-testid="hero-description">
            La plataforma integral que combina <span className="font-semibold text-gray-800">IoT</span> e <span className="font-semibold text-gray-800">Inteligencia Artificial</span> para llevar tu producción agrícola al siguiente nivel.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row mb-16" data-testid="hero-cta-buttons">
            <Link
              href="/cultivo"
              data-testid="hero-button-cultivo"
              className="group inline-flex items-center rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-bold text-white shadow-lg shadow-green-600/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:from-green-500 hover:to-emerald-500 min-w-[200px] justify-center"
              aria-label="Comenzar a gestionar cultivos"
            >
              <span className="mr-2 text-lg sm:text-xl group-hover:animate-bounce" aria-hidden="true">🌱</span>
              Comenzar Ahora
            </Link>

            <Link
              href="/notas"
              data-testid="hero-button-notas"
              className="group inline-flex items-center rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:bg-white hover:text-green-600 hover:border-green-200 hover:shadow-md min-w-[200px] justify-center"
              aria-label="Ver sección de notas"
            >
              <span className="mr-2 text-lg sm:text-xl" aria-hidden="true">📝</span>
              Ver Notas y Registros
            </Link>
          </div>

          {/* Estadísticas - Glass Cards */}
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { value: '100+', label: 'Cultivos Soportados', icon: '🌾' },
              { value: '24/7', label: 'Monitoreo AI', icon: '🤖' },
              { value: '95%', label: 'Precisión de Datos', icon: '🎯' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/40 backdrop-blur-lg rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-black text-gray-800 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                  <span>{stat.icon}</span> {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Información adicional */}
          <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Consultas Personalizadas
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Datos Encriptados
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Optimización Real
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
