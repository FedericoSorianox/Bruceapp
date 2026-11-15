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

describe('CanopIA Agronomic Knowledge Base & Low-Token Engine', () => {
  it('clasifica sustrato y genética de forma determinística', () => {
    expect(detectarTipoSustrato('Coco + Perlita 70/30')).toBe('coco');
    expect(detectarTipoSustrato('Suelo Vivo Orgánico')).toBe('living_soil');
    expect(detectarTipoSustrato('RDWC Hidroponía')).toBe('hidro');
    expect(detectarTipoSustrato('Turba Light Mix')).toBe('tierra');

    expect(detectarPerfilGenetico('24K Gold')).toBe('indica');
    expect(detectarPerfilGenetico('Super Silver Haze')).toBe('sativa');
    expect(detectarPerfilGenetico('Gorilla Auto')).toBe('auto');
  });

  it('calcula objetivos consistentes con 0 tokens según sustrato, etapa y potencia lumínica', () => {
    const hace20Dias = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const contextoCocoFlora: ContextoCultivo = {
      id: 'c1',
      nombre: 'Sala A',
      genetica: '24K Gold',
      sustrato: 'Coco+Perlita',
      fechaComienzo: '2026-09-01',
      fechaInicioFloracion: hace20Dias, // Semana 3 de floración -> floracion_temprana
      metrosCuadrados: 2.4,
      numeroplantas: 12,
      litrosMaceta: 7,
      potenciaLamparas: 1600, // 666 W/m2
    };

    const objetivos = calcularObjetivosAgronomicos(contextoCocoFlora);

    expect(objetivos.sustratoDetectado.id).toBe('coco');
    expect(objetivos.subEtapaActual).toBe('floracion_temprana');
    expect(objetivos.phObjetivo).toBe(6.0);
    expect(objetivos.ecObjetivo).toBeGreaterThanOrEqual(1.8);
    expect(objetivos.tempObjetivoVegetacion).toBe(26);
    expect(objetivos.humedadObjetivoFloracion).toBe(45);
    expect(objetivos.accionesSugeridas.length).toBeGreaterThanOrEqual(2);
    expect(objetivos.accionesSugeridas[0].tipoAccion).toBe('actualizar_parametros');
  });

  it('resuelve diagnósticos clínicos y planes de acciones en 0 tokens', () => {
    const contexto: ContextoCultivo = {
      id: 'c2',
      nombre: 'Sala Experimental',
      sustrato: 'Coco',
      genetica: 'OG Kush',
    };

    const patologias = buscarPatologiasKB('Manchas color óxido en hojas medias y nervaduras verdes');
    expect(patologias.length).toBeGreaterThan(0);
    expect(patologias[0].codigoKB).toBe('KB-PAT-CALMAG');

    const resPlan = generarRespuestaConocimientoLocal(
      '¿Qué tareas tengo que hacer esta semana?',
      contexto,
      false
    );
    expect(resPlan.esSuficienteSinLLM).toBe(true);
    expect(resPlan.accionesSugeridas.length).toBeGreaterThan(0);

    const rag = construirPromptComprimidoRAG('¿Cómo optimizo el engorde?', contexto);
    expect(rag.systemPrompt.length).toBeLessThan(950); // Prompt ultra-compacto
  });
});
