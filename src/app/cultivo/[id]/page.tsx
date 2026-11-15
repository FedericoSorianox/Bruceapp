'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RequireAuth from '@/lib/auth/RequireAuth';
import CultivoForm from '../../components/CultivoForm';
import ChatIA from '../../components/ChatIA';
import ComentariosCultivo from '../../components/ComentariosCultivo';
import GaleriaCultivo from '../../components/GaleriaCultivo';
import CalendarioCultivos from '../../components/CalendarioCultivos';
import GestionTareasCultivo from '../../components/GestionTareasCultivo';
import { useCultivos } from '@/lib/hooks/useCultivos';
import { usePlanificacion } from '@/lib/hooks/usePlanificacion';
import { calcularMetricasFases } from '@/lib/services/cultivos';
import type { Cultivo } from '@/types/cultivo';
import type { TareaCultivo } from '@/types/planificacion';
import { formatearFechaCorta } from '@/lib/utils/date';

interface MetricasCalculadas {
  diasDesdeInicio?: number;
  plantasPorM2?: string;
  wattsPorM2?: string;
  litrosTotales?: number;
  faseActual?: 'vegetacion' | 'floracion';
  diasVegetacionActual?: number;
  diasFloracionActual?: number;
  semanaVegetacion?: number;
  semanaFloracion?: number;
}

export default function CultivoDetailPage() {
  return (
    <RequireAuth>
      <CultivoDetailContent />
    </RequireAuth>
  );
}

