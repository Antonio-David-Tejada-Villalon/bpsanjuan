const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  day: String,
  open: String,
  close: String
}, { _id: false });

const librarySubmissionSchema = new mongoose.Schema({
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Library',
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Snapshot completo de los campos editables propuestos (no es un diff parcial)
  changes: {
    name: String,
    foundedYear: Number,
    address: {
      street: String,
      locality: String,
      zipCode: String
    },
    contact: {
      phone: String,
      email: String,
      website: String
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      youtube: String
    },
    schedule: [scheduleSchema],
    description: String,
    services: [String],
    images: [String],
    thumbnail: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Garantiza un solo submission pendiente por biblioteca a nivel de base
// (evita condición de carrera ante doble-submit, no solo lógica de ruta)
librarySubmissionSchema.index(
  { library: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

module.exports = mongoose.model('LibrarySubmission', librarySubmissionSchema);
