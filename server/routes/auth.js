const express = require('express');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PublicUser = require('../models/PublicUser');
const { sendTokenResponse, protect } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ─── Validaciones de login ─────────────────────────────────────────────────
const loginValidations = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

// ─── POST /api/auth/login — Login de staff (email + password) ──────────────
router.post('/login', loginLimiter, loginValidations, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuario (con password porque está excluido por defecto)
    const user = await User.findOne({ email }).select('+password').populate('assignedLibrary', 'name _id');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta está desactivada. Contacta al administrador.'
      });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// ─── POST /api/auth/logout — Logout (invalida cookie) ─────────────────────
router.post('/logout', (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: 'Sesión cerrada correctamente.' });
});

// ─── GET /api/auth/me — Obtener usuario autenticado actual ────────────────
router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      permissions: req.user.permissions,
      assignedLibrary: req.user.assignedLibrary,
      lastLogin: req.user.lastLogin
    }
  });
});

// ─── PATCH /api/auth/change-password — Cambiar contraseña propia ──────────
router.patch('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Ingresa tu contraseña actual'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe tener al menos una mayúscula, una minúscula y un número')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.user._id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta.'
      });
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cambiar la contraseña.' });
  }
});

// ─── PATCH /api/auth/update-profile — Actualizar nombre/email propio ──────
router.patch('/update-profile', protect, [
  body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('email').optional().isEmail().withMessage('Email inválido').normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const allowedFields = ['name', 'email'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).populate('assignedLibrary', 'name _id');

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ese email ya está en uso.' });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar el perfil.' });
  }
});

// ─── GET /api/auth/me-public — Perfil del usuario público (Google) actual ─
router.get('/me-public', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ success: false, message: 'No autorizado.' });
    }

    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.type !== 'public') {
      return res.status(401).json({ success: false, message: 'No autorizado.' });
    }

    const publicUser = await PublicUser.findById(decoded.id);
    if (!publicUser) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    res.status(200).json({
      success: true,
      publicUser: {
        _id: publicUser._id,
        name: publicUser.name,
        email: publicUser.email,
        picture: publicUser.picture
      }
    });
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
});

// ─── Google OAuth — Solo para usuarios PÚBLICOS (likes/comentarios) ────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=google` }),
  (req, res) => {
    // Generar JWT para el usuario público
    const token = jwt.sign(
      { id: req.user._id, type: 'public' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    // Redirigir al frontend con el token en query param (se guarda en localStorage)
    res.redirect(`${process.env.CLIENT_URL}/auth/google-callback?token=${token}`);
  }
);

module.exports = router;
