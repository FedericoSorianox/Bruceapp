'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const { login, loginDemo, register, user, ready } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (ready && user) {
      const nextUrl = searchParams.get('next') || '/cultivo';
      router.replace(nextUrl);
    }
  }, [ready, user, router, searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const nextUrl = searchParams.get('next') || '/cultivo';
      if (mode === 'login') {
        await login(email.trim(), password, nextUrl);
      } else {
        await register(email.trim(), password, nextUrl);
      }
    } catch (e: unknown) {
      const error = e as Error;
      setErr(error.message ?? 'Error al autenticar');
      setLoading(false);
    }
  }

  async function handleQuickAccess() {
    setErr(null);
    setDemoLoading(true);
    try {
      const nextUrl = searchParams.get('next') || '/cultivo';
      await loginDemo(nextUrl);
    } catch (e: unknown) {
      const error = e as Error;
      setErr(error.message ?? 'Error en acceso rápido');
      setDemoLoading(false);
    }
  }

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Cargando CanopIA...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-600/30">
                🌱
              </div>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Canop<span className="text-emerald-600">IA</span>
              </span>
            </Link>
            <h1 className="text-xl font-bold text-slate-900">
              {mode === 'login' ? 'Bienvenido a tu Centro de Cultivo' : 'Crear nueva cuenta de cultivador'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'login'
                ? 'Ingresa con un clic o usa tus credenciales'
                : 'Configura tu espacio inteligente en segundos'}
            </p>
          </div>

          {/* Botón de Acceso Rápido 1-Clic */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleQuickAccess}
              disabled={demoLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all duration-200 disabled:opacity-60"
            >
              {demoLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Abriendo Panel Principal...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">⚡</span>
                  <span>Entrar Ahora (Acceso Rápido Principal)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Inicia sesión instantáneamente en la cuenta principal con tus salas, tareas y laboratorio activos.
            </p>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              o con email y contraseña
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Selector de modo */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErr(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErr(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                type="email"
                placeholder="test@canopia.app"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-slate-900 text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {err && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2">
                <span>⚠️</span>
                <span>{err}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-3 font-semibold text-white text-sm transition-all disabled:opacity-50"
            >
              {loading
                ? mode === 'login'
                  ? 'Iniciando sesión...'
                  : 'Creando cuenta...'
                : mode === 'login'
                  ? 'Iniciar Sesión con Email'
                  : 'Crear Cuenta Gratis'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
