const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const canAccessLibrary = (req, libraryId) => {
  const isAdmin = req.user.role === 'admin';
  const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canManageLibraries;
  const isAssignedLibrarian = req.user.role === 'bibliotecario' &&
    req.user.assignedLibrary?._id?.toString() === libraryId;
  return isAdmin || isSupervisorWithPerm || isAssignedLibrarian;
};

// ─── GET /:libraryId — Ver el hilo de mensajes de una biblioteca ───────────
router.get('/:libraryId', protect, async (req, res) => {
  try {
    if (!canAccessLibrary(req, req.params.libraryId)) {
      return res.status(403).json({ success: false, message: 'No tenés permisos para ver estos mensajes.' });
    }

    const messages = await Message.find({ library: req.params.libraryId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener los mensajes.' });
  }
});

// ─── POST /:libraryId — Enviar un mensaje ──────────────────────────────────
router.post('/:libraryId', protect, [
  body('text').trim().notEmpty().withMessage('El mensaje no puede estar vacío')
    .isLength({ max: 1000 }).withMessage('Máximo 1000 caracteres')
], async (req, res) => {
  try {
    if (!canAccessLibrary(req, req.params.libraryId)) {
      return res.status(403).json({ success: false, message: 'No tenés permisos para enviar mensajes acá.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const created = await Message.create({
      library: req.params.libraryId,
      sender: req.user._id,
      text: req.body.text
    });
    const message = await created.populate('sender', 'name role');

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al enviar el mensaje.' });
  }
});

module.exports = router;
