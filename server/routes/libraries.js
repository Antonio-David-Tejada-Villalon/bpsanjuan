const express = require('express');
const { body, validationResult } = require('express-validator');
const Library = require('../models/Library');
const EditHistory = require('../models/EditHistory');
const User = require('../models/User');
const LibrarySubmission = require('../models/LibrarySubmission');
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');
const { getPublicUser, getAnyUser } = require('../middleware/publicAuth');

const router = express.Router();

// Validaciones compartidas: solo permitir URLs http/https (evita links "javascript:")
const urlValidators = [
  body('address.mapsUrl').optional({ checkFalsy: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('El link de Google Maps debe ser una URL válida'),
  body('contact.website').optional({ checkFalsy: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('El link de DigiBepe debe ser una URL válida (ej: http://XXXX.bepe.ar/)'),
  body('digibepe').optional({ checkFalsy: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('El sitio web debe ser una URL válida (ej: https://...)'),
  body('socialMedia.facebook').optional({ checkFalsy: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('El link de Facebook debe ser una URL válida (https://facebook.com/...)'),
  body('socialMedia.instagram').optional({ checkFalsy: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('El link de Instagram debe ser una URL válida (https://instagram.com/...)'),
  body('socialMedia.youtube').optional({ checkFalsy: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('El link de YouTube debe ser una URL válida (https://youtube.com/...)')
];

// Helper: toggle like/dislike en un subdoc (comment o reply)
const toggleReaction = (subdoc, userId, type) => {
  const uid = userId.toString();
  const likedIdx    = subdoc.likes.findIndex(id => id.toString() === uid);
  const dislikedIdx = subdoc.dislikes.findIndex(id => id.toString() === uid);
  if (type === 'like') {
    if (likedIdx >= 0) { subdoc.likes.splice(likedIdx, 1); }
    else { subdoc.likes.push(userId); if (dislikedIdx >= 0) subdoc.dislikes.splice(dislikedIdx, 1); }
  } else {
    if (dislikedIdx >= 0) { subdoc.dislikes.splice(dislikedIdx, 1); }
    else { subdoc.dislikes.push(userId); if (likedIdx >= 0) subdoc.likes.splice(likedIdx, 1); }
  }
};

// ─── GET /api/libraries — Listar todas las bibliotecas (público) ──────────
router.get('/', async (req, res) => {
  try {
    const { department, search, page = 1, limit = 12 } = req.query;
    const filter = { isActive: true };

    if (department) filter.department = department;
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [libraries, total] = await Promise.all([
      Library.find(filter)
        .populate('department', 'name slug')
        .select('-comments -assignedUser')
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Library.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: libraries.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      libraries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener bibliotecas.' });
  }
});

// ─── GET /api/libraries/count — Total de bibliotecas activas (público) ──────
router.get('/count', async (req, res) => {
  try {
    const total = await Library.countDocuments({ isActive: true });
    res.json({ success: true, total });
  } catch {
    res.status(500).json({ success: false, message: 'Error al contar bibliotecas.' });
  }
});

// ─── GET /api/libraries/suggest?q=text — Autocomplete (público) ──────────
router.get('/suggest', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 1) return res.json({ success: true, libraries: [] });
    const libraries = await Library.find({
      name: { $regex: q, $options: 'i' },
      isActive: true
    })
      .populate('department', 'name slug')
      .select('name department address')
      .limit(6);
    res.json({ success: true, libraries });
  } catch {
    res.status(500).json({ success: false, libraries: [] });
  }
});

// ─── GET /api/libraries/:id — Ver una biblioteca (público) ────────────────
router.get('/:id', async (req, res) => {
  try {
    const library = await Library.findById(req.params.id)
      .populate('department', 'name slug')
      .populate('comments.publicUser', 'name picture')
      .populate('comments.staffUser', 'name role')
      .populate('comments.replies.publicUser', 'name picture')
      .populate('comments.replies.staffUser', 'name role');

    if (!library || !library.isActive) {
      return res.status(404).json({ success: false, message: 'Biblioteca no encontrada.' });
    }

    const libraryResponse = library.toObject();
    libraryResponse.comments = libraryResponse.comments
      .filter(c => !c.hidden)
      .map(c => ({ ...c, replies: (c.replies || []).filter(r => !r.hidden) }));

    res.status(200).json({ success: true, library: libraryResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener la biblioteca.' });
  }
});

// ─── POST /api/libraries — Crear biblioteca (admin o supervisor con permiso) ─
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('department').notEmpty().withMessage('El departamento es requerido'),
  ...urlValidators
], async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canManageLibraries;

    if (!isAdmin && !isSupervisorWithPerm) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para crear bibliotecas.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const library = await Library.create(req.body);
    res.status(201).json({ success: true, library });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear la biblioteca.' });
  }
});

// Etiquetas legibles para el historial de ediciones
const FIELD_LABELS = {
  name: 'Nombre', department: 'Departamento', address: 'Dirección',
  contact: 'Contacto', socialMedia: 'Redes sociales', schedule: 'Horarios',
  description: 'Descripción', services: 'Servicios', images: 'Imágenes',
  thumbnail: 'Imagen de portada', assignedUser: 'Bibliotecario asignado',
  conabipRegistered: 'Registro CONABIP', conabipNumber: 'N° CONABIP',
  foundedYear: 'Año de fundación', foundedMonth: 'Mes de fundación',
  foundedDay: 'Día de fundación', isActive: 'Estado activo', digibepe: 'Sitio web',
};

// ─── PATCH /api/libraries/:id — Editar biblioteca (admin, o supervisor con permiso)
// El bibliotecario ya NO edita acá directo: sus cambios pasan por
// POST /api/library-submissions y requieren aprobación (ver ese router).
router.patch('/:id', protect, urlValidators, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const isAdmin = req.user.role === 'admin';
    const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canManageLibraries;

    if (!isAdmin && !isSupervisorWithPerm) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para editar esta biblioteca.' });
    }

    const allowedFields = [
      'name', 'department', 'address', 'contact', 'socialMedia', 'schedule',
      'description', 'services', 'images', 'thumbnail',
      'assignedUser', 'conabipRegistered', 'conabipNumber', 'foundedYear', 'foundedMonth', 'foundedDay', 'isActive', 'digibepe'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Capturar estado original para el diff
    const original = await Library.findById(req.params.id).lean();
    if (!original) {
      return res.status(404).json({ success: false, message: 'Biblioteca no encontrada.' });
    }

    const updated = await Library.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true
    }).populate('department', 'name slug');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Biblioteca no encontrada.' });
    }

    // Guardar historial si hubo cambios reales
    try {
      const changes = [];
      for (const field of Object.keys(updates)) {
        if (JSON.stringify(original[field]) !== JSON.stringify(updates[field])) {
          changes.push({ field: FIELD_LABELS[field] || field, from: original[field], to: updates[field] });
        }
      }
      if (changes.length > 0) {
        await EditHistory.create({ libraryId: req.params.id, editedBy: req.user._id, changes });
      }
    } catch { /* historial no crítico */ }

    res.status(200).json({ success: true, library: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar la biblioteca.' });
  }
});

// ─── GET /api/libraries/:id/history — Historial de ediciones (admin/supervisor) ─
router.get('/:id/history', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canManageLibraries;

    if (!isAdmin && !isSupervisorWithPerm) {
      return res.status(403).json({ success: false, message: 'No tenés permisos para ver el historial.' });
    }

    const history = await EditHistory.find({ libraryId: req.params.id })
      .populate('editedBy', 'name role')
      .sort({ editedAt: -1 })
      .limit(50);

    res.json({ success: true, history });
  } catch {
    res.status(500).json({ success: false, message: 'Error al obtener el historial.' });
  }
});

// ─── DELETE /api/libraries/:id — Eliminar definitivamente (admin, o supervisor con permiso)
router.delete('/:id', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canManageLibraries;

    if (!isAdmin && !isSupervisorWithPerm) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para eliminar esta biblioteca.' });
    }

    const library = await Library.findByIdAndDelete(req.params.id);
    if (!library) {
      return res.status(404).json({ success: false, message: 'Biblioteca no encontrada.' });
    }

    // Limpiar referencias huérfanas: bibliotecario asignado y ediciones/mensajes ligados
    await Promise.all([
      User.updateMany({ assignedLibrary: library._id }, { assignedLibrary: null }),
      LibrarySubmission.deleteMany({ library: library._id }),
      Message.deleteMany({ library: library._id })
    ]);

    res.status(200).json({ success: true, message: 'Biblioteca eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar la biblioteca.' });
  }
});

// ─── POST /api/libraries/:id/like — Like de usuario público ───────────────
router.post('/:id/like', async (req, res) => {
  try {
    const publicUser = await getPublicUser(req);
    if (!publicUser) {
      return res.status(401).json({ success: false, message: 'Debes iniciar sesión con Google para dar likes.' });
    }

    const library = await Library.findById(req.params.id);
    if (!library) {
      return res.status(404).json({ success: false, message: 'Biblioteca no encontrada.' });
    }

    const alreadyLiked = publicUser.likedLibraries.includes(library._id);

    if (alreadyLiked) {
      // Quitar like
      publicUser.likedLibraries.pull(library._id);
      library.likes = Math.max(0, library.likes - 1);
    } else {
      // Dar like
      publicUser.likedLibraries.push(library._id);
      library.likes += 1;
    }

    await Promise.all([publicUser.save(), library.save()]);

    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likes: library.likes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al procesar el like.' });
  }
});

// Helper: populate completo de comments
const populateComments = (query) =>
  query
    .populate('comments.publicUser', 'name picture')
    .populate('comments.staffUser', 'name role')
    .populate('comments.replies.publicUser', 'name picture')
    .populate('comments.replies.staffUser', 'name role');

// ─── POST /api/libraries/:id/comments — Comentar (público o staff) ─────────
router.post('/:id/comments', [
  body('text').trim().notEmpty().withMessage('El comentario no puede estar vacío')
    .isLength({ max: 500 }).withMessage('Máximo 500 caracteres')
], async (req, res) => {
  try {
    const auth = await getAnyUser(req);
    if (!auth) {
      return res.status(401).json({ success: false, message: 'Debes iniciar sesión para comentar.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const library = await Library.findById(req.params.id);
    if (!library) {
      return res.status(404).json({ success: false, message: 'Biblioteca no encontrada.' });
    }

    library.comments.push({
      publicUser: auth.publicUser,
      staffUser: auth.staffUser,
      authorType: auth.authorType,
      text: req.body.text
    });
    await library.save();

    const updated = await populateComments(Library.findById(req.params.id));
    const comments = updated.comments
      .filter(c => !c.hidden)
      .map(c => ({ ...c.toObject(), replies: (c.replies || []).filter(r => !r.hidden) }));

    res.status(201).json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al guardar el comentario.' });
  }
});

// ─── POST /api/libraries/:id/comments/:commentId/replies — Responder ────────
router.post('/:id/comments/:commentId/replies', [
  body('text').trim().notEmpty().withMessage('La respuesta no puede estar vacía')
    .isLength({ max: 500 }).withMessage('Máximo 500 caracteres')
], async (req, res) => {
  try {
    const auth = await getAnyUser(req);
    if (!auth) {
      return res.status(401).json({ success: false, message: 'Debes iniciar sesión para responder.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const library = await Library.findById(req.params.id);
    if (!library) return res.status(404).json({ success: false, message: 'Biblioteca no encontrada.' });

    const comment = library.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comentario no encontrado.' });

    comment.replies.push({
      publicUser: auth.publicUser,
      staffUser: auth.staffUser,
      authorType: auth.authorType,
      text: req.body.text
    });
    await library.save();

    const updated = await populateComments(Library.findById(req.params.id));
    const comments = updated.comments
      .filter(c => !c.hidden)
      .map(c => ({ ...c.toObject(), replies: (c.replies || []).filter(r => !r.hidden) }));

    res.status(201).json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al guardar la respuesta.' });
  }
});

// ─── POST /api/libraries/:id/comments/:commentId/react — Like/dislike ───────
router.post('/:id/comments/:commentId/react', async (req, res) => {
  try {
    const { type } = req.body;
    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Tipo de reacción inválido.' });
    }
    const auth = await getAnyUser(req);
    if (!auth) return res.status(401).json({ success: false, message: 'Inicia sesión para reaccionar.' });

    const library = await Library.findById(req.params.id);
    if (!library) return res.status(404).json({ success: false, message: 'Biblioteca no encontrada.' });

    const comment = library.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comentario no encontrado.' });

    toggleReaction(comment, auth.id, type);
    await library.save();

    res.json({ success: true, likes: comment.likes.length, dislikes: comment.dislikes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al procesar la reacción.' });
  }
});

// ─── POST /api/libraries/:id/comments/:commentId/replies/:replyId/react ─────
router.post('/:id/comments/:commentId/replies/:replyId/react', async (req, res) => {
  try {
    const { type } = req.body;
    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Tipo de reacción inválido.' });
    }
    const auth = await getAnyUser(req);
    if (!auth) return res.status(401).json({ success: false, message: 'Inicia sesión para reaccionar.' });

    const library = await Library.findById(req.params.id);
    if (!library) return res.status(404).json({ success: false, message: 'Biblioteca no encontrada.' });

    const comment = library.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comentario no encontrado.' });

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ success: false, message: 'Respuesta no encontrada.' });

    toggleReaction(reply, auth.id, type);
    await library.save();

    res.json({ success: true, likes: reply.likes.length, dislikes: reply.dislikes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al procesar la reacción.' });
  }
});

// Helper: admin, supervisor con canManageLibraries, o el bibliotecario asignado
const canModerateLibrary = (req, library) => {
  const isAdmin = req.user.role === 'admin';
  const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canManageLibraries;
  const isAssignedLibrarian = req.user.role === 'bibliotecario' &&
    req.user.assignedLibrary?._id?.toString() === library._id.toString();
  return isAdmin || isSupervisorWithPerm || isAssignedLibrarian;
};

// ─── GET /api/libraries/:id/comments — Ver TODOS los comentarios (staff) ───
router.get('/:id/comments', protect, async (req, res) => {
  try {
    const library = await Library.findById(req.params.id)
      .populate('comments.publicUser', 'name picture')
      .populate('comments.staffUser', 'name role')
      .populate('comments.hiddenBy', 'name')
      .populate('comments.replies.publicUser', 'name picture')
      .populate('comments.replies.staffUser', 'name role');

    if (!library) {
      return res.status(404).json({ success: false, message: 'Biblioteca no encontrada.' });
    }

    if (!canModerateLibrary(req, library)) {
      return res.status(403).json({ success: false, message: 'No tenés permisos para ver estos comentarios.' });
    }

    res.status(200).json({ success: true, comments: library.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener los comentarios.' });
  }
});

// ─── PATCH /api/libraries/:id/comments/:commentId/hide — Ocultar comentario ─
// El motivo es obligatorio si lo hace el bibliotecario (queda auditable por
// supervisor/admin); opcional si lo hace supervisor/admin directamente.
router.patch('/:id/comments/:commentId/hide', protect, [
  body('reason').trim().custom((value, { req }) => {
    if (req.user.role === 'bibliotecario' && !value) {
      throw new Error('El motivo es obligatorio.');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const library = await Library.findById(req.params.id);
    if (!library) {
      return res.status(404).json({ success: false, message: 'Biblioteca no encontrada.' });
    }

    if (!canModerateLibrary(req, library)) {
      return res.status(403).json({ success: false, message: 'No tenés permisos para moderar estos comentarios.' });
    }

    const comment = library.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado.' });
    }

    comment.hidden = true;
    comment.hiddenBy = req.user._id;
    comment.hiddenReason = req.body.reason || null;
    comment.hiddenAt = new Date();
    await library.save();

    res.status(200).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al ocultar el comentario.' });
  }
});

// ─── PATCH /api/libraries/:id/comments/:commentId/restore — Restaurar ──────
// Solo admin/supervisor: el bibliotecario no puede deshacer su propia ocultación.
router.patch('/:id/comments/:commentId/restore', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canManageLibraries;

    if (!isAdmin && !isSupervisorWithPerm) {
      return res.status(403).json({ success: false, message: 'No tenés permisos para restaurar comentarios.' });
    }

    const library = await Library.findById(req.params.id);
    if (!library) {
      return res.status(404).json({ success: false, message: 'Biblioteca no encontrada.' });
    }

    const comment = library.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado.' });
    }

    comment.hidden = false;
    comment.hiddenBy = null;
    comment.hiddenReason = null;
    comment.hiddenAt = null;
    await library.save();

    res.status(200).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al restaurar el comentario.' });
  }
});

// ─── DELETE /api/libraries/:id/comments/:commentId — Eliminar definitivamente
// Solo admin/supervisor: confirma en forma permanente lo que ocultó el bibliotecario.
router.delete('/:id/comments/:commentId', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isSupervisorWithPerm = req.user.role === 'supervisor' && req.user.permissions?.canManageLibraries;

    if (!isAdmin && !isSupervisorWithPerm) {
      return res.status(403).json({ success: false, message: 'No tenés permisos para eliminar comentarios.' });
    }

    const library = await Library.findById(req.params.id);
    if (!library) {
      return res.status(404).json({ success: false, message: 'Biblioteca no encontrada.' });
    }

    if (!library.comments.id(req.params.commentId)) {
      return res.status(404).json({ success: false, message: 'Comentario no encontrado.' });
    }

    library.comments.pull(req.params.commentId);
    await library.save();

    res.status(200).json({ success: true, message: 'Comentario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar el comentario.' });
  }
});

module.exports = router;
