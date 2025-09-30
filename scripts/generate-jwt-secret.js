#!/usr/bin/env node

/**
 * 🔐 Generador de JWT Secret para Render Deploy
 * 
 * Este script genera un JWT secret seguro para usar en las variables
 * de entorno de Render. El secret generado es criptográficamente seguro
 * y cumple con las mejores prácticas de seguridad.
 * 
 * Uso:
 * - Ejecutar: node scripts/generate-jwt-secret.js
 * - Copiar el resultado al Secret File JWT_SECRET en Render
 */

const crypto = require('crypto');

console.log('🔐 GENERADOR DE JWT SECRET PARA RENDER\n');

try {
  // Generar 32 bytes aleatorios y codificarlos en base64
  const secret = crypto.randomBytes(32).toString('base64');
  
  console.log('✅ JWT Secret generado exitosamente:\n');
  console.log('━'.repeat(60));
  console.log(secret);
  console.log('━'.repeat(60));
  console.log('\n📋 INSTRUCCIONES:');
  console.log('1. Copia el texto de arriba (toda la línea)');
  console.log('2. Ve a Render Dashboard → Settings → Secret Files');
  console.log('3. Crear nuevo Secret File:');
  console.log('   • FILENAME: JWT_SECRET');
  console.log('   • CONTENTS: [pega el secret copiado]');
  console.log('4. Guarda y haz redeploy\n');
  
  console.log('⚠️  IMPORTANTE:');
  console.log('• NO compartas este secret públicamente');
  console.log('• Este secret es único - no lo reutilices');
  console.log('• Guárdalo en lugar seguro como backup\n');
  
  // Información adicional para debugging
  console.log('ℹ️  Información técnica:');
  console.log(`• Longitud: ${secret.length} caracteres`);
  console.log(`• Entropy: ${crypto.randomBytes(32).length * 8} bits`);
  console.log(`• Encoding: Base64`);
  console.log(`• Timestamp: ${new Date().toISOString()}\n`);
  
} catch (error) {
  console.error('❌ Error generando JWT secret:', error.message);
  console.log('\n🔧 Soluciones alternativas:');
  console.log('1. Usar comando openssl: openssl rand -base64 32');
  console.log('2. Usar generador online: https://generate-secret.vercel.app/32');
  console.log('3. Contactar soporte si persiste el error\n');
  process.exit(1);
}
