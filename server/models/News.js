const mongoose = require('mongoose');

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
  }
});

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede superar 200 caracteres']
  },
  summary: {
    type: String,
    required: [true, 'El resumen es requerido'],
    maxlength: [500, 'El resumen no puede superar 500 caracteres']
  },
  content: {
    type: String,
    required: [true, 'El contenido es requerido']
  },
  thumbnail: {
    type: String,
    default: null
  },
  images: [String],
  tags: [String],
  // Referencia al departamento relacionado (opcional)
  relatedDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [commentSchema]
}, {
  timestamps: true
});

// Índice para búsqueda full-text
newsSchema.index({ title: 'text', summary: 'text', content: 'text' });

// Middleware: al publicar, fijar fecha
newsSchema.pre('save', function() {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

module.exports = mongoose.model('News', newsSchema);
