const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Middleware para rutas protegidas de staff (JWT) ─────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // Buscar token en Authorization header o cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Inicia sesión para acceder.'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario en la BD
    const currentUser = await User.findById(decoded.id).populate('assignedLibrary', 'name');
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'El usuario de este token ya no existe.'
      });
    }

    if (!currentUser.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta está desactivada. Contacta al administrador.'
      });
    }

    // Verificar si la contraseña cambió después de emitir el token
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña cambiada recientemente. Inicia sesión nuevamente.'
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token inválido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado. Inicia sesión nuevamente.' });
    }
    res.status(500).json({ success: false, message: 'Error de autenticación.' });
  }
};

// ─── Middleware de autorización por roles ─────────────────────────────────────
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción.'
      });
    }
    next();
  };
};

// ─── Middleware: solo admin o el propio usuario puede acceder ─────────────────
const restrictToSelf = (req, res, next) => {
  const isAdmin = req.user.role === 'admin';
  const isSelf = req.user._id.toString() === req.params.id;
  if (!isAdmin && !isSelf) {
    return res.status(403).json({
      success: false,
      message: 'Solo puedes modificar tu propia cuenta.'
    });
  }
  next();
};

// ─── Helper: generar JWT ──────────────────────────────────────────────────────
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ─── Helper: enviar respuesta con token ──────────────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd
  };

  res.cookie('jwt', token, cookieOptions);

  // No devolver el password en la respuesta
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      assignedLibrary: user.assignedLibrary
    }
  });
};

module.exports = { protect, restrictTo, restrictToSelf, signToken, sendTokenResponse };
