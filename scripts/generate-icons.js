/**
 * Script para generar iconos PWA desde SVG
 * Convierte el icono SVG base a PNG en diferentes tamaños
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
  const publicDir = path.join(__dirname, '..', 'public');

  try {
    // Verificar que el SVG existe
    if (!fs.existsSync(svgPath)) {
      console.error('SVG source file not found:', svgPath);
      return;
    }

    // Leer el contenido SVG
    const svgBuffer = fs.readFileSync(svgPath);

    // Generar iconos en diferentes tamaños
    const sizes = [192, 512];

    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);

      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${outputPath}`);
    }

    console.log('✅ All PWA icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
