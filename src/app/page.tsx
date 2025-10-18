import type { Metadata } from "next";

// Importar componentes personalizados para la página principal
import Hero from "./components/Hero";
import Features from "./components/Features";
import CTA from "./components/CTA";
/*import Blog from "./blog/page";*/
/*import Contador from './components/contador'; // Prueba de haber creado un componente de contador*/

/**
 * Metadata específica para la página principal
 * Optimizada para SEO y conversión
 */
export const metadata: Metadata = {
  title: "Bruce - Agricultura Inteligente | Plataforma de Gestión de Cultivos",
  description:
    "Transforma tu agricultura con Bruce. Plataforma integral para gestión de cultivos, notas agrícolas y optimización de producción con inteligencia artificial y IoT.",
  keywords: [
    "agricultura inteligente",
    "gestión cultivos",
    "IoT agrícola",
    "inteligencia artificial agricultura",
    "notas agrícolas",
    "monitoreo cultivos",
  ],
  openGraph: {
    title: "Bruce - Agricultura Inteligente",
    description:
      "La plataforma más avanzada para la gestión moderna de cultivos",
    type: "website",
  },
};

/**
 * Página Principal - Homepage de Bruce App
 *
 * Arquitectura de componentes:
 * - Hero: Sección de bienvenida e impacto inicial
 * - Features: Características principales de la plataforma
 * - CTA: Call-to-action final para conversión
 *
 * Esta página implementa un funnel de conversión completo:
 * 1. Captar atención (Hero)
 * 2. Mostrar valor (Features)
 * 3. Generar acción (CTA)
 */
const HomePage = () => {
  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* 
        Hero Section - Primera impresión
        Objetivo: Captar atención y comunicar valor propuesto
        Técnicas: Gradient backgrounds, social proof, CTAs prominentes
      */}
      <Hero />

      {/* 
        Features Section - Demostración de valor
        Objetivo: Explicar características y beneficios específicos
        Técnicas: Grid responsive, iconografía clara, beneficios tangibles
      */}
      <Features />
{/* blog agregado para prueba*/}
     {/* <Blog /> */}
      {/* 
        CTA Section - Conversión final
        Objetivo: Motivar acción con elementos de urgencia y confianza
        Técnicas: Social proof, risk reduction, multiple CTAs
      */}
      <CTA />
     {/* <Contador /> Boton de contador agregado para prueba*/ }
    </div>
  );
};

export default HomePage;
