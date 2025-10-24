/**
 * Script para asegurar que el usuario de prueba existe en MongoDB
 * Este script se puede ejecutar antes de los tests en CI
 */

const mongoose = require('mongoose');

async function ensureTestUser() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@bruceapp.com';
        const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'password123';

        if (!MONGODB_URI) {
            console.error('❌ MONGODB_URI no está definida');
            process.exit(1);
        }

        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Definir el schema del usuario
        const usuarioSchema = new mongoose.Schema({
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            nombre: String,
            role: { type: String, default: 'user' },
            createdAt: { type: Date, default: Date.now },
        });

        // Método para comparar contraseñas
        usuarioSchema.methods.comparePassword = async function (candidatePassword) {
            const bcrypt = require('bcrypt');
            return await bcrypt.compare(candidatePassword, this.password);
        };

        // Método estático para encontrar por email
        usuarioSchema.statics.findByEmail = function (email) {
            return this.findOne({ email: email.toLowerCase().trim() });
        };

        // Pre-save hook para hashear contraseña
        usuarioSchema.pre('save', async function (next) {
            if (!this.isModified('password')) return next();

            const bcrypt = require('bcrypt');
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            next();
        });

        const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);

        // Verificar si el usuario existe
        const existingUser = await Usuario.findByEmail(TEST_USER_EMAIL);

        if (existingUser) {
            console.log('✅ Usuario de prueba ya existe:', TEST_USER_EMAIL);

            // Verificar que la contraseña sea correcta
            const isPasswordCorrect = await existingUser.comparePassword(TEST_USER_PASSWORD);
            if (isPasswordCorrect) {
                console.log('✅ La contraseña es correcta');
            } else {
                console.log('⚠️ La contraseña no coincide, actualizando...');
                existingUser.password = TEST_USER_PASSWORD;
                await existingUser.save();
                console.log('✅ Contraseña actualizada');
            }
        } else {
            console.log('📝 Creando usuario de prueba:', TEST_USER_EMAIL);
            const newUser = new Usuario({
                email: TEST_USER_EMAIL,
                password: TEST_USER_PASSWORD,
                nombre: 'Test User',
                role: 'user'
            });
            await newUser.save();
            console.log('✅ Usuario de prueba creado exitosamente');
        }

        // Crear también el usuario admin si está definido
        const ADMIN_USER_EMAIL = process.env.ADMIN_USER_EMAIL || 'admin@bruceapp.com';
        const ADMIN_USER_PASSWORD = process.env.ADMIN_USER_PASSWORD || 'admin123';

        const existingAdmin = await Usuario.findByEmail(ADMIN_USER_EMAIL);

        if (existingAdmin) {
            console.log('✅ Usuario admin ya existe:', ADMIN_USER_EMAIL);

            // Verificar que la contraseña sea correcta
            const isPasswordCorrect = await existingAdmin.comparePassword(ADMIN_USER_PASSWORD);
            if (isPasswordCorrect) {
                console.log('✅ La contraseña de admin es correcta');
            } else {
                console.log('⚠️ La contraseña de admin no coincide, actualizando...');
                existingAdmin.password = ADMIN_USER_PASSWORD;
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Contraseña de admin actualizada');
            }
        } else {
            console.log('📝 Creando usuario admin:', ADMIN_USER_EMAIL);
            const newAdmin = new Usuario({
                email: ADMIN_USER_EMAIL,
                password: ADMIN_USER_PASSWORD,
                nombre: 'Admin User',
                role: 'admin'
            });
            await newAdmin.save();
            console.log('✅ Usuario admin creado exitosamente');
        }

        await mongoose.disconnect();
        console.log('✅ Proceso completado');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

ensureTestUser();
