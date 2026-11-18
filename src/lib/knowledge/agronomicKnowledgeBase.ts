/**
 * Base de Conocimiento Agronómica Estructurada — Protocolo Unificado:
 * 1. Dr. Bruce Bugbee — "The Science and Technology of Medical Cannabis Cultivation" (Utah State University)
 * 2. Athena Ag Official Best Practices — Athena Handbook (Pro Line, Blended Line & Crop Steering)
 *
 * ¿De dónde salen los datos y cómo editarlos?
 * - Archivo Fuente Editable en Código: `src/lib/knowledge/bruceBugbeeCorpus.json`
 * - Panel Interactivo en la Web App: `/laboratorio` ("Base de Conocimiento: Bruce Bugbee + Athena Ag")
 */

import bruceBugbeeCorpus from './bruceBugbeeCorpus.json';
import type { ContextoCultivo, AccionConocimiento } from '@/types/chat';

export type TipoSustratoKB = 'coco' | 'hidro' | 'living_soil' | 'tierra';
export type PerfilGeneticoKB = 'indica' | 'sativa' | 'auto' | 'hibrido';
export type SubEtapaFenologicaKB =
  | 'germinacion_esquejes'
  | 'vegetacion_temprana'
  | 'vegetacion_avanzada'
  | 'stretch_preflora'
  | 'floracion_temprana'
  | 'floracion_engorde'
  | 'lavado_maduracion';

export interface PerfilSustrato {
  id: TipoSustratoKB;
  nombre: string;
  descripcion: string;
  phPorEtapa: Record<SubEtapaFenologicaKB, number>;
  ecPorEtapa: Record<SubEtapaFenologicaKB, number>; // en mS/cm
  frecuenciaRiegoNota: string;
  factorRetencionAgua: number;
}

export interface ObjetivosCalculadosKB {
  phObjetivo: number;
  ecObjetivo: number;
  tempObjetivoVegetacion: number;
  humedadObjetivoVegetacion: number;
  tempObjetivoFloracion: number;
  humedadObjetivoFloracion: number;
  vpdObjetivoActual: number;
  aguaDiariaObjetivo: number;
  ppfdEstimadoSala?: number;
  dliEstimadoSala?: number;
  sustratoDetectado: PerfilSustrato;
  geneticaDetectada: PerfilGeneticoKB;
  subEtapaActual: SubEtapaFenologicaKB;
  nombreSubEtapa: string;
  codigoProtocolo: string;
  resumenExplicativo: string;
  alertasAuditoria: string[];
  accionesSugeridas: AccionConocimiento[];
}

export interface PatologiaKB {
  id: string;
  codigoKB: string;
  nombre: string;
  categoria: 'deficiencia' | 'exceso' | 'plaga' | 'hongo' | 'estres_ambiental';
  keywords: string[];
  sintomasVisuales: string;
  causaRaiz: string;
  tratamientoMineral: string[];
  tratamientoOrganico: string[];
  prevencion: string;
  accionesCorrectivas: AccionConocimiento[];
}

export interface ProtocoloEtapaKB {
  etapa: SubEtapaFenologicaKB;
  codigoKB: string;
  titulo: string;
  objetivoPrincipal: string;
  tipoSteeringAthena: 'Propagación' | 'Vegetativo (Bulking)' | 'Generativo (Stacking/Ripening)';
  vpdRango: [number, number];
  tempDiaNoche: { dia: [number, number]; noche: [number, number] };
  humedadRango: [number, number];
  fotoperiodo: string;
  ppfdRecomendado: string;
  dliRecomendado: string;
  reglasCriticas: string[];
  tareasEstandar: AccionConocimiento[];
}

const CUSTOM_KB_STORAGE_KEY = 'canopia_bruce_bugbee_custom_notes_v1';

/**
 * Permite al usuario leer sus apuntes/reglas adicionales guardados desde la UI
 */
export function obtenerApuntesPersonalizadosBugbee(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(CUSTOM_KB_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Permite al usuario guardar apuntes o reglas específicas de Bruce Bugbee / Athena desde la UI
 */
export function guardarApuntesPersonalizadosBugbee(apuntes: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_KB_STORAGE_KEY, apuntes);
  } catch (e) {
    console.error('Error al guardar apuntes en KB:', e);
  }
}

export const METADATA_CORPUS_BUGBEE = bruceBugbeeCorpus.metadata;
export const PRINCIPIOS_CARDINALES_BUGBEE: string[] = bruceBugbeeCorpus.principiosCardinalesBugbee;

/**
 * 1. TABLA MAESTRA DE SUSTRATOS CARGADA DESDE `bruceBugbeeCorpus.json`
 */
export const PERFILES_SUSTRATO_KB: Record<TipoSustratoKB, PerfilSustrato> =
  bruceBugbeeCorpus.perfilesSustrato as Record<TipoSustratoKB, PerfilSustrato>;

/**
 * 2. PROTOCOLOS FENOLÓGICOS UNIFICADOS: DR. BRUCE BUGBEE (USU) + ATHENA AG (CROP STEERING)
 */
export const PROTOCOLOS_ETAPA_KB: Record<SubEtapaFenologicaKB, ProtocoloEtapaKB> = {
  germinacion_esquejes: {
    etapa: 'germinacion_esquejes',
    codigoKB: 'USU-ATH-01-PROP',
    titulo: 'Propagación, Germinación y Enraizamiento (Días 1-10)',
    objetivoPrincipal:
      'Minimizar pérdida de vapor foliar (VPD 0.4-0.7 kPa) e inducir callo radicular con pre-soak equilibrado (Athena Cuts / Solución USU a pH 5.6-5.8).',
    tipoSteeringAthena: 'Propagación',
    vpdRango: [0.4, 0.7],
    tempDiaNoche: { dia: [25, 27], noche: [22, 24] },
    humedadRango: [75, 85],
    fotoperiodo: '18/6',
    ppfdRecomendado: '150 - 250 µmol·m⁻²·s⁻¹',
    dliRecomendado: '10 - 16 mol·m⁻²·d⁻¹',
    reglasCriticas: [
      'Bruce Bugbee (USU) + Athena: Nunca hidratar cubos/sustrato con agua pura. Pre-hidratar (pre-soak) con solución completa (Athena Core + Grow + Cleanse 2 mL/gal) a EC 1.0-1.2 mS y pH 5.6-5.8.',
      'Mantener temperatura de la zona radicular en 25°C para acelerar formación de raíces.',
      'Orden de mezcla Athena: 1º Athena Balance (Silicio) -> 2º Core -> 3º Grow -> 4º Cleanse.',
    ],
    tareasEstandar: [
      {
        id: 'act-usu-germ-01',
        codigoKB: 'USU-ATH-PROP-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Pre-Soak Athena + USU (pH 5.8 · EC 1.2 mS + Athena Cleanse)',
        descripcion:
          'Protocolo Bugbee + Athena: Hidratar medio con Athena Balance -> Core -> Grow + Cleanse (2 mL/gal) a pH 5.8 y EC 1.2 mS/cm antes de plantar.',
        categoriaTarea: 'fertilizacion',
        prioridad: 'alta',
        diasOffset: 0,
        duracionEstimada: 20,
      },
      {
        id: 'act-usu-germ-02',
        codigoKB: 'USU-ATH-PROP-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Calibración de PPFD (200 µmol/m²/s) y VPD de Propagación (0.5 kPa)',
        descripcion:
          'Protocolo Bugbee + Athena: Verificar temperatura de domo/sala en 25-26°C y HR en 75-80% hasta observar raíces blancas activas.',
        categoriaTarea: 'monitoreo',
        prioridad: 'media',
        diasOffset: 1,
        duracionEstimada: 15,
      },
    ],
  },
  vegetacion_temprana: {
    etapa: 'vegetacion_temprana',
    codigoKB: 'USU-ATH-02-VEG1',
    titulo: 'Vegetación Temprana y Establecimiento Radicular (Semanas 2-3)',
    objetivoPrincipal:
      'Colonizar el sustrato tras el trasplante y acelerar expansión foliar bajo LED (26-28°C) con Athena Pro Grow / Blended.',
    tipoSteeringAthena: 'Vegetativo (Bulking)',
    vpdRango: [0.8, 1.0],
    tempDiaNoche: { dia: [26, 28], noche: [21, 23] },
    humedadRango: [60, 70],
    fotoperiodo: '18/6',
    ppfdRecomendado: '400 - 600 µmol·m⁻²·s⁻¹',
    dliRecomendado: '26 - 38 mol·m⁻²·d⁻¹',
    reglasCriticas: [
      'Bruce Bugbee (USU): Bajo LED las hojas están ~1.5-2°C más frías que el aire por falta de radiación NIR; operar el aire en 26-28°C maximiza la tasa fotosintética.',
      'Athena Best Practice: Agregar siempre Athena Balance (Silicato de Potasio) PRIMERO al agua RO antes de Pro Core (60% del peso de Pro Grow) para aportar silicio y evitar precipitación.',
      'Athena IPM: Pulverizar preventivo foliar (Athena IPM + Mildew Control en rotación) con luces apagadas cada 5-7 días.',
    ],
    tareasEstandar: [
      {
        id: 'act-usu-veg1-01',
        codigoKB: 'USU-ATH-VEG1-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Preparación de Tanque Athena Vegetación (Balance -> Core -> Grow -> Cleanse)',
        descripcion:
          'Protocolo Athena + Bugbee: Mezclar 1º Balance, 2º Core, 3º Grow y 4º Cleanse (2-5 mL/gal) ajustando a pH 5.8 y EC objetivo de la etapa.',
        categoriaTarea: 'fertilizacion',
        prioridad: 'alta',
        diasOffset: 0,
        duracionEstimada: 25,
      },
      {
        id: 'act-usu-veg1-02',
        codigoKB: 'USU-ATH-VEG1-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Aplicación Preventiva Athena IPM (Con luces apagadas)',
        descripcion:
          'Protocolo Athena Handbook: Pulverizar envés y haz foliar con Athena IPM antes del ciclo nocturno para erradicar presión temprana de Trips y Ácaros.',
        categoriaTarea: 'mantenimiento',
        prioridad: 'alta',
        diasOffset: 2,
        duracionEstimada: 30,
      },
    ],
  },
  vegetacion_avanzada: {
    etapa: 'vegetacion_avanzada',
    codigoKB: 'USU-ATH-03-VEG2',
    titulo: 'Vegetación Avanzada y Direccionamiento Vegetativo (Semana 4+)',
    objetivoPrincipal:
      'Cerrar el 85% de la canopia (LAI óptimo USU) aplicando Crop Steering Vegetativo (Dryback 20-25% VWC) antes del paso a 12/12.',
    tipoSteeringAthena: 'Vegetativo (Bulking)',
    vpdRango: [0.9, 1.15],
    tempDiaNoche: { dia: [25, 27], noche: [20, 22] },
    humedadRango: [58, 65],
    fotoperiodo: '18/6',
    ppfdRecomendado: '550 - 700 µmol·m⁻²·s⁻¹',
    dliRecomendado: '35 - 45 mol·m⁻²·d⁻¹',
    reglasCriticas: [
      'Athena Crop Steering Vegetativo: Iniciar primer riego (P1) 1 a 1.5h después de encender las luces hasta lograr 15-20% de drenaje (runoff), manteniendo un Dryback nocturno moderado (20-25%).',
      'Bruce Bugbee (Pour-Through) + Athena Runoff: Verificar que el pH del drenaje se mantenga en 5.7-6.2 y que la EC de drenaje no supere en más de +0.5 mS la EC de entrada.',
      'Realizar poda de bajos (Lollipopping del tercio basal en sombra <50 µmol/m²/s) 4-5 días antes de cambiar a 12/12.',
    ],
    tareasEstandar: [
      {
        id: 'act-usu-veg2-01',
        codigoKB: 'USU-ATH-VEG2-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Auditoría de Runoff Athena + USU (pH y EC de Entrada vs. Drenaje)',
        descripcion:
          'Protocolo Athena & Bugbee: Medir EC y pH de salida tras el pulso P1; si la EC de sustrato está acumulada, dar pulso extra con Athena Cleanse (5 mL/gal) hasta 25% runoff.',
        categoriaTarea: 'riego',
        prioridad: 'alta',
        diasOffset: 0,
        duracionEstimada: 25,
      },
      {
        id: 'act-usu-veg2-02',
        codigoKB: 'USU-ATH-VEG2-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Limpieza Basal Pre-Floración y Nivelación de Canopia',
        descripcion:
          'Protocolo USU + Athena: Retirar brotes bajos sombreados para concentrar energía en los ápices principales antes del paso a 12/12.',
        categoriaTarea: 'poda',
        prioridad: 'media',
        diasOffset: 1,
        duracionEstimada: 40,
      },
    ],
  },
  stretch_preflora: {
    etapa: 'stretch_preflora',
    codigoKB: 'USU-ATH-04-GEN1',
    titulo: 'Semanas 1-3 de Floración: Direccionamiento Generativo (Stretch & Stacking)',
    objetivoPrincipal:
      'Controlar el estiramiento internodal e inducir máxima densidad de botones florales mediante Crop Steering Generativo (Athena) y compensación de DLI (Bugbee).',
    tipoSteeringAthena: 'Generativo (Stacking/Ripening)',
    vpdRango: [1.0, 1.3],
    tempDiaNoche: { dia: [25, 27], noche: [20, 22] },
    humedadRango: [52, 60],
    fotoperiodo: '12/12',
    ppfdRecomendado: '750 - 950 µmol·m⁻²·s⁻¹',
    dliRecomendado: '32 - 41 mol·m⁻²·d⁻¹',
    reglasCriticas: [
      'Athena Crop Steering Generativo (Sem 1-3): Cambiar a Pro Bloom + Pro Core desde el Día 1 de 12/12. Retrasar el primer riego (P1) a 2-3h tras encender luces y cortar riegos 3-4h antes del apagado para lograr un Dryback nocturno fuerte (40-50% VWC) y subir la EC de poro (3.5-5.5 mS). Esto frena el espigamiento y multiplica sitios florales.',
      'Bruce Bugbee (USU): Al bajar de 18h a 12h cae el DLI un 33%; subir el PPFD un 25-30% desde el Día 1 de 12/12 y verificar oscuridad nocturna absoluta (<0.01 µmol/m²/s).',
      'Athena IPM: Última aplicación foliar preventiva en Día 14 de Floración; en Día 21 realizar deshoje selectivo de hojas abanico que tapen botones medios.',
    ],
    tareasEstandar: [
      {
        id: 'act-usu-trans-01',
        codigoKB: 'USU-ATH-GEN-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Activar Crop Steering Generativo Athena (Dryback 40-50% + Cambio a Pro Bloom)',
        descripcion:
          'Protocolo Athena Handbook: Pasar a fórmula Pro Bloom + Core + Balance + Cleanse (pH 5.8-5.9) y espaciar ventana de riego para inducir estrés generativo controlado y compactar nudos.',
        categoriaTarea: 'riego',
        prioridad: 'urgente',
        diasOffset: 0,
        duracionEstimada: 30,
      },
      {
        id: 'act-usu-trans-02',
        codigoKB: 'USU-ATH-GEN-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Compensación de PPFD/DLI (USU) y Defoliación Selectiva Día 21',
        descripcion:
          'Protocolo Bugbee + Athena: Subir PPFD a 800-900 µmol/m²/s al pasar a 12/12 y despejar hojas que sombrean sitios florales internos.',
        categoriaTarea: 'poda',
        prioridad: 'alta',
        diasOffset: 2,
        duracionEstimada: 45,
      },
    ],
  },
  floracion_temprana: {
    etapa: 'floracion_temprana',
    codigoKB: 'USU-ATH-05-BULK1',
    titulo: 'Semanas 4-5 de Floración: Cambio a Direccionamiento Vegetativo (Bulking / Hinchazón)',
    objetivoPrincipal:
      'Maximizar hinchazón de cálices y asimilación fotosintética cambiando de riego Generativo a riego Vegetativo frecuente (Athena Bulking).',
    tipoSteeringAthena: 'Vegetativo (Bulking)',
    vpdRango: [1.1, 1.35],
    tempDiaNoche: { dia: [25, 27], noche: [19, 21] },
    humedadRango: [48, 55],
    fotoperiodo: '12/12',
    ppfdRecomendado: '850 - 1050 µmol·m⁻²·s⁻¹',
    dliRecomendado: '36 - 45 mol·m⁻²·d⁻¹',
    reglasCriticas: [
      'Athena Crop Steering Vegetativo (Bulking Sem 4-6): Una vez formados los botones florales, reducir el Dryback nocturno a 20-30% VWC e incrementar la frecuencia de pulsos (P1 + pulsos de mantenimiento P2 con 15-25% de runoff) para que la planta hinche las flores sin estrés hídrico.',
      'Bruce Bugbee (USU) + Athena: No abusar de PK boosters desbalanceados; mantener proporción equilibrada de Pro Core + Pro Bloom (o Blended + PK moderado) a pH 5.9.',
      'Mantener velocidad de viento intracanopia en 0.8-1.0 m/s para sostener intercambio de CO2 bajo alto PPFD.',
    ],
    tareasEstandar: [
      {
        id: 'act-usu-flo1-01',
        codigoKB: 'USU-ATH-BULK-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Transición a Riego Vegetativo de Engorde (Athena Bulking: Dryback 20-30%)',
        descripcion:
          'Protocolo Athena Handbook: Aumentar frecuencia de pulsos diurnos y volumen de drenaje (20% runoff) para estabilizar la EC del sustrato e impulsar el llenado celular.',
        categoriaTarea: 'riego',
        prioridad: 'alta',
        diasOffset: 0,
        duracionEstimada: 25,
      },
      {
        id: 'act-usu-flo1-02',
        codigoKB: 'USU-ATH-BULK-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Control de pH (5.9) y EC de Drenaje + Flujo de Aire Intracanopia (USU)',
        descripcion:
          'Protocolo Bugbee + Athena: Verificar que el drenaje no supere en más de +0.6 mS la entrada y asegurar turbulencia de aire uniforme.',
        categoriaTarea: 'monitoreo',
        prioridad: 'media',
        diasOffset: 2,
        duracionEstimada: 20,
      },
    ],
  },
  floracion_engorde: {
    etapa: 'floracion_engorde',
    codigoKB: 'USU-ATH-06-BULK2',
    titulo: 'Semanas 6-7 de Floración: Pico de Biomasa y Preparación para Athena Fade',
    objetivoPrincipal:
      'Consolidar densidad floral máxima previniendo Botrytis cinerea (HR <= 45-48%) y preparando el retorno a direccionamiento generativo.',
    tipoSteeringAthena: 'Vegetativo (Bulking)',
    vpdRango: [1.2, 1.45],
    tempDiaNoche: { dia: [22, 25], noche: [18, 20] },
    humedadRango: [42, 48],
    fotoperiodo: '12/12',
    ppfdRecomendado: '800 - 950 µmol·m⁻²·s⁻¹',
    dliRecomendado: '35 - 41 mol·m⁻²·d⁻¹',
    reglasCriticas: [
      'Bruce Bugbee (USU) + Athena: A medida que la planta madura en semana 6-7 disminuye su transpiración y consumo mineral; monitorear el drenaje a diario para que la EC de poro no se dispare y queme puntas.',
      'Control Fúngico Crítico: Mantener HR <= 45-48% (especialmente en el pico de humedad al apagarse las luces) para impedir Botrytis cinerea en colas densas.',
      'Al finalizar la semana 6 / iniciar semana 7, preparar el cambio de Pro Core a Athena Fade (0% Nitrógeno, manteniendo Calcio y microelementos).',
    ],
    tareasEstandar: [
      {
        id: 'act-usu-flo2-01',
        codigoKB: 'USU-ATH-BULK2-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Auditoría de Punto de Rocío Nocturno y Prevención de Botrytis (HR <= 45%)',
        descripcion:
          'Protocolo Bugbee + Athena: Asegurar deshumidificación continua en la transición día/noche y ventilación 24h entre colas principales.',
        categoriaTarea: 'monitoreo',
        prioridad: 'urgente',
        diasOffset: 0,
        duracionEstimada: 25,
      },
      {
        id: 'act-usu-flo2-02',
        codigoKB: 'USU-ATH-BULK2-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Ajuste de EC de Entrada y Limpieza de Líneas con Athena Cleanse',
        descripcion:
          'Protocolo Athena Handbook: Si la EC de drenaje sube por menor consumo en semana 7, reducir EC de entrada a 1.8-2.0 mS con Athena Cleanse (5 mL/gal).',
        categoriaTarea: 'fertilizacion',
        prioridad: 'alta',
        diasOffset: 1,
        duracionEstimada: 25,
      },
    ],
  },
  lavado_maduracion: {
    etapa: 'lavado_maduracion',
    codigoKB: 'USU-ATH-07-FADE',
    titulo: 'Semanas 8-9: Finalización con Athena Fade + Reducción Osmótica USU',
    objetivoPrincipal:
      'Eliminar el Nitrógeno en las últimas 2 semanas manteniendo Calcio/Micros (Athena Fade) para evitar podredumbre floral, y reducir EC + temperatura (20-22°C) en los últimos 5-7 días (Bugbee).',
    tipoSteeringAthena: 'Generativo (Stacking/Ripening)',
    vpdRango: [1.25, 1.55],
    tempDiaNoche: { dia: [20, 22], noche: [16, 18] },
    humedadRango: [40, 45],
    fotoperiodo: '12/12',
    ppfdRecomendado: '650 - 800 µmol·m⁻²·s⁻¹ (Atenuar 15-20%)',
    dliRecomendado: '28 - 34 mol·m⁻²·d⁻¹',
    reglasCriticas: [
      'Athena Best Practice (Athena Fade + Pro Bloom): En las últimas 2 semanas sustituir Pro Core por Athena Fade (aporta Calcio y microelementos con 0% Nitrógeno). Esto fuerza la senescencia limpia de clorofila sin provocar deficiencia de Calcio (que causa Botrytis).',
      'Bruce Bugbee (USU): En los últimos 5 a 7 días antes del corte, bajar la EC a 0.4-0.6 mS/cm (agua + Athena Cleanse 5-10 mL/gal a pH 5.8-6.0) y enfriar la sala a 20-22°C para preservar monoterpenos volátiles y estimular antocianinas.',
      'Retornar a Crop Steering Generativo (mayor Dryback) para acelerar maduración de tricomas.',
    ],
    tareasEstandar: [
      {
        id: 'act-usu-mat-01',
        codigoKB: 'USU-ATH-FADE-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Protocolo Final Athena Fade + Cleanse y Reducción Osmótica USU (pH 6.0)',
        descripcion:
          'Protocolo Athena + Bugbee: Aplicar Athena Fade + Pro Bloom (0% Nitrógeno) y en los últimos 5-7 días regar con agua + Athena Cleanse (5-10 mL/gal, EC 0.4-0.6 mS, pH 6.0).',
        categoriaTarea: 'riego',
        prioridad: 'alta',
        diasOffset: 0,
        duracionEstimada: 30,
      },
      {
        id: 'act-usu-mat-02',
        codigoKB: 'USU-ATH-FADE-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Enfriamiento de Sala (20-22°C / 42% HR) e Inspección de Tricomas en Cáliz',
        descripcion:
          'Protocolo Bugbee + Athena: Reducir temperatura y PPFD (-15%) para proteger terpenos y verificar punto de cosecha (80% tricomas lechosos / 15-20% ámbar).',
        categoriaTarea: 'cosecha',
        prioridad: 'urgente',
        diasOffset: 2,
        duracionEstimada: 20,
      },
    ],
  },
};

