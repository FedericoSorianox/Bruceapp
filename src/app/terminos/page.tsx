import React from 'react';
import Link from 'next/link';

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900">Términos y Condiciones de Uso</h1>
          <Link
            href="/cultivo"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            ← Volver a CanopIA
          </Link>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Bienvenido a <strong>CanopIA</strong>. El uso de esta plataforma de gestión y asistencia agronómica
          está destinado al seguimiento técnico y control de cultivos conforme a la normativa vigente en tu
          jurisdicción.
        </p>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">1. Alcance de las Recomendaciones de IA</h2>
          <p>
            Los protocolos de pH, EC, VPD y diagnóstico clínico provistos por la Base de Conocimiento de
            CanopIA constituyen guías técnicas de referencia agronómica.
          </p>
        </div>
      </div>
    </main>
  );
}
