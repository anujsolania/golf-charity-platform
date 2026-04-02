const mongoose = require('mongoose');

const charityContributionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  charityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Charity', required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['subscription', 'donation'], default: 'subscription' },
  contributionDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('CharityContribution', charityContributionSchema);
