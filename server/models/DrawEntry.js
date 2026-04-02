const mongoose = require('mongoose');

const drawEntrySchema = new mongoose.Schema({
  drawId: { type: mongoose.Schema.Types.ObjectId, ref: 'Draw', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entryNumbers: { type: [Number], required: true },
  matchCount: { type: Number, default: 0 },
  tier: { type: String, enum: ['5-match', '4-match', '3-match', null], default: null },
  prizePayout: { type: Number, default: 0 },
}, { timestamps: true });

drawEntrySchema.index({ drawId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('DrawEntry', drawEntrySchema);
