/**
 * Modelo de Mongoose para Cultivos
 * 
 * Define el esquema y modelo de MongoDB para la gestión de cultivos.
 * Incluye validaciones, índices y métodos virtuales para optimizar las consultas.
 * 
 * Características:
 * - Validaciones de datos en el esquema
 * - Índices para optimizar búsquedas
 * - Métodos virtuales para cálculos automáticos
 * - Middleware para auditoría automática
 * - Soporte para galería de imágenes
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import type { Cultivo as CultivoType, ImagenCultivo } from '@/types/cultivo';

// Extender el tipo base con las propiedades de Mongoose Document
export interface CultivoDocument extends Omit<CultivoType, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Schema para imágenes de la galería
const ImagenCultivoSchema = new Schema<ImagenCultivo>({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  url: {
    type: String,
    required: [true, 'La URL de la imagen es obligatoria'],
    validate: {
      validator: function(v: string) {
        // Validar que sea una URL válida o path local
        return /^(https?:\/\/|\/|data:image\/)/.test(v);
      },
      message: 'La URL de la imagen no es válida'
    }
  },
  nombre: {
    type: String,
    required: [true, 'El nombre de la imagen es obligatorio'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  descripcion: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  fechaTomada: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'La fecha debe estar en formato YYYY-MM-DD'
    }
  },
  fechaSubida: {
    type: String,
    required: true,
    default: () => new Date().toISOString().split('T')[0]
  },
  tamaño: {
    type: Number,
    min: [0, 'El tamaño no puede ser negativo']
  },
  tipo: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^image\//.test(v);
      },
      message: 'El tipo debe ser un MIME type de imagen válido'
    }
  }
}, { _id: false }); // No crear _id automático para subdocumentos

// Schema principal del Cultivo
const CultivoSchema = new Schema<CultivoDocument>({
  // ===== CAMPOS OBLIGATORIOS =====
  nombre: {
    type: String,
    required: [true, 'El nombre del cultivo es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    index: true // Índice para búsquedas rápidas
  },

  // ===== INFORMACIÓN TÉCNICA =====
  sustrato: {
    type: String,
    trim: true,
    maxlength: [100, 'El sustrato no puede exceder 100 caracteres']
  },
  metrosCuadrados: {
    type: Number,
    min: [0.01, 'Los metros cuadrados deben ser mayor a 0'],
    max: [10000, 'Los metros cuadrados no pueden exceder 10,000']
  },
  fechaComienzo: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'La fecha debe estar en formato YYYY-MM-DD'
    },
    index: true // Índice para ordenamiento por fecha
  },
  numeroplantas: {
    type: Number,
    min: [1, 'El número de plantas debe ser al menos 1'],
    max: [100000, 'El número de plantas no puede exceder 100,000']
  },
  litrosMaceta: {
    type: Number,
    min: [0.1, 'Los litros por maceta deben ser mayor a 0.1'],
    max: [1000, 'Los litros por maceta no pueden exceder 1,000']
  },
  potenciaLamparas: {
    type: Number,
    min: [1, 'La potencia debe ser mayor a 0'],
    max: [50000, 'La potencia no puede exceder 50,000 watts']
  },
  genetica: {
    type: String,
    trim: true,
    maxlength: [200, 'La genética no puede exceder 200 caracteres']
  },

  // ===== CONTROL TEMPORAL =====
  fechaCreacion: {
    type: String,
    required: true,
    default: () => new Date().toISOString().split('T')[0],
    index: true
  },
  fechaActualizacion: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  activo: {
    type: Boolean,
    default: true,
    index: true // Índice para filtrar por estado
  },
  notas: {
    type: String,
    maxlength: [2000, 'Las notas no pueden exceder 2,000 caracteres']
  },

  // ===== GALERÍA DE IMÁGENES =====
  galeria: {
    type: [ImagenCultivoSchema],
    default: [],
    validate: {
      validator: function(v: ImagenCultivo[]) {
        return v.length <= 50; // Máximo 50 imágenes por cultivo
      },
      message: 'No se pueden tener más de 50 imágenes por cultivo'
    }
  },

  // ===== AUDITORÍA DE PERMISOS =====
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

  // ===== CONTROL DE FASES =====
  fechaInicioFloracion: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'La fecha debe estar en formato YYYY-MM-DD'
    }
  },
  diasVegetacionActual: {
    type: Number,
    min: [0, 'Los días de vegetación no pueden ser negativos'],
    default: 0
  },
  diasFloracionActual: {
    type: Number,
    min: [0, 'Los días de floración no pueden ser negativos'],
    default: 0
  },
  semanaVegetacion: {
    type: Number,
    min: [0, 'Las semanas de vegetación no pueden ser negativas'],
    default: 0
  },
  semanaFloracion: {
    type: Number,
    min: [0, 'Las semanas de floración no pueden ser negativas'],
    default: 0
  },

  // ===== OBJETIVOS NUTRICIONALES (desde IA) =====
  ecObjetivo: {
    type: Number,
    min: [0, 'El EC objetivo no puede ser negativo'],
    max: [5000, 'El EC objetivo no puede exceder 5000 ppm']
  },
  phObjetivo: {
    type: Number,
    min: [0, 'El pH objetivo no puede ser negativo'],
    max: [14, 'El pH objetivo no puede exceder 14']
  },
  aguaDiariaObjetivo: {
    type: Number,
    min: [0, 'El agua diaria objetivo no puede ser negativa'],
    max: [10000, 'El agua diaria objetivo no puede exceder 10,000 litros']
  },

  // ===== CONDICIONES AMBIENTALES =====
  tempObjetivoVegetacion: {
    type: Number,
    min: [10, 'La temperatura mínima es 10°C'],
    max: [50, 'La temperatura máxima es 50°C']
  },
  tempObjetivoFloracion: {
    type: Number,
    min: [10, 'La temperatura mínima es 10°C'],
    max: [50, 'La temperatura máxima es 50°C']
  },
  humedadObjetivoVegetacion: {
    type: Number,
    min: [10, 'La humedad mínima es 10%'],
    max: [100, 'La humedad máxima es 100%']
  },
  humedadObjetivoFloracion: {
    type: Number,
    min: [10, 'La humedad mínima es 10%'],
    max: [100, 'La humedad máxima es 100%']
  }
}, {
  // Opciones del schema
  timestamps: false, // Manejamos fechas manualmente
  collection: 'cultivos', // Nombre explícito de la colección
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id.toString(); // Mapear _id a id para compatibilidad
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ===== MÉTODOS VIRTUALES =====

// Calcular días desde el inicio
CultivoSchema.virtual('diasDesdeInicio').get(function() {
  if (!this.fechaComienzo) return 0;
  const inicio = new Date(this.fechaComienzo);
  const hoy = new Date();
  const diff = hoy.getTime() - inicio.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Calcular plantas por metro cuadrado
CultivoSchema.virtual('plantasPorM2').get(function() {
  if (!this.numeroplantas || !this.metrosCuadrados) return 0;
  return Math.round((this.numeroplantas / this.metrosCuadrados) * 100) / 100;
});

// Calcular eficiencia energética (watts por metro cuadrado)
CultivoSchema.virtual('wattsPorM2').get(function() {
  if (!this.potenciaLamparas || !this.metrosCuadrados) return 0;
  return Math.round((this.potenciaLamparas / this.metrosCuadrados) * 100) / 100;
});

// Calcular litros totales del sistema
CultivoSchema.virtual('litrosTotales').get(function() {
  if (!this.litrosMaceta || !this.numeroplantas) return 0;
  return this.litrosMaceta * this.numeroplantas;
});

// ===== ÍNDICES COMPUESTOS =====
CultivoSchema.index({ activo: 1, fechaCreacion: -1 }); // Para listar cultivos activos por fecha
CultivoSchema.index({ nombre: 'text', genetica: 'text', notas: 'text' }); // Búsqueda full-text

// ===== MIDDLEWARE =====

// Pre-save: Actualizar fecha de modificación
CultivoSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.fechaActualizacion = new Date().toISOString().split('T')[0];
  }
  next();
});

// Pre-save: Calcular métricas de fases automáticamente
CultivoSchema.pre('save', function(next) {
  if (this.fechaComienzo) {
    const inicio = new Date(this.fechaComienzo);
    const hoy = new Date();
    
    if (this.fechaInicioFloracion) {
      const floracion = new Date(this.fechaInicioFloracion);
      
      // Días en vegetación = desde inicio hasta inicio floración
      const diffVeg = Math.abs(floracion.getTime() - inicio.getTime());
      this.diasVegetacionActual = Math.ceil(diffVeg / (1000 * 60 * 60 * 24));
      
      // Días en floración = desde inicio floración hasta hoy
      const diffFlor = Math.abs(hoy.getTime() - floracion.getTime());
      this.diasFloracionActual = Math.ceil(diffFlor / (1000 * 60 * 60 * 24));
    } else {
      // Solo vegetación
      const diffVeg = Math.abs(hoy.getTime() - inicio.getTime());
      this.diasVegetacionActual = Math.ceil(diffVeg / (1000 * 60 * 60 * 24));
      this.diasFloracionActual = 0;
    }
    
    // Calcular semanas
    this.semanaVegetacion = Math.floor(this.diasVegetacionActual / 7) + 1;
    this.semanaFloracion = this.diasFloracionActual > 0 ? Math.floor(this.diasFloracionActual / 7) + 1 : 0;
  }
  next();
});

// ===== MÉTODOS ESTÁTICOS =====

// Buscar cultivos activos
CultivoSchema.statics.findActive = function() {
  return this.find({ activo: true }).sort({ fechaCreacion: -1 });
};

// Buscar por término de búsqueda
CultivoSchema.statics.search = function(query: string) {
  return this.find({
    $text: { $search: query }
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// Obtener estadísticas generales
CultivoSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        activos: { $sum: { $cond: ['$activo', 1, 0] } },
        finalizados: { $sum: { $cond: ['$activo', 0, 1] } },
        totalMetrosCuadrados: { $sum: '$metrosCuadrados' },
        totalPlantas: { $sum: '$numeroplantas' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    activos: 0,
    finalizados: 0,
    totalMetrosCuadrados: 0,
    totalPlantas: 0
  };
};

// ===== VALIDACIÓN PERSONALIZADA =====

// Validar que la fecha de floración sea posterior al inicio
CultivoSchema.path('fechaInicioFloracion').validate(function(value: string) {
  if (!value || !this.fechaComienzo) return true;
  
  const inicio = new Date(this.fechaComienzo);
  const floracion = new Date(value);
  
  return floracion >= inicio;
}, 'La fecha de inicio de floración debe ser posterior a la fecha de comienzo del cultivo');

// Crear y exportar el modelo
const Cultivo: Model<CultivoDocument> = mongoose.models.Cultivo || mongoose.model<CultivoDocument>('Cultivo', CultivoSchema);

export default Cultivo;
