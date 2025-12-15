const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Configuración
// Nota: en producción esto vendría de ENV, aquí simulamos para el script
const OLD_DB_NAME = 'canopia_fede_danguard'; // Asumiendo este es el nombre normalizado para fede.danguard (verificar normalización)
const NEW_DB_NAME = 'canopia_main';
const TARGET_USER_EMAIL = 'fede.danguard@gmail.com'; // Verificar email correcto
const TARGET_CULTIVO_NAME = '24 Kev';

// Definir Schemas Mínimos para Migración
const CultivoSchema = new mongoose.Schema({
    nombre: String,
    creadoPor: String,
    // ... permitir otros campos flexibles
}, { strict: false });

async function migrate() {
    console.log('🚀 Iniciando migración selectiva...');

    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI no definida');
        process.exit(1);
    }

    const baseUri = process.env.MONGODB_URI;

    // 1. Conectar a DB Antigua
    const oldUri = baseUri.replace(/\/[^/]*$/, `/${OLD_DB_NAME}`);
    console.log(`🔌 Conectando a DB antigua: ${OLD_DB_NAME}`);
    const oldConn = await mongoose.createConnection(oldUri).asPromise();
    const OldCultivo = oldConn.model('Cultivo', CultivoSchema, 'cultivos');
    const OldTarea = oldConn.model('Tarea', new mongoose.Schema({}, { strict: false }), 'tareas');

    // 2. Conectar a DB Nueva (Global)
    const newUri = baseUri.replace(/\/[^/]*$/, `/${NEW_DB_NAME}`);
    console.log(`🔌 Conectando a DB nueva: ${NEW_DB_NAME}`);
    const newConn = await mongoose.createConnection(newUri).asPromise();
    const NewCultivo = newConn.model('Cultivo', CultivoSchema, 'cultivos');
    const NewTarea = newConn.model('Tarea', new mongoose.Schema({}, { strict: false }), 'tareas');

    try {
        // 3. Buscar el Cultivo
        console.log(`🔍 Buscando cultivo "${TARGET_CULTIVO_NAME}"...`);
        // Búsqueda flexible (case insensitive y contains para asegurar que lo encontramos)
        const cultivo = await OldCultivo.findOne({
            nombre: { $regex: TARGET_CULTIVO_NAME, $options: 'i' }
        }).lean();

        if (!cultivo) {
            console.error(`❌ No se encontró el cultivo "${TARGET_CULTIVO_NAME}" en ${OLD_DB_NAME}`);
            // Listar cultivos disponibles para ayudar a debuggear
            const cultivosDisponibles = await OldCultivo.find({}, { nombre: 1 }).limit(10);
            console.log('Cultivos disponibles encontrados:', cultivosDisponibles.map(c => c.nombre));
            return;
        }

        console.log(`✅ Cultivo encontrado: ${cultivo.nombre} (${cultivo._id})`);

        // 4. Preparar Datos para Migración
        const oldId = cultivo._id;
        delete cultivo._id; // Dejar que MongoDB genere nuevo ID o mantenerlo? Mejor mantener para consistencia de referencias si es posible, pero podría haber colisión.
        // En single DB fresh start, es seguro mantener el ID si la DB está vacía o es diferente.
        // Vamos a intentar mantener el ID para simplificar migración de tareas.
        cultivo._id = oldId;
        cultivo.creadoPor = TARGET_USER_EMAIL; // Asegurar propiedad correcta
        cultivo.migrado = true;

        // 5. Insertar Cultivo en Nueva DB
        // Usar findOneAndUpdate con upsert para evitar duplicados si se corre 2 veces
        await NewCultivo.findByIdAndUpdate(oldId, cultivo, { upsert: true, new: true });
        console.log(`💾 Cultivo insertado/actualizado en ${NEW_DB_NAME}`);

        // 6. Migrar Tareas Asociadas
        console.log('🔍 Buscando tareas asociadas...');
        // Buscar tareas donde cultivoId coincida con el ID del cultivo (string o objectId)
        const tareas = await OldTarea.find({
            $or: [
                { cultivoId: oldId.toString() },
                { cultivoId: oldId }
            ]
        }).lean();

        console.log(`📋 Encontradas ${tareas.length} tareas para migrar.`);

        if (tareas.length > 0) {
            const bulkOps = tareas.map(tarea => {
                tarea.creadoPor = TARGET_USER_EMAIL; // Update owner
                return {
                    updateOne: {
                        filter: { _id: tarea._id },
                        update: { $set: tarea },
                        upsert: true
                    }
                };
            });

            const result = await NewTarea.bulkWrite(bulkOps);
            console.log(`✅ Tareas migradas: ${result.upsertedCount + result.modifiedCount}`);
        }

        console.log('✨ Migración completada exitosamente.');

    } catch (error) {
        console.error('💥 Error durante migración:', error);
    } finally {
        await oldConn.close();
        await newConn.close();
        console.log('🔌 Conexiones cerradas.');
    }
}

migrate();
