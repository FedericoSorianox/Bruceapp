/**
 * Modelo de Mongoose para Comentarios de Cultivo
 * 
 * Define el esquema y modelo de MongoDB para la gestión de comentarios específicos de cultivos.
 * Incluye validaciones, categorización por tipo y sistema de prioridades.
 * 
 * Características:
 * - Comentarios específicos por cultivo
 * - Categorización por tipo de observación
 * - Sistema de prioridades
 * - Soporte para imágenes adjuntas
 * - Búsqueda full-text
 * - Auditoría completa
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import type { 
  ComentarioCultivo, 
  TipoComentario, 
  PrioridadComentario,
  ImagenMensaje 
} from '@/types/chat';

// Extender el tipo base con las propiedades de Mongoose Document
export interface ComentarioDocument extends Omit<ComentarioCultivo, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Schema para imágenes adjuntas
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

// Schema principal del Comentario
const ComentarioSchema = new Schema<ComentarioDocument>({
  // ===== RELACIÓN CON CULTIVO =====
  cultivoId: {
    type: String,
    required: [true, 'El ID del cultivo es obligatorio'],
    index: true // Índice para consultas rápidas por cultivo
  },

  // ===== INFORMACIÓN BÁSICA =====
  titulo: {
    type: String,
    required: [true, 'El título del comentario es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres'],
    index: true // Para búsquedas por título
  },
  contenido: {
    type: String,
    required: [true, 'El contenido del comentario es obligatorio'],
    trim: true,
    maxlength: [2000, 'El contenido no puede exceder 2,000 caracteres']
  },

  // ===== AUTORÍA =====
  autor: {
    type: String,
    required: [true, 'El autor del comentario es obligatorio'],
    trim: true,
    maxlength: [100, 'El autor no puede exceder 100 caracteres'],
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || v.length >= 2;
      },
      message: 'El autor debe ser un email válido o un nombre de al menos 2 caracteres'
    },
    index: true // Para filtrar por autor
  },

  // ===== INFORMACIÓN TEMPORAL =====
  fecha: {
    type: String,
    required: true,
    default: () => new Date().toISOString(),
    validate: {
      validator: function(v: string) {
        return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v);
      },
      message: 'La fecha debe estar en formato ISO string'
    },
    index: true // Para ordenar por fecha
  },
  fechaActualizacion: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v);
      },
      message: 'La fecha debe estar en formato ISO string'
    }
  },

  // ===== CATEGORIZACIÓN =====
  tipo: {
    type: String,
    required: [true, 'El tipo de comentario es obligatorio'],
    enum: {
      values: [
        'observacion',
        'problema', 
        'solucion',
        'fertilizacion',
        'riego',
        'plagas',
        'enfermedad',
        'cosecha',
        'mantenimiento'
      ] as TipoComentario[],
      message: 'Tipo de comentario no válido: {VALUE}'
    },
    index: true // Para filtrar por tipo
  },
  prioridad: {
    type: String,
    required: [true, 'La prioridad del comentario es obligatoria'],
    enum: {
      values: ['baja', 'media', 'alta', 'critica'] as PrioridadComentario[],
      message: 'Prioridad de comentario no válida: {VALUE}'
    },
    default: 'media',
    index: true // Para ordenar por prioridad
  },

  // ===== MULTIMEDIA =====
  imagenes: {
    type: [ImagenMensajeSchema],
    default: [],
    validate: {
      validator: function(v: ImagenMensaje[]) {
        return v.length <= 10; // Máximo 10 imágenes por comentario
      },
      message: 'No se pueden tener más de 10 imágenes por comentario'
    }
  },

  // ===== ETIQUETAS Y CATEGORIZACIÓN ADICIONAL =====
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(v: string[]) {
        return v.length <= 8; // Máximo 8 etiquetas
      },
      message: 'No se pueden tener más de 8 etiquetas por comentario'
    },
    index: true // Para búsquedas por etiquetas
  },

  // ===== ESTADO Y SEGUIMIENTO =====
  resuelto: {
    type: Boolean,
    default: false,
    index: true // Para filtrar comentarios resueltos/pendientes
  },
  fechaResolucion: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v);
      },
      message: 'La fecha debe estar en formato ISO string'
    }
  },
  resuelto_por: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'El email no es válido'
    }
  },

  // ===== AUDITORÍA EXTENDIDA =====
  editadoPor: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'El email del editor no es válido'
    }
  },
  numeroEdiciones: {
    type: Number,
    default: 0,
    min: [0, 'El número de ediciones no puede ser negativo']
  },

  // ===== METADATOS =====
  activo: {
    type: Boolean,
    default: true,
    index: true // Para filtrar comentarios activos
  },
  destacado: {
    type: Boolean,
    default: false,
    index: true // Para comentarios importantes
  }
}, {
  // Opciones del schema
  timestamps: false, // Manejamos fechas manualmente
  collection: 'comentarios', // Nombre explícito de la colección
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // Definir interface para el objeto ret para evitar usar any
      interface ComentarioRet {
        _id?: mongoose.Types.ObjectId;
        __v?: number;
        activo?: boolean;
        numeroEdiciones?: number;
        id?: string;
        cultivoId?: string;
        titulo?: string;
        contenido?: string;
        autor?: string;
        fecha?: string;
        fechaActualizacion?: string;
        tipo?: string;
        prioridad?: string;
        imagenes?: ImagenMensaje[];
        tags?: string[];
        resuelto?: boolean;
        fechaResolucion?: string;
        resuelto_por?: string;
        editadoPor?: string;
        destacado?: boolean;
      }

      const retTyped = ret as ComentarioRet;

      retTyped.id = retTyped._id?.toString(); // Mapear _id a id para compatibilidad
      delete retTyped._id;
      delete retTyped.__v;
      delete retTyped.activo;
      delete retTyped.numeroEdiciones;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ===== MÉTODOS VIRTUALES =====

// Verificar si tiene imágenes
ComentarioSchema.virtual('tieneImagenes').get(function() {
  return this.imagenes && this.imagenes.length > 0;
});

// Obtener número de imágenes
ComentarioSchema.virtual('numeroImagenes').get(function() {
  return this.imagenes ? this.imagenes.length : 0;
});

// Calcular tiempo transcurrido desde la creación
ComentarioSchema.virtual('tiempoTranscurrido').get(function() {
  const ahora = new Date();
  const fechaComentario = new Date(this.fecha);
  const diff = ahora.getTime() - fechaComentario.getTime();
  
  const minutos = Math.floor(diff / (1000 * 60));
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  
  if (dias > 0) return `${dias} día${dias > 1 ? 's' : ''}`;
  if (horas > 0) return `${horas} hora${horas > 1 ? 's' : ''}`;
  if (minutos > 0) return `${minutos} minuto${minutos > 1 ? 's' : ''}`;
  return 'Hace un momento';
});

// Verificar si es un comentario reciente (últimas 24 horas)
ComentarioSchema.virtual('esReciente').get(function() {
  const hace24h = new Date();
  hace24h.setHours(hace24h.getHours() - 24);
  return new Date(this.fecha) >= hace24h;
});

// Obtener resumen del contenido
ComentarioSchema.virtual('resumen').get(function() {
  if (!this.contenido) return '';
  return this.contenido.length > 100 
    ? this.contenido.substring(0, 100) + '...'
    : this.contenido;
});

// ===== ÍNDICES COMPUESTOS =====
ComentarioSchema.index({ cultivoId: 1, fecha: -1 }); // Para comentarios por cultivo ordenados por fecha
ComentarioSchema.index({ tipo: 1, prioridad: -1, fecha: -1 }); // Para filtrar por tipo y prioridad
ComentarioSchema.index({ resuelto: 1, prioridad: -1, fecha: -1 }); // Para comentarios pendientes por prioridad
ComentarioSchema.index({ autor: 1, fecha: -1 }); // Para comentarios por autor
ComentarioSchema.index({ destacado: 1, fecha: -1 }); // Para comentarios destacados
ComentarioSchema.index({ titulo: 'text', contenido: 'text', tags: 'text' }); // Búsqueda full-text

// ===== MIDDLEWARE =====

// Pre-save: Actualizar fecha de modificación y contador de ediciones
ComentarioSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.fechaActualizacion = new Date().toISOString();
    this.numeroEdiciones = (this.numeroEdiciones || 0) + 1;
  }
  next();
});

// Pre-save: Limpiar y normalizar etiquetas
ComentarioSchema.pre('save', function(next) {
  if (this.isModified('tags') && this.tags) {
    this.tags = this.tags
      .map(tag => tag.toLowerCase().trim())
      .filter(tag => tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index); // Eliminar duplicados
  }
  next();
});

// Pre-save: Marcar como resuelto automáticamente
ComentarioSchema.pre('save', function(next) {
  if (this.isModified('resuelto') && this.resuelto && !this.fechaResolucion) {
    this.fechaResolucion = new Date().toISOString();
  }
  next();
});

// ===== MÉTODOS ESTÁTICOS =====

// Buscar comentarios por cultivo
ComentarioSchema.statics.findByCultivo = function(cultivoId: string, options: Record<string, unknown> = {}) {
  return this.find({
    cultivoId,
    activo: true,
    ...options
  }).sort({ fecha: -1 });
};

// Buscar comentarios por tipo
ComentarioSchema.statics.findByTipo = function(tipo: TipoComentario, cultivoId?: string) {
  const query: { tipo: TipoComentario; activo: boolean; cultivoId?: string } = { tipo, activo: true };
  if (cultivoId) query.cultivoId = cultivoId;

  return this.find(query).sort({ fecha: -1 });
};

// Buscar comentarios pendientes (no resueltos)
ComentarioSchema.statics.findPendientes = function(cultivoId?: string) {
  const query: { resuelto: boolean; activo: boolean; cultivoId?: string } = { resuelto: false, activo: true };
  if (cultivoId) query.cultivoId = cultivoId;

  return this.find(query).sort({ prioridad: -1, fecha: -1 });
};

// Buscar comentarios críticos
ComentarioSchema.statics.findCriticos = function(cultivoId?: string) {
  const query: {
    prioridad: string;
    resuelto: boolean;
    activo: boolean;
    cultivoId?: string
  } = {
    prioridad: 'critica',
    resuelto: false,
    activo: true
  };
  if (cultivoId) query.cultivoId = cultivoId;

  return this.find(query).sort({ fecha: -1 });
};

// Búsqueda full-text
ComentarioSchema.statics.search = function(query: string, cultivoId?: string) {
  const searchQuery: {
    $text: { $search: string };
    activo: boolean;
    cultivoId?: string
  } = {
    $text: { $search: query },
    activo: true
  };
  if (cultivoId) searchQuery.cultivoId = cultivoId;

  return this.find(searchQuery, {
    score: { $meta: 'textScore' }
  }).sort({
    score: { $meta: 'textScore' },
    fecha: -1
  });
};

// Obtener estadísticas de comentarios
ComentarioSchema.statics.getStats = async function(cultivoId?: string) {
  const match: { activo: boolean; cultivoId?: string } = { activo: true };
  if (cultivoId) match.cultivoId = cultivoId;
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pendientes: { $sum: { $cond: [{ $eq: ['$resuelto', false] }, 1, 0] } },
        resueltos: { $sum: { $cond: [{ $eq: ['$resuelto', true] }, 1, 0] } },
        criticos: { $sum: { $cond: [{ $eq: ['$prioridad', 'critica'] }, 1, 0] } },
        conImagenes: { $sum: { $cond: [{ $gt: [{ $size: '$imagenes' }, 0] }, 1, 0] } },
        destacados: { $sum: { $cond: ['$destacado', 1, 0] } },
        porTipo: {
          $push: '$tipo'
        }
      }
    }
  ]);
  
  const result = stats[0] || {
    total: 0,
    pendientes: 0,
    resueltos: 0,
    criticos: 0,
    conImagenes: 0,
    destacados: 0,
    porTipo: []
  };
  
  // Contar por tipo
  const tipoConteos: Record<string, number> = {};
  result.porTipo.forEach((tipo: string) => {
    tipoConteos[tipo] = (tipoConteos[tipo] || 0) + 1;
  });
  result.distribuccionTipos = tipoConteos;
  delete result.porTipo;
  
  return result;
};

// Obtener comentarios recientes
ComentarioSchema.statics.findRecientes = function(horas: number = 24, cultivoId?: string) {
  const fechaLimite = new Date();
  fechaLimite.setHours(fechaLimite.getHours() - horas);

  const query: {
    fecha: { $gte: string };
    activo: boolean;
    cultivoId?: string
  } = {
    fecha: { $gte: fechaLimite.toISOString() },
    activo: true
  };
  if (cultivoId) query.cultivoId = cultivoId;

  return this.find(query).sort({ fecha: -1 });
};

// ===== MÉTODOS DE INSTANCIA =====

// Marcar como resuelto
ComentarioSchema.methods.marcarResuelto = function(usuario?: string) {
  this.resuelto = true;
  this.fechaResolucion = new Date().toISOString();
  if (usuario) this.resuelto_por = usuario;
  return this.save();
};

// Marcar como pendiente
ComentarioSchema.methods.marcarPendiente = function() {
  this.resuelto = false;
  this.fechaResolucion = undefined;
  this.resuelto_por = undefined;
  return this.save();
};

// Destacar comentario
ComentarioSchema.methods.destacar = function() {
  this.destacado = true;
  return this.save();
};

// Quitar destacado
ComentarioSchema.methods.quitarDestacado = function() {
  this.destacado = false;
  return this.save();
};

// Agregar etiqueta
ComentarioSchema.methods.agregarEtiqueta = function(etiqueta: string) {
  const tag = etiqueta.toLowerCase().trim();
  if (tag && !this.tags.includes(tag) && this.tags.length < 8) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

// Quitar etiqueta
ComentarioSchema.methods.quitarEtiqueta = function(this: ComentarioDocument, etiqueta: string) {
  const tag = etiqueta.toLowerCase().trim();
  this.tags = (this.tags || []).filter((t: string) => t !== tag);
  return this.save();
};

// Archivar comentario
ComentarioSchema.methods.archivar = function(this: ComentarioDocument) {
  this.activo = false;
  return this.save();
};

// Restaurar comentario archivado
ComentarioSchema.methods.restaurar = function(this: ComentarioDocument) {
  this.activo = true;
  return this.save();
};

// ===== VALIDACIONES PERSONALIZADAS =====

// Validar que las etiquetas no contengan caracteres especiales
ComentarioSchema.path('tags').validate(function(tags: string[]) {
  if (!tags) return true;
  return tags.every(tag => /^[a-zA-Z0-9\s\-_]+$/.test(tag));
}, 'Las etiquetas solo pueden contener letras, números, espacios, guiones y guiones bajos');

// Validar que si está resuelto, tenga fecha de resolución
ComentarioSchema.path('resuelto').validate(function(value: boolean) {
  if (value && !this.fechaResolucion) {
    this.fechaResolucion = new Date().toISOString();
  }
  return true;
}, 'Un comentario resuelto debe tener fecha de resolución');

// Crear y exportar el modelo
const Comentario: Model<ComentarioDocument> = mongoose.models.Comentario || mongoose.model<ComentarioDocument>('Comentario', ComentarioSchema);

export default Comentario;
