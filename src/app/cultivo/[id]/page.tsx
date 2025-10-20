'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CultivoForm from "../../components/CultivoForm";
import ChatIA from "../../components/ChatIA";
import ComentariosCultivo from "../../components/ComentariosCultivo";
import GaleriaCultivo from "../../components/GaleriaCultivo";
import CalendarioCultivos from "../../components/CalendarioCultivos";
import GestionTareasCultivo from "../../components/GestionTareasCultivo";
import { useCultivos } from "@/lib/hooks/useCultivos";
import { calcularMetricasFases, iniciarFloracion } from "@/lib/services/cultivos";
import type { Cultivo } from "@/types/cultivo";
import type { TareaCultivo } from "@/types/planificacion";
import { formatearFechaCorta } from "@/lib/utils/date";

/**
 * Interfaz para las métricas calculadas del cultivo
 * Define los tipos específicos para cada métrica computada
 */
interface MetricasCalculadas {
  diasDesdeInicio?: number;     // Días transcurridos desde el inicio del cultivo
  plantasPorM2?: string;        // Densidad de plantas por metro cuadrado (como string con decimales)
  wattsPorM2?: string;          // Potencia por metro cuadrado (como string con decimales)
  litrosTotales?: number;       // Volumen total de sustrato en litros

  // Métricas de fases
  faseActual?: 'vegetacion' | 'floracion'; // Fase actual del cultivo
  diasVegetacionActual?: number; // Días actuales en vegetación
  diasFloracionActual?: number;  // Días actuales en floración
  semanaVegetacion?: number;     // Semana actual de vegetación
  semanaFloracion?: number;      // Semana actual de floración
}

/**
 * Página individual de cultivo
 * Muestra toda la información detallada de un cultivo específico
 * Permite editar y gestionar el cultivo seleccionado
 */
