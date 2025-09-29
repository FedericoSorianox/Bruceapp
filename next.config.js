/**
 * Configuración de Next.js para la aplicación Bruce
 *
 * Archivo de configuración principal de Next.js que permite personalizar
 * el comportamiento del framework.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Configuración explícita de alias de paths para resolver problemas de deploy en Render
  // Esto asegura que los alias @/ funcionen correctamente en todos los entornos
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Agregar alias explícito para @/ -> ./src/
    config.resolve.alias['@/'] = config.resolve.alias['@/'] || './src/';

    return config;
  },
};

module.exports = nextConfig;
