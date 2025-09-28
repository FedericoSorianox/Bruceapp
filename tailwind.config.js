/**
 * Configuración de Tailwind CSS para la aplicación Bruce
 *
 * Este archivo configura Tailwind CSS para que escanee los archivos correctos
 * y aplique las personalizaciones necesarias para el diseño de la aplicación.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  /**
   * Content - Archivos que Tailwind debe escanear para generar clases CSS
   *
   * Tailwind CSS solo incluye en el bundle final las clases que encuentra
   * en estos archivos, lo que mantiene el CSS optimizado y pequeño.
   */
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',     // Páginas tradicionales de Next.js
    './src/components/**/*.{js,ts,jsx,tsx,mdx}', // Componentes reutilizables
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',       // App Router de Next.js 13+
  ],

  /**
   * Theme - Personalización del sistema de diseño
   *
   * Aquí extendemos el tema por defecto de Tailwind con nuestras
   * personalizaciones específicas para Bruce.
   */
  theme: {
    extend: {
      /**
       * Font Family - Fuentes personalizadas
       *
       * Usamos variables CSS definidas en globals.css para mantener
       * consistencia con Next.js y Google Fonts.
       */
      fontFamily: {
        sans: ['var(--font-inter-sans)'],        // Fuente principal para texto
        mono: ['var(--font-jetbrains-mono)'],    // Fuente monoespaciada para código
      },

      /**
       * Colors - Colores personalizados
       *
       * Variables CSS para colores que podrían cambiar dinámicamente
       * (modo oscuro, temas, etc.)
       */
      colors: {
        background: 'var(--background)',  // Color de fondo principal
        foreground: 'var(--foreground)',  // Color de texto principal
      },

      /**
       * Aquí podríamos agregar más extensiones:
       *
       * spacing: {},     // Espaciado personalizado
       * borderRadius: {}, // Bordes redondeados personalizados
       * animation: {},   // Animaciones personalizadas
       * screens: {},     // Breakpoints personalizados
       */
    },
  },

  /**
   * Plugins - Extensiones de Tailwind CSS
   *
   * Plugins que añaden funcionalidad extra. Actualmente vacío,
   * pero podríamos agregar:
   * - @tailwindcss/forms - Para estilos de formularios
   * - @tailwindcss/typography - Para estilos de texto ricos
   * - @tailwindcss/aspect-ratio - Para relaciones de aspecto
   */
  plugins: [],
}