/**
 * 3. CATÁLOGO CLÍNICO DE PATOLOGÍAS Y FISIOPATÍAS (DR. BRUCE BUGBEE + ATHENA AG)
 */
export const PATOLOGIAS_KB: PatologiaKB[] = [
  {
    id: 'bloqueo_ph_hierro_micronutrientes',
    codigoKB: 'USU-ATH-PAT-PH',
    nombre: 'Bloqueo de Hierro/Micronutrientes (pH > 6.5) o Deficiencia de Calcio/Magnesio',
    categoria: 'deficiencia',
    keywords: [
      'manchas oxido',
      'óxido',
      'marrones',
      'clorosis intervenal',
      'calcio',
      'magnesio',
      'calmag',
      'nervaduras verdes',
      'hojas medias',
      'hierro',
      'amarillas arriba',
    ],
    sintomasVisuales:
      'Clorosis intervenal en hojas jóvenes superiores (Hierro/Manganeso) o manchas necróticas color óxido en hojas medias expuestas a alta radiación LED (Calcio/Magnesio).',
    causaRaiz:
      '1) Bruce Bugbee (USU): Cuando el pH supera 6.5 en la rizosfera, Fe, Mn, B, Cu y Zn precipitan. 2) Athena Handbook: Si se mezcla Pro Core directamente con Pro Grow/Bloom sin diluir o sin poner Athena Balance primero, el Calcio precipita como yeso insoluble (CaSO4) en el tanque y no llega a la planta.',
    tratamientoMineral: [
      'Protocolo Athena + USU: Verificar el orden de mezcla en el tanque (1º Athena Balance en agua RO -> 2º Pro Core al 60% del peso de la base -> 3º Pro Grow/Bloom -> 4º Cleanse) y ajustar el pH de entrada a 5.8.',
      'Si usas línea Blended en Coco bajo LED de alta potencia, suplementar con Athena CaMg (2.5 - 5 mL/gal) manteniendo pH 5.8 - 6.0.',
      'Asegurar VPD entre 0.9 y 1.2 kPa y flujo de aire de 0.5-1.0 m/s para activar el transporte xilemático de Calcio.',
    ],
    tratamientoOrganico: [
      'Enmendar sustrato con Yeso Agrícola (CaSO4, 1 g/L) y Sulfato de Magnesio (0.5 g/L), manteniendo el pH de riego por debajo de 6.3.',
    ],
    prevencion:
      'Respetar siempre el orden de mezcla de Athena (Balance primero) y mantener el pH del lixiviado entre 5.6 y 6.2.',
    accionesCorrectivas: [
      {
        id: 'act-usu-pat-fecalmag',
        codigoKB: 'USU-ATH-CORR-PH58',
        tipoAccion: 'crear_tarea',
        titulo: 'Corrección Athena + USU: Riego a pH 5.8 (Verificar Orden Balance -> Core)',
        descripcion:
          'Protocolo Bugbee + Athena: Preparar tanque nuevo respetando orden de mezcla (Balance 1º -> Core 2º), ajustar a pH 5.8 y regar con 20% de drenaje.',
        categoriaTarea: 'fertilizacion',
        prioridad: 'urgente',
        diasOffset: 0,
        duracionEstimada: 30,
      },
    ],
  },
  {
    id: 'deficiencia_nitrogeno_movil',
    codigoKB: 'USU-ATH-PAT-NITRO',
    nombre: 'Deficiencia de Nitrógeno / Subalimentación (EC de Sustrato Baja)',
    categoria: 'deficiencia',
    keywords: [
      'hojas bajas amarillas',
      'amarilleamiento inferior',
      'amarillas abajo',
      'nitrogeno',
      'palidas',
      'caida hojas bajas',
    ],
    sintomasVisuales:
      'Amarilleamiento uniforme en hojas viejas de la zona basal que progresa hacia arriba por removilización de Nitrógeno hacia los brotes nuevos.',
    causaRaiz:
      'EC de entrada o proporción de Athena Pro Core / Pro Grow insuficiente para el PPFD instalado en la sala, o corte prematuro de Pro Core antes de la semana 7 de floración.',
    tratamientoMineral: [
      'Protocolo Athena + Bugbee: Mantener Pro Core (60% en peso respecto a Pro Grow/Bloom) hasta el final de la semana 6 de floración antes de pasar a Athena Fade.',
      'Subir la EC de entrada al objetivo del protocolo (1.8 - 2.4 mS/cm en Athena Coco/Hidro o 1.5 - 1.8 mS/cm en Turba) con pH 5.8.',
    ],
    tratamientoOrganico: [
      'Aplicar aminoácidos libres o hidrolizado nitrogenado de rápida asimilación radicular.',
    ],
    prevencion:
      'No sustituir Pro Core por Athena Fade antes de las últimas 2-3 semanas del ciclo.',
    accionesCorrectivas: [
      {
        id: 'act-usu-pat-nitro',
        codigoKB: 'USU-ATH-CORR-CORE',
        tipoAccion: 'crear_tarea',
        titulo: 'Restablecer Proporción Athena Pro Core + Base y Subir EC Objetivo',
        descripcion:
          'Protocolo Athena + USU: Verificar relación exacta 0.6:1 de Pro Core respecto a Base y regar a pH 5.8 hasta alcanzar 15-20% de drenaje.',
        categoriaTarea: 'fertilizacion',
        prioridad: 'alta',
        diasOffset: 0,
        duracionEstimada: 25,
      },
    ],
  },
  {
    id: 'toxicidad_sales_fosforo_ec',
    codigoKB: 'USU-ATH-PAT-SALT',
    nombre: 'Acumulación de Sales en Sustrato / Tip Burn (EC de Drenaje Excesiva)',
    categoria: 'exceso',
    keywords: [
      'puntas quemadas',
      'garra',
      'hojas en garra',
      'verde muy oscuro',
      'sobrefertilizacion',
      'exceso',
      'bloqueo',
      'sales',
      'pk',
    ],
    sintomasVisuales:
      'Puntas de las hojas quemadas ("tip burn"), bordes curvados, hojas oscuras rígidas y caída del pH en el drenaje.',
    causaRaiz:
      'Athena Handbook + Bruce Bugbee: Falta de drenaje (runoff < 10%) o Drybacks excesivos durante la fase de engorde que concentran las sales en el poro del sustrato (EC de drenaje > 3.5 - 4.0 mS/cm) y acidifican la rizosfera.',
    tratamientoMineral: [
      'Protocolo de Reset Radicular Athena Cleanse: Realizar un riego de arrastre (Flush/Reset) con agua ajustada a pH 5.8-6.0 + Athena Cleanse a dosis alta (5 - 10 mL/gal) con 25-30% de drenaje para oxidar biofilm y disolver sales precipitadas.',
      'Reducir el Dryback nocturno (sumar un pulso P2 de mantenimiento) y reanudar alimentación al valor de EC objetivo.',
    ],
    tratamientoOrganico: [
      'Regar con agua declorada a pH 6.0 logrando 25% de drenaje para restaurar el equilibrio osmótico.',
    ],
    prevencion:
      'Asegurar siempre 15-25% de drenaje diario en los pulsos P1 y usar Athena Cleanse (2-5 mL/gal) en cada riego.',
    accionesCorrectivas: [
      {
        id: 'act-usu-pat-leach',
        codigoKB: 'USU-ATH-CORR-CLEANSE',
        tipoAccion: 'crear_tarea',
        titulo: 'Reset Radicular con Athena Cleanse (5-10 mL/gal · pH 5.8 · 30% Runoff)',
        descripcion:
          'Protocolo Athena Handbook: Realizar riego de limpieza con Athena Cleanse y medir EC/pH del drenaje (Pour-Through) hasta normalizar la zona radicular.',
        categoriaTarea: 'riego',
        prioridad: 'urgente',
        diasOffset: 0,
        duracionEstimada: 35,
      },
    ],
  },
  {
    id: 'plaga_arana_trips_usu',
    codigoKB: 'USU-ATH-PAT-IPM',
    nombre: 'Presión de Plagas (Araña Roja / Trips / Mosca del Sustrato)',
    categoria: 'plaga',
    keywords: [
      'puntitos blancos',
      'puntos blancos',
      'plateados',
      'telaraña',
      'araña roja',
      'trips',
      'plaga',
      'bichos',
      'enves',
      'acaros',
    ],
    sintomasVisuales:
      'Micropunteado clorótico o plateado en el haz de las hojas; presencia de ácaros o larvas de trips en el envés foliar.',
    causaRaiz:
      'Ambiente cálido y seco (VPD > 1.5 kPa), falta de silicio epidérmico y ausencia de rotación preventiva MIP.',
    tratamientoMineral: [
      'Protocolo Athena IPM: En vegetación y hasta Día 14 de floración, pulverizar Athena IPM (60-90 mL/gal) en el envés y haz foliar con las luces APAGADAS cada 3 días durante 3 aplicaciones consecutivas para romper el ciclo de eclosión.',
      'Mantener aporte constante de Silicio soluble (Athena Balance en cada riego + Wollastonita USU en sustrato) para endurecer la pared celular epidérmica.',
    ],
    tratamientoOrganico: [
      'En floración avanzada (>Día 21): Prohibido pulverizar flores; liberar ácaros depredadores (Phytoseiulus persimilis / Amblyseius swirskii) y regar sustrato con Athena Cleanse para controlar larvas radiculares.',
    ],
    prevencion:
      'Pulverización semanal con Athena IPM en vegetación + Athena Balance en todos los riegos.',
    accionesCorrectivas: [
      {
        id: 'act-usu-pat-mip',
        codigoKB: 'USU-ATH-CORR-IPM',
        tipoAccion: 'crear_tarea',
        titulo: 'Protocolo de Choque Athena IPM (3 aplicaciones cada 72h con luces apagadas)',
        descripcion:
          'Protocolo Athena Handbook: Aplicar Athena IPM foliar (o biocontrol si supera semana 3 de flora) y reforzar Silicio soluble con Athena Balance.',
        categoriaTarea: 'mantenimiento',
        prioridad: 'urgente',
        diasOffset: 0,
        duracionEstimada: 40,
      },
    ],
  },
  {
    id: 'hongo_botrytis_oidio_usu',
    codigoKB: 'USU-ATH-PAT-FUNGI',
    nombre: 'Patógenos Fúngicos: Oídio (Powdery Mildew) o Botrytis cinerea',
    categoria: 'hongo',
    keywords: [
      'polvo blanco',
      'moho',
      'botrytis',
      'oidio',
      'podredumbre',
      'hongo',
      'cogollo marron',
      'ceniza',
    ],
    sintomasVisuales:
      'Manchas de polvo blanco superficial en hojas (Oídio) o necrosis gris/marrón dentro de las colas florales más compactas (Botrytis).',
    causaRaiz:
      'Picos de humedad nocturna (>55-60% HR al apagarse las luces), flujo de aire intracanopia insuficiente (<0.5 m/s), déficit de Silicio o deficiencia de Calcio al final de floración.',
    tratamientoMineral: [
      'Protocolo Athena Mildew Control + Bugbee: En vegetación/inicio de flora aplicar Athena Mildew Control con luces apagadas. Si hay Botrytis en flor avanzada, embolsar y amputar inmediatamente la cola afectada.',
      'En las últimas 2 semanas usar Athena Fade (que mantiene el suministro de Calcio con 0% Nitrógeno) en lugar de dejar la planta sin Calcio.',
      'Fijar HR nocturna en <= 45% y ventilación oscilante continua las 24h.',
    ],
    tratamientoOrganico: [
      'Aportar Silicio soluble (Wollastonita / Athena Balance) y aplicar Bacillus subtilis / Trichoderma en etapas tempranas.',
    ],
    prevencion:
      'Athena Balance en cada tanque + HR nocturna < 48% + flujo de aire > 0.8 m/s en canopia.',
    accionesCorrectivas: [
      {
        id: 'act-usu-pat-fungi',
        codigoKB: 'USU-ATH-CORR-FUNGI',
        tipoAccion: 'crear_tarea',
        titulo: 'Protocolo Antifúngico Athena + USU: Deshumidificación Nocturna (<45% HR) y Saneamiento',
        descripcion:
          'Protocolo Bugbee + Athena: Aislar tejido afectado, aplicar Athena Mildew Control (si está en vege/preflora) y asegurar HR <= 45% en el apagado de luces.',
        categoriaTarea: 'mantenimiento',
        prioridad: 'urgente',
        diasOffset: 0,
        duracionEstimada: 40,
      },
    ],
  },
];

