'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import RequireAuth from '@/lib/auth/RequireAuth';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useCultivos } from '@/lib/hooks/useCultivos';
import { usePlanificacion } from '@/lib/hooks/usePlanificacion';
import { calcularMetricasFases } from '@/lib/services/cultivos';
import CultivoForm from '../components/CultivoForm';
import CalendarioCultivos from '../components/CalendarioCultivos';
import GestionTareasCultivo from '../components/GestionTareasCultivo';
import type { Cultivo, CultivoCreacion } from '@/types/cultivo';
import type { TareaCultivo } from '@/types/planificacion';

export default function CultivoPage() {
  return (
    <RequireAuth>
      <CultivoContent />
    </RequireAuth>
  );
}

function CultivoContent() {
  const { user, canCreateCultivo, canDeleteCultivo, canEditRecursos } = useAuth();
  const {
    cultivos,
    loading,
    error,
    estadisticas,
    create,
    update,
    remove,
    finalizar,
    reactivar,
    iniciarFloracion,
  } = useCultivos();

  const planificacion = usePlanificacion({
    _sort: 'fechaProgramada',
    _order: 'asc',
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cultivoEditando, setCultivoEditando] = useState<Cultivo | null>(null);
  const [busquedaLocal, setBusquedaLocal] = useState('');
  const [filtroFase, setFiltroFase] = useState<'todos' | 'vegetacion' | 'floracion' | 'finalizados'>('todos');
  const [ordenPor, setOrdenPor] = useState<'nombre' | 'fechaCreacion' | 'metrosCuadrados' | 'numeroplantas'>('fechaCreacion');
  const [ordenDir, setOrdenDir] = useState<'asc' | 'desc'>('desc');
  const [vistaActiva, setVistaActiva] = useState<'cultivos' | 'planificacion'>('cultivos');
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaCultivo | null>(null);

  // Filtrado y ordenamiento instantáneo en memoria (0ms latencia)
  const cultivosFiltrados = useMemo(() => {
    const q = busquedaLocal.trim().toLowerCase();

    return cultivos
      .filter((c) => {
        if (filtroFase === 'finalizados') {
          if (c.activo !== false) return false;
        } else if (filtroFase === 'vegetacion') {
          if (c.activo === false || c.fechaInicioFloracion) return false;
        } else if (filtroFase === 'floracion') {
          if (c.activo === false || !c.fechaInicioFloracion) return false;
        }

        if (!q) return true;
        return (
          c.nombre.toLowerCase().includes(q) ||
          (c.genetica && c.genetica.toLowerCase().includes(q)) ||
          (c.sustrato && c.sustrato.toLowerCase().includes(q)) ||
          (c.notas && c.notas.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        const dir = ordenDir === 'asc' ? 1 : -1;
        if (ordenPor === 'nombre') {
          return a.nombre.localeCompare(b.nombre) * dir;
        }
        if (ordenPor === 'metrosCuadrados') {
          return ((a.metrosCuadrados || 0) - (b.metrosCuadrados || 0)) * dir;
        }
        if (ordenPor === 'numeroplantas') {
          return ((a.numeroplantas || 0) - (b.numeroplantas || 0)) * dir;
        }
        const dateA = a.fechaComienzo || a.fechaCreacion || '';
        const dateB = b.fechaComienzo || b.fechaCreacion || '';
        return dateA.localeCompare(dateB) * dir;
      });
  }, [cultivos, busquedaLocal, filtroFase, ordenPor, ordenDir]);

  const tareasUrgentesHoy = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return planificacion.tareas.filter(
      (t) => (t.estado === 'pendiente' || t.estado === 'en_progreso') && t.fechaProgramada <= hoy
    );
  }, [planificacion.tareas]);

  const handleCrearCultivo = async (datos: CultivoCreacion) => {
    await create({
      ...datos,
      creadoPor: user?.email || 'unknown',
    });
    setMostrarFormulario(false);
  };

  const handleActualizarCultivo = async (datos: CultivoCreacion) => {
    if (!cultivoEditando) return;
    await update(cultivoEditando.id, {
      ...datos,
      editadoPor: user?.email || 'unknown',
    });
    setCultivoEditando(null);
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setCultivoEditando(null);
  };

  const handleEliminarCultivo = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el cultivo "${nombre}"?`)) {
      try {
        await remove(id);
      } catch (err) {
        console.error('Error al eliminar cultivo:', err);
      }
    }
  };

  const handleToggleEstado = async (cultivo: Cultivo) => {
    try {
      if (cultivo.activo !== false) {
        await finalizar(cultivo.id);
      } else {
        await reactivar(cultivo.id);
      }
    } catch (err) {
      console.error('Error al cambiar estado del cultivo:', err);
    }
  };

  const handlePasarAFloracion = async (cultivo: Cultivo) => {
    if (window.confirm(`¿Iniciar fase de floración hoy para "${cultivo.nombre}"?`)) {
      try {
        await iniciarFloracion(cultivo.id);
      } catch (err) {
        console.error('Error al iniciar floración:', err);
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16">
      {/* Hero Compacto de Comando */}
      <div className="bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Centro de Control Agronómico
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Mis Cultivos & Planificación
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-1">
                Monitorea fases vegetativas y florales, objetivos nutricionales y calendario operativo en tiempo real.
              </p>
            </div>

            {canCreateCultivo() && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setCultivoEditando(null);
                    setMostrarFormulario(true);
                    setVistaActiva('cultivos');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Cultivo
                </button>
                <Link
                  href="/laboratorio/simulador"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all text-sm"
                >
                  <span>🌡️</span>
                  <span>Simulador VPD & Doctor IA</span>
                </Link>
              </div>
            )}
          </div>

          {/* KPIs Rápidos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-7">
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Cultivos Activos</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">{estadisticas.activos}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">de {estadisticas.total} registrados</div>
            </div>
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Total Plantas</div>
              <div className="text-2xl font-extrabold text-white mt-1">{estadisticas.totalPlantas}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">en seguimiento</div>
            </div>
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Área Total</div>
              <div className="text-2xl font-extrabold text-teal-400 mt-1">
                {estadisticas.totalMetrosCuadrados.toFixed(1)} <span className="text-sm font-normal">m²</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">superficie cultivada</div>
            </div>
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Tareas para Hoy</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                {planificacion.estadisticas.tareasHoy}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {planificacion.estadisticas.tareasPendientes} pendientes totales
              </div>
            </div>
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Tareas Vencidas</div>
              <div
                className={`text-2xl font-extrabold mt-1 ${
                  planificacion.estadisticas.tareasVencidas > 0 ? 'text-rose-400' : 'text-slate-300'
                }`}
              >
                {planificacion.estadisticas.tareasVencidas}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">requieren atención</div>
            </div>
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Cumplimiento</div>
              <div className="text-2xl font-extrabold text-sky-400 mt-1">
                {planificacion.estadisticas.productividad}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {planificacion.estadisticas.tareasCompletadas} completadas
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Banner inteligente de tareas del día / urgentes */}
        {tareasUrgentesHoy.length > 0 && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start sm:items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Tienes {tareasUrgentesHoy.length}{' '}
                  {tareasUrgentesHoy.length === 1 ? 'tarea programada para hoy o vencida' : 'tareas programadas para hoy o vencidas'}
                </h3>
                <p className="text-xs text-amber-700 mt-0.5">
                  Próxima: <span className="font-semibold">{tareasUrgentesHoy[0].titulo}</span>
                  {tareasUrgentesHoy[0].horaProgramada ? ` (${tareasUrgentesHoy[0].horaProgramada} hs)` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => planificacion.completar(tareasUrgentesHoy[0].id)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                ✓ Completar ahora
              </button>
              <button
                onClick={() => setVistaActiva('planificacion')}
                className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Ver Calendario ({planificacion.estadisticas.tareasPendientes})
              </button>
            </div>
          </div>
        )}

        {/* Selector de Vista Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="bg-white p-1.5 rounded-2xl shadow-xs border border-slate-200 inline-flex">
            <button
              onClick={() => setVistaActiva('cultivos')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                vistaActiva === 'cultivos'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>🌱</span>
              <span>Salas y Cultivos ({cultivos.length})</span>
            </button>
            <button
              onClick={() => setVistaActiva('planificacion')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                vistaActiva === 'planificacion'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>📅</span>
              <span>Calendario y Tareas ({planificacion.estadisticas.tareasPendientes} pendientes)</span>
            </button>
          </div>

          {vistaActiva === 'cultivos' && (
            <div className="flex flex-wrap items-center gap-2">
              {(['todos', 'vegetacion', 'floracion', 'finalizados'] as const).map((fase) => {
                const labels = {
                  todos: 'Todos',
                  vegetacion: '🌱 En Vegetación',
                  floracion: '🌸 En Floración',
                  finalizados: '📦 Finalizados',
                };
                return (
                  <button
                    key={fase}
                    onClick={() => setFiltroFase(fase)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      filtroFase === fase
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {labels[fase]}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Formulario Modal / Desplegable para Crear o Editar Cultivo */}
        {(mostrarFormulario || cultivoEditando) && (
          <div className="animate-fadeIn">
            <CultivoForm
              initial={cultivoEditando || undefined}
              onSubmit={cultivoEditando ? handleActualizarCultivo : handleCrearCultivo}
              onCancel={handleCancelarFormulario}
            />
          </div>
        )}

        {/* VISTA 1: SALAS Y CULTIVOS */}
        {vistaActiva === 'cultivos' && (
          <>
            {/* Barra de Búsqueda Instantánea y Ordenamiento */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, genética, sustrato o notas..."
                    value={busquedaLocal}
                    onChange={(e) => setBusquedaLocal(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 outline-none transition-all"
                  />
                  <svg
                    className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {busquedaLocal && (
                    <button
                      onClick={() => setBusquedaLocal('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ordenar:</span>
                  <select
                    value={ordenPor}
                    onChange={(e) => setOrdenPor(e.target.value as typeof ordenPor)}
                    className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="fechaCreacion">Fecha de inicio</option>
                    <option value="nombre">Nombre (A-Z)</option>
                    <option value="numeroplantas">N° de Plantas</option>
                    <option value="metrosCuadrados">Área (m²)</option>
                  </select>
                  <button
                    onClick={() => setOrdenDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                    className="px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700"
                    title="Invertir orden"
                  >
                    {ordenDir === 'asc' ? '↑ Asc' : '↓ Desc'}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 flex items-center gap-3">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600 mb-3" />
                <p className="text-slate-600 font-medium">Cargando tus salas de cultivo...</p>
              </div>
            ) : cultivosFiltrados.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                <div className="text-5xl mb-3">🌱</div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">No se encontraron cultivos</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                  {busquedaLocal || filtroFase !== 'todos'
                    ? 'Prueba limpiando los filtros de búsqueda para ver todas tus salas.'
                    : 'Crea tu primer cultivo para llevar control de fases, clima, tareas y asistencia IA.'}
                </p>
                {busquedaLocal || filtroFase !== 'todos' ? (
                  <button
                    onClick={() => {
                      setBusquedaLocal('');
                      setFiltroFase('todos');
                    }}
                    className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl"
                  >
                    Ver todos los cultivos
                  </button>
                ) : (
                  canCreateCultivo() && (
                    <button
                      onClick={() => setMostrarFormulario(true)}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md"
                    >
                      + Crear Primer Cultivo
                    </button>
                  )
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cultivosFiltrados.map((cultivo) => {
                  const metricas = calcularMetricasFases(cultivo);
                  const enFloracion = metricas.faseActual === 'floracion';
                  const tareasCultivoPendientes = planificacion.tareas.filter(
                    (t) => t.cultivoId === cultivo.id && (t.estado === 'pendiente' || t.estado === 'en_progreso')
                  ).length;

                  return (
                    <div
                      key={cultivo.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-200 flex flex-col overflow-hidden group"
                    >
                      {/* Top Color Strip */}
                      <div
                        className={`h-1.5 w-full ${
                          cultivo.activo === false
                            ? 'bg-slate-300'
                            : enFloracion
                              ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                      />

                      <div className="p-6 flex-1 flex flex-col">
                        {/* Header & Phase Badge */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <Link
                              href={`/cultivo/${cultivo.id}`}
                              className="text-lg font-extrabold text-slate-900 hover:text-emerald-600 transition-colors block truncate"
                            >
                              {cultivo.nombre}
                            </Link>
                            <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                              🧬 {cultivo.genetica || 'Genética sin especificar'}
                            </p>
                          </div>

                          {cultivo.activo === false ? (
                            <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              Finalizado
                            </span>
                          ) : enFloracion ? (
                            <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              🌸 Sem {metricas.semanaFloracion} Flora ({metricas.diasFloracionActual}d)
                            </span>
                          ) : (
                            <span className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              🌱 Sem {metricas.semanaVegetacion} Vege ({metricas.diasVegetacionActual}d)
                            </span>
                          )}
                        </div>

                        {/* Sustrato y Tareas Pendientes */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          {cultivo.sustrato && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                              🪴 {cultivo.sustrato}
                            </span>
                          )}
                          {tareasCultivoPendientes > 0 && (
                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                              📋 {tareasCultivoPendientes} {tareasCultivoPendientes === 1 ? 'tarea' : 'tareas'}
                            </span>
                          )}
                        </div>

                        {/* Grid de Métricas Técnicas */}
                        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 text-center">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Plantas</div>
                            <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                              {cultivo.numeroplantas ?? '-'}
                            </div>
                          </div>
                          <div className="border-x border-slate-200/70">
                            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Espacio</div>
                            <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                              {cultivo.metrosCuadrados ? `${cultivo.metrosCuadrados} m²` : '-'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Luz</div>
                            <div className="text-sm font-extrabold text-slate-800 mt-0.5">
                              {cultivo.potenciaLamparas ? `${cultivo.potenciaLamparas}W` : '-'}
                            </div>
                          </div>
                        </div>

                        {/* Objetivos Nutricionales si existen */}
                        {(cultivo.phObjetivo || cultivo.ecObjetivo || cultivo.aguaDiariaObjetivo) && (
                          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs mb-4">
                            <span className="font-semibold text-emerald-800">Objetivos:</span>
                            <div className="flex items-center gap-3 text-emerald-700 font-bold">
                              {cultivo.phObjetivo && <span>pH {cultivo.phObjetivo}</span>}
                              {cultivo.ecObjetivo && <span>EC {cultivo.ecObjetivo}</span>}
                              {cultivo.aguaDiariaObjetivo && <span>💧 {cultivo.aguaDiariaObjetivo}L/d</span>}
                            </div>
                          </div>
                        )}

                        {cultivo.notas && (
                          <p className="text-xs text-slate-500 line-clamp-2 italic mb-4">
                            &ldquo;{cultivo.notas}&rdquo;
                          </p>
                        )}

                        {/* Botones de Acción */}
                        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <Link
                            href={`/cultivo/${cultivo.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-xs"
                          >
                            <span>Abrir Sala & IA</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>

                          {cultivo.activo !== false && !enFloracion && canEditRecursos(cultivo.creadoPor || '') && (
                            <button
                              onClick={() => handlePasarAFloracion(cultivo)}
                              className="p-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors text-xs font-bold"
                              title="Iniciar Fase de Floración"
                            >
                              🌸 Flora
                            </button>
                          )}

                          {canEditRecursos(cultivo.creadoPor || '') && (
                            <button
                              onClick={() => {
                                setCultivoEditando(cultivo);
                                setMostrarFormulario(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-2.5 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 transition-colors"
                              title="Editar parámetros"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}

                          {canEditRecursos(cultivo.creadoPor || '') && (
                            <button
                              onClick={() => handleToggleEstado(cultivo)}
                              className="p-2.5 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 border border-slate-200 transition-colors"
                              title={cultivo.activo !== false ? 'Finalizar cultivo' : 'Reactivar cultivo'}
                            >
                              {cultivo.activo !== false ? '📦' : '🔄'}
                            </button>
                          )}

                          {canDeleteCultivo(cultivo.creadoPor || '') && (
                            <button
                              onClick={() => handleEliminarCultivo(cultivo.id, cultivo.nombre)}
                              className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
                              title="Eliminar cultivo"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* VISTA 2: PLANIFICACIÓN UNIFICADA (CALENDARIO + GESTOR DE TAREAS SINCRONIZADOS) */}
        {vistaActiva === 'planificacion' && (
          <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <CalendarioCultivos
                  planificacion={planificacion}
                  onTareaClick={(tarea) => setTareaSeleccionada(tarea)}
                  mostrarSoloActivas={false}
                />
              </div>

              <div className="lg:col-span-5">
                <GestionTareasCultivo
                  planificacion={planificacion}
                  cultivos={cultivos}
                  onTareaClick={(tarea) => setTareaSeleccionada(tarea)}
                  mostrarSoloActivas={false}
                />
              </div>
            </div>

            {/* Modal interactivo al hacer clic en una tarea del calendario */}
            {tareaSeleccionada && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        Detalle de Tarea
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                        {tareaSeleccionada.titulo}
                      </h3>
                    </div>
                    <button
                      onClick={() => setTareaSeleccionada(null)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      ✕
                    </button>
                  </div>

                  {tareaSeleccionada.descripcion && (
                    <p className="text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4">
                      {tareaSeleccionada.descripcion}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 mb-6">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block mb-0.5">Fecha Programada</span>
                      <span className="font-bold text-slate-800">
                        📅 {new Date(tareaSeleccionada.fechaProgramada).toLocaleDateString()}
                        {tareaSeleccionada.horaProgramada ? ` · ${tareaSeleccionada.horaProgramada}` : ''}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block mb-0.5">Estado / Prioridad</span>
                      <span className="font-bold text-slate-800 capitalize">
                        {tareaSeleccionada.estado.replace('_', ' ')} · {tareaSeleccionada.prioridad}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    {tareaSeleccionada.estado !== 'completada' && (
                      <button
                        onClick={async () => {
                          await planificacion.completar(tareaSeleccionada.id);
                          setTareaSeleccionada(null);
                        }}
                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        ✓ Marcar Completada
                      </button>
                    )}
                    {tareaSeleccionada.cultivoId && (
                      <Link
                        href={`/cultivo/${tareaSeleccionada.cultivoId}`}
                        className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        Ir al Cultivo →
                      </Link>
                    )}
                    <button
                      onClick={() => setTareaSeleccionada(null)}
                      className="py-2.5 px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
