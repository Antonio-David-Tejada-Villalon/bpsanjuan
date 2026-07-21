const mongoose = require('mongoose');

const changeSchema = new mongoose.Schema({
  field: String,
  from:  mongoose.Schema.Types.Mixed,
  to:    mongoose.Schema.Types.Mixed,
}, { _id: false });

const editHistorySchema = new mongoose.Schema({
  libraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Library', required: true, index: true },
  editedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  editedAt:  { type: Date, default: Date.now },
  changes:   [changeSchema],
}, { timestamps: false });

module.exports = mongoose.model('EditHistory', editHistorySchema);
