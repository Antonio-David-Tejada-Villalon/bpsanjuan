const express = require('express');
const User = require('../models/User');
const News = require('../models/News');

const router = express.Router();

// GET /api/equipo/:id — Perfil público de un miembro del equipo editorial
router.get('/:id', async (req, res) => {
  try {
    const member = await User.findById(req.params.id).select('name role isActive');
    if (!member || !member.isActive) {
      return res.status(404).json({ success: false, message: 'Perfil no encontrado.' });
    }
    const articles = await News.find({ author: member._id, isPublished: true })
      .select('title summary publishedAt thumbnail tags')
      .sort({ publishedAt: -1 })
      .limit(12);
    res.json({ success: true, member: { _id: member._id, name: member.name, role: member.role }, articles });
  } catch {
    res.status(500).json({ success: false, message: 'Error del servidor.' });
  }
});

module.exports = router;
