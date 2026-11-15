/**
 * Base de Conocimiento Agronómica Estructurada (CanopIA Knowledge Engine)
 *
 * Propósito:
 * 1. Garantizar consistencia científica 100% en recomendaciones de pH, EC, Temperatura, Humedad, VPD y Riego.
 * 2. Reducir drásticamente el consumo de tokens (0 tokens en cálculos determinísticos y autocompletado;
 *    Micro-RAG comprimido <200 tokens en consultas abiertas al LLM).
 * 3. Proveer un catálogo único de Acciones Estandarizadas (Tareas y Ajustes de Sala) para que las acciones
 *    sugeridas al usuario siempre salgan de esta fuente de verdad.
 */

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
  factorRetencionAgua: number; // Multiplicador de volumen por litro de maceta
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
  vpdRango: [number, number];
  tempDiaNoche: { dia: [number, number]; noche: [number, number] };
  humedadRango: [number, number];
  fotoperiodo: string;
  ppfdRecomendado: string;
  reglasCriticas: string[];
  tareasEstandar: AccionConocimiento[];
}

/**
 * 1. TABLA MAESTRA DE SUSTRATOS (Fuente de Verdad de pH y EC base en mS/cm)
 */
export const PERFILES_SUSTRATO_KB: Record<TipoSustratoKB, PerfilSustrato> = {
  coco: {
    id: 'coco',
    nombre: 'Fibra de Coco / Coco + Perlita',
    descripcion: 'Medio inerte de alta oxigenación radicular. Requiere aporte constante de Calcio/Magnesio y pH ligeramente más ácido.',
    phPorEtapa: {
      germinacion_esquejes: 5.7,
      vegetacion_temprana: 5.8,
      vegetacion_avanzada: 5.9,
      stretch_preflora: 6.0,
      floracion_temprana: 6.0,
      floracion_engorde: 6.1,
      lavado_maduracion: 6.2,
    },
    ecPorEtapa: {
      germinacion_esquejes: 0.6,
      vegetacion_temprana: 1.1,
      vegetacion_avanzada: 1.4,
      stretch_preflora: 1.6,
      floracion_temprana: 1.8,
      floracion_engorde: 2.1,
      lavado_maduracion: 0.4,
    },
    frecuenciaRiegoNota: 'Riego frecuente (1 a 3 pulsos diarios en flora) asegurando 15-20% de drenaje (runoff) para evitar acumulación de sales.',
    factorRetencionAgua: 0.22,
  },
  hidro: {
    id: 'hidro',
    nombre: 'Hidroponía (DWC / RDWC / NFT / Lana de Roca)',
    descripcion: 'Asimilación directa en solución nutritiva. Exige control estricto de pH (5.5 - 6.0) y temperatura de agua (18-20°C).',
    phPorEtapa: {
      germinacion_esquejes: 5.6,
      vegetacion_temprana: 5.7,
      vegetacion_avanzada: 5.8,
      stretch_preflora: 5.8,
      floracion_temprana: 5.9,
      floracion_engorde: 6.0,
      lavado_maduracion: 6.0,
    },
    ecPorEtapa: {
      germinacion_esquejes: 0.5,
      vegetacion_temprana: 1.0,
      vegetacion_avanzada: 1.3,
      stretch_preflora: 1.5,
      floracion_temprana: 1.6,
      floracion_engorde: 1.9,
      lavado_maduracion: 0.3,
    },
    frecuenciaRiegoNota: 'Recirculación continua o pulsos automatizados. Cambiar solución del reservorio cada 7-10 días.',
    factorRetencionAgua: 0.25,
  },
  living_soil: {
    id: 'living_soil',
    nombre: 'Suelo Vivo / Orgánico (Living Soil / Super Soil)',
    descripcion: 'Ecosistema microbiológico activo. El pH se autorregula parcialmente pero el agua declorada entre 6.2 y 6.6 maximiza la vida microbiana.',
    phPorEtapa: {
      germinacion_esquejes: 6.3,
      vegetacion_temprana: 6.4,
      vegetacion_avanzada: 6.4,
      stretch_preflora: 6.5,
      floracion_temprana: 6.5,
      floracion_engorde: 6.6,
      lavado_maduracion: 6.5,
    },
    ecPorEtapa: {
      germinacion_esquejes: 0.4,
      vegetacion_temprana: 0.7,
      vegetacion_avanzada: 0.9,
      stretch_preflora: 1.1,
      floracion_temprana: 1.2,
      floracion_engorde: 1.4,
      lavado_maduracion: 0.3,
    },
    frecuenciaRiegoNota: 'Mantener humedad constante (30-40% capacidad de campo) sin drenaje excesivo para no lavar microbiología; usar tés aireados y top-dress.',
    factorRetencionAgua: 0.12,
  },
  tierra: {
    id: 'tierra',
    nombre: 'Sustrato Tradicional / Turba + Perlita (Light/All Mix)',
    descripcion: 'Capacidad tampón media-alta. Permite alternar riegos con fertilizante y riegos de agua ajustada.',
    phPorEtapa: {
      germinacion_esquejes: 6.0,
      vegetacion_temprana: 6.1,
      vegetacion_avanzada: 6.2,
      stretch_preflora: 6.3,
      floracion_temprana: 6.4,
      floracion_engorde: 6.5,
      lavado_maduracion: 6.4,
    },
    ecPorEtapa: {
      germinacion_esquejes: 0.5,
      vegetacion_temprana: 0.9,
      vegetacion_avanzada: 1.2,
      stretch_preflora: 1.4,
      floracion_temprana: 1.6,
      floracion_engorde: 1.8,
      lavado_maduracion: 0.4,
    },
    frecuenciaRiegoNota: 'Ciclo húmedo-seco controlado: regar al 15-20% del volumen de maceta cuando los primeros 3 cm estén secos.',
    factorRetencionAgua: 0.16,
  },
};

/**
 * 2. PROTOCOLOS OPERATIVOS Y CLIMÁTICOS POR SUB-ETAPA FENOLÓGICA
 */
