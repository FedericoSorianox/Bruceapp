"use client";

import { useState } from "react";
import RequireAuth from "@/lib/auth/RequireAuth";
import { formatearFechaCorta } from "@/lib/utils/date";
import NoteForm from "@/components/NoteForm";
import { useNotes } from "@/lib/hooks/useNotes";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { Note } from "@/lib/services/notes";

/**
 * Página de Administración de Notas - Panel exclusivo para administradores
 *
 * Funcionalidades avanzadas:
 * - CRUD completo de notas (crear, leer, actualizar, eliminar)
 * - Vista de todas las notas del sistema
 * - Filtros y búsqueda avanzada
 * - Estadísticas del sistema
 * - Gestión de usuarios y permisos
 */
const AdminNotesPage = () => {
  // Estados para la gestión de la interfaz
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Hook para operaciones CRUD de notas
  const { notes, loading, error, create, update, remove, params } = useNotes({ _sort: 'date', _order: 'desc' });

  // Hook de autenticación
  const { user } = useAuth();

  // Estados para controlar el modal de creación/edición
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState<Note | null>(null);

  // Verificar permisos de administrador
  const isAdmin = user?.role === 'admin';

  // Obtener lista única de autores para el filtro
  const authors = Array.from(new Set(notes.map(note => note.author).filter(Boolean)));

  // Función para reintentar carga cuando hay error
  const handleRetry = () => {
    params._sort = 'date';
    params._order = 'desc';
  };

  /**
   * Función para filtrar notas basado en múltiples criterios
   */
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchTerm === "" ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.tags || []).some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || note.category === selectedCategory;

    const matchesAuthor =
      selectedAuthor === "all" || note.author === selectedAuthor;

    return matchesSearch && matchesCategory && matchesAuthor;
  });

  /**
   * Función para obtener el color de la categoría
   */
  const getCategoryColor = (category: string) => {
    const colors = {
      siembra: "bg-green-100 text-green-800",
      riego: "bg-blue-100 text-blue-800",
      fertilizacion: "bg-yellow-100 text-yellow-800",
      plaga: "bg-red-100 text-red-800",
      cosecha: "bg-purple-100 text-purple-800",
      observacion: "bg-gray-100 text-gray-800",
    };
    return colors[category as keyof typeof colors] || colors.observacion;
  };

  /**
   * Función para obtener el color de prioridad
   */
  const getPriorityColor = (priority: string) => {
    const colors = {
      baja: "border-l-green-500",
      media: "border-l-yellow-500",
      alta: "border-l-red-500",
    };
    return colors[priority as keyof typeof colors] || colors.media;
  };

  /**
   * Función para manejar la eliminación de notas
   */
  const handleDelete = async (note: Note) => {
    try {
      await remove(note.id);
      setDeleting(null);
    } catch (error) {
      console.error('Error al eliminar nota:', error);
    }
  };

  /**
   * Función para manejar la actualización de notas
   */
  const handleUpdate = async (payload: Omit<Note, 'id'>) => {
    if (editing) {
      try {
        await update(editing.id, payload);
        setEditing(null);
      } catch (error) {
        console.error('Error al actualizar nota:', error);
      }
    }
  };

  /**
   * Función para manejar la creación de notas
   */
  const handleCreate = async (payload: Omit<Note, 'id'>) => {
    try {
      await create(payload);
      setCreating(false);
    } catch (error) {
      console.error('Error al crear nota:', error);
    }
  };

  // Renderizar loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando notas...
          </h2>
          <p className="text-gray-600">
            Obteniendo datos desde db.json
          </p>
        </div>
      </div>
    );
  }

  // Renderizar error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="rounded-full bg-red-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Error al cargar las notas
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section específica de Admin Notas */}
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="mb-6 text-4xl font-bold sm:text-5xl">
                Panel de Administración
                <br />
                <span className="text-blue-200">Notas del Sistema</span>
              </h1>

              <p className="mx-auto mb-8 max-w-3xl text-xl text-blue-100">
                Gestión completa del sistema de notas. Crea, edita, elimina y supervisa
                todas las notas del sistema desde este panel exclusivo para administradores.
              </p>
            </div>
          </div>
        </section>

        {/* Dashboard de Administración */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Estadísticas de Administración */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-5">
              <div className="rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Notas
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {notes.length}
                    </p>
                  </div>
                  <div className="rounded-full bg-blue-100 p-3">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-red-500 bg-white p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Alta Prioridad
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {notes.filter((n) => n.priority === "alta").length}
                    </p>
                  </div>
                  <div className="rounded-full bg-red-100 p-3">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-green-500 bg-white p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Con Imágenes
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {notes.filter((n) => n.hasImages).length}
                    </p>
                  </div>
                  <div className="rounded-full bg-green-100 p-3">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-purple-500 bg-white p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Esta Semana
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {
                        notes.filter(
                          (n) =>
                            n.date &&
                            new Date(n.date) >
                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        ).length
                      }
                    </p>
                  </div>
                  <div className="rounded-full bg-purple-100 p-3">
                    <svg
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-orange-500 bg-white p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Autores Únicos
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {authors.length}
                    </p>
                  </div>
                  <div className="rounded-full bg-orange-100 p-3">
                    <svg
                      className="h-6 w-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Controles de Filtros y Vista */}
            <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Búsqueda */}
                <div className="max-w-md flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar en notas, tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    />
                    <svg
                      className="absolute top-2.5 left-3 h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Filtros */}
                <div className="flex items-center gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas las categorías</option>
                    <option value="siembra">Siembra</option>
                    <option value="riego">Riego</option>
                    <option value="fertilizacion">Fertilización</option>
                    <option value="plaga">Plagas</option>
                    <option value="cosecha">Cosecha</option>
                    <option value="observacion">Observación</option>
                  </select>

                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los autores</option>
                    {authors.map((author) => (
                      <option key={author} value={author}>
                        {author}
                      </option>
                    ))}
                  </select>

                  {/* Toggle Vista */}
                  <div className="flex rounded-lg border border-gray-300">
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 ${viewMode === "list" ? "bg-blue-500 text-white" : "bg-white text-gray-700"} rounded-l-lg`}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 ${viewMode === "grid" ? "bg-blue-500 text-white" : "bg-white text-gray-700"} rounded-r-lg`}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Botón Nueva Nota - solo para administradores */}
                  {isAdmin && (
                    <button
                      onClick={() => { setCreating(true); setEditing(null); }}
                      className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Nueva Nota
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Lista/Grid de Notas */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                  : "space-y-4"
              }
            >
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`rounded-lg border-l-4 bg-white shadow-md transition-shadow duration-200 hover:shadow-lg ${getPriorityColor(note.priority || 'media')}`}
                >
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                          {note.title}
                        </h3>
                        <div className="mb-3 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(note.category || 'observacion')}`}
                          >
                            {note.category || 'Sin categoría'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {note.cropArea || 'Sin área'}
                          </span>
                          {note.hasImages && (
                            <span className="text-green-600">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botones de acción para administradores */}
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditing(note)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            aria-label="Editar nota"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleting(note)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors duration-200"
                            aria-label="Eliminar nota"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                      {note.content}
                    </p>

                    <div className="mb-4 flex flex-wrap gap-1">
                      {(note.tags || []).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
                        >
                          #{tag}
                        </span>
                      ))}
                      {(note.tags || []).length > 3 && (
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          +{(note.tags || []).length - 3} más
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{note.author || 'Sin autor'}</span>
                      <span>
                        {note.date ? formatearFechaCorta(note.date) : 'Sin fecha'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mensaje si no hay notas */}
            {filteredNotes.length === 0 && (
              <div className="py-12 text-center">
                <svg
                  className="mx-auto mb-4 h-16 w-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  No se encontraron notas
                </h3>
                <p className="mb-4 text-gray-600">
                  Intenta ajustar los filtros o crear una nueva nota.
                </p>
                {isAdmin ? (
                  <button
                    onClick={() => { setCreating(true); setEditing(null); }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
                  >
                    Crear Primera Nota
                  </button>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No tienes permisos para crear notas. Contacta a un administrador.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Modal de creación de notas */}
        {creating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl">
              {/* Header del modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-green-100 text-green-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Crear nueva nota
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Complete los campos para crear una nueva nota
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCreating(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                <NoteForm
                  onSubmit={handleCreate}
                  onCancel={() => setCreating(false)}
                  submitLabel="Crear nota"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición de notas */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl">
              {/* Header del modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Editar nota: {editing.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Modifique los campos que desea actualizar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                <NoteForm
                  initial={editing}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditing(null)}
                  submitLabel="Actualizar nota"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {deleting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl">
              {/* Header del modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-red-100 text-red-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Eliminar nota
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleting(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                <p className="mb-6 text-gray-600">
                  ¿Estás seguro de que quieres eliminar la nota &ldquo;{deleting.title}&rdquo;?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleting(null)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleDelete(deleting)}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors duration-200"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequireAuth>
  );
};

export default AdminNotesPage;