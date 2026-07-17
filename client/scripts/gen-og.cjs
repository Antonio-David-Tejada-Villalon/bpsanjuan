#!/usr/bin/env node
// Genera public/og-image.png desde public/og-image.svg
// Uso: cd client && npm run gen-og

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const svgIn  = path.join(__dirname, '..', 'public', 'og-image.svg');
const pngOut = path.join(__dirname, '..', 'public', 'og-image.png');

if (!fs.existsSync(svgIn)) {
  console.error('❌  No encontré public/og-image.svg');
  process.exit(1);
}

sharp(fs.readFileSync(svgIn))
  .resize(1200, 630)
  .png({ quality: 95, compressionLevel: 8 })
  .toFile(pngOut)
  .then(() => console.log('✓  og-image.png generado en public/'))
  .catch(err => {
    console.error('❌  Error al generar PNG:', err.message);
    process.exit(1);
  });
