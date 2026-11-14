'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { enviarMensajeIA, procesarImagenes } from '@/lib/services/chat';
import { useCultivos } from '@/lib/hooks/useCultivos';
import type { ContextoCultivo, ImagenMensaje } from '@/types/chat';

type EtapaCultivo = 'esquejes' | 'vegetacion' | 'floracion_temprana' | 'floracion_tardia';

const RANGOS_ETAPA: Record<
  EtapaCultivo,
  { nombre: string; vpdMin: number; vpdMax: number; tempIdeal: [number, number]; hrIdeal: [number, number] }
> = {
  esquejes: {
    nombre: '🌱 Esquejes / Plántulas',
    vpdMin: 0.4,
    vpdMax: 0.8,
    tempIdeal: [22, 26],
    hrIdeal: [70, 80],
  },
  vegetacion: {
    nombre: '🌿 Vegetación Vigorosa',
    vpdMin: 0.8,
    vpdMax: 1.2,
    tempIdeal: [22, 28],
    hrIdeal: [55, 70],
  },
  floracion_temprana: {
    nombre: '🌸 Floración Temprana (Sem 1-4)',
    vpdMin: 1.0,
    vpdMax: 1.4,
    tempIdeal: [20, 26],
    hrIdeal: [45, 55],
  },
  floracion_tardia: {
    nombre: '💎 Floración Tardía / Engorde (Sem 5+)',
    vpdMin: 1.2,
    vpdMax: 1.6,
    tempIdeal: [18, 24],
    hrIdeal: [35, 45],
  },
};

