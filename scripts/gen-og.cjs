#!/usr/bin/env node
// Genera client/public/og-image.png desde client/public/og-image.svg
// Uso: desde la raíz del proyecto → node scripts/gen-og.cjs
// Requiere sharp: cd client && npm install --save-dev sharp

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const root   = path.join(__dirname, '..');
const svgIn  = path.join(root, 'client', 'public', 'og-image.svg');
const pngOut = path.join(root, 'client', 'public', 'og-image.png');

if (!fs.existsSync(svgIn)) {
  console.error('❌  No encontré client/public/og-image.svg');
  process.exit(1);
}

sharp(fs.readFileSync(svgIn))
  .resize(1200, 630)
  .png({ quality: 95, compressionLevel: 8 })
  .toFile(pngOut)
  .then(() => console.log('✓  og-image.png generado en client/public/'))
  .catch(err => {
    console.error('❌  Error al generar PNG:', err.message);
    process.exit(1);
  });
