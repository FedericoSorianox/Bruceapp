/**
 * Componente de Chat con IA especializada en Cannabis Medicinal + Base de Conocimiento Agronómica
 * - Prioriza respuestas determinísticas de 0 tokens desde la Base de Conocimiento (KB).
 * - Utiliza Micro-RAG comprimido cuando requiere LLM o análisis de visión.
 * - Permite ejecutar acciones consistentes (crear tareas o aplicar parámetros objetivos) con 1 clic.
 */

'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import type {
  MensajeChat,
  ContextoCultivo,
  ImagenMensaje,
  AccionConocimiento,
  ComentarioCultivo,
} from '@/types/chat';
import type { Cultivo } from '@/types/cultivo';
import {
  gestionarConversacionIA,
  procesarImagenes,
  limpiarImagenes,
  prepararContextoCultivo,
  consultarTodosLosObjetivosKB,
} from '@/lib/services/chat';
import { obtenerComentarios } from '@/lib/services/comentarios';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createTarea } from '@/lib/services/planificacion';
import { updateCultivo } from '@/lib/services/cultivos';

interface ChatIAProps {
  /** Datos completos del cultivo para contexto */
  cultivo: Cultivo;
  /** Clase CSS adicional para el contenedor */
  className?: string;
  /** Callback opcional cuando se aplica una acción que modifica el cultivo o sus tareas */
  onAccionEjecutada?: (cultivoActualizado?: Cultivo) => void;
}

const CONSULTAS_RAPIDAS_KB = [
  {
    label: '📊 Auditar pH, EC y Clima',
    prompt: 'Audita los parámetros óptimos de pH, EC, temperatura, humedad y riego para mi cultivo actual según su sustrato y etapa.',
  },
  {
    label: '📅 Plan de acciones de esta semana',
    prompt: '¿Qué tareas y acciones operativas debo realizar esta semana según la etapa fenológica actual?',
  },
  {
    label: '🍂 Hojas con manchas óxido / amarillas',
    prompt: 'Observo manchas color óxido en hojas medias y ligero amarilleamiento inferior. ¿Qué deficiencia es y qué acción aplico?',
  },
  {
    label: '🔥 Puntas quemadas / Exceso de EC',
    prompt: 'Las puntas de las hojas superiores están quemadas y en forma de garra. ¿Cómo corrijo el bloqueo de sales?',
  },
];

