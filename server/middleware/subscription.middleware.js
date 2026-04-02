const Subscription = require('../models/Subscription');

const requireSubscription = async (req, res, next) => {
  const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' });
  if (!sub) return res.status(403).json({ success: false, message: 'Active subscription required' });
  req.subscription = sub;
  next();
};

module.exports = { requireSubscription };