/**
 * Detecta el tipo de sustrato normalizado a partir del texto ingresado por el usuario
 */
export function detectarTipoSustrato(sustratoRaw?: string): TipoSustratoKB {
  if (!sustratoRaw) return 'tierra';
  const s = sustratoRaw.toLowerCase();
  if (
    s.includes('hidro') ||
    s.includes('dwc') ||
    s.includes('rdwc') ||
    s.includes('nft') ||
    s.includes('lana') ||
    s.includes('rockwool') ||
    s.includes('aero')
  ) {
    return 'hidro';
  }
  if (s.includes('coco') || s.includes('vermiculita') || s.includes('usu') || s.includes('athena')) {
    return 'coco';
  }
  if (
    s.includes('vivo') ||
    s.includes('living') ||
    s.includes('organico') ||
    s.includes('orgánico') ||
    s.includes('super soil') ||
    s.includes('humus') ||
    s.includes('bokashi')
  ) {
    return 'living_soil';
  }
  return 'tierra';
}

/**
 * Detecta la dominancia o perfil genético a partir del nombre de la cepa
 */
export function detectarPerfilGenetico(geneticaRaw?: string): PerfilGeneticoKB {
  if (!geneticaRaw) return 'hibrido';
  const g = geneticaRaw.toLowerCase();
  if (g.includes('auto') || g.includes('fast') || g.includes('day-neutral')) return 'auto';
  if (
    g.includes('haze') ||
    g.includes('sativa') ||
    g.includes('amnesia') ||
    g.includes('jack') ||
    g.includes('sour') ||
    g.includes('tangie') ||
    g.includes('kali') ||
    g.includes('moby')
  ) {
    return 'sativa';
  }
  if (
    g.includes('kush') ||
    g.includes('indica') ||
    g.includes('northern') ||
    g.includes('afghan') ||
    g.includes('bubba') ||
    g.includes('critical') ||
    g.includes('24k') ||
    g.includes('widow')
  ) {
    return 'indica';
  }
  return 'hibrido';
}

/**
 * Determina la sub-etapa fenológica exacta en base a las fechas del cultivo
 */
