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
      className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50"
      aria-labelledby="hero-title"
      role="banner"
    >
      {/* Elementos decorativos de fondo - agregamos aria-hidden para que los lectores de pantalla los ignoren */}
      <div
        className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2316a34a%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="text-center">
          {/* Badge/Etiqueta superior - mejoramos contraste */}
          <div className="mb-8 inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
            <span className="mr-2" aria-hidden="true">🚀</span>
            Nueva Era en Agricultura Digital
          </div>

          {/* Título principal - agregamos id para aria-labelledby */}
          <h1
            id="hero-title"
            className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl"
          >
            Cultiva el{" "}
            <span className="bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              Futuro
            </span>{" "}
            con Bruce
          </h1>

          {/* Subtítulo/Descripción - mejoramos el contraste del texto */}
          <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-gray-700 sm:text-2xl">
            La plataforma integral para gestionar tus cultivos, registrar notas
            detalladas y optimizar tu producción agrícola con inteligencia
            artificial.
          </p>

          {/* Estadísticas o puntos clave - mejoramos contraste y agregamos aria-labels */}
          <div className="mx-auto mb-12 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-green-600" aria-label="Más de 100 tipos de cultivos soportados">100+</div>
              <div className="text-sm text-gray-700 font-medium">Tipos de Cultivos</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-green-600" aria-label="Monitoreo inteligente 24/7">24/7</div>
              <div className="text-sm text-gray-700 font-medium">Monitoreo Inteligente</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-green-600" aria-label="95% de optimización de producción">95%</div>
              <div className="text-sm text-gray-700 font-medium">
                Optimización Producción
              </div>
            </div>
          </div>

          {/* Call-to-Action Buttons - mejoramos tamaños para accesibilidad */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/cultivo"
              className="inline-flex transform items-center rounded-lg border border-transparent bg-green-600 px-8 py-4 text-lg font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-green-700 hover:shadow-xl focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none min-h-[48px]"
              aria-label="Comenzar a gestionar cultivos"
            >
              <span className="mr-2" aria-hidden="true">🌱</span>
              Comenzar Cultivo
            </Link>

            <Link
              href="/notas"
              className="inline-flex items-center rounded-lg border-2 border-green-600 bg-white px-8 py-4 text-lg font-medium text-green-600 transition-all duration-200 hover:bg-green-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none min-h-[48px]"
              aria-label="Ver sección de notas"
            >
              <span className="mr-2" aria-hidden="true">📝</span>
              Ver Notas
            </Link>
          </div>

          {/* Información adicional - mejoramos contraste */}
          <div className="mt-12 text-sm text-gray-600">
            <p>
              ✅ Consultas personalizadas ✅ Datos seguros ✅ Optimizacion del
              cultivo
            </p>
          </div>
        </div>
      </div>

      {/* Elementos decorativos inferiores - agregamos aria-hidden */}
      <div
        className="absolute right-0 bottom-0 left-0 h-20 bg-gradient-to-t from-white to-transparent"
        aria-hidden="true"
      />
    </section>
  );
};

export default Hero;
