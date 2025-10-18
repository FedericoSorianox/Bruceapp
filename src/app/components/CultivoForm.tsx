/**
 * Formulario para creación y edición de cultivos
 * Componente reutilizable que maneja tanto la creación como la edición de cultivos
 * Organizado en modales separados para mejor UX: Información Básica, Especificaciones Técnicas e Información Adicional
 */

// Directiva que indica que este componente se ejecuta en el cliente (no en el servidor)
// Necesario porque usa hooks de estado y eventos del navegador
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Cultivo, CultivoCreacion } from '@/types/cultivo';
import {
  prepararContextoCultivo,
  consultarRecomendacionPH,
  consultarRecomendacionEC,
  consultarRecomendacionTemperatura,
  consultarRecomendacionHumedad
} from '@/lib/services/chat';
import type { ContextoCultivo } from '@/types/chat';

/**
 * Definición de las propiedades que recibe el componente CultivoForm
 * Todas las props son opcionales excepto onSubmit
 */
type Props = {
  initial?: Partial<Cultivo>; // Valores iniciales para editar un cultivo existente
  onSubmit: (values: CultivoCreacion) => Promise<void> | void; // Función que se ejecuta al enviar el formulario
  onCancel?: () => void; // Función opcional para cancelar la edición
  submitLabel?: string; // Texto del botón de envío (por defecto 'Guardar')
};

/**
 * Componente principal del formulario de cultivos
 * Maneja tanto la creación como la edición de cultivos
 */
