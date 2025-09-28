'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * 🔐 PÁGINA DE LOGIN - Autenticación de Usuarios
 *
 * Funcionalidades principales:
 * - 📝 Formulario de login con email y contraseña
 * - 🔄 Validación en tiempo real de campos
 * - ⏳ Estados de carga durante autenticación
 * - 🚨 Manejo y visualización de errores
 * - 🎯 Redirección post-login a página destino
 * - 📱 UI responsive y accesible
 * - 🛡️ Advertencia sobre credenciales fake (demo)
 *
 * Flujo de autenticación:
 * 1. Usuario llega desde ruta protegida (con parámetro 'next')
 * 2. Completa formulario de login
 * 3. Sistema valida credenciales (simulado)
 * 4. Si es exitoso, redirige a la página original
 * 5. Si falla, muestra mensaje de error
 *
 * @returns JSX de la página de login completa
 */

// Componente interno que usa useSearchParams, envuelto en Suspense
function LoginForm() {
  // 🎣 HOOKS DE AUTENTICACIÓN Y NAVEGACIÓN
  const { login } = useAuth();           // Función de login del AuthProvider
  const router = useRouter();            // Router para redirecciones post-login
  const sp = useSearchParams();          // Para leer parámetros de URL

  // 📊 ESTADOS LOCALES DEL FORMULARIO
  const [email, setEmail] = useState('');                    // Email ingresado
  const [pwd, setPwd] = useState('');                        // Contraseña ingresada
  const [err, setErr] = useState<string | null>(null);       // Error de validación/login
  const [loading, setLoading] = useState(false);             // Estado de carga durante login

  /**
   * 🎯 URL DE DESTINO POST-LOGIN
   * 
   * Determina a dónde redirigir después del login exitoso:
   * - Si viene de una ruta protegida: usa el parámetro 'next'
   * - Si accede directamente: va a /notas por defecto
   */
  const next = sp.get('next') || '/notas';

  /**
   * 📝 MANEJO DEL ENVÍO DEL FORMULARIO
   * 
   * Función asíncrona que procesa el intento de login:
   * 1. Previene el comportamiento por defecto del form
   * 2. Activa estado de carga
   * 3. Limpia errores previos
   * 4. Intenta hacer login con credenciales
   * 5. Si es exitoso: redirige a la página destino
   * 6. Si falla: muestra el error al usuario
   * 7. Siempre: desactiva estado de carga
   * 
   * @param e - Evento del formulario HTML
   */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); // 🚫 Evita recarga de página
    
    try {
      // ⏳ INICIA ESTADO DE CARGA
      setLoading(true);
      setErr(null); // Limpia errores anteriores
      
      // 🔐 INTENTA AUTENTICACIÓN
      await login(email.trim(), pwd); // Credenciales fake para demo
      
      // ✅ LOGIN EXITOSO - Redirige a destino
      router.replace(next);
      
    } catch (e: unknown) {
      // ❌ ERROR EN LOGIN - Muestra mensaje al usuario
      const errorMessage = e instanceof Error ? e.message : 'No se pudo iniciar sesión';
      setErr(errorMessage);
    } finally {
      // 🔄 SIEMPRE desactiva loading (exitoso o fallido)
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6 space-y-4">
      
      {/* 🎯 TÍTULO PRINCIPAL */}
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      
      {/* 🚨 MENSAJE DE ERROR (condicional) */}
      {/* Solo se muestra si hay un error de login */}
      {err && <p className="text-red-600 text-sm">{err}</p>}
      
      {/* 📝 FORMULARIO DE LOGIN */}
      <form onSubmit={onSubmit} className="space-y-3 rounded-xl border p-4">
        
        {/* 📧 CAMPO EMAIL */}
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
          />
        </div>
        
        {/* 🔒 CAMPO CONTRASEÑA */}
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
          />
        </div>
        
        {/* 🔘 BOTÓN DE ENVÍO */}
        {/* Deshabilitado si está cargando o no hay email */}
        <button 
          disabled={loading || !email} 
          className="rounded-lg border px-3 py-2 disabled:opacity-50 w-full hover:bg-gray-50 transition-colors"
        >
          {loading ? 'Ingresando…' : 'Entrar'}
        </button>
        
      </form>
      
      {/* ⚠️ ADVERTENCIA DEMO */}
      {/* Recuerda a usuarios que es solo para demostración */}
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
