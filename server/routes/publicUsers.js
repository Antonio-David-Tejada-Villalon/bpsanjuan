const express = require('express');
const PublicUser = require('../models/PublicUser');
const Library = require('../models/Library');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);
router.use(restrictTo('admin'));

// GET / — listar usuarios públicos (búsqueda + paginación)
router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const filter = search
      ? { $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]}
      : {};

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      PublicUser.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      PublicUser.countDocuments(filter)
    ]);

    res.json({ success: true, users, total, pages: Math.ceil(total / Number(limit)), page: Number(page) });
  } catch {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios.' });
  }
});

// GET /:id — detalle con bibliotecas que le gustan
router.get('/:id', async (req, res) => {
  try {
    const user = await PublicUser.findById(req.params.id)
      .populate('likedLibraries', 'name thumbnail address');
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });

    const commentAgg = await Library.aggregate([
      { $unwind: { path: '$comments', preserveNullAndEmptyArrays: false } },
      { $match: { 'comments.publicUser': user._id } },
      { $count: 'total' }
    ]);

    res.json({ success: true, user, commentCount: commentAgg[0]?.total || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al obtener el usuario.' });
  }
});

// PATCH /:id — activar/desactivar
router.patch('/:id', async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await PublicUser.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ success: false, message: 'Error al actualizar.' });
  }
});

// DELETE /:id — eliminar y limpiar reacciones
router.delete('/:id', async (req, res) => {
  try {
    const user = await PublicUser.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });

    // Limpiar reacciones del usuario en comentarios
    await Library.updateMany(
      {},
      { $pull: { 'comments.$[].likes': user._id, 'comments.$[].dislikes': user._id } }
    );

    await PublicUser.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Usuario eliminado correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error al eliminar.' });
  }
});

module.exports = router;
