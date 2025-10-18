import Link from "next/link";

/**
 * CTA (Call-to-Action) Component - Sección de conversión final
 *
 * Características:
 * - Diseño impactante con gradientes
 * - Múltiples CTAs para diferentes tipos de usuarios
 * - Elementos de confianza y seguridad
 * - Diseño responsive y accesible
 * - Server component para SEO
 * - Elementos visuales que generan urgencia y valor
 * - Contraste mejorado y tamaños accesibles
 */
const CTA = () => {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-green-800 py-20"
      aria-labelledby="cta-title"
      role="complementary"
      data-testid="cta-section"
    >
      {/* Elementos decorativos de fondo - agregamos aria-hidden */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* Patrón decorativo */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

        {/* Círculos decorativos */}
        <div className="absolute top-10 left-10 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute right-10 bottom-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute top-1/2 left-1/3 h-16 w-16 rounded-full bg-white/20 blur-lg" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge superior - mejoramos contraste */}
          <div className="mb-8 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm" data-testid="cta-badge">
            <span className="mr-2" aria-hidden="true">⚡</span>
            Únete a la Revolución Agrícola
          </div>

          {/* Título principal - agregamos id para aria-labelledby */}
          <h2
            id="cta-title"
            data-testid="cta-title"
            className="mb-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
          >
            Transforma tu
            <br />
            <span className="text-green-200">Agricultura Hoy</span>
          </h2>

          {/* Subtítulo - mejoramos contraste */}
          <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-green-100 sm:text-2xl" data-testid="cta-description">
            No te quedes atrás en la evolución tecnológica del sector agrícola
          </p>

          {/* Estadísticas de credibilidad */}
          {/*<div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">1,500+</div>
              <div className="text-green-200 text-sm">Agricultores Activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">50,000+</div>
              <div className="text-green-200 text-sm">Hectáreas Gestionadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">30%</div>
              <div className="text-green-200 text-sm">Aumento Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-green-200 text-sm">Tiempo Actividad</div>
            </div>
          </div>**/}

          {/* Botones CTA principales - mejoramos tamaños para accesibilidad */}
          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row" data-testid="cta-buttons">
            <Link
              href="/cultivo"
              data-testid="cta-button-cultivo"
              className="inline-flex transform items-center rounded-lg border border-transparent bg-white px-8 py-4 text-lg font-medium text-green-700 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-green-50 hover:shadow-xl focus:ring-2 focus:ring-white focus:ring-offset-2 focus:outline-none min-h-[48px]"
              aria-label="Comenzar prueba gratuita de gestión de cultivos"
            >
              <span className="mr-2" aria-hidden="true">🚀</span>
              Maneja tu cultivo
            </Link>

            <Link
              href="/notas"
              data-testid="cta-button-notas"
              className="inline-flex items-center rounded-lg border-2 border-white bg-transparent px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/10 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:outline-none min-h-[48px]"
              aria-label="Ver demo de gestión de notas"
            >
              <span className="mr-2" aria-hidden="true">👁️</span>
              Ver Notas
            </Link>
          </div>

          {/* Elementos de confianza - mejoramos estructura semántica */}
          <div className="flex flex-col items-center justify-center space-y-4 text-sm text-green-200 sm:flex-row sm:space-y-0 sm:space-x-8">
            <div className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Asegura tu cultivo
            </div>

            <div className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Consultas 24/7
            </div>

            <div className="flex items-center">
              <svg
                className="mr-2 h-5 w-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Datos seguros
            </div>
          </div>

          {/* Mensaje de urgencia sutil */}
          {/* <div className="mt-8 text-green-200 text-sm">
            <p>
              💡 <strong>Oferta especial:</strong> Primeros 100 usuarios obtienen acceso premium gratuito por 6 meses
            </p>
          </div>**/}
        </div>
      </div>

      {/* Gradiente inferior para transición suave - agregamos aria-hidden */}
      <div
        className="absolute right-0 bottom-0 left-0 h-20 bg-gradient-to-t from-green-900 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
};

export default CTA;
