/**
 * Componente GestionTareasCultivo - Gestión completa de tareas de cultivo
 * Permite crear, editar, eliminar y gestionar tareas de cultivo con filtros y búsqueda
 * Incluye formulario modal y lista interactiva de tareas
 */

'use client';

import React, { useState, useMemo } from 'react';
import { usePlanificacion, type UsePlanificacionReturn } from '@/lib/hooks/usePlanificacion';
import { useAuth } from '@/lib/auth/AuthProvider';
import { calcularObjetivosAgronomicos } from '@/lib/knowledge/agronomicKnowledgeBase';
import { prepararContextoCultivo } from '@/lib/services/chat';
import type { Cultivo } from '@/types/cultivo';
import type {
  TareaCultivo,
  TareaCreacion,
  TipoTarea,
  EstadoTarea,
  PrioridadTarea
} from '@/types/planificacion';

interface Props {
  cultivoId?: string;
  cultivos?: Cultivo[];
  planificacion?: UsePlanificacionReturn;
  mostrarSoloActivas?: boolean;
  className?: string;
  onTareaClick?: (tarea: TareaCultivo) => void;
}

/**
 * Mapeo de colores para diferentes tipos de tareas
 */
const COLORES_TAREAS: Record<TipoTarea, { bg: string; text: string; border: string }> = {
  siembra: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  riego: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  fertilizacion: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  poda: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  cosecha: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  mantenimiento: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  monitoreo: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  otro: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' }
};

/**
 * Mapeo de colores para diferentes estados de tareas
 */
const COLORES_ESTADOS: Record<EstadoTarea, string> = {
  pendiente: 'text-yellow-600',
  en_progreso: 'text-blue-600',
  completada: 'text-green-600',
  cancelada: 'text-gray-600',
  vencida: 'text-red-600'
};

/**
 * Mapeo de colores para diferentes prioridades
 */
const COLORES_PRIORIDADES: Record<PrioridadTarea, string> = {
  baja: 'text-gray-600',
  media: 'text-blue-600',
  alta: 'text-orange-600',
  urgente: 'text-red-600'
};

/**
 * Nombres de tipos de tareas
 */
const NOMBRES_TIPOS: Record<TipoTarea, string> = {
  siembra: 'Siembra',
  riego: 'Riego',
  fertilizacion: 'Fertilización',
  poda: 'Poda',
  cosecha: 'Cosecha',
  mantenimiento: 'Mantenimiento',
  monitoreo: 'Monitoreo',
  otro: 'Otro'
};

/**
 * Nombres de estados de tareas
 */
const NOMBRES_ESTADOS: Record<EstadoTarea, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  completada: 'Completada',
  cancelada: 'Cancelada',
  vencida: 'Vencida'
};

/**
 * Nombres de prioridades
 */
const NOMBRES_PRIORIDADES: Record<PrioridadTarea, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente'
};

/**
 * Componente principal GestionTareasCultivo
 */
