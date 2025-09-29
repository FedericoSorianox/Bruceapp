/**
 * Modelo de Mongoose para Notas
 * 
 * Define el esquema y modelo de MongoDB para la gestión de notas agrícolas.
 * Incluye validaciones, categorización y búsqueda full-text.
 * 
 * Características:
 * - Sistema de categorías y etiquetas
 * - Búsqueda full-text optimizada
 * - Soporte para imágenes adjuntas
 * - Gestión de prioridades
 * - Auditoría de cambios
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// Interfaces base para la nota
export interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  date?: string;
  author?: string;
  priority?: string;
  hasImages?: boolean;
  cropArea?: string;
}

// Extender el tipo base con las propiedades de Mongoose Document
export interface NotaDocument extends Omit<Note, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Schema principal de Nota
const NotaSchema = new Schema<NotaDocument>({
  // ===== INFORMACIÓN BÁSICA =====
  title: {
    type: String,
    required: [true, 'El título de la nota es obligatorio'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres'],
    index: true // Para búsquedas rápidas por título
  },
  content: {
    type: String,
    required: [true, 'El contenido de la nota es obligatorio'],
    trim: true,
    maxlength: [10000, 'El contenido no puede exceder 10,000 caracteres']
  },

  // ===== CATEGORIZACIÓN =====
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'La categoría no puede exceder 50 caracteres'],
    enum: {
      values: [
        'general',
        'cultivo', 
        'nutricion',
        'plagas',
        'riego',
        'cosecha',
        'mantenimiento',
        'observacion',
        'problema',
        'solucion',
        'investigacion'
      ],
      message: 'Categoría no válida: {VALUE}'
    },
    default: 'general',
    index: true // Para filtrar por categoría
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(v: string[]) {
        return v.length <= 10; // Máximo 10 etiquetas
      },
      message: 'No se pueden tener más de 10 etiquetas por nota'
    },
    index: true // Para búsquedas por etiquetas
  },

  // ===== INFORMACIÓN TEMPORAL Y AUTORÍA =====
  date: {
    type: String,
    required: true,
    default: () => new Date().toISOString().split('T')[0],
    validate: {
      validator: function(v: string) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'La fecha debe estar en formato YYYY-MM-DD'
    },
    index: true // Para ordenar por fecha
  },
  author: {
    type: String,
    trim: true,
    maxlength: [100, 'El autor no puede exceder 100 caracteres'],
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || v.length >= 2;
      },
      message: 'El autor debe ser un email válido o un nombre de al menos 2 caracteres'
    },
    index: true // Para filtrar por autor
  },

  // ===== PRIORIDAD Y CLASIFICACIÓN =====
  priority: {
    type: String,
    enum: {
      values: ['baja', 'media', 'alta', 'critica'],
      message: 'Prioridad no válida: {VALUE}'
    },
    default: 'media',
    index: true // Para ordenar por prioridad
  },

  // ===== ADJUNTOS Y MULTIMEDIA =====
  hasImages: {
    type: Boolean,
    default: false,
    index: true // Para filtrar notas con imágenes
  },

  // ===== RELACIÓN CON ÁREA DE CULTIVO =====
  cropArea: {
    type: String,
    trim: true,
    maxlength: [100, 'El área de cultivo no puede exceder 100 caracteres'],
    index: true // Para filtrar por área de cultivo
  },

  // ===== CAMPOS DE AUDITORÍA =====
  fechaCreacion: {
    type: String,
    required: true,
    default: () => new Date().toISOString().split('T')[0]
  },
  fechaActualizacion: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  creadoPor: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'El email del creador no es válido'
    }
  },
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

  // ===== ESTADO Y VISIBILIDAD =====
  activa: {
    type: Boolean,
    default: true,
    index: true // Para filtrar notas activas
  },
  destacada: {
    type: Boolean,
    default: false,
    index: true // Para mostrar notas destacadas
  }
}, {
  // Opciones del schema
  timestamps: false, // Manejamos fechas manualmente
  collection: 'notas', // Nombre explícito de la colección
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString(); // Mapear _id a id para compatibilidad
      delete ret._id;
      delete ret.__v;
      delete ret.fechaCreacion; // Usar 'date' en lugar de fechaCreacion para compatibilidad
      delete ret.fechaActualizacion;
      delete ret.activa;
      delete ret.destacada;
      delete ret.creadoPor;
      delete ret.editadoPor;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ===== MÉTODOS VIRTUALES =====

// Número de caracteres del contenido
NotaSchema.virtual('caracteresContenido').get(function() {
  return this.content ? this.content.length : 0;
});

// Tiempo estimado de lectura (200 palabras por minuto)
NotaSchema.virtual('tiempoLectura').get(function() {
  if (!this.content) return 0;
  const palabras = this.content.split(/\s+/).length;
  return Math.ceil(palabras / 200); // minutos
});

// Resumen del contenido (primeras 150 caracteres)
NotaSchema.virtual('resumen').get(function() {
  if (!this.content) return '';
  return this.content.length > 150 
    ? this.content.substring(0, 150) + '...'
    : this.content;
});

// Verificar si es una nota reciente (últimos 7 días)
NotaSchema.virtual('esReciente').get(function() {
  if (!this.date) return false;
  const fechaNota = new Date(this.date);
  const hace7Dias = new Date();
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  return fechaNota >= hace7Dias;
});

// ===== ÍNDICES COMPUESTOS =====
NotaSchema.index({ activa: 1, date: -1 }); // Para listar notas activas por fecha
NotaSchema.index({ category: 1, priority: -1, date: -1 }); // Para filtrar por categoría y prioridad
NotaSchema.index({ tags: 1, date: -1 }); // Para buscar por etiquetas
NotaSchema.index({ author: 1, date: -1 }); // Para notas por autor
NotaSchema.index({ destacada: 1, date: -1 }); // Para notas destacadas
NotaSchema.index({ title: 'text', content: 'text', tags: 'text' }); // Búsqueda full-text

// ===== MIDDLEWARE =====

// Pre-save: Actualizar fecha de modificación
NotaSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.fechaActualizacion = new Date().toISOString().split('T')[0];
  }
  next();
});

// Pre-save: Limpiar y normalizar etiquetas
NotaSchema.pre('save', function(next) {
  if (this.isModified('tags') && this.tags) {
    this.tags = this.tags
      .map(tag => tag.toLowerCase().trim())
      .filter(tag => tag.length > 0)
      .filter((tag, index, arr) => arr.indexOf(tag) === index); // Eliminar duplicados
  }
  next();
});

// Pre-save: Detectar automáticamente si tiene imágenes en el contenido
NotaSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Buscar patrones de imágenes en el contenido (URLs, base64, etc.)
    const imagePatterns = [
      /!\[.*?\]\(.*?\)/g, // Markdown images
      /<img.*?>/gi, // HTML img tags
      /data:image\//gi, // Base64 images
      /https?:\/\/.*\.(jpg|jpeg|png|gif|bmp|webp)/gi // Image URLs
    ];
    
    this.hasImages = imagePatterns.some(pattern => pattern.test(this.content));
  }
  next();
});

// ===== MÉTODOS ESTÁTICOS =====

// Buscar notas por término de búsqueda
NotaSchema.statics.search = function(query: string, options: any = {}) {
  const searchQuery = {
    $text: { $search: query },
    activa: true,
    ...options
  };
  
  return this.find(searchQuery, {
    score: { $meta: 'textScore' }
  }).sort({ 
    score: { $meta: 'textScore' },
    date: -1 
  });
};

// Obtener notas por categoría
NotaSchema.statics.findByCategory = function(category: string) {
  return this.find({ 
    category, 
    activa: true 
  }).sort({ date: -1 });
};

// Obtener notas por etiquetas
NotaSchema.statics.findByTags = function(tags: string | string[]) {
  const tagArray = Array.isArray(tags) ? tags : [tags];
  return this.find({ 
    tags: { $in: tagArray },
    activa: true 
  }).sort({ date: -1 });
};

// Obtener notas destacadas
NotaSchema.statics.findDestacadas = function() {
  return this.find({ 
    destacada: true,
    activa: true 
  }).sort({ date: -1 });
};

// Obtener notas recientes
NotaSchema.statics.findRecientes = function(dias: number = 7) {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - dias);
  const fechaLimiteStr = fechaLimite.toISOString().split('T')[0];
  
  return this.find({ 
    date: { $gte: fechaLimiteStr },
    activa: true 
  }).sort({ date: -1 });
};

// Obtener estadísticas de notas
NotaSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    { $match: { activa: true } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        conImagenes: { $sum: { $cond: ['$hasImages', 1, 0] } },
        destacadas: { $sum: { $cond: ['$destacada', 1, 0] } },
        porCategoria: {
          $push: {
            categoria: '$category',
            prioridad: '$priority'
          }
        }
      }
    },
    {
      $addFields: {
        categorias: {
          $reduce: {
            input: '$porCategoria',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                { 
                  $arrayToObject: [
                    [{ k: '$$this.categoria', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.categoria', input: '$$value' } }, 0] }, 1] } }]
                  ]
                }
              ]
            }
          }
        }
      }
    }
  ]);
  
  const result = stats[0] || {
    total: 0,
    conImagenes: 0,
    destacadas: 0,
    categorias: {}
  };
  
  // Obtener también las etiquetas más utilizadas
  const tagsStats = await this.aggregate([
    { $match: { activa: true } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  result.etiquetasPopulares = tagsStats.map(tag => ({
    etiqueta: tag._id,
    uso: tag.count
  }));
  
  return result;
};

// Obtener todas las categorías en uso
NotaSchema.statics.getCategorias = function() {
  return this.distinct('category', { activa: true });
};

// Obtener todas las etiquetas en uso
NotaSchema.statics.getEtiquetas = function() {
  return this.distinct('tags', { activa: true });
};

// ===== MÉTODOS DE INSTANCIA =====

// Marcar nota como destacada
NotaSchema.methods.destacar = function() {
  this.destacada = true;
  return this.save();
};

// Quitar destacado de la nota
NotaSchema.methods.quitarDestacado = function() {
  this.destacada = false;
  return this.save();
};

// Archivar nota (marcar como inactiva)
NotaSchema.methods.archivar = function() {
  this.activa = false;
  return this.save();
};

// Restaurar nota archivada
NotaSchema.methods.restaurar = function() {
  this.activa = true;
  return this.save();
};

// Agregar etiqueta
NotaSchema.methods.agregarEtiqueta = function(etiqueta: string) {
  const tag = etiqueta.toLowerCase().trim();
  if (tag && !this.tags.includes(tag) && this.tags.length < 10) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

// Quitar etiqueta
NotaSchema.methods.quitarEtiqueta = function(etiqueta: string) {
  const tag = etiqueta.toLowerCase().trim();
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// ===== VALIDACIONES PERSONALIZADAS =====

// Validar que las etiquetas no contengan caracteres especiales
NotaSchema.path('tags').validate(function(tags: string[]) {
  if (!tags) return true;
  return tags.every(tag => /^[a-zA-Z0-9\s\-_]+$/.test(tag));
}, 'Las etiquetas solo pueden contener letras, números, espacios, guiones y guiones bajos');

// Crear y exportar el modelo
const Nota: Model<NotaDocument> = mongoose.models.Nota || mongoose.model<NotaDocument>('Nota', NotaSchema);

export default Nota;
