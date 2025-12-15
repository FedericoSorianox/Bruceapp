#!/usr/bin/env node

/**
 * Script para inicializar MongoDB con datos de ejemplo
 * 
 * Este script crea datos de ejemplo para desarrollo y testing.
 * Útil para nuevas instalaciones o para resetear la base de datos de desarrollo.
 * 
 * Uso:
 *   node scripts/seed-mongodb.js
 * 
 * Requisitos:
 *   - MongoDB ejecutándose
 *   - Variables de entorno configuradas
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/canopia';
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB para inicialización');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Datos de ejemplo para cultivosS
const cultivosEjemplo = [
  {
    nombre: "Tomates Cherry Hidropónicos",
    sustrato: "Fibra de coco",
    metrosCuadrados: 2.5,
    fechaComienzo: "2024-01-15",
    numeroplantas: 12,
    litrosMaceta: 5,
    potenciaLamparas: 400,
    genetica: "Cherry Roma",
    activo: true,
    notas: "Cultivo experimental con sistema hidropónico NFT. Excelente desarrollo inicial.",
    fechaCreacion: "2024-01-15",
    creadoPor: "admin@canopia.app"
  },
  {
    nombre: "Lechugas Variedades Mixtas",
    sustrato: "Turba con perlita",
    metrosCuadrados: 1.8,
    fechaComienzo: "2024-02-01",
    numeroplantas: 24,
    litrosMaceta: 2,
    potenciaLamparas: 200,
    genetica: "Batavia, Iceberg, Romana",
    activo: true,
    notas: "Rotación de lechugas para cosecha continua cada 3 semanas.",
    fechaCreacion: "2024-02-01",
    creadoPor: "admin@canopia.app"
  },
  {
    nombre: "Albahaca Aromática",
    sustrato: "Sustrato universal",
    metrosCuadrados: 0.8,
    fechaComienzo: "2024-02-10",
    numeroplantas: 8,
    litrosMaceta: 3,
    potenciaLamparas: 150,
    genetica: "Genovese, Thai, Purple",
    activo: true,
    notas: "Cultivo de hierbas aromáticas para uso culinario y comercial.",
    fechaCreacion: "2024-02-10",
    creadoPor: "admin@canopia.app",
    fechaInicioFloracion: "2024-03-01"
  }
];

// Datos de ejemplo para tareas
const tareasEjemplo = [
  {
    cultivoId: "", // Se asignará dinámicamente
    titulo: "Riego matutino - Tomates",
    descripcion: "Verificar nivel de agua en el sistema hidropónico y ajustar pH si es necesario",
    tipo: "riego",
    estado: "pendiente",
    prioridad: "alta",
    fechaProgramada: "2024-03-15",
    horaProgramada: "08:00",
    fechaCreacion: "2024-03-10",
    fechaActualizacion: "2024-03-10",
    duracionEstimada: 30,
    esRecurrente: true,
    frecuencia: "diaria",
    recordatorioActivado: true,
    minutosRecordatorio: 15,
    recordatorioEnviado: false,
    creadoPor: "admin@canopia.app"
  },
  {
    cultivoId: "", // Se asignará dinámicamente
    titulo: "Aplicación fertilizante NPK",
    descripcion: "Aplicar fertilizante balanceado 20-20-20 según programa nutricional",
    tipo: "fertilizacion",
    estado: "completada",
    prioridad: "media",
    fechaProgramada: "2024-03-12",
    horaProgramada: "09:30",
    fechaCreacion: "2024-03-10",
    fechaActualizacion: "2024-03-12",
    fechaCompletada: "2024-03-12",
    duracionEstimada: 45,
    esRecurrente: true,
    frecuencia: "semanal",
    recordatorioActivado: false,
    recordatorioEnviado: false,
    creadoPor: "admin@canopia.app",
    notas: "Aplicado según concentración recomendada. Plantas respondieron bien."
  }
];

// Datos de ejemplo para notas
const notasEjemplo = [
  {
    title: "Protocolo de Germinación de Semillas",
    content: `# Protocolo de Germinación Optimizado

## Materiales necesarios:
- Bandejas de germinación
- Sustrato estéril (turba + vermiculita)
- Cámara de germinación con control de temperatura
- pH metro

## Proceso:
1. **Preparación del sustrato**: Mezclar turba con vermiculita en proporción 70:30
2. **Siembra**: Colocar 2-3 semillas por alvéolo a profundidad 2x tamaño de semilla
3. **Condiciones ambientales**: 
   - Temperatura: 22-25°C
   - Humedad: 80-90%
   - Luz: 12h diarias de LED blanco
4. **Riego**: Nebulización 2-3 veces al día sin encharcar

## Notas importantes:
- Verificar germinación a partir del día 3
- Transplantar cuando aparezcan 2-4 hojas verdaderas
- Mantener registro de % de germinación por lote`,
    category: "investigacion",
    tags: ["germinacion", "protocolo", "semillas", "optimizacion"],
    date: "2024-03-10",
    author: "admin@canopia.app",
    priority: "alta",
    hasImages: false,
    cropArea: "Área de Propagación"
  },
  {
    title: "Observaciones Plagas - Marzo 2024",
    content: `Detectada presencia leve de áfidos en lechugas del sector norte. 

**Síntomas observados:**
- Hojas ligeramente curvadas
- Presencia de melaza en 3-4 plantas
- Coloración amarillenta en bordes

**Acciones tomadas:**
- Aplicación de jabón potásico al 1%
- Incremento de ventilación en la zona
- Introducción de mariquitas como control biológico

**Seguimiento:**
Revisión diaria durante una semana para evaluar efectividad del tratamiento.`,
    category: "plagas",
    tags: ["afidos", "lechugas", "control-biologico", "observacion"],
    date: "2024-03-12",
    author: "admin@canopia.app",
    priority: "media",
    hasImages: false,
    cropArea: "Lechugas - Sector Norte"
  },
  {
    title: "Receta Nutritiva Hidropónica v2.0",
    content: `Fórmula optimizada para tomates en sistema NFT:

**Macronutrientes (por 1000L):**
- Nitrato de calcio: 950g
- Nitrato de potasio: 700g
- Fosfato monopotásico: 280g
- Sulfato de magnesio: 500g

**Micronutrientes:**
- Quelato de hierro: 30g
- Sulfato de manganeso: 8g
- Sulfato de zinc: 3g
- Ácido bórico: 3g
- Sulfato de cobre: 1g
- Molibdato de sodio: 0.5g

**Parámetros objetivo:**
- EC: 2.0-2.4 mS/cm
- pH: 5.8-6.2
- Temperatura solución: 18-22°C

Resultados excelentes en productividad y calidad de fruto.`,
    category: "nutricion",
    tags: ["hidroponia", "tomates", "nutrientes", "receta", "nft"],
    date: "2024-03-08",
    author: "admin@canopia.app",
    priority: "alta",
    hasImages: false,
    cropArea: "Tomates Hidropónicos"
  }
];

// Función para crear datos de ejemplo
async function crearDatosEjemplo() {
  console.log('🌱 Iniciando creación de datos de ejemplo en MongoDB...\n');

  await connectDB();

  const stats = {
    cultivos: 0,
    tareas: 0,
    notas: 0,
    errores: []
  };

  try {
    // === CREAR CULTIVOS ===
    console.log('📊 Creando cultivos de ejemplo...');
    const cultivosCreados = [];

    for (const cultivo of cultivosEjemplo) {
      try {
        const response = await fetch('http://localhost:3000/api/cultivos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer fake-admin@canopia.app'
          },
          body: JSON.stringify(cultivo)
        });

        if (response.ok) {
          const result = await response.json();
          cultivosCreados.push(result.data);
          stats.cultivos++;
          console.log(`  ✅ Cultivo creado: ${cultivo.nombre}`);
        } else {
          const error = await response.text();
          stats.errores.push(`Cultivo ${cultivo.nombre}: ${error}`);
        }
      } catch (error) {
        stats.errores.push(`Cultivo ${cultivo.nombre}: ${error.message}`);
      }
    }

    // === CREAR TAREAS ===
    console.log('\n📅 Creando tareas de ejemplo...');
    if (cultivosCreados.length > 0) {
      for (let i = 0; i < tareasEjemplo.length; i++) {
        const tarea = { ...tareasEjemplo[i] };
        tarea.cultivoId = cultivosCreados[Math.min(i, cultivosCreados.length - 1)].id;

        try {
          const response = await fetch('http://localhost:3000/api/tareas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer fake-admin@canopia.app'
            },
            body: JSON.stringify(tarea)
          });

          if (response.ok) {
            stats.tareas++;
            console.log(`  ✅ Tarea creada: ${tarea.titulo}`);
          } else {
            const error = await response.text();
            stats.errores.push(`Tarea ${tarea.titulo}: ${error}`);
          }
        } catch (error) {
          stats.errores.push(`Tarea ${tarea.titulo}: ${error.message}`);
        }
      }
    }

    // === CREAR NOTAS ===
    console.log('\n📝 Creando notas de ejemplo...');
    for (const nota of notasEjemplo) {
      try {
        const response = await fetch('http://localhost:3000/api/notas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(nota)
        });

        if (response.ok) {
          stats.notas++;
          console.log(`  ✅ Nota creada: ${nota.title}`);
        } else {
          const error = await response.text();
          stats.errores.push(`Nota ${nota.title}: ${error}`);
        }
      } catch (error) {
        stats.errores.push(`Nota ${nota.title}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error durante la creación de datos:', error);
    stats.errores.push(`Error general: ${error.message}`);
  } finally {
    await mongoose.disconnect();
  }

  // === REPORTE FINAL ===
  console.log('\n📊 REPORTE DE INICIALIZACIÓN');
  console.log('='.repeat(50));
  console.log(`✅ Cultivos creados: ${stats.cultivos}`);
  console.log(`✅ Tareas creadas: ${stats.tareas}`);
  console.log(`✅ Notas creadas: ${stats.notas}`);
  console.log(`✅ Total de registros: ${stats.cultivos + stats.tareas + stats.notas}`);

  if (stats.errores.length > 0) {
    console.log(`\n❌ Errores encontrados: ${stats.errores.length}`);
    stats.errores.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  } else {
    console.log('\n🎉 ¡Datos de ejemplo creados exitosamente!');
  }

  console.log('\n📌 La base de datos está lista para desarrollo y testing.');
}

// Ejecutar inicialización
if (require.main === module) {
  crearDatosEjemplo().catch(error => {
    console.error('💥 Error fatal en la inicialización:', error);
    process.exit(1);
  });
}

module.exports = { crearDatosEjemplo };
