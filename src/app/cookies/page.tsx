import React from 'react';
import Link from 'next/link';

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-extrabold text-slate-900">Política de Cookies</h1>
          <Link
            href="/cultivo"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            ← Volver a CanopIA
          </Link>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>CanopIA</strong> utiliza únicamente cookies técnicas esenciales (como <code>auth-token</code>)
          necesarias para mantener tu sesión segura y autenticar tus peticiones a la plataforma.
        </p>
      </div>
    </main>
  );
}
