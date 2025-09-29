#!/usr/bin/env node

/**
 * Script de migración de datos de db.json a MongoDB
 * 
 * Este script migra todos los datos existentes de JSON Server a MongoDB.
 * Se ejecuta una sola vez para transferir los datos históricos.
 * 
 * Uso:
 *   node scripts/migrate-to-mongodb.js
 * 
 * Requisitos:
 *   - MongoDB ejecutándose localmente o URL de conexión en .env.local
 *   - Archivo db.json con datos existentes
 *   - Variables de entorno configuradas
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

// Importar modelos (necesitamos simular la estructura aquí)
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bruceapp';
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB para migración');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Función para leer db.json
const readDatabase = () => {
  try {
    const dbPath = path.join(process.cwd(), 'db.json');
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error leyendo db.json:', error);
    console.log('Asegúrate de que existe el archivo db.json en la raíz del proyecto');
    process.exit(1);
  }
};

// Función principal de migración
async function migrarDatos() {
  console.log('🚀 Iniciando migración de datos de JSON Server a MongoDB...\n');

  // Conectar a MongoDB
  await connectDB();

  // Leer datos de db.json
  const database = readDatabase();
  
  // Estadísticas de migración
  const stats = {
    cultivos: 0,
    tareas: 0,
    notas: 0,
    comentarios: 0,
    mensajes: 0,
    errores: []
  };

  try {
    // === MIGRACIÓN DE CULTIVOS ===
    console.log('📊 Migrando cultivos...');
    if (database.cultivos && Array.isArray(database.cultivos)) {
      for (const cultivo of database.cultivos) {
        try {
          const response = await fetch('http://localhost:3000/api/cultivos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer fake-admin@bruce.app' // Token de admin para migración
            },
            body: JSON.stringify({
              ...cultivo,
              id: undefined, // MongoDB generará el nuevo ID
              fechaCreacion: cultivo.fechaCreacion || new Date().toISOString().split('T')[0],
              activo: cultivo.activo ?? true
            })
          });

          if (response.ok) {
            stats.cultivos++;
            console.log(`  ✅ Cultivo migrado: ${cultivo.nombre}`);
          } else {
            const error = await response.text();
            stats.errores.push(`Cultivo ${cultivo.nombre}: ${error}`);
            console.log(`  ❌ Error en cultivo ${cultivo.nombre}: ${error}`);
          }
        } catch (error) {
          stats.errores.push(`Cultivo ${cultivo.nombre}: ${error.message}`);
          console.log(`  ❌ Error en cultivo ${cultivo.nombre}: ${error.message}`);
        }
      }
    }

    // === MIGRACIÓN DE TAREAS ===
    console.log('\n📅 Migrando tareas...');
    if (database.tareas && Array.isArray(database.tareas)) {
      for (const tarea of database.tareas) {
        try {
          const response = await fetch('http://localhost:3000/api/tareas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer fake-admin@bruce.app'
            },
            body: JSON.stringify({
              ...tarea,
              id: undefined,
              fechaCreacion: tarea.fechaCreacion || new Date().toISOString().split('T')[0],
              fechaActualizacion: tarea.fechaActualizacion || new Date().toISOString().split('T')[0],
              recordatorioEnviado: tarea.recordatorioEnviado || false
            })
          });

          if (response.ok) {
            stats.tareas++;
            console.log(`  ✅ Tarea migrada: ${tarea.titulo}`);
          } else {
            const error = await response.text();
            stats.errores.push(`Tarea ${tarea.titulo}: ${error}`);
            console.log(`  ❌ Error en tarea ${tarea.titulo}: ${error}`);
          }
        } catch (error) {
          stats.errores.push(`Tarea ${tarea.titulo}: ${error.message}`);
          console.log(`  ❌ Error en tarea ${tarea.titulo}: ${error.message}`);
        }
      }
    }

    // === MIGRACIÓN DE NOTAS ===
    console.log('\n📝 Migrando notas...');
    if (database.sampleNotes && Array.isArray(database.sampleNotes)) {
      for (const nota of database.sampleNotes) {
        try {
          const response = await fetch('http://localhost:3000/api/notas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...nota,
              id: undefined,
              date: nota.date || new Date().toISOString().split('T')[0],
              fechaCreacion: new Date().toISOString().split('T')[0],
              activa: true
            })
          });

          if (response.ok) {
            stats.notas++;
            console.log(`  ✅ Nota migrada: ${nota.title}`);
          } else {
            const error = await response.text();
            stats.errores.push(`Nota ${nota.title}: ${error}`);
            console.log(`  ❌ Error en nota ${nota.title}: ${error}`);
          }
        } catch (error) {
          stats.errores.push(`Nota ${nota.title}: ${error.message}`);
          console.log(`  ❌ Error en nota ${nota.title}: ${error.message}`);
        }
      }
    }

    // === MIGRACIÓN DE COMENTARIOS (si existen) ===
    console.log('\n💬 Migrando comentarios...');
    if (database.comentarios && Array.isArray(database.comentarios)) {
      for (const comentario of database.comentarios) {
        try {
          const response = await fetch('http://localhost:3000/api/comentarios', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...comentario,
              id: undefined,
              fecha: comentario.fecha || new Date().toISOString(),
              activo: true,
              resuelto: comentario.resuelto || false
            })
          });

          if (response.ok) {
            stats.comentarios++;
            console.log(`  ✅ Comentario migrado: ${comentario.titulo}`);
          } else {
            const error = await response.text();
            stats.errores.push(`Comentario ${comentario.titulo}: ${error}`);
            console.log(`  ❌ Error en comentario ${comentario.titulo}: ${error}`);
          }
        } catch (error) {
          stats.errores.push(`Comentario ${comentario.titulo}: ${error.message}`);
          console.log(`  ❌ Error en comentario ${comentario.titulo}: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    stats.errores.push(`Error general: ${error.message}`);
  } finally {
    await mongoose.disconnect();
  }

  // === REPORTE FINAL ===
  console.log('\n📊 REPORTE DE MIGRACIÓN');
  console.log('='.repeat(50));
  console.log(`✅ Cultivos migrados: ${stats.cultivos}`);
  console.log(`✅ Tareas migradas: ${stats.tareas}`);
  console.log(`✅ Notas migradas: ${stats.notas}`);
  console.log(`✅ Comentarios migrados: ${stats.comentarios}`);
  console.log(`✅ Total de registros: ${stats.cultivos + stats.tareas + stats.notas + stats.comentarios}`);
  
  if (stats.errores.length > 0) {
    console.log(`\n❌ Errores encontrados: ${stats.errores.length}`);
    stats.errores.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  } else {
    console.log('\n🎉 ¡Migración completada sin errores!');
  }

  console.log('\n📌 Siguientes pasos:');
  console.log('1. Verifica que los datos se migraron correctamente');
  console.log('2. Haz una copia de seguridad de db.json');
  console.log('3. Actualiza el package.json para remover json-server');
  console.log('4. Configura MongoDB en producción');
}

// Ejecutar migración
if (require.main === module) {
  migrarDatos().catch(error => {
    console.error('💥 Error fatal en la migración:', error);
    process.exit(1);
  });
}

module.exports = { migrarDatos };
