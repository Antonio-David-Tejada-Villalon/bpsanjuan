const express = require('express');
const { body, validationResult } = require('express-validator');
const News = require('../models/News');
const jwt = require('jsonwebtoken');
const PublicUser = require('../models/PublicUser');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Helper: detectar usuario público
const getPublicUser = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'public') return null;
    return await PublicUser.findById(decoded.id);
  } catch {
    return null;
  }
};

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

// ─── GET /api/news/:id — Ver noticia completa (público) ───────────────────
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findOne({ _id: req.params.id, isPublished: true })
      .populate('author', 'name')
      .populate('relatedDepartment', 'name slug')
      .populate('comments.publicUser', 'name picture');

    if (!news) {
      return res.status(404).json({ success: false, message: 'Noticia no encontrada.' });
    }

    res.status(200).json({ success: true, news });
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
    res.status(201).json({ success: true, comments: updated.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al guardar el comentario.' });
  }
});

module.exports = router;
