const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  day: String,
  open: String,
  close: String
}, { _id: false });

const commentSchema = new mongoose.Schema({
  publicUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PublicUser',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: [500, 'El comentario no puede superar 500 caracteres']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Moderación: el bibliotecario asignado puede ocultar directo, pero queda
  // auditable por supervisor/admin (pueden restaurar o confirmar el borrado)
  hidden: {
    type: Boolean,
    default: false
  },
  hiddenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  hiddenReason: {
    type: String,
    default: null
  },
  hiddenAt: {
    type: Date,
    default: null
  }
}, { _id: true });

const librarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la biblioteca es requerido'],
    trim: true
  },
  // Referencia al departamento al que pertenece
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  address: {
    street: String,
    locality: String,
    zipCode: String,
    mapsUrl: String
  },
  contact: {
    phone: String,
    whatsapp: String,
    email: String,
    website: String
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    youtube: String
  },
  schedule: [scheduleSchema],
  description: {
    type: String,
    maxlength: [2000, 'La descripción no puede superar 2000 caracteres']
  },
  services: [String],         // ["Préstamo de libros", "Talleres", ...]
  images: [String],            // URLs de imágenes
  thumbnail: {
    type: String,
    default: null
  },
  digibepe: {
    type: String,
    default: null
  },
  conabipRegistered: {
    type: Boolean,
    default: false
  },
  foundedYear: Number,
  likes: {
    type: Number,
    default: 0
  },
  comments: [commentSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  // Bibliotecario asignado que puede editar esta ficha
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Índice para búsqueda
librarySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Library', librarySchema);
