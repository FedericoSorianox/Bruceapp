/**
 * Script para crear usuario admin inicial
 *
 * Este script crea el primer usuario administrador del sistema.
 * Se debe ejecutar una sola vez al inicializar la aplicación.
 *
 * Uso: node scripts/seed-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Configuración de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bruce-app';

// Modelo de Usuario (simplificado para el script)
const UsuarioSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  creadoPor: String,
  fechaCreacion: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  activo: {
    type: Boolean,
    default: true
  }
});

// Hash password antes de guardar
UsuarioSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

/**
 * Función principal para crear usuario admin
 */
async function createAdminUser() {
  try {
    console.log('🌱 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existe un admin
    const existingAdmin = await Usuario.findOne({ role: 'admin', activo: true });
    if (existingAdmin) {
      console.log('⚠️  Ya existe un usuario administrador en el sistema');
      console.log('Email del admin existente:', existingAdmin.email);
      return;
    }

    // Datos del admin inicial
    const adminData = {
      email: 'admin@bruce.app',
      password: 'admin123', // Se hashea automáticamente
      role: 'admin',
      // creadoPor: undefined (primer admin del sistema)
      activo: true
    };

    console.log('👤 Creando usuario administrador...');
    const adminUser = new Usuario(adminData);
    await adminUser.save();

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password:', adminData.password);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('🎉 Script completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en el script:', error);
      process.exit(1);
    });
}

module.exports = { createAdminUser };
