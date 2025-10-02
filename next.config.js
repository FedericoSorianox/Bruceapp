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
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
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
