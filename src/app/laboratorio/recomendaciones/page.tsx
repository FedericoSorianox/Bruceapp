'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCultivos } from '@/lib/hooks/useCultivos';
import { usePlanificacion } from '@/lib/hooks/usePlanificacion';
import { calcularMetricasFases } from '@/lib/services/cultivos';

interface AlertaInteligente {
  id: string;
  type: 'urgent' | 'tip' | 'info' | 'success';
  title: string;
  cropName: string;
  cropId?: string;
  taskId?: string;
  description: string;
  badgeText: string;
  actionLabel: string;
  onAction?: () => Promise<void>;
}

export default function RecomendacionesPage() {
  const { cultivos, loading: loadingCultivos, update, iniciarFloracion } = useCultivos();
  const planificacion = usePlanificacion({ _sort: 'fechaProgramada', _order: 'asc' });
  const [filtroTipo, setFiltroTipo] = useState<'todas' | 'urgent' | 'tip' | 'info'>('todas');
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  const alertas = useMemo<AlertaInteligente[]>(() => {
    const list: AlertaInteligente[] = [];
    const hoy = new Date().toISOString().split('T')[0];

    const cultivoMap: Record<string, string> = {};
    for (const c of cultivos) {
      cultivoMap[c.id] = c.nombre;
    }

    // 1. Tareas vencidas o programadas para hoy
    for (const tarea of planificacion.tareas) {
      if (tarea.estado === 'pendiente' || tarea.estado === 'en_progreso') {
        const nombreSala = cultivoMap[tarea.cultivoId] || 'Sala General';
        if (tarea.fechaProgramada < hoy) {
          list.push({
            id: `tarea-vencida-${tarea.id}`,
            type: 'urgent',
            title: `Tarea vencida: ${tarea.titulo}`,
            cropName: nombreSala,
            cropId: tarea.cultivoId,
            taskId: tarea.id,
            description:
              tarea.descripcion ||
              `Esta actividad estaba programada para el ${new Date(tarea.fechaProgramada).toLocaleDateString()} y requiere atención inmediata.`,
            badgeText: 'Vencida',
            actionLabel: '✓ Completar Tarea Ahora',
            onAction: async () => {
              await planificacion.completar(tarea.id);
            },
          });
        } else if (tarea.fechaProgramada === hoy) {
          list.push({
            id: `tarea-hoy-${tarea.id}`,
            type: tarea.prioridad === 'urgente' || tarea.prioridad === 'alta' ? 'urgent' : 'info',
            title: `Agenda de Hoy: ${tarea.titulo}`,
            cropName: nombreSala,
            cropId: tarea.cultivoId,
            taskId: tarea.id,
            description:
              tarea.descripcion ||
              `Actividad operativa programada para hoy${tarea.horaProgramada ? ` a las ${tarea.horaProgramada} hs` : ''}.`,
            badgeText: tarea.horaProgramada ? `Hoy ${tarea.horaProgramada} hs` : 'Para Hoy',
            actionLabel: '✓ Marcar Completada',
            onAction: async () => {
              await planificacion.completar(tarea.id);
            },
          });
        }
      }
    }

    // 2. Auditoría agronómica de cada cultivo activo
    for (const c of cultivos) {
      if (c.activo === false) continue;
      const metricas = calcularMetricasFases(c);

      // Cultivos en vegetación prolongada (> 28 días) listos para pasar a 12/12
      if (metricas.faseActual === 'vegetacion' && metricas.diasVegetacionActual >= 28) {
        list.push({
          id: `transicion-flora-${c.id}`,
          type: 'tip',
          title: 'Ventana óptima para transición a Floración (12/12)',
          cropName: c.nombre,
          cropId: c.id,
          description: `El cultivo lleva ${metricas.diasVegetacionActual} días (Semana ${metricas.semanaVegetacion}) en crecimiento vegetativo. Considera cambiar el fotoperíodo a 12/12 teniendo en cuenta que duplicará su altura durante el stretch.`,
          badgeText: `Día ${metricas.diasVegetacionActual} Vege`,
          actionLabel: '🌸 Iniciar Floración Hoy',
          onAction: async () => {
            await iniciarFloracion(c.id);
          },
        });
      }

      // Cultivos en floración media/avanzada (Semana 5+) -> Control de humedad / PK / Tricomas
      if (metricas.faseActual === 'floracion' && metricas.semanaFloracion >= 5) {
        list.push({
          id: `flora-avanzada-${c.id}`,
          type: 'urgent',
          title: `Semana ${metricas.semanaFloracion} de Floración: Prevención de Botrytis y Engorde`,
          cropName: c.nombre,
          cropId: c.id,
          description: `Con ${metricas.diasFloracionActual} días en floración los cogollos son densos. Mantén la humedad nocturna por debajo de 45-48% HR y monitorea la maduración de tricomas.`,
          badgeText: `Semana ${metricas.semanaFloracion} Flora`,
          actionLabel: 'Ajustar Meta HR a 45%',
          onAction: async () => {
            await update(c.id, { humedadObjetivoFloracion: 45, tempObjetivoFloracion: 22 });
          },
        });
      }

      // Cultivos sin objetivos de pH/EC configurados
      if (!c.phObjetivo || !c.ecObjetivo) {
        const esFlora = metricas.faseActual === 'floracion';
        list.push({
          id: `nutricion-target-${c.id}`,
          type: 'info',
          title: 'Configurar Objetivos Nutricionales (pH y EC)',
          cropName: c.nombre,
          cropId: c.id,
          description: `Definir metas claras de pH y electroconductividad permite detectar bloqueos de nutrientes a tiempo. Sugerencia para ${esFlora ? 'Floración' : 'Vegetación'}: pH ${esFlora ? '6.2' : '5.9'} y EC ${esFlora ? '1500' : '950'} ppm.`,
          badgeText: 'Optimización',
          actionLabel: '⚡ Autoconfigurar pH/EC Ideal',
          onAction: async () => {
            await update(c.id, {
              phObjetivo: esFlora ? 6.2 : 5.9,
              ecObjetivo: esFlora ? 1500 : 950,
              aguaDiariaObjetivo: c.aguaDiariaObjetivo || (c.numeroplantas ? Math.round(c.numeroplantas * 1.5) : 12),
            });
          },
        });
      }

      // Densidad lumínica (Watts / m²)
      if (c.potenciaLamparas && c.metrosCuadrados) {
        const wM2 = c.potenciaLamparas / c.metrosCuadrados;
        if (wM2 < 250) {
          list.push({
            id: `luz-baja-${c.id}`,
            type: 'tip',
            title: `Densidad lumínica moderada (${Math.round(wM2)} W/m²)`,
            cropName: c.nombre,
            cropId: c.id,
            description: `Estás aplicando ${c.potenciaLamparas}W en ${c.metrosCuadrados} m². Para maximizar producción en floración se recomiendan entre 300 y 450 W/m² con tecnología LED de alta eficiencia.`,
            badgeText: 'Iluminación',
            actionLabel: 'Ver Detalles de Sala',
          });
        }
      }
    }

    return list;
  }, [cultivos, planificacion, iniciarFloracion, update]);

  const alertasFiltradas = useMemo(() => {
    if (filtroTipo === 'todas') return alertas;
    return alertas.filter((a) => a.type === filtroTipo);
  }, [alertas, filtroTipo]);

  const getBadgeStyle = (type: AlertaInteligente['type']) => {
    switch (type) {
      case 'urgent':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'tip':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'info':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'success':
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const getIcon = (type: AlertaInteligente['type']) => {
    switch (type) {
      case 'urgent':
        return '🚨';
      case 'tip':
        return '💡';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✨';
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
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
              <h1 className="text-3xl font-extrabold text-slate-900">Motor de Recomendaciones IA</h1>
              <p className="text-slate-600 text-sm">
                Auditoría automática en tiempo real basada en tus salas activas y calendario de tareas
              </p>
            </div>
          </div>

          <Link
            href="/cultivo"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors self-start sm:self-auto"
          >
            <span>🌿</span> Ir a Mis Cultivos
          </Link>
        </div>

        {/* Estado General Dinámico */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Monitoreo Agronómico Activo
            </div>
            <h2 className="text-xl font-bold">
              Analizando {cultivos.filter((c) => c.activo !== false).length} cultivos activos y{' '}
              {planificacion.estadisticas.tareasPendientes} tareas pendientes
            </h2>
            <p className="text-emerald-100/80 text-sm mt-1">
              {alertas.filter((a) => a.type === 'urgent').length > 0
                ? `Se detectaron ${alertas.filter((a) => a.type === 'urgent').length} alertas prioritarias que requieren acción hoy.`
                : 'Todos tus parámetros principales se encuentran dentro de los umbrales seguros.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-extrabold text-white">{alertas.length}</div>
              <div className="text-[11px] text-emerald-200">Sugerencias</div>
            </div>
            <div className="text-center px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="text-2xl font-extrabold text-emerald-400">
                {planificacion.estadisticas.productividad}%
              </div>
              <div className="text-[11px] text-emerald-200">Cumplimiento</div>
            </div>
          </div>
        </div>

        {/* Filtros de Tipo de Alerta */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'todas', label: `Todas (${alertas.length})` },
            { id: 'urgent', label: `🚨 Prioritarias (${alertas.filter((a) => a.type === 'urgent').length})` },
            { id: 'tip', label: `💡 Consejos de Cultivo (${alertas.filter((a) => a.type === 'tip').length})` },
            { id: 'info', label: `ℹ️ Agenda y Metas (${alertas.filter((a) => a.type === 'info').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFiltroTipo(tab.id as typeof filtroTipo)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                filtroTipo === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lista de Recomendaciones Dinámicas */}
        {loadingCultivos || planificacion.loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 mb-3" />
            <p className="text-slate-600 text-sm">Analizando telemetría de tus cultivos...</p>
          </div>
        ) : alertasFiltradas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-lg font-bold text-slate-900">¡Todo al día en tus salas!</h3>
            <p className="text-sm text-slate-500 mt-1">
              No hay alertas pendientes en esta categoría. Tus cultivos y tareas están bajo control.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alertasFiltradas.map((rec) => (
              <div
                key={rec.id}
                className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col sm:flex-row gap-5 items-start"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${getBadgeStyle(
                    rec.type
                  )}`}
                >
                  {getIcon(rec.type)}
                </div>

                <div className="flex-grow">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-1.5">
                    <h4 className="text-base sm:text-lg font-bold text-slate-900">{rec.title}</h4>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {rec.badgeText}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-emerald-700 mb-2">🌿 Sala: {rec.cropName}</p>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{rec.description}</p>

                  <div className="flex flex-wrap items-center gap-3">
                    {rec.onAction && (
                      <button
                        disabled={procesandoId === rec.id}
                        onClick={async () => {
                          setProcesandoId(rec.id);
                          try {
                            await rec.onAction!();
                          } finally {
                            setProcesandoId(null);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
                      >
                        {procesandoId === rec.id ? 'Aplicando...' : rec.actionLabel}
                      </button>
                    )}

                    {rec.cropId && (
                      <Link
                        href={`/cultivo/${rec.cropId}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Abrir Sala →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
