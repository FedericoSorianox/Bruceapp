/**
 * Componente CalendarioCultivos - Vista mensual interactiva de tareas de cultivo
 * Muestra las tareas programadas en un calendario con colores según tipo y estado
 * Permite navegación entre meses y clic en tareas para ver detalles
 */

'use client';

import React, { useState, useMemo } from 'react';
import { usePlanificacion } from '@/lib/hooks/usePlanificacion';
import type { TareaCultivo, TipoTarea, EstadoTarea, EventoCalendario } from '@/types/planificacion';

/**
 * Props del componente CalendarioCultivos
 */
interface Props {
  cultivoId?: string;          // ID del cultivo para filtrar tareas (opcional)
  onTareaClick?: (tarea: TareaCultivo) => void; // Callback al hacer clic en una tarea
  mostrarSoloActivas?: boolean; // Si mostrar solo tareas activas
  className?: string;          // Clases CSS adicionales
}

/**
 * Mapeo de colores para diferentes tipos de tareas
 */
const COLORES_TAREAS: Record<TipoTarea, { bg: string; text: string; border: string }> = {
  siembra: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300'
  },
  riego: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300'
  },
  fertilizacion: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300'
  },
  poda: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300'
  },
  cosecha: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300'
  },
  mantenimiento: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300'
  },
  monitoreo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-300'
  },
  otro: {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    border: 'border-pink-300'
  }
};

/**
 * Mapeo de colores para diferentes estados de tareas
 */
const COLORES_ESTADOS: Record<EstadoTarea, string> = {
  pendiente: 'opacity-60',
  en_progreso: 'ring-2 ring-blue-400',
  completada: 'opacity-40 line-through',
  cancelada: 'opacity-30',
  vencida: 'ring-2 ring-red-400'
};

/**
 * Nombres de días de la semana
 */
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * Nombres de meses
 */
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Componente principal CalendarioCultivos
 */
