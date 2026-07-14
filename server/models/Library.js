const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  day: String,
  open: String,
  close: String
}, { _id: false });

const OId = mongoose.Schema.Types.ObjectId;

const replySchema = new mongoose.Schema({
  publicUser: { type: OId, ref: 'PublicUser', default: null },
  staffUser:  { type: OId, ref: 'User',       default: null },
  authorType: { type: String, enum: ['public', 'staff'], default: 'public' },
  text:       { type: String, required: true, maxlength: [500, 'Máximo 500 caracteres'] },
  createdAt:  { type: Date, default: Date.now },
  likes:    [{ type: OId }],
  dislikes: [{ type: OId }],
  hidden:      { type: Boolean, default: false },
  hiddenBy:    { type: OId, ref: 'User', default: null },
  hiddenReason:{ type: String, default: null },
  hiddenAt:    { type: Date, default: null }
}, { _id: true });

const commentSchema = new mongoose.Schema({
  publicUser: { type: OId, ref: 'PublicUser', default: null },
  staffUser:  { type: OId, ref: 'User',       default: null },
  authorType: { type: String, enum: ['public', 'staff'], default: 'public' },
  text:       { type: String, required: true, maxlength: [500, 'Máximo 500 caracteres'] },
  createdAt:  { type: Date, default: Date.now },
  likes:    [{ type: OId }],
  dislikes: [{ type: OId }],
  replies:  [replySchema],
  hidden:      { type: Boolean, default: false },
  hiddenBy:    { type: OId, ref: 'User', default: null },
  hiddenReason:{ type: String, default: null },
  hiddenAt:    { type: Date, default: null }
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
  foundedMonth: { type: Number, min: 1, max: 12, default: null },
  foundedDay:   { type: Number, min: 1, max: 31, default: null },
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
