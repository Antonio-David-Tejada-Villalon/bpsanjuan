const jwt = require('jsonwebtoken');
const PublicUser = require('../models/PublicUser');
const User = require('../models/User');

// Detecta si la request viene de un staff (admin/supervisor/bibliotecario).
// Tokens de staff no tienen campo `type`; tokens públicos tienen `type: 'public'`.
const isStaffRequest = (req) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt && req.cookies.jwt !== 'loggedout') {
      token = req.cookies.jwt;
    }
    if (!token) return false;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return !decoded.type;
  } catch {
    return false;
  }
};

// Detecta un usuario público por Bearer token (tipo 'public').
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

// Detecta cualquier usuario autenticado (público o staff) y devuelve un objeto unificado.
const getAnyUser = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type === 'public') {
      const pub = await PublicUser.findById(decoded.id);
      if (!pub) return null;
      return { id: pub._id, authorType: 'public', publicUser: pub._id, staffUser: null };
    } else {
      const staff = await User.findById(decoded.id);
      if (!staff || !staff.isActive) return null;
      return { id: staff._id, authorType: 'staff', publicUser: null, staffUser: staff._id };
    }
  } catch {
    return null;
  }
};

module.exports = { isStaffRequest, getPublicUser, getAnyUser };
