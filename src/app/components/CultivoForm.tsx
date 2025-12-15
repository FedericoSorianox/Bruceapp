/**
 * Formulario para creación y edición de cultivos
 * Componente reutilizable que maneja tanto la creación como la edición de cultivos
 * Refactorizado: Unificado en una sola vista scrollable para mejor UX
 */

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

type Props = {
  initial?: Partial<Cultivo>;
  onSubmit: (values: CultivoCreacion) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
};

export default function CultivoForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Guardar'
}: Props) {
  // Estado Principal
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [genetica, setGenetica] = useState(initial?.genetica ?? '');
  const [activo, setActivo] = useState<boolean>(initial?.activo ?? true);

  // Detalles del Espacio
  const [sustrato, setSustrato] = useState(initial?.sustrato ?? '');
  const [metrosCuadrados, setMetrosCuadrados] = useState<number | string>(initial?.metrosCuadrados ?? '');
  const [fechaComienzo, setFechaComienzo] = useState(initial?.fechaComienzo ?? '');

  // Especificaciones Técnicas
  const [numeroplantas, setNumeroplantas] = useState<number | string>(initial?.numeroplantas ?? '');
  const [litrosMaceta, setLitrosMaceta] = useState<number | string>(initial?.litrosMaceta ?? '');
  const [potenciaLamparas, setPotenciaLamparas] = useState<number | string>(initial?.potenciaLamparas ?? '');

  // IA y Parámetros
  const [phObjetivo, setPhObjetivo] = useState<number | string>(initial?.phObjetivo ?? '');
  const [ecObjetivo, setEcObjetivo] = useState<number | string>(initial?.ecObjetivo ?? '');

  // Condiciones Ambientales
  const [tempObjetivoVegetacion, setTempObjetivoVegetacion] = useState<number | string>(initial?.tempObjetivoVegetacion ?? '');
  const [tempObjetivoFloracion, setTempObjetivoFloracion] = useState<number | string>(initial?.tempObjetivoFloracion ?? '');
  const [humedadObjetivoVegetacion, setHumedadObjetivoVegetacion] = useState<number | string>(initial?.humedadObjetivoVegetacion ?? '');
  const [humedadObjetivoFloracion, setHumedadObjetivoFloracion] = useState<number | string>(initial?.humedadObjetivoFloracion ?? '');

  // Notas
  const [notas, setNotas] = useState(initial?.notas ?? '');

  // Estados de carga (IA)
  const [cargandoPH, setCargandoPH] = useState(false);
  const [cargandoEC, setCargandoEC] = useState(false);
  const [cargandoTempVegetacion, setCargandoTempVegetacion] = useState(false);
  const [cargandoTempFloracion, setCargandoTempFloracion] = useState(false);
  const [cargandoHumedadVegetacion, setCargandoHumedadVegetacion] = useState(false);
  const [cargandoHumedadFloracion, setCargandoHumedadFloracion] = useState(false);

  // Validación
  const [error, setError] = useState<string | null>(null);
  const disabled = useMemo(() => nombre.trim().length === 0, [nombre]);

  useEffect(() => setError(null), [nombre]);

  // Manejadores de IA (Sin cambios en lógica, solo reubicados)
  const crearContextoCultivo = useMemo((): ContextoCultivo => {
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
      // Preservar datos históricos si existen
      fechaCreacion: initial?.fechaCreacion,
      fechaActualizacion: initial?.fechaActualizacion,
      fechaInicioFloracion: initial?.fechaInicioFloracion,
      phObjetivo: phObjetivo ? parseFloat(phObjetivo.toString()) : undefined,
      ecObjetivo: ecObjetivo ? parseFloat(ecObjetivo.toString()) : undefined,
      tempObjetivoVegetacion: tempObjetivoVegetacion ? parseFloat(tempObjetivoVegetacion.toString()) : undefined,
      tempObjetivoFloracion: tempObjetivoFloracion ? parseFloat(tempObjetivoFloracion.toString()) : undefined,
      humedadObjetivoVegetacion: humedadObjetivoVegetacion ? parseFloat(humedadObjetivoVegetacion.toString()) : undefined,
      humedadObjetivoFloracion: humedadObjetivoFloracion ? parseFloat(humedadObjetivoFloracion.toString()) : undefined,
    };
    return prepararContextoCultivo(cultivoTemporal);
  }, [nombre, sustrato, metrosCuadrados, fechaComienzo, numeroplantas, litrosMaceta, potenciaLamparas, genetica, activo, notas, phObjetivo, ecObjetivo, tempObjetivoVegetacion, tempObjetivoFloracion, humedadObjetivoVegetacion, humedadObjetivoFloracion, initial]);

  const handleConsultarPH = async () => {
    setCargandoPH(true);
    try {
      const recomendacion = await consultarRecomendacionPH(crearContextoCultivo);
      if (recomendacion !== null) setPhObjetivo(recomendacion.toString());
    } catch (e) { console.error(e); } finally { setCargandoPH(false); }
  };

  const handleConsultarEC = async () => {
    setCargandoEC(true);
    try {
      const recomendacion = await consultarRecomendacionEC(crearContextoCultivo);
      if (recomendacion !== null) setEcObjetivo(recomendacion.toString());
    } catch (e) { console.error(e); } finally { setCargandoEC(false); }
  };

  const wrapConsulta = async (setter: Function, loader: Function, fetcher: Function, ...args: any[]) => {
    loader(true);
    try {
      const res = await fetcher(crearContextoCultivo, ...args);
      if (res !== null) setter(res.toString());
    } catch (e) { console.error(e); } finally { loader(false); }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) { setError('El nombre es obligatorio'); return; }

    const payload: CultivoCreacion = {
      nombre: nombre.trim(),
      sustrato: sustrato || undefined,
      metrosCuadrados: metrosCuadrados ? parseFloat(metrosCuadrados.toString()) : undefined,
      fechaComienzo: fechaComienzo || undefined,
      numeroplantas: numeroplantas ? parseInt(numeroplantas.toString()) : undefined,
      litrosMaceta: litrosMaceta ? parseFloat(litrosMaceta.toString()) : undefined,
      potenciaLamparas: potenciaLamparas ? parseFloat(potenciaLamparas.toString()) : undefined,
      genetica: genetica || undefined,
      notas: notas || undefined,
      activo,
      phObjetivo: phObjetivo ? parseFloat(phObjetivo.toString()) : undefined,
      ecObjetivo: ecObjetivo ? parseFloat(ecObjetivo.toString()) : undefined,
      tempObjetivoVegetacion: tempObjetivoVegetacion ? parseFloat(tempObjetivoVegetacion.toString()) : undefined,
      tempObjetivoFloracion: tempObjetivoFloracion ? parseFloat(tempObjetivoFloracion.toString()) : undefined,
      humedadObjetivoVegetacion: humedadObjetivoVegetacion ? parseFloat(humedadObjetivoVegetacion.toString()) : undefined,
      humedadObjetivoFloracion: humedadObjetivoFloracion ? parseFloat(humedadObjetivoFloracion.toString()) : undefined,
    };

    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Error al guardar');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" data-testid="cultivo-form-unified">
      {error && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* SECCIÓN 1: DATOS PRINCIPALES */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2 mb-4">
          <span className="text-xl">📝</span> Información General
        </h3>

        <div className="grid gap-6">
          <div className="grid gap-2">
            <label htmlFor="nombre" className="text-sm font-semibold text-gray-700">Nombre del Cultivo *</label>
            <input
              id="nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
              placeholder="Ej: Tomates Cherry, Indoor #1..."
              required
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="genetica" className="text-sm font-semibold text-gray-700">Genética / Variedad</label>
            <input
              id="genetica"
              value={genetica}
              onChange={e => setGenetica(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
              placeholder="Ej: White Widow..."
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: DETALLES TÉCNICOS Y ESPACIO */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2 mb-4">
          <span className="text-xl">🏗️</span> Especificaciones & Espacio
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-gray-700">Sustrato</label>
            <input
              value={sustrato}
              onChange={e => setSustrato(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
              placeholder="Ej: Coco, Tierra..."
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-gray-700">Fecha de Inicio</label>
            <input
              type="date"
              value={fechaComienzo}
              onChange={e => setFechaComienzo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-gray-700">Metros Cuadrados (m²)</label>
            <input
              type="number" step="0.1"
              value={metrosCuadrados}
              onChange={e => setMetrosCuadrados(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="Ej: 1.2"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-gray-700">Número de Plantas</label>
            <input
              type="number"
              value={numeroplantas}
              onChange={e => setNumeroplantas(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="Ej: 4"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-gray-700">Litros por Maceta</label>
            <input
              type="number" step="0.5"
              value={litrosMaceta}
              onChange={e => setLitrosMaceta(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="Ej: 11"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-gray-700">Potencia Lámparas (W)</label>
            <input
              type="number"
              value={potenciaLamparas}
              onChange={e => setPotenciaLamparas(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3"
              placeholder="Ej: 400"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: INTELIGENCIA ARTIFICIAL & PARÁMETROS */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-green-800 flex items-center justify-between border-b border-green-200 pb-2 mb-4">
          <span className="flex items-center gap-2"><span className="text-xl">🤖</span> Configuración IA</span>
          <span className="text-xs font-normal bg-green-200 text-green-800 px-2 py-1 rounded-full">Recomendaciones Automáticas</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* pH & EC */}
          <div className="space-y-4">
            <div className="bg-white/60 p-4 rounded-lg border border-green-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">pH Objetivo</label>
                <button type="button" onClick={handleConsultarPH} disabled={cargandoPH} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition">
                  {cargandoPH ? '...' : 'Consultar IA'}
                </button>
              </div>
              <input type="number" step="0.1" value={phObjetivo} onChange={e => setPhObjetivo(e.target.value)} className="w-full p-2 border rounded-md" placeholder="6.2" />
            </div>

            <div className="bg-white/60 p-4 rounded-lg border border-green-100">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-gray-700">EC Objetivo</label>
                <button type="button" onClick={handleConsultarEC} disabled={cargandoEC} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition">
                  {cargandoEC ? '...' : 'Consultar IA'}
                </button>
              </div>
              <input type="number" step="0.1" value={ecObjetivo} onChange={e => setEcObjetivo(e.target.value)} className="w-full p-2 border rounded-md" placeholder="1.2" />
            </div>
          </div>

          {/* Clima Vegetación */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-green-800 uppercase tracking-wider">🌱 Vegetación</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Temp (°C)</label>
                <div className="relative">
                  <input type="number" step="0.1" value={tempObjetivoVegetacion} onChange={e => setTempObjetivoVegetacion(e.target.value)} className="w-full p-2 border rounded-md" />
                  <button type="button" onClick={() => wrapConsulta(setTempObjetivoVegetacion, setCargandoTempVegetacion, consultarRecomendacionTemperatura, 'vegetacion')} className="absolute right-1 top-1 text-[10px] bg-gray-200 hover:bg-gray-300 px-1 rounded">IA</button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Humedad (%)</label>
                <div className="relative">
                  <input type="number" step="1" value={humedadObjetivoVegetacion} onChange={e => setHumedadObjetivoVegetacion(e.target.value)} className="w-full p-2 border rounded-md" />
                  <button type="button" onClick={() => wrapConsulta(setHumedadObjetivoVegetacion, setCargandoHumedadVegetacion, consultarRecomendacionHumedad, 'vegetacion')} className="absolute right-1 top-1 text-[10px] bg-gray-200 hover:bg-gray-300 px-1 rounded">IA</button>
                </div>
              </div>
            </div>
          </div>

          {/* Clima Floración (Full width on mobile, col 2 on desk) */}
          <div className="space-y-4 md:col-start-2">
            <h4 className="text-sm font-bold text-green-800 uppercase tracking-wider">🌸 Floración</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Temp (°C)</label>
                <div className="relative">
                  <input type="number" step="0.1" value={tempObjetivoFloracion} onChange={e => setTempObjetivoFloracion(e.target.value)} className="w-full p-2 border rounded-md" />
                  <button type="button" onClick={() => wrapConsulta(setTempObjetivoFloracion, setCargandoTempFloracion, consultarRecomendacionTemperatura, 'floracion')} className="absolute right-1 top-1 text-[10px] bg-gray-200 hover:bg-gray-300 px-1 rounded">IA</button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Humedad (%)</label>
                <div className="relative">
                  <input type="number" step="1" value={humedadObjetivoFloracion} onChange={e => setHumedadObjetivoFloracion(e.target.value)} className="w-full p-2 border rounded-md" />
                  <button type="button" onClick={() => wrapConsulta(setHumedadObjetivoFloracion, setCargandoHumedadFloracion, consultarRecomendacionHumedad, 'floracion')} className="absolute right-1 top-1 text-[10px] bg-gray-200 hover:bg-gray-300 px-1 rounded">IA</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: NOTAS Y ESTADO */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-gray-700">Notas Adicionales</label>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 p-3"
            placeholder="Observaciones..."
          />
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="activo"
            checked={activo}
            onChange={e => setActivo(e.target.checked)}
            className="h-5 w-5 text-green-600 rounded"
          />
          <label htmlFor="activo" className="font-medium text-gray-700 cursor-pointer">
            Cultivo Activo
          </label>
        </div>
      </div>

      {/* ACCIONES */}
      <div className="flex gap-4 pt-4 sticky bottom-0 bg-white/95 backdrop-blur-sm p-4 border-t border-gray-100 -mx-4 -mb-4 rounded-b-xl z-10">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={disabled}
          className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-green-200"
        >
          {submitLabel}
        </button>
      </div>

    </form>
  );
}
