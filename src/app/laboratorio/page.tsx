"use client";

import React from "react";
import RequireAuth from "@/lib/auth/RequireAuth";
import Link from "next/link";

/**
 * Página Laboratorio - Centro de Inteligencia y Aprendizaje
 * Reemplaza la antigua sección de Notas
 */
const LaboratorioPage = () => {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50" data-testid="laboratorio-page">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 py-16 text-white relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-2 bg-white/10 rounded-full mb-6 backdrop-blur-sm border border-white/20">
                <span className="text-blue-300 mr-2">🧪</span>
                <span className="text-sm font-medium text-blue-100 uppercase tracking-wider">Centro de Inteligencia</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold sm:text-6xl tracking-tight">
                Laboratorio <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">CanopIA</span>
              </h1>

              <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100/90 font-light">
                Donde la agronomía se encuentra con la inteligencia artificial.
                Aprende, simula y optimiza tus cultivos con precisión científica.
              </p>
            </div>
          </div>
        </section>

        {/* Dashboard Grid */}
        <section className="py-12 -mt-10 relative z-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Tarjeta 1: Academia / Guía */}
              <Link href="/laboratorio/academia" className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 block cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                <div className="p-8 relative">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Academia de Cultivo</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Tu guía paso a paso. Desde la germinación hasta la cosecha, con instrucciones precisas para cada día del ciclo vital.
                  </p>

                  <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Comenzar guía</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Tarjeta 2: Simulador IA */}
              <Link href="/laboratorio/simulador" className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 block cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                <div className="p-8 relative">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Simulador & Diagnóstico</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Sube fotos para detección de plagas o simula condiciones ambientales para prever el comportamiento de tu cultivo.
                  </p>

                  <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Acceder al lab</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Tarjeta 3: Recomendaciones */}
              <Link href="/laboratorio/recomendaciones" className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 block cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                <div className="p-8 relative">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Recomendaciones IA</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Insights personalizados basados en tus datos históricos. Optimiza riego, nutrientes y luz con big data.
                  </p>

                  <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Ver insights</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>

            </div>

            {/* Banner inferior */}
            <div className="mt-12 rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 sm:p-12 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">¿Necesitas ayuda experta?</h3>
                  <p className="text-gray-400">Nuestros ingenieros agrónomos están disponibles para consultas avanzadas.</p>
                </div>
                <button className="px-8 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg shadow-white/10">
                  Contactar Soporte
                </button>
              </div>
            </div>

          </div>
        </section>
      </div>
    </RequireAuth>
  );
};

export default LaboratorioPage;