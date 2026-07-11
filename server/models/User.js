const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede superar 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false // No se devuelve en queries por defecto
  },
  role: {
    type: String,
    enum: ['admin', 'supervisor', 'bibliotecario'],
    default: 'bibliotecario'
  },
  // Solo para bibliotecarios: referencia a su biblioteca asignada
  assignedLibrary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Library',
    default: null
  },
  // Privilegios extra para supervisores (otorgados por admin)
  permissions: {
    canEditDepartments: { type: Boolean, default: false },
    canManageNews: { type: Boolean, default: false },
    canManageLibraries: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  lastSeen: {
    type: Date,
    default: null
  },
  passwordChangedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash de contraseña antes de guardar
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar si el token es válido tras cambio de password
userSchema.methods.changedPasswordAfter = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedAt;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
