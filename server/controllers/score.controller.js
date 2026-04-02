const Score = require('../models/Score');

const MAX_SCORES = 5;

// GET /api/scores — get my last 5 scores
const getScores = async (req, res) => {
  const scores = await Score.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(MAX_SCORES);
  res.json({ success: true, scores });
};

// POST /api/scores — add new score (rolling 5-window)
const addScore = async (req, res) => {
  const { score, scoreDate, notes } = req.body;
  if (!score || !scoreDate) return res.status(400).json({ success: false, message: 'Score and date are required' });
  if (score < 1 || score > 45) return res.status(400).json({ success: false, message: 'Score must be between 1 and 45' });

  // Enforce rolling 5: if already 5, delete oldest
  const count = await Score.countDocuments({ userId: req.user._id });
  if (count >= MAX_SCORES) {
    const oldest = await Score.findOne({ userId: req.user._id }).sort({ createdAt: 1 });
    await Score.findByIdAndDelete(oldest._id);
  }

  const newScore = await Score.create({ userId: req.user._id, score, scoreDate, notes });
  const scores = await Score.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.status(201).json({ success: true, score: newScore, scores });
};

// PATCH /api/scores/:id
const updateScore = async (req, res) => {
  const { score, scoreDate, notes } = req.body;
  if (score && (score < 1 || score > 45)) return res.status(400).json({ success: false, message: 'Score must be between 1 and 45' });
  const existing = await Score.findOne({ _id: req.params.id, userId: req.user._id });
  if (!existing) return res.status(404).json({ success: false, message: 'Score not found' });
  const updated = await Score.findByIdAndUpdate(req.params.id, { score, scoreDate, notes }, { new: true });
  res.json({ success: true, score: updated });
};

// DELETE /api/scores/:id
const deleteScore = async (req, res) => {
  const existing = await Score.findOne({ _id: req.params.id, userId: req.user._id });
  if (!existing) return res.status(404).json({ success: false, message: 'Score not found' });
  await Score.findByIdAndDelete(req.params.id);
  const scores = await Score.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, scores });
};

module.exports = { getScores, addScore, updateScore, deleteScore };
