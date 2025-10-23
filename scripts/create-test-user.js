#!/usr/bin/env node

/**
 * Script para crear el usuario de prueba test@bruceapp.com
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

// Esquema de Usuario
const usuarioSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nombre: { type: String, required: true },
    role: { type: String, enum: ['admin', 'usuario'], default: 'usuario' },
    activo: { type: Boolean, default: true },
    fechaCreacion: { type: Date, default: Date.now },
    ultimoLogin: { type: Date },
    subscripcionActiva: { type: Boolean, default: false },
    fechaVencimientoSubscripcion: { type: Date },
    planSubscripcion: { type: String, enum: ['basico', 'premium', 'profesional'], default: 'basico' }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bruceapp';
        await mongoose.connect(uri);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
};

const createTestUser = async () => {
    try {
        await connectDB();

        // Verificar si el usuario ya existe
        const existingUser = await Usuario.findOne({ email: 'test@bruceapp.com' });
        if (existingUser) {
            console.log('⚠️  El usuario test@bruceapp.com ya existe');
            return;
        }

        // Crear usuario de prueba
        const hashedPassword = await bcrypt.hash('password123', 10);

        const testUser = new Usuario({
            email: 'test@bruceapp.com',
            password: hashedPassword,
            nombre: 'Usuario Test',
            role: 'usuario',
            activo: true,
            subscripcionActiva: true,
            planSubscripcion: 'premium',
            fechaVencimientoSubscripcion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
        });

        await testUser.save();
        console.log('✅ Usuario de prueba creado exitosamente');
        console.log('📧 Email: test@bruceapp.com');
        console.log('🔐 Password: password123');

    } catch (error) {
        console.error('❌ Error creando usuario de prueba:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
};

createTestUser();
