/**
 * Script para crear usuarios de test en CI
 * Se ejecuta antes de los tests para asegurar que los usuarios existan
 */

import connectDB from '../src/lib/mongodb.js';
import Usuario from '../src/lib/models/Usuario.js';

async function createTestUsers() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDB();

        const testUsers = [
            {
                email: process.env.TEST_USER_EMAIL || 'test@bruceapp.com',
                password: process.env.TEST_USER_PASSWORD || 'password123',
                name: 'Usuario Test',
                role: 'user'
            },
            {
                email: process.env.ADMIN_USER_EMAIL || 'admin@bruceapp.com',
                password: process.env.ADMIN_USER_PASSWORD || 'admin123',
                name: 'Admin Test',
                role: 'admin'
            }
        ];

        console.log('👥 Creating/updating test users...');

        for (const userData of testUsers) {
            // Verificar si el usuario ya existe
            const existingUser = await Usuario.findOne({ email: userData.email });

            if (existingUser) {
                console.log(`✅ User ${userData.email} already exists`);

                // Actualizar contraseña si es diferente
                if (existingUser.password !== userData.password) {
                    existingUser.password = userData.password;
                    await existingUser.save();
                    console.log(`🔄 Updated password for ${userData.email}`);
                }
            } else {
                // Crear nuevo usuario
                const newUser = new Usuario(userData);
                await newUser.save();
                console.log(`➕ Created user ${userData.email}`);
            }
        }

        console.log('✅ Test users setup completed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error setting up test users:', error);
        process.exit(1);
    }
}

createTestUsers();
