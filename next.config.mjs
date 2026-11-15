/**
 * Configuración de Next.js para la aplicación CanopIA (ESM)
 *
 * Nota sobre PWA / Service Worker:
 * En Next.js 14 App Router, `next-pwa` (Workbox precache) genera entradas inválidas como
 * `/_next/app-build-manifest.json` que provocan `Uncaught (in promise) bad-precaching-response (404)`.
 * Por ello usamos un Service Worker nativo y limpio en `public/sw.js` que limpia cachés obsoletas
 * de Workbox automáticamente sin fallar en producción.
 */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  images: {
    domains: ['bruceapp.onrender.com', 'canopia.danguardlab.cloud', 'localhost', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bruceapp.onrender.com',
        port: '',
        pathname: '/api/galeria/temp/**',
      },
      {
        protocol: 'https',
        hostname: 'canopia.danguardlab.cloud',
        port: '',
        pathname: '/api/galeria/temp/**',
      },
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
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

export default nextConfig;