export function determinarSubEtapa(contexto: Partial<ContextoCultivo>): {
  subEtapa: SubEtapaFenologicaKB;
  faseGeneral: 'vegetacion' | 'floracion';
  semanaFase: number;
  diasFase: number;
} {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (contexto.fechaInicioFloracion) {
    const inicioFlora = new Date(contexto.fechaInicioFloracion);
    inicioFlora.setHours(0, 0, 0, 0);
    if (!isNaN(inicioFlora.getTime()) && inicioFlora <= hoy) {
      const diasFlora = Math.max(
        1,
        Math.floor((hoy.getTime() - inicioFlora.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );
      const semanaFlora = Math.max(1, Math.ceil(diasFlora / 7));

      if (semanaFlora <= 3) {
        return {
          subEtapa: 'stretch_preflora',
          faseGeneral: 'floracion',
          semanaFase: semanaFlora,
          diasFase: diasFlora,
        };
      }
      if (semanaFlora <= 5) {
        return {
          subEtapa: 'floracion_temprana',
          faseGeneral: 'floracion',
          semanaFase: semanaFlora,
          diasFase: diasFlora,
        };
      }
      if (semanaFlora <= 7) {
        return {
          subEtapa: 'floracion_engorde',
          faseGeneral: 'floracion',
          semanaFase: semanaFlora,
          diasFase: diasFlora,
        };
      }
      return {
        subEtapa: 'lavado_maduracion',
        faseGeneral: 'floracion',
        semanaFase: semanaFlora,
        diasFase: diasFlora,
      };
    }
  }

  let diasVege = contexto.diasDesdeInicio ?? 14;
  if (contexto.fechaComienzo) {
    const inicioVege = new Date(contexto.fechaComienzo);
    inicioVege.setHours(0, 0, 0, 0);
    if (!isNaN(inicioVege.getTime())) {
      diasVege = Math.max(
        1,
        Math.floor((hoy.getTime() - inicioVege.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );
    }
  }
  const semanaVege = Math.max(1, Math.ceil(diasVege / 7));

  if (diasVege <= 10) {
    return {
      subEtapa: 'germinacion_esquejes',
      faseGeneral: 'vegetacion',
      semanaFase: semanaVege,
      diasFase: diasVege,
    };
  }
  if (diasVege <= 24) {
    return {
      subEtapa: 'vegetacion_temprana',
      faseGeneral: 'vegetacion',
      semanaFase: semanaVege,
      diasFase: diasVege,
    };
  }
  return {
    subEtapa: 'vegetacion_avanzada',
    faseGeneral: 'vegetacion',
    semanaFase: semanaVege,
    diasFase: diasVege,
  };
}

/**
 * MOTOR CIENTÍFICO DETERMINÍSTICO UNIFICADO: DR. BRUCE BUGBEE (USU) + ATHENA AG (0 TOKENS)
 */
export function calcularObjetivosAgronomicos(
  contexto: Partial<ContextoCultivo>
): ObjetivosCalculadosKB {
  const tipoSustrato = detectarTipoSustrato(contexto.sustrato);
  const perfilSustrato = PERFILES_SUSTRATO_KB[tipoSustrato];
  const genetica = detectarPerfilGenetico(contexto.genetica);
  const { subEtapa, faseGeneral, semanaFase } = determinarSubEtapa(contexto);
  const protocoloEtapa = PROTOCOLOS_ETAPA_KB[subEtapa];

  // 1. pH base según sustrato y protocolo Bugbee + Athena (5.8 - 6.0 ideal en coco/lana de roca)
  const phObjetivo = Number(perfilSustrato.phPorEtapa[subEtapa].toFixed(1));

  // 2. Cálculo de PPFD y DLI estimados según potencia LED instalada (Regla de conversión cuántica USU)
  const wattsM2 =
    contexto.wattsPorM2 ||
    (contexto.potenciaLamparas && contexto.metrosCuadrados
      ? contexto.potenciaLamparas / contexto.metrosCuadrados
      : undefined);

  const ppfdEstimadoSala = wattsM2 ? Math.round(wattsM2 * 2.2) : undefined;
  const horasLuz = faseGeneral === 'floracion' ? 12 : 18;
  const dliEstimadoSala = ppfdEstimadoSala
    ? Number(((ppfdEstimadoSala * horasLuz * 3600) / 1_000_000).toFixed(1))
    : undefined;

  // 3. EC objetivo según curva Athena + Bruce Bugbee ajustada a PPFD y genética
  let ecBase = perfilSustrato.ecPorEtapa[subEtapa];

  if (genetica === 'auto' && subEtapa !== 'lavado_maduracion') {
    ecBase -= 0.3;
  } else if (genetica === 'sativa' && subEtapa !== 'lavado_maduracion') {
    ecBase -= 0.2;
  }

  if (wattsM2 && subEtapa !== 'lavado_maduracion') {
    if (wattsM2 >= 450) {
      ecBase += 0.2;
    } else if (wattsM2 < 250) {
      ecBase -= 0.2;
    }
  }

  const ecObjetivo = Number(Math.max(0.4, Math.min(2.8, ecBase)).toFixed(1));

  // 4. Clima Vegetación y Floración según física foliar bajo LED (Bruce Bugbee + Athena Handbook)
  const tempObjetivoVegetacion = wattsM2 && wattsM2 >= 350 ? 27 : 26;
  const humedadObjetivoVegetacion = 65;

  const tempObjetivoFloracion =
    subEtapa === 'floracion_engorde' || subEtapa === 'lavado_maduracion' ? 22 : 25;
  const humedadObjetivoFloracion =
    subEtapa === 'floracion_engorde' || subEtapa === 'lavado_maduracion' ? 45 : 52;

  const vpdObjetivoActual = Number(
    ((protocoloEtapa.vpdRango[0] + protocoloEtapa.vpdRango[1]) / 2).toFixed(2)
  );

  // 5. Volumen de agua diario estimado (incluyendo 15-25% de fracción de lixiviado Athena/USU)
  const numPlantas = contexto.numeroplantas || 6;
  const litrosMaceta = contexto.litrosMaceta || 10;
  const factorFase = faseGeneral === 'floracion' ? 1.15 : 0.85;
  const aguaDiariaObjetivo = Number(
    Math.max(
      1,
      numPlantas * litrosMaceta * perfilSustrato.factorRetencionAgua * factorFase
    ).toFixed(1)
  );

  // 6. Auditoría científica según Bruce Bugbee (USU) y Athena Handbook
  const alertasAuditoria: string[] = [];
  if (contexto.phObjetivo && contexto.phObjetivo > 6.4) {
    alertasAuditoria.push(
      `Alerta Bugbee & Athena: Tu pH objetivo (${contexto.phObjetivo}) supera 6.4, lo que insolubiliza Hierro (Fe), Manganeso (Mn) y Zinc. Usa Athena Balance primero y ajusta el pH a ${phObjetivo}.`
    );
  } else if (contexto.phObjetivo && Math.abs(contexto.phObjetivo - phObjetivo) >= 0.35) {
    alertasAuditoria.push(
      `Criterio USU + Athena: El pH configurado (${contexto.phObjetivo}) difiere del óptimo (${phObjetivo}) para ${perfilSustrato.nombre}.`
    );
  }

  if (
    contexto.ecObjetivo &&
    contexto.ecObjetivo <= 10 &&
    Math.abs(contexto.ecObjetivo - ecObjetivo) >= 0.5
  ) {
    alertasAuditoria.push(
      `Ajuste Nutricional Athena + USU: Para ${protocoloEtapa.titulo} (${protocoloEtapa.tipoSteeringAthena}), la EC recomendada es ${ecObjetivo} mS/cm (actual: ${contexto.ecObjetivo} mS/cm).`
    );
  }

  if (ppfdEstimadoSala && ppfdEstimadoSala > 950) {
    alertasAuditoria.push(
      `Criterio Fotobiológico Bugbee + Athena: Con ${Math.round(wattsM2 || 0)} W/m² (~${ppfdEstimadoSala} µmol/m²/s PPFD, DLI ~${dliEstimadoSala}), asegúrate de aportar CO2 (1000-1200 ppm) y flujo de aire >0.8 m/s o atenúa paneles al 80%.`
    );
  }

  const resumenExplicativo = `Protocolo Bugbee + Athena (${protocoloEtapa.codigoKB} · Steering ${protocoloEtapa.tipoSteeringAthena} · Sem ${semanaFase} ${faseGeneral === 'floracion' ? 'Flora' : 'Vege'
    }): pH ${phObjetivo} · EC ${ecObjetivo} mS · VPD ${vpdObjetivoActual} kPa.`;

  const accionActualizarParametros: AccionConocimiento = {
    id: `kb-sync-params-${subEtapa}`,
    codigoKB: protocoloEtapa.codigoKB,
    tipoAccion: 'actualizar_parametros',
    titulo: `Aplicar Metas Bugbee + Athena (${protocoloEtapa.codigoKB}: pH ${phObjetivo} · EC ${ecObjetivo} mS)`,
    descripcion: `Sincroniza la sala con el protocolo Dr. Bruce Bugbee (USU) + Athena Ag (${protocoloEtapa.tipoSteeringAthena}): pH ${phObjetivo}, EC ${ecObjetivo} mS/cm, Vege ${tempObjetivoVegetacion}°C/${humedadObjetivoVegetacion}%, Flora ${tempObjetivoFloracion}°C/${humedadObjetivoFloracion}%.`,
    parametrosObjetivo: {
      phObjetivo,
      ecObjetivo,
      tempObjetivoVegetacion,
      humedadObjetivoVegetacion,
      tempObjetivoFloracion,
      humedadObjetivoFloracion,
      aguaDiariaObjetivo,
    },
  };

  return {
    phObjetivo,
    ecObjetivo,
    tempObjetivoVegetacion,
    humedadObjetivoVegetacion,
    tempObjetivoFloracion,
    humedadObjetivoFloracion,
    vpdObjetivoActual,
    aguaDiariaObjetivo,
    ppfdEstimadoSala,
    dliEstimadoSala,
    sustratoDetectado: perfilSustrato,
    geneticaDetectada: genetica,
    subEtapaActual: subEtapa,
    nombreSubEtapa: protocoloEtapa.titulo,
    codigoProtocolo: protocoloEtapa.codigoKB,
    resumenExplicativo,
    alertasAuditoria,
    accionesSugeridas: [accionActualizarParametros, ...protocoloEtapa.tareasEstandar],
  };
}

/**
 * Busca patologías en la Base de Conocimiento que coincidan con el texto de consulta o síntomas
 */
export function buscarPatologiasKB(texto: string): PatologiaKB[] {
  if (!texto.trim()) return [];
  const norm = normalizarTextoConsulta(texto);

  const puntuadas = PATOLOGIAS_KB.map((pat) => {
    let score = 0;
    for (const kw of pat.keywords) {
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (norm.includes(kwNorm)) {
        score += 3;
      } else {
        const palabras = kwNorm.split(' ').filter((w) => w.length > 3);
        for (const p of palabras) {
          if (norm.includes(p)) score += 1;
        }
      }
    }
    return { pat, score };
  })
    .filter((item) => item.score >= 2)
    .sort((a, b) => b.score - a.score);

  return puntuadas.slice(0, 2).map((item) => item.pat);
}

export type IntencionConsultaKB =
  | 'parametros_nutricion_clima'
  | 'plan_tareas_acciones'
  | 'diagnostico_sintomas'
  | 'auditoria_general'
  | 'consulta_abierta';

export function detectarIntencionConsulta(
  mensaje: string,
  tieneImagenes: boolean
): IntencionConsultaKB {
  if (tieneImagenes) return 'diagnostico_sintomas';
  const m = mensaje
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    /\b(tarea|tareas|accion|acciones|planificar|planifica|calendario|checklist)\b/.test(m) ||
    m.includes('que hacer') ||
    m.includes('que le hago') ||
    m.includes('plan de acciones')
  ) {
    return 'plan_tareas_acciones';
  }

  const patologias = buscarPatologiasKB(mensaje);
  if (
    patologias.length > 0 ||
    m.includes('hoja') ||
    m.includes('mancha') ||
    m.includes('amarill') ||
    m.includes('plaga') ||
    m.includes('hongo') ||
    m.includes('carencia') ||
    m.includes('deficiencia') ||
    m.includes('quemad') ||
    m.includes('diagnostic')
  ) {
    return 'diagnostico_sintomas';
  }

  if (
    m.includes('ph') ||
    m.includes('ec') ||
    m.includes('temperatura') ||
    m.includes('humedad') ||
    m.includes('vpd') ||
    m.includes('ppfd') ||
    m.includes('dli') ||
    m.includes('bugbee') ||
    m.includes('athena') ||
    m.includes('mezcla') ||
    m.includes('cleanse') ||
    m.includes('fade') ||
    m.includes('balance') ||
    m.includes('riego') ||
    m.includes('litros') ||
    m.includes('agua') ||
    m.includes('parametro') ||
    m.includes('objetivo')
  ) {
    return 'parametros_nutricion_clima';
  }

  if (
    m.includes('audita') ||
    m.includes('como ves') ||
    m.includes('estado') ||
    m.includes('resumen') ||
    m.includes('recomendacion')
  ) {
    return 'auditoria_general';
  }

  return 'consulta_abierta';
}

/**
 * Calcula el VPD real (kPa) usando la ecuación de Tetens y el diferencial térmico foliar bajo LED (-1.5°C)
 */
function calcularVpdTetens(tempAire: number, hr: number, offsetHoja: number = -1.5): number {
  const tempHoja = tempAire + offsetHoja;
  const svpAire = 0.61078 * Math.exp((17.27 * tempAire) / (tempAire + 237.3));
  const svpHoja = 0.61078 * Math.exp((17.27 * tempHoja) / (tempHoja + 237.3));
  const avpAire = svpAire * (hr / 100);
  return Math.max(0.1, Number((svpHoja - avpAire).toFixed(2)));
}

/**
 * Extrae telemetría mencionada por el usuario en el mensaje actual y en el historial reciente
 * (evitando falsos positivos como el '2' en 'CO2' y soportando múltiples valores en una misma frase).
 */
export interface TelemetriaConversacion {
  temp?: number;
  hr?: number;
  co2?: number;
  ph?: number;
  ec?: number;
  mencionoClimaActual: boolean;
  mencionoNutricionActual: boolean;
}

export function extraerTelemetriaTexto(textoRaw: string): Partial<TelemetriaConversacion> {
  // Reemplazar "co2" por un token sin dígitos para que el "2" nunca se confunda con un valor numérico
  const t = textoRaw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/co2/g, 'dioxidocarbono');

  const res: Partial<TelemetriaConversacion> = {};

  // 1. CO2 (ej: "co2 1200ppm", "1200 ppm", "co2 en 1000")
  const matchCo2 =
    t.match(/dioxidocarbono\D{0,20}?(\d{3,4}(?:[.,]\d+)?)/) ||
    t.match(/(\d{3,4})\s*ppm/);
  if (matchCo2) {
    const val = parseFloat(matchCo2[1].replace(',', '.'));
    if (val >= 300 && val <= 2500) res.co2 = val;
  }

  // 2. Humedad (ej: "humedad esta en 75", "hr 60%", "75% de humedad")
  const matchHr =
    t.match(/(?:humedad|hr)\D{0,25}?(\d{2}(?:[.,]\d+)?)/) ||
    t.match(/(\d{2}(?:[.,]\d+)?)\s*%\s*(?:de\s*)?(?:humedad|hr)?/);
  if (matchHr) {
    const val = parseFloat(matchHr[1].replace(',', '.'));
    if (val >= 15 && val <= 99) res.hr = val;
  }

  // 3. Temperatura (ej: "temperatura esta en 28", "28 grados", "28°c")
  const matchTemp =
    t.match(/(?:temperatura|temp|calor|frio)\D{0,25}?(\d{2}(?:[.,]\d+)?)/) ||
    t.match(/(\d{2}(?:[.,]\d+)?)\s*(?:°\s*c?|grados)/);
  if (matchTemp) {
    const val = parseFloat(matchTemp[1].replace(',', '.'));
    if (val >= 10 && val <= 45) res.temp = val;
  }

  // 4. pH (ej: "ph en 6.2", "ph 5.8")
  const matchPh = t.match(/\bph\b\D{0,20}?(\d(?:[.,]\d+)?)/);
  if (matchPh) {
    const val = parseFloat(matchPh[1].replace(',', '.'));
    if (val >= 3.0 && val <= 9.5) res.ph = val;
  }

  // 5. EC (ej: "ec en 2.2", "ec 1.8")
  const matchEc = t.match(/\bec\b\D{0,20}?(\d(?:[.,]\d+)?)/);
  if (matchEc) {
    const val = parseFloat(matchEc[1].replace(',', '.'));
    if (val >= 0.1 && val <= 6.0) res.ec = val;
  }

  return res;
}

export function extraerTelemetriaConversacion(
  mensajeActual: string,
  historialReciente?: Array<{ tipo?: string; contenido?: string }>
): TelemetriaConversacion {
  const acumulada: TelemetriaConversacion = {
    mencionoClimaActual: false,
    mencionoNutricionActual: false,
  };

  if (historialReciente && historialReciente.length > 0) {
    for (const msg of historialReciente.slice(-6)) {
      if (msg.tipo === 'user' && msg.contenido) {
        const parcial = extraerTelemetriaTexto(msg.contenido);
        if (parcial.temp !== undefined) acumulada.temp = parcial.temp;
        if (parcial.hr !== undefined) acumulada.hr = parcial.hr;
        if (parcial.co2 !== undefined) acumulada.co2 = parcial.co2;
        if (parcial.ph !== undefined) acumulada.ph = parcial.ph;
        if (parcial.ec !== undefined) acumulada.ec = parcial.ec;
      }
    }
  }

  const actual = extraerTelemetriaTexto(mensajeActual);
  if (actual.temp !== undefined) acumulada.temp = actual.temp;
  if (actual.hr !== undefined) acumulada.hr = actual.hr;
  if (actual.co2 !== undefined) acumulada.co2 = actual.co2;
  if (actual.ph !== undefined) acumulada.ph = actual.ph;
  if (actual.ec !== undefined) acumulada.ec = actual.ec;

  acumulada.mencionoClimaActual =
    actual.temp !== undefined || actual.hr !== undefined || actual.co2 !== undefined;
  acumulada.mencionoNutricionActual = actual.ph !== undefined || actual.ec !== undefined;

  return acumulada;
}

/**
 * Construye una respuesta experta, conversacional y específica para la consulta del usuario
 * basada 100% en el Corpus Dr. Bruce Bugbee (USU) + Athena Ag y el contexto + historial real de la sala.
 */
/**
 * Normaliza texto en español tolerando errores ortográficos comunes de cultivadores
 */
function normalizarTextoConsulta(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\bcombiene\b/g, 'conviene')
    .replace(/\boideo\b/g, 'oidio')
    .replace(/\blolipop\b/g, 'lollipop')
    .replace(/\btransplan/g, 'trasplan')
    .replace(/\baranuela\b/g, 'arana')
    .replace(/\bbotrit/g, 'botryt')
    .replace(/\bhechar\b/g, 'echar');
}

function calcularDiasEnFloracion(fechaInicioFloracion?: string): number | undefined {
  if (!fechaInicioFloracion) return undefined;
  const inicio = new Date(fechaInicioFloracion).getTime();
  if (Number.isNaN(inicio)) return undefined;
  const diffDias = Math.floor((Date.now() - inicio) / (1000 * 60 * 60 * 24));
  return diffDias >= 0 ? diffDias : undefined;
}

interface RespuestaTemaAgronomico {
  respuesta: string;
  accionesSugeridas: AccionConocimiento[];
  resumenRAG: string;
}

function resolverTemaAgronomicoLocal(
  mNorm: string,
  contexto: ContextoCultivo,
  objetivos: ObjetivosCalculadosKB,
  protocolo: ProtocoloEtapaKB
): RespuestaTemaAgronomico | null {
  const diasFlora = calcularDiasEnFloracion(contexto.fechaInicioFloracion);
  const esAuto = objetivos.geneticaDetectada === 'auto';
  const subEtapa = objetivos.subEtapaActual;

  // 1. PODA / DEFOLIACIÓN / LOLLIPOPPING / APICAL / LST / SCROG
  if (
    /\b(poda|podar|pode|podo|defoli\w*|deshoj\w*|lollipop\w*|apical\w*|topping|fimming|fim|lst|scrog|entrenudo\w*|supercrop\w*|backbuild\w*|pinchar|despunt\w*)\b/.test(
      mNorm
    ) ||
    mNorm.includes('limpieza de bajos') ||
    mNorm.includes('sacar hojas') ||
    mNorm.includes('cortar hojas') ||
    mNorm.includes('puntas de los tallos') ||
    mNorm.includes('flor formada') ||
    mNorm.includes('malla')
  ) {
    // Sub-caso 1A: Pregunta específica sobre cortar PUNTAS de tallos con flor ya formada (apical en flora / backbuilding / supercropping)
    const preguntaPuntasFlor =
      (mNorm.includes('punta') || mNorm.includes('apical') || mNorm.includes('topping') || mNorm.includes('backbuild')) &&
      (mNorm.includes('flor') || mNorm.includes('tallo') || mNorm.includes('cogollo') || mNorm.includes('dia 14') || mNorm.includes('14'));

    if (preguntaPuntasFlor) {
      const lineasPuntas = [
        `🔬 **Cortar Puntas de Tallos con Flor Formada (Día 14 de Flora) — Análisis Técnico**`,
        ``,
        `- **Veredicto (Bruce Bugbee USU + Athena Ag):** **NO es recomendable cortar la punta apical de un tallo que ya formó flor en Día 14.** A diferencia de la vegetación (donde el *topping* divide la dominancia hormonal en 2 ramas nuevas), en Día 14 los meristemos ya están diferenciados a flor: cortar la punta **elimina tu futura cola principal**, reduce el rendimiento total y abre una herida en tejido floral propensa a *Botrytis*.`,
        `- **Por qué viste que algunos lo hacen en Día 14 (técnicas que suelen confundirse):**`,
        `  - **1. Supercropping (doblar SIN cortar):** Si una punta se disparó en el *stretch* y queda muy cerca del LED (>1100 µmol/m²/s), se masajea/dobla el tallo 90° en Día 14 para nivelar la canopia **sin amputar la flor**.`,
        `  - **2. Defoliación / Lollipopping (Día 14 o Día 21):** Lo que se poda en Día 14–21 son **hojas abanico y brotes bajos débiles**, dejando intactas las puntas superiores.`,
        `  - **3. Backbuilding (despunte tardío):** Algunos cultivadores recortan solo 2–3 mm de la punta del cogollo en **Semana 6–7** (nunca en Día 14) buscando ensanchar la flor, pero aumenta el riesgo de hongos en salas densas.`,
        `- **Recomendación para ${contexto.nombre}${diasFlora !== undefined ? ` (estás en Día ${diasFlora})` : ''}:** Deja intactas las puntas florales; si alguna rama se estira de más usa **LST o supercropping suave**, y reserva la limpieza de hojas/bajos para el **Día 21**.`,
      ];
      return {
        respuesta: lineasPuntas.join('\n'),
        accionesSugeridas: [],
        resumenRAG:
          'GUIA_PODA_PUNTAS: NO cortar puntas con flor formada en día 14 (pierde cola principal y abre puerta a Botrytis). Si altura excede PPFD usar supercropping sin cortar; poda de día 14/21 es solo hojas y bajos.',
      };
    }

    // Sub-caso 1B: Pregunta específica sobre PODAR EN DÍA 14 vs DÍA 21
    const preguntaDia14 = /\b(dia 14|14 de flora|14 dias|semana 2)\b/.test(mNorm);
    if (preguntaDia14 && (subEtapa === 'stretch_preflora' || subEtapa === 'floracion_temprana')) {
      const diasRestantesDia21 = diasFlora !== undefined ? Math.max(0, 21 - diasFlora) : 7;
      const lineasDia14 = [
        `📅 **¿Conviene podar en el Día 14 de Floración o esperar al Día 21? (${contexto.nombre})**`,
        ``,
        `- **Respuesta directa:** En **Día 14** la planta sigue en pleno *stretch* (estiramiento). **Hacer una defoliación fuerte en Día 14 tiene una contra:** entre el Día 14 y el 21 volverá a sacar hojas nuevas que sombreen los brotes, obligándote a podar dos veces (doble estrés).`,
        `- **Cuándo SÍ conviene en Día 14:** Solo si tienes un **dosel extremadamente denso**, alta potencia LED (**~${objetivos.ppfdEstimadoSala ?? 900} µmol/m²/s**) con CO2 y humedad alta (>65% HR). En ese caso haz **solo un 30% de despeje ligero** (hojas grandes que tapen flores centrales) y deja las puntas intactas.`,
        `- **Estándar comercial Athena / USU (Día 21):** Lo más eficiente para ${contexto.nombre}${diasFlora !== undefined ? ` (llevas **Día ${diasFlora}**)` : ''} es hacer **una sola limpieza completa en el Día 21** (defoliación estratégica + *lollipopping* del tercio inferior), justo cuando frena el estiramiento.`,
      ];
      return {
        respuesta: lineasDia14.join('\n'),
        accionesSugeridas: [
          {
            id: `kb-poda-dia21-${Date.now()}`,
            codigoKB: 'USU-ATH-PODA-D21',
            tipoAccion: 'crear_tarea',
            titulo: `Programar Defoliación + Lollipopping al Día 21 de Flora (en ${diasRestantesDia21} días)`,
            descripcion:
              'Protocolo Athena + USU: Limpiar tercio inferior improductivo y retirar hojas abanico que sombreen sitios florales en Día 21 sin tocar puntas apicales.',
            categoriaTarea: 'poda',
            prioridad: 'alta',
            diasOffset: diasRestantesDia21,
            duracionEstimada: 45,
          },
        ],
        resumenRAG:
          'GUIA_PODA_DIA14: En día 14 sigue el stretch; poda fuerte rebrota y genera doble estrés. Solo despeje ligero si hay exceso de follaje/humedad; limpieza definitiva en Día 21.',
      };
    }

    const lineas: string[] = [
      `✂️ **Estrategia de Poda y Manejo de Canopia para ${contexto.nombre} (${protocolo.titulo})**`,
      ``,
    ];
    const acciones: AccionConocimiento[] = [];
    let resumenRAG = '';

    if (subEtapa === 'germinacion_esquejes') {
      lineas.push(
        `- **Todavía NO podes:** En esta etapa la prioridad es expandir masa radicular y lograr al menos **4–5 nudos reales** antes de intervenir.`,
        `- **Cuándo empezar:** En **vegetación temprana** (4º–5º nudo) podrás hacer **LST suave**${esAuto ? ' (en autoflorecientes evita podas apicales agresivas)' : ' o **poda apical (topping)**'}.`
      );
      resumenRAG = 'GUIA_PODA: Etapa germinación/esquejes -> NO podar aún; esperar 4-5 nudos reales.';
    } else if (subEtapa === 'vegetacion_temprana' || subEtapa === 'vegetacion_avanzada') {
      lineas.push(
        esAuto
          ? `- **Genética Autofloreciente:** Prioriza **LST (amarre de bajo estrés)** y defolia solo hojas abanico puntuales que tapen brotes. Evita podas apicales tardías para no frenar el ciclo.`
          : `- **Poda Apical (Topping) / LST / SCROG:** Estás en la ventana correcta. Haz poda apical sobre el **4º–6º nudo** para multiplicar colas principales y nivela la canopia bajo los **~${objetivos.ppfdEstimadoSala ?? 550} µmol/m²/s** de tu sala.`,
        `- **Limpieza Pre-Flora (Lollipopping suave):** Realiza la poda de ramas bajas débiles **5 a 7 días antes de pasar a 12/12**, dándole tiempo a la planta de recuperarse antes del *stretch*.`,
        `- **Post-poda (Bugbee + Athena):** Mantén **VPD en ${protocolo.vpdRango[0]}–${protocolo.vpdRango[1]} kPa** y **Athena Balance** en tanque para reforzar pared celular con Silicio.`
      );
      acciones.push({
        id: `kb-poda-vege-${Date.now()}`,
        codigoKB: 'USU-ATH-PODA-VEGE',
        tipoAccion: 'crear_tarea',
        titulo: `Limpieza de bajos y nivelación de canopia pre-flora en ${contexto.nombre}`,
        descripcion:
          'Retirar brotes inferiores sin llegada de luz y nivelar ramas principales 5-7 días antes del cambio a 12/12.',
        categoriaTarea: 'poda',
        prioridad: 'alta',
        diasOffset: 2,
        duracionEstimada: 40,
      });
      resumenRAG =
        'GUIA_PODA: En Vegetación -> Topping en 4-6 nudo (no en autos), LST/SCROG para uniformidad PPFD, limpieza de bajos 5-7 días antes de 12/12.';
    } else if (subEtapa === 'stretch_preflora') {
      const diasRestantesDia21 = diasFlora !== undefined ? Math.max(0, 21 - diasFlora) : 7;
      const infoDia =
        diasFlora !== undefined
          ? `Llevas **${diasFlora} días de floración**${diasFlora >= 18 && diasFlora <= 23 ? ' (estás justo en la ventana óptima del Día 21)' : ''}.`
          : `Estás en **Semanas 1–3 de Floración (Stretch)**. `;

      lineas.push(
        `- **Momento exacto:** ${infoDia} La ventana comercial ideal para la poda fuerte (**Defoliación estratégica + Lollipopping**) es el **Día 21 de floración** (al terminar el estiramiento / *stretch*).`,
        diasFlora !== undefined && diasFlora < 18
          ? `- **Qué hacer hoy (Día ${diasFlora}):** Evita podas drásticas ahora mismo. Solo retira alguna hoja grande que bloquee brotes centrales y espera **~${diasRestantesDia21} días** hasta el **Día 21** para limpiar el tercio inferior completo.`
          : `- **Qué podar en Día 21:** Limpia el **tercio inferior (lollipopping)** de ramas y brotes que no reciben PPFD útil, y retira hojas abanico grandes del tercio medio que sombreen sitios florales o frenen el flujo de aire (**>0.5–0.8 m/s**, regla Bugbee).`,
        `- **Prohibido en esta etapa:** **NO hagas poda apical (topping)** ni podas estructurales pesadas una vez iniciada la floración, porque desvías energía hormonal cuando la planta está formando los sitios florales.`,
        `- **Recuperación:** Tras defoliar en Día 21, mantén **VPD ${protocolo.vpdRango[0]}–${protocolo.vpdRango[1]} kPa**, **EC ${objetivos.ecObjetivo} mS/cm** y tu **Dryback Generativo (40–50%)** sin estrés hídrico extremo las primeras 48h.`
      );
      acciones.push({
        id: `kb-poda-dia21-${Date.now()}`,
        codigoKB: 'USU-ATH-PODA-D21',
        tipoAccion: 'crear_tarea',
        titulo:
          diasFlora !== undefined && diasFlora >= 18
            ? `Ejecutar Defoliación + Lollipopping (Día 21 de Flora) en ${contexto.nombre}`
            : `Programar Defoliación + Lollipopping al Día 21 de Flora (en ${diasRestantesDia21} días)`,
        descripcion:
          'Protocolo Athena + USU: Limpiar tercio inferior improductivo y retirar hojas abanico que sombreen sitios florales para maximizar PPFD útil y flujo de aire intracanopia.',
        categoriaTarea: 'poda',
        prioridad: diasFlora !== undefined && diasFlora >= 18 ? 'urgente' : 'alta',
        diasOffset: diasRestantesDia21,
        duracionEstimada: 45,
      });
      resumenRAG = `GUIA_PODA: En Stretch (Sem 1-3 Flora, día ${diasFlora ?? '?'}) -> Ventana ideal Defoliación + Lollipopping es DÍA 21 de flora (limpiar tercio inferior + hojas que sombreen flores, mejorar flujo aire >0.8 m/s). PROHIBIDO topping en flora.`;
    } else if (subEtapa === 'floracion_temprana') {
      lineas.push(
        `- **Ventana límite (Semanas 4–5):** Si no hiciste la limpieza del **Día 21**, puedes hacer una **defoliación selectiva ligera** esta semana (solo hojas abanico que tapen cogollos directos o bloqueen ventilación).`,
        `- **Evita cortes pesados:** Ya estás en fase **Bulking (Engorde)**; podar ramas o quitar demasiada masa foliar ahora reduce la capacidad fotosintética y frena el calibre floral.`
      );
      resumenRAG =
        'GUIA_PODA: Semanas 4-5 (Bulking) -> Solo defoliación selectiva ligera si faltó en Día 21; evitar podas pesadas para no frenar engorde.';
    } else {
      lineas.push(
        `- **NO podar ni defoliar fuerte en ${protocolo.titulo}:** En semanas avanzadas de floración o maduración, cualquier poda genera estrés innecesario y reduce el peso final y los terpenos.`,
        `- **Única excepción:** Retirar manualmente solo **hojas amarillas/senescentes** o alguna hoja pegada a una cola densa que pueda retener humedad y provocar *Botrytis*.`
      );
      resumenRAG =
        'GUIA_PODA: Flora avanzada/maduración -> NO podar; solo retirar hojas senescentes o que generen riesgo de Botrytis.';
    }

    return { respuesta: lineas.join('\n'), accionesSugeridas: acciones, resumenRAG };
  }

  // 2. CAMBIO A FLORACIÓN / FOTOPERÍODO / STRETCH / SEXADO
  if (
    mNorm.includes('12/12') ||
    mNorm.includes('18/6') ||
    mNorm.includes('fotoperiodo') ||
    mNorm.includes('cambio a flora') ||
    mNorm.includes('pasar a flora') ||
    mNorm.includes('cuando floro') ||
    mNorm.includes('stretch') ||
    mNorm.includes('estiramiento') ||
    mNorm.includes('hermafrodita') ||
    mNorm.includes('macho')
  ) {
    const factorStretch =
      objetivos.geneticaDetectada === 'sativa'
        ? '2.5x a 3x su altura actual'
        : objetivos.geneticaDetectada === 'indica'
          ? '1.5x a 2x su altura actual'
          : '1.8x a 2.2x su altura actual';
    const lineas = [
      `🌗 **Fotoperíodo, Cambio a Floración y Control de Stretch (${contexto.nombre})**`,
      ``,
      esAuto
        ? `- **Genética Autofloreciente:** No requiere cambio a 12/12; florece por edad (~día 21–28) manteniendo **18/6 o 20/4** todo el ciclo.`
        : `- **Cuándo pasar a 12/12:** Cambia a floración cuando la canopia cubra el **70–80% del área útil** (${contexto.metrosCuadrados ?? '?'} m²), considerando que tu genética (${objetivos.geneticaDetectada}) estirará **${factorStretch}** en las primeras 3 semanas.`,
      `- **Manejo Athena del Stretch (Sem 1–3):** Aplica **Steering Generativo** (Dryback nocturno **40–50%**, primer pulso **2–3h** tras encender luces) y mantén **diferencial térmico día/noche (DIF) cercano a 0–2°C** para compactar entrenudos.`,
      `- **DLI bajo 12/12 (Bugbee USU):** Al bajar de 18h a 12h de luz, sube progresivamente el PPFD hacia **${protocolo.ppfdRecomendado}** para sostener un DLI de **${protocolo.dliRecomendado}**.`,
    ];
    return {
      respuesta: lineas.join('\n'),
      accionesSugeridas: [],
      resumenRAG: `GUIA_FOTOPERIODO: Genética ${objetivos.geneticaDetectada} (stretch ${factorStretch}); Steering Generativo Sem 1-3 (Dryback 40-50%, DIF bajo).`,
    };
  }

  // 3. COSECHA / TRICOMAS / LAVADO / FADE / SECADO Y CURADO
  if (
    /\b(cosech\w*|cortar|corte|tricom\w*|ambar|lechoso\w*|lupa|lavado|flush|secado|secar|curado|curar|manicur\w*|clorofila)\b/.test(
      mNorm
    )
  ) {
    const lineas = [
      `🌾 **Protocolo de Cosecha, Maduración y Secado (${contexto.nombre})**`,
      ``,
      `- **Finalización sin Bloqueo (Athena Fade + Bugbee):** En las últimas **2 semanas**, reemplaza **Pro Core** por **Athena Fade** (0% Nitrógeno manteniendo Calcio y micronutrientes para evitar *Botrytis* y degradar clorofila). Reduce la EC gradualmente los últimos 5–7 días.`,
      `- **Punto de Corte (Tricomas):** Observa los cálices (no las hojas de azúcar) con lupa 60x: cosecha con **80–90% de tricomas lechosos** y **10–20% ámbar** según el perfil de efecto buscado.`,
      `- **Clima Pre-Cosecha (Últimas 2 semanas):** Baja a **20–23°C** y **45% HR** para preservar monoterpenos volátiles.`,
      `- **Secado y Curado (10–14 días):** Seca a **18–20°C / 55–60% HR** en oscuridad total con circulación de aire indirecta (nunca ventilador directo a las flores) hasta que el tallo haga *snap*, y luego cura en frascos manteniendo **58–62% HR**.`,
    ];
    return {
      respuesta: lineas.join('\n'),
      accionesSugeridas: [],
      resumenRAG:
        'GUIA_COSECHA: Últimas 2 sem Athena Fade (0% N + Ca), corte con 80-90% tricomas lechosos / 10-20% ámbar, clima 20-23C/45%HR, secado 18-20C/55-60%HR 10-14d.',
    };
  }

  // 4. TRASPLANTE / MACETAS / RAÍCES / INOCULANTES
  if (
    /\b(trasplan\w*|maceta\w*|raiz|raices|radicular\w*|micorriza\w*|trichoderma\w*|enzima\w*|enraizar|esqueje\w*|clon\w*)\b/.test(
      mNorm
    )
  ) {
    const lineas = [
      `🪴 **Manejo Radicular, Trasplante y Sustrato (${objetivos.sustratoDetectado.nombre.split('/')[0].trim()})**`,
      ``,
      `- **Cuándo trasplantar:** Hazlo antes de que las raíces den vueltas en espiral (*root-bound*), idealmente **3 a 5 días antes de pasar a 12/12** para que colonicen la maceta definitiva (**${contexto.litrosMaceta ?? 7} L** actuales) durante el inicio del *stretch*.`,
      `- **Oxígeno Radicular (Bruce Bugbee USU):** En **${objetivos.sustratoDetectado.id === 'coco' ? 'Coco/Perlita' : objetivos.sustratoDetectado.nombre.split('/')[0].trim()}**, nunca dejes agua estancada en platos; asegura drenaje libre y buena aireación para evitar *Pythium*.`,
      `- **Cleanse vs Biológicos:** Si usas **Athena Cleanse** (ácido hipocloroso para ORP >350 mV y raíces blancas), **no lo mezcles** en el mismo tanque con micorrizas/trichodermas vivos porque el HOCl los oxida.`,
    ];
    return {
      respuesta: lineas.join('\n'),
      accionesSugeridas: [],
      resumenRAG:
        'GUIA_RAICES: Trasplantar 3-5 días antes de 12/12 antes de root-bound; evitar agua estancada; Cleanse (HOCl) incompatible con inoculantes vivos.',
    };
  }

  // 5. DRENAJE / POUR-THROUGH / BLOQUEO / CALMAG / SILICIO / FOLIAR
  if (
    /\b(drenaje|pour through|salinidad|acumulacion|lockout|calmag|silicio|wollastonita|foliar\w*|pulveriz\w*)\b/.test(
      mNorm
    )
  ) {
    const lineas = [
      `🧪 **Control de Rizosfera, Drenaje (Pour-Through) y Suplementación (${contexto.nombre})**`,
      ``,
      `- **Auditoría de Drenaje (Athena + USU):** Mide EC y pH del lixiviado (15–25% de runoff). Si la **EC de salida supera en +0.5 a +0.8 mS/cm** a la de entrada (**${objetivos.ecObjetivo} mS/cm**), haz riegos de refresco con **Athena Cleanse (5–10 mL/gal)** a **pH ${objetivos.phObjetivo}**.`,
      `- **Silicio y Calcio:** Usa **Athena Balance** (1º en el tanque) o **Wollastonita** en sustrato para fortalecer pared celular. Bajo LED de alta potencia en coco, si ves déficit de Ca/Mg, revisa primero el VPD (**${protocolo.vpdRango[0]}–${protocolo.vpdRango[1]} kPa**) antes de sobrecargar CalMag.`,
      `- **Aplicaciones Foliares:** Permitidas solo en vegetación y hasta **Día 14 de floración** con luces apagadas; después de semana 2–3 de flora está prohibido pulverizar sobre flores.`,
    ];
    return {
      respuesta: lineas.join('\n'),
      accionesSugeridas: [],
      resumenRAG: `GUIA_RIZOSFERA: Meta pH=${objetivos.phObjetivo}, EC=${objetivos.ecObjetivo}mS (runoff 15-25%); delta EC >+0.5-0.8 -> reset con Cleanse. No foliar tras día 14 flora.`,
    };
  }

  return null;
}

export function generarRespuestaConocimientoLocal(
  mensaje: string,
  contexto: ContextoCultivo,
  tieneImagenes: boolean = false,
  historialReciente?: Array<{ tipo?: string; contenido?: string }>
): {
  respuesta: string;
  accionesSugeridas: AccionConocimiento[];
  fuentesConocimiento: string[];
  intencion: IntencionConsultaKB;
  esSuficienteSinLLM: boolean;
} {
  const objetivos = calcularObjetivosAgronomicos(contexto);
  const protocolo = PROTOCOLOS_ETAPA_KB[objetivos.subEtapaActual];
  const patologiasCoincidentes = buscarPatologiasKB(mensaje);
  const intencion = detectarIntencionConsulta(mensaje, tieneImagenes);
  const apuntesUsuario = obtenerApuntesPersonalizadosBugbee();

  const mNorm = normalizarTextoConsulta(mensaje);
  const telemetria = extraerTelemetriaConversacion(mensaje, historialReciente);

  const enFlora =
    objetivos.subEtapaActual.includes('flora') ||
    objetivos.subEtapaActual === 'stretch_preflora' ||
    objetivos.subEtapaActual === 'lavado_maduracion' ||
    mNorm.includes('flora');

  const fuentesConocimiento: string[] = [
    `Bruce Bugbee (USU) + Athena Ag: ${protocolo.codigoKB}`,
    `Steering: ${protocolo.tipoSteeringAthena}`,
  ];
  for (const pat of patologiasCoincidentes) {
    fuentesConocimiento.push(`${pat.codigoKB}: ${pat.nombre}`);
  }

  const esContinuacion = Boolean(
    historialReciente && historialReciente.some((m) => m.tipo === 'user')
  );
  const tieneTelemetriaPreviaClima =
    telemetria.temp !== undefined || telemetria.hr !== undefined || telemetria.co2 !== undefined;
  const esPreguntaSeguimientoClima =
    esContinuacion &&
    tieneTelemetriaPreviaClima &&
    (mNorm.includes('noche') ||
      mNorm.includes('apagan') ||
      mNorm.includes('oscuridad') ||
      mNorm.includes('como bajo') ||
      mNorm.includes('como subo') ||
      mNorm.includes('que hago') ||
      mNorm.includes('entonces') ||
      mNorm.includes('deshumidificador') ||
      mNorm.includes('extraccion') ||
      mNorm.includes('ventilacion') ||
      mNorm.includes('luz') ||
      mNorm.includes('luces') ||
      mNorm.includes('panel') ||
      mNorm.includes('watts'));

  // ANÁLISIS ESPECÍFICO DE VENTILACIÓN / EXTRACCIÓN / INTRACCIÓN / SALA CERRADA
  if (
    mNorm.includes('extraccion') ||
    mNorm.includes('intraccion') ||
    mNorm.includes('ventilacion') ||
    mNorm.includes('ventilador') ||
    mNorm.includes('sala cerrada') ||
    mNorm.includes('capa limite') ||
    /\baire\b/.test(mNorm)
  ) {
    const tieneCo2Previo = Boolean(telemetria.co2 && telemetria.co2 >= 800);
    const respuestaAire = [
      `🌬️ **Manejo de Aire, Extracción e Intracción en ${contexto.nombre} (Dr. Bruce Bugbee USU)**`,
      ``,
      tieneCo2Previo
        ? `Como mencionaste que trabajas con **${telemetria.co2} ppm de CO2**, tu sala funciona como **Sala Cerrada (Sealed Room)**:`
        : `Depende de si tu sala es **Abierta** o **Cerrada con CO2**:`,
      ``,
      `- **Si es Sala Abierta (sin inyección de CO2):** **NO está bien** no tener extracción/intracción. Las plantas consumen el CO2 ambiental (~420 ppm) en pocos minutos tras encender los **${contexto.potenciaLamparas || 1600}W LED**, frenando la fotosíntesis y acumulando calor y humedad (riesgo de *Botrytis*). Necesitas renovación de aire continua.`,
      `- **Si es Sala Cerrada (con CO2 suplementario 1000–1200 ppm):** **SÍ puede funcionar sin extracción ni intracción hacia el exterior**, siempre que tengas **Aire Acondicionado + Deshumidificador** dimensionados para controlar temperatura y humedad internamente.`,
      `- **Regla Obligatoria de Bruce Bugbee (Velocidad del Viento):** Tanto en sala abierta como cerrada, necesitas **ventiladores oscilantes internos** que muevan el aire a **0.5–1.0 m/s** sobre e interior de la canopia para romper la **capa límite estomática**, permitir la entrada de CO2/salida de vapor y evitar bolsas de humedad en las flores.`,
    ].join('\n');

    return {
      respuesta: respuestaAire,
      accionesSugeridas: [],
      fuentesConocimiento,
      intencion,
      esSuficienteSinLLM: false,
    };
  }

  // ANÁLISIS MULTIVARIABLE DE CLIMA (Temperatura + Humedad + CO2 cruzados con el historial del chat)
  if (telemetria.mencionoClimaActual || esPreguntaSeguimientoClima) {
    const tempIdealBase = enFlora ? objetivos.tempObjetivoFloracion : objetivos.tempObjetivoVegetacion;
    const hrIdealBase = enFlora ? objetivos.humedadObjetivoFloracion : objetivos.humedadObjetivoVegetacion;

    const tempSala =
      telemetria.temp ??
      (enFlora ? contexto.tempObjetivoFloracion || tempIdealBase : contexto.tempObjetivoVegetacion || tempIdealBase);
    const hrSala =
      telemetria.hr ??
      (enFlora ? contexto.humedadObjetivoFloracion || hrIdealBase : contexto.humedadObjetivoVegetacion || hrIdealBase);
    const co2Sala = telemetria.co2;
    const tieneAltoCo2 = Boolean(co2Sala && co2Sala >= 900);

    const vpdCalculado = calcularVpdTetens(tempSala, hrSala, -1.5);
    const tempHoja = (tempSala - 1.5).toFixed(1);

    // Con CO2 suplementario (1000-1200 ppm) en Vege o Stretch/Flora Temprana, Bugbee & Athena permiten 27-28°C con 58-62% HR
    const esFloraAvanzada =
      objetivos.subEtapaActual === 'floracion_engorde' ||
      objetivos.subEtapaActual === 'lavado_maduracion';
    const tempMetaReal = tieneAltoCo2 && !esFloraAvanzada ? 28 : tempIdealBase;
    const hrMetaReal = tieneAltoCo2 && !esFloraAvanzada ? 60 : hrIdealBase;
    const vpdMetaReal = calcularVpdTetens(tempMetaReal, hrMetaReal, -1.5);

    const lineasDiagnostico: string[] = [
      `🌡️ **Análisis Climático Integrado para ${contexto.nombre} (${protocolo.titulo})**`,
      ``,
      ` Cruzando los datos de tu sala (**${tempSala}°C** aire / **~${tempHoja}°C** hoja bajo LED · **${hrSala}% HR**${co2Sala ? ` · **${co2Sala} ppm CO2**` : ''
      } · **~${objetivos.ppfdEstimadoSala || 900} µmol/m²/s PPFD**), tu **VPD actual es de ${vpdCalculado} kPa** (rango ideal de etapa: **${protocolo.vpdRango[0]}–${protocolo.vpdRango[1]} kPa**):`,
      ``,
      `### 1. Diagnóstico Fisiológico (Dr. Bruce Bugbee USU + Athena Ag)`,
    ];

    // Evaluación de Temperatura + CO2
    if (tieneAltoCo2 && tempSala >= 27 && tempSala <= 29 && !esFloraAvanzada) {
      lineasDiagnostico.push(
        `- **✅ Temperatura (${tempSala}°C) + CO2 (${co2Sala} ppm) Óptimos:** Según el **Dr. Bruce Bugbee (USU)**, al inyectar **${co2Sala} ppm de CO2** bajo alta radiación LED (~${objetivos.ppfdEstimadoSala || 1000} µmol/m²/s), la temperatura foliar de **~${tempHoja}°C** (${tempSala}°C aire) maximiza la enzima Rubisco y la fotosíntesis neta. **No necesitas bajar los ${tempSala}°C en esta etapa.**`
      );
    } else if (tempSala >= 27.5 && !tieneAltoCo2 && enFlora) {
      lineasDiagnostico.push(
        `- **⚠️ Temperatura (${tempSala}°C) alta sin CO2 confirmado:** Bajo LED la hoja está a **~${tempHoja}°C**. Según **Bruce Bugbee (USU)**, 28°C solo se aprovecha si inyectas **1000–1200 ppm de CO2** con **60% HR**; sin CO2 suplementario debes bajar a **${tempIdealBase}°C**.`
      );
    } else if (tempSala >= 26 && esFloraAvanzada) {
      lineasDiagnostico.push(
        `- **🚨 Temperatura (${tempSala}°C) excesiva para final de floración:** Aunque tengas CO2, en las semanas finales debes bajar a **22–24°C** (y **20–22°C** con Athena Fade) para no volatilizar monoterpenos.`
      );
    }

    // Evaluación de Humedad y VPD resultante
    if (vpdCalculado < protocolo.vpdRango[0] || (hrSala >= 68 && enFlora)) {
      lineasDiagnostico.push(
        `- **🚨 Alerta Crítica por Humedad Alta (${hrSala}% HR -> VPD ${vpdCalculado} kPa muy bajo):** Con **${tempSala}°C** y **${hrSala}% HR**, el aire está demasiado saturado (**VPD ${vpdCalculado} kPa < ${protocolo.vpdRango[0]} kPa**). Esto frena el flujo transpirativo xilemático (**bloqueando la absorción de Calcio y Boro** aunque tengas ${co2Sala ? `${co2Sala} ppm de CO2 y ` : ''
        }buena nutrición), impide lograr el **Dryback Generativo de 40–50%** que exige **Athena**, y dispara el riesgo de **Botrytis y Oídio** al apagarse las luces.`
      );
    } else if (vpdCalculado > protocolo.vpdRango[1] + 0.15) {
      lineasDiagnostico.push(
        `- **⚠️ Alerta por VPD Alto (${vpdCalculado} kPa — Ambiente Seco/Cálido):** Con **${tempSala}°C** y **${hrSala}% HR**, la demanda evaporativa supera el límite de **${protocolo.vpdRango[1]} kPa**, provocando cierre estomático defensivo, menor asimilación de CO2 y concentración rápida de sales en el sustrato.`
      );
    } else {
      lineasDiagnostico.push(
        `- **✅ VPD en Zona Ideal (${vpdCalculado} kPa):** El equilibrio entre **${tempSala}°C** y **${hrSala}% HR** mantiene los estomas abiertos al máximo rendimiento fotosintético.`
      );
    }

    if (esPreguntaSeguimientoClima && (mNorm.includes('noche') || mNorm.includes('apagan') || mNorm.includes('oscuridad'))) {
      lineasDiagnostico.push(
        ``,
        `### 🌙 Manejo del Ciclo Nocturno (12h de Oscuridad — Bruce Bugbee & Athena)`,
        `- **Temperatura Nocturna:** Con tus **${tempSala}°C** diurnos, en el período oscuro mantén la sala entre **${protocolo.tempDiaNoche.noche[0]} y ${protocolo.tempDiaNoche.noche[1]}°C** (diferencial DIF pequeño para frenar el estiramiento internodal).`,
        `- **Corte de CO2 y Pico de Humedad:** El CO2 (**${co2Sala || 1200} ppm**) se apaga durante la noche porque las plantas no fijan carbono sin luz. **¡Atención al primer cuarto de hora tras apagar las luces!** Al enfriarse el aire de ${tempSala}°C a ~21°C, tu humedad relativa (${hrSala}% HR) subirá de golpe por punto de rocío: mantén el deshumidificador y los ventiladores al 100% para que no supere el **50–55% HR** en oscuridad.`
      );
    }

    lineasDiagnostico.push(``, `### 2. Ajuste Exacto Recomendado para ${contexto.nombre}`);
    if (tieneAltoCo2 && hrSala > 64) {
      lineasDiagnostico.push(
        `- **Mantén:** Temperatura en **${tempMetaReal}°C** y CO2 en **${co2Sala} ppm**.`,
        `- **Corrige ahora:** Baja la humedad relativa de **${hrSala}% a ${hrMetaReal}% HR** con deshumidificación y extracción. Con **${tempMetaReal}°C y ${hrMetaReal}% HR**, tu VPD subirá de ${vpdCalculado} kPa a **${vpdMetaReal} kPa** (el punto exacto de Bruce Bugbee y Athena para asimilar los ${co2Sala} ppm de CO2).`,
        `- **Nutrición Athena con CO2:** Con ${co2Sala} ppm de CO2 y alta luz, mantén la EC de entrada en **${objetivos.ecObjetivo} mS/cm** (Athena Pro Bloom + Pro Core + Cleanse) asegurando **15–25% de runoff**.`
      );
    } else {
      lineasDiagnostico.push(
        `- **Meta Climática Diurna:** Ajusta la sala a **${tempMetaReal}°C** y **${hrMetaReal}% HR** para clavar el VPD en **${vpdMetaReal} kPa**.`,
        `- **Flujo de Aire (USU):** Asegura velocidad de viento intracanopia de **0.8–1.0 m/s** para romper la capa límite foliar.`
      );
    }

    const accionClima: AccionConocimiento = {
      id: `kb-clima-sync-${Date.now()}`,
      codigoKB: protocolo.codigoKB,
      tipoAccion: 'actualizar_parametros',
      titulo: `Fijar Meta Climática ${enFlora ? 'Floración' : 'Vegetación'} en ${tempMetaReal}°C / ${hrMetaReal}% HR (VPD ${vpdMetaReal} kPa)`,
      descripcion: `Sincroniza el objetivo climático de ${contexto.nombre} según Bruce Bugbee + Athena${co2Sala ? ` (optimizado para ${co2Sala} ppm CO2)` : ''
        }.`,
      parametrosObjetivo: enFlora
        ? {
          tempObjetivoFloracion: tempMetaReal,
          humedadObjetivoFloracion: hrMetaReal,
        }
        : {
          tempObjetivoVegetacion: tempMetaReal,
          humedadObjetivoVegetacion: hrMetaReal,
        },
    };

    const accionTareaClima: AccionConocimiento = {
      id: `kb-clima-task-${Date.now()}`,
      codigoKB: 'USU-ATH-VPD',
      tipoAccion: 'crear_tarea',
      titulo:
        hrSala > hrMetaReal + 5
          ? `Bajar humedad de ${hrSala}% a ${hrMetaReal}% HR (Ajustar VPD de ${vpdCalculado} a ${vpdMetaReal} kPa)`
          : `Ajustar clima de sala a ${tempMetaReal}°C / ${hrMetaReal}% HR (VPD ${vpdMetaReal} kPa)`,
      descripcion: `Protocolo Bugbee + Athena: Calibrar deshumidificación/extracción en ${contexto.nombre} para llevar el VPD a ${vpdMetaReal} kPa y asegurar flujo de aire intracanopia >0.8 m/s.`,
      categoriaTarea: 'mantenimiento',
      prioridad: vpdCalculado < 0.75 || vpdCalculado > 1.6 ? 'urgente' : 'alta',
      diasOffset: 0,
      duracionEstimada: 20,
    };

    return {
      respuesta: lineasDiagnostico.join('\n'),
      accionesSugeridas: [accionClima, accionTareaClima],
      fuentesConocimiento,
      intencion,
      esSuficienteSinLLM: false,
    };
  }

  // ANÁLISIS ESPECÍFICO C: El usuario reporta un valor puntual de pH o EC
  if (telemetria.mencionoNutricionActual) {
    const valorPH = telemetria.ph;
    const valorEC = telemetria.ec;
    const partesNutri: string[] = [
      `🧪 **Evaluación Nutricional para ${contexto.nombre} (${objetivos.sustratoDetectado.nombre})**`,
      ``,
    ];

    if (valorPH !== undefined) {
      partesNutri.push(
        valorPH > 6.4
          ? `- 🚨 **pH Elevado (${valorPH} > 6.4):** Según el **Dr. Bruce Bugbee (USU)** y **Athena Ag**, por encima de pH 6.4 precipitan el **Hierro (Fe), Manganeso (Mn), Boro, Cobre y Zinc**. Ajústalo a **${objetivos.phObjetivo}** (usando 1º Athena Balance en el tanque y corrigiendo pH al final).`
          : valorPH < 5.5
            ? `- ⚠️ **pH Ácido (${valorPH} < 5.5):** Reduce la disponibilidad de Calcio y Magnesio. Súbelo con **Athena Balance (Silicato de Potasio)** hasta **${objetivos.phObjetivo}**.`
            : `- ✅ **pH ${valorPH} en rango óptimo** (meta exacta para tu etapa: **${objetivos.phObjetivo}**).`
      );
    }

    if (valorEC !== undefined) {
      partesNutri.push(
        `- **Meta EC Oficial (${protocolo.codigoKB} · Steering ${protocolo.tipoSteeringAthena}):** **${objetivos.ecObjetivo} mS/cm** de entrada con **15–25% de drenaje (runoff)**.`,
        valorEC > objetivos.ecObjetivo + 0.5
          ? `- ⚠️ **EC por encima de la meta (${valorEC} mS vs ${objetivos.ecObjetivo} mS):** Riesgo de estrés osmótico y quemado de puntas (*tip burn*). Realiza un riego con **Athena Cleanse (5 mL/gal)** a pH **${objetivos.phObjetivo}** logrando 25% de drenaje.`
          : `- Mantén el orden de mezcla estricto de Athena: **1º Balance -> 2º Pro Core -> 3º Pro Grow/Bloom -> 4º Cleanse**.`
      );
    }

    return {
      respuesta: partesNutri.join('\n'),
      accionesSugeridas: [objetivos.accionesSugeridas[0]],
      fuentesConocimiento,
      intencion,
      esSuficienteSinLLM: false,
    };
  }

  // ANÁLISIS ESPECÍFICO D: Pregunta directa sobre RIEGO / AGUA POR PLANTA / PULSOS / FRECUENCIA
  if (
    mNorm.includes('agua') ||
    mNorm.includes('regar') ||
    mNorm.includes('riego') ||
    mNorm.includes('litro') ||
    mNorm.includes('pulso') ||
    mNorm.includes('runoff') ||
    mNorm.includes('dryback')
  ) {
    const numPlantas = contexto.numeroplantas || 6;
    const litrosMaceta = contexto.litrosMaceta || 7;
    const litrosTotalesSala = objetivos.aguaDiariaObjetivo;
    const litrosPorPlanta = Number((litrosTotalesSala / numPlantas).toFixed(2));
    const mlPorPlanta = Math.round(litrosPorPlanta * 1000);
    const porcentajeMaceta = Math.round((litrosPorPlanta / litrosMaceta) * 100);
    const esGenerativo = protocolo.tipoSteeringAthena.includes('Generativo');
    const esCocoOHidro =
      objetivos.sustratoDetectado.id === 'coco' || objetivos.sustratoDetectado.id === 'hidro';

    const pulsosRecomendados = esCocoOHidro
      ? esGenerativo
        ? `2 a 3 pulsos/día (ej. ~${Math.round(mlPorPlanta / 2)}–${Math.round(mlPorPlanta / 3)} mL por pulso)`
        : `3 a 5 pulsos/día (ej. ~${Math.round(mlPorPlanta / 4)} mL por pulso P1/P2)`
      : `1 riego cada 24–48h (~${litrosPorPlanta} L por planta al regar)`;

    const respuestaRiego = [
      `Para **${contexto.nombre}** (**${numPlantas} plantas** en macetas de **${litrosMaceta} L** de ${objetivos.sustratoDetectado.nombre.split('/')[0].trim()}), te recomiendo regar **~${litrosPorPlanta} litros/día por planta** (**${mlPorPlanta} mL/día**, ~${porcentajeMaceta}% del volumen de maceta).`,
      ``,
      `- **Total diario en sala:** **~${litrosTotalesSala} L/día** (ya incluye un **15–20% de drenaje/runoff**).`,
      `- **Cómo repartirlo (${protocolo.tipoSteeringAthena}):** **${pulsosRecomendados}**.`,
      esGenerativo
        ? `- **Horario (Stretch Sem 1–3):** Primer pulso **2–3h después de encender luces** y último riego **3–4h antes del apagado** (Dryback nocturno **40–50%**).`
        : `- **Horario (Bulking/Vege):** Primer pulso **1–1.5h tras encender luces** con pulsos cortos P1/P2 (Dryback **20–30%**).`,
    ].join('\n');

    const accionRiego: AccionConocimiento = {
      id: `kb-riego-task-${Date.now()}`,
      codigoKB: 'USU-ATH-RIEGO',
      tipoAccion: 'crear_tarea',
      titulo: `Programar riego diario: ${litrosPorPlanta} L/planta (${litrosTotalesSala} L sala · pH ${objetivos.phObjetivo} · EC ${objetivos.ecObjetivo} mS)`,
      descripcion: `Protocolo Bugbee + Athena (${protocolo.tipoSteeringAthena}): ${pulsosRecomendados} asegurando 15–20% de runoff y controlando EC de drenaje.`,
      categoriaTarea: 'riego',
      prioridad: 'alta',
      diasOffset: 0,
      duracionEstimada: 25,
    };

    return {
      respuesta: respuestaRiego,
      accionesSugeridas: [accionRiego, objetivos.accionesSugeridas[0]],
      fuentesConocimiento,
      intencion,
      esSuficienteSinLLM: false,
    };
  }

  // ANÁLISIS ESPECÍFICO E: Pregunta directa sobre MEZCLA / FERTILIZANTES ATHENA
  if (
    mNorm.includes('mezcla') ||
    mNorm.includes('tanque') ||
    mNorm.includes('athena') ||
    mNorm.includes('fertiliz') ||
    mNorm.includes('abono') ||
    mNorm.includes('balance') ||
    mNorm.includes('fade') ||
    mNorm.includes('cleanse')
  ) {
    const formulaEtapa =
      objetivos.subEtapaActual === 'lavado_maduracion'
        ? 'Athena Fade + Pro Bloom (0% Nitrógeno en las últimas 2 semanas)'
        : enFlora
          ? 'Athena Pro Core (60%) + Athena Pro Bloom (100%)'
          : 'Athena Pro Core (60%) + Athena Pro Grow (100%)';

    const respuestaMezcla = [
      `🧪 **Protocolo de Mezcla Athena Ag + Bruce Bugbee para ${contexto.nombre} (${protocolo.titulo})**`,
      ``,
      `- **Fórmula de Etapa:** **${formulaEtapa}**`,
      `- **Metas de Tanque:** **pH ${objetivos.phObjetivo}** · **EC ${objetivos.ecObjetivo} mS/cm** · Volumen diario **~${objetivos.aguaDiariaObjetivo} L**`,
      ``,
      `### Orden Estricto de Mezcla (Evita Precipitación de Calcio)`,
      `- **1º Athena Balance (Silicato):** Agregar primero al agua RO y mezclar bien para estabilizar pH y aportar Silicio (efecto similar a la Wollastonita de Bruce Bugbee).`,
      `- **2º ${objetivos.subEtapaActual === 'lavado_maduracion' ? 'Athena Fade' : 'Athena Pro Core'}:** Disolver completamente antes de agregar el siguiente componente.`,
      `- **3º ${enFlora ? 'Athena Pro Bloom' : 'Athena Pro Grow'}:** Incorporar y homogeneizar la EC hasta **${objetivos.ecObjetivo} mS/cm**.`,
      `- **4º Athena Cleanse (2–5 mL/gal):** Mantiene líneas limpias, ORP >350 mV y raíces oxigenadas.`,
      `- **5º Ajuste Final de pH:** Calibrar a **${objetivos.phObjetivo}** (nunca >6.4 para evitar precipitación de Fe/Mn/Zn según USU).`,
    ].join('\n');

    return {
      respuesta: respuestaMezcla,
      accionesSugeridas: [objetivos.accionesSugeridas[0]],
      fuentesConocimiento,
      intencion,
      esSuficienteSinLLM: false,
    };
  }

  // ANÁLISIS ESPECÍFICO F: Pregunta directa sobre LUZ / PPFD / DLI / WATTS
  if (
    mNorm.includes('luz') ||
    mNorm.includes('luces') ||
    mNorm.includes('lampara') ||
    mNorm.includes('watts') ||
    mNorm.includes('ppfd') ||
    mNorm.includes('dli') ||
    mNorm.includes('dimmer') ||
    mNorm.includes('atenuar')
  ) {
    const wattsM2 =
      contexto.potenciaLamparas && contexto.metrosCuadrados
        ? Math.round(contexto.potenciaLamparas / contexto.metrosCuadrados)
        : undefined;
    const respuestaLuz = [
      `☀️ **Auditoría Fotobiológica (Dr. Bruce Bugbee USU) para ${contexto.nombre}**`,
      ``,
      `- **Potencia Instalada:** **${contexto.potenciaLamparas ?? '-'} W** en **${contexto.metrosCuadrados ?? '-'} m²** (${wattsM2 ?? '-'} W/m²).`,
      `- **PPFD y DLI Estimados en Canopia:** **~${objetivos.ppfdEstimadoSala ?? '-'} µmol·m⁻²·s⁻¹** (DLI **~${objetivos.dliEstimadoSala ?? '-'} mol·m⁻²·d⁻¹**).`,
      `- **Meta Oficial de ${protocolo.titulo}:** **${protocolo.ppfdRecomendado}** (${protocolo.dliRecomendado}).`,
      objetivos.ppfdEstimadoSala && objetivos.ppfdEstimadoSala > 950
        ? `- **⚠️ Recomendación USU:** Estás por encima de **950 µmol/m²/s**. Si inyectas **1000–1200 ppm de CO2** y mantienes **27–28°C / 60% HR**, tus plantas lo aprovecharán al máximo; si NO usas CO2 suplementario, atenúa los paneles al **75–80%** (o súbelos) para quedar cerca de **850–900 µmol/m²/s**.`
        : `- **✅ Intensidad dentro de rango manejable.** Mantén la canopia nivelada para uniformidad lumínica.`,
    ].join('\n');

    return {
      respuesta: respuestaLuz,
      accionesSugeridas: [objetivos.accionesSugeridas[0]],
      fuentesConocimiento,
      intencion,
      esSuficienteSinLLM: false,
    };
  }

  // CASO 1: Diagnóstico de síntomas según fisiología vegetal de Bruce Bugbee + Athena Handbook
  if (intencion === 'diagnostico_sintomas' && patologiasCoincidentes.length > 0) {
    const pat = patologiasCoincidentes[0];
    const acciones = [...pat.accionesCorrectivas, objetivos.accionesSugeridas[0]];
    const respuesta = [
      `🩺 **Diagnóstico Clínico — Protocolo Dr. Bruce Bugbee (USU) & Athena Ag (${pat.codigoKB})**`,
      ``,
      `### 1. Problema Identificado: **${pat.nombre}**`,
      `- **Cuadro clínico:** ${pat.sintomasVisuales}`,
      `- **Causa raíz (USU + Athena):** ${pat.causaRaiz}`,
      ``,
      `### 2. Protocolo de Corrección (${objetivos.sustratoDetectado.nombre})`,
      `**Intervención Athena Ag & Precisión USU:**`,
      ...pat.tratamientoMineral.map((p) => `- ${p}`),
      ``,
      `**Alternativa Orgánica / Biológica:**`,
      ...pat.tratamientoOrganico.map((p) => `- ${p}`),
      ``,
      `### 3. Parámetros Objetivos de Control (${protocolo.codigoKB})`,
      `- **pH Entrada:** ${objetivos.phObjetivo} · **EC Objetivo:** ${objetivos.ecObjetivo} mS/cm · **Crop Steering:** ${protocolo.tipoSteeringAthena}`,
      `- **Clima y VPD:** ${objetivos.vpdObjetivoActual} kPa (${enFlora
        ? `${objetivos.tempObjetivoFloracion}°C / ${objetivos.humedadObjetivoFloracion}% HR`
        : `${objetivos.tempObjetivoVegetacion}°C / ${objetivos.humedadObjetivoVegetacion}% HR`
      })`,
      `- **Prevención:** ${pat.prevencion}`,
      apuntesUsuario ? `\n📌 **Tus Apuntes Activos de la KB:** ${apuntesUsuario}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    return {
      respuesta,
      accionesSugeridas: acciones,
      fuentesConocimiento,
      intencion,
      esSuficienteSinLLM: !tieneImagenes,
    };
  }

  // CASO 2: Plan de Tareas / Crop Steering de la Etapa según Bruce Bugbee + Athena
  if (intencion === 'plan_tareas_acciones') {
    const respuesta = [
      `📅 **Protocolo Operativo — ${protocolo.titulo} (${protocolo.codigoKB})**`,
      ``,
      `### 🧭 Direccionamiento Athena Crop Steering: **${protocolo.tipoSteeringAthena}**`,
      `${protocolo.objetivoPrincipal}`,
      ``,
      `### 🔬 Directrices Científicas (Bugbee USU + Athena Ag)`,
      ...protocolo.reglasCriticas.map((r) => `- ${r}`),
      ``,
      `### 🧪 Orden de Mezcla y Metas de Tanque`,
      `- **Orden estricto:** 1º **Athena Balance** -> 2º **Pro Core** (o **Athena Fade** en sem 8-9) -> 3º **Pro Grow/Bloom** -> 4º **Athena Cleanse** (2-5 mL/gal).`,
      `- **Metas actuales:** pH **${objetivos.phObjetivo}** · EC **${objetivos.ecObjetivo} mS/cm** · PPFD **${protocolo.ppfdRecomendado}** (${protocolo.dliRecomendado}).`,
      apuntesUsuario ? `\n📌 **Tus Apuntes Activos de la KB:** ${apuntesUsuario}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    return {
      respuesta,
      accionesSugeridas: objetivos.accionesSugeridas,
      fuentesConocimiento,
      intencion,
      esSuficienteSinLLM: true,
    };
  }

  // CASO 3: Auditoría General de la Sala (SOLO si el usuario pide explícitamente auditar/resumen/estado/ficha)
  const pidioAuditoriaExplicita =
    mNorm.includes('audita') ||
    mNorm.includes('resumen') ||
    mNorm.includes('ficha') ||
    mNorm.includes('todos los parametros') ||
    mNorm.includes('como ves el cultivo') ||
    mNorm.includes('como esta el cultivo');

  if (pidioAuditoriaExplicita) {
    const respuesta = [
      `📊 **Auditoría Técnica Dr. Bruce Bugbee (USU) + Athena Ag (${protocolo.codigoKB})**`,
      ``,
      `Estado actual de **${contexto.nombre}** en **${protocolo.titulo}**:`,
      `- **💧 pH de Entrada (Athena Balance):** Meta **${objetivos.phObjetivo}** *(actual: ${contexto.phObjetivo ?? 'Sin definir'})*`,
      `- **⚡ EC Objetivo (${protocolo.tipoSteeringAthena}):** Meta **${objetivos.ecObjetivo} mS/cm** *(actual: ${contexto.ecObjetivo ?? 'Sin definir'})*`,
      `- **🌱 Clima Vegetación (Bajo LED):** Meta **${objetivos.tempObjetivoVegetacion}°C / ${objetivos.humedadObjetivoVegetacion}% HR** *(actual: ${contexto.tempObjetivoVegetacion
        ? `${contexto.tempObjetivoVegetacion}°C / ${contexto.humedadObjetivoVegetacion}%`
        : 'Sin definir'
      })*`,
      `- **🌸 Clima Floración (Bajo LED):** Meta **${objetivos.tempObjetivoFloracion}°C / ${objetivos.humedadObjetivoFloracion}% HR** *(actual: ${contexto.tempObjetivoFloracion
        ? `${contexto.tempObjetivoFloracion}°C / ${contexto.humedadObjetivoFloracion}%`
        : 'Sin definir'
      })*`,
      `- **☀️ Luz y Fotobiología (USU):** Sala con **~${objetivos.ppfdEstimadoSala ?? '-'} µmol/m²/s PPFD** (DLI ~${objetivos.dliEstimadoSala ?? '-'}) · Meta etapa: **${protocolo.ppfdRecomendado}**`,
      `- **🌬️ VPD Meta y Riego:** **${protocolo.vpdRango[0]}–${protocolo.vpdRango[1]} kPa** · Volumen estimado **~${objetivos.aguaDiariaObjetivo} L/día** (con 15–25% runoff)`,
      objetivos.alertasAuditoria.length > 0
        ? `\n### ⚠️ Observaciones Importantes en ${contexto.nombre}\n${objetivos.alertasAuditoria.map((a) => `- ${a}`).join('\n')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    return {
      respuesta,
      accionesSugeridas: objetivos.accionesSugeridas,
      fuentesConocimiento,
      intencion,
      esSuficienteSinLLM: false,
    };
  }

  // CASO 3.5: Temas Agronómicos Especializados (Poda/Defoliación, Fotoperíodo, Cosecha/Secado, Trasplante, Rizosfera)
  const temaEspecializado = resolverTemaAgronomicoLocal(mNorm, contexto, objetivos, protocolo);
  if (temaEspecializado) {
    return {
      respuesta: temaEspecializado.respuesta,
      accionesSugeridas: temaEspecializado.accionesSugeridas,
      fuentesConocimiento,
      intencion,
      esSuficienteSinLLM: true,
    };
  }

  // CASO 4: Conversación abierta / seguimiento cuando no coincide una regla fija
  const reglaClaveEtapa = protocolo.reglasCriticas[0] || protocolo.objetivoPrincipal;
  const respuestaConversacional = esContinuacion
    ? [
        `Sobre **${contexto.nombre}** (**${protocolo.titulo}**):`,
        tieneTelemetriaPreviaClima
          ? `- Con la telemetría que venimos manejando (**${telemetria.temp ?? (enFlora ? objetivos.tempObjetivoFloracion : objetivos.tempObjetivoVegetacion)}°C**${telemetria.hr ? ` / **${telemetria.hr}% HR**` : ''}${telemetria.co2 ? ` / **${telemetria.co2} ppm CO2**` : ''}), el foco actual es **${protocolo.tipoSteeringAthena}**.`
          : `- **Foco actual (${protocolo.tipoSteeringAthena}):** ${reglaClaveEtapa}`,
        `- Puedo ayudarte con algo puntual sobre **poda/defoliación**, **riego por planta**, **clima/VPD**, **mezcla Athena**, **cosecha/secado** o **síntomas en hojas**. ¿Qué necesitas ajustar ahora?`,
      ].join('\n')
    : [
        `Estoy conectado a **${contexto.nombre}** (**${protocolo.titulo}** · **${protocolo.tipoSteeringAthena}**).`,
        `- **Prioridad actual:** ${reglaClaveEtapa}`,
        `- Pregúntame por **poda/defoliación**, **riego por planta**, **clima/VPD/CO2**, **mezcla Athena**, **cosecha/secado** o **síntomas en hojas** para darte indicaciones exactas.`,
      ].join('\n');

  return {
    respuesta: respuestaConversacional,
    accionesSugeridas: [],
    fuentesConocimiento,
    intencion,
    esSuficienteSinLLM: false,
  };
}

/**
 * Construye el Prompt RAG (Retrieval-Augmented Generation) que toma PRIMERO la referencia
 * de la Base de Conocimiento (Dr. Bruce Bugbee USU + Athena Ag + Reglas MongoDB) y le suma
 * TODO el Contexto Completo del Cultivo antes de usar tokens en el LLM.
 */
export function construirPromptComprimidoRAG(
  mensaje: string,
  contexto: ContextoCultivo,
  apuntesExtraDB?: string,
  historialReciente?: Array<{ tipo?: string; contenido?: string }>
): {
  systemPrompt: string;
  userPrompt: string;
  accionesKB: AccionConocimiento[];
  fuentesKB: string[];
} {
  const objetivos = calcularObjetivosAgronomicos(contexto);
  const protocolo = PROTOCOLOS_ETAPA_KB[objetivos.subEtapaActual];
  const patologias = buscarPatologiasKB(mensaje);
  const telemetria = extraerTelemetriaConversacion(mensaje, historialReciente);
  const mNorm = normalizarTextoConsulta(mensaje);
  const temaEspecializado = resolverTemaAgronomicoLocal(mNorm, contexto, objetivos, protocolo);
  const diasFlora = calcularDiasEnFloracion(contexto.fechaInicioFloracion);
  const apuntesCombinados = [obtenerApuntesPersonalizadosBugbee(), apuntesExtraDB]
    .filter(Boolean)
    .join(' | ');

  const patologiaSnippet =
    patologias.length > 0
      ? `PATOLOGIA_DETECTADA_KB(${patologias[0].codigoKB}): ${patologias[0].nombre} | Causa: ${patologias[0].causaRaiz} | Tratamiento: ${patologias[0].tratamientoMineral.join(' ')}`
      : '';

  const comentariosSnippet =
    contexto.comentariosRecientes && contexto.comentariosRecientes.length > 0
      ? `BITACORA_RECIENTE: ${contexto.comentariosRecientes
        .slice(0, 4)
        .map((c) => `[${c.fecha?.split('T')[0] || ''} - ${c.tipo}] ${c.titulo}: ${c.contenido.substring(0, 90)}`)
        .join(' | ')}`
      : '';

  const datosReportadosEnCharla = [
    telemetria.temp !== undefined ? `Temp_Actual_Reportada=${telemetria.temp}°C` : '',
    telemetria.hr !== undefined ? `HR_Actual_Reportada=${telemetria.hr}%` : '',
    telemetria.co2 !== undefined ? `CO2_Reportado=${telemetria.co2}ppm` : '',
    telemetria.ph !== undefined ? `pH_Reportado=${telemetria.ph}` : '',
    telemetria.ec !== undefined ? `EC_Reportada=${telemetria.ec}mS` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  const accionesDisponibles = [
    ...(temaEspecializado?.accionesSugeridas || []),
    ...patologias.flatMap((p) => p.accionesCorrectivas),
    ...objetivos.accionesSugeridas,
  ];

  const systemPrompt = [
    `Eres el Ingeniero Agrónomo Senior de CanopIA conversando en tiempo real con el cultivador de la sala "${contexto.nombre}".`,
    `REGLAS DE CONVERSACIÓN E INTELIGENCIA:`,
    `1. Responde con precisión técnica y profundidad práctica EXACTAMENTE a lo que preguntó el usuario (incluyendo preguntas sobre poda, defoliación, entrenamiento, cosecha, nutrición, riego, clima o plagas). Tolera errores de ortografía. PROHIBIDO responder con evasivas genéricas o volcar fichas completas no pedidas.`,
    `2. Cruza siempre tu respuesta con la etapa exacta (${protocolo.titulo}${diasFlora !== undefined ? `, Día ${diasFlora} de flora` : ''}), genética, sustrato y DATOS_REPORTADOS_EN_ESTA_CHARLA; da números, tiempos y pasos accionables.`,
    `3. Tu fuente de verdad científica es Dr. Bruce Bugbee (USU) y el Manual Oficial Athena Ag (Pro/Blended Line & Crop Steering).`,
    `4. Usa formato limpio con negritas (**) y viñetas (-). Prohibido usar tablas con barras "|".`,
    `--- 1. REFERENCIA DE BASE DE CONOCIMIENTO (${protocolo.codigoKB}) ---`,
    `ETAPA: ${protocolo.titulo} | STEERING_ATHENA: ${protocolo.tipoSteeringAthena}.`,
    `METAS_KB: pH=${objetivos.phObjetivo}, EC=${objetivos.ecObjetivo}mS (Runoff 15-25%), ClimaVege=${objetivos.tempObjetivoVegetacion}C/${objetivos.humedadObjetivoVegetacion}%, ClimaFlora=${objetivos.tempObjetivoFloracion}C/${objetivos.humedadObjetivoFloracion}% (o 27-28C/60%HR con CO2 1000-1200ppm), VPD=${protocolo.vpdRango[0]}-${protocolo.vpdRango[1]}kPa, PPFD=${protocolo.ppfdRecomendado}, Agua=~${objetivos.aguaDiariaObjetivo}L/dia.`,
    `REGLAS_KB: ${protocolo.reglasCriticas.join(' | ')}`,
    temaEspecializado ? temaEspecializado.resumenRAG : '',
    patologiaSnippet,
    apuntesCombinados ? `REGLAS_PERSONALIZADAS_DB: ${apuntesCombinados.substring(0, 300)}` : '',
    `--- 2. CONTEXTO COMPLETO DEL CULTIVO ACTUAL ---`,
    `DATOS_SALA: Nombre="${contexto.nombre}" | Genética="${contexto.genetica || 'No especificada'}" (${objetivos.geneticaDetectada}) | Sustrato="${contexto.sustrato || 'Tierra'}" (${objetivos.sustratoDetectado.nombre}) | InicioVege=${contexto.fechaComienzo || 'N/A'} | InicioFlora=${contexto.fechaInicioFloracion || 'En Vegetación'} | DíasTotales=${contexto.diasDesdeInicio ?? '?'}d${diasFlora !== undefined ? ` | DíasFlora=${diasFlora}d` : ''}.`,
    `FISICA_SALA: Área=${contexto.metrosCuadrados ?? '?'}m2 | Plantas=${contexto.numeroplantas ?? '?'} (${contexto.plantasPorM2 ? Number(contexto.plantasPorM2).toFixed(1) : '?'}/m2) | Macetas=${contexto.litrosMaceta ?? '?'}L (Total=${contexto.litrosTotales ?? '?'}L) | Luz=${contexto.potenciaLamparas ?? '?'}W (${contexto.wattsPorM2 ? Math.round(contexto.wattsPorM2) : '?'}W/m2 -> PPFD_Est=${objetivos.ppfdEstimadoSala ?? '?'}umol/m2/s, DLI_Est=${objetivos.dliEstimadoSala ?? '?'}mol/m2/d).`,
    `CONFIG_GUARDADA_SALA: pH=${contexto.phObjetivo ?? 'Sin definir'}, EC=${contexto.ecObjetivo ?? 'Sin definir'}, ClimaVege=${contexto.tempObjetivoVegetacion ?? '?'}C/${contexto.humedadObjetivoVegetacion ?? '?'}%, ClimaFlora=${contexto.tempObjetivoFloracion ?? '?'}C/${contexto.humedadObjetivoFloracion ?? '?'}%.`,
    datosReportadosEnCharla ? `DATOS_REPORTADOS_EN_ESTA_CHARLA: ${datosReportadosEnCharla}` : '',
    contexto.notas ? `NOTAS_OPERATIVAS_SALA: ${contexto.notas.substring(0, 250)}` : '',
    comentariosSnippet,
  ]
    .filter(Boolean)
    .join('\n');

  const fuentesKB = [
    `Bruce Bugbee (USU) + Athena Ag: ${protocolo.codigoKB}`,
    `Steering: ${protocolo.tipoSteeringAthena}`,
    ...patologias.map((p) => `${p.codigoKB}: ${p.nombre}`),
  ];

  return {
    systemPrompt,
    userPrompt: mensaje,
    accionesKB: accionesDisponibles,
    fuentesKB,
  };
}
