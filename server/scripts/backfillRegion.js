require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const PageView = require('../models/PageView');

let geoip;
try { geoip = require('geoip-lite'); } catch {
  console.error('geoip-lite no está instalado. Ejecutá: cd server && npm install geoip-lite');
  process.exit(1);
}

function normalizeIp(ip) {
  if (!ip) return null;
  // IPv4-mapped IPv6: ::ffff:1.2.3.4
  const m = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return m ? m[1] : ip;
}

async function run() {
  console.log('Conectando a MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado.\n');

  const total = await PageView.countDocuments({ ip: { $ne: null }, countryCode: { $ne: null }, region: null });
  console.log(`Registros a procesar: ${total}\n`);

  if (total === 0) {
    console.log('Nada que actualizar. Saliendo.');
    await mongoose.disconnect();
    return;
  }

  const BATCH = 500;
  let processed = 0, updated = 0, skipped = 0;

  while (processed < total) {
    const batch = await PageView.find({ ip: { $ne: null }, countryCode: { $ne: null }, region: null })
      .select('_id ip')
      .limit(BATCH)
      .lean();

    if (batch.length === 0) break;

    const ops = [];
    for (const record of batch) {
      const ip = normalizeIp(record.ip);
      try {
        const geo = geoip.lookup(ip);
        if (geo?.region) {
          ops.push({ updateOne: { filter: { _id: record._id }, update: { $set: { region: geo.region } } } });
          updated++;
        } else {
          skipped++;
        }
      } catch {
        skipped++;
      }
    }

    if (ops.length > 0) await PageView.bulkWrite(ops);

    processed += batch.length;
    process.stdout.write(`\r  ${processed}/${total} procesados — ${updated} actualizados, ${skipped} sin región…`);
  }

  console.log(`\n\nListo: ${updated} registros actualizados, ${skipped} sin datos de región.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error('\nError:', err.message); process.exit(1); });
