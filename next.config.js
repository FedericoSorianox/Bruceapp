/**
 * Configuración de Next.js para la aplicación Bruce
 *
 * Archivo de configuración principal de Next.js que permite personalizar
 * el comportamiento del framework. Actualmente usa configuración por defecto.
 *
 * @type {import('next').NextConfig}
 *
 * Configuraciones comunes que podrían agregarse en el futuro:
 * - experimental: { appDir: true } - Ya habilitado por defecto en Next.js 13+
 * - images: { domains: ['...'] } - Para optimizar imágenes de dominios externos
 * - env: { ... } - Variables de entorno
 * - redirects/rewrites: Para redirecciones de rutas
 * - headers: Para configurar headers HTTP personalizados
 * - output: 'export' - Para generar sitio estático
 */
const nextConfig = {
  // Configuración vacía = usa valores por defecto de Next.js
  // Esto es perfectamente válido para la mayoría de las aplicaciones

  // Ejemplos de configuraciones que podrían agregarse:
  /*
  experimental: {
    // Características experimentales de Next.js
  },

  images: {
    // Configuración de optimización de imágenes
    domains: ['cdn.example.com'],
    formats: ['image/webp', 'image/avif'],
  },

  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ];
  },
  */
};

module.exports = nextConfig;
