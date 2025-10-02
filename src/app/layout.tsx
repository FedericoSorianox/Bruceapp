import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/lib/auth/AuthProvider';

// Importar componentes de layout
import Header from "./components/Header";
import Footer from "./components/Footer";

/**
 * 🎨 CONFIGURACIÓN DE FUENTES DE GOOGLE FONTS
 * 
 * Inter: Fuente sans-serif moderna y legible
 * - Optimizada para pantallas digitales
 * - Variable font con múltiples pesos
 * - Usada para texto general y UI
 * 
 * JetBrains Mono: Fuente monoespaciada profesional  
 * - Diseñada específicamente para código
 * - Excelente legibilidad en editores
 * - Ligaduras opcionales para programación
 */
const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

/**
 * 🌐 METADATA DE LA APLICACIÓN PARA SEO Y PWA
 *
 * Configuración completa para optimización en motores de búsqueda:
 * - Títulos dinámicos con template personalizado
 * - Descripción rica en keywords relevantes
 * - Open Graph para redes sociales (Facebook, LinkedIn)
 * - Twitter Cards para mejor visualización en Twitter
 * - Robots.txt optimizado para indexación
 * - Autores y creadores para credibilidad
 * - Configuración PWA: manifest, theme-color, viewport
 */
export const metadata: Metadata = {
  title: {
    default: "Bruce - Agricultura Inteligente",
    template: "%s | Bruce App",
  },
  description:
    "Plataforma integral para gestión de cultivos, notas agrícolas y optimización de producción con inteligencia artificial.",
  keywords: [
    "agricultura",
    "cultivos",
    "notas agrícolas",
    "gestión agrícola",
    "inteligencia artificial",
    "IoT",
  ],
  authors: [{ name: "Bruce Team" }],
  creator: "Bruce App",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://bruce.app",
    title: "Bruce - Agricultura Inteligente",
    description: "Transforma tu agricultura con tecnología avanzada",
    siteName: "Bruce App",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bruce - Agricultura Inteligente",
    description: "Plataforma integral para gestión de cultivos con IA",
    creator: "@bruceapp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Configuración PWA
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bruce App",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

/**
 * 📱 CONFIGURACIÓN DE VIEWPORT PARA PWA
 *
 * Configuración específica para Progressive Web App:
 * - Viewport responsivo para dispositivos móviles
 * - Theme color para barra de navegación del navegador
 * - Configuración optimizada para instalación como app
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#22c55e",
};

/**
 * 🏗️ ROOTLAYOUT - Layout Principal de la Aplicación
 *
 * Características y responsabilidades:
 * - 🌐 Envuelve toda la app con AuthProvider para estado global de autenticación
 * - 🧭 Header global con navegación principal visible en todas las páginas
 * - 📄 Footer global con información y enlaces importantes
 * - 🎨 Estructura semántica HTML5 optimizada para SEO y accesibilidad
 * - ✨ Variables CSS personalizadas para fuentes (Inter + JetBrains Mono)
 * - 📱 Layout flex responsivo con sticky footer
 * - 🚀 Optimizado para hidratación SSR/SSG de Next.js
 * - 🛡️ suppressHydrationWarning para evitar warnings de hidratación
 *
 * Flujo de renderizado:
 * 1. HTML base con fuentes y estilos globales
 * 2. AuthProvider envuelve todo para contexto de autenticación
 * 3. Header fijo en la parte superior
 * 4. Main flexible que se adapta al contenido (flex-1)
 * 5. Footer sticky en la parte inferior
 *
 * @param children - Contenido dinámico de cada página/ruta de la aplicación
 * @returns JSX del layout completo con estructura global
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body 
        className={`${interSans.variable} ${jetBrainsMono.variable} flex h-full flex-col antialiased`}
        suppressHydrationWarning={true}
      >
        {/* 🌐 PROVEEDOR DE AUTENTICACIÓN GLOBAL */}
        {/* Envuelve toda la aplicación para acceso al contexto de auth */}
        <AuthProvider>
          
          {/* 🧭 HEADER GLOBAL */}
          {/* Navegación principal visible en todas las páginas */}
          <Header />

          {/* 📄 CONTENIDO PRINCIPAL DINÁMICO */}
          {/* Área flexible que se adapta al contenido de cada página */}
          {/* flex-1 hace que ocupe todo el espacio disponible entre header y footer */}
          <main className="flex-1">
            {children}
          </main>

          {/* 🦶 FOOTER GLOBAL */}
          {/* Información y enlaces importantes, siempre en el bottom */}
          <Footer />
          
        </AuthProvider>
      </body>
    </html>
  );
}
