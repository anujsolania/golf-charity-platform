const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Score = require('../models/Score');
const Draw = require('../models/Draw');
const DrawEntry = require('../models/DrawEntry');
const Charity = require('../models/Charity');
const CharityContribution = require('../models/CharityContribution');
const WinnerVerification = require('../models/WinnerVerification');

// GET /api/admin/stats
const getStats = async (req, res) => {
  const [totalUsers, activeSubscriptions, totalDraws, charityData, pendingVerifications] = await Promise.all([
    User.countDocuments({ role: 'subscriber' }),
    Subscription.countDocuments({ status: 'active' }),
    Draw.countDocuments({ status: 'published' }),
    Charity.aggregate([{ $group: { _id: null, totalRaised: { $sum: '$totalRaised' }, totalDonors: { $sum: '$donorCount' } } }]),
    WinnerVerification.countDocuments({ status: 'pending' }),
  ]);
  const monthlyRevenue = activeSubscriptions * 9.99;
  res.json({ success: true, stats: { totalUsers, activeSubscriptions, totalDraws, totalCharityRaised: charityData[0]?.totalRaised || 0, totalDonors: charityData[0]?.totalDonors || 0, monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)), pendingVerifications } });
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) query.$or = [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  if (role) query.role = role;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);
  // Attach subscriptions
  const userIds = users.map(u => u._id);
  const subs = await Subscription.find({ userId: { $in: userIds } });
  const subMap = {};
  subs.forEach(s => { subMap[s.userId.toString()] = s; });
  const result = users.map(u => ({ ...u.toObject(), subscription: subMap[u._id.toString()] || null }));
  res.json({ success: true, users: result, total, pages: Math.ceil(total / parseInt(limit)) });
};

// PATCH /api/admin/users/:id
const updateUser = async (req, res) => {
  const { fullName, email, role, country } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { fullName, email, role, country }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user });
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  await Subscription.findOneAndDelete({ userId: req.params.id });
  res.json({ success: true, message: 'User deleted' });
};

// GET /api/admin/users/:id/scores
const getUserScores = async (req, res) => {
  const scores = await Score.find({ userId: req.params.id }).sort({ createdAt: -1 });
  res.json({ success: true, scores });
};

// GET /api/admin/reports
const getReports = async (req, res) => {
  const [
    userGrowth, prizeHistory, charityBreakdown, drawStats,
  ] = await Promise.all([
    User.aggregate([{ $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { '_id.year': 1, '_id.month': 1 } }, { $limit: 12 }]),
    Draw.find({ status: 'published' }).select('drawMonth totalPool fiveMatchPayout fourMatchPayout threeMatchPayout').sort({ drawMonth: -1 }).limit(12),
    CharityContribution.aggregate([{ $group: { _id: '$charityId', total: { $sum: '$amount' } } }, { $lookup: { from: 'charities', localField: '_id', foreignField: '_id', as: 'charity' } }, { $unwind: '$charity' }, { $project: { name: '$charity.name', total: 1 } }]),
    Draw.find({ status: 'published' }).select('drawMonth fiveMatchWinners fourMatchWinners threeMatchWinners totalEntries').sort({ drawMonth: -1 }).limit(12),
  ]);
  res.json({ success: true, userGrowth, prizeHistory, charityBreakdown, drawStats });
};

module.exports = { getStats, getUsers, updateUser, deleteUser, getUserScores, getReports };