export default function CultivoForm({ 
  initial, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Guardar' 
}: Props) {
  // Estados para cada campo del formulario, inicializados con valores de 'initial' si existen

  // Campo obligatorio
  const [nombre, setNombre] = useState(initial?.nombre ?? ''); // Nombre del cultivo (obligatorio)

  // Campos opcionales de información básica
  const [sustrato, setSustrato] = useState(initial?.sustrato ?? ''); // Tipo de sustrato
  const [metrosCuadrados, setMetrosCuadrados] = useState<number | string>(
    initial?.metrosCuadrados ?? ''
  ); // Área del cultivo en m²
  const [fechaComienzo, setFechaComienzo] = useState(initial?.fechaComienzo ?? ''); // Fecha de inicio

  // Campos de configuración del cultivo
  const [numeroplantas, setNumeroplantas] = useState<number | string>(
    initial?.numeroplantas ?? ''
  ); // Número total de plantas
  const [litrosMaceta, setLitrosMaceta] = useState<number | string>(
    initial?.litrosMaceta ?? ''
  ); // Capacidad de cada maceta en litros
  const [potenciaLamparas, setPotenciaLamparas] = useState<number | string>(
    initial?.potenciaLamparas ?? ''
  ); // Potencia total de iluminación en watts

  // Información adicional
  const [genetica, setGenetica] = useState(initial?.genetica ?? ''); // Información sobre la genética/variedad
  const [notas, setNotas] = useState(initial?.notas ?? ''); // Notas adicionales
  const [activo, setActivo] = useState<boolean>(initial?.activo ?? true); // Estado activo/inactivo

  // Estado para controlar cambio de fase
  const [cambiandoAFloracion, setCambiandoAFloracion] = useState(false);

  // Campos de recomendaciones de IA (ahora editables)
  const [phObjetivo, setPhObjetivo] = useState<number | string>(
    initial?.phObjetivo ?? ''
  ); // pH objetivo (editable)
  const [ecObjetivo, setEcObjetivo] = useState<number | string>(
    initial?.ecObjetivo ?? ''
  ); // EC objetivo (editable)

  // Estados de carga para consultas de IA
  const [cargandoPH, setCargandoPH] = useState(false);
  const [cargandoEC, setCargandoEC] = useState(false);
  const [cargandoTempVegetacion, setCargandoTempVegetacion] = useState(false);
  const [cargandoTempFloracion, setCargandoTempFloracion] = useState(false);
  const [cargandoHumedadVegetacion, setCargandoHumedadVegetacion] = useState(false);
  const [cargandoHumedadFloracion, setCargandoHumedadFloracion] = useState(false);

  // Condiciones ambientales por fase
  const [tempObjetivoVegetacion, setTempObjetivoVegetacion] = useState<number | string>(
    initial?.tempObjetivoVegetacion ?? ''
  ); // Temperatura vegetación (°C)
  const [tempObjetivoFloracion, setTempObjetivoFloracion] = useState<number | string>(
    initial?.tempObjetivoFloracion ?? ''
  ); // Temperatura floración (°C)
  const [humedadObjetivoVegetacion, setHumedadObjetivoVegetacion] = useState<number | string>(
    initial?.humedadObjetivoVegetacion ?? ''
  ); // Humedad vegetación (%)
  const [humedadObjetivoFloracion, setHumedadObjetivoFloracion] = useState<number | string>(
    initial?.humedadObjetivoFloracion ?? ''
  ); // Humedad floración (%)

  // Estados para controlar los modales
  const [modalAbierto, setModalAbierto] = useState<'basica' | 'tecnica' | 'adicional' | null>(null);

  // Estado de error para validación
  const [error, setError] = useState<string | null>(null); // Mensaje de error de validación

  // Calcula si el botón de envío debe estar deshabilitado
  // Se deshabilita si el nombre está vacío (después de trim)
  const disabled = useMemo(() => nombre.trim().length === 0, [nombre]);

  // Limpia el mensaje de error cada vez que cambia el nombre
  // Permite reintentar el envío después de corregir errores
  useEffect(() => setError(null), [nombre]);

  /**
   * Manejador del envío del formulario
   * Valida los campos requeridos y prepara los datos para enviar
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    // Validación: si el formulario está deshabilitado, muestra error
    if (disabled) {
      setError('El nombre del cultivo es obligatorio');
      return;
    }

    // Construye el objeto payload con los datos del formulario
    // Convierte strings vacías a undefined para campos opcionales
    // Convierte números como strings a números reales
    const payload: CultivoCreacion = {
      nombre: nombre.trim(), // Nombre sin espacios en blanco (obligatorio)
      sustrato: sustrato || undefined, // Sustrato (undefined si está vacío)
      metrosCuadrados: metrosCuadrados 
        ? parseFloat(metrosCuadrados.toString()) 
        : undefined, // Convierte a número o undefined
      fechaComienzo: fechaComienzo || undefined, // Fecha (undefined si está vacía)
      numeroplantas: numeroplantas 
        ? parseInt(numeroplantas.toString()) 
        : undefined, // Convierte a entero o undefined
      litrosMaceta: litrosMaceta 
        ? parseFloat(litrosMaceta.toString()) 
        : undefined, // Convierte a número o undefined
      potenciaLamparas: potenciaLamparas 
        ? parseFloat(potenciaLamparas.toString()) 
        : undefined, // Convierte a número o undefined
      genetica: genetica || undefined, // Genética (undefined si está vacía)
      notas: notas || undefined, // Notas (undefined si está vacío)
      activo, // Estado activo/inactivo (siempre tiene valor)

      // El resto de campos calculados se actualizan automáticamente

      // Recomendaciones de IA (ahora editables)
      phObjetivo: phObjetivo
        ? parseFloat(phObjetivo.toString())
        : undefined, // pH objetivo
      ecObjetivo: ecObjetivo
        ? parseFloat(ecObjetivo.toString())
        : undefined, // EC objetivo

      // Condiciones ambientales por fase
      tempObjetivoVegetacion: tempObjetivoVegetacion
        ? parseFloat(tempObjetivoVegetacion.toString())
        : undefined, // Temperatura vegetación
      tempObjetivoFloracion: tempObjetivoFloracion
        ? parseFloat(tempObjetivoFloracion.toString())
        : undefined, // Temperatura floración
      humedadObjetivoVegetacion: humedadObjetivoVegetacion
        ? parseFloat(humedadObjetivoVegetacion.toString())
        : undefined, // Humedad vegetación
      humedadObjetivoFloracion: humedadObjetivoFloracion
        ? parseFloat(humedadObjetivoFloracion.toString())
        : undefined, // Humedad floración
    };

    try {
      // Llama a la función onSubmit pasada como prop
      await onSubmit(payload);
    } catch (submitError) {
      // Maneja errores del envío
      const errorMessage = submitError instanceof Error 
        ? submitError.message 
        : 'Error al guardar el cultivo';
      setError(errorMessage);
    }
  }

  /**
   * Crea el contexto del cultivo actual para consultas de IA
   */
  const crearContextoCultivo = useMemo((): ContextoCultivo => {
    // Crear un objeto cultivo temporal con los valores actuales del formulario
    const cultivoTemporal: Cultivo = {
      id: initial?.id || 'temp',
      nombre: nombre || 'Cultivo temporal',
      sustrato: sustrato || undefined,
      metrosCuadrados: metrosCuadrados ? parseFloat(metrosCuadrados.toString()) : undefined,
      fechaComienzo: fechaComienzo || undefined,
      numeroplantas: numeroplantas ? parseInt(numeroplantas.toString()) : undefined,
      litrosMaceta: litrosMaceta ? parseFloat(litrosMaceta.toString()) : undefined,
      potenciaLamparas: potenciaLamparas ? parseFloat(potenciaLamparas.toString()) : undefined,
      genetica: genetica || undefined,
      activo: activo,
      notas: notas || undefined,
      galeria: initial?.galeria || [],
      fechaCreacion: initial?.fechaCreacion,
      fechaActualizacion: initial?.fechaActualizacion,
      fechaInicioFloracion: initial?.fechaInicioFloracion,
      diasVegetacionActual: initial?.diasVegetacionActual,
      diasFloracionActual: initial?.diasFloracionActual,
      semanaVegetacion: initial?.semanaVegetacion,
      semanaFloracion: initial?.semanaFloracion,
      phObjetivo: phObjetivo ? parseFloat(phObjetivo.toString()) : undefined,
      ecObjetivo: ecObjetivo ? parseFloat(ecObjetivo.toString()) : undefined,
      aguaDiariaObjetivo: initial?.aguaDiariaObjetivo,
      tempObjetivoVegetacion: tempObjetivoVegetacion ? parseFloat(tempObjetivoVegetacion.toString()) : undefined,
      tempObjetivoFloracion: tempObjetivoFloracion ? parseFloat(tempObjetivoFloracion.toString()) : undefined,
      humedadObjetivoVegetacion: humedadObjetivoVegetacion ? parseFloat(humedadObjetivoVegetacion.toString()) : undefined,
      humedadObjetivoFloracion: humedadObjetivoFloracion ? parseFloat(humedadObjetivoFloracion.toString()) : undefined,
    };

    return prepararContextoCultivo(cultivoTemporal);
  }, [nombre, sustrato, metrosCuadrados, fechaComienzo, numeroplantas, litrosMaceta, potenciaLamparas, genetica, activo, notas, phObjetivo, ecObjetivo, tempObjetivoVegetacion, tempObjetivoFloracion, humedadObjetivoVegetacion, humedadObjetivoFloracion, initial]);

  /**
   * Consulta recomendación de pH a la IA
   */
  const handleConsultarPH = async () => {
    setCargandoPH(true);
    try {
      const recomendacion = await consultarRecomendacionPH(crearContextoCultivo);
      if (recomendacion !== null) {
        setPhObjetivo(recomendacion.toString());
      } else {
        alert('No se pudo obtener una recomendación válida de pH. Intenta consultar al chat de IA directamente.');
      }
    } catch (error) {
      console.error('Error al consultar pH:', error);
      alert('Error al consultar recomendación de pH. Verifica tu conexión a internet.');
    } finally {
      setCargandoPH(false);
    }
  };

  /**
   * Consulta recomendación de EC a la IA
   */
  const handleConsultarEC = async () => {
    setCargandoEC(true);
    try {
      const recomendacion = await consultarRecomendacionEC(crearContextoCultivo);
      if (recomendacion !== null) {
        setEcObjetivo(recomendacion.toString());
      } else {
        alert('No se pudo obtener una recomendación válida de EC. Intenta consultar al chat de IA directamente.');
      }
    } catch (error) {
      console.error('Error al consultar EC:', error);
      alert('Error al consultar recomendación de EC. Verifica tu conexión a internet.');
    } finally {
      setCargandoEC(false);
    }
  };

  /**
   * Consulta recomendación de temperatura para vegetación
   */
  const handleConsultarTempVegetacion = async () => {
    setCargandoTempVegetacion(true);
    try {
      const recomendacion = await consultarRecomendacionTemperatura(crearContextoCultivo, 'vegetacion');
      if (recomendacion !== null) {
        setTempObjetivoVegetacion(recomendacion.toString());
      } else {
        alert('No se pudo obtener una recomendación válida de temperatura para vegetación.');
      }
    } catch (error) {
      console.error('Error al consultar temperatura vegetación:', error);
      alert('Error al consultar recomendación de temperatura. Verifica tu conexión a internet.');
    } finally {
      setCargandoTempVegetacion(false);
    }
  };

  /**
   * Consulta recomendación de temperatura para floración
   */
  const handleConsultarTempFloracion = async () => {
    setCargandoTempFloracion(true);
    try {
      const recomendacion = await consultarRecomendacionTemperatura(crearContextoCultivo, 'floracion');
      if (recomendacion !== null) {
        setTempObjetivoFloracion(recomendacion.toString());
      } else {
        alert('No se pudo obtener una recomendación válida de temperatura para floración.');
      }
    } catch (error) {
      console.error('Error al consultar temperatura floración:', error);
      alert('Error al consultar recomendación de temperatura. Verifica tu conexión a internet.');
    } finally {
      setCargandoTempFloracion(false);
    }
  };

  /**
   * Consulta recomendación de humedad para vegetación
   */
  const handleConsultarHumedadVegetacion = async () => {
    setCargandoHumedadVegetacion(true);
    try {
      const recomendacion = await consultarRecomendacionHumedad(crearContextoCultivo, 'vegetacion');
      if (recomendacion !== null) {
        setHumedadObjetivoVegetacion(recomendacion.toString());
      } else {
        alert('No se pudo obtener una recomendación válida de humedad para vegetación.');
      }
    } catch (error) {
      console.error('Error al consultar humedad vegetación:', error);
      alert('Error al consultar recomendación de humedad. Verifica tu conexión a internet.');
    } finally {
      setCargandoHumedadVegetacion(false);
    }
  };

  /**
   * Consulta recomendación de humedad para floración
   */
  const handleConsultarHumedadFloracion = async () => {
    setCargandoHumedadFloracion(true);
    try {
      const recomendacion = await consultarRecomendacionHumedad(crearContextoCultivo, 'floracion');
      if (recomendacion !== null) {
        setHumedadObjetivoFloracion(recomendacion.toString());
      } else {
        alert('No se pudo obtener una recomendación válida de humedad para floración.');
      }
    } catch (error) {
      console.error('Error al consultar humedad floración:', error);
      alert('Error al consultar recomendación de humedad. Verifica tu conexión a internet.');
    } finally {
      setCargandoHumedadFloracion(false);
    }
  };

  // Renderiza el formulario con modales organizados por secciones
  return (
    <>
      {/* Formulario principal */}
      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 p-6 bg-white shadow-sm" data-testid="cultivo-form">
        {/* Muestra mensaje de error si existe */}
        {error && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200" data-testid="cultivo-form-error">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Campo de nombre - obligatorio */}
        <div className="grid gap-2">
          <label htmlFor="nombre" className="text-sm font-semibold text-gray-700">
            Nombre del Cultivo *
          </label>
          <input
            id="nombre"
            data-testid="cultivo-form-nombre"
            className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors duration-200"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Tomates Cherry, Cannabis Medicinal, Lechugas Variadas..."
            required
          />
          <p className="text-xs text-gray-500">
            Ingresa un nombre descriptivo para identificar fácilmente tu cultivo
          </p>
        </div>

        {/* Sección de modales - 3 botones para abrir diferentes secciones */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Configuración del Cultivo</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Botón modal Información Básica */}
            <button
              type="button"
              onClick={() => setModalAbierto('basica')}
              data-testid="cultivo-modal-basica-button"
              className="flex flex-col items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-200"
            >
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-center">
                <h4 className="font-medium text-blue-900">Información Básica</h4>
                <p className="text-xs text-blue-700">Sustrato, área, fecha</p>
              </div>
            </button>

            {/* Botón modal Especificaciones Técnicas */}
            <button
              type="button"
              onClick={() => setModalAbierto('tecnica')}
              data-testid="cultivo-modal-tecnica-button"
              className="flex flex-col items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-all duration-200"
            >
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-center">
                <h4 className="font-medium text-purple-900">Especificaciones Técnicas</h4>
                <p className="text-xs text-purple-700">Plantas, macetas, iluminación</p>
              </div>
            </button>

            {/* Botón modal Información Adicional */}
            <button
              type="button"
              onClick={() => setModalAbierto('adicional')}
              data-testid="cultivo-modal-adicional-button"
              className="flex flex-col items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border-2 border-orange-200 hover:border-orange-300 transition-all duration-200"
            >
              <div className="p-3 bg-orange-100 rounded-full">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-center">
                <h4 className="font-medium text-orange-900">Información Adicional</h4>
                <p className="text-xs text-orange-700">Ciclos, objetivos, condiciones</p>
              </div>
            </button>
          </div>
        </div>

        {/* Campos adicionales que no están en modales */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Campo de genética */}
          <div className="grid gap-2">
            <label htmlFor="genetica" className="text-sm font-semibold text-gray-700">
              Genética / Variedad
            </label>
            <input
              id="genetica"
              className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors duration-200"
              value={genetica}
              onChange={e => setGenetica(e.target.value)}
              placeholder="Ej: White Widow, Cherry Sweet 100..."
            />
          </div>

          {/* Campo de notas */}
          <div className="grid gap-2">
            <label htmlFor="notas" className="text-sm font-semibold text-gray-700">
              Notas Adicionales
            </label>
            <textarea
              id="notas"
              className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors duration-200"
              rows={2}
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Observaciones especiales..."
            />
          </div>
        </div>

        {/* Checkbox para estado activo */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            id="activo"
            type="checkbox"
            checked={activo}
            onChange={e => setActivo(e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="activo" className="text-sm font-medium text-gray-700">
            Cultivo activo
          </label>
          <p className="text-xs text-gray-500">
            {activo ? 'Este cultivo está en progreso' : 'Este cultivo está finalizado o pausado'}
          </p>
        </div>

        {/* Sección de botones de acción */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            data-testid="cultivo-form-submit"
            disabled={disabled}
            className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-white font-semibold shadow-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {submitLabel}
          </button>
          {onCancel && (
            <button
              type="button"
              data-testid="cultivo-form-cancel"
              onClick={onCancel}
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Modal Información Básica */}
      {modalAbierto === 'basica' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
                    <p className="text-sm text-gray-600">Configura los datos fundamentales del cultivo</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalAbierto(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Campo de sustrato */}
                <div className="grid gap-2">
                  <label htmlFor="modal-sustrato" className="text-sm font-semibold text-gray-700">
                    Sustrato
                  </label>
                  <input
                    id="modal-sustrato"
                    className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200"
                    value={sustrato}
                    onChange={e => setSustrato(e.target.value)}
                    placeholder="Ej: Fibra de coco, Lana de roca, Tierra orgánica..."
                  />
                </div>

                {/* Campos en 2 columnas */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Campo de metros cuadrados */}
                  <div className="grid gap-2">
                    <label htmlFor="modal-metrosCuadrados" className="text-sm font-semibold text-gray-700">
                      Metros Cuadrados (m²)
                    </label>
                    <input
                      id="modal-metrosCuadrados"
                      type="number"
                      step="0.1"
                      min="0"
                      className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200"
                      value={metrosCuadrados}
                      onChange={e => setMetrosCuadrados(e.target.value)}
                      placeholder="25.5"
                    />
                  </div>

                  {/* Campo de fecha de comienzo */}
                  <div className="grid gap-2">
                    <label htmlFor="modal-fechaComienzo" className="text-sm font-semibold text-gray-700">
                      Fecha de Comienzo
                    </label>
                    <input
                      id="modal-fechaComienzo"
                      type="date"
                      className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200"
                      value={fechaComienzo}
                      onChange={e => setFechaComienzo(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setModalAbierto(null)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Especificaciones Técnicas */}
      {modalAbierto === 'tecnica' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Especificaciones Técnicas</h3>
                    <p className="text-sm text-gray-600">Configura los parámetros técnicos del cultivo</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalAbierto(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Campos en 2 columnas */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Campo de número de plantas */}
                  <div className="grid gap-2">
                    <label htmlFor="modal-numeroplantas" className="text-sm font-semibold text-gray-700">
                      Número de Plantas
                    </label>
                    <input
                      id="modal-numeroplantas"
                      type="number"
                      min="1"
                      className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-colors duration-200"
                      value={numeroplantas}
                      onChange={e => setNumeroplantas(e.target.value)}
                      placeholder="24"
                    />
                  </div>

                  {/* Campo de litros de maceta */}
                  <div className="grid gap-2">
                    <label htmlFor="modal-litrosMaceta" className="text-sm font-semibold text-gray-700">
                      Litros por Maceta
                    </label>
                    <input
                      id="modal-litrosMaceta"
                      type="number"
                      step="0.5"
                      min="0"
                      className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-colors duration-200"
                      value={litrosMaceta}
                      onChange={e => setLitrosMaceta(e.target.value)}
                      placeholder="18.5"
                    />
                  </div>
                </div>

                {/* Campo de potencia de lámparas - ancho completo */}
                <div className="grid gap-2">
                  <label htmlFor="modal-potenciaLamparas" className="text-sm font-semibold text-gray-700">
                    Potencia Total de Lámparas (W)
                  </label>
                  <input
                    id="modal-potenciaLamparas"
                    type="number"
                    min="0"
                    className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-colors duration-200"
                    value={potenciaLamparas}
                    onChange={e => setPotenciaLamparas(e.target.value)}
                    placeholder="600"
                  />
                  <p className="text-xs text-gray-500">
                    Potencia total de todas las lámparas utilizadas en el cultivo
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setModalAbierto(null)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Información Adicional */}
      {modalAbierto === 'adicional' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Información Adicional</h3>
                    <p className="text-sm text-gray-600">Configura ciclos, objetivos y condiciones ambientales</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalAbierto(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Estado actual del cultivo */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Estado Actual del Cultivo
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-3 bg-white rounded-lg border border-orange-200">
                      <dt className="text-sm font-medium text-orange-700">Fase Actual</dt>
                      <dd className="text-lg font-semibold text-orange-900">
                        {initial?.fechaInicioFloracion ? '🌸 Floración' : '🌱 Vegetación'}
                      </dd>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-orange-200">
                      <dt className="text-sm font-medium text-orange-700">Días Totales</dt>
                      <dd className="text-lg font-semibold text-orange-900">
                        {initial?.fechaComienzo ?
                          Math.ceil((new Date().getTime() - new Date(initial.fechaComienzo).getTime()) / (1000 * 60 * 60 * 24))
                          : '0'
                        }
                      </dd>
                    </div>
                  </div>

                  {/* Botón para cambiar a floración */}
                  {!initial?.fechaInicioFloracion && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-yellow-900">¿Cambiar a fase de floración?</h5>
                          <p className="text-sm text-yellow-700">Marca cuando tus plantas comiencen a florecer</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCambiandoAFloracion(true)}
                          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                          Cambiar a Floración
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Confirmación de cambio a floración */}
                  {cambiandoAFloracion && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-red-900">Confirmar cambio a floración</h5>
                          <p className="text-sm text-red-700">¿Estás seguro de que quieres marcar el inicio de la floración para hoy?</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCambiandoAFloracion(false)}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                // Aquí deberíamos llamar a la función para marcar el cambio de fase
                                // Pero como estamos en el componente de formulario, esto debería hacerse desde el padre
                                // Por ahora solo cerramos el modal y asumimos que se manejará desde el componente padre
                                alert('Para cambiar de fase, usa el botón en la página de detalle del cultivo.');
                                setCambiandoAFloracion(false);
                              } catch (error) {
                                console.error('Error al cambiar de fase:', error);
                              }
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                          >
                            Confirmar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recomendaciones de IA - Editables con botones de consulta */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Parámetros Nutricionales
                  </h4>
                  <div className="space-y-4">
                    {/* Campo pH - Editable con botón de consulta */}
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="modal-phObjetivo" className="text-sm font-semibold text-gray-700">
                          pH Objetivo
                        </label>
                        <button
                          type="button"
                          onClick={handleConsultarPH}
                          disabled={cargandoPH}
                          className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs font-medium rounded transition-colors duration-200"
                        >
                          {cargandoPH ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                              Consultando...
                            </>
                          ) : (
                            <>
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              Consultar IA
                            </>
                          )}
                        </button>
                      </div>
                      <input
                        id="modal-phObjetivo"
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors duration-200"
                        value={phObjetivo}
                        onChange={e => setPhObjetivo(e.target.value)}
                        placeholder="6.2"
                      />
                      <p className="text-xs text-green-600">Valor óptimo del pH para el agua de riego</p>
                    </div>

                    {/* Campo EC - Editable con botón de consulta */}
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="modal-ecObjetivo" className="text-sm font-semibold text-gray-700">
                          EC Objetivo (ppm)
                        </label>
                        <button
                          type="button"
                          onClick={handleConsultarEC}
                          disabled={cargandoEC}
                          className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs font-medium rounded transition-colors duration-200"
                        >
                          {cargandoEC ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                              Consultando...
                            </>
                          ) : (
                            <>
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              Consultar IA
                            </>
                          )}
                        </button>
                      </div>
                      <input
                        id="modal-ecObjetivo"
                        type="number"
                        step="0.1"
                        min="0"
                        className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-colors duration-200"
                        value={ecObjetivo}
                        onChange={e => setEcObjetivo(e.target.value)}
                        placeholder="1.8"
                      />
                      <p className="text-xs text-green-600">Conductividad eléctrica óptima en partes por millón</p>
                    </div>
                  </div>
                </div>

                {/* Condiciones ambientales por fase */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M8 5a2 2 0 012-2h4a2 2 0 012 2v0" />
                    </svg>
                    Condiciones Ambientales por Fase
                  </h4>

                  {/* Fase de Vegetación */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-blue-800 mb-2">🌱 Fase de Vegetación</h5>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="modal-tempVegetacion" className="text-sm font-semibold text-gray-700">
                            Temperatura (°C)
                          </label>
                          <button
                            type="button"
                            onClick={handleConsultarTempVegetacion}
                            disabled={cargandoTempVegetacion}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium rounded transition-colors duration-200"
                          >
                            {cargandoTempVegetacion ? (
                              <>
                                <div className="animate-spin rounded-full h-2 w-2 border border-white border-t-transparent"></div>
                                ...
                              </>
                            ) : (
                              <>
                                <svg className="h-2 w-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                IA
                              </>
                            )}
                          </button>
                        </div>
                        <input
                          id="modal-tempVegetacion"
                          type="number"
                          step="0.1"
                          className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200"
                          value={tempObjetivoVegetacion}
                          onChange={e => setTempObjetivoVegetacion(e.target.value)}
                          placeholder="25.5"
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="modal-humedadVegetacion" className="text-sm font-semibold text-gray-700">
                            Humedad (%)
                          </label>
                          <button
                            type="button"
                            onClick={handleConsultarHumedadVegetacion}
                            disabled={cargandoHumedadVegetacion}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium rounded transition-colors duration-200"
                          >
                            {cargandoHumedadVegetacion ? (
                              <>
                                <div className="animate-spin rounded-full h-2 w-2 border border-white border-t-transparent"></div>
                                ...
                              </>
                            ) : (
                              <>
                                <svg className="h-2 w-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                IA
                              </>
                            )}
                          </button>
                        </div>
                        <input
                          id="modal-humedadVegetacion"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200"
                          value={humedadObjetivoVegetacion}
                          onChange={e => setHumedadObjetivoVegetacion(e.target.value)}
                          placeholder="65"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fase de Floración */}
                  <div>
                    <h5 className="text-sm font-medium text-blue-800 mb-2">🌸 Fase de Floración</h5>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="modal-tempFloracion" className="text-sm font-semibold text-gray-700">
                            Temperatura (°C)
                          </label>
                          <button
                            type="button"
                            onClick={handleConsultarTempFloracion}
                            disabled={cargandoTempFloracion}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium rounded transition-colors duration-200"
                          >
                            {cargandoTempFloracion ? (
                              <>
                                <div className="animate-spin rounded-full h-2 w-2 border border-white border-t-transparent"></div>
                                ...
                              </>
                            ) : (
                              <>
                                <svg className="h-2 w-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                IA
                              </>
                            )}
                          </button>
                        </div>
                        <input
                          id="modal-tempFloracion"
                          type="number"
                          step="0.1"
                          className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200"
                          value={tempObjetivoFloracion}
                          onChange={e => setTempObjetivoFloracion(e.target.value)}
                          placeholder="22.0"
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <label htmlFor="modal-humedadFloracion" className="text-sm font-semibold text-gray-700">
                            Humedad (%)
                          </label>
                          <button
                            type="button"
                            onClick={handleConsultarHumedadFloracion}
                            disabled={cargandoHumedadFloracion}
                            className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium rounded transition-colors duration-200"
                          >
                            {cargandoHumedadFloracion ? (
                              <>
                                <div className="animate-spin rounded-full h-2 w-2 border border-white border-t-transparent"></div>
                                ...
                              </>
                            ) : (
                              <>
                                <svg className="h-2 w-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                IA
                              </>
                            )}
                          </button>
                        </div>
                        <input
                          id="modal-humedadFloracion"
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors duration-200"
                          value={humedadObjetivoFloracion}
                          onChange={e => setHumedadObjetivoFloracion(e.target.value)}
                          placeholder="45"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setModalAbierto(null)}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
