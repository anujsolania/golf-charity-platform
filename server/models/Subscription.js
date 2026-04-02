const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  stripeCustomerId: { type: String, default: '' },
  stripeSubscriptionId: { type: String, default: '' },
  plan: { type: String, enum: ['monthly', 'yearly'], required: true },
  status: { type: String, enum: ['active', 'cancelled', 'past_due', 'expired', 'trialing'], default: 'active' },
  charityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity', default: null },
  charityContributionPct: { type: Number, default: 10, min: 10, max: 100 },
  prizePoolContribution: { type: Number, default: 0 },
  currentPeriodStart: { type: Date, default: Date.now },
  currentPeriodEnd: {
    type: Date,
    default: function () {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d;
    }
  },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  amount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
