const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PublicUser = require('../models/PublicUser');

const router = express.Router();

// POST /api/presence/heartbeat — actualiza lastSeen para staff o usuario público
router.post('/heartbeat', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(204);
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const now = new Date();
    if (decoded.type === 'public') {
      await PublicUser.findByIdAndUpdate(decoded.id, { lastSeen: now });
    } else {
      await User.findByIdAndUpdate(decoded.id, { lastSeen: now });
    }
    res.sendStatus(204);
  } catch {
    res.sendStatus(204); // Falla silenciosamente
  }
});

module.exports = router;
