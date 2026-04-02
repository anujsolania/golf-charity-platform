const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema({
  drawMonth: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'simulated', 'published'], default: 'pending' },
  logicType: { type: String, enum: ['random', 'algorithm'], default: 'random' },
  winningNumbers: { type: [Number], default: [] },
  jackpotAmount: { type: Number, default: 0 },
  rolledOver: { type: Boolean, default: false },
  rolledOverAmount: { type: Number, default: 0 },
  totalPool: { type: Number, default: 0 },
  fiveMatchPool: { type: Number, default: 0 },
  fourMatchPool: { type: Number, default: 0 },
  threeMatchPool: { type: Number, default: 0 },
  fiveMatchPayout: { type: Number, default: 0 },
  fourMatchPayout: { type: Number, default: 0 },
  threeMatchPayout: { type: Number, default: 0 },
  fiveMatchWinners: { type: Number, default: 0 },
  fourMatchWinners: { type: Number, default: 0 },
  threeMatchWinners: { type: Number, default: 0 },
  totalEntries: { type: Number, default: 0 },
  publishedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Draw', drawSchema);
