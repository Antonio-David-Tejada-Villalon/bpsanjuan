const mongoose = require('mongoose');

// Usuario público que se autentica con Google para dejar likes/comentarios
const publicUserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    default: null
  },
  // IDs de bibliotecas que le dio like
  likedLibraries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Library'
  }],
  // IDs de noticias que le dio like
  likedNews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PublicUser', publicUserSchema);
