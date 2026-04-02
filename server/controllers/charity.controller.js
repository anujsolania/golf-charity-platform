const Charity = require('../models/Charity');
const CharityContribution = require('../models/CharityContribution');
const Subscription = require('../models/Subscription');

// GET /api/charities
const getCharities = async (req, res) => {
  const { search, category, featured, page = 1, limit = 12 } = req.query;
  const query = { isActive: true };
  if (search) query.name = { $regex: search, $options: 'i' };
  if (category) query.category = category;
  if (featured === 'true') query.isFeatured = true;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [charities, total] = await Promise.all([
    Charity.find(query).sort({ isFeatured: -1, totalRaised: -1 }).skip(skip).limit(parseInt(limit)),
    Charity.countDocuments(query),
  ]);
  res.json({ success: true, charities, total, pages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page) });
};

// GET /api/charities/featured
const getFeatured = async (req, res) => {
  const charities = await Charity.find({ isFeatured: true, isActive: true }).limit(3);
  res.json({ success: true, charities });
};

// GET /api/charities/:slug
const getCharityBySlug = async (req, res) => {
  const charity = await Charity.findOne({ slug: req.params.slug, isActive: true });
  if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
  res.json({ success: true, charity });
};

// POST /api/charities (Admin)
const createCharity = async (req, res) => {
  const { name, description, shortDescription, imageUrl, bannerUrl, websiteUrl, category, isFeatured } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const charity = await Charity.create({ name, slug, description, shortDescription, imageUrl, bannerUrl, websiteUrl, category, isFeatured });
  res.status(201).json({ success: true, charity });
};

// PATCH /api/charities/:id (Admin)
const updateCharity = async (req, res) => {
  const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
  res.json({ success: true, charity });
};

// DELETE /api/charities/:id (Admin)
const deleteCharity = async (req, res) => {
  const charity = await Charity.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
  res.json({ success: true, message: 'Charity deactivated' });
};

// POST /api/charities/donate (subscriber)
const donate = async (req, res) => {
  const { charityId, amount } = req.body;
  if (!charityId || !amount || amount <= 0) return res.status(400).json({ success: false, message: 'Valid charity and amount required' });
  const charity = await Charity.findById(charityId);
  if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
  await CharityContribution.create({ userId: req.user._id, charityId, amount, type: 'donation' });
  await Charity.findByIdAndUpdate(charityId, { $inc: { totalRaised: amount, donorCount: 1 } });
  res.json({ success: true, message: `Donated $${amount} to ${charity.name}` });
};

// GET /api/charities/stats
const getStats = async (req, res) => {
  const [totalRaised, totalDonors] = await Promise.all([
    Charity.aggregate([{ $group: { _id: null, total: { $sum: '$totalRaised' } } }]),
    Charity.aggregate([{ $group: { _id: null, total: { $sum: '$donorCount' } } }]),
  ]);
  res.json({ success: true, totalRaised: totalRaised[0]?.total || 0, totalDonors: totalDonors[0]?.total || 0 });
};

module.exports = { getCharities, getFeatured, getCharityBySlug, createCharity, updateCharity, deleteCharity, donate, getStats };
