const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  path:         { type: String, required: true },
  resourceType: {
    type: String,
    enum: ['biblioteca', 'noticia', 'departamento', 'home', 'nosotros', 'noticias', 'otro'],
    default: 'otro'
  },
  resourceId:   { type: mongoose.Schema.Types.ObjectId, default: null },
  resourceName: { type: String, default: null },
  type:         { type: String, enum: ['view', 'share'], default: 'view' },
  userType:     { type: String, enum: ['staff', 'public', 'anon'], default: 'anon' },
  ip:           { type: String, default: null },
  country:      { type: String, default: null },
  countryCode:  { type: String, default: null },
  city:         { type: String, default: null },
  lat:          { type: Number, default: null },
  lon:          { type: Number, default: null },
}, { timestamps: true });

pageViewSchema.index({ createdAt: 1 });
pageViewSchema.index({ resourceId: 1, createdAt: 1 });
pageViewSchema.index({ countryCode: 1 });
pageViewSchema.index({ type: 1, createdAt: 1 });
pageViewSchema.index({ path: 1, createdAt: 1 });

module.exports = mongoose.model('PageView', pageViewSchema);
