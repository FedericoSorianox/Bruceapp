/**
 * Modelo de Mongoose para Usuarios del Sistema
 *
 * Define el esquema y modelo de MongoDB para la gestión de usuarios.
 * Incluye validaciones, encriptación de passwords y métodos de autenticación.
 *
 * Características:
 * - Validación de email único
 * - Hash automático de passwords con bcrypt
 * - Sistema de roles (admin/user)
 * - Auditoría de creación (creadoPor)
 * - Soporte para desactivación de usuarios
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

/**
 * Interfaz para estadísticas de usuarios
 */
export interface UsuarioStats {
  total: number;
  activos: number;
  admins: number;
  users: number;
}


/**
 * Interfaz para documentos de Usuario en MongoDB
 */
export interface UsuarioDocument extends Document {
  email: string;
  password: string;
  role: 'admin' | 'user';
  creadoPor?: string; // Email del admin que creó este usuario
  fechaCreacion: string;
  activo: boolean;

  // ===== CAMPOS DE SUSCRIPCIÓN MERCADOPAGO =====
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  mercadopagoCustomerId?: string; // ID del cliente en MercadoPago
  mercadopagoPreferenceId?: string; // ID de preferencia de pago
  subscriptionStartDate?: string; // Fecha de inicio de suscripción
  subscriptionEndDate?: string; // Fecha de fin de suscripción
  trialEndDate?: string; // Fecha de fin del período de prueba
  lastPaymentDate?: string; // Última fecha de pago exitoso
  paymentMethod?: string; // Método de pago (tarjeta, efectivo, etc.)
  exemptFromPayments: boolean; // Usuario exento del sistema de pagos

  // Método para comparar passwords
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Interfaz para el modelo Usuario con métodos estáticos
 */
export interface UsuarioModel extends Model<UsuarioDocument> {
  findActive(): ReturnType<Model<UsuarioDocument>['find']>;
  findCreatedBy(adminEmail: string): ReturnType<Model<UsuarioDocument>['find']>;
  findByEmail(email: string): ReturnType<Model<UsuarioDocument>['findOne']>;
  getStats(): Promise<UsuarioStats>;
}

/**
 * Schema principal de Usuario
 */
const UsuarioSchema = new Schema<UsuarioDocument>({
  // ===== INFORMACIÓN DE AUTENTICACIÓN =====
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'El email no es válido'
    },
    index: true // Índice para búsquedas rápidas por email
  },

  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },

  role: {
    type: String,
    enum: {
      values: ['admin', 'user'],
      message: 'El rol debe ser "admin" o "user"'
    },
    default: 'user',
    index: true // Índice para filtrar por rol
  },

  // ===== AUDITORÍA =====
  creadoPor: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'El email del creador no es válido'
    }
  },

  fechaCreacion: {
    type: String,
    required: true,
    default: () => new Date().toISOString().split('T')[0]
  },

  activo: {
    type: Boolean,
    default: true,
    index: true // Índice para filtrar usuarios activos
  },

  // ===== CAMPOS DE SUSCRIPCIÓN MERCADOPAGO =====
  subscriptionStatus: {
    type: String,
    enum: {
      values: ['trial', 'active', 'past_due', 'canceled', 'unpaid'],
      message: 'Estado de suscripción inválido'
    },
    default: 'trial',
    index: true
  },

  mercadopagoCustomerId: {
    type: String,
    sparse: true, // Permite valores null/undefined con índice único
    index: true
  },

  mercadopagoPreferenceId: {
    type: String,
    sparse: true,
    index: true
  },

  subscriptionStartDate: {
    type: String, // Formato ISO date string
  },

  subscriptionEndDate: {
    type: String, // Formato ISO date string
  },

  trialEndDate: {
    type: String, // Formato ISO date string
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días de prueba
  },

  lastPaymentDate: {
    type: String, // Formato ISO date string
  },

  paymentMethod: {
    type: String,
    enum: {
      values: ['credit_card', 'debit_card', 'ticket', 'bank_transfer', 'account_money'],
      message: 'Método de pago inválido'
    }
  },

  exemptFromPayments: {
    type: Boolean,
    default: false,
    index: true // Para filtrar usuarios exentos
  }
}, {
  // Opciones del schema
  collection: 'usuarios',
  toJSON: {
    virtuals: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: function(doc, ret: any) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Nunca incluir password en JSON
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ===== ÍNDICES COMPUESTOS =====
UsuarioSchema.index({ activo: 1, role: 1 }); // Para consultas de usuarios activos por rol
UsuarioSchema.index({ creadoPor: 1, activo: 1 }); // Para encontrar usuarios creados por un admin
UsuarioSchema.index({ subscriptionStatus: 1, activo: 1 }); // Para filtrar por estado de suscripción
UsuarioSchema.index({ exemptFromPayments: 1, activo: 1 }); // Para filtrar usuarios exentos

// ===== MIDDLEWARE =====

// Pre-save: Hash password antes de guardar
UsuarioSchema.pre('save', async function(next) {
  // Solo hash si la password fue modificada
  if (this.isModified('password')) {
    try {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    } catch (error) {
      next(error as Error);
    }
  }
  next();
});

// Pre-save: Validar que no se pueda crear usuario con role admin si no es creado por otro admin
UsuarioSchema.pre('save', function(next) {
  // Si es un usuario nuevo con rol admin, verificar que tenga creadoPor
  if (this.isNew && this.role === 'admin' && !this.creadoPor) {
    // Permitir si es el primer admin del sistema (sin creadoPor)
    // Esta lógica se maneja en la API
  }
  next();
});

// ===== MÉTODOS DE INSTANCIA =====

/**
 * Comparar password candidata con la almacenada (hasheada)
 * @param candidatePassword - Password a comparar
 * @returns Promise<boolean> - true si coincide
 */
UsuarioSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// ===== MÉTODOS ESTÁTICOS =====

/**
 * Buscar usuarios activos
 */
UsuarioSchema.statics.findActive = function() {
  return this.find({ activo: true });
};

/**
 * Buscar usuarios creados por un admin específico
 * @param adminEmail - Email del admin
 */
UsuarioSchema.statics.findCreatedBy = function(adminEmail: string) {
  return this.find({ creadoPor: adminEmail, activo: true });
};

/**
 * Buscar usuario por email (activo)
 * @param email - Email del usuario
 */
UsuarioSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email, activo: true });
};