export default function SimuladorPage() {
  const { cultivos, update } = useCultivos();
  const [activeTab, setActiveTab] = useState<'ambiente' | 'doctor'>('doctor');

  // Estados para el Simulador de Ambiente
  const [etapa, setEtapa] = useState<EtapaCultivo>('floracion_temprana');
  const [temp, setTemp] = useState(24);
  const [humidity, setHumidity] = useState(50);
  const [leafOffset, setLeafOffset] = useState(-1.5);
  const [cultivoSeleccionadoId, setCultivoSeleccionadoId] = useState<string>('');
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Estados para Doctor IA
  const [imagenSeleccionada, setImagenSeleccionada] = useState<ImagenMensaje | null>(null);
  const [sintomas, setSintomas] = useState('');
  const [analizando, setAnalizando] = useState(false);
  const [diagnostico, setDiagnostico] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cálculo agronómico real en tiempo real (Ecuación de Tetens para SVP y VPD)
  const simulacion = useMemo(() => {
    const tempHoja = temp + leafOffset;
    const svpAire = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const svpHoja = 0.61078 * Math.exp((17.27 * tempHoja) / (tempHoja + 237.3));
    const avpAire = svpAire * (humidity / 100);
    const vpd = Math.max(0.05, Number((svpHoja - avpAire).toFixed(2)));

    const configEtapa = RANGOS_ETAPA[etapa];

    // Estado VPD respecto a la etapa
    let estadoVpd: 'optimo' | 'bajo' | 'alto' = 'optimo';
    if (vpd < configEtapa.vpdMin) estadoVpd = 'bajo';
    else if (vpd > configEtapa.vpdMax) estadoVpd = 'alto';

    // Riesgo de Plagas (Araña roja / Trips aumentan con calor > 26°C y humedad baja < 45%)
    let riesgoPlagas = 15;
    if (temp > 26) riesgoPlagas += (temp - 26) * 8;
    if (humidity < 45) riesgoPlagas += (45 - humidity) * 1.4;
    if (vpd > 1.6) riesgoPlagas += 15;
    riesgoPlagas = Math.min(98, Math.max(5, Math.round(riesgoPlagas)));

    // Riesgo de Hongos (Botrytis / Oídio aumentan con humedad alta y VPD bajo, crítico en floración)
    let riesgoHongos = 10;
    const umbralHumedad = etapa.startsWith('floracion') ? 50 : 68;
    if (humidity > umbralHumedad) {
      riesgoHongos += (humidity - umbralHumedad) * (etapa === 'floracion_tardia' ? 3.2 : 2.1);
    }
    if (vpd < 0.7) {
      riesgoHongos += Math.round((0.7 - vpd) * 55);
    }
    riesgoHongos = Math.min(98, Math.max(5, Math.round(riesgoHongos)));

    // Recomendaciones dinámicas accionables
    const consejos: string[] = [];
    if (estadoVpd === 'optimo') {
      consejos.push(
        `VPD en zona ideal (${vpd} kPa) para ${configEtapa.nombre}. La apertura estomática y absorción de calcio/magnesio están en su punto máximo.`
      );
    } else if (estadoVpd === 'bajo') {
      consejos.push(
        `VPD demasiado bajo (${vpd} kPa < ${configEtapa.vpdMin} kPa). La planta transpira lento y absorbe pocos nutrientes: reduce la humedad relativa o sube 1-2°C la temperatura.`
      );
    } else {
      consejos.push(
        `VPD elevado (${vpd} kPa > ${configEtapa.vpdMax} kPa). Estrés evaporativo: los estomas pueden cerrarse. Sube la humedad relativa o reduce la temperatura del canopy.`
      );
    }

    if (riesgoHongos >= 50) {
      consejos.push(
        '⚠️ Alerta de Botrytis/Oídio: incrementa la ventilación intracanopia e instala deshumidificación inmediatamente.'
      );
    }
    if (riesgoPlagas >= 50) {
      consejos.push(
        '🕷️ Ambiente propicio para Araña Roja y Trips (cálido y seco). Revisa el envés de las hojas y aplica preventivo biológico.'
      );
    }

    return {
      vpd,
      tempHoja: tempHoja.toFixed(1),
      estadoVpd,
      riesgoPlagas,
      riesgoHongos,
      configEtapa,
      consejos,
    };
  }, [temp, humidity, leafOffset, etapa]);

  const handleGuardarEnCultivo = async () => {
    if (!cultivoSeleccionadoId) return;
    const esFlora = etapa.startsWith('floracion');
    await update(cultivoSeleccionadoId, {
      ...(esFlora
        ? { tempObjetivoFloracion: temp, humedadObjetivoFloracion: humidity }
        : { tempObjetivoVegetacion: temp, humedadObjetivoVegetacion: humidity }),
    });
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 3000);
  };

  // Manejo de subida de imagen para Doctor IA
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      setError(null);
      const procesadas = await procesarImagenes(files);
      if (procesadas.length > 0) {
        setImagenSeleccionada(procesadas[0]);
      }
    } catch (err) {
      console.error('Error procesando imagen:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar la imagen');
    }
  };

  // Enviar consulta al Doctor IA
  const handleDiagnosticar = async () => {
    if (!imagenSeleccionada && !sintomas.trim()) {
      setError('Por favor sube una foto o describe los síntomas.');
      return;
    }

    setAnalizando(true);
    setError(null);
    setDiagnostico(null);

    try {
      const dummyContext: ContextoCultivo = {
        id: 'diagnostic-session',
        nombre: 'Consulta Doctor IA',
        genetica: 'No especificada',
        sustrato: 'General',
        fechaComienzo: new Date().toISOString(),
        activo: true,
        notas: 'Sesión de diagnóstico rápido en el laboratorio.',
      };

      const prompt = `ACTÚA COMO UN EXPERTO AGRÓNOMO ("DOCTOR CULTIVO").
      Analiza la imagen adjunta (si la hay) y los siguientes síntomas descritos por el usuario: "${sintomas}".
      
      Por favor proporciona un diagnóstico estructurado que incluya:
      1. **Posible Problema**: (Deficiencia, Plaga, Hongo, Estrés ambiental, etc.) y nivel de certeza.
      2. **Causa Probable**: Por qué está pasando esto.
      3. **Solución Recomendada**: Pasos concretos para corregirlo (orgánico y mineral si aplica).
      4. **Prevención**: Cómo evitar que vuelva a pasar.
      
      Sé claro, directo y empático.`;

      const respuesta = await enviarMensajeIA(
        prompt,
        dummyContext,
        imagenSeleccionada ? [imagenSeleccionada] : [],
        []
      );

      setDiagnostico(respuesta);
    } catch (err) {
      console.error('Error en diagnóstico:', err);
      setError(err instanceof Error ? err.message : 'Error al conectar con el Doctor IA');
    } finally {
      setAnalizando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/laboratorio"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
            >
              ← Volver
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Simulador VPD & Doctor IA</h1>
              <p className="text-slate-600 text-sm">
                Cálculo agronómico de VPD en tiempo real y diagnóstico clínico asistido por IA
              </p>
            </div>
          </div>

          {/* Selector de Herramienta */}
          <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs inline-flex">
            <button
              onClick={() => setActiveTab('doctor')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'doctor'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🩺</span> Doctor IA (Diagnóstico)
            </button>
            <button
              onClick={() => setActiveTab('ambiente')}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'ambiente'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🌡️</span> Calculadora & Simulador VPD
            </button>
          </div>
        </div>

        {/* CONTENIDO: DOCTOR IA */}
        {activeTab === 'doctor' && (
          <div className="grid lg:grid-cols-2 gap-8 animate-fadeIn">
            {/* Panel Izquierdo: Input */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>📸</span> Subir Evidencia y Síntomas
              </h3>

              {/* Zona de Carga de Imagen */}
              <div
                onClick={() => document.getElementById('doctor-upload')?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  imagenSeleccionada
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'
                }`}
              >
                <input
                  id="doctor-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                />

                {imagenSeleccionada ? (
                  <div className="relative">
                    <Image
                      src={imagenSeleccionada.url}
                      alt="Planta a diagnosticar"
                      width={400}
                      height={300}
                      className="max-h-64 mx-auto rounded-lg shadow-md object-contain"
                      unoptimized
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagenSeleccionada(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-sm"
                      title="Eliminar imagen"
                    >
                      ✕
                    </button>
                    <p className="mt-2 text-sm text-emerald-700 font-medium">{imagenSeleccionada.name}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                      📷
                    </div>
                    <div>
                      <p className="text-slate-900 font-medium">Haz clic para subir una foto de tu planta</p>
                      <p className="text-slate-500 text-sm">Soporta JPG, PNG, WebP (Máx 10MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Descripción de Síntomas */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Describe los síntomas o tu duda:
                </label>
                <textarea
                  value={sintomas}
                  onChange={(e) => setSintomas(e.target.value)}
                  placeholder="Ej: Las hojas inferiores se están poniendo amarillas con manchas marrones desde hace 3 días. Riego con pH 6.2 y EC 1.4..."
                  rows={4}
                  className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all resize-none text-slate-700"
                />
              </div>

              {/* Chips rápidos de consulta */}
              <div className="flex flex-wrap gap-2">
                {[
                  'Hojas bajas amarillas en semana 3 de flora',
                  'Puntas quemadas en hojas nuevas Superiores',
                  'Manchas color óxido en hojas medias',
                  'Hojas en forma de garra hacia abajo',
                ].map((ejemplo) => (
                  <button
                    key={ejemplo}
                    type="button"
                    onClick={() => setSintomas(ejemplo)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-xs font-medium transition-colors"
                  >
                    + {ejemplo}
                  </button>
                ))}
              </div>

              {/* Mensajes de Error */}
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2 border border-red-200">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Botón de Acción */}
              <button
                onClick={handleDiagnosticar}
                disabled={analizando || (!imagenSeleccionada && !sintomas.trim())}
                className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-3 ${
                  analizando || (!imagenSeleccionada && !sintomas.trim())
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/30'
                }`}
              >
                {analizando ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Analizando cultivo...
                  </>
                ) : (
                  <>
                    <span>🔍</span> Realizar Diagnóstico Ahora
                  </>
                )}
              </button>
            </div>

            {/* Panel Derecho: Resultados */}
            <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col min-h-[500px]">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
                <span>📋</span> Informe Clínico del Doctor IA
              </h3>

              {diagnostico ? (
                <div className="prose prose-invert max-w-none flex-grow overflow-y-auto space-y-4">
                  <div className="whitespace-pre-wrap leading-relaxed text-slate-200 text-sm sm:text-base">
                    {diagnostico}
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 p-8">
                  {analizando ? (
                    <div className="space-y-4">
                      <div className="text-6xl animate-bounce">🤖</div>
                      <p className="text-lg text-emerald-400 font-medium">Examinando patrones foliares...</p>
                      <p className="text-sm text-slate-600">
                        Comparando con base de datos de patologías, carencias y excesos nutricionales.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-md">
                      <div className="text-6xl opacity-20">🌿</div>
                      <p className="text-lg font-medium text-slate-400">Esperando datos del paciente</p>
                      <p className="text-sm text-slate-500">
                        Sube una foto clara de la hoja afectada o selecciona uno de los síntomas rápidos para recibir un tratamiento paso a paso.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {diagnostico && (
                <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
                  <span>Diagnóstico generado por CanopIA Agronomic Engine</span>
                  <button
                    onClick={() => setDiagnostico(null)}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    Nueva consulta
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTENIDO: SIMULADOR DE AMBIENTE Y VPD EN TIEMPO REAL */}
        {activeTab === 'ambiente' && (
          <div className="grid lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Controles Interactivos */}
            <div className="lg:col-span-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Parámetros de Sala en Tiempo Real</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Desliza los controles para calcular el Déficit de Presión de Vapor (VPD) y los riesgos biológicos.
                </p>
              </div>

              {/* Selector de Etapa Fenológica */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  1. Etapa Fenológica del Cultivo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(RANGOS_ETAPA) as EtapaCultivo[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEtapa(key)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        etapa === key
                          ? 'bg-teal-50 border-teal-500 text-teal-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div>{RANGOS_ETAPA[key].nombre}</div>
                      <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                        Meta VPD: {RANGOS_ETAPA[key].vpdMin} – {RANGOS_ETAPA[key].vpdMax} kPa
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Temperatura */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between mb-2">
                  <label className="font-bold text-slate-700 text-sm">🌡️ Temperatura Ambiente</label>
                  <span className="text-emerald-600 font-extrabold text-lg">{temp} °C</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="38"
                  step="0.5"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>15°C (Frío)</span>
                  <span>Ideal: {simulacion.configEtapa.tempIdeal[0]}–{simulacion.configEtapa.tempIdeal[1]}°C</span>
                  <span>38°C (Calor)</span>
                </div>
              </div>

              {/* Slider Humedad */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between mb-2">
                  <label className="font-bold text-slate-700 text-sm">💧 Humedad Relativa (HR)</label>
                  <span className="text-teal-600 font-extrabold text-lg">{humidity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="90"
                  step="1"
                  value={humidity}
                  onChange={(e) => setHumidity(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>20% (Seco)</span>
                  <span>Ideal: {simulacion.configEtapa.hrIdeal[0]}–{simulacion.configEtapa.hrIdeal[1]}%</span>
                  <span>90% (Saturado)</span>
                </div>
              </div>

              {/* Offset Temperatura de Hoja */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between mb-2">
                  <label className="font-bold text-slate-700 text-sm">🍃 Diferencial Temp. de Hoja (LED/HPS)</label>
                  <span className="text-slate-700 font-bold text-sm">
                    {leafOffset > 0 ? `+${leafOffset}` : leafOffset} °C (Hoja: {simulacion.tempHoja}°C)
                  </span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="2"
                  step="0.5"
                  value={leafOffset}
                  onChange={(e) => setLeafOffset(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>-3°C (LED eficiente)</span>
                  <span>-1.5°C (Estándar)</span>
                  <span>+2°C (HPS cercano)</span>
                </div>
              </div>

              {/* Guardar en un Cultivo Real */}
              {cultivos.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Aplicar estos objetivos a una sala activa:
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={cultivoSeleccionadoId}
                      onChange={(e) => setCultivoSeleccionadoId(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50"
                    >
                      <option value="">Seleccionar cultivo...</option>
                      {cultivos.map((c) => (
                        <option key={c.id} value={c.id}>
                          🌿 {c.nombre}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!cultivoSeleccionadoId}
                      onClick={handleGuardarEnCultivo}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors disabled:opacity-40"
                    >
                      {guardadoExitoso ? '✓ Guardado' : 'Guardar Meta'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Resultados Dinámicos en Tiempo Real */}
            <div className="lg:col-span-6 bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                      Telemetría Simulada
                    </span>
                    <h3 className="text-xl font-bold mt-0.5">Diagnóstico Ambiental VPD</h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      simulacion.estadoVpd === 'optimo'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : simulacion.estadoVpd === 'bajo'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {simulacion.estadoVpd === 'optimo'
                      ? '✓ Rango Óptimo'
                      : simulacion.estadoVpd === 'bajo'
                        ? '↓ VPD Bajo (Húmedo)'
                        : '↑ VPD Alto (Seco)'}
                  </span>
                </div>

                {/* VPD Gauge Principal */}
                <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 mb-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-slate-400 text-sm font-medium">VPD (Déficit de Presión de Vapor)</span>
                    <span className="text-xs text-slate-400">
                      Meta: {simulacion.configEtapa.vpdMin} – {simulacion.configEtapa.vpdMax} kPa
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span
                      className={`text-4xl font-extrabold ${
                        simulacion.estadoVpd === 'optimo'
                          ? 'text-emerald-400'
                          : simulacion.estadoVpd === 'bajo'
                            ? 'text-sky-400'
                            : 'text-amber-400'
                      }`}
                    >
                      {simulacion.vpd} kPa
                    </span>
                    <span className="text-xs text-slate-400">
                      {simulacion.estadoVpd === 'optimo'
                        ? 'Transpiración y fotosíntesis maximizadas'
                        : simulacion.estadoVpd === 'bajo'
                          ? 'Transpiración lenta · Peligro de condensación'
                          : 'Exceso de transpiración · Posible bloqueo cálcico'}
                    </span>
                  </div>

                  {/* Barra visual VPD (0.2 a 2.2 kPa) */}
                  <div className="mt-4 relative h-3 rounded-full bg-gradient-to-r from-sky-500 via-emerald-500 to-rose-500 overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-md transition-all duration-200"
                      style={{
                        left: `${Math.min(96, Math.max(2, ((simulacion.vpd - 0.2) / 2.0) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0.4 kPa (Clones)</span>
                    <span>1.0 kPa (Vege)</span>
                    <span>1.4 kPa (Flora)</span>
                    <span>2.0+ kPa (Estrés)</span>
                  </div>
                </div>

                {/* Barras de Riesgo Biológico */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/70">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300 text-xs font-bold">🕷️ Riesgo de Plagas (Araña/Trips)</span>
                      <span
                        className={`text-sm font-extrabold ${
                          simulacion.riesgoPlagas >= 60
                            ? 'text-rose-400'
                            : simulacion.riesgoPlagas >= 35
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                        }`}
                      >
                        {simulacion.riesgoPlagas}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          simulacion.riesgoPlagas >= 60
                            ? 'bg-rose-500'
                            : simulacion.riesgoPlagas >= 35
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${simulacion.riesgoPlagas}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/70">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300 text-xs font-bold">🍄 Riesgo de Hongos (Botrytis/Oídio)</span>
                      <span
                        className={`text-sm font-extrabold ${
                          simulacion.riesgoHongos >= 60
                            ? 'text-rose-400'
                            : simulacion.riesgoHongos >= 35
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                        }`}
                      >
                        {simulacion.riesgoHongos}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          simulacion.riesgoHongos >= 60
                            ? 'bg-rose-500'
                            : simulacion.riesgoHongos >= 35
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${simulacion.riesgoHongos}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recomendaciones Agronómicas Dinámicas */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Acciones Recomendadas
                  </h4>
                  {simulacion.consejos.map((consejo, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm text-slate-200 leading-relaxed"
                    >
                      {consejo}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Fórmula Tetens SVP · Precisión Agronómica</span>
                <button
                  type="button"
                  onClick={() => {
                    const idealT = Math.round(
                      (simulacion.configEtapa.tempIdeal[0] + simulacion.configEtapa.tempIdeal[1]) / 2
                    );
                    const idealH = Math.round(
                      (simulacion.configEtapa.hrIdeal[0] + simulacion.configEtapa.hrIdeal[1]) / 2
                    );
                    setTemp(idealT);
                    setHumidity(idealH);
                  }}
                  className="text-teal-400 hover:underline font-bold"
                >
                  ⚡ Ajustar a Valores Ideales de Etapa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
