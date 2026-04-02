const Subscription = require('../models/Subscription');
const Charity = require('../models/Charity');
const CharityContribution = require('../models/CharityContribution');
const { sendEmail, subscriptionConfirmedEmail } = require('../services/emailService');

// GET /api/subscriptions/my
const getMySubscription = async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user._id }).populate('charityId');
  res.json({ success: true, subscription: sub });
};

// POST /api/subscriptions/create — mock subscription (no Stripe required for demo)
const createSubscription = async (req, res) => {
  const { plan, charityId, charityContributionPct = 10 } = req.body;
  if (!plan || !['monthly', 'yearly'].includes(plan)) return res.status(400).json({ success: false, message: 'Plan must be monthly or yearly' });

  const existing = await Subscription.findOne({ userId: req.user._id });
  if (existing && existing.status === 'active') return res.status(400).json({ success: false, message: 'Already have an active subscription' });

  const periodEnd = new Date();
  plan === 'yearly' ? periodEnd.setFullYear(periodEnd.getFullYear() + 1) : periodEnd.setMonth(periodEnd.getMonth() + 1);
  const amount = plan === 'yearly' ? 99 : 9.99;
  const prizePoolContribution = plan === 'yearly' ? 50 : 5;

  const sub = existing
    ? await Subscription.findByIdAndUpdate(existing._id, { plan, status: 'active', charityId: charityId || null, charityContributionPct, currentPeriodStart: new Date(), currentPeriodEnd: periodEnd, amount, prizePoolContribution }, { new: true })
    : await Subscription.create({ userId: req.user._id, plan, charityId: charityId || null, charityContributionPct, currentPeriodEnd: periodEnd, amount, prizePoolContribution });

  // Record charity contribution
  if (charityId) {
    const charityAmount = (amount * charityContributionPct) / 100;
    await CharityContribution.create({ userId: req.user._id, charityId, subscriptionId: sub._id, amount: charityAmount, type: 'subscription' });
    await Charity.findByIdAndUpdate(charityId, { $inc: { totalRaised: charityAmount } });
  }

  sendEmail(subscriptionConfirmedEmail(req.user, plan)).catch(console.error);
  const populated = await Subscription.findById(sub._id).populate('charityId');
  res.status(201).json({ success: true, subscription: populated });
};

// POST /api/subscriptions/cancel
const cancelSubscription = async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' });
  if (!sub) return res.status(404).json({ success: false, message: 'No active subscription found' });
  await Subscription.findByIdAndUpdate(sub._id, { status: 'cancelled', cancelAtPeriodEnd: true });
  res.json({ success: true, message: 'Subscription cancelled. Access continues until period end.' });
};

// PATCH /api/subscriptions/charity — update charity + contribution %
const updateCharity = async (req, res) => {
  const { charityId, charityContributionPct } = req.body;
  if (charityContributionPct && (charityContributionPct < 10 || charityContributionPct > 100))
    return res.status(400).json({ success: false, message: 'Contribution must be between 10% and 100%' });
  const sub = await Subscription.findOneAndUpdate(
    { userId: req.user._id },
    { charityId, charityContributionPct: charityContributionPct || 10 },
    { new: true }
  ).populate('charityId');
  res.json({ success: true, subscription: sub });
};

// GET /api/subscriptions/plans (public)
const getPlans = async (req, res) => {
  res.json({
    success: true,
    plans: [
      { id: 'monthly', name: 'Monthly', price: 9.99, currency: 'USD', interval: 'month', prizeContribution: 5, charityMin: 10, features: ['Monthly draw entry', '5-score tracking', 'Charity support', 'Real-time results'] },
      { id: 'yearly', name: 'Yearly', price: 99, currency: 'USD', interval: 'year', prizeContribution: 50, charityMin: 10, features: ['All Monthly features', '2 months FREE', 'Priority support', 'Exclusive yearly badge'], badge: 'Best Value' },
    ],
  });
};

module.exports = { getMySubscription, createSubscription, cancelSubscription, updateCharity, getPlans };