export default function CultivoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cultivoId = params.id as string;

  // Hook para operaciones de cultivos
  const { getById, update, remove, finalizar, reactivar } = useCultivos();

  // Estados locales
  const [cultivo, setCultivo] = useState<Cultivo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [vistaActiva, setVistaActiva] = useState<'detalles' | 'chat' | 'comentarios' | 'galeria' | 'planificacion'>('detalles');
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaCultivo | null>(null);

  // Función para cargar los datos del cultivo
  // useCallback previene recreaciones innecesarias y optimiza el rendimiento
  const loadCultivo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cultivoData = await getById(cultivoId);
      setCultivo(cultivoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el cultivo');
    } finally {
      setLoading(false);
    }
  }, [cultivoId, getById]); // Dependencias: cultivoId y getById

  // Cargar cultivo al montar el componente
  useEffect(() => {
    if (cultivoId) {
      loadCultivo();
    }
  }, [cultivoId, loadCultivo]); // Ahora incluye loadCultivo en las dependencias

  // Manejar actualización del cultivo
  const handleUpdate = async (payload: Partial<Cultivo>) => {
    if (!cultivo) return;

    try {
      const updated = await update(cultivo.id, payload);
      setCultivo(updated);
      setEditing(false);
    } catch (err) {
      throw err;
    }
  };

  // Manejar actualización del cultivo para la galería (persiste cambios en DB)
  const handleActualizarCultivo = async (cultivoActualizado: Cultivo) => {
    if (!cultivo) return;

    try {
      // Siempre actualizar en la base de datos cuando cambie la galería
      // (las imágenes base64 pueden ser muy largas para comparación eficiente)
      const cambios: Partial<Cultivo> = {
        galeria: cultivoActualizado.galeria,
      };

      const updated = await update(cultivo.id, cambios);
      setCultivo(updated);
    } catch (err) {
      console.error('Error al actualizar galería:', err);
      // En caso de error, aún actualizar el estado local para mantener consistencia UI
      setCultivo(cultivoActualizado);
    }
  };

  // Manejar eliminación del cultivo
  const handleDelete = async () => {
    if (!cultivo) return;
    
    const confirmDelete = confirm(`¿Está seguro de que desea eliminar el cultivo "${cultivo.nombre}"?`);
    if (confirmDelete) {
      try {
        await remove(cultivo.id);
        router.push('/cultivo');
      } catch (err) {
        alert('Error al eliminar el cultivo: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      }
    }
  };

  // Manejar cambio de estado activo/inactivo
  const handleToggleStatus = async () => {
    if (!cultivo) return;

    try {
      const updated = cultivo.activo
        ? await finalizar(cultivo.id)
        : await reactivar(cultivo.id);
      setCultivo(updated);
    } catch (err) {
      alert('Error al cambiar el estado: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  // Manejar cambio de fase a floración
  const handleIniciarFloracion = async () => {
    if (!cultivo) return;

    const confirmChange = confirm('¿Estás seguro de que quieres marcar el inicio de la fase de floración? Esta acción no se puede deshacer.');
    if (!confirmChange) return;

    try {
      const updated = await iniciarFloracion(cultivo.id);
      setCultivo(updated);
    } catch (err) {
      alert('Error al cambiar de fase: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    }
  };

  // Calcular métricas del cultivo
  const calcularMetricas = (cultivo: Cultivo): MetricasCalculadas => {
    const metricas: MetricasCalculadas = {};

    if (cultivo.fechaComienzo) {
      const inicio = new Date(cultivo.fechaComienzo);
      const hoy = new Date();
      const diffTime = Math.abs(hoy.getTime() - inicio.getTime());
      metricas.diasDesdeInicio = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    if (cultivo.numeroplantas && cultivo.metrosCuadrados) {
      metricas.plantasPorM2 = (cultivo.numeroplantas / cultivo.metrosCuadrados).toFixed(2);
    }

    if (cultivo.potenciaLamparas && cultivo.metrosCuadrados) {
      metricas.wattsPorM2 = (cultivo.potenciaLamparas / cultivo.metrosCuadrados).toFixed(1);
    }

    if (cultivo.litrosMaceta && cultivo.numeroplantas) {
      metricas.litrosTotales = cultivo.litrosMaceta * cultivo.numeroplantas;
    }

    // Calcular métricas de fases
    const metricasFases = calcularMetricasFases(cultivo);
    metricas.faseActual = metricasFases.faseActual;
    metricas.diasVegetacionActual = metricasFases.diasVegetacionActual;
    metricas.diasFloracionActual = metricasFases.diasFloracionActual;
    metricas.semanaVegetacion = metricasFases.semanaVegetacion;
    metricas.semanaFloracion = metricasFases.semanaFloracion;

    return metricas;
  };

  if (loading) {
    return (
      <main data-testid="cultivo-main-loading" className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div data-testid="cultivo-loading-box" className="inline-flex items-center gap-3 p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
          <div data-testid="cultivo-loading-spinner" className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
          <span data-testid="cultivo-loading-text" className="text-lg font-medium text-gray-600">Cargando cultivo...</span>
        </div>
      </main>
    );
  }

  if (error || !cultivo) {
    return (
      <main data-testid="cultivo-main-error" className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center">
        <div data-testid="cultivo-error-box" className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg max-w-md mx-auto">
          <svg data-testid="cultivo-error-icon" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 data-testid="cultivo-error-title" className="text-xl font-semibold text-gray-900 mb-2">Cultivo no encontrado</h2>
          <p data-testid="cultivo-error-desc" className="text-gray-600 mb-6">{error || 'El cultivo solicitado no existe o fue eliminado'}</p>
          <Link 
            href="/cultivo"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
            data-testid="cultivo-error-volver"
          >
            Volver a cultivos
          </Link>
        </div>
      </main>
    );
  }

  const metricas = calcularMetricas(cultivo);

  return (
    <main data-testid="cultivo-main" className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      <div data-testid="cultivo-main-content" className="mx-auto max-w-7xl p-8 space-y-8">
        {/* Header con navegación */}
        <div data-testid="cultivo-header" className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link 
                href="/cultivo"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                data-testid="cultivo-volver-link"
              >
                <svg data-testid="cultivo-volver-icon" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 data-testid="cultivo-nombre" className="text-2xl font-bold text-gray-900">{cultivo.nombre}</h1>
                <p data-testid="cultivo-genetica-header" className="text-gray-600">{cultivo.genetica || 'Información de cultivo'}</p>
              </div>
              <span
                data-testid="cultivo-estado-chip"
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  cultivo.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {cultivo.activo ? 'Activo' : 'Finalizado'}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                data-testid="cultivo-editar-boton"
              >
                <svg data-testid="cultivo-editar-icon" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {editing ? 'Cancelar edición' : 'Editar cultivo'}
              </button>
              
              <button
                onClick={handleToggleStatus}
                data-testid="cultivo-toggle-estado-boton"
                className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${
                  cultivo.activo 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {cultivo.activo ? 'Finalizar' : 'Reactivar'}
              </button>

              <button
                onClick={handleDelete}
                data-testid="cultivo-eliminar-boton"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <svg data-testid="cultivo-eliminar-icon" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>

          {/* Pestañas de navegación */}
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg" data-testid="cultivo-tabs-nav">
            <button
              onClick={() => setVistaActiva('detalles')}
              data-testid="cultivo-tab-detalles"
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                vistaActiva === 'detalles'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Detalles
            </button>
            <button
              onClick={() => setVistaActiva('chat')}
              data-testid="cultivo-tab-chat"
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                vistaActiva === 'chat'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat con IA
            </button>
            <button
              onClick={() => setVistaActiva('comentarios')}
              data-testid="cultivo-tab-comentarios"
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                vistaActiva === 'comentarios'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Comentarios
            </button>
            <button
              onClick={() => setVistaActiva('galeria')}
              data-testid="cultivo-tab-galeria"
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                vistaActiva === 'galeria'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Galería
            </button>
            <button
              onClick={() => setVistaActiva('planificacion')}
              data-testid="cultivo-tab-planificacion"
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                vistaActiva === 'planificacion'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Planificación
            </button>
          </div>
        </div>

        {/* Formulario de edición */}
        {editing && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8" data-testid="cultivo-form-edicion-box">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600" data-testid="cultivo-form-edicion-icon">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900" data-testid="cultivo-form-edicion-title">Editar cultivo</h3>
                <p className="text-gray-600 text-sm" data-testid="cultivo-form-edicion-note">Modifique los campos que desea actualizar</p>
              </div>
            </div>
            <CultivoForm
              initial={cultivo}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
              submitLabel="Actualizar cultivo"
              data-testid="cultivo-form-edicion"
            />
          </div>
        )}

        {/* Contenido según vista activa */}
        {vistaActiva === 'detalles' && (
          /* Grid de información y métricas */
          <div className="grid gap-8 lg:grid-cols-3" data-testid="cultivo-detalles-grid">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Información básica */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6" data-testid="cultivo-info-basica">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Información Básica
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-gray-50 rounded-lg" data-testid="cultivo-info-sustrato">
                  <dt className="text-sm font-medium text-gray-500">Sustrato</dt>
                  <dd className="text-lg text-gray-900">{cultivo.sustrato || 'No especificado'}</dd>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg" data-testid="cultivo-info-genetica">
                  <dt className="text-sm font-medium text-gray-500">Genética</dt>
                  <dd className="text-lg text-gray-900">{cultivo.genetica || 'No especificada'}</dd>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg" data-testid="cultivo-info-fechaComienzo">
                  <dt className="text-sm font-medium text-gray-500">Fecha de Comienzo</dt>
                  <dd className="text-lg text-gray-900">{cultivo.fechaComienzo ? formatearFechaCorta(cultivo.fechaComienzo) : 'No especificada'}</dd>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg" data-testid="cultivo-info-estado">
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="text-lg text-gray-900">{cultivo.activo ? 'Activo' : 'Finalizado'}</dd>
                </div>
              </div>
            </div>

            {/* Especificaciones técnicas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6" data-testid="cultivo-info-tecnica">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Especificaciones Técnicas
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 bg-gray-50 rounded-lg" data-testid="cultivo-info-area">
                  <dt className="text-sm font-medium text-gray-500">Área</dt>
                  <dd className="text-lg text-gray-900">{cultivo.metrosCuadrados ? `${cultivo.metrosCuadrados} m²` : 'No especificado'}</dd>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg" data-testid="cultivo-info-numero-plantas">
                  <dt className="text-sm font-medium text-gray-500">Número de Plantas</dt>
                  <dd className="text-lg text-gray-900">{cultivo.numeroplantas || 'No especificado'}</dd>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg" data-testid="cultivo-info-litros-maceta">
                  <dt className="text-sm font-medium text-gray-500">Litros por Maceta</dt>
                  <dd className="text-lg text-gray-900">{cultivo.litrosMaceta ? `${cultivo.litrosMaceta} L` : 'No especificado'}</dd>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg" data-testid="cultivo-info-potencia-lamparas">
                  <dt className="text-sm font-medium text-gray-500">Potencia Lámparas</dt>
                  <dd className="text-lg text-gray-900">{cultivo.potenciaLamparas ? `${cultivo.potenciaLamparas} W` : 'No especificado'}</dd>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg" data-testid="cultivo-info-creacion">
                  <dt className="text-sm font-medium text-gray-500">Fecha Creación</dt>
                  <dd className="text-lg text-gray-900">{cultivo.fechaCreacion ? formatearFechaCorta(cultivo.fechaCreacion) : 'No disponible'}</dd>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg" data-testid="cultivo-info-actualizacion">
                  <dt className="text-sm font-medium text-gray-500">Última Actualización</dt>
                  <dd className="text-lg text-gray-900">{cultivo.fechaActualizacion ? formatearFechaCorta(cultivo.fechaActualizacion) : 'No disponible'}</dd>
                </div>
              </div>
            </div>

            {/* Información Adicional del Cultivo */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6" data-testid="cultivo-info-adicional">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Información Adicional
              </h2>

              {/* Estado del Cultivo */}
              <div className="mb-6" data-testid="cultivo-estado-main">
                <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Estado del Cultivo
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200" data-testid="cultivo-estado-faseactual">
                    <dt className="text-sm font-medium text-orange-700">Fase Actual</dt>
                    <dd className="text-lg font-semibold text-orange-900 flex items-center gap-2">
                      {metricas.faseActual === 'floracion' ? (
                        <>
                          <span>🌸</span>
                          <span>Floración</span>
                        </>
                      ) : (
                        <>
                          <span>🌱</span>
                          <span>Vegetación</span>
                        </>
                      )}
                    </dd>
                  </div>

                  {metricas.diasVegetacionActual !== undefined && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200" data-testid="cultivo-estado-dias-vegetacion">
                      <dt className="text-sm font-medium text-green-700">Días Vegetación</dt>
                      <dd className="text-lg font-semibold text-green-900">{metricas.diasVegetacionActual}</dd>
                    </div>
                  )}

                  {metricas.diasFloracionActual !== undefined && metricas.diasFloracionActual > 0 && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200" data-testid="cultivo-estado-dias-floracion">
                      <dt className="text-sm font-medium text-purple-700">Días Floración</dt>
                      <dd className="text-lg font-semibold text-purple-900">{metricas.diasFloracionActual}</dd>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200" data-testid="cultivo-estado-semanaactual">
                    <dt className="text-sm font-medium text-blue-700">Semana Actual</dt>
                    <dd className="text-lg font-semibold text-blue-900">
                      {metricas.faseActual === 'floracion' && metricas.semanaFloracion
                        ? `Semana ${metricas.semanaFloracion} de Floración`
                        : metricas.semanaVegetacion
                        ? `Semana ${metricas.semanaVegetacion} de Vegetación`
                        : 'N/A'
                      }
                    </dd>
                  </div>
                </div>

                {/* Botón para cambiar a floración si está en vegetación */}
                {metricas.faseActual === 'vegetacion' && !cultivo.fechaInicioFloracion && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200" data-testid="cultivo-iniciar-floracion-box">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-yellow-900">¿Cambiar a fase de floración?</h4>
                        <p className="text-sm text-yellow-700">Marca cuando tus plantas comiencen a florecer</p>
                      </div>
                      <button
                        onClick={handleIniciarFloracion}
                        data-testid="cultivo-iniciar-floracion-boton"
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        Iniciar Floración
                      </button>
                    </div>
                  </div>
                )}

                {cultivo.fechaInicioFloracion && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200" data-testid="cultivo-inicio-fecha-floracion">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Inicio de floración:</span> {formatearFechaCorta(cultivo.fechaInicioFloracion)}
                    </p>
                  </div>
                )}
              </div>

              {/* Objetivos y Condiciones */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Recomendaciones de IA */}
                <div data-testid="cultivo-info-recomendaciones">
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Recomendaciones IA
                  </h3>
                  <div className="space-y-3">
                    {cultivo.phObjetivo && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200" data-testid="cultivo-recomendacion-ph">
                        <dt className="text-sm font-medium text-green-700">pH Objetivo</dt>
                        <dd className="text-lg font-semibold text-green-900">{cultivo.phObjetivo}</dd>
                      </div>
                    )}
                    {cultivo.ecObjetivo && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200" data-testid="cultivo-recomendacion-ec">
                        <dt className="text-sm font-medium text-green-700">EC Objetivo (ppm)</dt>
                        <dd className="text-lg font-semibold text-green-900">{cultivo.ecObjetivo}</dd>
                      </div>
                    )}
                    {cultivo.aguaDiariaObjetivo && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200" data-testid="cultivo-recomendacion-agua">
                        <dt className="text-sm font-medium text-green-700">Agua Diaria</dt>
                        <dd className="text-lg font-semibold text-green-900">{cultivo.aguaDiariaObjetivo} L</dd>
                      </div>
                    )}
                    {(!cultivo.phObjetivo && !cultivo.ecObjetivo) && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200" data-testid="cultivo-recomendacion-empty">
                        <p className="text-sm text-gray-600 text-center">
                          Consulta al chat de IA para obtener recomendaciones personalizadas
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Condiciones Ambientales */}
                <div data-testid="cultivo-info-condiciones">
                  <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    Condiciones Ambientales
                  </h3>
                  <div className="space-y-3">
                    {/* Fase de Vegetación */}
                    {(cultivo.tempObjetivoVegetacion || cultivo.humedadObjetivoVegetacion) && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200" data-testid="cultivo-condiciones-vegetacion">
                        <h4 className="text-sm font-medium text-green-800 mb-2">🌱 Vegetación</h4>
                        <div className="space-y-1">
                          {cultivo.tempObjetivoVegetacion && (
                            <p className="text-sm text-green-700">
                              <span className="font-medium">Temperatura:</span> {cultivo.tempObjetivoVegetacion}°C
                            </p>
                          )}
                          {cultivo.humedadObjetivoVegetacion && (
                            <p className="text-sm text-green-700">
                              <span className="font-medium">Humedad:</span> {cultivo.humedadObjetivoVegetacion}%
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Fase de Floración */}
                    {(cultivo.tempObjetivoFloracion || cultivo.humedadObjetivoFloracion) && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200" data-testid="cultivo-condiciones-floracion">
                        <h4 className="text-sm font-medium text-purple-800 mb-2">🌸 Floración</h4>
                        <div className="space-y-1">
                          {cultivo.tempObjetivoFloracion && (
                            <p className="text-sm text-purple-700">
                              <span className="font-medium">Temperatura:</span> {cultivo.tempObjetivoFloracion}°C
                            </p>
                          )}
                          {cultivo.humedadObjetivoFloracion && (
                            <p className="text-sm text-purple-700">
                              <span className="font-medium">Humedad:</span> {cultivo.humedadObjetivoFloracion}%
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {(!cultivo.tempObjetivoVegetacion && !cultivo.humedadObjetivoVegetacion &&
                      !cultivo.tempObjetivoFloracion && !cultivo.humedadObjetivoFloracion) && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200" data-testid="cultivo-condiciones-empty">
                        <p className="text-sm text-gray-600 text-center">
                          No hay condiciones ambientales configuradas
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notas */}
            {cultivo.notas && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6" data-testid="cultivo-notas">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Notas
                </h2>
                <div className="p-4 bg-gray-50 rounded-lg" data-testid="cultivo-notas-cuerpo">
                  <p className="text-gray-900 whitespace-pre-wrap">{cultivo.notas}</p>
                </div>
              </div>
            )}
          </div>

          {/* Panel lateral con métricas */}
          <div className="space-y-6" data-testid="cultivo-panel-lateral">
            {/* Métricas calculadas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6" data-testid="cultivo-metricas-box">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Métricas
              </h2>
              <div className="space-y-4">
                {metricas.diasDesdeInicio && (
                  <div className="p-3 bg-green-50 rounded-lg" data-testid="cultivo-metricas-dias-inicio">
                    <dt className="text-sm font-medium text-green-700">Días desde inicio</dt>
                    <dd className="text-2xl font-bold text-green-900">{metricas.diasDesdeInicio}</dd>
                  </div>
                )}
                {metricas.plantasPorM2 && (
                  <div className="p-3 bg-blue-50 rounded-lg" data-testid="cultivo-metricas-plantas-m2">
                    <dt className="text-sm font-medium text-blue-700">Plantas por m²</dt>
                    <dd className="text-2xl font-bold text-blue-900">{metricas.plantasPorM2}</dd>
                  </div>
                )}
                {metricas.wattsPorM2 && (
                  <div className="p-3 bg-yellow-50 rounded-lg" data-testid="cultivo-metricas-watts-m2">
                    <dt className="text-sm font-medium text-yellow-700">Watts por m²</dt>
                    <dd className="text-2xl font-bold text-yellow-900">{metricas.wattsPorM2}</dd>
                  </div>
                )}
                {metricas.litrosTotales && (
                  <div className="p-3 bg-purple-50 rounded-lg" data-testid="cultivo-metricas-litros-totales">
                    <dt className="text-sm font-medium text-purple-700">Litros totales</dt>
                    <dd className="text-2xl font-bold text-purple-900">{metricas.litrosTotales} L</dd>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6" data-testid="cultivo-acciones-rapidas-box">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setEditing(true)}
                  data-testid="cultivo-accion-editar"
                  className="w-full flex items-center gap-2 px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors duration-200"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar información
                </button>
                <button
                  onClick={handleToggleStatus}
                  data-testid="cultivo-accion-toggle-estado"
                  className={`w-full flex items-center gap-2 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                    cultivo.activo 
                      ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'
                      : 'bg-green-50 hover:bg-green-100 text-green-700'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={cultivo.activo ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15a2 2 0 002-2V9a2 2 0 00-2-2h-1.172a1 1 0 01-.707-.293L10.707 4.293A1 1 0 0010 4H9a2 2 0 00-2 2v5z"} />
                  </svg>
                  {cultivo.activo ? 'Finalizar cultivo' : 'Reactivar cultivo'}
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Vista del Chat con IA */}
        {vistaActiva === 'chat' && (
          <div className="max-w-4xl mx-auto" data-testid="cultivo-tabview-chat">
            <ChatIA cultivo={cultivo} />
          </div>
        )}

        {/* Vista de Comentarios */}
        {vistaActiva === 'comentarios' && (
          <div className="max-w-4xl mx-auto" data-testid="cultivo-tabview-comentarios">
            <ComentariosCultivo 
              cultivoId={cultivo.id} 
              nombreCultivo={cultivo.nombre}
            />
          </div>
        )}

        {/* Vista de Galería */}
        {vistaActiva === 'galeria' && (
          <div className="max-w-6xl mx-auto" data-testid="cultivo-tabview-galeria">
            <GaleriaCultivo
              cultivo={cultivo}
              onActualizarCultivo={handleActualizarCultivo}
            />
          </div>
        )}

        {/* Vista de Planificación */}
        {vistaActiva === 'planificacion' && (
          <div className="space-y-8" data-testid="cultivo-tabview-planificacion">
            <CalendarioCultivos
              cultivoId={cultivo.id}
              onTareaClick={(tarea) => {
                // Abrir modal con detalles de la tarea
                setTareaSeleccionada(tarea);
              }}
              data-testid="cultivo-calendario"
            />

            <GestionTareasCultivo
              cultivoId={cultivo.id}
              data-testid="cultivo-gestion-tareas"
            />
          </div>
        )}

      </div>

      {/* Modal de detalles de tarea */}
      {tareaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-testid="cultivo-modal-tarea-overlay">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" data-testid="cultivo-modal-tarea">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900" data-testid="cultivo-modal-tarea-title">
                    Detalles de la Tarea
                  </h3>
                  <p className="text-gray-600 text-sm" data-testid="cultivo-modal-tarea-desc">
                    Información completa de la tarea seleccionada
                  </p>
                </div>
                <button
                  onClick={() => setTareaSeleccionada(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  data-testid="cultivo-modal-tarea-cerrar-x"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="border rounded-lg p-4 mb-6 bg-gray-50" data-testid="cultivo-modal-tarea-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900" data-testid="cultivo-modal-tarea-titulo">{tareaSeleccionada.titulo}</h4>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-300" data-testid="cultivo-modal-tarea-tipo">
                        {tareaSeleccionada.tipo}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${tareaSeleccionada.prioridad === 'alta' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`} data-testid="cultivo-modal-tarea-prioridad">
                        {tareaSeleccionada.prioridad}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-sm font-medium ${tareaSeleccionada.estado === 'completada' ? 'text-green-600' : 'text-yellow-600'}`} data-testid="cultivo-modal-tarea-estado">
                        {tareaSeleccionada.estado}
                      </span>
                    </div>

                    {tareaSeleccionada.descripcion && (
                      <p className="text-gray-600 mb-3" data-testid="cultivo-modal-tarea-descripcion">{tareaSeleccionada.descripcion}</p>
                    )}

                    <div className="grid gap-2 text-sm text-gray-600" data-testid="cultivo-modal-tarea-info">
                      <div className="flex items-center gap-2">
                        <span>📅 Fecha programada:</span>
                        <span className="font-medium" data-testid="cultivo-modal-tarea-fecha">{new Date(tareaSeleccionada.fechaProgramada).toLocaleDateString()}</span>
                      </div>

                      {tareaSeleccionada.horaProgramada && (
                        <div className="flex items-center gap-2">
                          <span>🕐 Hora programada:</span>
                          <span className="font-medium" data-testid="cultivo-modal-tarea-hora">{tareaSeleccionada.horaProgramada}</span>
                        </div>
                      )}

                      {tareaSeleccionada.duracionEstimada && (
                        <div className="flex items-center gap-2">
                          <span>⏱️ Duración estimada:</span>
                          <span className="font-medium" data-testid="cultivo-modal-tarea-duracion">{tareaSeleccionada.duracionEstimada} minutos</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span>🔄 Es recurrente:</span>
                        <span className="font-medium" data-testid="cultivo-modal-tarea-recurrente">{tareaSeleccionada.esRecurrente ? 'Sí' : 'No'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span>🔔 Recordatorio activado:</span>
                        <span className="font-medium" data-testid="cultivo-modal-tarea-recordatorio">{tareaSeleccionada.recordatorioActivado ? 'Sí' : 'No'}</span>
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
                  data-testid="cultivo-modal-tarea-editar"
                >
                  Editar Tarea
                </button>
                <button
                  onClick={() => setTareaSeleccionada(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  data-testid="cultivo-modal-tarea-cerrar"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}