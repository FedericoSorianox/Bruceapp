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
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
        <div className="mx-auto max-w-7xl p-8 space-y-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <span className="mr-2">🌱</span>
                Gestión Inteligente de Cultivos
              </div>

              <h1 className="mb-6 text-4xl font-bold sm:text-5xl">
                Tu Dashboard de
                <br />
                <span className="text-green-200">Cultivos Inteligentes</span>
              </h1>

              <p className="mx-auto mb-8 max-w-3xl text-xl text-green-100">
                Monitorea, planifica y optimiza todos tus cultivos desde una sola plataforma.
              </p>

              {/* Estadísticas rápidas */}
              {estadisticas && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold">{estadisticas.total}</div>
                    <div className="text-sm text-green-200">Total Cultivos</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold">{estadisticas.activos}</div>
                    <div className="text-sm text-green-200">Activos</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold">{estadisticas.totalMetrosCuadrados.toFixed(1)}</div>
                    <div className="text-sm text-green-200">m² Totales</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold">{estadisticas.totalPlantas}</div>
                    <div className="text-sm text-green-200">Plantas</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pestañas de navegación */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setPestanaActiva('cultivos')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  pestanaActiva === 'cultivos'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">🌱</span>
                Cultivos
              </button>
              <button
                onClick={() => setPestanaActiva('planificacion')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  pestanaActiva === 'planificacion'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">📅</span>
                Planificación
              </button>
            </div>

            {/* Contenido de pestañas */}
            {pestanaActiva === 'cultivos' && (
              <>
                {/* Barra de herramientas para cultivos */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Búsqueda */}
                    <form onSubmit={handleSearch} className="flex gap-3">
                      <div className="relative">
                        <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Buscar cultivos..."
                          className="pl-4 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 focus:ring-4 focus:ring-green-200"
                      >
                        Buscar
                      </button>
                    </form>

                    {/* Controles */}
                    <div className="flex gap-3 ml-auto">
                      <select
                        value={filtroActivo}
                        onChange={(e) => handleFiltroChange(e.target.value as 'todos' | 'activos' | 'inactivos')}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 focus:ring-4 focus:ring-gray-200"
                      >
                        <option value="todos">Todos</option>
                        <option value="activos">Activos</option>
                        <option value="inactivos">Finalizados</option>
                      </select>

                      <button
                        onClick={toggleOrder}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 focus:ring-4 focus:ring-gray-200"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        Orden: {order.toUpperCase()}
                      </button>

                      {canCreateCultivo() && (
                        <button
                          onClick={() => { setCreating(true); setEditing(null); }}
                          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 focus:ring-4 focus:ring-green-200"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Nuevo Cultivo
                        </button>
                      )}
                      {!canCreateCultivo() && (
                        <div className="px-4 py-3 text-sm text-gray-500 bg-gray-100 rounded-xl">
                          <span className="font-medium">Solo administradores</span> pueden crear cultivos
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Formulario de creación/edición */}
                {(creating || editing) && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-3 rounded-xl ${creating ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {creating ? (
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        ) : (
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {creating ? 'Crear nuevo cultivo' : `Editar cultivo: ${editing?.nombre}`}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {creating ? 'Complete los campos para crear un nuevo cultivo' : 'Modifique los campos que desea actualizar'}
                        </p>
                      </div>
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
                      submitLabel={creating ? "Crear cultivo" : "Actualizar cultivo"}
                    />
                  </div>
                )}

                {/* Lista de cultivos */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                  {loading && (
                    <div className="p-12 text-center">
                      <div className="inline-flex items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
                        <span className="text-lg font-medium text-gray-600">Cargando cultivos...</span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-8 text-center">
                      <div className="inline-flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                        <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-700 font-medium">Error: {error}</span>
                      </div>
                    </div>
                  )}

                  {!loading && !error && (
                    <>
                      {cultivos.length === 0 ? (
                        <div className="p-12 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <div>
                              <span className="text-gray-500 font-medium text-lg">No hay cultivos para mostrar</span>
                              <p className="text-gray-400 text-sm mt-1">Comience creando su primer cultivo para gestionar su producción</p>
                            </div>
                            {canCreateCultivo() && (
                              <button
                                onClick={() => setCreating(true)}
                                className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                              >
                                Crear mi primer cultivo
                              </button>
                            )}
                            {!canCreateCultivo() && (
                              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-800 text-sm">
                                  <span className="font-medium">Nota:</span> Solo los administradores pueden crear nuevos cultivos.
                                  Tu rol actual: <span className="font-medium">{user?.role}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                          {cultivos.map((cultivo) => (
                            <div key={cultivo.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                              {/* Header */}
                              <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-gray-900 text-lg truncate">{cultivo.nombre}</h3>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    cultivo.activo
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {cultivo.activo ? 'Activo' : 'Finalizado'}
                                  </span>
                                </div>
                                {cultivo.genetica && (
                                  <p className="text-sm text-gray-600 mt-1">{cultivo.genetica}</p>
                                )}
                              </div>

                              {/* Content */}
                              <div className="p-4 space-y-3">
                                {cultivo.metrosCuadrados && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">📐</span>
                                    <span>{cultivo.metrosCuadrados} m²</span>
                                  </div>
                                )}
                                {cultivo.numeroplantas && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">🌱</span>
                                    <span>{cultivo.numeroplantas} plantas</span>
                                  </div>
                                )}
                                {cultivo.fechaComienzo && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">📅</span>
                                    <span>Inicio: {cultivo.fechaComienzo}</span>
                                  </div>
                                )}
                                {cultivo.sustrato && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">🏺</span>
                                    <span className="truncate">{cultivo.sustrato}</span>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="p-4 border-t border-gray-100 flex gap-2">
                                <Link
                                  href={`/cultivo/${cultivo.id}`}
                                  className="flex-1 text-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
                                >
                                  Ver detalles
                                </Link>
                                <button
                                  onClick={() => { setEditing(cultivo); setCreating(false); }}
                                  className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                >
                                  Editar
                                </button>
                                {canCreateCultivo() && ( // Solo admins pueden eliminar cultivos
                                  <button
                                    onClick={async () => {
                                      const ok = confirm(`¿Está seguro de que desea eliminar el cultivo "${cultivo.nombre}"?`);
                                      if (ok) await remove(cultivo.id);
                                    }}
                                    className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                  >
                                    Eliminar
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {/* Pestaña de Planificación */}
            {pestanaActiva === 'planificacion' && (
              <div className="space-y-8">
                {/* Calendario de tareas */}
                <CalendarioCultivos
                  onTareaClick={(tarea) => {
                    setTareaSeleccionada(tarea);
                  }}
                />

                {/* Gestión de tareas */}
                <GestionTareasCultivo
                  onTareaClick={(tarea) => {
                    console.log('Tarea seleccionada:', tarea);
                    // Aquí podrías abrir un modal con detalles de la tarea
                  }}
                />
              </div>
            )}

            </div>
          </div>

          {/* Modal de detalles de tarea */}
          {tareaSeleccionada && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Detalles de la Tarea
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Información completa de la tarea seleccionada
                      </p>
                    </div>
                    <button
                      onClick={() => setTareaSeleccionada(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{tareaSeleccionada.titulo}</h4>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-300">
                            {tareaSeleccionada.tipo}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${tareaSeleccionada.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                            {tareaSeleccionada.prioridad}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-sm font-medium ${tareaSeleccionada.estado === 'completada' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {tareaSeleccionada.estado}
                          </span>
                        </div>

                        {tareaSeleccionada.descripcion && (
                          <p className="text-gray-600 mb-3">{tareaSeleccionada.descripcion}</p>
                        )}

                        <div className="grid gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span>📅 Fecha programada:</span>
                            <span className="font-medium">{new Date(tareaSeleccionada.fechaProgramada).toLocaleDateString()}</span>
                          </div>

                          {tareaSeleccionada.horaProgramada && (
                            <div className="flex items-center gap-2">
                              <span>🕐 Hora programada:</span>
                              <span className="font-medium">{tareaSeleccionada.horaProgramada}</span>
                            </div>
                          )}

                          {tareaSeleccionada.duracionEstimada && (
                            <div className="flex items-center gap-2">
                              <span>⏱️ Duración estimada:</span>
                              <span className="font-medium">{tareaSeleccionada.duracionEstimada} minutos</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <span>🔄 Es recurrente:</span>
                            <span className="font-medium">{tareaSeleccionada.esRecurrente ? 'Sí' : 'No'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span>🔔 Recordatorio activado:</span>
                            <span className="font-medium">{tareaSeleccionada.recordatorioActivado ? 'Sí' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        // Aquí podrías implementar la edición de la tarea
                        console.log('Editar tarea:', tareaSeleccionada);
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      Editar Tarea
                    </button>
                    <button
                      onClick={() => setTareaSeleccionada(null)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
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
};

});

CultivoPage.displayName = 'CultivoPage';

export default CultivoPage;