export const PROTOCOLOS_ETAPA_KB: Record<SubEtapaFenologicaKB, ProtocoloEtapaKB> = {
  germinacion_esquejes: {
    etapa: 'germinacion_esquejes',
    codigoKB: 'KB-STG-01-GERM',
    titulo: 'Germinación y Enraizamiento de Esquejes (Días 1-10)',
    objetivoPrincipal: 'Desarrollo radicular explosivo bajo baja demanda evaporativa (VPD bajo).',
    vpdRango: [0.4, 0.7],
    tempDiaNoche: { dia: [23, 26], noche: [20, 22] },
    humedadRango: [70, 80],
    fotoperiodo: '18/6',
    ppfdRecomendado: '150 - 300 µmol/m²/s',
    reglasCriticas: [
      'Evitar encharcamiento del medio para prevenir Pythium / Damping-off.',
      'Aplicar estimulador radicular (micorrizas / trichodermas) con EC muy baja (0.4 - 0.6 mS).',
      'Mantener humedad relativa alta (70-80%) hasta observar raíces activas.',
    ],
    tareasEstandar: [
      {
        id: 'act-germ-micorrizas',
        codigoKB: 'KB-ACT-GERM-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Inoculación radicular (Micorrizas y Trichodermas)',
        descripcion: 'Protocolo KB-STG-01: Aplicar bioestimulante radicular en riego ligero alrededor del tallo con pH ajustado y EC <= 0.6 mS.',
        categoriaTarea: 'fertilizacion',
        prioridad: 'alta',
        diasOffset: 0,
        duracionEstimada: 20,
      },
      {
        id: 'act-germ-domo',
        codigoKB: 'KB-ACT-GERM-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Control de humedad y ventilación de plántulas/esquejes',
        descripcion: 'Protocolo KB-STG-01: Verificar HR en 75% y temperatura en 24-25°C (VPD 0.5-0.7 kPa).',
        categoriaTarea: 'monitoreo',
        prioridad: 'media',
        diasOffset: 1,
        duracionEstimada: 15,
      },
    ],
  },
  vegetacion_temprana: {
    etapa: 'vegetacion_temprana',
    codigoKB: 'KB-STG-02-VEG1',
    titulo: 'Vegetación Temprana (Semanas 2-3)',
    objetivoPrincipal: 'Construcción de estructura nodal, masa foliar inicial y colonización de maceta.',
    vpdRango: [0.8, 1.0],
    tempDiaNoche: { dia: [24, 27], noche: [20, 22] },
    humedadRango: [60, 70],
    fotoperiodo: '18/6',
    ppfdRecomendado: '350 - 550 µmol/m²/s',
    reglasCriticas: [
      'Incrementar nitrógeno y calcio progresivamente según tabla de sustrato.',
      'Iniciar preventivo biológico foliar (Aceite de Neem / Jabón Potásico / Beauveria) cada 7-10 días.',
      'Preparar primera poda apical o entrenamiento LST a partir del 4º-5º nudo real.',
    ],
    tareasEstandar: [
      {
        id: 'act-veg1-preventivo',
        codigoKB: 'KB-ACT-VEG1-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Aplicación de Preventivo Entomológico Foliar (MIP)',
        descripcion: 'Protocolo KB-STG-02: Pulverizar envés y haz de hojas con preventivo biológico antes del apagado de luces para prevenir Trips y Araña Roja.',
        categoriaTarea: 'mantenimiento',
        prioridad: 'alta',
        diasOffset: 0,
        duracionEstimada: 30,
      },
      {
        id: 'act-veg1-poda',
        codigoKB: 'KB-ACT-VEG1-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Poda Apical / Inicio de LST (4º-5º nudo)',
        descripcion: 'Protocolo KB-STG-02: Realizar corte apical limpio con tijera desinfectada o sujetar ramas laterales para homogeneizar la canopia.',
        categoriaTarea: 'poda',
        prioridad: 'media',
        diasOffset: 2,
        duracionEstimada: 40,
      },
    ],
  },
  vegetacion_avanzada: {
    etapa: 'vegetacion_avanzada',
    codigoKB: 'KB-STG-03-VEG2',
    titulo: 'Vegetación Avanzada y Pre-transición (Semana 4+)',
    objetivoPrincipal: 'Cerrar el 75-80% de la malla/espacio de cultivo y sanear bajos antes de pasar a 12/12.',
    vpdRango: [0.9, 1.2],
    tempDiaNoche: { dia: [24, 27], noche: [19, 22] },
    humedadRango: [55, 65],
    fotoperiodo: '18/6',
    ppfdRecomendado: '500 - 700 µmol/m²/s',
    reglasCriticas: [
      'Realizar limpieza de tercio inferior (Lollipopping ligero) 5-7 días antes de pasar a floración.',
      'Medir EC y pH del drenaje (runoff) para confirmar ausencia de sales acumuladas antes del cambio a 12/12.',
      'Cuando la canopia cubra el 75% del área útil, programar el cambio a fotoperíodo 12/12.',
    ],
    tareasEstandar: [
      {
        id: 'act-veg2-lollipop',
        codigoKB: 'KB-ACT-VEG2-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Poda de bajos pre-floración y colocación de red SCROG',
        descripcion: 'Protocolo KB-STG-03: Despejar el 25-30% inferior de las plantas para mejorar flujo de aire intracanopia y distribuir puntas en la red.',
        categoriaTarea: 'poda',
        prioridad: 'alta',
        diasOffset: 0,
        duracionEstimada: 45,
      },
      {
        id: 'act-veg2-runoff',
        codigoKB: 'KB-ACT-VEG2-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Auditoría de pH y EC de drenaje (Runoff Pre-Flora)',
        descripcion: 'Protocolo KB-STG-03: Verificar que la EC de salida no supere en más de +0.3 mS la EC de entrada antes de cambiar a 12/12.',
        categoriaTarea: 'riego',
        prioridad: 'alta',
        diasOffset: 1,
        duracionEstimada: 25,
      },
    ],
  },
  stretch_preflora: {
    etapa: 'stretch_preflora',
    codigoKB: 'KB-STG-04-STRETCH',
    titulo: 'Transición y Estiramiento / Stretch (Semanas 1-2 de Floración)',
    objetivoPrincipal: 'Sostener la duplicación vegetativa de altura e inducir botones florales sin deficiencias de Ca/Mg/N.',
    vpdRango: [1.0, 1.3],
    tempDiaNoche: { dia: [23, 26], noche: [19, 21] },
    humedadRango: [50, 60],
    fotoperiodo: '12/12',
    ppfdRecomendado: '650 - 850 µmol/m²/s',
    reglasCriticas: [
      'NO cortar el nitrógeno de golpe en las semanas 1-2 de 12/12; usar nutrición de transición más refuerzo de CaMg.',
      'Mantener diferencial térmico día/noche bajo (2-4°C) para evitar elongación internodal excesiva.',
      'Última ventana para aplicar preventivos foliares antes de que cierren los botones florales.',
    ],
    tareasEstandar: [
      {
        id: 'act-stretch-guiado',
        codigoKB: 'KB-ACT-STR-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Guiado de ramas en malla SCROG y ajuste de altura de luminarias',
        descripcion: 'Protocolo KB-STG-04: Nivelar puntas principales durante el estiramiento y mantener distancia óptima de paneles LED.',
        categoriaTarea: 'mantenimiento',
        prioridad: 'alta',
        diasOffset: 0,
        duracionEstimada: 35,
      },
      {
        id: 'act-stretch-defoliacion21',
        codigoKB: 'KB-ACT-STR-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Defoliación Estratégica Día 21 de Floración (Schwazzing moderado)',
        descripcion: 'Protocolo KB-STG-04: Retirar hojas satélite grandes que tapen cogollos medios y limpiar brotes bajos improductivos.',
        categoriaTarea: 'poda',
        prioridad: 'alta',
        diasOffset: 3,
        duracionEstimada: 50,
      },
    ],
  },
  floracion_temprana: {
    etapa: 'floracion_temprana',
    codigoKB: 'KB-STG-05-FLORA1',
    titulo: 'Floración Plena y Formación de Cálices (Semanas 3-5 de Floración)',
    objetivoPrincipal: 'Maximizar formación de cálices, producción temprana de tricomas y asimilación de Fósforo y Potasio.',
    vpdRango: [1.1, 1.4],
    tempDiaNoche: { dia: [22, 26], noche: [18, 21] },
    humedadRango: [45, 55],
    fotoperiodo: '12/12',
    ppfdRecomendado: '800 - 1000 µmol/m²/s',
    reglasCriticas: [
      'Prohibido pulverizar flores. Toda aplicación debe ser vía radicular.',
      'Introducir estimulador de floración y base de flora aumentando relación P-K.',
      'Reducir humedad relativa al 48-52% para mantener VPD en 1.2 - 1.4 kPa.',
    ],
    tareasEstandar: [
      {
        id: 'act-flora1-pk',
        codigoKB: 'KB-ACT-FLO1-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Riego con Base de Floración + Bioestimulador Floral',
        descripcion: 'Protocolo KB-STG-05: Ajustar solución nutritiva a la EC y pH objetivo de floración plena y medir drenaje.',
        categoriaTarea: 'fertilizacion',
        prioridad: 'alta',
        diasOffset: 0,
        duracionEstimada: 30,
      },
      {
        id: 'act-flora1-clima',
        codigoKB: 'KB-ACT-FLO1-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Inspección de ventilación intracanopia y deshumidificación',
        descripcion: 'Protocolo KB-STG-05: Verificar que no existan bolsas de humedad >55% entre las colas florales.',
        categoriaTarea: 'monitoreo',
        prioridad: 'media',
        diasOffset: 2,
        duracionEstimada: 20,
      },
    ],
  },
  floracion_engorde: {
    etapa: 'floracion_engorde',
    codigoKB: 'KB-STG-06-FLORA2',
    titulo: 'Engorde Floral y Densificación (Semanas 6-7 de Floración)',
    objetivoPrincipal: 'Máximo peso seco, densidad de cogollos y síntesis de terpenos previniendo Botrytis.',
    vpdRango: [1.2, 1.5],
    tempDiaNoche: { dia: [20, 24], noche: [17, 20] },
    humedadRango: [40, 48],
    fotoperiodo: '12/12',
    ppfdRecomendado: '800 - 950 µmol/m²/s',
    reglasCriticas: [
      'Pico de demanda de Potasio y Fósforo (PK Booster) y carbohidratos; vigilar puntas de hojas para no quemar por exceso de sales.',
      'CRÍTICO: Humedad relativa estrictamente <= 45-48% (especialmente en período nocturno) para impedir Botrytis cinerea.',
      'Reducir temperatura diurna a 21-24°C para preservar monoterpenos volátiles.',
    ],
    tareasEstandar: [
      {
        id: 'act-flora2-botrytis',
        codigoKB: 'KB-ACT-FLO2-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Inspección preventiva de Botrytis en colas principales y control HR <45%',
        descripcion: 'Protocolo KB-STG-06: Revisar visualmente las flores más densas y asegurar extracción/deshumidificación nocturna activa.',
        categoriaTarea: 'monitoreo',
        prioridad: 'urgente',
        diasOffset: 0,
        duracionEstimada: 25,
      },
      {
        id: 'act-flora2-pkbooster',
        codigoKB: 'KB-ACT-FLO2-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Aplicación de Engorde PK y control de EC de salida',
        descripcion: 'Protocolo KB-STG-06: Suministrar pico de PK según tabla del sustrato evitando sobrepasar la EC máxima.',
        categoriaTarea: 'fertilizacion',
        prioridad: 'alta',
        diasOffset: 1,
        duracionEstimada: 30,
      },
    ],
  },
  lavado_maduracion: {
    etapa: 'lavado_maduracion',
    codigoKB: 'KB-STG-07-FLUSH',
    titulo: 'Maduración de Tricomas y Lavado de Raíces (Semana 8+ de Floración)',
    objetivoPrincipal: 'Senescencia limpia, degradación de clorofila/nitratos residuales y cosecha en el punto exacto de tricomas.',
    vpdRango: [1.3, 1.6],
    tempDiaNoche: { dia: [18, 22], noche: [15, 18] },
    humedadRango: [35, 45],
    fotoperiodo: '12/12',
    ppfdRecomendado: '600 - 750 µmol/m²/s (Reducir 20% intensidad)',
    reglasCriticas: [
      'Suspender fertilizantes minerales 10-14 días antes del corte; regar solo con agua osmotizada/declorada a pH ajustado (EC < 0.4 mS).',
      'Monitorear tricomas en cáliz (no en hojas de azúcar): punto óptimo general 80% lechosos / 15-20% ámbar.',
      'Bajar temperatura nocturna a 16-18°C para estimular antocianinas y preservar perfil terpénico.',
    ],
    tareasEstandar: [
      {
        id: 'act-flush-riego',
        codigoKB: 'KB-ACT-FLU-01',
        tipoAccion: 'crear_tarea',
        titulo: 'Lavado de raíces / Riego de limpieza final (EC < 0.4 mS)',
        descripcion: 'Protocolo KB-STG-07: Regar únicamente con agua a pH ajustado hasta que el drenaje marque < 0.5 mS.',
        categoriaTarea: 'riego',
        prioridad: 'alta',
        diasOffset: 0,
        duracionEstimada: 35,
      },
      {
        id: 'act-flush-tricomas',
        codigoKB: 'KB-ACT-FLU-02',
        tipoAccion: 'crear_tarea',
        titulo: 'Muestreo óptico de Tricomas (60x) y programación de cosecha',
        descripcion: 'Protocolo KB-STG-07: Evaluar proporción de tricomas transparentes, lechosos y ámbar en cálices superiores y medios.',
        categoriaTarea: 'cosecha',
        prioridad: 'urgente',
        diasOffset: 2,
        duracionEstimada: 20,
      },
    ],
  },
};

