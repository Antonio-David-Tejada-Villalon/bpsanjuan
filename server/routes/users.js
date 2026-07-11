const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Library = require('../models/Library');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { createAccountLimiter } = require('../middleware/rateLimiter');
const logActivity = require('../helpers/logActivity');

const router = express.Router();

// Todas las rutas de usuarios requieren estar logueado
router.use(protect);

// ─── GET /api/users — Listar todos los usuarios (admin) ───────────────────
router.get('/', restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .populate('assignedLibrary', 'name department')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios.' });
  }
});

// ─── POST /api/users — Crear cuenta de staff (solo admin) ─────────────────
router.post('/', restrictTo('admin'), createAccountLimiter, [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Debe tener mayúscula, minúscula y número'),
  body('role').isIn(['admin', 'supervisor', 'bibliotecario']).withMessage('Rol inválido')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, assignedLibrary, permissions } = req.body;

    // Verificar que el email no exista
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Ya existe un usuario con ese email.' });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      assignedLibrary: role === 'bibliotecario' ? assignedLibrary : null,
      permissions: role === 'supervisor' ? permissions : undefined,
      createdBy: req.user._id
    });

    newUser.password = undefined;
    logActivity({ userId: req.user._id, userType: 'staff', userName: req.user.name, userEmail: req.user.email, userRole: req.user.role, action: `Creó usuario: ${newUser.name} (${newUser.role})`, resource: newUser.name, resourceId: newUser._id, ip: req.ip });
    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al crear el usuario.' });
  }
});

// ─── GET /api/users/:id — Ver un usuario (admin) ──────────────────────────
router.get('/:id', restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('assignedLibrary', 'name department')
      .populate('createdBy', 'name email');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener el usuario.' });
  }
});

// ─── PATCH /api/users/:id — Editar usuario (admin) ────────────────────────
router.patch('/:id', restrictTo('admin'), [
  body('role').optional().isIn(['admin', 'supervisor', 'bibliotecario']).withMessage('Rol inválido'),
  body('email').optional().isEmail().withMessage('Email inválido').normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const allowedFields = ['name', 'email', 'role', 'assignedLibrary', 'permissions', 'isActive'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Si cambia a bibliotecario, limpiar permissions
    if (updates.role === 'bibliotecario') {
      updates.permissions = { canEditDepartments: false, canManageNews: false, canManageLibraries: false };
    }
    // Si cambia a admin o supervisor, limpiar assignedLibrary
    if (updates.role === 'admin') {
      updates.assignedLibrary = null;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('assignedLibrary', 'name');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    logActivity({ userId: req.user._id, userType: 'staff', userName: req.user.name, userEmail: req.user.email, userRole: req.user.role, action: `Editó usuario: ${user.name}`, resource: user.name, resourceId: user._id, ip: req.ip });
    res.status(200).json({ success: true, user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ese email ya está en uso.' });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar el usuario.' });
  }
});

// ─── PATCH /api/users/:id/reset-password — Admin resetea password de otro ─
router.patch('/:id/reset-password', restrictTo('admin'), [
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Debe tener mayúscula, minúscula y número')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Contraseña restablecida correctamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al restablecer la contraseña.' });
  }
});

// ─── DELETE /api/users/:id — Eliminar definitivamente (admin) ─────────────
router.delete('/:id', restrictTo('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'No podés eliminar tu propia cuenta.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    // Limpiar referencia informativa en bibliotecas asignadas a este usuario
    await Library.updateMany({ assignedUser: user._id }, { assignedUser: null });

    logActivity({ userId: req.user._id, userType: 'staff', userName: req.user.name, userEmail: req.user.email, userRole: req.user.role, action: `Eliminó usuario: ${user.name} (${user.role})`, resource: user.name, ip: req.ip });
    res.status(200).json({ success: true, message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar el usuario.' });
  }
});

module.exports = router;
