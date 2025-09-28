/**
 * Componente para gestión de comentarios/notas de cultivos
 * Permite crear, ver, editar y organizar comentarios específicos por cultivo
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type {
  ComentarioCultivo,
  TipoComentario,
  PrioridadComentario
} from '@/types/chat';
import {
  obtenerComentariosCultivo,
  crearComentario,
  actualizarComentario,
  eliminarComentario,
  crearComentarioRapido,
  obtenerEstadisticasComentarios
} from '@/lib/services/comentarios';
import { formatearFechaCompleta } from '@/lib/utils/date';

/**
 * Props del componente ComentariosCultivo
 */
interface ComentariosCultivoProps {
  /** ID del cultivo */
  cultivoId: string;
  /** Nombre del cultivo para contexto */
  nombreCultivo: string;
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Componente para formulario de comentario (crear/editar)
 */
interface FormularioComentarioProps {
  cultivoId: string;
  comentarioAEditar?: ComentarioCultivo; // Si existe, estamos editando
  onComentarioGuardado: (comentario: ComentarioCultivo) => void;
  onCancelar: () => void;
}

const FormularioComentario: React.FC<FormularioComentarioProps> = ({
  cultivoId,
  comentarioAEditar,
  onComentarioGuardado,
  onCancelar
}) => {
  // Estados del formulario con valores iniciales para edición
  const [titulo, setTitulo] = useState(comentarioAEditar?.titulo || '');
  const [contenido, setContenido] = useState(comentarioAEditar?.contenido || '');
  const [tipo, setTipo] = useState<TipoComentario>(comentarioAEditar?.tipo || 'observacion');
  const [prioridad, setPrioridad] = useState<PrioridadComentario>(comentarioAEditar?.prioridad || 'media');
  const [autor, setAutor] = useState(comentarioAEditar?.autor || 'Usuario'); // En producción, obtener del contexto de auth
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esEdicion = !!comentarioAEditar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!titulo.trim() || !contenido.trim()) {
      setError('Título y contenido son requeridos');
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      let comentarioGuardado: ComentarioCultivo;

      if (esEdicion) {
        // Actualizar comentario existente
        comentarioGuardado = await actualizarComentario(comentarioAEditar.id, {
          titulo: titulo.trim(),
          contenido: contenido.trim(),
          autor,
          tipo,
          prioridad
        });
      } else {
        // Crear nuevo comentario
        const nuevoComentario = crearComentarioRapido(
          cultivoId,
          titulo.trim(),
          contenido.trim(),
          autor,
          tipo,
          prioridad
        );
        comentarioGuardado = await crearComentario(nuevoComentario);
      }

      onComentarioGuardado(comentarioGuardado);
      
      // Si es creación, limpiar formulario
      if (!esEdicion) {
        setTitulo('');
        setContenido('');
        setTipo('observacion');
        setPrioridad('media');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : `Error al ${esEdicion ? 'actualizar' : 'crear'} comentario`);
    } finally {
      setGuardando(false);
    }
  };

  const tiposComentario: { value: TipoComentario; label: string; icon: string }[] = [
    { value: 'observacion', label: 'Observación', icon: '👁️' },
    { value: 'problema', label: 'Problema', icon: '⚠️' },
    { value: 'solucion', label: 'Solución', icon: '✅' },
    { value: 'fertilizacion', label: 'Fertilización', icon: '🌱' },
    { value: 'riego', label: 'Riego', icon: '💧' },
    { value: 'plagas', label: 'Plagas', icon: '🐛' },
    { value: 'enfermedad', label: 'Enfermedad', icon: '🏥' },
    { value: 'cosecha', label: 'Cosecha', icon: '🌿' },
    { value: 'mantenimiento', label: 'Mantenimiento', icon: '🔧' }
  ];

  const prioridades: { value: PrioridadComentario; label: string; color: string }[] = [
    { value: 'baja', label: 'Baja', color: 'text-blue-600 bg-blue-50' },
    { value: 'media', label: 'Media', color: 'text-yellow-600 bg-yellow-50' },
    { value: 'alta', label: 'Alta', color: 'text-orange-600 bg-orange-50' },
    { value: 'critica', label: 'Crítica', color: 'text-red-600 bg-red-50' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Título */}
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
          Título
        </label>
        <input
          id="titulo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título breve del comentario..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500"
          disabled={guardando}
        />
      </div>

      {/* Contenido */}
      <div>
        <label htmlFor="contenido" className="block text-sm font-medium text-gray-700 mb-1">
          Contenido
        </label>
        <textarea
          id="contenido"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Describe la observación, problema, solución aplicada, etc..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 resize-none"
          disabled={guardando}
        />
      </div>

      {/* Tipo y Prioridad en fila */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tipo */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoComentario)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500"
            disabled={guardando}
          >
            {tiposComentario.map((t) => (
              <option key={t.value} value={t.value}>
                {t.icon} {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prioridad */}
        <div>
          <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad
          </label>
          <select
            id="prioridad"
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value as PrioridadComentario)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500"
            disabled={guardando}
          >
            {prioridades.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Autor */}
      <div>
        <label htmlFor="autor" className="block text-sm font-medium text-gray-700 mb-1">
          Autor
        </label>
        <input
          id="autor"
          type="text"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500"
          disabled={guardando}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={guardando || !titulo.trim() || !contenido.trim()}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {guardando ? 'Guardando...' : (esEdicion ? 'Actualizar Comentario' : 'Guardar Comentario')}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

/**
 * Componente para mostrar un comentario individual
 */
interface TarjetaComentarioProps {
  comentario: ComentarioCultivo;
  onEliminar: (id: string) => void;
  onEditar: (comentario: ComentarioCultivo) => void;
}

const TarjetaComentario: React.FC<TarjetaComentarioProps> = ({
  comentario,
  onEliminar,
  onEditar
}) => {
  const [mostrarAcciones, setMostrarAcciones] = useState(false);

  const tipoIconos: Record<TipoComentario, string> = {
    observacion: '👁️',
    problema: '⚠️',
    solucion: '✅',
    fertilizacion: '🌱',
    riego: '💧',
    plagas: '🐛',
    enfermedad: '🏥',
    cosecha: '🌿',
    mantenimiento: '🔧'
  };

  const prioridadColors: Record<PrioridadComentario, string> = {
    baja: 'text-blue-600 bg-blue-50 border-blue-200',
    media: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    alta: 'text-orange-600 bg-orange-50 border-orange-200',
    critica: 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{tipoIconos[comentario.tipo]}</span>
          <h4 className="font-medium text-gray-900">{comentario.titulo}</h4>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Badge de prioridad */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${prioridadColors[comentario.prioridad]}`}>
            {comentario.prioridad}
          </span>
          
          {/* Menú de acciones */}
          <div className="relative">
            <button
              onClick={() => setMostrarAcciones(!mostrarAcciones)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            {mostrarAcciones && (
              <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={() => {
                    onEditar(comentario);
                    setMostrarAcciones(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de eliminar este comentario? Esta acción no se puede deshacer.')) {
                      onEliminar(comentario.id);
                    }
                    setMostrarAcciones(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <p className="text-gray-700 text-sm mb-3 leading-relaxed">
        {comentario.contenido}
      </p>

      {/* Tags si existen */}
      {comentario.tags && comentario.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {comentario.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Por {comentario.autor}</span>
        <span>{formatearFechaCompleta(comentario.fecha)}</span>
      </div>
    </div>
  );
};

/**
 * Componente principal de comentarios
 */
const ComentariosCultivo: React.FC<ComentariosCultivoProps> = ({
  cultivoId,
  nombreCultivo,
  className = ''
}) => {
  const [comentarios, setComentarios] = useState<ComentarioCultivo[]>([]);
  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  const [comentarioEditando, setComentarioEditando] = useState<ComentarioCultivo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga los comentarios del cultivo
   */
  const cargarComentarios = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const comentariosData = await obtenerComentariosCultivo(cultivoId);
      setComentarios(comentariosData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar comentarios');
    } finally {
      setCargando(false);
    }
  }, [cultivoId]);

  // Cargar comentarios al montar
  useEffect(() => {
    cargarComentarios();
  }, [cargarComentarios]);

  /**
   * Maneja la creación o actualización de un comentario
   */
  const handleComentarioGuardado = (comentarioGuardado: ComentarioCultivo) => {
    if (comentarioEditando) {
      // Actualizar comentario existente
      setComentarios(prev => 
        prev.map(c => c.id === comentarioGuardado.id ? comentarioGuardado : c)
      );
      setComentarioEditando(null);
    } else {
      // Agregar nuevo comentario
      setComentarios(prev => [comentarioGuardado, ...prev]);
      setMostrandoFormulario(false);
    }
  };

  /**
   * Maneja el inicio de edición de un comentario
   */
  const handleEditarComentario = (comentario: ComentarioCultivo) => {
    setComentarioEditando(comentario);
    setMostrandoFormulario(false); // Cerrar formulario de creación si está abierto
  };

  /**
   * Cancela la edición
   */
  const handleCancelarEdicion = () => {
    setComentarioEditando(null);
  };

  /**
   * Maneja la eliminación de un comentario
   */
  const handleEliminar = async (id: string) => {
    try {
      await eliminarComentario(id);
      setComentarios(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      alert('Error al eliminar comentario: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };


  const estadisticas = obtenerEstadisticasComentarios(comentarios);

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Comentarios y Notas</h3>
              <p className="text-gray-600 text-sm">{nombreCultivo} • {estadisticas.total} comentarios</p>
            </div>
          </div>
          
          <button
            onClick={() => setMostrandoFormulario(!mostrandoFormulario)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Comentario
          </button>
        </div>
      </div>

      {/* Formulario de nuevo comentario */}
      {mostrandoFormulario && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Nuevo Comentario</h4>
          <FormularioComentario
            cultivoId={cultivoId}
            onComentarioGuardado={handleComentarioGuardado}
            onCancelar={() => setMostrandoFormulario(false)}
          />
        </div>
      )}

      {/* Modal de edición */}
      {comentarioEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium text-gray-900">Editar Comentario</h4>
                <button
                  onClick={handleCancelarEdicion}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <FormularioComentario
                cultivoId={cultivoId}
                comentarioAEditar={comentarioEditando}
                onComentarioGuardado={handleComentarioGuardado}
                onCancelar={handleCancelarEdicion}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lista de comentarios */}
      <div className="p-6">
        {cargando ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600"></div>
              <span className="text-gray-600">Cargando comentarios...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-600 mb-2">Error al cargar comentarios</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={cargarComentarios}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : comentarios.length === 0 ? (
          <div className="text-center py-8">
            <svg className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className="text-gray-500 mb-2">No hay comentarios aún</p>
            <p className="text-sm text-gray-400 mb-4">
              Agrega el primer comentario para comenzar a documentar tu cultivo
            </p>
            <button
              onClick={() => setMostrandoFormulario(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agregar Comentario
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {comentarios.map((comentario) => (
              <TarjetaComentario
                key={comentario.id}
                comentario={comentario}
                onEliminar={handleEliminar}
                onEditar={handleEditarComentario}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComentariosCultivo;
