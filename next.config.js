/**
 * Configuración de Next.js para la aplicación Bruce
 *
 * Archivo de configuración principal de Next.js que permite personalizar
 * el comportamiento del framework.
 *
 * @type {import('next').NextConfig}
 */
import path from 'path';

const nextConfig = {
  // Configuración explícita de alias de paths para resolver problemas de deploy en Render
  // Esto asegura que los alias @/ funcionen correctamente en todos los entornos
  webpack: (config) => {
    // Configurar alias explícito para @/ -> ./src/
    // Usamos process.cwd() en lugar de __dirname para compatibilidad con ES modules
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');

    return config;
  },
};

export default nextConfig;
