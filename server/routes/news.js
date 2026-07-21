const express = require('express');
const { body, validationResult } = require('express-validator');
const News = require('../models/News');
const { protect } = require('../middleware/authMiddleware');
const { getPublicUser, isStaffRequest } = require('../middleware/publicAuth');

const router = express.Router();

// ─── GET /api/news — Listar noticias publicadas (público) ─────────────────
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 6, search, tag } = req.query;
    const filter = { isPublished: true };

    if (search) filter.$text = { $search: search };
    if (tag) filter.tags = tag;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [news, total] = await Promise.all([
      News.find(filter)
        .populate('author', 'name')
        .populate('relatedDepartment', 'name slug')
        .select('-comments -content')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      News.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: news.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      news
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener noticias.' });
  }
});

// ─── GET /api/news/rss — Feed RSS 2.0 (público) ──────────────────────────────
router.get('/rss', async (req, res) => {
  try {
    const news = await News.find({ isPublished: true })
      .select('title summary thumbnail publishedAt createdAt _id')
      .sort({ publishedAt: -1 })
      .limit(20);

    const escapeXml = (s) => String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const BASE = 'https://bpsanjuan.vercel.app';
    const SELF = 'https://bpsanjuan.onrender.com/api/news/rss';

    const items = news.map(n => {
      const url = `${BASE}/noticias/${n._id}`;
      const pubDate = new Date(n.publishedAt || n.createdAt).toUTCString();
      const enclosure = n.thumbnail
        ? `\n      <enclosure url="${escapeXml(n.thumbnail)}" type="image/jpeg" length="0"/>` : '';
      return `    <item>
      <title>${escapeXml(n.title)}</title>
      <link>${url}</link>
      <description>${escapeXml(n.summary)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${url}</guid>${enclosure}
    </item>`;
    }).join('\n');

    const lastBuild = news.length > 0
      ? new Date(news[0].publishedAt || news[0].createdAt).toUTCString()
      : new Date().toUTCString();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Noticias — Dirección de Bibliotecas Populares de San Juan</title>
    <link>${BASE}</link>
    <description>Noticias y actividades culturales de la red de bibliotecas populares de San Juan, Argentina.</description>
    <language>es-AR</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SELF}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=900');
    res.send(xml);
  } catch {
    res.status(500).type('text/plain').send('Error al generar el feed RSS.');
  }
});

// ─── GET /api/news/:id — Ver noticia completa (público; staff ve también ocultos)
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findOne({ _id: req.params.id, isPublished: true })
      .populate('author', 'name')
      .populate('relatedDepartment', 'name slug')
      .populate('comments.publicUser', 'name picture')
      .populate('comments.hiddenBy', 'name');

    if (!news) {
      return res.status(404).json({ success: false, message: 'Noticia no encontrada.' });
    }

    const newsObj = news.toObject();
    if (!isStaffRequest(req)) {
      newsObj.comments = newsObj.comments.filter(c => !c.hidden);
    }

    res.status(200).json({ success: true, news: newsObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la noticia.' });
  }
});

// ─── GET /api/news/admin/all — Listar TODAS las noticias (staff) ──────────
router.get('/admin/all', protect, async (req, res) => {
  try {
    const canManageNews =
      req.user.role === 'admin' ||
      (req.user.role === 'supervisor' && req.user.permissions?.canManageNews);

    if (!canManageNews) {
      return res.status(403).json({ success: false, message: 'Sin permisos para ver todas las noticias.' });
    }

    const news = await News.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: news.length, news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener noticias.' });
  }
});

