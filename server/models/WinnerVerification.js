const mongoose = require('mongoose');

const winnerVerificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  drawId: { type: mongoose.Schema.Types.ObjectId, ref: 'Draw', required: true },
  drawEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'DrawEntry', required: true },
  proofUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
  adminNotes: { type: String, default: '' },
  tier: { type: String },
  prizeAmount: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date,
  paidAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('WinnerVerification', winnerVerificationSchema);
