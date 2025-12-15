/**
 * Configuración de Next.js para la aplicación CanopIA (ESM)
 *
 * Migrado a ESM para evitar `require()` y cumplir con las reglas de lint.
 * Incluye configuración PWA y alias de paths.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import withPWA from 'next-pwa';

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración PWA
const withPWAConfig = withPWA({
  dest: 'public',
  register: false, // Desactivado porque registramos manualmente
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Configuración más conservadora para evitar conflictos
  buildExcludes: [/manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*$/i,
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
      urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*$/i,
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
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');

    return config;
  },
};

export default withPWAConfig(nextConfig);


