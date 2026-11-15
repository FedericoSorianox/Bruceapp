import React from 'react';
import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900">Política de Privacidad</h1>
          <Link
            href="/cultivo"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            ← Volver a CanopIA
          </Link>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          En <strong>CanopIA</strong> protegemos la confidencialidad de los datos agronómicos, bitácoras,
          fotografías y configuraciones de sala de cada usuario mediante aislamiento multi-tenant.
        </p>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">1. Uso de Datos Agronómicos e IA</h2>
          <p>
            Los parámetros de tus cultivos se utilizan exclusivamente para calcular recomendaciones desde la
            Base de Conocimiento Agronómica y personalizar las alertas operativas de tu cuenta.
          </p>
          <h2 className="text-base font-bold text-slate-900">2. Seguridad y Almacenamiento</h2>
          <p>
            Las credenciales se almacenan cifradas con bcrypt y las sesiones se gestionan mediante tokens JWT
            firmados.
          </p>
        </div>
      </div>
    </main>
  );
}
