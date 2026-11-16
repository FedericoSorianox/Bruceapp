import { describe, it, expect } from 'vitest';
import {
  detectarTipoSustrato,
  detectarPerfilGenetico,
  calcularObjetivosAgronomicos,
  buscarPatologiasKB,
  generarRespuestaConocimientoLocal,
  construirPromptComprimidoRAG,
} from './agronomicKnowledgeBase';
import type { ContextoCultivo } from '@/types/chat';

describe('CanopIA Agronomic Knowledge Base — Dr. Bruce Bugbee (USU) + Athena Ag', () => {
  it('clasifica sustrato (incluyendo mezcla USU y medios Athena) y genética', () => {
    expect(detectarTipoSustrato('Coco + Perlita 70/30')).toBe('coco');
    expect(detectarTipoSustrato('Mezcla USU Turba + Vermiculita')).toBe('coco');
    expect(detectarTipoSustrato('Rockwool Lana de Roca Athena')).toBe('hidro');
    expect(detectarTipoSustrato('Suelo Vivo Orgánico')).toBe('living_soil');
    expect(detectarTipoSustrato('Turba Light Mix')).toBe('tierra');

    expect(detectarPerfilGenetico('24K Gold')).toBe('indica');
    expect(detectarPerfilGenetico('Super Silver Haze')).toBe('sativa');
    expect(detectarPerfilGenetico('Gorilla Auto')).toBe('auto');
  });

  it('calcula objetivos según Bruce Bugbee + Athena Ag (pH 5.8-6.0, EC Crop Steering, Temp LED 27°C, PPFD/DLI)', () => {
    const hace25Dias = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const contextoCocoFlora: ContextoCultivo = {
      id: 'c1',
      nombre: 'Sala A',
      genetica: '24K Gold',
      sustrato: 'Coco+Perlita',
      fechaComienzo: '2026-09-01',
      fechaInicioFloracion: hace25Dias, // Semana 4 de floración -> floracion_temprana (Bulking)
      metrosCuadrados: 2.4,
      numeroplantas: 12,
      litrosMaceta: 7,
      potenciaLamparas: 1600, // 666 W/m2 -> ~1466 umol/m2/s PPFD
    };

    const objetivos = calcularObjetivosAgronomicos(contextoCocoFlora);

    expect(objetivos.sustratoDetectado.id).toBe('coco');
    expect(objetivos.subEtapaActual).toBe('floracion_temprana');
    expect(objetivos.phObjetivo).toBe(5.9);
    expect(objetivos.ecObjetivo).toBeGreaterThanOrEqual(2.4);
    expect(objetivos.tempObjetivoVegetacion).toBe(27);
    expect(objetivos.tempObjetivoFloracion).toBe(25);
    expect(objetivos.ppfdEstimadoSala).toBeGreaterThan(1000);
    expect(objetivos.accionesSugeridas.length).toBeGreaterThanOrEqual(2);
    expect(objetivos.accionesSugeridas[0].codigoKB).toContain('USU-ATH');
  });

  it('resuelve diagnósticos clínicos y planes de Crop Steering Athena + USU en 0 tokens', () => {
    const contexto: ContextoCultivo = {
      id: 'c2',
      nombre: 'Sala Athena USU',
      sustrato: 'Coco',
      genetica: 'OG Kush',
    };

    const patologias = buscarPatologiasKB('Manchas color óxido en hojas medias y nervaduras verdes');
    expect(patologias.length).toBeGreaterThan(0);
    expect(patologias[0].codigoKB).toBe('USU-ATH-PAT-PH');

    const resPlan = generarRespuestaConocimientoLocal(
      '¿Qué tareas y crop steering tengo que hacer esta semana?',
      contexto,
      false
    );
    expect(resPlan.esSuficienteSinLLM).toBe(true);
    expect(resPlan.respuesta).toContain('Athena Balance');
    expect(resPlan.accionesSugeridas.length).toBeGreaterThan(0);

    const rag = construirPromptComprimidoRAG('¿Cómo optimizo el engorde con Athena?', contexto, undefined, [
      { tipo: 'user', contenido: 'la temperatura esta en 28' },
      { tipo: 'user', contenido: 'tengo CO2 1200ppm y humedad 75' },
    ]);
    expect(rag.systemPrompt).toContain('Bruce Bugbee');
    expect(rag.systemPrompt).toContain('Athena');
    expect(rag.systemPrompt).toContain('CONTEXTO COMPLETO DEL CULTIVO ACTUAL');
    expect(rag.systemPrompt).toContain('DATOS_REPORTADOS_EN_ESTA_CHARLA');
    expect(rag.systemPrompt).toContain('Temp_Actual_Reportada=28°C');
    expect(rag.systemPrompt).toContain('CO2_Reportado=1200ppm');
    expect(rag.systemPrompt.length).toBeLessThan(2600);
  });

  it('analiza específicamente "la temperatura en flora esta en 28 grados" con VPD real y sin tablas rotas', () => {
    const hace6Dias = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lomas: ContextoCultivo = {
      id: 'lomas1',
      nombre: 'Lomas #1',
      genetica: '24 kev',
      sustrato: 'Coco+Perlita',
      fechaComienzo: '2026-09-30',
      fechaInicioFloracion: hace6Dias,
      metrosCuadrados: 2.4,
      numeroplantas: 12,
      litrosMaceta: 7,
      potenciaLamparas: 1600,
      tempObjetivoFloracion: 23,
      humedadObjetivoFloracion: 48,
    };

    const resTemp = generarRespuestaConocimientoLocal(
      'la temperatura en flora esta en 28 grados',
      lomas,
      false
    );

    expect(resTemp.respuesta).toContain('28°C');
    expect(resTemp.respuesta).toContain('Lomas #1');
    expect(resTemp.respuesta).toContain('VPD');
    expect(resTemp.respuesta).not.toContain('| :--- |');
    expect(resTemp.accionesSugeridas.length).toBe(2);
    expect(resTemp.accionesSugeridas[0].titulo).toContain('25°C');

    // Turno 2 de conversación: el usuario responde "tengo CO2 1200ppm en el cultivo, y la humedad esta en 75"
    const resTurno2 = generarRespuestaConocimientoLocal(
      'tengo CO2 1200ppm en el cultivo, y la humedad esta en 75',
      lomas,
      false,
      [{ tipo: 'user', contenido: 'la temperatura esta en 28' }]
    );

    expect(resTurno2.respuesta).toContain('28°C');
    expect(resTurno2.respuesta).toContain('75% HR');
    expect(resTurno2.respuesta).toContain('1200 ppm');
    expect(resTurno2.respuesta).toContain('0.63 kPa');
    expect(resTurno2.accionesSugeridas[0].titulo).toContain('28°C / 60% HR');
  });
});
