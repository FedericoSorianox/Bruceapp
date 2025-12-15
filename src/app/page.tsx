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
  title: "CanopIA - Agricultura Inteligente | Plataforma de Gestión de Cultivos",
  description:
    "Transforma tu agricultura con CanopIA. Plataforma integral para gestión de cultivos, notas agrícolas y optimización de producción con inteligencia artificial y IoT.",
  keywords: [
    "agricultura inteligente",
    "gestión cultivos",
    "IoT agrícola",
    "inteligencia artificial agricultura",
    "notas agrícolas",
    "monitoreo cultivos",
  ],
  openGraph: {
    title: "CanopIA - Agricultura Inteligente",
    description:
      "La plataforma más avanzada para la gestión moderna de cultivos",
    type: "website",
  },
};

/**
 * Página Principal - Homepage de CanopIA
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
    <div className="min-h-screen relative overflow-hidden bg-slate-50" data-testid="home-page">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-green-200/20 blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-100/30 blur-[100px]" />
        <div className="absolute -bottom-[10%] right-[20%] w-[40%] h-[40%] rounded-full bg-blue-100/20 blur-[100px]" />
      </div>

      <div className="relative z-10">
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
        {/* <Contador /> Boton de contador agregado para prueba*/}
      </div>
    </div>
  );
};

export default HomePage;
