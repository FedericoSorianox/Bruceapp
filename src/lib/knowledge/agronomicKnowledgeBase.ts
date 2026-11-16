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

  const resumenExplicativo = `Protocolo Bugbee + Athena (${protocoloEtapa.codigoKB} · Steering ${protocoloEtapa.tipoSteeringAthena} · Sem ${semanaFase} ${
    faseGeneral === 'floracion' ? 'Flora' : 'Vege'
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
  const norm = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

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
    m.includes('tarea') ||
    m.includes('accion') ||
    m.includes('que hacer') ||
    m.includes('que le hago') ||
    m.includes('planifica') ||
    m.includes('calendario') ||
    m.includes('checklist') ||
    m.includes('semana') ||
    m.includes('steering') ||
    m.includes('dryback')
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
 * Construye una respuesta determinística completa desde el Corpus Bruce Bugbee + Athena Ag (0 Tokens)
 */
export function generarRespuestaConocimientoLocal(
  mensaje: string,
  contexto: ContextoCultivo,
  tieneImagenes: boolean = false
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

  const fuentesConocimiento: string[] = [
    `Bruce Bugbee (USU) + Athena Ag: ${protocolo.codigoKB}`,
    `Steering: ${protocolo.tipoSteeringAthena}`,
  ];
  for (const pat of patologiasCoincidentes) {
    fuentesConocimiento.push(`${pat.codigoKB}: ${pat.nombre}`);
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
      `- **pH Entrada:** ${objetivos.phObjetivo} | **EC Objetivo:** ${objetivos.ecObjetivo} mS/cm | **Crop Steering:** ${protocolo.tipoSteeringAthena}`,
      `- **Clima y VPD:** ${objetivos.vpdObjetivoActual} kPa (${
        objetivos.subEtapaActual.includes('flora') || objetivos.subEtapaActual === 'stretch_preflora'
          ? `${objetivos.tempObjetivoFloracion}°C / ${objetivos.humedadObjetivoFloracion}% HR`
          : `${objetivos.tempObjetivoVegetacion}°C / ${objetivos.humedadObjetivoVegetacion}% HR`
      })`,
      `- **Prevención:** ${pat.prevencion}`,
      apuntesUsuario ? `\n📌 **Tus Apuntes Activos de la KB:** ${apuntesUsuario}` : '',
      ``,
      `👇 *Ejecuta o agenda las acciones oficiales del protocolo con 1 clic:*`,
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
      `*Fuentes: Dr. Bruce Bugbee (Utah State University) & Athena Ag Official Handbook*`,
      ``,
      `### 🧭 Direccionamiento de Cultivo (Athena Crop Steering): **${protocolo.tipoSteeringAthena}**`,
      `${protocolo.objetivoPrincipal}`,
      ``,
      `### 🔬 Directrices Científicas (Bugbee USU + Athena Ag)`,
      ...protocolo.reglasCriticas.map((r) => `- ${r}`),
      ``,
      `### 🛠️ Acciones Estandarizadas para ${contexto.nombre}`,
      ...protocolo.tareasEstandar.map(
        (t, idx) => `${idx + 1}. **[${t.codigoKB}] ${t.titulo}** — *${t.descripcion}*`
      ),
      ``,
      `### 🧪 Orden de Mezcla y Parámetros de Tanque Athena`,
      `- **Orden estricto:** 1º **Athena Balance** -> 2º **Pro Core** (o **Athena Fade** en sem 8-9) -> 3º **Pro Grow/Bloom** -> 4º **Athena Cleanse** (2-5 mL/gal).`,
      `- **Metas:** pH **${objetivos.phObjetivo}** · EC **${objetivos.ecObjetivo} mS/cm** · PPFD **${protocolo.ppfdRecomendado}** (${protocolo.dliRecomendado}).`,
      apuntesUsuario ? `\n📌 **Tus Apuntes Activos de la KB:** ${apuntesUsuario}` : '',
      ``,
      `👇 *Haz clic abajo para agendar estas tareas en tu Calendario o sincronizar los parámetros de la sala:*`,
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

  // CASO 3: Auditoría de Parámetros (Bruce Bugbee 9 Cardinal Parameters + Athena Handbook)
  if (intencion === 'parametros_nutricion_clima' || intencion === 'auditoria_general') {
    const respuesta = [
      `📊 **Auditoría Técnica Dr. Bruce Bugbee (USU) + Athena Ag (${protocolo.codigoKB})**`,
      ``,
      `Análisis para **${contexto.nombre}** en **${objetivos.sustratoDetectado.nombre}** (${protocolo.titulo}):`,
      ``,
      `| Parámetro (Bugbee USU / Athena) | Meta Oficial KB | Configuración Actual |`,
      `| :--- | :--- | :--- |`,
      `| **pH de Entrada (Athena Balance)** | **${objetivos.phObjetivo}** *(rango 5.6–6.2)* | ${contexto.phObjetivo ?? 'Sin definir'} |`,
      `| **EC Objetivo (Athena / USU)** | **${objetivos.ecObjetivo} mS/cm** | ${contexto.ecObjetivo ?? 'Sin definir'} |`,
      `| **Modo Crop Steering Athena** | **${protocolo.tipoSteeringAthena}** | ${
        protocolo.tipoSteeringAthena.includes('Generativo')
          ? 'Dryback 40–50% VWC'
          : 'Dryback 20–30% VWC'
      } |`,
      `| **Clima Vegetación (Bajo LED)** | **${objetivos.tempObjetivoVegetacion}°C / ${objetivos.humedadObjetivoVegetacion}% HR** | ${
        contexto.tempObjetivoVegetacion
          ? `${contexto.tempObjetivoVegetacion}°C / ${contexto.humedadObjetivoVegetacion}%`
          : 'Sin definir'
      } |`,
      `| **Clima Floración (Bajo LED)** | **${objetivos.tempObjetivoFloracion}°C / ${objetivos.humedadObjetivoFloracion}% HR** | ${
        contexto.tempObjetivoFloracion
          ? `${contexto.tempObjetivoFloracion}°C / ${contexto.humedadObjetivoFloracion}%`
          : 'Sin definir'
      } |`,
      `| **PPFD / DLI (Física USU)** | **${protocolo.ppfdRecomendado}** (${protocolo.dliRecomendado}) | ${
        objetivos.ppfdEstimadoSala
          ? `~${objetivos.ppfdEstimadoSala} µmol/m²/s (DLI ~${objetivos.dliEstimadoSala})`
          : 'Sin datos de W/m²'
      } |`,
      `| **VPD Meta / Fotoperíodo** | **${protocolo.vpdRango[0]}–${protocolo.vpdRango[1]} kPa** | ${protocolo.fotoperiodo} |`,
      `| **Volumen Riego (15-25% Runoff)** | **~${objetivos.aguaDiariaObjetivo} L/día** | ${contexto.numeroplantas || '-'} plantas × ${contexto.litrosMaceta || '-'}L |`,
      ``,
      `### 🧪 Regla de Tanque Athena & Riego USU`,
      `- **Orden de mezcla:** 1º Athena Balance (Silicio) -> 2º Pro Core (60% de Base, o Athena Fade en sem finales) -> 3º Pro Grow/Bloom -> 4º Athena Cleanse (2-5 mL/gal).`,
      `- **Manejo del sustrato:** ${objetivos.sustratoDetectado.frecuenciaRiegoNota}`,
      ``,
      objetivos.alertasAuditoria.length > 0
        ? `### ⚠️ Observaciones de Auditoría\n${objetivos.alertasAuditoria.map((a) => `- ${a}`).join('\n')}\n`
        : '',
      apuntesUsuario ? `📌 **Tus Apuntes Activos de la KB:** ${apuntesUsuario}\n` : '',
      `👇 *Aplica los parámetros de Bruce Bugbee + Athena o agenda las tareas del protocolo con 1 clic:*`,
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

  // CASO 4: Consulta abierta
  const respuestaFallback = [
    `🎓 **Motor Agronómico CanopIA — Dr. Bruce Bugbee (USU) + Athena Ag (${protocolo.codigoKB})**`,
    ``,
    `Para **${contexto.nombre}** (${objetivos.sustratoDetectado.nombre}, etapa **${protocolo.titulo}**):`,
    ``,
    `- **Parámetros Oficiales:** pH **${objetivos.phObjetivo}** · EC **${objetivos.ecObjetivo} mS/cm** · Steering **${protocolo.tipoSteeringAthena}** · VPD **${protocolo.vpdRango[0]}–${protocolo.vpdRango[1]} kPa**.`,
    `- **Orden de Mezcla Athena:** 1º Balance -> 2º Core (o Fade en sem 8-9) -> 3º Grow/Bloom -> 4º Cleanse (2-5 mL/gal).`,
    ``,
    `### 📋 Reglas Críticas (USU + Athena Handbook)`,
    ...protocolo.reglasCriticas.map((r) => `- ${r}`),
    apuntesUsuario ? `\n📌 **Tus Apuntes Activos de la KB:** ${apuntesUsuario}` : '',
    ``,
    `👇 *Acciones recomendadas desde la Base de Conocimiento:*`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    respuesta: respuestaFallback,
    accionesSugeridas: objetivos.accionesSugeridas,
    fuentesConocimiento,
    intencion,
    esSuficienteSinLLM: false,
  };
}

/**
 * Construye un prompt ultra-comprimido (<190 tokens) inyectando estrictamente la doctrina de
 * Dr. Bruce Bugbee (Utah State University) + Athena Ag Official Handbook.
 */
export function construirPromptComprimidoRAG(
  mensaje: string,
  contexto: ContextoCultivo
): {
  systemPrompt: string;
  userPrompt: string;
  accionesKB: AccionConocimiento[];
  fuentesKB: string[];
} {
  const objetivos = calcularObjetivosAgronomicos(contexto);
  const protocolo = PROTOCOLOS_ETAPA_KB[objetivos.subEtapaActual];
  const patologias = buscarPatologiasKB(mensaje);
  const apuntesUsuario = obtenerApuntesPersonalizadosBugbee();

  const patologiaSnippet =
    patologias.length > 0
      ? `PATOLOGIA_KB(${patologias[0].codigoKB}): ${patologias[0].nombre} | Causa: ${patologias[0].causaRaiz} | Solucion: ${patologias[0].tratamientoMineral[0]}`
      : '';

  const accionesDisponibles = [
    ...patologias.flatMap((p) => p.accionesCorrectivas),
    ...objetivos.accionesSugeridas,
  ];

  const systemPrompt = [
    `Motor CanopIA basado 100% en Dr. Bruce Bugbee (USU) y Manual Athena Ag (Pro/Blended & Crop Steering). Máx 160 palabras.`,
    `SALA: "${contexto.nombre}" | Sust:${objetivos.sustratoDetectado.id} | Etapa:${protocolo.codigoKB} | Steering:${protocolo.tipoSteeringAthena} | PPFD:${objetivos.ppfdEstimadoSala || '?'}umol.`,
    `METAS: pH=${objetivos.phObjetivo} (Mezcla Athena: 1ºBalance->2ºCore->3ºGrow/Bloom/Fade->4ºCleanse), EC=${objetivos.ecObjetivo}mS (Runoff 15-25%), Vege=${objetivos.tempObjetivoVegetacion}C/${objetivos.humedadObjetivoVegetacion}%, Flora=${objetivos.tempObjetivoFloracion}C/${objetivos.humedadObjetivoFloracion}%, VPD=${protocolo.vpdRango[0]}-${protocolo.vpdRango[1]}kPa.`,
    `REGLAS: ${protocolo.reglasCriticas.map((r) => r.substring(0, 120)).join(' | ')}`,
    patologiaSnippet,
    apuntesUsuario ? `APUNTES_USUARIO: ${apuntesUsuario.substring(0, 200)}` : '',
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
