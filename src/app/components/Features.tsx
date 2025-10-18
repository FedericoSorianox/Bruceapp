/**
 * Features Component - Sección de características principales
 *
 * Características:
 * - Grid responsive de features
 * - Iconos personalizados con SVG
 * - Animaciones sutiles con hover
 * - Diseño card-based moderno
 * - Server component para mejor SEO
 * - Información estructurada y fácil de escanear
 * - Accesibilidad mejorada con contraste y navegación por teclado
 */

// Tipo para definir la estructura de cada feature
interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

const Features = () => {
  /**
   * Array de features principales de la aplicación
   * Organizado en una estructura de datos para mejor mantenibilidad
   */
  const features: Feature[] = [
    {
      id: "smart-monitoring",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "Monitoreo Inteligente",
      description:
        "Seguimiento automatizado de tus cultivos y análisis de datos en tiempo real.",
      benefits: [
        "Control de temperatura y humedad",
        "Predicción de enfermedades",
      ],
    },
    {
      id: "notes-management",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
      title: "Gestión de Notas",
      description:
        "Sistema avanzado para documentar todo el proceso de cultivo con tags, fechas y multimedia.",
      benefits: [
        "Notas con fotos y videos",
        "Sistema de etiquetado",
        "Búsqueda avanzada",
      ],
    },
    {
      id: "ai-insights",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      title: "Inteligencia Artificial",
      description:
        "Recomendaciones personalizadas basadas en IA para optimizar el rendimiento de tus cultivos.",
      benefits: [
        "Análisis predictivo",
        "Optimización de recursos",
        "Recomendaciones personalizadas",
      ],
    },
    {
      id: "crop-planning",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Planificación de Cultivos",
      description:
        "Calendario inteligente para planificar siembras, cosechas y tareas de mantenimiento.",
      benefits: ["Calendario de siembras", "Recordatorios automáticos"],
    },
    {
      id: "weather-integration",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      ),
      title: "Integración Meteorológica",
      description:
        "Datos meteorológicos precisos para tomar decisiones informadas sobre el riego y la protección.",
      benefits: [
        "Pronósticos detallados",
        "Alertas climáticas",
        "Historial meteorológico",
      ],
    },
    {
      id: "production-analytics",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Análisis de Producción",
      description:
        "Reportes detallados sobre rendimiento, costos y rentabilidad de tus cultivos.",
      benefits: [
        "Dashboard de métricas",
        "Análisis de rentabilidad",
        "Comparativas históricas",
      ],
    },
  ];

  return (
    <section
      className="bg-white py-20"
      aria-labelledby="features-heading"
      role="main"
      data-testid="features-section"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header de la sección */}
        <div className="mb-16 text-center">
          <h2
            id="features-heading"
            data-testid="features-title"
            className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            Funcionalidades{" "}
            <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              Avanzadas
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-700" data-testid="features-description">
            Descubre todas las herramientas que Bruce pone a tu disposición para
            revolucionar la manera en que gestionas tus cultivos.
          </p>
        </div>

        {/* Grid de features */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" data-testid="features-grid">
          {features.map((feature) => (
            <article
              key={feature.id}
              data-testid={`feature-${feature.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-green-200 hover:shadow-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2"
            >
              {/* Icon container */}
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-green-200">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>

              <p className="mb-4 leading-relaxed text-gray-600">
                {feature.description}
              </p>

              {/* Benefits list - mejoramos estructura semántica */}
              <ul className="space-y-2" role="list">
                {feature.benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-center text-sm text-gray-700"
                  >
                    <svg
                      className="mr-2 h-4 w-4 flex-shrink-0 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Call-to-action al final de features */}
        <div className="mt-16 text-center">
          <p className="mb-6 text-gray-700 font-medium" data-testid="features-cta-text">
            ¿Listo para experimentar todas estas funcionalidades?
          </p>
          <a
            href="/cultivo"
            data-testid="features-explore-button"
            className="inline-flex items-center rounded-lg border border-transparent bg-green-600 px-6 py-3 text-base font-medium text-white transition-all duration-200 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none min-h-[44px]"
            aria-label="Explorar funcionalidades de cultivo"
          >
            <span className="mr-2" aria-hidden="true">🚀</span>
            Explorar Funcionalidades
          </a>
        </div>
      </div>
    </section>
  );
};

export default Features;
