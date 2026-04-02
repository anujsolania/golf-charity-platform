const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: [1, 'Score must be at least 1'], max: [45, 'Score cannot exceed 45'] },
  scoreDate: { type: Date, required: [true, 'Score date is required'] },
  notes: { type: String, default: '', maxlength: 200 },
}, { timestamps: true });

scoreSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Score', scoreSchema);
