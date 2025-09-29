/**
 * Modelo de Mongoose para Mensajes de Chat con IA
 * 
 * Define el esquema y modelo de MongoDB para la gestión del chat con inteligencia artificial.
 * Incluye soporte para imágenes, contexto de cultivo y historial de conversaciones.
 * 
 * Características:
 * - Mensajes de usuario y respuestas de IA
 * - Soporte para análisis de imágenes
 * - Contexto de cultivo asociado
 * - Historial de conversaciones
 * - Métricas de tokens utilizados
 * - Estado de procesamiento
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import type { 
  MensajeChat, 
  TipoMensaje, 
  TipoContenido,
  ImagenMensaje 
} from '@/types/chat';

// Extender el tipo base con las propiedades de Mongoose Document
export interface MensajeChatDocument extends Omit<MensajeChat, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Schema para imágenes del mensaje
const ImagenMensajeSchema = new Schema<ImagenMensaje>({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  name: {
    type: String,
    required: [true, 'El nombre de la imagen es obligatorio'],
    maxlength: [255, 'El nombre no puede exceder 255 caracteres']
  },
  url: {
    type: String,
    required: [true, 'La URL de la imagen es obligatoria'],
    validate: {
      validator: function(v: string) {
        return /^(https?:\/\/|\/|data:image\/)/.test(v);
      },
      message: 'La URL de la imagen no es válida'
    }
  },
  base64: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[A-Za-z0-9+/]*={0,2}$/.test(v);
      },
      message: 'El formato base64 no es válido'
    }
  },
  mimeType: {
    type: String,
    required: [true, 'El tipo MIME es obligatorio'],
    validate: {
      validator: function(v: string) {
        return /^image\//.test(v);
      },
      message: 'El tipo MIME debe ser de imagen'
    }
  },
  size: {
    type: Number,
    required: [true, 'El tamaño de la imagen es obligatorio'],
    min: [1, 'El tamaño debe ser mayor a 0'],
    max: [10485760, 'El tamaño no puede exceder 10MB'] // 10MB límite
  },
  uploadedAt: {
    type: String,
    required: true,
    default: () => new Date().toISOString()
  }
}, { _id: false }); // No crear _id automático para subdocumentos

// Schema principal del Mensaje de Chat
const MensajeChatSchema = new Schema<MensajeChatDocument>({
  // ===== RELACIÓN CON CULTIVO =====
  cultivoId: {
    type: String,
    required: [true, 'El ID del cultivo es obligatorio'],
    index: true // Índice para consultas rápidas por cultivo
  },

  // ===== TIPO Y CONTENIDO DEL MENSAJE =====
  tipo: {
    type: String,
    required: [true, 'El tipo de mensaje es obligatorio'],
    enum: {
      values: ['user', 'assistant', 'system'] as TipoMensaje[],
      message: 'Tipo de mensaje no válido: {VALUE}'
    },
    index: true // Para filtrar por tipo de mensaje
  },
  contenido: {
    type: String,
    required: [true, 'El contenido del mensaje es obligatorio'],
    trim: true,
    maxlength: [10000, 'El contenido no puede exceder 10,000 caracteres']
  },
  tipoContenido: {
    type: String,
    required: [true, 'El tipo de contenido es obligatorio'],
    enum: {
      values: ['text', 'image', 'mixed'] as TipoContenido[],
      message: 'Tipo de contenido no válido: {VALUE}'
    },
    default: 'text'
  },

  // ===== MULTIMEDIA =====
  imagenes: {
    type: [ImagenMensajeSchema],
    default: [],
    validate: {
      validator: function(v: ImagenMensaje[]) {
        return v.length <= 5; // Máximo 5 imágenes por mensaje
      },
      message: 'No se pueden enviar más de 5 imágenes por mensaje'
    }
  },

  // ===== INFORMACIÓN TEMPORAL =====
  timestamp: {
    type: String,
    required: true,
    default: () => new Date().toISOString(),
    validate: {
      validator: function(v: string) {
        return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v);
      },
      message: 'El timestamp debe estar en formato ISO string'
    },
    index: true // Para ordenar por fecha
  },

  // ===== ESTADO DE PROCESAMIENTO =====
  procesando: {
    type: Boolean,
    default: false,
    index: true // Para encontrar mensajes en procesamiento
  },
  error: {
    type: String,
    maxlength: [500, 'El mensaje de error no puede exceder 500 caracteres']
  },

  // ===== RELACIONES ENTRE MENSAJES =====
  respuestaA: {
    type: String,
    // Índice definido explícitamente más abajo para evitar duplicados
  },

  // ===== MÉTRICAS DE IA (solo para mensajes assistant) =====
  tokensUsados: {
    type: {
      prompt: {
        type: Number,
        min: [0, 'Los tokens del prompt no pueden ser negativos']
      },
      completion: {
        type: Number,
        min: [0, 'Los tokens de completion no pueden ser negativos']
      },
      total: {
        type: Number,
        min: [0, 'Los tokens totales no pueden ser negativos']
      }
    },
    default: undefined
  },

  // ===== METADATOS DEL CONTEXTO =====
  contextoEnviado: {
    type: Boolean,
    default: false // Si se envió contexto del cultivo con este mensaje
  },
  versionContexto: {
    type: String,
    maxlength: [50, 'La versión del contexto no puede exceder 50 caracteres']
  },

  // ===== CALIDAD Y FEEDBACK =====
  calificacion: {
    type: Number,
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5']
  },
  feedback: {
    type: String,
    maxlength: [1000, 'El feedback no puede exceder 1,000 caracteres']
  },

  // ===== AUDITORÍA =====
  usuarioId: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'El email del usuario no es válido'
    }
  },
  ipAddress: {
    type: String,
    validate: {
      validator: function(v: string) {
        // Validar IPv4 o IPv6
        return !v || /^(\d{1,3}\.){3}\d{1,3}$/.test(v) || /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(v);
      },
      message: 'La dirección IP no es válida'
    }
  },

  // ===== ESTADO Y VISIBILIDAD =====
  activo: {
    type: Boolean,
    default: true,
    index: true // Para filtrar mensajes activos
  },
  destacado: {
    type: Boolean,
    default: false,
    index: true // Para mensajes importantes
  }
}, {
  // Opciones del schema
  timestamps: false, // Manejamos fechas manualmente
  collection: 'mensajes_chat', // Nombre explícito de la colección
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString(); // Mapear _id a id para compatibilidad
      delete (ret as any)._id;
      delete (ret as any).__v;
      delete (ret as any).activo;
      delete (ret as any).ipAddress; // No exponer IP en respuestas
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ===== MÉTODOS VIRTUALES =====

// Verificar si tiene imágenes
MensajeChatSchema.virtual('tieneImagenes').get(function() {
  return this.imagenes && this.imagenes.length > 0;
});

// Obtener número de imágenes
MensajeChatSchema.virtual('numeroImagenes').get(function() {
  return this.imagenes ? this.imagenes.length : 0;
});

// Calcular tiempo transcurrido desde el mensaje
MensajeChatSchema.virtual('tiempoTranscurrido').get(function() {
  const ahora = new Date();
  const fechaMensaje = new Date(this.timestamp);
  const diff = ahora.getTime() - fechaMensaje.getTime();
  
  const minutos = Math.floor(diff / (1000 * 60));
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  
  if (dias > 0) return `${dias} día${dias > 1 ? 's' : ''}`;
  if (horas > 0) return `${horas} hora${horas > 1 ? 's' : ''}`;
  if (minutos > 0) return `${minutos} minuto${minutos > 1 ? 's' : ''}`;
  return 'Hace un momento';
});

// Verificar si es un mensaje reciente (última hora)
MensajeChatSchema.virtual('esReciente').get(function() {
  const hace1h = new Date();
  hace1h.setHours(hace1h.getHours() - 1);
  return new Date(this.timestamp) >= hace1h;
});

// Obtener resumen del contenido
MensajeChatSchema.virtual('resumen').get(function() {
  if (!this.contenido) return '';
  return this.contenido.length > 150 
    ? this.contenido.substring(0, 150) + '...'
    : this.contenido;
});

// Verificar si es respuesta de IA
MensajeChatSchema.virtual('esRespuestaIA').get(function() {
  return this.tipo === 'assistant';
});

// Verificar si tiene métricas de tokens
MensajeChatSchema.virtual('tieneMetricasTokens').get(function() {
  return this.tokensUsados && this.tokensUsados.total > 0;
});

// ===== ÍNDICES COMPUESTOS =====
MensajeChatSchema.index({ cultivoId: 1, timestamp: -1 }); // Para historial del chat por cultivo
MensajeChatSchema.index({ tipo: 1, cultivoId: 1, timestamp: -1 }); // Para filtrar por tipo de mensaje
MensajeChatSchema.index({ procesando: 1, timestamp: 1 }); // Para encontrar mensajes en procesamiento
MensajeChatSchema.index({ respuestaA: 1 }); // Para cadenas de conversación
MensajeChatSchema.index({ usuarioId: 1, timestamp: -1 }); // Para historial por usuario
MensajeChatSchema.index({ destacado: 1, timestamp: -1 }); // Para mensajes destacados
MensajeChatSchema.index({ contenido: 'text' }); // Búsqueda full-text en contenido

// ===== MIDDLEWARE =====

// Pre-save: Actualizar tipo de contenido basado en imágenes
MensajeChatSchema.pre('save', function(next) {
  if (this.isModified('imagenes') || this.isModified('contenido')) {
    const tieneImagenes = this.imagenes && this.imagenes.length > 0;
    const tieneTexto = this.contenido && this.contenido.trim().length > 0;
    
    if (tieneImagenes && tieneTexto) {
      this.tipoContenido = 'mixed';
    } else if (tieneImagenes) {
      this.tipoContenido = 'image';
    } else {
      this.tipoContenido = 'text';
    }
  }
  next();
});

// Pre-save: Marcar como no procesando si hay error
MensajeChatSchema.pre('save', function(next) {
  if (this.isModified('error') && this.error) {
    this.procesando = false;
  }
  next();
});

// Pre-save: Calcular total de tokens automáticamente
MensajeChatSchema.pre('save', function(next) {
  if (this.tokensUsados && (this.isModified('tokensUsados.prompt') || this.isModified('tokensUsados.completion'))) {
    this.tokensUsados.total = (this.tokensUsados.prompt || 0) + (this.tokensUsados.completion || 0);
  }
  next();
});

// ===== MÉTODOS ESTÁTICOS =====

// Obtener historial de chat por cultivo
MensajeChatSchema.statics.findHistorialByCultivo = function(cultivoId: string, limite: number = 50) {
  return this.find({ 
    cultivoId, 
    activo: true 
  })
  .sort({ timestamp: -1 })
  .limit(limite);
};

// Obtener conversación específica (mensaje y respuestas)
MensajeChatSchema.statics.findConversacion = function(mensajeId: string) {
  return this.find({
    $or: [
      { _id: mensajeId },
      { respuestaA: mensajeId }
    ],
    activo: true
  }).sort({ timestamp: 1 });
};

// Buscar mensajes en procesamiento
MensajeChatSchema.statics.findEnProcesamiento = function() {
  return this.find({ 
    procesando: true,
    activo: true 
  }).sort({ timestamp: 1 });
};

// Buscar mensajes con errores
MensajeChatSchema.statics.findConErrores = function(cultivoId?: string) {
  const query: any = { 
    error: { $exists: true, $ne: null },
    activo: true 
  };
  if (cultivoId) query.cultivoId = cultivoId;
  
  return this.find(query).sort({ timestamp: -1 });
};

// Obtener estadísticas de uso
MensajeChatSchema.statics.getStats = async function(cultivoId?: string) {
  const match: any = { activo: true };
  if (cultivoId) match.cultivoId = cultivoId;
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalMensajes: { $sum: 1 },
        mensajesUsuario: { $sum: { $cond: [{ $eq: ['$tipo', 'user'] }, 1, 0] } },
        mensajesIA: { $sum: { $cond: [{ $eq: ['$tipo', 'assistant'] }, 1, 0] } },
        mensajesSistema: { $sum: { $cond: [{ $eq: ['$tipo', 'system'] }, 1, 0] } },
        conImagenes: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$imagenes', []] } }, 0] }, 1, 0] } },
        conErrores: { $sum: { $cond: [{ $and: [{ $exists: ['$error'] }, { $ne: ['$error', null] }] }, 1, 0] } },
        totalTokens: { $sum: { $ifNull: ['$tokensUsados.total', 0] } }
      }
    }
  ]);
  
  const result = stats[0] || {
    totalMensajes: 0,
    mensajesUsuario: 0,
    mensajesIA: 0,
    mensajesSistema: 0,
    conImagenes: 0,
    conErrores: 0,
    totalTokens: 0
  };
  
  // Obtener actividad por días
  const actividadStats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: { $dateFromString: { dateString: '$timestamp' } } } },
        mensajes: { $sum: 1 },
        tokens: { $sum: { $ifNull: ['$tokensUsados.total', 0] } }
      }
    },
    { $sort: { _id: -1 } },
    { $limit: 30 } // Últimos 30 días
  ]);
  
  result.actividadReciente = actividadStats;
  
  return result;
};

// Buscar mensajes por contenido
MensajeChatSchema.statics.search = function(query: string, cultivoId?: string) {
  const searchQuery: any = {
    $text: { $search: query },
    activo: true
  };
  if (cultivoId) searchQuery.cultivoId = cultivoId;
  
  return this.find(searchQuery, {
    score: { $meta: 'textScore' }
  }).sort({ 
    score: { $meta: 'textScore' },
    timestamp: -1 
  });
};

// Obtener mensajes destacados
MensajeChatSchema.statics.findDestacados = function(cultivoId?: string) {
  const query: any = { destacado: true, activo: true };
  if (cultivoId) query.cultivoId = cultivoId;
  
  return this.find(query).sort({ timestamp: -1 });
};

// Limpiar mensajes antiguos (más de X días)
MensajeChatSchema.statics.limpiarAntiguos = async function(diasAntiguedad: number = 90) {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);
  
  return this.updateMany(
    { 
      timestamp: { $lt: fechaLimite.toISOString() },
      destacado: { $ne: true } // No eliminar mensajes destacados
    },
    { activo: false }
  );
};

// ===== MÉTODOS DE INSTANCIA =====

// Marcar mensaje como procesando
MensajeChatSchema.methods.marcarProcesando = function() {
  this.procesando = true;
  this.error = undefined;
  return this.save();
};

// Marcar mensaje como completado
MensajeChatSchema.methods.marcarCompletado = function() {
  this.procesando = false;
  this.error = undefined;
  return this.save();
};

// Marcar mensaje con error
MensajeChatSchema.methods.marcarError = function(mensajeError: string) {
  this.procesando = false;
  this.error = mensajeError;
  return this.save();
};

// Destacar mensaje
MensajeChatSchema.methods.destacar = function() {
  this.destacado = true;
  return this.save();
};

// Quitar destacado
MensajeChatSchema.methods.quitarDestacado = function() {
  this.destacado = false;
  return this.save();
};

// Calificar respuesta de IA
MensajeChatSchema.methods.calificar = function(puntuacion: number, comentario?: string) {
  if (this.tipo !== 'assistant') {
    throw new Error('Solo se pueden calificar respuestas de IA');
  }
  
  this.calificacion = Math.max(1, Math.min(5, puntuacion));
  if (comentario) this.feedback = comentario;
  return this.save();
};

// Archivar mensaje
MensajeChatSchema.methods.archivar = function() {
  this.activo = false;
  return this.save();
};

// Restaurar mensaje archivado
MensajeChatSchema.methods.restaurar = function() {
  this.activo = true;
  return this.save();
};

// ===== VALIDACIONES PERSONALIZADAS =====

// Validar que los mensajes assistant tengan respuestaA
MensajeChatSchema.path('tipo').validate(function(value: TipoMensaje) {
  if (value === 'assistant' && !this.respuestaA) {
    // Los mensajes de IA deben ser respuesta a algo
    return false;
  }
  return true;
}, 'Los mensajes de IA deben ser respuesta a un mensaje de usuario');

// Validar que los tokens solo estén en mensajes assistant
MensajeChatSchema.path('tokensUsados').validate(function(value: any) {
  if (value && this.tipo !== 'assistant') {
    return false;
  }
  return true;
}, 'Solo los mensajes de IA pueden tener métricas de tokens');

// Validar calificación solo en mensajes assistant
MensajeChatSchema.path('calificacion').validate(function(value: number) {
  if (value && this.tipo !== 'assistant') {
    return false;
  }
  return true;
}, 'Solo las respuestas de IA pueden ser calificadas');

// Crear y exportar el modelo
const MensajeChat: Model<MensajeChatDocument> = mongoose.models.MensajeChat || mongoose.model<MensajeChatDocument>('MensajeChat', MensajeChatSchema);

export default MensajeChat;