const ChatIA: React.FC<ChatIAProps> = ({ cultivo, className = '', onAccionEjecutada }) => {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [imagenes, setImagenes] = useState<ImagenMensaje[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accionesEjecutadasIds, setAccionesEjecutadasIds] = useState<Record<string, boolean>>({});
  const [ejecutandoAccionId, setEjecutandoAccionId] = useState<string | null>(null);
  const [comentariosRecientes, setComentariosRecientes] = useState<ComentarioCultivo[]>([]);

  const { user } = useAuth();

  const inputFileRef = useRef<HTMLInputElement>(null);
  const mensajesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!cultivo.id) return;
    obtenerComentarios({ cultivoId: cultivo.id, _limit: 5 })
      .then((lista) => setComentariosRecientes(lista.slice(0, 5)))
      .catch(() => setComentariosRecientes([]));
  }, [cultivo.id]);

  const contexto: ContextoCultivo = useMemo(
    () => ({
      ...prepararContextoCultivo(cultivo),
      comentariosRecientes,
    }),
    [cultivo, comentariosRecientes]
  );
  const infoKB = useMemo(() => consultarTodosLosObjetivosKB(contexto), [contexto]);

  const scrollToBottom = useCallback(() => {
    if (mensajesContainerRef.current) {
      const container = mensajesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, scrollToBottom]);

  const ajustarAlturaTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleMensajeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMensaje(e.target.value);
    ajustarAlturaTextarea();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setError(null);
      const nuevasImagenes = await procesarImagenes(files);
      setImagenes((prev) => [...prev, ...nuevasImagenes]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar imágenes');
    }

    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  const handleEliminarImagen = (imagenId: string) => {
    setImagenes((prev) => {
      const imagenesActualizadas = prev.filter((img) => img.id !== imagenId);
      const imagenEliminada = prev.find((img) => img.id === imagenId);
      if (imagenEliminada) {
        limpiarImagenes([imagenEliminada]);
      }
      return imagenesActualizadas;
    });
  };

  const agregarMensaje = useCallback((nuevoMensaje: MensajeChat) => {
    setMensajes((prev) => {
      if (nuevoMensaje.tipo === 'system') {
        return [...prev.filter((m) => m.tipo !== 'system'), nuevoMensaje];
      }
      return [...prev.filter((m) => m.tipo !== 'system'), nuevoMensaje];
    });
  }, []);

  const enviarTextoDirecto = async (textoAEnviar: string) => {
    if (enviando) return;
    if (!textoAEnviar.trim() && imagenes.length === 0) return;

    setEnviando(true);
    setError(null);

    try {
      const mensajeIA = await gestionarConversacionIA(
        cultivo.id,
        textoAEnviar,
        contexto,
        imagenes.length > 0 ? imagenes : undefined,
        mensajes,
        agregarMensaje,
        user?.email
      );

      agregarMensaje(mensajeIA);
      setMensaje('');
      limpiarImagenes(imagenes);
      setImagenes([]);

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
    } finally {
      setEnviando(false);
    }
  };

  const handleEnviarMensaje = async () => {
    await enviarTextoDirecto(mensaje);
  };

  const handleEjecutarAccionKB = async (accion: AccionConocimiento) => {
    if (accionesEjecutadasIds[accion.id] || ejecutandoAccionId) return;
    setEjecutandoAccionId(accion.id);
    setError(null);

    try {
      if (accion.tipoAccion === 'actualizar_parametros' && accion.parametrosObjetivo) {
        const actualizado = await updateCultivo(cultivo.id, accion.parametrosObjetivo);
        setAccionesEjecutadasIds((prev) => ({ ...prev, [accion.id]: true }));
        onAccionEjecutada?.(actualizado);
      } else if (accion.tipoAccion === 'crear_tarea') {
        const fechaTarget = new Date();
        fechaTarget.setDate(fechaTarget.getDate() + (accion.diasOffset ?? 0));
        const fechaStr = fechaTarget.toISOString().split('T')[0];

        await createTarea({
          cultivoId: cultivo.id,
          titulo: accion.titulo,
          descripcion: accion.descripcion,
          tipo: accion.categoriaTarea || 'mantenimiento',
          estado: 'pendiente',
          prioridad: accion.prioridad || 'alta',
          fechaProgramada: fechaStr,
          duracionEstimada: accion.duracionEstimada || 30,
          esRecurrente: false,
          recordatorioActivado: true,
          minutosRecordatorio: 15,
        });
        setAccionesEjecutadasIds((prev) => ({ ...prev, [accion.id]: true }));
        onAccionEjecutada?.();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo ejecutar la acción automáticamente'
      );
    } finally {
      setEjecutandoAccionId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensaje();
    }
  };

  const renderMensaje = (msg: MensajeChat) => {
    const isUser = msg.tipo === 'user';
    const isSystem = msg.tipo === 'system';

    return (
      <div
        key={msg.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      >
        <div
          className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-5 py-4 shadow-2xs transition-all duration-200 ${isUser
              ? 'bg-emerald-600 text-white rounded-br-none'
              : isSystem
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
            }`}
        >
          {/* Badges de Fuente de Conocimiento y Ahorro de Tokens (solo para respuestas IA) */}
          {!isUser && !isSystem && (msg.fuentesConocimiento || msg.tokensUsados) && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5 pb-2 border-b border-slate-100">
              {msg.tokensUsados?.fuente === 'kb_local' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  ⚡ Base de Conocimiento · 0 Tokens
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[11px] font-bold">
                  🧠 Micro-RAG · {msg.tokensUsados?.total ?? 240} tokens
                </span>
              )}
              {msg.fuentesConocimiento?.slice(0, 2).map((fuente, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold"
                >
                  📚 {fuente}
                </span>
              ))}
            </div>
          )}

          {/* Mostrar imágenes si las hay */}
          {msg.imagenes && msg.imagenes.length > 0 && (
            <div className="mb-3 grid gap-2 grid-cols-2">
              {msg.imagenes.map((imagen) => (
                <Image
                  key={imagen.id}
                  src={imagen.url}
                  alt={imagen.name}
                  width={256}
                  height={256}
                  className="w-full rounded-xl max-h-32 object-cover border border-white/20"
                  unoptimized
                />
              ))}
            </div>
          )}

          {/* Contenido del mensaje */}
          <div className="whitespace-pre-wrap text-sm sm:text-[15px] leading-relaxed font-normal">
            {msg.contenido}
          </div>

          {/* Acciones Estandarizadas de la Base de Conocimiento (1-Click Execution) */}
          {!isUser && msg.accionesSugeridas && msg.accionesSugeridas.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>⚡</span>
                <span>Acciones Estandarizadas de la Base de Conocimiento:</span>
              </div>
              <div className="grid gap-2">
                {msg.accionesSugeridas.map((accion) => {
                  const yaEjecutada = Boolean(accionesEjecutadasIds[accion.id]);
                  const cargandoEsta = ejecutandoAccionId === accion.id;

                  return (
                    <div
                      key={accion.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            {accion.codigoKB}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{accion.titulo}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {accion.descripcion}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={yaEjecutada || cargandoEsta}
                        onClick={() => handleEjecutarAccionKB(accion)}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${yaEjecutada
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-default'
                            : accion.tipoAccion === 'actualizar_parametros'
                              ? 'bg-slate-900 hover:bg-emerald-600 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                      >
                        {yaEjecutada
                          ? '✓ Aplicada en Sala'
                          : cargandoEsta
                            ? 'Aplicando...'
                            : accion.tipoAccion === 'actualizar_parametros'
                              ? '⚡ Aplicar Parámetros'
                              : '📅 Agendar en Tareas'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div
            className={`text-xs mt-2 opacity-70 font-medium ${isUser ? 'text-green-100' : 'text-gray-400'
              }`}
          >
            {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>

          {msg.procesando && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                <div
                  className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
              <span className="text-xs font-medium">Consultando Base de Conocimiento...</span>
            </div>
          )}

          {msg.error && (
            <div className="text-xs text-red-500 mt-2 flex items-center gap-1 font-medium bg-red-50 px-2 py-1 rounded">
              Error al enviar
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col ${className}`}
      data-testid="chat-ia-component"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
      {/* Header del chat */}
      <div className="p-5 border-b border-slate-100 bg-slate-900 text-white" data-testid="chat-header">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white" data-testid="chat-title">
                Asistente Agronómico IA + Base de Conocimiento
              </h3>
              <p
                className="text-emerald-300 text-xs font-medium flex items-center gap-1.5 mt-0.5"
                data-testid="chat-subtitle"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Protocolo activo: {infoKB.codigoProtocolo} ({infoKB.sustratoDetectado.nombre})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
              ⚡ Modo Low-Token RAG
            </span>
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-semibold">
              🧬 {cultivo.genetica || 'Cultivo Activo'}
            </span>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div
        ref={mensajesContainerRef}
        className="h-[60vh] sm:h-[500px] overflow-y-auto p-6 space-y-2 bg-slate-50/70 scroll-smooth"
        data-testid="chat-messages-container"
      >
        {mensajes.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8"
            data-testid="chat-empty-state"
          >
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-3 text-3xl">
              🤖
            </div>
            <p className="font-extrabold text-slate-800 text-lg mb-1">
              Motor Agronómico de {cultivo.nombre}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-5">
              Conectado a la Base de Conocimiento Oficial ({infoKB.codigoProtocolo}). Las consultas de parámetros,
              planes de tareas y patologías se resuelven al instante con <strong>0 tokens</strong> y generan acciones ejecutables.
            </p>

            {/* Botones rápidos de Base de Conocimiento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full text-left">
              {CONSULTAS_RAPIDAS_KB.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => enviarTextoDirecto(item.prompt)}
                  className="p-3 rounded-xl bg-white hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-700 hover:text-emerald-900 transition-all shadow-2xs cursor-pointer flex items-center justify-between gap-2"
                >
                  <span>{item.label}</span>
                  <span className="text-emerald-600">→</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          mensajes.map(renderMensaje)
        )}
      </div>

      {/* Vista previa de imágenes seleccionadas */}
      {imagenes.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
          <div className="flex flex-wrap gap-3">
            {imagenes.map((imagen) => (
              <div key={imagen.id} className="relative group">
                <Image
                  src={imagen.url}
                  alt={imagen.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 object-cover rounded-xl border border-slate-200 shadow-2xs"
                  unoptimized
                />
                <button
                  onClick={() => handleEliminarImagen(imagen.id)}
                  className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-rose-700 transition-colors shadow-2xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mostrar error si existe */}
      {error && (
        <div className="px-6 py-3 border-t border-rose-200 bg-rose-50">
          <div className="flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Barra de consultas rápidas cuando ya hay conversación */}
      {mensajes.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0">
            📚 KB Rápida:
          </span>
          {CONSULTAS_RAPIDAS_KB.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={enviando}
              onClick={() => enviarTextoDirecto(item.prompt)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Input de mensaje */}
      <div className="p-4 sm:p-5 border-t border-slate-200 bg-white" data-testid="chat-input-section">
        <div className="flex items-end gap-2.5">
          <button
            onClick={() => inputFileRef.current?.click()}
            disabled={enviando}
            data-testid="chat-add-image-button"
            className="flex-shrink-0 p-3 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200 rounded-xl transition-all disabled:opacity-50"
            title="Agregar imágenes"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>

          <div className="flex-grow">
            <textarea
              ref={textareaRef}
              value={mensaje}
              onChange={handleMensajeChange}
              onKeyDown={handleKeyDown}
              placeholder="Consulta parámetros, pide tareas de la semana o describe un síntoma..."
              disabled={enviando}
              data-testid="chat-message-input"
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 px-4 py-2.5 text-sm placeholder-slate-400 disabled:opacity-50 min-h-[44px] max-h-32 text-slate-800 outline-none transition-all"
              rows={1}
            />
          </div>

          <button
            onClick={handleEnviarMensaje}
            disabled={enviando || (!mensaje.trim() && imagenes.length === 0)}
            data-testid="chat-send-button"
            className="flex-shrink-0 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
            title="Enviar mensaje"
          >
            {enviando ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>

        <input
          ref={inputFileRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex justify-between items-center mt-2.5 px-1 text-[11px] font-semibold text-slate-400">
          <span>Enter para enviar · Basado en {infoKB.codigoProtocolo} (Consistencia 100%)</span>
          <span>Máx 10MB por foto</span>
        </div>
      </div>
    </div>
  );
};

export default ChatIA;
