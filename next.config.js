/**
 * Configuración de Next.js para la aplicación Bruce
 *
 * Archivo de configuración principal de Next.js que permite personalizar
 * el comportamiento del framework.
 *
 * Incluye configuración PWA para Progressive Web App
 *
 * @type {import('next').NextConfig}
 */
const path = require('path');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: false, // Desactivado porque registramos manualmente
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Configuración más conservadora para evitar conflictos
  buildExcludes: [/manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        },
      },
    },
  ],
});

const nextConfig = {
  // Configuración de imágenes para Next.js
  images: {
    // Permitir imágenes de dominios locales y API endpoints
    domains: ['bruceapp.onrender.com', 'localhost', 'res.cloudinary.com'],
    // Configurar paths remotos para API endpoints locales
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bruceapp.onrender.com',
        port: '',
        pathname: '/api/galeria/temp/**',
      },
      // Permitir imágenes directas desde Cloudinary
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/galeria/temp/**',
      },
    ],
  },
  // Configuración explícita de alias de paths para resolver problemas de deploy en Render
  // Esto asegura que los alias @/ funcionen correctamente en todos los entornos
  webpack: (config) => {
    // Configurar alias explícito para @/ -> ./src/
    // Usamos __dirname para CommonJS compatibility
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');

    return config;
  },
};

module.exports = withPWA(nextConfig);
