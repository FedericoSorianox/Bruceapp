'use client';

import RequireAuth from '@/lib/auth/RequireAuth';
import { useAuth } from '@/lib/auth/AuthProvider';
import Link from 'next/link';

/**
 * 🛡️ ADMIN LAYOUT - Layout Protegido para Panel de Administración
 * 
 * Funcionalidades principales:
 * - 🔒 Protección de rutas con RequireAuth (doble seguridad)
 * - 🧭 Navegación específica del área de administración
 * - 👤 Información del usuario autenticado en header
 * - 🚪 Botón de logout visible y accesible
 * - 📱 Diseño responsive con max-width centrado
 * - 🎨 UI consistente con Tailwind CSS
 * - 🔄 Logout automático con redirección
 * 
 * Estructura del layout:
 * 1. RequireAuth wrappea todo (protección de acceso)
 * 2. Container principal con max-width
 * 3. Header con navegación interna + info usuario
 * 4. Contenido dinámico de cada página admin
 * 
 * Flujo de protección:
 * - Si no está autenticado: RequireAuth redirige a login
 * - Si está autenticado: muestra panel con navegación
 * - Al hacer logout: limpia sesión y RequireAuth redirige automáticamente
 * 
 * @param children - Páginas específicas del área de administración
 * @returns JSX del layout protegido del panel admin
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // 🎣 HOOKS DE AUTENTICACIÓN
  const { user, logout } = useAuth(); // Acceso a datos del usuario y función logout

  return (
    /* 🛡️ CAPA DE PROTECCIÓN - RequireAuth verifica autenticación antes de renderizar contenido */
    <RequireAuth>
      
      {/* 📦 CONTAINER PRINCIPAL */}
      {/* Centrado y responsive con max-width y padding */}
      <div className="mx-auto max-w-5xl p-4 space-y-6">
        
        {/* 🧭 HEADER DEL PANEL ADMIN */}
        <header className="flex items-center justify-between rounded-xl border p-3">
          
          {/* 📍 NAVEGACIÓN INTERNA DEL ADMIN */}
          <nav className="flex items-center gap-4">
            <Link
              className="underline hover:no-underline transition-all"
              href="/notas"
            >
              Notas
            </Link>
            
            {/* 🔮 ESPACIO PARA FUTURAS SECCIONES */}
            {/* Aquí se pueden agregar más links como: */}
            {/* <Link href="/admin/users">Usuarios</Link> */}
            {/* <Link href="/admin/settings">Configuración</Link> */}
          </nav>
          
          {/* 👤 ÁREA DE USUARIO */}
          <div className="flex items-center gap-3">
            
            {/* 📧 EMAIL DEL USUARIO AUTENTICADO */}
            <span className="text-sm text-gray-600">
              {user?.email} ({user?.role === 'admin' ? 'Administrador' : 'Usuario'})
            </span>
            
            {/* 🚪 BOTÓN DE LOGOUT */}
            <button
              onClick={() => { 
                logout(); 
                // Nota: RequireAuth detecta automáticamente la pérdida de sesión
                // y redirige al login sin necesidad de router.push manual
              }}
              className="rounded-lg border px-3 py-1 hover:bg-gray-50 transition-colors"
            >
              Salir
            </button>
            
          </div>
        </header>
        
        {/* 📄 CONTENIDO ESPECÍFICO DE CADA PÁGINA ADMIN */}
        {/* Aquí se renderiza el contenido de /admin/notes, /admin/users, etc. */}
        {children}
        
      </div>
    </RequireAuth>
  );
}
