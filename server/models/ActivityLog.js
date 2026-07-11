const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  userType:  { type: String, enum: ['staff', 'public'], default: 'staff' },
  userName:  { type: String, required: true },
  userEmail: { type: String, default: null },
  userRole:  { type: String, default: null }, // admin | supervisor | bibliotecario | null (público)
  action:    { type: String, required: true }, // "Inició sesión", "Creó biblioteca", etc.
  resource:  { type: String, default: null },  // nombre del recurso afectado
  resourceId:{ type: mongoose.Schema.Types.ObjectId, default: null },
  ip:        { type: String, default: null },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
  }
}, { timestamps: true });

// MongoDB elimina el documento automáticamente cuando expiresAt es alcanzado
activityLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ userId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
