// ==========================================
// PÁGINA DEL BLOG - page.tsx
// ==========================================
// Esta página muestra una lista paginada de posts del blog.
// Usa el hook usePosts para obtener los datos y maneja la navegación por URL.

// PASO 1: Configuración inicial de la página
'use client'//: Directiva de Next.js que marca este componente como cliente (usa hooks)
// Importaciones necesarias para la funcionalidad
import Link from 'next/link';                    // Para navegación interna con enlaces
import { useSearchParams } from 'next/navigation'; // Hook para leer parámetros de URL
import { usePosts } from '../../lib/hooks/usePosts'; // Nuestro hook personalizado
import { Suspense } from 'react'; // Import para Suspense

// PASO 2: Configuración de paginación
// Definimos cuántos posts mostrar por página (constante para fácil mantenimiento)
const PAGE_SIZE = 10;

// Componente interno que usa useSearchParams
function BlogContent() {
  // PASO 3.1: Obtener el parámetro de página desde la URL
  // useSearchParams nos da acceso a ?page=1, ?page=2, etc.
  const searchParams = useSearchParams(); // lee ?page=...
  const pageParam = searchParams.get('page'); // Obtiene el valor del parámetro 'page'
  // Convierte a número y asegura que sea al menos 1 (página por defecto)
  const page = Math.max(1, Number(pageParam) || 1);

  // PASO 3.2: Usar el hook personalizado para obtener los posts
  // El hook maneja la lógica de fetch, paginación, loading y errores
  const { data: posts, totalPages, loading, error } = usePosts(page, PAGE_SIZE);

  // PASO 3.3: Renderizar la interfaz de usuario
  return (
    // PASO 3.4: Contenedor principal con estilos Tailwind
    // max-w-2xl: ancho máximo de 2xl (672px), centrado con mx-auto
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      {/* PASO 3.5: Título de la página */}
      <h1 className="text-2xl font-bold">Notas</h1>

      {/* PASO 3.6: Estados condicionales de renderizado */}
      {/* Mostrar skeleton mientras carga */}
      {loading && <PostListSkeleton count={PAGE_SIZE} />}

      {/* Mostrar error si ocurre */}
      {error && <p className="text-red-600">Error: {error}</p>}

      {/* Mostrar mensaje si no hay posts */}
      {!loading && !error && posts.length === 0 && <p>No hay posts.</p>}

      {/* PASO 3.7: Lista de posts */}
      {/* Solo renderizar si no está cargando y no hay error */}
      <ul className="space-y-4">
        {!loading && !error && posts.map(p => (
          // Cada post se renderiza como un elemento de lista
          <li key={p.id} className="rounded-xl border p-4">
            {/* Título del post */}
            <h2 className="font-semibold">{p.title}</h2>
            {/* Contenido del post (truncado o resumen) */}
            <p className="text-sm text-gray-600">{p.body}</p>
          </li>
        ))}
      </ul>

      {/* PASO 3.8: Componente de paginación */}
      {/* Siempre se muestra, maneja su propia lógica de habilitación/deshabilitación */}
      <Pager page={page} totalPages={totalPages} />
    </main>
  );
}

// Componente principal de la página que envuelve BlogContent en Suspense
export default function BlogPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto max-w-2xl p-6 space-y-6">
        <h1 className="text-2xl font-bold">Notas</h1>
        <div className="space-y-4">
          <div className="rounded-xl border p-4 animate-pulse">
            <div className="h-4 w-1/3 rounded bg-gray-300 mb-2" />
            <div className="h-3 w-2/3 rounded bg-gray-200" />
          </div>
        </div>
      </main>
    }>
      <BlogContent />
    </Suspense>
  );
}

// ==========================================
// COMPONENTE PAGER - Navegación entre páginas
// ==========================================
// Este componente maneja la navegación entre páginas usando enlaces de Next.js
function Pager({ page, totalPages }: { page: number; totalPages: number }) {
  // PASO 4.1: Calcular estados de los botones
  // El botón anterior se deshabilita en la página 1
  const prevDisabled = page <= 1;
  // El botón siguiente se deshabilita en la última página
  const nextDisabled = page >= totalPages;

  return (
    // PASO 4.2: Contenedor de los controles de paginación
    <div className="flex items-center justify-between gap-4">
      {/* PASO 4.3: Botón de página anterior */}
      <Link
        // Atributo de accesibilidad para lectores de pantalla
        aria-disabled={prevDisabled}
        // Clases condicionales: deshabilitado = opaco y sin eventos de puntero
        className={`rounded-lg border px-3 py-2 ${prevDisabled ? 'pointer-events-none opacity-50' : ''}`}
        // URL con parámetro de página anterior (mínimo página 1)
        href={`?page=${Math.max(1, page - 1)}`}
      >
        ← Anterior
      </Link>

      {/* PASO 4.4: Indicador de página actual */}
      <span className="text-sm text-gray-600">
        {/* Muestra página actual de total (maneja casos donde page > totalPages) */}
        Página {Math.min(page, totalPages)} de {totalPages}
      </span>

      {/* PASO 4.5: Botón de página siguiente */}
      <Link
        // Atributo de accesibilidad para lectores de pantalla
        aria-disabled={nextDisabled}
        // Clases condicionales: deshabilitado = opaco y sin eventos de puntero
        className={`rounded-lg border px-3 py-2 ${nextDisabled ? 'pointer-events-none opacity-50' : ''}`}
        // URL con parámetro de página siguiente (máximo totalPages)
        href={`?page=${Math.min(totalPages, page + 1)}`}
      >
        Siguiente →
      </Link>
    </div>
  );
}

// ==========================================
// COMPONENTE SKELETON - Placeholder mientras carga
// ==========================================
// Muestra una animación de carga que simula la estructura de los posts
function PostListSkeleton({ count = 10 }: { count?: number }) {
  return (
    // PASO 5.1: Lista de elementos skeleton
    <ul className="space-y-4">
      {/* PASO 5.2: Crear array del tamaño especificado y mapear */}
      {Array.from({ length: count }).map((_, i) => (
        // Cada elemento skeleton simula un post con animación de pulso
        <li key={i} className="rounded-xl border p-4 animate-pulse">
          {/* PASO 5.3: Rectángulo para simular el título */}
          <div className="h-4 w-1/3 rounded bg-gray-300 mb-2" />
          {/* PASO 5.4: Rectángulo más ancho para simular el contenido */}
          <div className="h-3 w-2/3 rounded bg-gray-200" />
        </li>
      ))}
    </ul>
  );
}
