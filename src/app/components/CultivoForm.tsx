/**
 * Formulario para creación y edición de cultivos
 * Componente reutilizable que maneja tanto la creación como la edición de cultivos
 * Conectado a la Base de Conocimiento Agronómica (0 tokens, respuesta instantánea y 100% consistente)
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Cultivo, CultivoCreacion } from '@/types/cultivo';
import {
  prepararContextoCultivo,
  consultarRecomendacionPH,
  consultarRecomendacionEC,
  consultarRecomendacionTemperatura,
  consultarRecomendacionHumedad,
  consultarTodosLosObjetivosKB,
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
  submitLabel = 'Guardar Cultivo',
}: Props) {
  // Estado Principal
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [genetica, setGenetica] = useState(initial?.genetica ?? '');
  const [activo, setActivo] = useState<boolean>(initial?.activo ?? true);

  // Detalles del Espacio y Fechas de Fases
  const [sustrato, setSustrato] = useState(initial?.sustrato ?? '');
  const [metrosCuadrados, setMetrosCuadrados] = useState<number | string>(initial?.metrosCuadrados ?? '');
  const [fechaComienzo, setFechaComienzo] = useState(initial?.fechaComienzo ?? '');
  const [fechaInicioFloracion, setFechaInicioFloracion] = useState(initial?.fechaInicioFloracion ?? '');

  // Especificaciones Técnicas
  const [numeroplantas, setNumeroplantas] = useState<number | string>(initial?.numeroplantas ?? '');
  const [litrosMaceta, setLitrosMaceta] = useState<number | string>(initial?.litrosMaceta ?? '');
  const [potenciaLamparas, setPotenciaLamparas] = useState<number | string>(initial?.potenciaLamparas ?? '');

  // IA y Parámetros
  const [phObjetivo, setPhObjetivo] = useState<number | string>(initial?.phObjetivo ?? '');
  const [ecObjetivo, setEcObjetivo] = useState<number | string>(initial?.ecObjetivo ?? '');

  // Condiciones Ambientales
  const [tempObjetivoVegetacion, setTempObjetivoVegetacion] = useState<number | string>(
    initial?.tempObjetivoVegetacion ?? ''
  );
  const [tempObjetivoFloracion, setTempObjetivoFloracion] = useState<number | string>(
    initial?.tempObjetivoFloracion ?? ''
  );
  const [humedadObjetivoVegetacion, setHumedadObjetivoVegetacion] = useState<number | string>(
    initial?.humedadObjetivoVegetacion ?? ''
  );
  const [humedadObjetivoFloracion, setHumedadObjetivoFloracion] = useState<number | string>(
    initial?.humedadObjetivoFloracion ?? ''
  );

  // Notas
  const [notas, setNotas] = useState(initial?.notas ?? '');

  // Estados de carga e información de la Base de Conocimiento
  const [cargandoPH, setCargandoPH] = useState(false);
  const [cargandoEC, setCargandoEC] = useState(false);
  const [cargandoTempVegetacion, setCargandoTempVegetacion] = useState(false);
  const [cargandoTempFloracion, setCargandoTempFloracion] = useState(false);
  const [cargandoHumedadVegetacion, setCargandoHumedadVegetacion] = useState(false);
  const [cargandoHumedadFloracion, setCargandoHumedadFloracion] = useState(false);
  const [protocoloAplicadoMsg, setProtocoloAplicadoMsg] = useState<string | null>(null);

  // Validación
  const [error, setError] = useState<string | null>(null);
  const disabled = useMemo(() => nombre.trim().length === 0, [nombre]);

  useEffect(() => {
    setError(null);
  }, [nombre, fechaComienzo, fechaInicioFloracion]);

  // Sincronizar si cambia el cultivo inicial en modo edición
  useEffect(() => {
    if (initial) {
      setNombre(initial.nombre ?? '');
      setGenetica(initial.genetica ?? '');
      setActivo(initial.activo ?? true);
      setSustrato(initial.sustrato ?? '');
      setMetrosCuadrados(initial.metrosCuadrados ?? '');
      setFechaComienzo(initial.fechaComienzo ?? '');
      setFechaInicioFloracion(initial.fechaInicioFloracion ?? '');
      setNumeroplantas(initial.numeroplantas ?? '');
      setLitrosMaceta(initial.litrosMaceta ?? '');
      setPotenciaLamparas(initial.potenciaLamparas ?? '');
      setPhObjetivo(initial.phObjetivo ?? '');
      setEcObjetivo(initial.ecObjetivo ?? '');
      setTempObjetivoVegetacion(initial.tempObjetivoVegetacion ?? '');
      setTempObjetivoFloracion(initial.tempObjetivoFloracion ?? '');
      setHumedadObjetivoVegetacion(initial.humedadObjetivoVegetacion ?? '');
      setHumedadObjetivoFloracion(initial.humedadObjetivoFloracion ?? '');
      setNotas(initial.notas ?? '');
    }
  }, [initial]);

  const crearContextoCultivo = useMemo((): ContextoCultivo => {
    const cultivoTemporal: Cultivo = {
      id: initial?.id || 'temp',
      nombre: nombre || 'Cultivo temporal',
      sustrato: sustrato || undefined,
      metrosCuadrados: metrosCuadrados ? parseFloat(metrosCuadrados.toString()) : undefined,
      fechaComienzo: fechaComienzo || undefined,
      fechaInicioFloracion: fechaInicioFloracion || undefined,
      numeroplantas: numeroplantas ? parseInt(numeroplantas.toString()) : undefined,
      litrosMaceta: litrosMaceta ? parseFloat(litrosMaceta.toString()) : undefined,
      potenciaLamparas: potenciaLamparas ? parseFloat(potenciaLamparas.toString()) : undefined,
      genetica: genetica || undefined,
      activo: activo,
      notas: notas || undefined,
      galeria: initial?.galeria || [],
      fechaCreacion: initial?.fechaCreacion,
      fechaActualizacion: initial?.fechaActualizacion,
      phObjetivo: phObjetivo ? parseFloat(phObjetivo.toString()) : undefined,
      ecObjetivo: ecObjetivo ? parseFloat(ecObjetivo.toString()) : undefined,
      tempObjetivoVegetacion: tempObjetivoVegetacion
        ? parseFloat(tempObjetivoVegetacion.toString())
        : undefined,
      tempObjetivoFloracion: tempObjetivoFloracion
        ? parseFloat(tempObjetivoFloracion.toString())
        : undefined,
      humedadObjetivoVegetacion: humedadObjetivoVegetacion
        ? parseFloat(humedadObjetivoVegetacion.toString())
        : undefined,
      humedadObjetivoFloracion: humedadObjetivoFloracion
        ? parseFloat(humedadObjetivoFloracion.toString())
        : undefined,
    };
    return prepararContextoCultivo(cultivoTemporal);
  }, [
    nombre,
    sustrato,
    metrosCuadrados,
    fechaComienzo,
    fechaInicioFloracion,
    numeroplantas,
    litrosMaceta,
    potenciaLamparas,
    genetica,
    activo,
    notas,
    phObjetivo,
    ecObjetivo,
    tempObjetivoVegetacion,
    tempObjetivoFloracion,
    humedadObjetivoVegetacion,
    humedadObjetivoFloracion,
    initial,
  ]);

  // Diagnóstico en tiempo real desde la Base de Conocimiento (0 tokens)
  const diagnosticoKB = useMemo(
    () => consultarTodosLosObjetivosKB(crearContextoCultivo),
    [crearContextoCultivo]
  );

  const handleAutocompletarTodoKB = () => {
    setPhObjetivo(diagnosticoKB.phObjetivo.toString());
    setEcObjetivo(diagnosticoKB.ecObjetivo.toString());
    setTempObjetivoVegetacion(diagnosticoKB.tempObjetivoVegetacion.toString());
    setHumedadObjetivoVegetacion(diagnosticoKB.humedadObjetivoVegetacion.toString());
    setTempObjetivoFloracion(diagnosticoKB.tempObjetivoFloracion.toString());
    setHumedadObjetivoFloracion(diagnosticoKB.humedadObjetivoFloracion.toString());
    setProtocoloAplicadoMsg(
      `✓ Aplicado ${diagnosticoKB.codigoProtocolo} (${diagnosticoKB.sustratoDetectado.nombre}) · 0 tokens consumidos`
    );
  };

  const handleConsultarPH = async () => {
    setCargandoPH(true);
    try {
      const recomendacion = await consultarRecomendacionPH(crearContextoCultivo);
      if (recomendacion !== null) {
        setPhObjetivo(recomendacion.toString());
        setProtocoloAplicadoMsg(
          `✓ pH ${recomendacion} asignado desde ${diagnosticoKB.codigoProtocolo} (${diagnosticoKB.sustratoDetectado.nombre})`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoPH(false);
    }
  };

  const handleConsultarEC = async () => {
    setCargandoEC(true);
    try {
      const recomendacion = await consultarRecomendacionEC(crearContextoCultivo);
      if (recomendacion !== null) {
        setEcObjetivo(recomendacion.toString());
        setProtocoloAplicadoMsg(
          `✓ EC ${recomendacion} mS asignada desde ${diagnosticoKB.codigoProtocolo} (${diagnosticoKB.sustratoDetectado.nombre})`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoEC(false);
    }
  };

  const wrapConsulta = async (
    setter: (val: string) => void,
    loader: (val: boolean) => void,
    fetcher: (ctx: ContextoCultivo, fase: 'vegetacion' | 'floracion') => Promise<number | null>,
    fase: 'vegetacion' | 'floracion'
  ) => {
    loader(true);
    try {
      const res = await fetcher(crearContextoCultivo, fase);
      if (res !== null) {
        setter(res.toString());
        setProtocoloAplicadoMsg(
          `✓ Parámetro climático actualizado según ${diagnosticoKB.codigoProtocolo} (0 tokens)`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      loader(false);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) {
      setError('El nombre del cultivo es obligatorio');
      return;
    }

    if (fechaComienzo && fechaInicioFloracion && fechaInicioFloracion < fechaComienzo) {
      setError(
        'La fecha de inicio de floración debe ser igual o posterior a la fecha de inicio del cultivo'
      );
      return;
    }

    const payload: CultivoCreacion = {
      nombre: nombre.trim(),
      sustrato: sustrato || undefined,
      metrosCuadrados: metrosCuadrados ? parseFloat(metrosCuadrados.toString()) : undefined,
      fechaComienzo: fechaComienzo || undefined,
      fechaInicioFloracion: fechaInicioFloracion || '',
      numeroplantas: numeroplantas ? parseInt(numeroplantas.toString()) : undefined,
      litrosMaceta: litrosMaceta ? parseFloat(litrosMaceta.toString()) : undefined,
      potenciaLamparas: potenciaLamparas ? parseFloat(potenciaLamparas.toString()) : undefined,
      genetica: genetica || undefined,
      notas: notas || undefined,
      activo,
      phObjetivo: phObjetivo ? parseFloat(phObjetivo.toString()) : undefined,
      ecObjetivo: ecObjetivo ? parseFloat(ecObjetivo.toString()) : undefined,
      tempObjetivoVegetacion: tempObjetivoVegetacion
        ? parseFloat(tempObjetivoVegetacion.toString())
        : undefined,
      tempObjetivoFloracion: tempObjetivoFloracion
        ? parseFloat(tempObjetivoFloracion.toString())
        : undefined,
      humedadObjetivoVegetacion: humedadObjetivoVegetacion
        ? parseFloat(humedadObjetivoVegetacion.toString())
        : undefined,
      humedadObjetivoFloracion: humedadObjetivoFloracion
        ? parseFloat(humedadObjetivoFloracion.toString())
        : undefined,
    };

    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Error al guardar el cultivo'
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
      data-testid="cultivo-form-unified"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-purple-500" />

      <div className="p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-1.5">
              🌱 Configuración de Sala
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              {initial?.id ? `Editar Cultivo: ${initial.nombre}` : 'Nuevo Cultivo'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Define los parámetros técnicos, fechas de vegetación/floración y objetivos climáticos.
            </p>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
            >
              ✕ Cerrar
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-sm text-rose-700 font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* SECCIÓN 1: DATOS PRINCIPALES */}
        <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200/80 space-y-4">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span>📝</span> Información General
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="grid gap-1.5">
              <label htmlFor="nombre" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Nombre del Cultivo *
              </label>
              <input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                placeholder="Ej: Sala A, Lomas #1, Indoor Principal..."
                required
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="genetica" className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Genética / Variedad
              </label>
              <input
                id="genetica"
                value={genetica}
                onChange={(e) => setGenetica(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                placeholder="Ej: 24K Gold, White Widow, OG Kush..."
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: CRONOGRAMA DE FASES (VEGETACIÓN Y FLORACIÓN) */}
        <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span>📅</span> Control de Fases y Fechas
            </h4>
            <span className="text-xs font-semibold text-slate-500">
              {fechaInicioFloracion ? '🌸 En fase de Floración' : '🌱 En fase de Vegetación'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="grid gap-1.5">
              <label
                htmlFor="fechaComienzo"
                className="text-xs font-bold text-slate-700 uppercase tracking-wide"
              >
                🌱 Fecha de Inicio del Cultivo (Vegetación)
              </label>
              <input
                id="fechaComienzo"
                type="date"
                value={fechaComienzo}
                onChange={(e) => setFechaComienzo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              />
              <span className="text-[11px] text-slate-500">
                Fecha en que inició el ciclo o trasplante inicial.
              </span>
            </div>

            <div className="grid gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="fechaInicioFloracion"
                  className="text-xs font-bold text-purple-800 uppercase tracking-wide"
                >
                  🌸 Fecha de Inicio de Floración
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFechaInicioFloracion(new Date().toISOString().split('T')[0])}
                    className="px-2 py-0.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[11px] font-bold transition-colors"
                  >
                    Hoy
                  </button>
                  {fechaInicioFloracion && (
                    <button
                      type="button"
                      onClick={() => setFechaInicioFloracion('')}
                      className="px-2 py-0.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold transition-colors"
                      title="Quitar fecha de floración y volver a vegetación"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
              <input
                id="fechaInicioFloracion"
                type="date"
                value={fechaInicioFloracion}
                min={fechaComienzo || undefined}
                onChange={(e) => setFechaInicioFloracion(e.target.value)}
                data-testid="cultivo-input-fecha-floracion"
                className="w-full rounded-xl border border-purple-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
              <span className="text-[11px] text-slate-500">
                Déjalo vacío si el cultivo sigue en vegetación, o selecciona la fecha de paso a 12/12.
              </span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: DETALLES TÉCNICOS Y ESPACIO */}
        <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200/80 space-y-4">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span>🏗️</span> Especificaciones Técnicas & Espacio
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Sustrato
              </label>
              <input
                value={sustrato}
                onChange={(e) => setSustrato(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                placeholder="Ej: Coco+Perlita, Suelo Vivo, Tierra..."
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Área de Cultivo (m²)
              </label>
              <input
                type="number"
                step="0.1"
                value={metrosCuadrados}
                onChange={(e) => setMetrosCuadrados(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                placeholder="Ej: 2.4"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Número de Plantas
              </label>
              <input
                type="number"
                value={numeroplantas}
                onChange={(e) => setNumeroplantas(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                placeholder="Ej: 12"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Litros por Maceta (L)
              </label>
              <input
                type="number"
                step="0.5"
                value={litrosMaceta}
                onChange={(e) => setLitrosMaceta(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                placeholder="Ej: 7"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Potencia Lámparas (W)
              </label>
              <input
                type="number"
                value={potenciaLamparas}
                onChange={(e) => setPotenciaLamparas(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                placeholder="Ej: 1600"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: BASE DE CONOCIMIENTO AGRONÓMICA & PARÁMETROS ASISTIDOS POR IA */}
        <div className="bg-emerald-50/50 p-5 sm:p-6 rounded-2xl border border-emerald-200/70 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/60 pb-3">
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-emerald-950 flex items-center gap-2">
                <span>🤖</span> Objetivos Nutricionales & Clima (Asistido por IA)
              </h4>
              <p className="text-xs text-emerald-800/80 mt-0.5">
                {diagnosticoKB.resumenExplicativo}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                📚 {diagnosticoKB.codigoProtocolo} · 0 Tokens
              </span>
              <button
                type="button"
                onClick={handleAutocompletarTodoKB}
                data-testid="cultivo-autocompletar-kb-boton"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                ✨ Autocompletar Todo con IA
              </button>
            </div>
          </div>

          {protocoloAplicadoMsg && (
            <div className="px-3.5 py-2 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between">
              <span>{protocoloAplicadoMsg}</span>
              <button
                type="button"
                onClick={() => setProtocoloAplicadoMsg(null)}
                className="text-emerald-700 hover:text-emerald-950 ml-2"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* pH & EC */}
            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-3">
              <h5 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                💧 Nutrición ({diagnosticoKB.sustratoDetectado.nombre.split('/')[0].trim()})
              </h5>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">pH Objetivo</label>
                  <button
                    type="button"
                    onClick={handleConsultarPH}
                    disabled={cargandoPH}
                    className="text-[11px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md hover:bg-emerald-500 transition cursor-pointer"
                  >
                    {cargandoPH ? '...' : `✨ IA (${diagnosticoKB.phObjetivo})`}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={phObjetivo}
                  onChange={(e) => setPhObjetivo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder={diagnosticoKB.phObjetivo.toString()}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">
                    EC Objetivo (ppm/mS)
                  </label>
                  <button
                    type="button"
                    onClick={handleConsultarEC}
                    disabled={cargandoEC}
                    className="text-[11px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md hover:bg-emerald-500 transition cursor-pointer"
                  >
                    {cargandoEC ? '...' : `✨ IA (${diagnosticoKB.ecObjetivo})`}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={ecObjetivo}
                  onChange={(e) => setEcObjetivo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder={diagnosticoKB.ecObjetivo.toString()}
                />
              </div>
            </div>

            {/* Clima Vegetación */}
            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-3">
              <h5 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                🌱 Clima Vegetación
              </h5>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">Temperatura (°C)</label>
                  <button
                    type="button"
                    onClick={() =>
                      wrapConsulta(
                        setTempObjetivoVegetacion,
                        setCargandoTempVegetacion,
                        consultarRecomendacionTemperatura,
                        'vegetacion'
                      )
                    }
                    disabled={cargandoTempVegetacion}
                    className="text-[11px] font-bold bg-slate-100 hover:bg-emerald-100 text-slate-700 px-2 py-0.5 rounded-md transition cursor-pointer"
                  >
                    {cargandoTempVegetacion ? '...' : `✨ IA (${diagnosticoKB.tempObjetivoVegetacion}°)`}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={tempObjetivoVegetacion}
                  onChange={(e) => setTempObjetivoVegetacion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder={diagnosticoKB.tempObjetivoVegetacion.toString()}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">Humedad (%)</label>
                  <button
                    type="button"
                    onClick={() =>
                      wrapConsulta(
                        setHumedadObjetivoVegetacion,
                        setCargandoHumedadVegetacion,
                        consultarRecomendacionHumedad,
                        'vegetacion'
                      )
                    }
                    disabled={cargandoHumedadVegetacion}
                    className="text-[11px] font-bold bg-slate-100 hover:bg-emerald-100 text-slate-700 px-2 py-0.5 rounded-md transition cursor-pointer"
                  >
                    {cargandoHumedadVegetacion
                      ? '...'
                      : `✨ IA (${diagnosticoKB.humedadObjetivoVegetacion}%)`}
                  </button>
                </div>
                <input
                  type="number"
                  step="1"
                  value={humedadObjetivoVegetacion}
                  onChange={(e) => setHumedadObjetivoVegetacion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder={diagnosticoKB.humedadObjetivoVegetacion.toString()}
                />
              </div>
            </div>

            {/* Clima Floración */}
            <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs space-y-3">
              <h5 className="text-xs font-extrabold text-purple-800 uppercase tracking-wider">
                🌸 Clima Floración
              </h5>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">Temperatura (°C)</label>
                  <button
                    type="button"
                    onClick={() =>
                      wrapConsulta(
                        setTempObjetivoFloracion,
                        setCargandoTempFloracion,
                        consultarRecomendacionTemperatura,
                        'floracion'
                      )
                    }
                    disabled={cargandoTempFloracion}
                    className="text-[11px] font-bold bg-slate-100 hover:bg-purple-100 text-slate-700 px-2 py-0.5 rounded-md transition cursor-pointer"
                  >
                    {cargandoTempFloracion ? '...' : `✨ IA (${diagnosticoKB.tempObjetivoFloracion}°)`}
                  </button>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={tempObjetivoFloracion}
                  onChange={(e) => setTempObjetivoFloracion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder={diagnosticoKB.tempObjetivoFloracion.toString()}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">Humedad (%)</label>
                  <button
                    type="button"
                    onClick={() =>
                      wrapConsulta(
                        setHumedadObjetivoFloracion,
                        setCargandoHumedadFloracion,
                        consultarRecomendacionHumedad,
                        'floracion'
                      )
                    }
                    disabled={cargandoHumedadFloracion}
                    className="text-[11px] font-bold bg-slate-100 hover:bg-purple-100 text-slate-700 px-2 py-0.5 rounded-md transition cursor-pointer"
                  >
                    {cargandoHumedadFloracion
                      ? '...'
                      : `✨ IA (${diagnosticoKB.humedadObjetivoFloracion}%)`}
                  </button>
                </div>
                <input
                  type="number"
                  step="1"
                  value={humedadObjetivoFloracion}
                  onChange={(e) => setHumedadObjetivoFloracion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder={diagnosticoKB.humedadObjetivoFloracion.toString()}
                />
              </div>
            </div>
          </div>

          {diagnosticoKB.alertasAuditoria.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold">💡 Sugerencia de la Base de Conocimiento Agronómica:</div>
              {diagnosticoKB.alertasAuditoria.map((alerta, idx) => (
                <div key={idx}>• {alerta}</div>
              ))}
            </div>
          )}
        </div>

        {/* SECCIÓN 5: NOTAS Y ESTADO */}
        <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="grid gap-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Notas Operativas
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              placeholder="Observaciones sobre fenotipos, podas, riegos o configuración de sala..."
            />
          </div>

          <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="activo"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="activo" className="text-sm font-bold text-slate-800 cursor-pointer">
              Cultivo Activo (en seguimiento actual)
            </label>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={disabled}
            className="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-emerald-900/20"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
