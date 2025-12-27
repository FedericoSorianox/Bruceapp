/**
 * Modelo de Mongoose para Tareas de Cultivo
 * 
 * Define el esquema y modelo de MongoDB para la gestión de tareas de planificación.
 * Incluye validaciones, índices y métodos para manejo de tareas recurrentes.
 * 
 * Características:
 * - Validaciones estrictas para tipos de tarea
 * - Soporte para tareas recurrentes
 * - Gestión automática de recordatorios
 * - Índices optimizados para consultas de calendario
 * - Middleware para auditoría
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import type {
  TareaCultivo,
  TipoTarea,
  EstadoTarea,
  PrioridadTarea,
  FrecuenciaRepeticion
} from '@/types/planificacion';

// Extender el tipo base con las propiedades de Mongoose Document
export interface TareaDocument extends Omit<TareaCultivo, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Schema principal de Tarea
const TareaSchema = new Schema<TareaDocument>({
  // ===== RELACIÓN CON CULTIVO =====
  cultivoId: {
    type: String,
    required: [true, 'El ID del cultivo es obligatorio'],
    index: true // Índice para consultas rápidas por cultivo
  },

  // ===== INFORMACIÓN BÁSICA =====
  titulo: {
    type: String,
    required: [true, 'El título de la tarea es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres'],
    index: true // Para búsquedas por título
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1,000 caracteres']
  },

  // ===== CATEGORIZACIÓN =====
  tipo: {
    type: String,
    required: [true, 'El tipo de tarea es obligatorio'],
    enum: {
      values: ['siembra', 'riego', 'fertilizacion', 'poda', 'cosecha', 'mantenimiento', 'monitoreo', 'otro'] as TipoTarea[],
      message: 'Tipo de tarea no válido: {VALUE}'
    },
    index: true // Para filtrar por tipo
  },
  estado: {
    type: String,
    required: [true, 'El estado de la tarea es obligatorio'],
    enum: {
      values: ['pendiente', 'en_progreso', 'completada', 'cancelada', 'vencida'] as EstadoTarea[],
      message: 'Estado de tarea no válido: {VALUE}'
    },
    default: 'pendiente',
    index: true // Para filtrar por estado
  },
  prioridad: {
    type: String,
    required: [true, 'La prioridad de la tarea es obligatoria'],
    enum: {
      values: ['baja', 'media', 'alta', 'urgente'] as PrioridadTarea[],
      message: 'Prioridad de tarea no válida: {VALUE}'
    },
    default: 'media',
    index: true // Para ordenar por prioridad
  },

  // ===== PROGRAMACIÓN TEMPORAL =====
  fechaProgramada: {
    type: String,
    required: [true, 'La fecha programada es obligatoria'],
    validate: {
      validator: function (v: string) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'La fecha debe estar en formato YYYY-MM-DD'
    },
    index: true // Para consultas de calendario
  },
  horaProgramada: {
    type: String,
    validate: {
      validator: function (v: string) {
        return !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'La hora debe estar en formato HH:MM (24 horas)'
    }
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
    required: true,
    default: () => new Date().toISOString().split('T')[0]
  },
  fechaCompletada: {
    type: String,
    validate: {
      validator: function (v: string) {
        return !v || /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'La fecha debe estar en formato YYYY-MM-DD'
    }
  },

  // ===== ESTIMACIONES =====
  duracionEstimada: {
    type: Number,
    min: [1, 'La duración mínima es 1 minuto'],
    max: [1440, 'La duración máxima es 1440 minutos (24 horas)']
  },
  notas: {
    type: String,
    maxlength: [1000, 'Las notas no pueden exceder 1,000 caracteres']
  },

  // ===== AUDITORÍA DE PERMISOS =====
  creadoPor: {
    type: String,
    trim: true,
    validate: {
      validator: function (v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'El email del creador no es válido'
    }
  },
  editadoPor: {
    type: String,
    trim: true,
    validate: {
      validator: function (v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'El email del editor no es válido'
    }
  },

  // ===== CONFIGURACIÓN DE REPETICIÓN =====
  esRecurrente: {
    type: Boolean,
    required: true,
    default: false,
    index: true // Para filtrar tareas recurrentes
  },
  frecuencia: {
    type: String,
    enum: {
      values: ['diaria', 'semanal', 'quincenal', 'mensual', 'personalizada'] as FrecuenciaRepeticion[],
      message: 'Frecuencia de repetición no válida: {VALUE}'
    },
    required: function () {
      return this.esRecurrente;
    }
  },
  intervaloPersonalizado: {
    type: Number,
    min: [1, 'El intervalo debe ser al menos 1 día'],
    max: [365, 'El intervalo no puede exceder 365 días'],
    required: function () {
      return this.esRecurrente && this.frecuencia === 'personalizada';
    }
  },
  fechaFinRepeticion: {
    type: String,
    validate: {
      validator: function (v: string) {
        return !v || /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'La fecha debe estar en formato YYYY-MM-DD'
    }
  },
  tareaPadreId: {
    type: String,
    index: true // Para encontrar tareas generadas automáticamente
  },

  // ===== SISTEMA DE RECORDATORIOS =====
  recordatorioActivado: {
    type: Boolean,
    required: true,
    default: false
  },
  minutosRecordatorio: {
    type: Number,
    min: [1, 'Los minutos de recordatorio deben ser al menos 1'],
    max: [10080, 'Los minutos de recordatorio no pueden exceder una semana (10080 minutos)'],
    default: 60, // 1 hora por defecto
    required: function () {
      return this.recordatorioActivado;
    }
  },
  recordatorioEnviado: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  // Opciones del schema
  timestamps: false, // Manejamos fechas manualmente
  collection: 'tareas', // Nombre explícito de la colección
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id.toString(); // Mapear _id a id para compatibilidad
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (ret as any)._id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (ret as any).__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ===== MÉTODOS VIRTUALES =====

// Verificar si la tarea está vencida
TareaSchema.virtual('estaVencida').get(function () {
  if (this.estado === 'completada' || this.estado === 'cancelada') return false;

  const hoy = new Date().toISOString().split('T')[0];
  return this.fechaProgramada < hoy;
});

// Obtener días hasta la fecha programada
TareaSchema.virtual('diasHastaVencimiento').get(function () {
  const hoy = new Date();
  const fechaProgramada = new Date(this.fechaProgramada);
  const diff = fechaProgramada.getTime() - hoy.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Verificar si es hora de enviar recordatorio
TareaSchema.virtual('debeEnviarRecordatorio').get(function () {
  if (!this.recordatorioActivado || this.recordatorioEnviado) return false;
  if (this.estado === 'completada' || this.estado === 'cancelada') return false;

  const ahora = new Date();
  const fechaProgramada = new Date(`${this.fechaProgramada}T${this.horaProgramada || '12:00'}:00.000Z`);
  const tiempoRecordatorio = new Date(fechaProgramada.getTime() - ((this.minutosRecordatorio || 0) * 60 * 1000));

  return ahora >= tiempoRecordatorio;
});

// ===== ÍNDICES COMPUESTOS =====
TareaSchema.index({ cultivoId: 1, fechaProgramada: 1 }); // Para calendario por cultivo
TareaSchema.index({ estado: 1, fechaProgramada: 1 }); // Para tareas pendientes por fecha
TareaSchema.index({ prioridad: 1, fechaProgramada: 1 }); // Para ordenar por prioridad y fecha
TareaSchema.index({ esRecurrente: 1, fechaFinRepeticion: 1 }); // Para gestión de recurrencias
TareaSchema.index({ recordatorioActivado: 1, recordatorioEnviado: 1, fechaProgramada: 1 }); // Para recordatorios
TareaSchema.index({ titulo: 'text', descripcion: 'text' }); // Búsqueda full-text

// ===== MIDDLEWARE =====

// Pre-save: Actualizar fecha de modificación
TareaSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.fechaActualizacion = new Date().toISOString().split('T')[0];
  }
  next();
});

// Pre-save: Marcar fecha de completado automáticamente
TareaSchema.pre('save', function (next) {
  if (this.isModified('estado') && this.estado === 'completada' && !this.fechaCompletada) {
    this.fechaCompletada = new Date().toISOString().split('T')[0];
  }
  next();
});

// Pre-save: Marcar tareas vencidas automáticamente
TareaSchema.pre('save', function (next) {
  const hoy = new Date().toISOString().split('T')[0];
  if (this.fechaProgramada < hoy && this.estado === 'pendiente') {
    this.estado = 'vencida';
  }
  next();
});

// Post-save: Generar siguiente tarea recurrente si es necesario
TareaSchema.post('save', async function (doc) {
  if (doc.estado === 'completada' && doc.esRecurrente && !doc.tareaPadreId) {
    await generarSiguienteTareaRecurrente(doc);
  }
});

// ===== MÉTODOS ESTÁTICOS =====

// Buscar tareas por cultivo y rango de fechas
TareaSchema.statics.findByCultivoAndDateRange = function (cultivoId: string, fechaInicio: string, fechaFin: string) {
  return this.find({
    cultivoId,
    fechaProgramada: { $gte: fechaInicio, $lte: fechaFin }
  }).sort({ fechaProgramada: 1, horaProgramada: 1 });
};

// Buscar tareas pendientes
TareaSchema.statics.findPendientes = function (cultivoId?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = { estado: { $in: ['pendiente', 'en_progreso'] } };
  if (cultivoId) query.cultivoId = cultivoId;

  return this.find(query).sort({ prioridad: -1, fechaProgramada: 1 });
};

// Buscar tareas vencidas
TareaSchema.statics.findVencidas = function () {
  const hoy = new Date().toISOString().split('T')[0];
  return this.find({
    fechaProgramada: { $lt: hoy },
    estado: { $in: ['pendiente', 'en_progreso'] }
  });
};

// Buscar tareas que necesitan recordatorio
TareaSchema.statics.findParaRecordatorio = function () {
  const ahora = new Date();

  return this.find({
    recordatorioActivado: true,
    recordatorioEnviado: false,
    estado: { $in: ['pendiente', 'en_progreso'] }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }).then((tareas: any[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return tareas.filter((tarea: any) => {
      const fechaProgramada = new Date(`${tarea.fechaProgramada}T${tarea.horaProgramada || '12:00'}:00.000Z`);
      const tiempoRecordatorio = new Date(fechaProgramada.getTime() - ((tarea.minutosRecordatorio || 0) * 60 * 1000));
      return ahora >= tiempoRecordatorio;
    });
  });
};

// Obtener estadísticas de tareas
TareaSchema.statics.getStats = async function (cultivoId?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const match: any = {};
  if (cultivoId) match.cultivoId = cultivoId;

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pendientes: { $sum: { $cond: [{ $eq: ['$estado', 'pendiente'] }, 1, 0] } },
        completadas: { $sum: { $cond: [{ $eq: ['$estado', 'completada'] }, 1, 0] } },
        vencidas: { $sum: { $cond: [{ $eq: ['$estado', 'vencida'] }, 1, 0] } },
        recurrentes: { $sum: { $cond: ['$esRecurrente', 1, 0] } }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    pendientes: 0,
    completadas: 0,
    vencidas: 0,
    recurrentes: 0
  };
};

// ===== VALIDACIONES PERSONALIZADAS =====

// Validar que la fecha fin de repetición sea posterior a la fecha programada
TareaSchema.path('fechaFinRepeticion').validate(function (value: string) {
  if (!value || !this.esRecurrente) return true;
  return value >= this.fechaProgramada;
}, 'La fecha fin de repetición debe ser posterior a la fecha programada');

// ===== FUNCIONES AUXILIARES =====

/**
 * Genera la siguiente tarea en una serie recurrente
 * @param tareaOriginal - Tarea completada que es recurrente
 */