/**
 * Obtener estadísticas de usuarios
 */
UsuarioSchema.statics.getStats = async function(): Promise<UsuarioStats> {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        activos: { $sum: { $cond: ['$activo', 1, 0] } },
        admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        users: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
      }
    }
  ]);

  return stats[0] || {
    total: 0,
    activos: 0,
    admins: 0,
    users: 0
  };
};

// ===== VIRTUALS =====

/**
 * Virtual para verificar si el usuario tiene acceso activo (suscripción válida)
 */
UsuarioSchema.virtual('hasActiveSubscription').get(function() {
  // Los usuarios exentos siempre tienen acceso
  if (this.exemptFromPayments) return true;

  if (this.subscriptionStatus === 'active') return true;
  if (this.subscriptionStatus === 'trial' && this.trialEndDate && new Date(this.trialEndDate) > new Date()) return true;
  return false;
});

/**
 * Virtual para verificar si el período de prueba ha expirado
 */
UsuarioSchema.virtual('trialExpired').get(function() {
  // Los usuarios exentos nunca tienen período de prueba expirado
  if (this.exemptFromPayments) return false;

  return this.subscriptionStatus === 'trial' && this.trialEndDate && new Date(this.trialEndDate) <= new Date();
});

// ===== VALIDACIÓN PERSONALIZADA =====

// Validar que el email no esté duplicado (case insensitive)
UsuarioSchema.path('email').validate(async function(value: string) {
  if (!this.isNew) return true; // Permitir updates sin cambiar email

  const count = await mongoose.models.Usuario?.countDocuments({
    email: new RegExp(`^${value}$`, 'i'),
    activo: true
  }) || 0;

  return count === 0;
}, 'Ya existe un usuario con este email');

// Crear y exportar el modelo
const Usuario: UsuarioModel = (mongoose.models.Usuario as UsuarioModel) || mongoose.model<UsuarioDocument, UsuarioModel>('Usuario', UsuarioSchema);

export default Usuario;
