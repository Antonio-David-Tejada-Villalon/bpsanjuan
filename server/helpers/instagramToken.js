const https  = require('https');
const Config = require('../models/Config');

const REFRESH_THRESHOLD_DAYS = 15; // renovar si faltan 15 días o menos

// ─── Llama al endpoint de renovación de Instagram ─────────────────────────────
function igRefreshFetch(token) {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`;
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let raw = '';
      res.on('data', c => (raw += c));
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// ─── Devuelve el token activo: MongoDB primero, env var como fallback ──────────
async function getToken() {
  try {
    const record = await Config.findOne({ key: 'instagram_access_token' });
    if (record?.value) return record.value;
  } catch { /* silencioso: usamos env var */ }
  return process.env.INSTAGRAM_ACCESS_TOKEN;
}

// ─── Decide si hay que renovar en base a la fecha de expiración almacenada ────
async function shouldRefresh() {
  try {
    const record = await Config.findOne({ key: 'instagram_token_expires_at' });
    if (!record?.value) return true; // sin fecha → renovar para registrar la expiración
    const msLeft = new Date(record.value) - Date.now();
    return msLeft / (1000 * 60 * 60 * 24) <= REFRESH_THRESHOLD_DAYS;
  } catch {
    return false; // ante error de BD, no forzar renovación
  }
}

// ─── Renueva el token y persiste el nuevo en MongoDB ──────────────────────────
async function refreshToken() {
  const current = await getToken();
  if (!current) {
    console.error('[Instagram] No hay token configurado para renovar.');
    return;
  }

  console.log('[Instagram] Renovando token de acceso...');
  const data = await igRefreshFetch(current);

  if (data.error) {
    console.error('[Instagram] Error de la API al renovar:', data.error.message);
    throw new Error(data.error.message);
  }

  const newToken  = data.access_token;
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

  await Config.findOneAndUpdate(
    { key: 'instagram_access_token' },
    { value: newToken },
    { upsert: true, new: true }
  );
  await Config.findOneAndUpdate(
    { key: 'instagram_token_expires_at' },
    { value: expiresAt },
    { upsert: true, new: true }
  );

  console.log(`[Instagram] Token renovado exitosamente. Expira: ${expiresAt}`);
  return { token: newToken, expiresAt };
}

// ─── Verifica y renueva si corresponde (silencia errores para no matar el server)
async function checkAndRefresh() {
  try {
    if (await shouldRefresh()) {
      await refreshToken();
    } else {
      const record = await Config.findOne({ key: 'instagram_token_expires_at' });
      const daysLeft = record?.value
        ? Math.ceil((new Date(record.value) - Date.now()) / (1000 * 60 * 60 * 24))
        : '?';
      console.log(`[Instagram] Token OK. Días hasta expiración: ${daysLeft}`);
    }
  } catch (err) {
    console.error('[Instagram] Error en checkAndRefresh:', err.message);
  }
}

// ─── Inicia el scheduler: chequeo al arrancar + cada 24 horas ─────────────────
function scheduleAutoRefresh() {
  // Esperar 10 segundos para que MongoDB esté bien conectado antes del primer chequeo
  setTimeout(checkAndRefresh, 10 * 1000);

  // Verificar cada 24 horas
  setInterval(checkAndRefresh, 24 * 60 * 60 * 1000);

  console.log('[Instagram] Scheduler de auto-renovación de token activo (cada 24h).');
}

module.exports = { getToken, refreshToken, scheduleAutoRefresh };