// ─── POST /api/news — Crear noticia (admin o supervisor con permiso) ───────
router.post('/', protect, [
  body('title').trim().notEmpty().withMessage('El título es requerido'),
  body('summary').trim().notEmpty().withMessage('El resumen es requerido'),
  body('content').trim().notEmpty().withMessage('El contenido es requerido')
], async (req, res) => {
  try {
    const canManageNews =
      req.user.role === 'admin' ||
      (req.user.role === 'supervisor' && req.user.permissions?.canManageNews);

    if (!canManageNews) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para crear noticias.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const news = await News.create({ ...req.body, author: req.user._id });
    res.status(201).json({ success: true, news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear la noticia.' });
  }
});

// ─── PATCH /api/news/:id — Editar noticia ─────────────────────────────────
router.patch('/:id', protect, async (req, res) => {
  try {
    const canManageNews =
      req.user.role === 'admin' ||
      (req.user.role === 'supervisor' && req.user.permissions?.canManageNews);

    if (!canManageNews) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para editar noticias.' });
    }

    const allowedFields = ['title', 'summary', 'content', 'thumbnail', 'images', 'tags', 'isPublished', 'relatedDepartment', 'publishedAt'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // findByIdAndUpdate bypasses pre('save'), so set publishedAt manually when publishing
    if (updates.isPublished === true && !updates.publishedAt) {
      const existing = await News.findById(req.params.id).select('publishedAt');
      if (existing && !existing.publishedAt) {
        updates.publishedAt = new Date();
      }
    }

    const news = await News.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true
    }).populate('author', 'name');

    if (!news) {
      return res.status(404).json({ success: false, message: 'Noticia no encontrada.' });
    }

    res.status(200).json({ success: true, news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar la noticia.' });
  }
});

// ─── DELETE /api/news/:id — Eliminar noticia (admin) ─────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Solo el administrador puede eliminar noticias.' });
    }

    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'Noticia no encontrada.' });
    }

    res.status(200).json({ success: true, message: 'Noticia eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar la noticia.' });
  }
});

// ─── POST /api/news/:id/like — Like de usuario público ────────────────────
router.post('/:id/like', async (req, res) => {
  try {
    const publicUser = await getPublicUser(req);
    if (!publicUser) {
      return res.status(401).json({ success: false, message: 'Debes iniciar sesión con Google para dar likes.' });
    }

    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'Noticia no encontrada.' });

    const alreadyLiked = publicUser.likedNews.includes(news._id);

    if (alreadyLiked) {
      publicUser.likedNews.pull(news._id);
      news.likes = Math.max(0, news.likes - 1);
    } else {
      publicUser.likedNews.push(news._id);
      news.likes += 1;
    }

    await Promise.all([publicUser.save(), news.save()]);
    res.status(200).json({ success: true, liked: !alreadyLiked, likes: news.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al procesar el like.' });
  }
});

// ─── POST /api/news/:id/comments — Comentar (usuario público) ─────────────
router.post('/:id/comments', [
  body('text').trim().notEmpty().isLength({ max: 500 }).withMessage('Máximo 500 caracteres')
], async (req, res) => {
  try {
    const publicUser = await getPublicUser(req);
    if (!publicUser) {
      return res.status(401).json({ success: false, message: 'Debes iniciar sesión con Google para comentar.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'Noticia no encontrada.' });

    news.comments.push({ publicUser: publicUser._id, text: req.body.text });
    await news.save();

    const updated = await News.findById(req.params.id).populate('comments.publicUser', 'name picture');
    res.status(201).json({ success: true, comments: updated.comments.filter(c => !c.hidden) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al guardar el comentario.' });
  }
});

// ─── PATCH /api/news/:id/comments/:commentId/hide — Ocultar comentario ────
router.patch('/:id/comments/:commentId/hide', protect, async (req, res) => {
  try {
    const canModerate = req.user.role === 'admin' || req.user.role === 'supervisor';
    if (!canModerate) {
      return res.status(403).json({ success: false, message: 'Sin permisos para moderar comentarios.' });
    }

    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'Noticia no encontrada.' });

    const comment = news.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comentario no encontrado.' });

    comment.hidden      = true;
    comment.hiddenBy    = req.user._id;
    comment.hiddenReason = req.body.reason || null;
    comment.hiddenAt    = new Date();
    await news.save();

    res.status(200).json({ success: true, message: 'Comentario ocultado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al ocultar el comentario.' });
  }
});

// ─── PATCH /api/news/:id/comments/:commentId/unhide — Restaurar comentario ─
router.patch('/:id/comments/:commentId/unhide', protect, async (req, res) => {
  try {
    const canModerate = req.user.role === 'admin' || req.user.role === 'supervisor';
    if (!canModerate) {
      return res.status(403).json({ success: false, message: 'Sin permisos para moderar comentarios.' });
    }

    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'Noticia no encontrada.' });

    const comment = news.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comentario no encontrado.' });

    comment.hidden       = false;
    comment.hiddenBy     = null;
    comment.hiddenReason = null;
    comment.hiddenAt     = null;
    await news.save();

    res.status(200).json({ success: true, message: 'Comentario restaurado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al restaurar el comentario.' });
  }
});

module.exports = router;
