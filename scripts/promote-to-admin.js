
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Esquema de Usuario simplificado para actualización
const usuarioSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'usuario'], default: 'usuario' }
});

// Usar el modelo existente o definir uno nuevo si no existe
const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/canopia';
        await mongoose.connect(uri);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
};

const promoteToAdmin = async () => {
    try {
        await connectDB();

        const email = 'test@canopia.app';

        // Buscar y actualizar
        const result = await Usuario.findOneAndUpdate(
            { email: email },
            { $set: { role: 'admin' } },
            { new: true } // Devolver el documento actualizado
        );

        if (result) {
            console.log(`✅ Usuario ${email} actualizado exitosamente`);
            console.log(`👑 Nuevo rol: ${result.role}`);
        } else {
            console.error(`❌ No se encontró el usuario ${email}`);
        }

    } catch (error) {
        console.error('❌ Error actualizando usuario:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
};

promoteToAdmin();
