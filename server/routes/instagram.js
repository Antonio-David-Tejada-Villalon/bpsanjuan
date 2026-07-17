const express = require('express');
const https   = require('https');

const router = express.Router();

let cache = { data: null, ts: 0 };
const CACHE_TTL = 15 * 60 * 1000; // 15 min

function igFetch(path) {
  return new Promise((resolve, reject) => {
    https.get(`https://graph.instagram.com${path}`, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// GET /api/instagram/feed
router.get('/feed', async (req, res) => {
  try {
    if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
      return res.json(cache.data);
    }

    const token  = process.env.INSTAGRAM_ACCESS_TOKEN;
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

module.exports = router;
