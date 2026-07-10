const express = require('express');
const { body, validationResult } = require('express-validator');
const LibrarySubmission = require('../models/LibrarySubmission');
const Library = require('../models/Library');
const Message = require('../models/Message');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Campos que un bibliotecario puede proponer (misma lista que los editables en
// PATCH /api/libraries/:id para admin/supervisor, menos los admin-only:
// department, assignedUser, conabipRegistered, isActive)
const allowedChangeFields = [
  'name', 'foundedYear', 'address', 'contact', 'socialMedia',
  'schedule', 'description', 'services', 'images', 'thumbnail'
];

const submissionValidators = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('foundedYear').optional({ checkFalsy: true })
    .isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Año de fundación inválido'),
  body('description').optional({ checkFalsy: true })
    .isLength({ max: 2000 }).withMessage('La descripción no puede superar 2000 caracteres'),
  body('contact.website').optional({ checkFalsy: true })
    .isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('El sitio web debe ser una URL http/https válida'),
  body('socialMedia.facebook').optional({ checkFalsy: true })
    .isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('El link de Facebook debe ser una URL http/https válida'),
  body('socialMedia.instagram').optional({ checkFalsy: true })
    .isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('El link de Instagram debe ser una URL http/https válida'),
  body('socialMedia.youtube').optional({ checkFalsy: true })
    .isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('El link de YouTube debe ser una URL http/https válida')
];

// ─── POST / — Crear o actualizar la edición pendiente del bibliotecario ────
router.post('/', protect, restrictTo('bibliotecario'), submissionValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.user.assignedLibrary) {
      return res.status(400).json({ success: false, message: 'No tenés una biblioteca asignada.' });
    }

    const libraryId = req.user.assignedLibrary._id;

    const changes = {};
    allowedChangeFields.forEach(field => {
      if (req.body[field] !== undefined) changes[field] = req.body[field];
    });

    let submission = await LibrarySubmission.findOne({ library: libraryId, status: 'pending' });
    if (submission) {
      submission.changes = changes;
      await submission.save();
    } else {
      submission = await LibrarySubmission.create({
        library: libraryId,
        submittedBy: req.user._id,
        changes
      });
    }

    res.status(201).json({ success: true, submission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al enviar la edición.' });
  }
});

// ─── GET /mine — Última edición (cualquier estado) del bibliotecario ───────
router.get('/mine', protect, restrictTo('bibliotecario'), async (req, res) => {
  try {
    if (!req.user.assignedLibrary) {
      return res.status(200).json({ success: true, submission: null });
    }

    const submission = await LibrarySubmission.findOne({ library: req.user.assignedLibrary._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener tu edición.' });
  }
});

// ─── GET / — Listar ediciones (admin, o supervisor con canManageLibraries) ─
router.get('/', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canManageLibraries;

    if (!isAdmin && !isSupervisorWithPerm) {
      return res.status(403).json({ success: false, message: 'No tenés permisos para ver las ediciones pendientes.' });
    }

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const submissions = await LibrarySubmission.find(filter)
      .populate('library', 'name')
      .populate('submittedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener las ediciones.' });
  }
});

// ─── GET /:id — Ver el detalle de una edición ──────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const submission = await LibrarySubmission.findById(req.params.id)
      .populate('library')
      .populate('submittedBy', 'name')
      .populate('reviewedBy', 'name');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Edición no encontrada.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canManageLibraries;
    const isOwner = req.user.role === 'bibliotecario' &&
      req.user.assignedLibrary?._id?.toString() === submission.library._id.toString();

    if (!isAdmin && !isSupervisorWithPerm && !isOwner) {
      return res.status(403).json({ success: false, message: 'No tenés permisos para ver esta edición.' });
    }

    res.status(200).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la edición.' });
  }
});

// ─── PATCH /:id/approve — Aprobar y publicar los cambios ───────────────────
router.patch('/:id/approve', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canManageLibraries;

    if (!isAdmin && !isSupervisorWithPerm) {
      return res.status(403).json({ success: false, message: 'No tenés permisos para aprobar ediciones.' });
    }

    const submission = await LibrarySubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Edición no encontrada.' });
    }
    if (submission.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Esta edición ya fue revisada.' });
    }

    await Library.findByIdAndUpdate(submission.library, submission.changes.toObject(), {
      new: true,
      runValidators: true
    });

    submission.status = 'approved';
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    await submission.save();

    res.status(200).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al aprobar la edición.' });
  }
});

// ─── PATCH /:id/reject — Rechazar con motivo ────────────────────────────────
router.patch('/:id/reject', protect, [
  body('reason').trim().notEmpty().withMessage('El motivo del rechazo es requerido')
], async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canManageLibraries;

    if (!isAdmin && !isSupervisorWithPerm) {
      return res.status(403).json({ success: false, message: 'No tenés permisos para rechazar ediciones.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const submission = await LibrarySubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Edición no encontrada.' });
    }
    if (submission.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Esta edición ya fue revisada.' });
    }

    submission.status = 'rejected';
    submission.rejectionReason = req.body.reason;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    await submission.save();

    await Message.create({
      library: submission.library,
      sender: req.user._id,
      text: `Cambios rechazados: ${req.body.reason}`
    });

    res.status(200).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al rechazar la edición.' });
  }
});

// ─── DELETE /:id — Descartar una edición sin aprobarla ni rechazarla ───────
router.delete('/:id', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canManageLibraries;

    if (!isAdmin && !isSupervisorWithPerm) {
      return res.status(403).json({ success: false, message: 'No tenés permisos para eliminar ediciones.' });
    }

    const submission = await LibrarySubmission.findByIdAndDelete(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Edición no encontrada.' });
    }

    res.status(200).json({ success: true, message: 'Edición eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar la edición.' });
  }
});

module.exports = router;