export default function GestionTareasCultivo({
  cultivoId,
  cultivos = [],
  planificacion,
  mostrarSoloActivas = false,
  className = '',
  onTareaClick
}: Props) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<TareaCultivo | null>(null);
  const [tareaDetalle, setTareaDetalle] = useState<TareaCultivo | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [generandoPlanKB, setGenerandoPlanKB] = useState(false);
  const [mensajePlanKB, setMensajePlanKB] = useState<string | null>(null);

  const { canCreateTarea, canDeleteTarea, canEditRecursos } = useAuth();
  const [filtroTipo, setFiltroTipo] = useState<TipoTarea | 'todos'>('todos');
  const [filtroEstado, setFiltroEstado] = useState<EstadoTarea | 'todos'>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<PrioridadTarea | 'todos'>('todos');

  const internalPlanificacion = usePlanificacion({
    cultivoId,
    _sort: 'fechaProgramada',
    _order: 'asc'
  });

  const {
    tareas,
    loading,
    error,
    estadisticas,
    create,
    update,
    remove,
    completar,
    iniciar,
    cancelar
  } = planificacion || internalPlanificacion;

  const cultivoMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of cultivos) {
      map[c.id] = c.nombre;
    }
    return map;
  }, [cultivos]);

  /**
   * Filtra tareas según los criterios de búsqueda y filtros
   */
  const tareasFiltradas = useMemo(() => {
    let filtradas = tareas;

    // Aplicar filtros del hook si están activos
    if (cultivoId) {
      filtradas = filtradas.filter(tarea => tarea.cultivoId === cultivoId);
    }

    // Filtro de búsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      filtradas = filtradas.filter(tarea =>
        tarea.titulo.toLowerCase().includes(busquedaLower) ||
        tarea.descripcion?.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtros adicionales
    if (filtroTipo !== 'todos') {
      filtradas = filtradas.filter(tarea => tarea.tipo === filtroTipo);
    }

    if (filtroEstado !== 'todos') {
      filtradas = filtradas.filter(tarea => tarea.estado === filtroEstado);
    }

    if (filtroPrioridad !== 'todos') {
      filtradas = filtradas.filter(tarea => tarea.prioridad === filtroPrioridad);
    }

    // Mostrar solo activas si se especifica
    if (mostrarSoloActivas) {
      filtradas = filtradas.filter(tarea => tarea.estado !== 'cancelada');
    }

    return filtradas;
  }, [tareas, cultivoId, busqueda, filtroTipo, filtroEstado, filtroPrioridad, mostrarSoloActivas]);

  /**
   * Maneja la creación de una nueva tarea
   */
  const handleCrearTarea = async (datos: TareaCreacion) => {
    // Validar que se haya proporcionado un cultivoId válido
    if (!datos.cultivoId || datos.cultivoId.trim() === '') {
      alert('Error: Debe seleccionar un cultivo antes de crear una tarea.');
      return;
    }

    try {
      await create(datos);
      setMostrarFormulario(false);
    } catch (error) {
      console.error('Error al crear tarea:', error);
    }
  };

  /**
   * Maneja la edición de una tarea existente
   */
  const handleEditarTarea = async (datos: Partial<TareaCultivo>) => {
    if (!tareaEditando) return;

    try {
      await update(tareaEditando.id, datos);
      setTareaEditando(null);
    } catch (error) {
      console.error('Error al editar tarea:', error);
    }
  };

  /**
   * Maneja la eliminación de una tarea
   */
  const handleEliminarTarea = async (tareaId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) return;

    try {
      await remove(tareaId);
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  };

  /**
   * Maneja el cambio de estado de una tarea
   */
  const handleCambiarEstado = async (tareaId: string, nuevoEstado: EstadoTarea) => {
    try {
      switch (nuevoEstado) {
        case 'en_progreso':
          await iniciar(tareaId);
          break;
        case 'completada':
          await completar(tareaId);
          break;
        case 'cancelada':
          await cancelar(tareaId);
          break;
        default:
          await update(tareaId, { estado: nuevoEstado });
      }
    } catch (error) {
      console.error('Error al cambiar estado de tarea:', error);
    }
  };

  /**
   * Maneja el clic en "Ver detalles" de una tarea
   */
  const handleVerDetalles = (tarea: TareaCultivo) => {
    setTareaDetalle(tarea);
    // Llama al callback externo si está definido
    if (onTareaClick) {
      onTareaClick(tarea);
    }
  };

  /**
   * Cierra el modal de detalles
   */
  const handleCerrarModalDetalles = () => {
    setTareaDetalle(null);
  };


  /**
   * Renderiza una tarea individual
   */
  const renderTarea = (tarea: TareaCultivo) => {
    const colores = COLORES_TAREAS[tarea.tipo];
    const esVencida = tarea.estado === 'pendiente' && new Date(tarea.fechaProgramada) < new Date();

    return (
      <div
        key={tarea.id}
        className={`
          bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200
          ${esVencida ? 'border-red-300 bg-red-50' : 'border-gray-200'}
        `}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h4 className="font-semibold text-gray-900">{tarea.titulo}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${colores.bg} ${colores.text} ${colores.border}`}>
                {NOMBRES_TIPOS[tarea.tipo]}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${COLORES_PRIORIDADES[tarea.prioridad]} bg-gray-100`}>
                {NOMBRES_PRIORIDADES[tarea.prioridad]}
              </span>
              {!cultivoId && cultivoMap[tarea.cultivoId] && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  🌿 {cultivoMap[tarea.cultivoId]}
                </span>
              )}
            </div>

            {tarea.descripcion && (
              <p className="text-gray-600 text-sm mb-2">{tarea.descripcion}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>📅 {new Date(tarea.fechaProgramada).toLocaleDateString()}</span>
              {tarea.horaProgramada && (
                <span>🕐 {tarea.horaProgramada}</span>
              )}
              {tarea.duracionEstimada && (
                <span>⏱️ {tarea.duracionEstimada} min</span>
              )}
              {tarea.esRecurrente && (
                <span className="text-blue-600">🔄 Recurrente</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${COLORES_ESTADOS[tarea.estado]}`}>
              {NOMBRES_ESTADOS[tarea.estado]}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVerDetalles(tarea)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver detalles
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Botones de acción según estado */}
            {tarea.estado === 'pendiente' && (
              <>
                <button
                  onClick={() => handleCambiarEstado(tarea.id, 'en_progreso')}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Iniciar
                </button>
                <button
                  onClick={() => handleCambiarEstado(tarea.id, 'completada')}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Completar
                </button>
              </>
            )}

            {tarea.estado === 'en_progreso' && (
              <button
                onClick={() => handleCambiarEstado(tarea.id, 'completada')}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Finalizar
              </button>
            )}

            {canEditRecursos(tarea.creadoPor || '') && (
              <button
                onClick={() => setTareaEditando(tarea)}
                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Editar
              </button>
            )}

            {canDeleteTarea(tarea.creadoPor || '') && (
              <button
                onClick={() => handleEliminarTarea(tarea.id)}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderiza el formulario de tarea
   */
  const renderFormularioTarea = () => {
    const tareaInicial = tareaEditando || {
      titulo: '',
      descripcion: '',
      tipo: 'otro' as TipoTarea,
      estado: 'pendiente' as EstadoTarea,
      prioridad: 'media' as PrioridadTarea,
      fechaProgramada: new Date().toISOString().split('T')[0],
      horaProgramada: '',
      duracionEstimada: undefined,
      esRecurrente: false,
      recordatorioActivado: false,
      minutosRecordatorio: 15
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {tareaEditando ? 'Editar Tarea' : 'Nueva Tarea'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {tareaEditando ? 'Modifica los datos de la tarea' : 'Crea una nueva tarea para tu cultivo'}
                </p>
              </div>
              <button
                onClick={() => {
                  setMostrarFormulario(false);
                  setTareaEditando(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                const selectedCultivoId = cultivoId || (formData.get('cultivoId') as string) || tareaEditando?.cultivoId || (cultivos[0]?.id ?? '');

                const datos: TareaCreacion = {
                  cultivoId: selectedCultivoId,
                  titulo: formData.get('titulo') as string,
                  descripcion: formData.get('descripcion') as string,
                  tipo: formData.get('tipo') as TipoTarea,
                  estado: (formData.get('estado') as EstadoTarea) || 'pendiente',
                  prioridad: formData.get('prioridad') as PrioridadTarea,
                  fechaProgramada: formData.get('fechaProgramada') as string,
                  horaProgramada: formData.get('horaProgramada') as string || undefined,
                  duracionEstimada: formData.get('duracionEstimada') ? parseInt(formData.get('duracionEstimada') as string) : undefined,
                  esRecurrente: formData.get('esRecurrente') === 'on',
                  recordatorioActivado: formData.get('recordatorioActivado') === 'on',
                  minutosRecordatorio: formData.get('minutosRecordatorio') ? parseInt(formData.get('minutosRecordatorio') as string) : 15
                };

                if (tareaEditando) {
                  handleEditarTarea(datos);
                } else {
                  handleCrearTarea(datos);
                }
              }}
              className="space-y-6"
            >
              {/* Selector de cultivo cuando se crea desde la vista general */}
              {!cultivoId && cultivos.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cultivo / Sala *
                  </label>
                  <select
                    name="cultivoId"
                    defaultValue={tareaEditando?.cultivoId || cultivos[0]?.id || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {cultivos.map((c) => (
                      <option key={c.id} value={c.id}>
                        🌿 {c.nombre} {c.genetica ? `(${c.genetica})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Campos básicos */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    name="titulo"
                    defaultValue={tareaInicial.titulo}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Ej: Regar plantas del invernadero A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Tarea
                  </label>
                  <select
                    name="tipo"
                    defaultValue={tareaInicial.tipo}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {Object.entries(NOMBRES_TIPOS).map(([valor, nombre]) => (
                      <option key={valor} value={valor}>{nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  defaultValue={tareaInicial.descripcion}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Detalles adicionales de la tarea..."
                />
              </div>

              {/* Fecha y hora */}
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Programada *
                  </label>
                  <input
                    name="fechaProgramada"
                    type="date"
                    defaultValue={tareaInicial.fechaProgramada}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Programada
                  </label>
                  <input
                    name="horaProgramada"
                    type="time"
                    defaultValue={tareaInicial.horaProgramada}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (minutos)
                  </label>
                  <input
                    name="duracionEstimada"
                    type="number"
                    min="1"
                    defaultValue={tareaInicial.duracionEstimada}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Configuración adicional */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    name="prioridad"
                    defaultValue={tareaInicial.prioridad}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {Object.entries(NOMBRES_PRIORIDADES).map(([valor, nombre]) => (
                      <option key={valor} value={valor}>{nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado Inicial
                  </label>
                  <select
                    name="estado"
                    defaultValue={tareaInicial.estado}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {Object.entries(NOMBRES_ESTADOS).map(([valor, nombre]) => (
                      <option key={valor} value={valor}>{nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Opciones de recordatorio */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    name="recordatorioActivado"
                    type="checkbox"
                    defaultChecked={tareaInicial.recordatorioActivado}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Activar recordatorio
                  </label>
                </div>

                {tareaInicial.recordatorioActivado && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minutos antes del recordatorio
                    </label>
                    <input
                      name="minutosRecordatorio"
                      type="number"
                      min="1"
                      max="1440"
                      defaultValue={tareaInicial.minutosRecordatorio}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  {tareaEditando ? 'Actualizar Tarea' : 'Crear Tarea'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setTareaEditando(null);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderiza el modal de detalles de tarea
   */
  const renderModalDetalles = () => {
    if (!tareaDetalle) return null;

    const colores = COLORES_TAREAS[tareaDetalle.tipo];
    const esVencida = tareaDetalle.estado === 'pendiente' && new Date(tareaDetalle.fechaProgramada) < new Date();

    return (
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
                onClick={handleCerrarModalDetalles}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={`
              border rounded-lg p-4 mb-6
              ${esVencida ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}
            `}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{tareaDetalle.titulo}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${colores.bg} ${colores.text} ${colores.border}`}>
                      {NOMBRES_TIPOS[tareaDetalle.tipo]}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${COLORES_PRIORIDADES[tareaDetalle.prioridad]} bg-gray-100`}>
                      {NOMBRES_PRIORIDADES[tareaDetalle.prioridad]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-sm font-medium ${COLORES_ESTADOS[tareaDetalle.estado]}`}>
                      {NOMBRES_ESTADOS[tareaDetalle.estado]}
                    </span>
                    {esVencida && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                        Vencida
                      </span>
                    )}
                  </div>

                  {tareaDetalle.descripcion && (
                    <p className="text-gray-600 mb-3">{tareaDetalle.descripcion}</p>
                  )}

                  <div className="grid gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>📅 Fecha programada:</span>
                      <span className="font-medium">{new Date(tareaDetalle.fechaProgramada).toLocaleDateString()}</span>
                    </div>

                    {tareaDetalle.horaProgramada && (
                      <div className="flex items-center gap-2">
                        <span>🕐 Hora programada:</span>
                        <span className="font-medium">{tareaDetalle.horaProgramada}</span>
                      </div>
                    )}

                    {tareaDetalle.duracionEstimada && (
                      <div className="flex items-center gap-2">
                        <span>⏱️ Duración estimada:</span>
                        <span className="font-medium">{tareaDetalle.duracionEstimada} minutos</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span>🔄 Es recurrente:</span>
                      <span className="font-medium">{tareaDetalle.esRecurrente ? 'Sí' : 'No'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span>🔔 Recordatorio activado:</span>
                      <span className="font-medium">{tareaDetalle.recordatorioActivado ? 'Sí' : 'No'}</span>
                    </div>

                    {tareaDetalle.recordatorioActivado && tareaDetalle.minutosRecordatorio && (
                      <div className="flex items-center gap-2">
                        <span>⏰ Minutos antes del recordatorio:</span>
                        <span className="font-medium">{tareaDetalle.minutosRecordatorio} minutos</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setTareaEditando(tareaDetalle);
                  setTareaDetalle(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Editar Tarea
              </button>
              <button
                onClick={handleCerrarModalDetalles}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
          <span className="ml-3 text-gray-600">Cargando tareas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <div className="text-red-700 font-medium">Error al cargar tareas</div>
            <div className="text-red-600 text-sm mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📋</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestión de Tareas</h2>
              <p className="text-gray-600 text-sm">
                {cultivoId ? 'Tareas de cultivo específico' : 'Todas las tareas'}
              </p>
            </div>
          </div>

          {canCreateTarea() && (cultivoId || cultivos.length > 0) && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={generandoPlanKB}
                onClick={async () => {
                  const targetCrop =
                    cultivos.find((c) => c.id === cultivoId) || cultivos[0];
                  if (!targetCrop) return;
                  setGenerandoPlanKB(true);
                  setMensajePlanKB(null);
                  try {
                    const ctx = prepararContextoCultivo(targetCrop);
                    const kb = calcularObjetivosAgronomicos(ctx);
                    const accionesTareas = kb.accionesSugeridas.filter(
                      (a) => a.tipoAccion === 'crear_tarea'
                    );
                    let creadas = 0;
                    for (const acc of accionesTareas) {
                      const yaExiste = tareas.some(
                        (t) =>
                          t.cultivoId === targetCrop.id &&
                          t.estado !== 'cancelada' &&
                          t.titulo === acc.titulo
                      );
                      if (!yaExiste) {
                        const fechaTarget = new Date();
                        fechaTarget.setDate(
                          fechaTarget.getDate() + (acc.diasOffset ?? 0)
                        );
                        await create({
                          cultivoId: targetCrop.id,
                          titulo: acc.titulo,
                          descripcion: acc.descripcion,
                          tipo: acc.categoriaTarea || 'mantenimiento',
                          estado: 'pendiente',
                          prioridad: acc.prioridad || 'alta',
                          fechaProgramada: fechaTarget.toISOString().split('T')[0],
                          duracionEstimada: acc.duracionEstimada || 30,
                          esRecurrente: false,
                          recordatorioActivado: true,
                          minutosRecordatorio: 15,
                        });
                        creadas++;
                      }
                    }
                    setMensajePlanKB(
                      creadas > 0
                        ? `✓ Se agendaron ${creadas} tareas oficiales del protocolo ${kb.codigoProtocolo} (0 tokens)`
                        : `✓ Las tareas del protocolo ${kb.codigoProtocolo} ya están agendadas en la sala`
                    );
                  } catch (e) {
                    console.error('Error al generar plan KB:', e);
                  } finally {
                    setGenerandoPlanKB(false);
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                title="Generar tareas estandarizadas desde la Base de Conocimiento Agronómica (0 tokens)"
              >
                <span>📚</span>
                <span>{generandoPlanKB ? 'Generando...' : '✨ Plan Etapa (KB)'}</span>
              </button>

              <button
                onClick={() => setMostrarFormulario(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition-colors duration-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Tarea
              </button>
            </div>
          )}
          {!canCreateTarea() && (
            <div className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg">
              <span><span className="font-medium">Solo administradores</span> pueden crear tareas</span>
            </div>
          )}
        </div>

        {mensajePlanKB && (
          <div className="mt-3 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
            <span>{mensajePlanKB}</span>
            <button
              type="button"
              onClick={() => setMensajePlanKB(null)}
              className="text-emerald-700 hover:text-emerald-950 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Estadísticas rápidas */}
        {estadisticas && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg text-blue-600">{estadisticas.totalTareas}</div>
              <div className="text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-green-600">{estadisticas.tareasCompletadas}</div>
              <div className="text-gray-600">Completadas</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-orange-600">{estadisticas.tareasPendientes}</div>
              <div className="text-gray-600">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-red-600">{estadisticas.tareasVencidas}</div>
              <div className="text-gray-600">Vencidas</div>
            </div>
          </div>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Filtro por tipo */}
          <div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoTarea | 'todos')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="todos">Todos los tipos</option>
              {Object.entries(NOMBRES_TIPOS).map(([valor, nombre]) => (
                <option key={valor} value={valor}>{nombre}</option>
              ))}
            </select>
          </div>

          {/* Filtro por estado */}
          <div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoTarea | 'todos')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="todos">Todos los estados</option>
              {Object.entries(NOMBRES_ESTADOS).map(([valor, nombre]) => (
                <option key={valor} value={valor}>{nombre}</option>
              ))}
            </select>
          </div>

          {/* Filtro por prioridad */}
          <div>
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value as PrioridadTarea | 'todos')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="todos">Todas las prioridades</option>
              {Object.entries(NOMBRES_PRIORIDADES).map(([valor, nombre]) => (
                <option key={valor} value={valor}>{nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de tareas */}
      <div className="p-6">
        {tareasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">📋</div>
            <div className="text-gray-600 font-medium">No hay tareas para mostrar</div>
            <div className="text-gray-500 text-sm mt-1">
              {busqueda || filtroTipo !== 'todos' || filtroEstado !== 'todos' || filtroPrioridad !== 'todos'
                ? 'Ajusta los filtros para ver más tareas'
                : 'Crea tu primera tarea para comenzar a planificar'
              }
            </div>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Crear primera tarea
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tareasFiltradas.map(renderTarea)}
          </div>
        )}
      </div>

      {/* Formulario modal */}
      {mostrarFormulario && renderFormularioTarea()}

      {/* Modal de detalles */}
      {renderModalDetalles()}
    </div>
  );
}
