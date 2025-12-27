'use client';

import React, { useState } from "react";
import Link from "next/link";
import RequireAuth from "@/lib/auth/RequireAuth";
import CultivoForm from "../components/CultivoForm";
import CalendarioCultivos from "../components/CalendarioCultivos";
import GestionTareasCultivo from "../components/GestionTareasCultivo";
import { useCultivos } from "@/lib/hooks/useCultivos";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { Cultivo } from "@/types/cultivo";
import type { TareaCultivo } from "@/types/planificacion";

/**
 * Página de Cultivo - Dashboard principal para gestión integral de cultivos
 *
 * Características implementadas:
 * - Lista de cultivos existentes con filtros
 * - Formulario para crear nuevos cultivos
 * - Botones para ver detalles de cada cultivo
 * - Gestión de estados (activo/inactivo)
 * - Estadísticas básicas de cultivos
 *
 * Nuevas funcionalidades:
 * - Planificación de cultivos con calendario interactivo
 * - Gestión de tareas con recordatorios automáticos
 */
const CultivoPage = React.memo(() => {
  // Hook personalizado que gestiona todas las operaciones de cultivos
  const { cultivos, loading, error, estadisticas, setQuery, setSort, setFiltroActivo, create, update, remove } =
    useCultivos({ _sort: 'nombre', _order: 'asc' });

  // Hook de autenticación para permisos
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { canCreateCultivo, user } = useAuth();

  // Estados locales para la UI
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [filtroActivo, setFiltroActivoLocal] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [editing, setEditing] = useState<Cultivo | null>(null);
  const [creating, setCreating] = useState(false);

  // Estado para la pestaña activa
  const [pestanaActiva, setPestanaActiva] = useState<'cultivos' | 'planificacion'>('cultivos');

  // Estado para la tarea seleccionada desde el calendario
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaCultivo | null>(null);

  // Función manejadora del formulario de búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  // Función para alternar entre orden ascendente y descendente
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleOrder = () => {
    const next = order === 'asc' ? 'desc' : 'asc';
    setOrder(next);
    setSort('nombre', next);
  };

  // Función para cambiar el filtro de cultivos activos/inactivos
  const handleFiltroChange = (filtro: 'todos' | 'activos' | 'inactivos') => {
    setFiltroActivoLocal(filtro);
    if (filtro === 'todos') {
      setFiltroActivo(undefined);
    } else if (filtro === 'activos') {
      setFiltroActivo(true);
    } else {
      setFiltroActivo(false);
    }
  };

  return (
    <RequireAuth>
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-100 via-slate-50 to-emerald-50 relative overflow-hidden" data-testid="cultivo-page">
        {/* Ambient Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-green-200/30 blur-[100px]" />
          <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-200/20 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl p-6 sm:p-8 space-y-10 relative z-10" data-testid="cultivo-main-wrapper">
          {/* Hero Section - Premium Glass */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl" data-testid="cultivo-hero">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-90" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

            <div className="relative z-10 p-6 sm:p-14 text-center">
              <div
                className="mb-8 inline-flex items-center rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-md border border-white/20 shadow-lg"
                data-testid="cultivo-hero-badge"
              >
                <span className="mr-2 text-lg">✨</span>
                Gestión Inteligente de Cultivos
              </div>

              <h1 className="mb-6 text-3xl font-bold sm:text-6xl tracking-tight text-white drop-shadow-sm" data-testid="cultivo-page-title">
                Tu Dashboard de <br />
                <span className="text-green-50 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
                  Cultivos Inteligentes
                </span>
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-lg sm:text-xl text-green-50 font-light leading-relaxed">
                Monitorea, planifica y optimiza tu producción agrícola con el poder de la inteligencia artificial.
              </p>

              {/* Estadísticas rápidas - Floating Cards */}
              {estadisticas && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 max-w-4xl mx-auto">
                  {[
                    { label: 'Total Cultivos', value: estadisticas.total, icon: '📊' },
                    { label: 'Activos', value: estadisticas.activos, icon: '🟢' },
                    { label: 'Metros Cuadrados', value: `${estadisticas.totalMetrosCuadrados.toFixed(1)} m²`, icon: '📐' },
                    { label: 'Total Plantas', value: estadisticas.totalPlantas, icon: '🌱' }
                  ].map((stat, idx) => (
                    <div key={`step-stat-${idx}`} className="group bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="text-2xl sm:text-3xl font-bold text-white mb-1 group-hover:scale-110 transition-transform origin-left inline-block">
                        {stat.value}
                      </div>
                      <div className="text-[10px] sm:text-xs font-medium text-green-100 uppercase tracking-wider flex items-center justify-between">
                        {stat.label}
                        <span className="opacity-50">{stat.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pestañas de navegación - Glass Pill Style */}
          <div className="flex justify-center mb-8" data-testid="cultivo-tabs-container">
            <div className="bg-white/60 p-1 sm:p-1.5 rounded-full shadow-lg backdrop-blur-md border border-white/40 inline-flex">
              {[
                { id: 'cultivos', label: 'Mis Cultivos', icon: '🌿' },
                { id: 'planificacion', label: 'Planificación', icon: '📅' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPestanaActiva(tab.id as 'cultivos' | 'planificacion')}
                  className={`
                    flex items-center gap-2 px-5 py-2 sm:px-8 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300
                    ${pestanaActiva === tab.id
                      ? 'bg-green-600 text-white shadow-md transform scale-100'
                      : 'text-gray-600 hover:text-green-700 hover:bg-green-50/50'
                    }
                  `}
                >
                  <span className="text-base sm:text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido Dinámico */}
          <div className="relative min-h-[400px]">
            {pestanaActiva === 'cultivos' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                {/* Barra de Herramientas */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/50">
                  <form onSubmit={handleSearch} className="relative w-full lg:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar por nombre..."
                      className="block w-full pl-11 pr-4 py-3 bg-white/50 border-0 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500/50 focus:bg-white transition-all shadow-inner"
                    />
                  </form>

                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="flex bg-white/50 p-1 rounded-xl shadow-inner border border-white/50 flex-1 lg:flex-none">
                      {['todos', 'activos', 'inactivos'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => handleFiltroChange(filter as 'todos' | 'activos' | 'inactivos')}
                          className={`
                              px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all flex-1 text-center
                              ${filtroActivo === filter
                              ? 'bg-white text-green-700 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                            }
                            `}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>

                    {canCreateCultivo() && (
                      <button
                        onClick={() => { setCreating(true); setEditing(null); }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-600/20 transition-all hover:-translate-y-0.5"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="whitespace-nowrap">Nuevo Cultivo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de Cultivos */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Cargando tus cultivos...</p>
                  </div>
                ) : error ? (
                  <div className="rounded-2xl bg-red-50 p-6 border border-red-100 flex items-center gap-4 text-red-800">
                    <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="font-bold">Error al cargar</h3>
                      <p className="text-sm opacity-80">{error}</p>
                    </div>
                  </div>
                ) : cultivos.length === 0 ? (
                  <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-dashed border-gray-300">
                    <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-4xl">🌱</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Aún no hay cultivos</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                      Comienza tu viaje agrícola creando tu primer espacio de cultivo. Podrás monitorear cada detalle.
                    </p>
                    {canCreateCultivo() && (
                      <button
                        onClick={() => setCreating(true)}
                        className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-colors"
                      >
                        Crear Primer Cultivo
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {cultivos.map((cultivo) => (
                      <div
                        key={cultivo.id}
                        className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-green-700 transition-colors">
                                {cultivo.nombre}
                              </h3>
                              {cultivo.activo && <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                              </span>}
                            </div>
                            <p className="text-sm font-medium text-gray-500">{cultivo.genetica || 'Sin genética especificada'}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${cultivo.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {cultivo.activo ? 'Activo' : 'Finalizado'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-50 p-3 rounded-xl">
                            <div className="text-xs text-gray-400 mb-1">Plantas</div>
                            <div className="font-semibold text-gray-700 flex items-center gap-1">
                              <span>🌱</span> {cultivo.numeroplantas || 0}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-xl">
                            <div className="text-xs text-gray-400 mb-1">Superficie</div>
                            <div className="font-semibold text-gray-700 flex items-center gap-1">
                              <span>📐</span> {cultivo.metrosCuadrados || 0} m²
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                          <Link
                            href={`/cultivo/${cultivo.id}`}
                            className="flex-1 text-center py-2.5 rounded-lg bg-green-50 text-green-700 font-semibold text-sm hover:bg-green-100 transition-colors"
                          >
                            Ver Tablero
                          </Link>
                          <button
                            onClick={() => { setEditing(cultivo); setCreating(false); }}
                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          {canCreateCultivo() && (
                            <button
                              onClick={async () => {
                                const ok = confirm(`¿Eliminar ${cultivo.nombre}?`);
                                if (ok) await remove(cultivo.id);
                              }}
                              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Modal de Creación/Edición en Slide-over o similar podía ser mejor, pero mantenemos inline por simplicidad pero mejorado */}
                {(creating || editing) && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                      <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-bold text-gray-900">
                            {creating ? 'Nuevo Espacio de Cultivo' : 'Editar Cultivo'}
                          </h2>
                          <button
                            onClick={() => { setCreating(false); setEditing(null); }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <CultivoForm
                          initial={editing || undefined}
                          onSubmit={async (payload) => {
                            if (creating) {
                              await create(payload);
                              setCreating(false);
                            } else if (editing) {
                              await update(editing.id, payload);
                              setEditing(null);
                            }
                          }}
                          onCancel={() => {
                            setCreating(false);
                            setEditing(null);
                          }}
                          submitLabel={creating ? "Crear Espacio" : "Guardar Cambios"}
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl border border-white/50">
                <div className="space-y-8">
                  <CalendarioCultivos
                    onTareaClick={(tarea) => setTareaSeleccionada(tarea)}
                  />
                  <GestionTareasCultivo
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    onTareaClick={(tarea) => { /* TODO: Implementar detalle de tarea desde gestión */ }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de detalles de tarea (Estilo Glass) */}
        {tareaSeleccionada && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
              <div className="p-8">
                {/* Header Modal */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Detalles de Tarea</h3>
                    <p className="text-gray-500">Información completa de la actividad</p>
                  </div>
                  <button
                    onClick={() => setTareaSeleccionada(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Body Modal */}
                <div className="bg-white/50 rounded-2xl p-6 mb-8 border border-gray-100 shadow-inner">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-gray-800">{tareaSeleccionada.titulo}</h4>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full 
                          ${tareaSeleccionada.prioridad === 'alta' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {tareaSeleccionada.prioridad}
                      </span>
                    </div>

                    <p className="text-gray-600 leading-relaxed text-lg">{tareaSeleccionada.descripcion || 'Sin descripción detallada.'}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>📅</span> {new Date(tareaSeleccionada.fechaProgramada).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⏱️</span> {tareaSeleccionada.duracionEstimada ? `${tareaSeleccionada.duracionEstimada} min` : 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🔄</span> {tareaSeleccionada.esRecurrente ? 'Recurrente' : 'Única'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => console.log('Editar')}
                    className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all hover:shadow-lg"
                  >
                    Editar Tarea
                  </button>
                  <button
                    onClick={() => setTareaSeleccionada(null)}
                    className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </RequireAuth>
  );
});
CultivoPage.displayName = 'CultivoPage';

export default CultivoPage;
