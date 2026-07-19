const rateLimit = require('express-rate-limit');

// Límite general para todas las rutas de la API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP. Intenta nuevamente en 15 minutos.'
  }
});

// Límite estricto para intentos de login (anti-brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos de login por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Espera 15 minutos e inténtalo de nuevo.'
  },
  skipSuccessfulRequests: true // no cuenta los logins exitosos
});

// Límite para creación de cuentas (admin)
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20,
  message: {
    success: false,
    message: 'Demasiadas cuentas creadas desde esta IP. Intenta nuevamente en 1 hora.'
  }
});

// Límite estricto para el endpoint público de tracking de analytics
const trackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas peticiones.' }
});

module.exports = { apiLimiter, loginLimiter, createAccountLimiter, trackLimiter };
