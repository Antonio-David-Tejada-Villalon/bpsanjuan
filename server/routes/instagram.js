const express  = require('express');
const https    = require('https');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { getToken, refreshToken } = require('../helpers/instagramToken');
const Config   = require('../models/Config');

const router = express.Router();

let cache = { data: null, ts: 0 };
const CACHE_TTL = 15 * 60 * 1000; // 15 min

function igFetch(path) {
  return new Promise((resolve, reject) => {
    https.get(`https://graph.instagram.com${path}`, res => {
      let raw = '';
      res.on('data', c => (raw += c));
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// GET /api/instagram/feed ─────────────────────────────────────────────────────
router.get('/feed', async (req, res) => {
  try {
    if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
      return res.json(cache.data);
    }

    const token  = await getToken();
    const userId = process.env.INSTAGRAM_USER_ID;
    if (!token || !userId) {
      return res.status(503).json({ error: 'Instagram no configurado' });
    }

    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
    const json   = await igFetch(
      `/me/media?fields=${fields}&limit=7&access_token=${token}`
    );

    if (json.error) {
      return res.status(502).json({ error: json.error.message });
    }

    // Para CAROUSEL_ALBUM, thumbnail_url no viene — usamos media_url del primer child
    const posts = await Promise.all(
      (json.data || []).map(async post => {
        if (post.media_type === 'CAROUSEL_ALBUM' && !post.media_url) {
          const children = await igFetch(
            `/${post.id}/children?fields=media_url&access_token=${token}`
          );
          post.media_url = children.data?.[0]?.media_url ?? null;
        }
        return post;
      })
    );

    const payload = posts.filter(p => p.media_url || p.thumbnail_url);
    cache = { data: payload, ts: Date.now() };
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el feed de Instagram' });
  }
});

// POST /api/instagram/refresh — Renovación manual (solo admin) ────────────────
router.post('/refresh', protect, restrictTo('admin'), async (req, res) => {
  try {
    const result = await refreshToken();
    res.json({
      success: true,
      message: 'Token de Instagram renovado correctamente.',
      expiresAt: result?.expiresAt
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Error al renovar: ${err.message}` });
  }
});

// GET /api/instagram/token-status — Estado del token (solo admin) ─────────────
router.get('/token-status', protect, restrictTo('admin'), async (req, res) => {
  try {
    const expiryRecord = await Config.findOne({ key: 'instagram_token_expires_at' });
    const storedToken  = await Config.findOne({ key: 'instagram_access_token' });

    const expiresAt = expiryRecord?.value ? new Date(expiryRecord.value) : null;
    const daysLeft  = expiresAt
      ? Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    res.json({
      success: true,
      source: storedToken?.value ? 'mongodb' : 'env',
      expiresAt: expiresAt?.toISOString() ?? null,
      daysLeft,
      updatedAt: expiryRecord?.updatedAt ?? null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
