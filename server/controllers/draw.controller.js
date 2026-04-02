const Draw = require('../models/Draw');
const DrawEntry = require('../models/DrawEntry');
const Score = require('../models/Score');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { randomDraw, algorithmDraw, countMatches, getTier } = require('../services/drawEngine');
const { calculateTotalPool, splitPrizePool } = require('../services/prizePool');
const { sendEmail, drawResultEmail, winnerNotificationEmail } = require('../services/emailService');

// GET /api/draws — list all published draws
const getDraws = async (req, res) => {
  const draws = await Draw.find({ status: 'published' }).sort({ drawMonth: -1 });
  res.json({ success: true, draws });
};

// GET /api/draws/upcoming
const getUpcomingDraw = async (req, res) => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  let draw = await Draw.findOne({ status: { $in: ['pending', 'simulated'] }, drawMonth: { $gte: now } });
  if (!draw) {
    draw = { drawMonth: nextMonth, status: 'pending', jackpotAmount: 0, totalPool: 0, winningNumbers: [] };
  }
  // Calculate current pool from active subs
  const activeSubs = await Subscription.find({ status: 'active' });
  const totalPool = calculateTotalPool(activeSubs);
  res.json({ success: true, draw, totalPool, activeSubscribers: activeSubs.length });
};

// GET /api/draws/:id
const getDrawById = async (req, res) => {
  const draw = await Draw.findById(req.params.id);
  if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
  res.json({ success: true, draw });
};

// GET /api/draws/:id/my-entry
const getMyEntry = async (req, res) => {
  const entry = await DrawEntry.findOne({ drawId: req.params.id, userId: req.user._id });
  res.json({ success: true, entry });
};

// GET /api/draws/my-history
const getMyHistory = async (req, res) => {
  const entries = await DrawEntry.find({ userId: req.user._id }).populate('drawId').sort({ createdAt: -1 });
  res.json({ success: true, entries });
};

// Helper: run draw logic and create entries
const executeDraw = async (drawId, logicType, publish = false) => {
  const draw = await Draw.findById(drawId);
  if (!draw) throw new Error('Draw not found');

  // Get all active subscribers with at least 1 score
  const activeSubs = await Subscription.find({ status: 'active' });
  const activeUserIds = activeSubs.map(s => s.userId);

  // Get all scores for these users
  const allScores = await Score.find({ userId: { $in: activeUserIds } });

  // Generate winning numbers
  const winningNumbers = logicType === 'algorithm' ? algorithmDraw(allScores) : randomDraw();

  // Build rollover from previous draw
  const prevDraw = await Draw.findOne({ status: 'published', rolledOver: true }).sort({ drawMonth: -1 });
  const rolledOverAmount = prevDraw ? prevDraw.rolloverAmount || 0 : 0;

  // Calculate pool
  const totalPool = calculateTotalPool(activeSubs, rolledOverAmount);

  // Create entries for each active user who has scores
  const userScoreMap = {};
  allScores.forEach(s => {
    if (!userScoreMap[s.userId]) userScoreMap[s.userId] = [];
    userScoreMap[s.userId].push(s.score);
  });

  const winnerCounts = { fiveMatch: 0, fourMatch: 0, threeMatch: 0 };
  const entryDocs = [];

  for (const userId of activeUserIds) {
    const userScores = userScoreMap[userId];
    if (!userScores || userScores.length === 0) continue;
    // Use up to 5 scores as entry numbers, deduplicated
    const entryNumbers = [...new Set(userScores)].slice(0, 5);
    if (entryNumbers.length < 3) continue; // need at least 3 numbers

    const matchCount = countMatches(entryNumbers, winningNumbers);
    const tier = getTier(matchCount);
    if (tier === '5-match') winnerCounts.fiveMatch++;
    else if (tier === '4-match') winnerCounts.fourMatch++;
    else if (tier === '3-match') winnerCounts.threeMatch++;

    entryDocs.push({ drawId, userId, entryNumbers, matchCount, tier });
  }

  const prizes = splitPrizePool(totalPool, winnerCounts, rolledOverAmount);

  return { winningNumbers, prizes, entryDocs, winnerCounts };
};

// POST /api/draws/simulate (Admin)
const simulateDraw = async (req, res) => {
  const { drawMonth, logicType = 'random' } = req.body;
  const month = drawMonth ? new Date(drawMonth) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

  let draw = await Draw.findOne({ drawMonth: { $gte: new Date(month.getFullYear(), month.getMonth(), 1), $lt: new Date(month.getFullYear(), month.getMonth() + 1, 1) } });
  if (!draw) draw = await Draw.create({ drawMonth: month, status: 'pending', logicType });

  const { winningNumbers, prizes, entryDocs, winnerCounts } = await executeDraw(draw._id, logicType, false);

  await Draw.findByIdAndUpdate(draw._id, { winningNumbers, status: 'simulated', logicType, ...prizes });

  res.json({ success: true, message: 'Draw simulated (not published)', draw: { ...draw.toObject(), winningNumbers }, prizes, winnerCounts, sampleEntries: entryDocs.slice(0, 5) });
};

// POST /api/draws/publish (Admin)
const publishDraw = async (req, res) => {
  const { drawId, logicType = 'random' } = req.body;
  const draw = await Draw.findById(drawId);
  if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
  if (draw.status === 'published') return res.status(400).json({ success: false, message: 'Draw already published' });

  const { winningNumbers, prizes, entryDocs } = await executeDraw(drawId, logicType, true);

  // Delete old entries and create new ones
  await DrawEntry.deleteMany({ drawId });
  const entries = await DrawEntry.insertMany(
    entryDocs.map(e => ({
      ...e,
      prizePayout: e.tier === '5-match' ? prizes.fiveMatchPayout : e.tier === '4-match' ? prizes.fourMatchPayout : e.tier === '3-match' ? prizes.threeMatchPayout : 0,
    }))
  );

  await Draw.findByIdAndUpdate(drawId, {
    winningNumbers, status: 'published', logicType, publishedAt: new Date(),
    totalPool: prizes.totalPool, totalEntries: entries.length,
    fiveMatchPool: prizes.fiveMatchPool, fourMatchPool: prizes.fourMatchPool, threeMatchPool: prizes.threeMatchPool,
    fiveMatchPayout: prizes.fiveMatchPayout, fourMatchPayout: prizes.fourMatchPayout, threeMatchPayout: prizes.threeMatchPayout,
    fiveMatchWinners: prizes.winnerCounts.fiveMatch, fourMatchWinners: prizes.winnerCounts.fourMatch, threeMatchWinners: prizes.winnerCounts.threeMatch,
    rolledOver: prizes.rolledOver, rolledOverAmount: prizes.rolloverAmount,
  });

  // Send notifications async
  const updatedDraw = await Draw.findById(drawId);
  for (const entry of entries) {
    const user = await User.findById(entry.userId);
    if (!user) continue;
    await Notification.create({ userId: entry.userId, type: 'draw_result', title: 'Draw Results Published!', body: `You matched ${entry.matchCount} numbers. ${entry.tier ? `You won the ${entry.tier} prize!` : 'Better luck next month!'}`, link: `/dashboard/draws` });
    sendEmail(drawResultEmail(user, updatedDraw, entry)).catch(console.error);
    if (entry.tier) sendEmail(winnerNotificationEmail(user, entry)).catch(console.error);
  }

  res.json({ success: true, message: 'Draw published successfully!', draw: updatedDraw, prizes });
};

module.exports = { getDraws, getUpcomingDraw, getDrawById, getMyEntry, getMyHistory, simulateDraw, publishDraw };
