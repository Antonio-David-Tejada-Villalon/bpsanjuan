const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const { protect } = require('../middleware/auth');

// 5 suscripciones por IP cada 15 min para frenar bots
const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Demasiados intentos. Esperá 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/newsletter/subscribe — público
router.post('/subscribe', subscribeLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'El email es obligatorio.' });
  }
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 254) {
    return res.status(400).json({ success: false, message: 'Email inválido.' });
  }
  try {
    await Subscriber.create({ email: normalized });
    res.json({ success: true, message: '¡Suscripción exitosa! Te avisaremos sobre las novedades de las bibliotecas.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.json({ success: true, message: 'Ya estás suscripto/a a nuestras novedades.' });
    }
    res.status(500).json({ success: false, message: 'Error al procesar la suscripción.' });
  }
});

// GET /api/newsletter/subscribers — admin/supervisor
router.get('/subscribers', protect, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
    return res.status(403).json({ success: false, message: 'No autorizado.' });
  }
  const subscribers = await Subscriber.find().sort({ subscribedAt: -1 }).lean();
  res.json({ success: true, count: subscribers.length, subscribers });
});

module.exports = router;
