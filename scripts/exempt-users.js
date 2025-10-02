#!/usr/bin/env node

/**
 * Script para marcar usuarios existentes como exentos del sistema de pagos
 *
 * Este script permite identificar usuarios existentes y marcarlos como exentos
 * del sistema de pagos de MercadoPago. Útil para usuarios que ya estaban registrados
 * antes de implementar el sistema de suscripciones.
 *
 * Uso:
 *   node scripts/exempt-users.js
 *
 * Opciones:
 *   --email usuario@email.com  - Marcar un usuario específico como exento
 *   --all                     - Marcar todos los usuarios existentes como exentos
 *   --list                    - Listar usuarios existentes
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Configuración de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bruce-app';

// Modelo simplificado de Usuario para el script
const UsuarioSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  fechaCreacion: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  activo: {
    type: Boolean,
    default: true
  },
  exemptFromPayments: {
    type: Boolean,
    default: false
  },
  subscriptionStatus: {
    type: String,
    enum: ['trial', 'active', 'past_due', 'canceled', 'unpaid'],
    default: 'trial'
  }
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

/**
 * Conectar a MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
}

/**
 * Desconectar de MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error desconectando:', error.message);
  }
}

/**
 * Listar usuarios existentes
 */
async function listUsers() {
  try {
    console.log('📋 Usuarios existentes:\n');

    const users = await Usuario.find({ activo: true }).sort({ fechaCreacion: -1 });

    if (users.length === 0) {
      console.log('No hay usuarios registrados.');
      return;
    }

    users.forEach((user, index) => {
      const exemptStatus = user.exemptFromPayments ? '✅ Exento' : '❌ No exento';
      const subscriptionStatus = user.subscriptionStatus || 'N/A';
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Rol: ${user.role}`);
      console.log(`   Estado suscripción: ${subscriptionStatus}`);
      console.log(`   Pagos: ${exemptStatus}`);
      console.log(`   Creado: ${user.fechaCreacion}`);
      console.log('');
    });

    console.log(`Total: ${users.length} usuarios`);

  } catch (error) {
    console.error('❌ Error listando usuarios:', error.message);
  }
}

/**
 * Marcar un usuario específico como exento
 */
async function exemptUser(email) {
  try {
    const user = await Usuario.findOne({ email: email.toLowerCase(), activo: true });

    if (!user) {
      console.log(`❌ Usuario ${email} no encontrado`);
      return false;
    }

    if (user.exemptFromPayments) {
      console.log(`⚠️  El usuario ${email} ya está exento de pagos`);
      return false;
    }

    await Usuario.findByIdAndUpdate(user._id, {
      exemptFromPayments: true,
      subscriptionStatus: 'active' // Dar acceso completo
    });

    console.log(`✅ Usuario ${email} marcado como exento de pagos`);
    return true;

  } catch (error) {
    console.error('❌ Error marcando usuario como exento:', error.message);
    return false;
  }
}

/**
 * Marcar todos los usuarios existentes como exentos
 */
async function exemptAllUsers() {
  try {
    const result = await Usuario.updateMany(
      { activo: true, exemptFromPayments: false },
      {
        exemptFromPayments: true,
        subscriptionStatus: 'active'
      }
    );

    console.log(`✅ ${result.modifiedCount} usuarios marcados como exentos de pagos`);

    if (result.modifiedCount > 0) {
      console.log('Los siguientes usuarios ahora tienen acceso completo sin suscripción:');
      const users = await Usuario.find({ activo: true, exemptFromPayments: true });
      users.forEach(user => console.log(`  - ${user.email}`));
    }

    return result.modifiedCount;

  } catch (error) {
    console.error('❌ Error marcando usuarios como exentos:', error.message);
    return 0;
  }
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2);

  await connectDB();

  try {
    if (args.includes('--list')) {
      // Listar usuarios
      await listUsers();

    } else if (args.includes('--all')) {
      // Marcar todos como exentos
      console.log('🔄 Marcando todos los usuarios existentes como exentos de pagos...');
      const count = await exemptAllUsers();
      console.log(`✅ Proceso completado. ${count} usuarios actualizados.`);

    } else if (args.includes('--email')) {
      // Marcar usuario específico
      const emailIndex = args.indexOf('--email');
      if (emailIndex + 1 >= args.length) {
        console.error('❌ Debe especificar un email después de --email');
        process.exit(1);
      }

      const email = args[emailIndex + 1];
      console.log(`🔄 Marcando usuario ${email} como exento de pagos...`);
      const success = await exemptUser(email);

      if (success) {
        console.log('✅ Usuario actualizado exitosamente.');
      } else {
        console.log('❌ No se pudo actualizar el usuario.');
      }

    } else {
      // Mostrar ayuda
      console.log('📖 Uso: node scripts/exempt-users.js [opciones]');
      console.log('');
      console.log('Opciones:');
      console.log('  --list                    Listar todos los usuarios existentes');
      console.log('  --email usuario@email.com Marcar un usuario específico como exento');
      console.log('  --all                     Marcar todos los usuarios como exentos');
      console.log('');
      console.log('Ejemplos:');
      console.log('  node scripts/exempt-users.js --list');
      console.log('  node scripts/exempt-users.js --email admin@example.com');
      console.log('  node scripts/exempt-users.js --all');
    }

  } finally {
    await disconnectDB();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

module.exports = { listUsers, exemptUser, exemptAllUsers };