/**
 * 3. CATÁLOGO CLÍNICO DE PATOLOGÍAS, DEFICIENCIAS, EXCESOS Y PLAGAS (Doctor IA & Chat IA)
 */
export const PATOLOGIAS_KB: PatologiaKB[] = [
  {
    id: 'deficiencia_calcio_magnesio',
    codigoKB: 'KB-PAT-CALMAG',
    nombre: 'Deficiencia de Calcio y/o Magnesio (Ca/Mg)',
    categoria: 'deficiencia',
    keywords: ['manchas oxido', 'óxido', 'marrones', 'clorosis intervenal', 'calcio', 'magnesio', 'calmag', 'nervaduras verdes', 'hojas medias'],
    sintomasVisuales: 'Manchas necróticas color óxido/marrón en hojas de la zona media-alta (Calcio) acompañadas de amarilleamiento entre las venas manteniendo las nervaduras verdes en hojas medias-bajas (Magnesio).',
    causaRaiz: 'Muy frecuente en sustrato Coco o bajo paneles LED de alta eficiencia, o por pH por debajo de 5.7 en tierra/coco que bloquea la absorción de Ca y Mg.',
    tratamientoMineral: [
      'Suplementar con CalMag en cada riego hasta llevar la EC base del agua a 0.4 mS antes de agregar nutrientes base.',
      'Ajustar el pH de entrada a 6.0 - 6.2 (óptimo de absorción de Ca y Mg).',
      'Revisar que el VPD no esté bloqueado (< 0.7 kPa), ya que el Calcio se transporta exclusivamente por el flujo de transpiración.',
    ],
    tratamientoOrganico: [
      'Aplicar calcio soluble en agua (WCA) o dolomita/aminoácidos con calcio y sulfato de magnesio (Sales de Epsom: 0.5 g/L).',
      'Mejorar flujo de aire para activar la transpiración estomática.',
    ],
    prevencion: 'Taponar (buffering) siempre la fibra de coco con CalMag y mantener VPD entre 0.9 y 1.3 kPa.',
    accionesCorrectivas: [
      {
        id: 'act-pat-calmag-1',
        codigoKB: 'KB-ACT-CORR-CALMAG',
        tipoAccion: 'crear_tarea',
        titulo: 'Corrección de Ca/Mg: Riego con suplemento CalMag y ajuste pH 6.1',
        descripcion: 'Protocolo KB-PAT-CALMAG: Preparar agua base con CalMag (0.4 mS), añadir base nutricional y regar a pH 6.1 verificando drenaje.',
        categoriaTarea: 'fertilizacion',
        prioridad: 'urgente',
        diasOffset: 0,
        duracionEstimada: 30,
      },
    ],
  },
  {
    id: 'deficiencia_nitrogeno',
    codigoKB: 'KB-PAT-NITRO',
    nombre: 'Deficiencia de Nitrógeno (N)',
    categoria: 'deficiencia',
    keywords: ['hojas bajas amarillas', 'amarilleamiento inferior', 'amarillas abajo', 'nitrogeno', 'palidas', 'caida hojas bajas'],
    sintomasVisuales: 'Amarilleamiento uniforme y progresivo que comienza en las hojas más viejas de la parte inferior y avanza hacia arriba (nutriente móvil).',
    causaRaiz: 'Aporte insuficiente de base vegetativa durante el crecimiento o corte prematuro del nitrógeno durante las primeras 2 semanas de floración (stretch). Nota: En semana 7-8 de floración es senescencia natural.',
    tratamientoMineral: [
      'Si está en vegetación o semanas 1-3 de flora: aumentar 0.2 - 0.3 mS la EC con fertilizante base rico en Nitrógeno nítrico/amoniacal.',
      'Verificar que el pH esté entre 5.8 y 6.3.',
    ],
    tratamientoOrganico: [
      'Aplicar hidrolizado de pescado, humus de lombriz líquido o aminoácidos libres en riego.',
    ],
    prevencion: 'Mantener aporte de nitrógeno durante las primeras 2 semanas del paso a 12/12.',
    accionesCorrectivas: [
      {
        id: 'act-pat-nitro-1',
        codigoKB: 'KB-ACT-CORR-NITRO',
        tipoAccion: 'crear_tarea',
        titulo: 'Refuerzo nutricional de Nitrógeno y verificación de pH',
        descripcion: 'Protocolo KB-PAT-NITRO: Aplicar riego con incremento de +0.2 mS de base rica en N o aminoácidos asimilables.',
        categoriaTarea: 'fertilizacion',
        prioridad: 'alta',
        diasOffset: 0,
        duracionEstimada: 25,
      },
    ],
  },
  {
    id: 'exceso_nutrientes_bloqueo',
    codigoKB: 'KB-PAT-OVERFERT',
    nombre: 'Exceso de Sales / Sobrefertilización (Toxicidad N o Bloqueo por EC)',
    categoria: 'exceso',
    keywords: ['puntas quemadas', 'garra', 'hojas en garra', 'verde muy oscuro', 'sobrefertilizacion', 'exceso', 'bloqueo', 'sales'],
    sintomasVisuales: 'Puntas de las hojas nuevas quemadas (amarillas/marrones), hojas verde oscuro brillante con las puntas curvadas hacia abajo en forma de "garra" (toxicidad por N) y bordes aserrados levantados.',
    causaRaiz: 'EC de riego demasiado alta o falta de drenaje (runoff < 15%) que provoca acumulación de sales en el sustrato y deshidratación osmótica.',
    tratamientoMineral: [
      'Realizar riego de lavado suave con agua a pH ajustado y EC baja (0.4 - 0.5 mS con enzimas) asegurando 30% de drenaje.',
      'Medir la EC del drenaje; en el siguiente riego reanudar nutrición al 70% de la dosis anterior.',
    ],
    tratamientoOrganico: [
      'Regar únicamente con agua declorada + enzimas / ácido húmico durante los próximos 2 riegos.',
    ],
    prevencion: 'Garantizar siempre 15-20% de drenaje en cada riego en coco/tierra mineral y medir EC de salida semanalmente.',
    accionesCorrectivas: [
      {
        id: 'act-pat-overfert-1',
        codigoKB: 'KB-ACT-CORR-FLUSH',
        tipoAccion: 'crear_tarea',
        titulo: 'Lavado osmótico correctivo con Enzimas y medición de Runoff',
        descripcion: 'Protocolo KB-PAT-OVERFERT: Regar con agua a pH óptimo + enzimas (EC 0.4 mS) con 30% de drenaje para arrastrar exceso de sales.',
        categoriaTarea: 'riego',
        prioridad: 'urgente',
        diasOffset: 0,
        duracionEstimada: 40,
      },
    ],
  },
  {
    id: 'plaga_arana_trips',
    codigoKB: 'KB-PAT-PLAGA',
    nombre: 'Ataque de Ácaros (Araña Roja) o Trips',
    categoria: 'plaga',
    keywords: ['puntitos blancos', 'puntos blancos', 'plateados', 'telaraña', 'araña roja', 'trips', 'plaga', 'bichos', 'enves', 'acaros'],
    sintomasVisuales: 'Micropunteado clorótico (puntos blancos o plateados) en el haz de las hojas. En el envés se observan pequeños ácaros móviles, puntos negros (deyecciones) o larvas alargadas.',
    causaRaiz: 'Ambiente cálido (>26°C) y seco (HR < 45%, VPD > 1.5 kPa) sin aplicación regular de preventivos MIP.',
    tratamientoMineral: [
      'En vegetación: aplicar acaricida/insecticida específico rotando principios activos cada 3-4 días (3 aplicaciones para cortar el ciclo del huevo).',
      'Bajar la temperatura de sala 2°C y subir ligeramente la humedad relativa.',
    ],
    tratamientoOrganico: [
      'En vegetación/preflora: pulverizar Jabón Potásico + Aceite de Neem + Beauveria bassiana en el envés de las hojas al apagarse las luces.',
      'En floración avanzada: liberar depredadores biológicos (Phytoseiulus persimilis / Amblyseius swirskii) y colocar trampas cromáticas azules/amarillas.',
    ],
    prevencion: 'Mantener VPD dentro de rango, cuarentena de esquejes y preventivo semanal en vegetación.',
    accionesCorrectivas: [
      {
        id: 'act-pat-plaga-1',
        codigoKB: 'KB-ACT-CORR-MIP',
        tipoAccion: 'crear_tarea',
        titulo: 'Tratamiento de choque MIP (Control de Plagas en Envés Foliar)',
        descripcion: 'Protocolo KB-PAT-PLAGA: Aplicar tratamiento entomológico (Jabón Potásico/Beauveria o control biológico según fase) y colocar trampas cromáticas.',
        categoriaTarea: 'mantenimiento',
        prioridad: 'urgente',
        diasOffset: 0,
        duracionEstimada: 45,
      },
    ],
  },
  {
    id: 'hongo_botrytis_oidio',
    codigoKB: 'KB-PAT-HONGO',
    nombre: 'Infección Fúngica (Oídio o Botrytis / Moho Gris)',
    categoria: 'hongo',
    keywords: ['polvo blanco', 'moho', 'botrytis', 'oidio', 'podredumbre', 'hongo', 'cogollo marron', 'ceniza'],
    sintomasVisuales: 'Oídio: manchas circulares de polvo blanco harinoso sobre las hojas. Botrytis: hoja pequeña del cogollo ("sugar leaf") que se seca de golpe y interior del cogollo marrón/algodonoso.',
    causaRaiz: 'Humedad relativa alta (>55% en floración), picos de humedad al apagarse las luces (punto de rocío) y falta de ventilación intracanopia.',
    tratamientoMineral: [
      'Si hay Botrytis en un cogollo: apagar ventiladores temporalmente, embolsar y amputar la zona afectada 3 cm por debajo con tijera esterilizada.',
      'Bajar inmediatamente la HR a 40-45% e incrementar ventilación oscilante.',
    ],
    tratamientoOrganico: [
      'Para Oídio en vegetación/inicio flora: aplicar Trichoderma harzianum, Bacillus subtilis o agua oxigenada diluida / bicarbonato potásico.',
    ],
    prevencion: 'Deshumidificación activa en el cambio día/noche y defoliación estratégica para flujo de aire.',
    accionesCorrectivas: [
      {
        id: 'act-pat-hongo-1',
        codigoKB: 'KB-ACT-CORR-HONGO',
        tipoAccion: 'crear_tarea',
        titulo: 'Saneamiento antifúngico urgente y ajuste de HR <= 45%',
        descripcion: 'Protocolo KB-PAT-HONGO: Aislar/retirar tejido afectado sin dispersar esporas, desinfectar herramientas y fijar deshumidificador al 45%.',
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
  if (s.includes('coco')) return 'coco';
  if (s.includes('hidro') || s.includes('dwc') || s.includes('rdwc') || s.includes('nft') || s.includes('lana') || s.includes('aero')) {
    return 'hidro';
  }
  if (s.includes('vivo') || s.includes('living') || s.includes('organico') || s.includes('orgánico') || s.includes('super soil') || s.includes('humus') || s.includes('bokashi')) {
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
  if (g.includes('auto') || g.includes('fast')) return 'auto';
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
      const diasFlora = Math.max(1, Math.floor((hoy.getTime() - inicioFlora.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      const semanaFlora = Math.max(1, Math.ceil(diasFlora / 7));

      if (semanaFlora <= 2) {
        return { subEtapa: 'stretch_preflora', faseGeneral: 'floracion', semanaFase: semanaFlora, diasFase: diasFlora };
      }
      if (semanaFlora <= 5) {
        return { subEtapa: 'floracion_temprana', faseGeneral: 'floracion', semanaFase: semanaFlora, diasFase: diasFlora };
      }
      if (semanaFlora <= 7) {
        return { subEtapa: 'floracion_engorde', faseGeneral: 'floracion', semanaFase: semanaFlora, diasFase: diasFlora };
      }
      return { subEtapa: 'lavado_maduracion', faseGeneral: 'floracion', semanaFase: semanaFlora, diasFase: diasFlora };
    }
  }

  let diasVege = contexto.diasDesdeInicio ?? 14;
  if (contexto.fechaComienzo) {
    const inicioVege = new Date(contexto.fechaComienzo);
    inicioVege.setHours(0, 0, 0, 0);
    if (!isNaN(inicioVege.getTime())) {
      diasVege = Math.max(1, Math.floor((hoy.getTime() - inicioVege.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    }
  }
  const semanaVege = Math.max(1, Math.ceil(diasVege / 7));

  if (diasVege <= 10) {
    return { subEtapa: 'germinacion_esquejes', faseGeneral: 'vegetacion', semanaFase: semanaVege, diasFase: diasVege };
  }
  if (diasVege <= 24) {
    return { subEtapa: 'vegetacion_temprana', faseGeneral: 'vegetacion', semanaFase: semanaVege, diasFase: diasVege };
  }
  return { subEtapa: 'vegetacion_avanzada', faseGeneral: 'vegetacion', semanaFase: semanaVege, diasFase: diasVege };
}

/**
 * MOTOR DETERMINÍSTICO DE CÁLCULO DE OBJETIVOS (0 TOKENS, INSTANTÁNEO, 100% CONSISTENTE)
 * Utilizado por los botones "✨ IA" del formulario de cultivo, alertas y chat.
 */
export function calcularObjetivosAgronomicos(contexto: Partial<ContextoCultivo>): ObjetivosCalculadosKB {
  const tipoSustrato = detectarTipoSustrato(contexto.sustrato);
  const perfilSustrato = PERFILES_SUSTRATO_KB[tipoSustrato];
  const genetica = detectarPerfilGenetico(contexto.genetica);
  const { subEtapa, faseGeneral, semanaFase } = determinarSubEtapa(contexto);
  const protocoloEtapa = PROTOCOLOS_ETAPA_KB[subEtapa];

  // 1. pH base según sustrato y sub-etapa
  const phObjetivo = Number(perfilSustrato.phPorEtapa[subEtapa].toFixed(1));

  // 2. EC base según sustrato y sub-etapa + ajuste por genética e intensidad lumínica (W/m²)
  let ecBase = perfilSustrato.ecPorEtapa[subEtapa];

  // Ajuste por genética: Autoflorecientes y Sativas puras requieren ~15% menos sales
  if (genetica === 'auto' && subEtapa !== 'lavado_maduracion') {
    ecBase -= 0.25;
  } else if (genetica === 'sativa' && subEtapa !== 'lavado_maduracion') {
    ecBase -= 0.15;
  } else if (genetica === 'indica' && (subEtapa === 'floracion_temprana' || subEtapa === 'floracion_engorde')) {
    ecBase += 0.1;
  }

  // Ajuste por densidad lumínica (PPFD / W/m²)
  const wattsM2 =
    contexto.wattsPorM2 ||
    (contexto.potenciaLamparas && contexto.metrosCuadrados
      ? contexto.potenciaLamparas / contexto.metrosCuadrados
      : undefined);

  if (wattsM2 && subEtapa !== 'lavado_maduracion') {
    if (wattsM2 >= 450) {
      // Alta demanda metabólica por alta densidad lumínica
      ecBase += 0.15;
    } else if (wattsM2 < 250) {
      // Baja intensidad lumínica -> reducir EC para evitar toxicidad por baja fotosíntesis
      ecBase -= 0.15;
    }
  }

  const ecObjetivo = Number(Math.max(0.3, Math.min(2.4, ecBase)).toFixed(1));

  // 3. Clima Vegetación y Floración (ajustado a iluminación LED e genética)
  let tempObjetivoVegetacion = 25;
  let humedadObjetivoVegetacion = 65;
  let tempObjetivoFloracion = 23;
  let humedadObjetivoFloracion = 48;

  // Con LED de alta potencia (>400 W/m²), en vegetación rinde mejor 26°C para compensar menor radiación IR foliar
  if (wattsM2 && wattsM2 >= 420) {
    tempObjetivoVegetacion = 26;
    humedadObjetivoVegetacion = 65;
  }

  // En floración avanzada / engorde o cepas índicas densas, bajar HR objetivo a 45%
  if (subEtapa === 'floracion_engorde' || subEtapa === 'lavado_maduracion' || genetica === 'indica') {
    tempObjetivoFloracion = subEtapa === 'lavado_maduracion' ? 21 : 23;
    humedadObjetivoFloracion = 45;
  } else if (genetica === 'sativa') {
    tempObjetivoFloracion = 24;
    humedadObjetivoFloracion = 50;
  }

  const vpdObjetivoActual = Number(
    ((protocoloEtapa.vpdRango[0] + protocoloEtapa.vpdRango[1]) / 2).toFixed(2)
  );

  // 4. Volumen de agua diario estimado para la sala (L/día)
  const numPlantas = contexto.numeroplantas || 6;
  const litrosMaceta = contexto.litrosMaceta || 10;
  const factorFase = faseGeneral === 'floracion' ? 1.15 : 0.85;
  const aguaDiariaObjetivo = Number(
    Math.max(1, numPlantas * litrosMaceta * perfilSustrato.factorRetencionAgua * factorFase).toFixed(1)
  );

  // 5. Auditoría de discrepancias frente a los valores actuales del cultivo
  const alertasAuditoria: string[] = [];
  if (contexto.phObjetivo && Math.abs(contexto.phObjetivo - phObjetivo) >= 0.4) {
    alertasAuditoria.push(
      `El pH configurado (${contexto.phObjetivo}) se desvía del rango ideal para ${perfilSustrato.nombre} en esta etapa (óptimo: ${phObjetivo}).`
    );
  }
  if (contexto.ecObjetivo && contexto.ecObjetivo <= 10 && Math.abs(contexto.ecObjetivo - ecObjetivo) >= 0.4) {
    alertasAuditoria.push(
      `La EC configurada (${contexto.ecObjetivo} mS) difiere del objetivo de la Base de Conocimiento (${ecObjetivo} mS) para ${protocoloEtapa.titulo}.`
    );
  }
  if (wattsM2 && wattsM2 > 600) {
    alertasAuditoria.push(
      `Densidad lumínica muy alta (${Math.round(wattsM2)} W/m²). Vigila distancia de lámparas para evitar fotoblanqueo y asegura suplemento de Ca/Mg.`
    );
  }

  const resumenExplicativo = `Protocolo ${protocoloEtapa.codigoKB} (${perfilSustrato.nombre} · Sem ${semanaFase} ${
    faseGeneral === 'floracion' ? 'Flora' : 'Vege'
  }${wattsM2 ? ` · ${Math.round(wattsM2)} W/m²` : ''}): pH ${phObjetivo} · EC ${ecObjetivo} mS · VPD ${vpdObjetivoActual} kPa.`;

  // Acción directa para aplicar estos parámetros + tareas de la etapa actual
  const accionActualizarParametros: AccionConocimiento = {
    id: `kb-sync-params-${subEtapa}`,
    codigoKB: protocoloEtapa.codigoKB,
    tipoAccion: 'actualizar_parametros',
    titulo: `Aplicar metas de ${protocoloEtapa.codigoKB} (pH ${phObjetivo} · EC ${ecObjetivo} mS)`,
    descripcion: `Actualiza los objetivos del cultivo según la Base de Conocimiento para ${perfilSustrato.nombre}: pH ${phObjetivo}, EC ${ecObjetivo} mS, Vege ${tempObjetivoVegetacion}°C/${humedadObjetivoVegetacion}%, Flora ${tempObjetivoFloracion}°C/${humedadObjetivoFloracion}%.`,
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

/**
 * Detecta la intención principal del mensaje del usuario para decidir si se puede
 * responder con 0 tokens directamente desde la Base de Conocimiento o comprimir el prompt RAG.
 */
export type IntencionConsultaKB =
  | 'parametros_nutricion_clima'
  | 'plan_tareas_acciones'
  | 'diagnostico_sintomas'
  | 'auditoria_general'
  | 'consulta_abierta';

export function detectarIntencionConsulta(mensaje: string, tieneImagenes: boolean): IntencionConsultaKB {
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
    m.includes('semana')
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
    m.includes('riego') ||
    m.includes('litros') ||
    m.includes('agua') ||
    m.includes('parametro') ||
    m.includes('objetivo')
  ) {
    return 'parametros_nutricion_clima';
  }

  if (m.includes('audita') || m.includes('como ves') || m.includes('estado') || m.includes('resumen') || m.includes('recomendacion')) {
    return 'auditoria_general';
  }

  return 'consulta_abierta';
}

/**
 * Construye una respuesta determinística completa desde la Base de Conocimiento (0 Tokens LLM)
 * y adjunta las Acciones Estandarizadas listas para ejecutar con 1 clic.
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

  const fuentesConocimiento: string[] = [
    `${protocolo.codigoKB}: ${protocolo.titulo}`,
    `Tabla Sustrato: ${objetivos.sustratoDetectado.nombre}`,
  ];
  for (const pat of patologiasCoincidentes) {
    fuentesConocimiento.push(`${pat.codigoKB}: ${pat.nombre}`);
  }

  // CASO 1: Diagnóstico de síntomas conocidos en la Base de Conocimiento
  if (intencion === 'diagnostico_sintomas' && patologiasCoincidentes.length > 0) {
    const pat = patologiasCoincidentes[0];
    const acciones = [...pat.accionesCorrectivas, objetivos.accionesSugeridas[0]];
    const respuesta = [
      `🩺 **Diagnóstico Basado en Conocimiento Clínico (${pat.codigoKB})**`,
      ``,
      `### 1. Problema Identificado: **${pat.nombre}**`,
      `- **Síntomas asociados:** ${pat.sintomasVisuales}`,
      `- **Causa probable en ${contexto.nombre}:** ${pat.causaRaiz}`,
      ``,
      `### 2. Protocolo de Corrección para ${objetivos.sustratoDetectado.nombre}`,
      `**Opción Mineral / Precisión:**`,
      ...pat.tratamientoMineral.map((p) => `- ${p}`),
      ``,
      `**Opción Orgánica / Biológica:**`,
      ...pat.tratamientoOrganico.map((p) => `- ${p}`),
      ``,
      `### 3. Parámetros Objetivos de Control (${protocolo.codigoKB})`,
      `- **pH de entrada:** ${objetivos.phObjetivo} | **EC objetivo:** ${objetivos.ecObjetivo} mS/cm`,
      `- **Clima ideal ahora:** VPD ${objetivos.vpdObjetivoActual} kPa (${
        objetivos.subEtapaActual.includes('flora') || objetivos.subEtapaActual === 'stretch_preflora'
          ? `${objetivos.tempObjetivoFloracion}°C / ${objetivos.humedadObjetivoFloracion}% HR`
          : `${objetivos.tempObjetivoVegetacion}°C / ${objetivos.humedadObjetivoVegetacion}% HR`
      })`,
      `- **Prevención:** ${pat.prevencion}`,
      ``,
      `👇 *Puedes agendar la tarea correctiva o sincronizar los parámetros recomendados directamente con los botones de abajo:*`,
    ].join('\n');

    return {
      respuesta,
      accionesSugeridas: acciones,
      fuentesConocimiento,
      intencion,
      esSuficienteSinLLM: !tieneImagenes, // Si subió foto y hay LLM disponible, el LLM puede complementar la visión
    };
  }

  // CASO 2: Solicitud de Plan de Tareas / Acciones de la Semana
  if (intencion === 'plan_tareas_acciones') {
    const respuesta = [
      `📅 **Plan Operativo Estandarizado — ${protocolo.titulo} (${protocolo.codigoKB})**`,
      ``,
      `Para **${contexto.nombre}** (${contexto.genetica || 'Genética activa'} en **${objetivos.sustratoDetectado.nombre}**), la Base de Conocimiento establece el siguiente protocolo de acciones:`,
      ``,
      `### 🎯 Objetivo de la Etapa`,
      `${protocolo.objetivoPrincipal}`,
      ``,
      `### ✅ Reglas Agronómicas Críticas`,
      ...protocolo.reglasCriticas.map((r) => `- ${r}`),
      ``,
      `### 🛠️ Acciones Lista para Ejecutar / Agendar`,
      ...protocolo.tareasEstandar.map(
        (t, idx) => `${idx + 1}. **[${t.codigoKB}] ${t.titulo}** — *${t.descripcion}*`
      ),
      ``,
      `### 💧 Parámetros de Riego y Clima Vinculados`,
      `- **pH:** ${objetivos.phObjetivo} · **EC:** ${objetivos.ecObjetivo} mS/cm · **Volumen estimado sala:** ~${objetivos.aguaDiariaObjetivo} L/día`,
      `- **Nota de sustrato:** ${objetivos.sustratoDetectado.frecuenciaRiegoNota}`,
      ``,
      `👇 *Haz clic en cualquiera de las acciones de abajo para agendarla en tu Calendario o actualizar los objetivos de la sala:*`,
    ].join('\n');

    return {
      respuesta,
      accionesSugeridas: objetivos.accionesSugeridas,
      fuentesConocimiento,
      intencion,
      esSuficienteSinLLM: true,
    };
  }

  // CASO 3: Consulta de Parámetros (pH, EC, Temperatura, Humedad, VPD, Riego) o Auditoría
  if (intencion === 'parametros_nutricion_clima' || intencion === 'auditoria_general') {
    const respuesta = [
      `📊 **Ficha Técnica de Parámetros — ${contexto.nombre} (${protocolo.codigoKB})**`,
      ``,
      `Calculado desde la Base de Conocimiento Agronómica para **${objetivos.sustratoDetectado.nombre}** en **${protocolo.titulo}**:`,
      ``,
      `| Parámetro | Valor Óptimo KB | Configuración Actual |`,
      `| :--- | :--- | :--- |`,
      `| **pH Objetivo** | **${objetivos.phObjetivo}** | ${contexto.phObjetivo ?? 'Sin definir'} |`,
      `| **EC Objetivo** | **${objetivos.ecObjetivo} mS/cm** | ${contexto.ecObjetivo ?? 'Sin definir'} |`,
      `| **Clima Vegetación** | **${objetivos.tempObjetivoVegetacion}°C / ${objetivos.humedadObjetivoVegetacion}% HR** | ${
        contexto.tempObjetivoVegetacion ? `${contexto.tempObjetivoVegetacion}°C / ${contexto.humedadObjetivoVegetacion}%` : 'Sin definir'
      } |`,
      `| **Clima Floración** | **${objetivos.tempObjetivoFloracion}°C / ${objetivos.humedadObjetivoFloracion}% HR** | ${
        contexto.tempObjetivoFloracion ? `${contexto.tempObjetivoFloracion}°C / ${contexto.humedadObjetivoFloracion}%` : 'Sin definir'
      } |`,
      `| **VPD Meta / PPFD** | **${protocolo.vpdRango[0]}–${protocolo.vpdRango[1]} kPa** (${protocolo.ppfdRecomendado}) | Fotoperíodo ${protocolo.fotoperiodo} |`,
      `| **Agua Estimada Sala** | **~${objetivos.aguaDiariaObjetivo} L/día** | ${contexto.numeroplantas || '-'} plantas × ${contexto.litrosMaceta || '-'}L |`,
      ``,
      objetivos.alertasAuditoria.length > 0
        ? `### ⚠️ Observaciones de Auditoría\n${objetivos.alertasAuditoria.map((a) => `- ${a}`).join('\n')}\n`
        : `✅ **Criterio del Sustrato:** ${objetivos.sustratoDetectado.frecuenciaRiegoNota}\n`,
      `👇 *Puedes aplicar estos parámetros o agendar las tareas del protocolo con 1 clic:*`,
    ].join('\n');

    return {
      respuesta,
      accionesSugeridas: objetivos.accionesSugeridas,
      fuentesConocimiento,
      intencion,
      esSuficienteSinLLM: true,
    };
  }

  // CASO 4: Consulta abierta (igualmente preparamos respuesta completa de respaldo + acciones de etapa)
  const respuestaFallback = [
    `🤖 **Consulta Agronómica Basada en Protocolo ${protocolo.codigoKB}**`,
    ``,
    `Analizando **${contexto.nombre}** (${contexto.genetica || 'Híbrido'} en **${objetivos.sustratoDetectado.nombre}**, etapa actual: **${protocolo.titulo}**):`,
    ``,
    `- **Parámetros Oficiales para tu Sala:** pH **${objetivos.phObjetivo}** · EC **${objetivos.ecObjetivo} mS/cm** · VPD **${protocolo.vpdRango[0]}–${protocolo.vpdRango[1]} kPa** (${protocolo.tempDiaNoche.dia[0]}–${protocolo.tempDiaNoche.dia[1]}°C día).`,
    `- **Manejo de Riego (${objetivos.sustratoDetectado.nombre}):** ${objetivos.sustratoDetectado.frecuenciaRiegoNota}`,
    ``,
    `### 📋 Directrices Clave en esta Fase`,
    ...protocolo.reglasCriticas.map((r) => `- ${r}`),
    ``,
    `👇 *Acciones recomendadas desde la Base de Conocimiento para ejecutar ahora:*`,
  ].join('\n');

  return {
    respuesta: respuestaFallback,
    accionesSugeridas: objetivos.accionesSugeridas,
    fuentesConocimiento,
    intencion,
    esSuficienteSinLLM: false,
  };
}

/**
 * Construye un prompt ultra-comprimido (<180 tokens de contexto) inyectando únicamente
 * la ficha exacta de la Base de Conocimiento que aplica al cultivo y a la pregunta.
 */
export function construirPromptComprimidoRAG(mensaje: string, contexto: ContextoCultivo): {
  systemPrompt: string;
  userPrompt: string;
  accionesKB: AccionConocimiento[];
  fuentesKB: string[];
} {
  const objetivos = calcularObjetivosAgronomicos(contexto);
  const protocolo = PROTOCOLOS_ETAPA_KB[objetivos.subEtapaActual];
  const patologias = buscarPatologiasKB(mensaje);

  const patologiaSnippet =
    patologias.length > 0
      ? `PATOLOGIA_KB(${patologias[0].codigoKB}): ${patologias[0].nombre} | Causa: ${patologias[0].causaRaiz} | Mineral: ${patologias[0].tratamientoMineral[0]} | Organico: ${patologias[0].tratamientoOrganico[0]}`
      : '';

  const accionesDisponibles = [
    ...patologias.flatMap((p) => p.accionesCorrectivas),
    ...objetivos.accionesSugeridas,
  ];

  const systemPrompt = [
    `Eres el Motor Agronómico de CanopIA. Responde SIEMPRE basándote ESTRICTAMENTE en la siguiente Base de Conocimiento Oficial (KB) para ser 100% consistente y conciso (máx 180 palabras).`,
    `SALAS_CTX: "${contexto.nombre}" | Gen:${contexto.genetica || 'N/A'}(${objetivos.geneticaDetectada}) | Sust:${objetivos.sustratoDetectado.nombre} | Etapa:${protocolo.codigoKB}(${protocolo.titulo}) | Area:${contexto.metrosCuadrados || '?'}m2 | Plantas:${contexto.numeroplantas || '?'}x${contexto.litrosMaceta || '?'}L | Luz:${contexto.potenciaLamparas || '?'}W.`,
    `METAS_KB: pH=${objetivos.phObjetivo}, EC=${objetivos.ecObjetivo}mS, Vege=${objetivos.tempObjetivoVegetacion}C/${objetivos.humedadObjetivoVegetacion}%, Flora=${objetivos.tempObjetivoFloracion}C/${objetivos.humedadObjetivoFloracion}%, VPD=${protocolo.vpdRango[0]}-${protocolo.vpdRango[1]}kPa, Agua=${objetivos.aguaDiariaObjetivo}L/dia.`,
    `REGLAS_KB: ${protocolo.reglasCriticas.join(' | ')}`,
    patologiaSnippet,
    `ACCIONES_KB: ${accionesDisponibles.map((a) => `[${a.codigoKB}] ${a.titulo}`).join('; ')}`,
  ]
    .filter(Boolean)
    .join('\n');

  const fuentesKB = [
    `${protocolo.codigoKB}: ${protocolo.titulo}`,
    `Tabla Sustrato: ${objetivos.sustratoDetectado.nombre}`,
    ...patologias.map((p) => `${p.codigoKB}: ${p.nombre}`),
  ];

  return {
    systemPrompt,
    userPrompt: mensaje,
    accionesKB: accionesDisponibles,
    fuentesKB,
  };
}