async function generarSiguienteTareaRecurrente(tareaOriginal: TareaDocument) {
  const TareaModel = mongoose.model<TareaDocument>('Tarea');

  // Verificar que no hayamos pasado la fecha fin
  if (tareaOriginal.fechaFinRepeticion) {
    const fechaFin = new Date(tareaOriginal.fechaFinRepeticion);
    const fechaActual = new Date(tareaOriginal.fechaProgramada);
    if (fechaActual >= fechaFin) return; // No generar más tareas
  }

  // Calcular la siguiente fecha
  const siguienteFecha = new Date(tareaOriginal.fechaProgramada);

  switch (tareaOriginal.frecuencia) {
    case 'diaria':
      siguienteFecha.setDate(siguienteFecha.getDate() + 1);
      break;
    case 'semanal':
      siguienteFecha.setDate(siguienteFecha.getDate() + 7);
      break;
    case 'quincenal':
      siguienteFecha.setDate(siguienteFecha.getDate() + 15);
      break;
    case 'mensual':
      siguienteFecha.setMonth(siguienteFecha.getMonth() + 1);
      break;
    case 'personalizada':
      if (tareaOriginal.intervaloPersonalizado) {
        siguienteFecha.setDate(siguienteFecha.getDate() + tareaOriginal.intervaloPersonalizado);
      }
      break;
  }

  // Verificar que la nueva fecha no pase la fecha fin
  if (tareaOriginal.fechaFinRepeticion && siguienteFecha > new Date(tareaOriginal.fechaFinRepeticion)) {
    return; // No crear la tarea
  }

  // Crear la nueva tarea
  const nuevaTarea = new TareaModel({
    ...tareaOriginal.toObject(),
    _id: new mongoose.Types.ObjectId(),
    fechaProgramada: siguienteFecha.toISOString().split('T')[0],
    estado: 'pendiente',
    fechaCompletada: undefined,
    recordatorioEnviado: false,
    tareaPadreId: tareaOriginal.tareaPadreId || tareaOriginal._id.toString(),
    fechaCreacion: new Date().toISOString().split('T')[0],
    fechaActualizacion: new Date().toISOString().split('T')[0]
  });

  await nuevaTarea.save();
}

// Crear y exportar el modelo
const Tarea: Model<TareaDocument> = mongoose.models.Tarea || mongoose.model<TareaDocument>('Tarea', TareaSchema);

export default Tarea;
