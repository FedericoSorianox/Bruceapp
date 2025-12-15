/**
 * Componente de Chat con IA especializada en Cannabis Medicinal
 * Interfaz completa para conversar con la IA, subir imágenes y recibir consejos
 * expertos basados en el contexto específico del cultivo
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type {
  MensajeChat,
  ContextoCultivo,
  ImagenMensaje
} from '@/types/chat';
import type { Cultivo } from '@/types/cultivo';
import {
  gestionarConversacionIA,
  procesarImagenes,
  limpiarImagenes,
  prepararContextoCultivo
} from '@/lib/services/chat';

/**
 * Props del componente ChatIA
 */
interface ChatIAProps {
  /** Datos completos del cultivo para contexto */
  cultivo: Cultivo;
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

/**
 * Componente principal del chat con IA
 * Maneja toda la lógica de conversación, subida de imágenes y renderizado
 */
const ChatIA: React.FC<ChatIAProps> = ({ cultivo, className = '' }) => {
  // Estados principales
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [imagenes, setImagenes] = useState<ImagenMensaje[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Referencias para el DOM
  const inputFileRef = useRef<HTMLInputElement>(null);
  const mensajesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Contexto del cultivo preparado para la IA
  const contexto: ContextoCultivo = prepararContextoCultivo(cultivo);

  /**
   * Auto-scroll al último mensaje cuando se agregan nuevos mensajes
   */
  const scrollToBottom = useCallback(() => {
    if (mensajesContainerRef.current) {
      const container = mensajesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Scroll automático cuando cambian los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [mensajes, scrollToBottom]);

  /**
   * Ajusta automáticamente la altura del textarea según el contenido
   */
  const ajustarAlturaTextarea = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  /**
   * Maneja el cambio en el texto del mensaje
   */
  const handleMensajeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMensaje(e.target.value);
    ajustarAlturaTextarea();
  };

  /**
   * Maneja la selección de archivos de imagen
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setError(null);
      const nuevasImagenes = await procesarImagenes(files);
      setImagenes(prev => [...prev, ...nuevasImagenes]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al procesar imágenes');
    }

    // Limpiar input
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  /**
   * Elimina una imagen seleccionada
   */
  const handleEliminarImagen = (imagenId: string) => {
    setImagenes(prev => {
      const imagenesActualizadas = prev.filter(img => img.id !== imagenId);
      const imagenEliminada = prev.find(img => img.id === imagenId);
      if (imagenEliminada) {
        limpiarImagenes([imagenEliminada]);
      }
      return imagenesActualizadas;
    });
  };

  /**
   * Añade un nuevo mensaje al chat
   */
  const agregarMensaje = useCallback((nuevoMensaje: MensajeChat) => {
    setMensajes(prev => {
      // Si es un mensaje del sistema, remover mensajes del sistema anteriores
      if (nuevoMensaje.tipo === 'system') {
        return [...prev.filter(m => m.tipo !== 'system'), nuevoMensaje];
      }
      return [...prev, nuevoMensaje];
    });
  }, []);

  /**
   * Actualiza un mensaje existente (útil para remover estado de "procesando")
   
  const actualizarMensaje = useCallback((mensajeId: string, cambios: Partial<MensajeChat>) => {
    setMensajes(prev => prev.map(m => 
      m.id === mensajeId ? { ...m, ...cambios } : m
    ));
  }, []);

  
   * Envía mensaje a la IA y maneja toda la conversación
   */
  const handleEnviarMensaje = async () => {
    // Validaciones
    if (enviando) return;
    if (!mensaje.trim() && imagenes.length === 0) return;

    setEnviando(true);
    setError(null);

    try {
      // Gestionar conversación completa con la IA
      const mensajeIA = await gestionarConversacionIA(
        cultivo.id,
        mensaje,
        contexto,
        imagenes.length > 0 ? imagenes : undefined,
        mensajes,
        agregarMensaje
      );

      // Agregar respuesta de la IA
      agregarMensaje(mensajeIA);

      // Limpiar inputs
      setMensaje('');
      limpiarImagenes(imagenes);
      setImagenes([]);

      // Resetear altura del textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al enviar mensaje');
    } finally {
      setEnviando(false);
    }
  };

  /**
   * Maneja el envío con Enter (Shift+Enter para nueva línea)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensaje();
    }
  };


  /**
   * Renderiza un mensaje individual
   */
  const renderMensaje = (msg: MensajeChat) => {
    const isUser = msg.tipo === 'user';
    const isSystem = msg.tipo === 'system';

    return (
      <div
        key={msg.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      >
        <div
          className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-200 ${isUser
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-br-none shadow-green-200/50'
            : isSystem
              ? 'bg-yellow-50/90 text-yellow-800 border border-yellow-200/50'
              : 'bg-white/80 text-gray-800 border border-white/50 rounded-bl-none shadow-gray-200/50'
            }`}
        >
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
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed font-normal">
            {msg.contenido}
          </div>

          {/* Timestamp */}
          <div className={`text-xs mt-2 opacity-70 font-medium ${isUser ? 'text-green-100' : 'text-gray-400'
            }`}>
            {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>

          {/* Indicador de procesando */}
          {msg.procesando && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-xs font-medium">Pensando...</span>
            </div>
          )}

          {/* Indicador de error */}
          {msg.error && (
            <div className="text-xs text-red-500 mt-2 flex items-center gap-1 font-medium bg-red-50 px-2 py-1 rounded">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Error al enviar
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden flex flex-col ${className}`} data-testid="chat-ia-component">
      {/* Header del chat */}
      <div className="p-5 border-b border-white/30 bg-gradient-to-r from-white/50 to-green-50/30" data-testid="chat-header">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-50 text-green-600 shadow-inner">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800" data-testid="chat-title">Asistente Virtual</h3>
            <p className="text-green-700 text-xs font-medium flex items-center gap-1" data-testid="chat-subtitle">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              En línea • {cultivo.nombre}
            </p>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div
        ref={mensajesContainerRef}
        className="h-[60vh] sm:h-[500px] overflow-y-auto p-6 space-y-2 bg-gradient-to-b from-transparent to-white/20 scroll-smooth"
        data-testid="chat-messages-container"
      >
        {mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60" data-testid="chat-empty-state">
            <div className="bg-green-50 p-6 rounded-full mb-4">
              <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700 text-lg mb-2">¡Hola! Soy tu experto en cannabis</p>
            <p className="text-sm text-gray-500 max-w-xs">
              Pregúntame lo que sea sobre tu cultivo o sube fotos para que las analice.
            </p>
          </div>
        ) : (
          mensajes.map(renderMensaje)
        )}
      </div>

      {/* Vista previa de imágenes seleccionadas */}
      {imagenes.length > 0 && (
        <div className="px-6 py-3 border-t border-white/30 bg-white/40 backdrop-blur-sm">
          <div className="flex flex-wrap gap-3">
            {imagenes.map((imagen) => (
              <div key={imagen.id} className="relative group scale-up-center">
                <Image
                  src={imagen.url}
                  alt={imagen.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 object-cover rounded-xl border-2 border-white shadow-sm"
                  unoptimized
                />
                <button
                  onClick={() => handleEliminarImagen(imagen.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm"
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
        <div className="px-6 py-3 border-t border-red-100 bg-red-50/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Input de mensaje */}
      <div className="p-5 border-t border-white/30 bg-white/60 backdrop-blur-md" data-testid="chat-input-section">
        <div className="flex items-end gap-3">
          {/* Botón para agregar imágenes */}
          <button
            onClick={() => inputFileRef.current?.click()}
            disabled={enviando}
            data-testid="chat-add-image-button"
            className="flex-shrink-0 p-3 text-gray-500 hover:text-green-600 hover:bg-green-100/50 rounded-2xl transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95"
            title="Agregar imágenes"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Textarea del mensaje */}
          <div className="flex-grow shadow-inner rounded-2xl bg-white/50">
            <textarea
              ref={textareaRef}
              value={mensaje}
              onChange={handleMensajeChange}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              disabled={enviando}
              data-testid="chat-message-input"
              className="w-full resize-none rounded-2xl border-0 bg-transparent px-4 py-3 text-sm focus:ring-2 focus:ring-green-400/50 placeholder-gray-400 disabled:opacity-50 min-h-[48px] max-h-32 text-gray-800"
              rows={1}
            />
          </div>

          {/* Botón de enviar */}
          <button
            onClick={handleEnviarMensaje}
            disabled={enviando || (!mensaje.trim() && imagenes.length === 0)}
            data-testid="chat-send-button"
            className="flex-shrink-0 p-3 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-2xl hover:shadow-lg hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-green-600/20 shadow-md"
            title="Enviar mensaje"
          >
            {enviando ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* Input file oculto */}
        <input
          ref={inputFileRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Ayuda sobre controles */}
        <div className="flex justify-between items-center mt-3 px-1 text-[11px] font-medium text-gray-400 uppercase tracking-wide">
          <span>Shift + Enter: Nueva línea</span>
          <span>Max 10MB</span>
        </div>
      </div>
    </div>
  );
};

export default ChatIA;
