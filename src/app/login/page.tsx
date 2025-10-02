"use client";

import { useState, Suspense } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * 🔐 PÁGINA DE LOGIN/REGISTRO - Autenticación de Usuarios
 *
 * Funcionalidades:
 * - Formulario de login y registro con toggle
 * - Validaciones y errores
 * - Estados de carga
 * - Redirección post-auth
 * - UI accesible y simple
 */
function LoginForm() {
  // 🎣 HOOKS
  const { login, register } = useAuth();
  const router = useRouter();
  const sp = useSearchParams();

  // 📊 ESTADOS
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🎯 Destino post-auth
  const next = sp.get('next') || '/notas';

  // 🧮 Helpers de validación
  const isEmailValid = email.includes('@');
  const isPwdValid = pwd.length >= 6;
  const isPwdMatch = mode === 'login' ? true : pwd === pwd2;

  // 🧭 Toggle modo
  const handleToggleMode = () => {
    setErr(null);
    setMode((m) => (m === 'login' ? 'register' : 'login'));
  };

  // 🚀 Submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setErr(null);

      if (!isEmailValid) {
        throw new Error('Email inválido');
      }
      if (!isPwdValid) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      if (!isPwdMatch) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (mode === 'login') {
        await login(email.trim(), pwd);
      } else {
        await register(email.trim(), pwd);
      }

      router.replace(next);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error de autenticación';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      <h1 className="text-2xl font-bold">{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h1>

      {err && <p className="text-red-600 text-sm" role="alert">{err}</p>}

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border p-4" aria-label={mode === 'login' ? 'Formulario de inicio de sesión' : 'Formulario de registro'}>
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            className="rounded border p-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            aria-invalid={!isEmailValid}
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="pwd" className="text-sm font-medium">Password</label>
          <input
            id="pwd"
            type="password"
            className="rounded border p-2"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            placeholder="Tu contraseña"
            required
            aria-invalid={!isPwdValid}
          />
        </div>

        {mode === 'register' && (
          <div className="grid gap-2">
            <label htmlFor="pwd2" className="text-sm font-medium">Confirmar Password</label>
            <input
              id="pwd2"
              type="password"
              className="rounded border p-2"
              value={pwd2}
              onChange={e => setPwd2(e.target.value)}
              placeholder="Repite tu contraseña"
              required
              aria-invalid={!isPwdMatch}
            />
          </div>
        )}

        <button
          disabled={loading || !email || !pwd || (mode === 'register' && !pwd2)}
          className="rounded-lg border px-3 py-2 disabled:opacity-50 w-full hover:bg-gray-50 transition-colors"
          aria-busy={loading}
        >
          {loading ? (mode === 'login' ? 'Ingresando…' : 'Creando cuenta…') : (mode === 'login' ? 'Entrar' : 'Crear cuenta')}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleToggleMode}
            className="text-sm text-blue-600 hover:underline"
            aria-label={mode === 'login' ? 'Ir a crear cuenta' : 'Ir a iniciar sesión'}
          >
            {mode === 'login' ? '¿No tenés cuenta? Crear cuenta' : '¿Ya tenés cuenta? Iniciar sesión'}
          </button>
        </div>
      </form>

      <p className="text-xs text-gray-600 text-center">
        * Demo educativa: no uses credenciales reales.
      </p>
    </main>
  );
}

// Componente principal de la página que envuelve LoginForm en Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto max-w-sm p-6 space-y-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
