"use client";

import React from "react";
import RequireAuth from "@/lib/auth/RequireAuth";

/**
 * Nueva Página - Guía de Cultivo Paso a Paso
 * Reemplaza la funcionalidad anterior de Notas
 */
const CultivationGuidePage = () => {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl text-center space-y-8">
          <div className="bg-white p-12 rounded-2xl shadow-xl border border-blue-100">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
              Guía de Cultivo Inteligente
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Estamos transformando esta sección para brindarte una experiencia revolucionaria.
              Pronto encontrarás aquí tu guía definitiva paso a paso.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto mt-12">
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Paso a Paso</h3>
                <p className="text-sm text-gray-600">Instrucciones detalladas desde la siembra hasta la cosecha.</p>
              </div>

              <div className="p-6 bg-green-50 rounded-xl border border-green-100">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Tracking Inteligente</h3>
                <p className="text-sm text-gray-600">Seguimiento automatizado del progreso de tus plantas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
};

export default CultivationGuidePage;