export default function CalendarioCultivos({
  cultivoId,
  onTareaClick,
  mostrarSoloActivas = false,
  className = ''
}: Props) {
  // Estado para el mes y año actual del calendario
  const [mesActual, setMesActual] = useState(new Date().getMonth() + 1);
  const [anioActual, setAnioActual] = useState(new Date().getFullYear());

  // Hook para obtener tareas
  const { tareas, loading, error } = usePlanificacion({
    cultivoId,
    _sort: 'fechaProgramada',
    _order: 'asc'
  });

  /**
   * Filtra tareas según los criterios especificados
   */
  const tareasFiltradas = useMemo(() => {
    let filtradas = tareas;

    // Filtrar por cultivo si se especifica
    if (cultivoId) {
      filtradas = filtradas.filter(tarea => tarea.cultivoId === cultivoId);
    }

    // Filtrar por tareas activas si se especifica
    if (mostrarSoloActivas) {
      filtradas = filtradas.filter(tarea => tarea.estado !== 'cancelada');
    }

    return filtradas;
  }, [tareas, cultivoId, mostrarSoloActivas]);

  /**
   * Genera la vista del calendario mensual
   */
  const vistaCalendario = useMemo(() => {
    const fecha = new Date(anioActual, mesActual - 1, 1);
    const primerDiaSemana = fecha.getDay();
    const ultimoDia = new Date(anioActual, mesActual, 0).getDate();
    const dias: Array<{
      fecha: string;
      diaMes: number;
      esHoy?: boolean;
      esMesActual: boolean;
      eventos: EventoCalendario[];
      tieneEventos: boolean;
    }> = [];

    // Agregar días del mes anterior si es necesario
    for (let i = 0; i < primerDiaSemana; i++) {
      const diaAnterior = new Date(anioActual, mesActual - 1, -primerDiaSemana + i + 1);
      dias.push({
        fecha: diaAnterior.toISOString().split('T')[0],
        diaMes: diaAnterior.getDate(),
        esMesActual: false,
        eventos: [],
        tieneEventos: false
      });
    }

    // Agregar días del mes actual
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const fechaDia = new Date(anioActual, mesActual - 1, dia);
      const fechaString = fechaDia.toISOString().split('T')[0];
      const esHoy = fechaDia.toDateString() === new Date().toDateString();

      // Filtrar tareas para este día
      const eventosDelDia = tareasFiltradas
        .filter(tarea => tarea.fechaProgramada === fechaString)
        .map(tarea => ({
          id: tarea.id,
          titulo: tarea.titulo,
          tipo: tarea.tipo,
          fecha: fechaString,
          estado: tarea.estado,
          prioridad: tarea.prioridad,
          descripcion: tarea.descripcion,
          duracion: tarea.duracionEstimada,
          esRecurrente: tarea.esRecurrente,
          tarea: tarea // Referencia completa a la tarea
        }));

      dias.push({
        fecha: fechaString,
        diaMes: dia,
        esHoy,
        esMesActual: true,
        eventos: eventosDelDia,
        tieneEventos: eventosDelDia.length > 0
      });
    }

    // Completar la semana si es necesario
    while (dias.length % 7 !== 0) {
      const ultimoDiaAgregado = new Date(dias[dias.length - 1].fecha);
      ultimoDiaAgregado.setDate(ultimoDiaAgregado.getDate() + 1);
      dias.push({
        fecha: ultimoDiaAgregado.toISOString().split('T')[0],
        diaMes: ultimoDiaAgregado.getDate(),
        esMesActual: false,
        eventos: [],
        tieneEventos: false
      });
    }

    return { mes: mesActual, anio: anioActual, dias };
  }, [mesActual, anioActual, tareasFiltradas]);

  /**
   * Navega al mes anterior
   */
  const handleMesAnterior = () => {
    if (mesActual === 1) {
      setMesActual(12);
      setAnioActual(anioActual - 1);
    } else {
      setMesActual(mesActual - 1);
    }
  };

  /**
   * Navega al mes siguiente
   */
  const handleMesSiguiente = () => {
    if (mesActual === 12) {
      setMesActual(1);
      setAnioActual(anioActual + 1);
    } else {
      setMesActual(mesActual + 1);
    }
  };

  /**
   * Navega al mes actual
   */
  const handleMesActual = () => {
    const hoy = new Date();
    setMesActual(hoy.getMonth() + 1);
    setAnioActual(hoy.getFullYear());
  };

  /**
   * Maneja clic en una tarea
   */
  const handleTareaClick = (tarea: TareaCultivo) => {
    if (onTareaClick) {
      onTareaClick(tarea);
    }
  };

  /**
   * Renderiza una tarea individual
   */
  const renderTarea = (tarea: TareaCultivo) => {
    const colores = COLORES_TAREAS[tarea.tipo];
    const colorEstado = COLORES_ESTADOS[tarea.estado];

    return (
      <div
        key={tarea.id}
        className={`
          ${colores.bg} ${colores.text} ${colores.border}
          ${colorEstado}
          border rounded-lg p-2 text-xs cursor-pointer
          hover:shadow-md transition-all duration-200
          truncate
        `}
        onClick={() => handleTareaClick(tarea)}
        title={`${tarea.titulo} (${tarea.tipo}) - ${tarea.estado}`}
      >
        <div className="font-medium truncate">{tarea.titulo}</div>
        {tarea.horaProgramada && (
          <div className="text-xs opacity-75">{tarea.horaProgramada}</div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
          <span className="ml-3 text-gray-600">Cargando calendario...</span>
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
            <div className="text-red-700 font-medium">Error al cargar calendario</div>
            <div className="text-red-600 text-sm mt-1">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 ${className}`}>
      {/* Header del calendario */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              {MESES[mesActual - 1]} {anioActual}
            </h2>
            {cultivoId && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Filtro por cultivo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMesAnterior}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Mes anterior"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={handleMesActual}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hoy
            </button>

            <button
              onClick={handleMesSiguiente}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Mes siguiente"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg text-blue-600">{tareasFiltradas.length}</div>
            <div className="text-gray-600">Total tareas</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-green-600">
              {tareasFiltradas.filter(t => t.estado === 'completada').length}
            </div>
            <div className="text-gray-600">Completadas</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-orange-600">
              {tareasFiltradas.filter(t => t.estado === 'pendiente').length}
            </div>
            <div className="text-gray-600">Pendientes</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-red-600">
              {tareasFiltradas.filter(t => t.estado === 'vencida').length}
            </div>
            <div className="text-gray-600">Vencidas</div>
          </div>
        </div>
      </div>

      {/* Grid del calendario */}
      <div className="p-6">
        {/* Header de días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {DIAS_SEMANA.map((dia) => (
            <div key={dia} className="p-3 text-center text-sm font-medium text-gray-500">
              {dia}
            </div>
          ))}
        </div>

        {/* Grid de días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {vistaCalendario.dias.map((dia, index) => (
            <div
              key={index}
              className={`
                min-h-[120px] p-2 border rounded-lg transition-colors
                ${dia.esHoy ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}
                ${dia.esMesActual ? 'bg-white' : 'bg-gray-50'}
                ${dia.tieneEventos ? 'border-green-300' : ''}
              `}
            >
              {/* Número del día */}
              <div className={`
                text-sm font-medium mb-2
                ${dia.esHoy ? 'text-blue-600' : 'text-gray-700'}
                ${!dia.esMesActual ? 'text-gray-400' : ''}
              `}>
                {dia.diaMes}
                {dia.esHoy && (
                  <span className="ml-1 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </div>

              {/* Eventos del día */}
              <div className="space-y-1">
                {dia.eventos.slice(0, 3).map((evento) => (
                  <div
                    key={evento.id}
                    onClick={() => evento.tarea && handleTareaClick(evento.tarea)}
                    className="cursor-pointer"
                  >
                    {renderTarea(evento.tarea)}
                  </div>
                ))}

                {/* Indicador si hay más eventos */}
                {dia.eventos.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{dia.eventos.length - 3} más
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer con leyenda */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span>Siembra</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Riego</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
            <span>Fertilización</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
            <span>Poda</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Cosecha</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
            <span>Mantenimiento</span>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Haz clic en una tarea para ver detalles • Los colores indican el tipo de tarea
        </div>
      </div>
    </div>
  );
}