function CultivoDetailContent() {
  const params = useParams();
  const router = useRouter();
  const cultivoId = params.id as string;

  const { getById, update, remove, finalizar, reactivar, iniciarFloracion } = useCultivos();

  const planificacion = usePlanificacion({
    cultivoId,
    _sort: 'fechaProgramada',
    _order: 'asc',
  });

  const [cultivo, setCultivo] = useState<Cultivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [vistaActiva, setVistaActiva] = useState<'detalles' | 'chat' | 'comentarios' | 'galeria' | 'planificacion'>('detalles');
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaCultivo | null>(null);

  // Estado para edición rápida de fecha de inicio de floración
  const [editandoFechaFlora, setEditandoFechaFlora] = useState(false);
  const [fechaFloraInput, setFechaFloraInput] = useState('');
  const [guardandoFechaFlora, setGuardandoFechaFlora] = useState(false);
  const [errorFechaFlora, setErrorFechaFlora] = useState<string | null>(null);

  const loadCultivo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cultivoData = await getById(cultivoId);
      setCultivo(cultivoData);
      setFechaFloraInput(cultivoData.fechaInicioFloracion || new Date().toISOString().split('T')[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el cultivo');
    } finally {
      setLoading(false);
    }
  }, [cultivoId, getById]);

  useEffect(() => {
    if (cultivoId) {
      loadCultivo();
    }
  }, [cultivoId, loadCultivo]);

  const tareasUrgentesHoy = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return planificacion.tareas.filter(
      (t) =>
        t.cultivoId === cultivoId &&
        (t.estado === 'pendiente' || t.estado === 'en_progreso') &&
        t.fechaProgramada <= hoy
    );
  }, [planificacion.tareas, cultivoId]);

  const handleUpdate = async (payload: Partial<Cultivo>) => {
    if (!cultivo) return;
    const updated = await update(cultivo.id, payload);
    setCultivo(updated);
    setFechaFloraInput(updated.fechaInicioFloracion || new Date().toISOString().split('T')[0]);
    setEditing(false);
  };

  const handleActualizarCultivo = async (cultivoActualizado: Cultivo) => {
    if (!cultivo) return;
    try {
      const cambios: Partial<Cultivo> = {
        galeria: cultivoActualizado.galeria,
      };
      const updated = await update(cultivo.id, cambios);
      setCultivo(updated);
    } catch (err) {
      console.error('Error al actualizar galería:', err);
      setCultivo(cultivoActualizado);
    }
  };

  const handleDelete = async () => {
    if (!cultivo) return;
    const confirmDelete = window.confirm(`¿Estás seguro de eliminar el cultivo "${cultivo.nombre}"?`);
    if (confirmDelete) {
      try {
        await remove(cultivo.id);
        router.push('/cultivo');
      } catch (err) {
        alert('Error al eliminar el cultivo: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      }
    }
  };

  const handleToggleStatus = async () => {
    if (!cultivo) return;
    try {
      const updated = cultivo.activo !== false
        ? await finalizar(cultivo.id)
        : await reactivar(cultivo.id);
      setCultivo(updated);
    } catch (err) {
      alert('Error al cambiar el estado: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  const handleGuardarFechaFloracion = async (nuevaFecha?: string) => {
    if (!cultivo) return;
    const fechaAGuardar = nuevaFecha !== undefined ? nuevaFecha : fechaFloraInput;

    if (fechaAGuardar && cultivo.fechaComienzo && fechaAGuardar < cultivo.fechaComienzo) {
      setErrorFechaFlora('La fecha de inicio de floración no puede ser anterior a la fecha de comienzo del cultivo.');
      return;
    }

    setGuardandoFechaFlora(true);
    setErrorFechaFlora(null);
    try {
      const updated = fechaAGuardar
        ? await iniciarFloracion(cultivo.id, fechaAGuardar)
        : await update(cultivo.id, { fechaInicioFloracion: '' });
      setCultivo(updated);
      setFechaFloraInput(updated.fechaInicioFloracion || new Date().toISOString().split('T')[0]);
      setEditandoFechaFlora(false);
    } catch (err) {
      setErrorFechaFlora(err instanceof Error ? err.message : 'Error al actualizar la fecha de floración');
    } finally {
      setGuardandoFechaFlora(false);
    }
  };

  const calcularMetricas = (c: Cultivo): MetricasCalculadas => {
    const m: MetricasCalculadas = {};

    if (c.fechaComienzo) {
      const inicio = new Date(c.fechaComienzo);
      const hoy = new Date();
      const diffTime = Math.max(0, hoy.getTime() - inicio.getTime());
      m.diasDesdeInicio = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    if (c.numeroplantas && c.metrosCuadrados) {
      m.plantasPorM2 = (c.numeroplantas / c.metrosCuadrados).toFixed(2);
    }

    if (c.potenciaLamparas && c.metrosCuadrados) {
      m.wattsPorM2 = (c.potenciaLamparas / c.metrosCuadrados).toFixed(1);
    }

    if (c.litrosMaceta && c.numeroplantas) {
      m.litrosTotales = c.litrosMaceta * c.numeroplantas;
    }

    const metricasFases = calcularMetricasFases(c);
    m.faseActual = metricasFases.faseActual;
    m.diasVegetacionActual = metricasFases.diasVegetacionActual;
    m.diasFloracionActual = metricasFases.diasFloracionActual;
    m.semanaVegetacion = metricasFases.semanaVegetacion;
    m.semanaFloracion = metricasFases.semanaFloracion;

    return m;
  };

  if (loading) {
    return (
      <main
        data-testid="cultivo-main-loading"
        className="min-h-screen bg-slate-50 pt-20 pb-16 flex items-center justify-center px-4"
      >
        <div
          data-testid="cultivo-loading-box"
          className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs max-w-md w-full"
        >
          <div
            data-testid="cultivo-loading-spinner"
            className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-200 border-t-emerald-600 mb-3"
          />
          <p data-testid="cultivo-loading-text" className="text-slate-600 font-semibold">
            Cargando sala de cultivo...
          </p>
        </div>
      </main>
    );
  }

  if (error || !cultivo) {
    return (
      <main
        data-testid="cultivo-main-error"
        className="min-h-screen bg-slate-50 pt-20 pb-16 flex items-center justify-center px-4"
      >
        <div
          data-testid="cultivo-error-box"
          className="text-center p-10 bg-white rounded-3xl border border-slate-200 shadow-xs max-w-md w-full"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <svg
              data-testid="cultivo-error-icon"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 data-testid="cultivo-error-title" className="text-xl font-extrabold text-slate-900 mb-2">
            Cultivo no encontrado
          </h2>
          <p data-testid="cultivo-error-desc" className="text-slate-500 text-sm mb-6">
            {error || 'El cultivo solicitado no existe o fue eliminado.'}
          </p>
          <Link
            href="/cultivo"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors"
            data-testid="cultivo-error-volver"
          >
            ← Volver a Mis Cultivos
          </Link>
        </div>
      </main>
    );
  }

  const metricas = calcularMetricas(cultivo);
  const enFloracion = metricas.faseActual === 'floracion';

  return (
    <main data-testid="cultivo-main" className="min-h-screen bg-slate-50 pt-20 pb-16">
      {/* Hero Compacto de Comando - Misma UI que Mis Cultivos & Planificación */}
      <div
        data-testid="cultivo-header"
        className="bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden"
      >
        <div
          className={`absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
            enFloracion ? 'bg-purple-500/15' : 'bg-emerald-500/10'
          }`}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Top Breadcrumb & Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <Link
              href="/cultivo"
              data-testid="cultivo-volver-link"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <svg
                data-testid="cultivo-volver-icon"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Mis Cultivos</span>
            </Link>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Centro de Control Agronómico
            </div>

            <span
              data-testid="cultivo-estado-chip"
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                cultivo.activo !== false
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {cultivo.activo !== false ? 'Activo' : 'Finalizado'}
            </span>

            {cultivo.activo !== false && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  enFloracion
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    : 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                }`}
              >
                {enFloracion
                  ? `🌸 Sem ${metricas.semanaFloracion} Flora (${metricas.diasFloracionActual}d)`
                  : `🌱 Sem ${metricas.semanaVegetacion} Vege (${metricas.diasVegetacionActual}d)`}
              </span>
            )}
          </div>

          {/* Título y Botones de Comando */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1
                data-testid="cultivo-nombre"
                className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
              >
                {cultivo.nombre}
              </h1>
              <p
                data-testid="cultivo-genetica-header"
                className="text-slate-400 text-sm sm:text-base mt-1 flex flex-wrap items-center gap-x-3 gap-y-1"
              >
                <span>🧬 {cultivo.genetica || 'Genética sin especificar'}</span>
                {cultivo.sustrato && <span>· 🪴 {cultivo.sustrato}</span>}
                {cultivo.fechaInicioFloracion && (
                  <span className="text-purple-300 font-medium">
                    · 🌸 Inicio Flora: {formatearFechaCorta(cultivo.fechaInicioFloracion)}
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  setEditing(!editing);
                  setEditandoFechaFlora(false);
                }}
                data-testid="cultivo-editar-boton"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <svg
                  data-testid="cultivo-editar-icon"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {editing ? 'Cancelar edición' : 'Editar cultivo'}
              </button>

              <button
                onClick={() => {
                  setFechaFloraInput(
                    cultivo.fechaInicioFloracion || new Date().toISOString().split('T')[0]
                  );
                  setEditandoFechaFlora((prev) => !prev);
                  setEditing(false);
                }}
                data-testid="cultivo-editar-flora-header-boton"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 font-semibold text-sm rounded-xl border border-purple-500/30 transition-all cursor-pointer"
              >
                <span>🌸</span>
                <span>{cultivo.fechaInicioFloracion ? 'Editar Fecha Flora' : 'Iniciar / Fecha Flora'}</span>
              </button>

              <button
                onClick={handleToggleStatus}
                data-testid="cultivo-toggle-estado-boton"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                <span>{cultivo.activo !== false ? '📦' : '🔄'}</span>
                <span>{cultivo.activo !== false ? 'Finalizar' : 'Reactivar'}</span>
              </button>

              <button
                onClick={handleDelete}
                data-testid="cultivo-eliminar-boton"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-rose-950/70 text-rose-400 hover:text-rose-300 font-semibold text-sm rounded-xl border border-slate-700 hover:border-rose-800/60 transition-all cursor-pointer"
              >
                <svg
                  data-testid="cultivo-eliminar-icon"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Eliminar</span>
              </button>
            </div>
          </div>

          {/* KPIs Rápidos de la Sala (Misma estructura de 6 tarjetas que Mis Cultivos & Planificación) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-7">
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Fase Actual</div>
              <div
                className={`text-xl font-extrabold mt-1 truncate ${
                  enFloracion ? 'text-purple-400' : 'text-emerald-400'
                }`}
              >
                {enFloracion ? '🌸 Floración' : '🌱 Vegetación'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {enFloracion
                  ? `Semana ${metricas.semanaFloracion} (${metricas.diasFloracionActual} días)`
                  : `Semana ${metricas.semanaVegetacion || 1} (${metricas.diasVegetacionActual || 0} días)`}
              </div>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Días desde Inicio</div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {metricas.diasDesdeInicio ?? 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                {cultivo.fechaComienzo ? `Inicio: ${formatearFechaCorta(cultivo.fechaComienzo)}` : 'Sin fecha inicio'}
              </div>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Total Plantas</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {cultivo.numeroplantas ?? '-'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {metricas.plantasPorM2 ? `${metricas.plantasPorM2} plantas/m²` : 'en seguimiento'}
              </div>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Área & Sustrato</div>
              <div className="text-2xl font-extrabold text-teal-400 mt-1">
                {cultivo.metrosCuadrados ? (
                  <>
                    {cultivo.metrosCuadrados} <span className="text-sm font-normal">m²</span>
                  </>
                ) : (
                  '-'
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {metricas.litrosTotales ? `${metricas.litrosTotales} L totales` : cultivo.sustrato || 'superficie'}
              </div>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Iluminación</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                {cultivo.potenciaLamparas ? (
                  <>
                    {cultivo.potenciaLamparas}
                    <span className="text-sm font-normal">W</span>
                  </>
                ) : (
                  '-'
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {metricas.wattsPorM2 ? `${metricas.wattsPorM2} W/m²` : 'potencia instalada'}
              </div>
            </div>

            <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Tareas de Sala</div>
              <div className="text-2xl font-extrabold text-sky-400 mt-1">
                {planificacion.estadisticas.tareasPendientes}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {planificacion.estadisticas.productividad}% cumplimiento
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div
        data-testid="cultivo-main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6"
      >
        {/* Banner inteligente de tareas del día / urgentes */}
        {tareasUrgentesHoy.length > 0 && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start sm:items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Tienes {tareasUrgentesHoy.length}{' '}
                  {tareasUrgentesHoy.length === 1
                    ? 'tarea programada para hoy o vencida en esta sala'
                    : 'tareas programadas para hoy o vencidas en esta sala'}
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

        {/* Editor Rápido Desplegable de Fecha de Inicio de Floración */}
        {editandoFechaFlora && (
          <div
            data-testid="cultivo-editor-fecha-flora-panel"
            className="bg-white rounded-2xl border border-purple-200 shadow-sm overflow-hidden animate-fadeIn"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500" />
            <div className="p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold mb-1">
                    🌸 Control de Fotoperíodo / Floración
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Configurar Fecha de Inicio de Floración
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Selecciona la fecha exacta en que comenzó (o comenzará) la floración para recalcular semanas y días automáticamente.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="date"
                    value={fechaFloraInput}
                    min={cultivo.fechaComienzo || undefined}
                    onChange={(e) => {
                      setFechaFloraInput(e.target.value);
                      setErrorFechaFlora(null);
                    }}
                    data-testid="cultivo-fecha-flora-date-input"
                    className="px-3.5 py-2.5 rounded-xl border border-purple-300 bg-purple-50/40 text-sm font-bold text-slate-900 focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const hoy = new Date().toISOString().split('T')[0];
                      setFechaFloraInput(hoy);
                      handleGuardarFechaFloracion(hoy);
                    }}
                    disabled={guardandoFechaFlora}
                    className="px-3.5 py-2.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Usar Hoy
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGuardarFechaFloracion()}
                    disabled={guardandoFechaFlora || !fechaFloraInput}
                    data-testid="cultivo-guardar-fecha-flora-boton"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {guardandoFechaFlora ? 'Guardando...' : 'Guardar Fecha de Flora'}
                  </button>

                  {cultivo.fechaInicioFloracion && (
                    <button
                      type="button"
                      onClick={() => handleGuardarFechaFloracion('')}
                      disabled={guardandoFechaFlora}
                      data-testid="cultivo-limpiar-fecha-flora-boton"
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                      title="Borrar fecha de floración y regresar el cultivo a fase de vegetación"
                    >
                      Volver a Vegetación
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditandoFechaFlora(false);
                      setErrorFechaFlora(null);
                    }}
                    className="px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>

              {errorFechaFlora && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  ⚠️ {errorFechaFlora}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formulario de edición completa */}
        {editing && (
          <div className="animate-fadeIn" data-testid="cultivo-form-edicion-box">
            <CultivoForm
              initial={cultivo}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
              submitLabel="Actualizar cultivo"
            />
          </div>
        )}

        {/* Selector de Vista Principal (Mismo estilo de píldoras que Mis Cultivos & Planificación) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div
            data-testid="cultivo-tabs-nav"
            className="bg-white p-1.5 rounded-2xl shadow-xs border border-slate-200 inline-flex flex-wrap gap-1"
          >
            <button
              onClick={() => setVistaActiva('detalles')}
              data-testid="cultivo-tab-detalles"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                vistaActiva === 'detalles'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>🌱</span>
              <span>Detalles y Fases</span>
            </button>

            <button
              onClick={() => setVistaActiva('chat')}
              data-testid="cultivo-tab-chat"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                vistaActiva === 'chat'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>🤖</span>
              <span>Chat con IA</span>
            </button>

            <button
              onClick={() => setVistaActiva('comentarios')}
              data-testid="cultivo-tab-comentarios"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                vistaActiva === 'comentarios'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>📋</span>
              <span>Comentarios</span>
            </button>

            <button
              onClick={() => setVistaActiva('galeria')}
              data-testid="cultivo-tab-galeria"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                vistaActiva === 'galeria'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>📸</span>
              <span>Galería ({cultivo.galeria?.length || 0})</span>
            </button>

            <button
              onClick={() => setVistaActiva('planificacion')}
              data-testid="cultivo-tab-planificacion"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                vistaActiva === 'planificacion'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>📅</span>
              <span>Planificación ({planificacion.estadisticas.tareasPendientes})</span>
            </button>
          </div>

          <Link
            href="/laboratorio/simulador"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all self-start sm:self-auto"
          >
            <span>🌡️</span>
            <span>Simulador VPD & Doctor IA</span>
          </Link>
        </div>

        {/* VISTA 1: DETALLES Y FASES */}
        {vistaActiva === 'detalles' && (
          <div className="grid gap-6 lg:grid-cols-3" data-testid="cultivo-detalles-grid">
            {/* Columna Principal (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tarjeta 1: Control de Fase & Fecha de Floración */}
              <div
                data-testid="cultivo-info-adicional"
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                <div
                  className={`h-1.5 w-full ${
                    cultivo.activo === false
                      ? 'bg-slate-300'
                      : enFloracion
                        ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                />
                <div className="p-6" data-testid="cultivo-estado-main">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{enFloracion ? '🌸' : '🌱'}</span>
                        <span>Estado de Fase & Ciclo Fenológico</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Seguimiento de días y semanas en vegetación y floración.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setFechaFloraInput(
                          cultivo.fechaInicioFloracion || new Date().toISOString().split('T')[0]
                        );
                        setEditandoFechaFlora(true);
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                      }}
                      data-testid="cultivo-editar-fecha-floracion-boton"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {cultivo.fechaInicioFloracion
                          ? 'Editar fecha de inicio de flora'
                          : 'Definir fecha de inicio de flora'}
                      </span>
                    </button>
                  </div>

                  {/* Grid de 4 métricas de fase */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5">
                    <div
                      className={`p-4 rounded-xl border ${
                        enFloracion
                          ? 'bg-purple-50/70 border-purple-200'
                          : 'bg-emerald-50/70 border-emerald-200'
                      }`}
                      data-testid="cultivo-estado-faseactual"
                    >
                      <dt
                        className={`text-[11px] uppercase tracking-wider font-bold ${
                          enFloracion ? 'text-purple-700' : 'text-emerald-700'
                        }`}
                      >
                        Fase Actual
                      </dt>
                      <dd
                        className={`text-lg font-extrabold mt-1 flex items-center gap-1.5 ${
                          enFloracion ? 'text-purple-950' : 'text-emerald-950'
                        }`}
                      >
                        <span>{enFloracion ? '🌸' : '🌱'}</span>
                        <span>{enFloracion ? 'Floración' : 'Vegetación'}</span>
                      </dd>
                    </div>

                    <div
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                      data-testid="cultivo-estado-dias-vegetacion"
                    >
                      <dt className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                        Días Vegetación
                      </dt>
                      <dd className="text-lg font-extrabold text-slate-800 mt-1">
                        {metricas.diasVegetacionActual ?? 0} días
                      </dd>
                    </div>

                    <div
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                      data-testid="cultivo-estado-dias-floracion"
                    >
                      <dt className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                        Días Floración
                      </dt>
                      <dd className="text-lg font-extrabold text-slate-800 mt-1">
                        {metricas.diasFloracionActual ?? 0} días
                      </dd>
                    </div>

                    <div
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100"
                      data-testid="cultivo-estado-semanaactual"
                    >
                      <dt className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                        Semana en Curso
                      </dt>
                      <dd className="text-sm font-extrabold text-slate-800 mt-1.5">
                        {enFloracion && metricas.semanaFloracion
                          ? `Semana ${metricas.semanaFloracion} de Flora`
                          : metricas.semanaVegetacion
                            ? `Semana ${metricas.semanaVegetacion} de Vege`
                            : 'N/A'}
                      </dd>
                    </div>
                  </div>

                  {/* Barra de Fecha de Inicio de Floración / Acción Rápida */}
                  {cultivo.fechaInicioFloracion ? (
                    <div
                      className="p-4 bg-purple-50/60 rounded-xl border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      data-testid="cultivo-inicio-fecha-floracion"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🌸</span>
                        <div>
                          <div className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                            Fecha de Inicio de Floración
                          </div>
                          <div className="text-sm font-extrabold text-purple-950 mt-0.5">
                            {formatearFechaCorta(cultivo.fechaInicioFloracion)}{' '}
                            <span className="text-xs font-normal text-purple-700">
                              ({cultivo.fechaInicioFloracion})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFechaFloraInput(cultivo.fechaInicioFloracion || '');
                            setEditandoFechaFlora(true);
                          }}
                          className="px-3.5 py-2 bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          ✏️ Cambiar Fecha
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      data-testid="cultivo-iniciar-floracion-box"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🌱</span>
                        <div>
                          <h4 className="text-sm font-extrabold text-emerald-950">
                            Cultivo en Fase Vegetativa
                          </h4>
                          <p className="text-xs text-emerald-700 mt-0.5">
                            Puedes iniciar la floración con fecha de hoy o elegir una fecha personalizada.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const hoy = new Date().toISOString().split('T')[0];
                            handleGuardarFechaFloracion(hoy);
                          }}
                          data-testid="cultivo-iniciar-floracion-boton"
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                        >
                          🌸 Iniciar Flora Hoy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFechaFloraInput(new Date().toISOString().split('T')[0]);
                            setEditandoFechaFlora(true);
                          }}
                          className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          📅 Elegir otra fecha
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tarjeta 2: Información Básica y Especificaciones Técnicas */}
              <div
                data-testid="cultivo-info-basica"
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <span>🏗️</span>
                    <span>Información Básica & Especificaciones de Sala</span>
                  </h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="cultivo-info-tecnica">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100" data-testid="cultivo-info-sustrato">
                    <dt className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Sustrato</dt>
                    <dd className="text-sm font-extrabold text-slate-800 mt-1">
                      🪴 {cultivo.sustrato || 'No especificado'}
                    </dd>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100" data-testid="cultivo-info-genetica">
                    <dt className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Genética</dt>
                    <dd className="text-sm font-extrabold text-slate-800 mt-1">
                      🧬 {cultivo.genetica || 'No especificada'}
                    </dd>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100" data-testid="cultivo-info-estado">
                    <dt className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Estado</dt>
                    <dd className="text-sm font-extrabold text-slate-800 mt-1">
                      {cultivo.activo !== false ? '🟢 Activo' : '📦 Finalizado'}
                    </dd>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100" data-testid="cultivo-info-fechaComienzo">
                    <dt className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Fecha de Comienzo</dt>
                    <dd className="text-sm font-extrabold text-slate-800 mt-1">
                      {cultivo.fechaComienzo ? formatearFechaCorta(cultivo.fechaComienzo) : 'No especificada'}
                    </dd>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <dt className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Inicio de Flora</dt>
                      <button
                        type="button"
                        onClick={() => {
                          setFechaFloraInput(
                            cultivo.fechaInicioFloracion || new Date().toISOString().split('T')[0]
                          );
                          setEditandoFechaFlora(true);
                        }}
                        className="text-[11px] font-bold text-purple-600 hover:text-purple-800"
                      >
                        Editar
                      </button>
                    </div>
                    <dd className="text-sm font-extrabold text-slate-800 mt-1">
                      {cultivo.fechaInicioFloracion
                        ? formatearFechaCorta(cultivo.fechaInicioFloracion)
                        : 'En Vegetación'}
                    </dd>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100" data-testid="cultivo-info-area">
                    <dt className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Área de Cultivo</dt>
                    <dd className="text-sm font-extrabold text-slate-800 mt-1">
                      {cultivo.metrosCuadrados ? `${cultivo.metrosCuadrados} m²` : 'No especificado'}
                    </dd>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100" data-testid="cultivo-info-numero-plantas">
                    <dt className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Número de Plantas</dt>
                    <dd className="text-sm font-extrabold text-slate-800 mt-1">
                      {cultivo.numeroplantas || 'No especificado'}
                    </dd>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100" data-testid="cultivo-info-litros-maceta">
                    <dt className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Litros por Maceta</dt>
                    <dd className="text-sm font-extrabold text-slate-800 mt-1">
                      {cultivo.litrosMaceta ? `${cultivo.litrosMaceta} L` : 'No especificado'}
                    </dd>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100" data-testid="cultivo-info-potencia-lamparas">
                    <dt className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Potencia Lámparas</dt>
                    <dd className="text-sm font-extrabold text-slate-800 mt-1">
                      {cultivo.potenciaLamparas ? `${cultivo.potenciaLamparas} W` : 'No especificado'}
                    </dd>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100" data-testid="cultivo-info-creacion">
                    <dt className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Fecha Creación</dt>
                    <dd className="text-sm font-extrabold text-slate-800 mt-1">
                      {cultivo.fechaCreacion ? formatearFechaCorta(cultivo.fechaCreacion) : 'No disponible'}
                    </dd>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100" data-testid="cultivo-info-actualizacion">
                    <dt className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Última Actualización</dt>
                    <dd className="text-sm font-extrabold text-slate-800 mt-1">
                      {cultivo.fechaActualizacion ? formatearFechaCorta(cultivo.fechaActualizacion) : 'No disponible'}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Tarjeta 3: Objetivos Nutricionales y Condiciones Ambientales */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
                <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <span>🎯</span>
                  <span>Objetivos Nutricionales & Parámetros Climáticos</span>
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Recomendaciones de IA */}
                  <div data-testid="cultivo-info-recomendaciones" className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      💧 Nutrición Objetivo
                    </h3>
                    {cultivo.phObjetivo || cultivo.ecObjetivo || cultivo.aguaDiariaObjetivo ? (
                      <div className="grid grid-cols-2 gap-3">
                        {cultivo.phObjetivo && (
                          <div
                            className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200"
                            data-testid="cultivo-recomendacion-ph"
                          >
                            <dt className="text-[11px] uppercase tracking-wider font-bold text-emerald-700">
                              pH Objetivo
                            </dt>
                            <dd className="text-xl font-extrabold text-emerald-950 mt-0.5">
                              {cultivo.phObjetivo}
                            </dd>
                          </div>
                        )}
                        {cultivo.ecObjetivo && (
                          <div
                            className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200"
                            data-testid="cultivo-recomendacion-ec"
                          >
                            <dt className="text-[11px] uppercase tracking-wider font-bold text-emerald-700">
                              EC Objetivo
                            </dt>
                            <dd className="text-xl font-extrabold text-emerald-950 mt-0.5">
                              {cultivo.ecObjetivo}
                            </dd>
                          </div>
                        )}
                        {cultivo.aguaDiariaObjetivo && (
                          <div
                            className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 col-span-2"
                            data-testid="cultivo-recomendacion-agua"
                          >
                            <dt className="text-[11px] uppercase tracking-wider font-bold text-emerald-700">
                              Agua Diaria
                            </dt>
                            <dd className="text-xl font-extrabold text-emerald-950 mt-0.5">
                              {cultivo.aguaDiariaObjetivo} L/día
                            </dd>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center"
                        data-testid="cultivo-recomendacion-empty"
                      >
                        <p className="text-xs text-slate-500 mb-2">
                          Sin objetivos de pH/EC definidos.
                        </p>
                        <button
                          type="button"
                          onClick={() => setEditing(true)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                        >
                          + Configurar con IA
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Condiciones Ambientales */}
                  <div data-testid="cultivo-info-condiciones" className="space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      🌡️ Clima Objetivo por Fase
                    </h3>
                    <div className="space-y-2.5">
                      {(cultivo.tempObjetivoVegetacion || cultivo.humedadObjetivoVegetacion) && (
                        <div
                          className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between"
                          data-testid="cultivo-condiciones-vegetacion"
                        >
                          <span className="text-xs font-bold text-emerald-900">🌱 Vegetación</span>
                          <div className="flex items-center gap-3 text-xs font-extrabold text-emerald-800">
                            {cultivo.tempObjetivoVegetacion && <span>🌡️ {cultivo.tempObjetivoVegetacion}°C</span>}
                            {cultivo.humedadObjetivoVegetacion && <span>💧 {cultivo.humedadObjetivoVegetacion}%</span>}
                          </div>
                        </div>
                      )}

                      {(cultivo.tempObjetivoFloracion || cultivo.humedadObjetivoFloracion) && (
                        <div
                          className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 flex items-center justify-between"
                          data-testid="cultivo-condiciones-floracion"
                        >
                          <span className="text-xs font-bold text-purple-900">🌸 Floración</span>
                          <div className="flex items-center gap-3 text-xs font-extrabold text-purple-800">
                            {cultivo.tempObjetivoFloracion && <span>🌡️ {cultivo.tempObjetivoFloracion}°C</span>}
                            {cultivo.humedadObjetivoFloracion && <span>💧 {cultivo.humedadObjetivoFloracion}%</span>}
                          </div>
                        </div>
                      )}

                      {!cultivo.tempObjetivoVegetacion &&
                        !cultivo.humedadObjetivoVegetacion &&
                        !cultivo.tempObjetivoFloracion &&
                        !cultivo.humedadObjetivoFloracion && (
                          <div
                            className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center"
                            data-testid="cultivo-condiciones-empty"
                          >
                            <p className="text-xs text-slate-500">
                              No hay condiciones ambientales configuradas
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tarjeta 4: Notas */}
              {cultivo.notas && (
                <div
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6"
                  data-testid="cultivo-notas"
                >
                  <h2 className="text-lg font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                    <span>📝</span>
                    <span>Notas del Cultivo</span>
                  </h2>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100" data-testid="cultivo-notas-cuerpo">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {cultivo.notas}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Lateral (1/3) */}
            <div className="space-y-6" data-testid="cultivo-panel-lateral">
              {/* Métricas Calculadas */}
              <div
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6"
                data-testid="cultivo-metricas-box"
              >
                <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <span>📊</span>
                  <span>Métricas de Eficiencia</span>
                </h2>
                <div className="space-y-3">
                  <div
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                    data-testid="cultivo-metricas-dias-inicio"
                  >
                    <div>
                      <dt className="text-xs font-bold text-slate-500">Días desde inicio</dt>
                      <dd className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                        {metricas.diasDesdeInicio ?? 0}
                      </dd>
                    </div>
                    <span className="text-2xl">📅</span>
                  </div>

                  {metricas.plantasPorM2 && (
                    <div
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                      data-testid="cultivo-metricas-plantas-m2"
                    >
                      <div>
                        <dt className="text-xs font-bold text-slate-500">Plantas por m²</dt>
                        <dd className="text-2xl font-extrabold text-slate-900 mt-0.5">
                          {metricas.plantasPorM2}
                        </dd>
                      </div>
                      <span className="text-2xl">🌱</span>
                    </div>
                  )}

                  {metricas.wattsPorM2 && (
                    <div
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                      data-testid="cultivo-metricas-watts-m2"
                    >
                      <div>
                        <dt className="text-xs font-bold text-slate-500">Watts por m²</dt>
                        <dd className="text-2xl font-extrabold text-amber-600 mt-0.5">
                          {metricas.wattsPorM2}
                        </dd>
                      </div>
                      <span className="text-2xl">💡</span>
                    </div>
                  )}

                  {metricas.litrosTotales && (
                    <div
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
                      data-testid="cultivo-metricas-litros-totales"
                    >
                      <div>
                        <dt className="text-xs font-bold text-slate-500">Volumen de sustrato</dt>
                        <dd className="text-2xl font-extrabold text-purple-600 mt-0.5">
                          {metricas.litrosTotales} L
                        </dd>
                      </div>
                      <span className="text-2xl">🪴</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6"
                data-testid="cultivo-acciones-rapidas-box"
              >
                <h2 className="text-lg font-extrabold text-slate-900 mb-4">Acciones Rápidas</h2>
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setEditing(true);
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    data-testid="cultivo-accion-editar"
                    className="w-full flex items-center justify-between px-4 py-3 text-left bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span>✏️</span>
                      <span>Editar información del cultivo</span>
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => {
                      setFechaFloraInput(
                        cultivo.fechaInicioFloracion || new Date().toISOString().split('T')[0]
                      );
                      setEditandoFechaFlora(true);
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    data-testid="cultivo-accion-editar-flora"
                    className="w-full flex items-center justify-between px-4 py-3 text-left bg-purple-50/70 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span>🌸</span>
                      <span>
                        {cultivo.fechaInicioFloracion
                          ? 'Cambiar fecha de inicio de flora'
                          : 'Iniciar / Definir fecha de flora'}
                      </span>
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setVistaActiva('chat')}
                    className="w-full flex items-center justify-between px-4 py-3 text-left bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span>🤖</span>
                      <span>Consultar Asistente IA de Sala</span>
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setVistaActiva('planificacion')}
                    className="w-full flex items-center justify-between px-4 py-3 text-left bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span>📅</span>
                      <span>Gestionar Calendario y Tareas</span>
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={handleToggleStatus}
                    data-testid="cultivo-accion-toggle-estado"
                    className="w-full flex items-center justify-between px-4 py-3 text-left bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200/80 hover:border-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span>{cultivo.activo !== false ? '📦' : '🔄'}</span>
                      <span>{cultivo.activo !== false ? 'Finalizar cultivo' : 'Reactivar cultivo'}</span>
                    </span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: CHAT CON IA */}
        {vistaActiva === 'chat' && (
          <div className="max-w-5xl mx-auto" data-testid="cultivo-tabview-chat">
            <ChatIA cultivo={cultivo} />
          </div>
        )}

        {/* VISTA 3: COMENTARIOS Y BITÁCORA */}
        {vistaActiva === 'comentarios' && (
          <div className="max-w-5xl mx-auto" data-testid="cultivo-tabview-comentarios">
            <ComentariosCultivo cultivoId={cultivo.id} nombreCultivo={cultivo.nombre} />
          </div>
        )}

        {/* VISTA 4: GALERÍA */}
        {vistaActiva === 'galeria' && (
          <div data-testid="cultivo-tabview-galeria">
            <GaleriaCultivo cultivo={cultivo} onActualizarCultivo={handleActualizarCultivo} />
          </div>
        )}

        {/* VISTA 5: PLANIFICACIÓN UNIFICADA (MISMO LAYOUT 7/5 QUE MIS CULTIVOS & PLANIFICACIÓN) */}
        {vistaActiva === 'planificacion' && (
          <div className="space-y-8" data-testid="cultivo-tabview-planificacion">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <CalendarioCultivos
                  cultivoId={cultivo.id}
                  planificacion={planificacion}
                  onTareaClick={(tarea) => setTareaSeleccionada(tarea)}
                  mostrarSoloActivas={false}
                />
              </div>

              <div className="lg:col-span-5">
                <GestionTareasCultivo
                  cultivoId={cultivo.id}
                  cultivos={[cultivo]}
                  planificacion={planificacion}
                  onTareaClick={(tarea) => setTareaSeleccionada(tarea)}
                  mostrarSoloActivas={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal interactivo al hacer clic en una tarea del calendario */}
      {tareaSeleccionada && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          data-testid="cultivo-modal-tarea-overlay"
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 p-6"
            data-testid="cultivo-modal-tarea"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span
                  className="text-xs font-bold uppercase tracking-wider text-emerald-600"
                  data-testid="cultivo-modal-tarea-title"
                >
                  Detalle de Tarea
                </span>
                <h3
                  className="text-xl font-bold text-slate-900 mt-0.5"
                  data-testid="cultivo-modal-tarea-titulo"
                >
                  {tareaSeleccionada.titulo}
                </h3>
              </div>
              <button
                onClick={() => setTareaSeleccionada(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                data-testid="cultivo-modal-tarea-cerrar-x"
              >
                ✕
              </button>
            </div>

            {tareaSeleccionada.descripcion && (
              <p
                className="text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4"
                data-testid="cultivo-modal-tarea-descripcion"
              >
                {tareaSeleccionada.descripcion}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 mb-6" data-testid="cultivo-modal-tarea-info">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Fecha Programada</span>
                <span className="font-bold text-slate-800" data-testid="cultivo-modal-tarea-fecha">
                  📅 {new Date(tareaSeleccionada.fechaProgramada).toLocaleDateString()}
                  {tareaSeleccionada.horaProgramada ? ` · ${tareaSeleccionada.horaProgramada}` : ''}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Estado / Prioridad</span>
                <span className="font-bold text-slate-800 capitalize" data-testid="cultivo-modal-tarea-estado">
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
                  data-testid="cultivo-modal-tarea-editar"
                >
                  ✓ Marcar Completada
                </button>
              )}
              <button
                onClick={() => setTareaSeleccionada(null)}
                className="py-2.5 px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs rounded-xl"
                data-testid="cultivo-modal-tarea-cerrar"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
