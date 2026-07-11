require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const passport = require('passport');

// Configurar Passport (Google OAuth)
require('./config/passport');

// Importar middlewares y rutas
const { apiLimiter } = require('./middleware/rateLimiter');
const sanitizeInput = require('./middleware/sanitize');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const departmentRoutes = require('./routes/departments');
const libraryRoutes = require('./routes/libraries');
const newsRoutes = require('./routes/news');
const librarySubmissionRoutes = require('./routes/librarySubmissions');
const messageRoutes = require('./routes/messages');
const publicUserRoutes = require('./routes/publicUsers');
const presenceRoutes = require('./routes/presence');
const activityLogRoutes = require('./routes/activityLogs');

const app = express();

// ─── Seguridad: Headers HTTP ──────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ─── CORS ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // Necesario para cookies
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── Body parsers ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInput);

// ─── Logger (solo en desarrollo) ─────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Passport (OAuth) ─────────────────────────────────────────────────────
app.use(passport.initialize());

// ─── Rate limiting global ─────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Rutas de la API ──────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/libraries', libraryRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/library-submissions', librarySubmissionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/public-users', publicUserRoutes);
app.use('/api/presence', presenceRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// ─── Ruta de health check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API de Bibliotecas Populares de San Juan funcionando correctamente.',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ─── Manejo de rutas no encontradas ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// ─── Manejo global de errores ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);

  // Error de Mongoose: ID inválido
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'ID inválido.' });
  }

  // Error de Mongoose: duplicado
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `El valor de "${field}" ya existe.` });
  }

  // Error de Mongoose: validación
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: errors.join('. ') });
  }

  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor.' : err.message
  });
});

// ─── Conexión a MongoDB y arranque del servidor ───────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Conectado a MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📖 Entorno: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

// Manejar errores de conexión de Mongoose después del arranque
mongoose.connection.on('error', (err) => {
  console.error('Error de MongoDB:', err);
});

startServer();
