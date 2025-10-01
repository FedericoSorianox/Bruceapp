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
 * Interfaz para documentos de Usuario en MongoDB
 */
export interface UsuarioDocument extends Document {
  email: string;
  password: string;
  role: 'admin' | 'user';
  creadoPor?: string; // Email del admin que creó este usuario
  fechaCreacion: string;
  activo: boolean;

  // Método para comparar passwords
  comparePassword(candidatePassword: string): Promise<boolean>;
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
  }
}, {
  // Opciones del schema
  collection: 'usuarios',
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
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
UsuarioSchema.statics.getStats = async function() {
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
const Usuario: Model<UsuarioDocument> = mongoose.models.Usuario || mongoose.model<UsuarioDocument>('Usuario', UsuarioSchema);

export default Usuario;
