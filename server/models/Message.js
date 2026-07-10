const mongoose = require('mongoose');

// Hilo de conversación simple entre el bibliotecario asignado y supervisor/admin,
// alcanzado por biblioteca (sin read-receipts ni paginación, volumen bajo esperado)
const messageSchema = new mongoose.Schema({
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Library',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'El mensaje no puede estar vacío'],
    trim: true,
    maxlength: [1000, 'El mensaje no puede superar 1000 caracteres']
  }
}, {
  timestamps: true
});

messageSchema.index({ library: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
