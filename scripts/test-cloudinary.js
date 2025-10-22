/**
 * Script para probar la configuración de Cloudinary
 * Verifica que las credenciales estén configuradas y prueba una subida básica
 */

const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');
const path = require('path');

// Configurar Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Verifica que las credenciales de Cloudinary estén configuradas
 */
function verificarCredenciales() {
  const { cloud_name, api_key, api_secret } = cloudinary.config();

  if (!cloud_name || cloud_name === 'your_cloud_name_here') {
    console.error('❌ CLOUDINARY_CLOUD_NAME no está configurado correctamente');
    return false;
  }

  if (!api_key || api_key === 'your_api_key_here') {
    console.error('❌ CLOUDINARY_API_KEY no está configurado correctamente');
    return false;
  }

  if (!api_secret || api_secret === 'your_api_secret_here') {
    console.error('❌ CLOUDINARY_API_SECRET no está configurado correctamente');
    return false;
  }

  console.log('✅ Credenciales de Cloudinary configuradas correctamente');
  return true;
}

/**
 * Prueba básica de conexión a Cloudinary
 */
async function probarConexion() {
  try {
    console.log('🔄 Probando conexión a Cloudinary...');

    // Intentar obtener información de la cuenta
    const result = await cloudinary.api.ping();
    console.log('✅ Conexión a Cloudinary exitosa:', result);

    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Cloudinary:', error.message);
    return false;
  }
}

/**
 * Prueba de subida de una imagen pequeña
 */
async function probarSubida() {
  try {
    console.log('🔄 Probando subida de imagen de prueba...');

    // Crear una imagen de prueba simple (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const result = await cloudinary.uploader.upload_stream(
      {
        public_id: `test-galeria-${Date.now()}`,
        folder: 'galeria-cultivos/test',
        resource_type: 'image',
        quality: 'auto',
      },
      (error, result) => {
        if (error) {
          throw error;
        }
        return result;
      }
    ).end(testImageBuffer);

    console.log('✅ Subida de imagen de prueba exitosa:');
    console.log('   URL:', result.secure_url);
    console.log('   Public ID:', result.public_id);
    console.log('   Tamaño:', result.bytes, 'bytes');

    return true;
  } catch (error) {
    console.error('❌ Error al subir imagen de prueba:', error.message);
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 Probando configuración de Cloudinary para galería de cultivos\n');

  // Verificar credenciales
  if (!verificarCredenciales()) {
    console.log('\n❌ Configuración incompleta. Por favor:');
    console.log('   1. Ve a https://cloudinary.com/console');
    console.log('   2. Copia tus credenciales');
    console.log('   3. Actualiza el archivo .env.local con los valores reales');
    process.exit(1);
  }

  // Probar conexión
  if (!(await probarConexion())) {
    console.log('\n❌ No se pudo conectar a Cloudinary. Verifica tus credenciales.');
    process.exit(1);
  }

  // Probar subida
  if (!(await probarSubida())) {
    console.log('\n❌ No se pudo subir imagen de prueba.');
    process.exit(1);
  }

  console.log('\n🎉 ¡Todo funciona correctamente!');
  console.log('   Las imágenes de la galería de cultivos ahora se subirán a Cloudinary.');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verificarCredenciales, probarConexion, probarSubida };
