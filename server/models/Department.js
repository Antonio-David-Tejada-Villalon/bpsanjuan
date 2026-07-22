const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del departamento es requerido'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [1000, 'La descripción no puede superar 1000 caracteres']
  },
  thumbnail: {
    type: String,
    default: null
  },
  // Coordenadas para futura integración con mapa
  location: {
    lat: Number,
    lng: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: cuenta de bibliotecas en este departamento
departmentSchema.virtual('libraryCount', {
  ref: 'Library',
  localField: '_id',
  foreignField: 'department',
  count: true,
  match: { isActive: true }
});

module.exports = mongoose.model('Department', departmentSchema);
