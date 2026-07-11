const ActivityLog = require('../models/ActivityLog');

/**
 * Registra una acción en el historial de actividad.
 * Falla silenciosamente para nunca interrumpir el flujo principal.
 */
const logActivity = async ({ userId, userType = 'staff', userName, userEmail, userRole, action, resource, resourceId, ip }) => {
  try {
    await ActivityLog.create({ userId, userType, userName, userEmail: userEmail || null, userRole: userRole || null, action, resource: resource || null, resourceId: resourceId || null, ip: ip || null });
  } catch (err) {
    console.error('[logActivity]', err.message);
  }
};

module.exports = logActivity;
