const mongoose = require('mongoose');

const charityEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  eventDate: Date,
  imageUrl: String,
});

const charitySchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Charity name is required'], trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  bannerUrl: { type: String, default: '' },
  websiteUrl: { type: String, default: '' },
  category: { type: String, default: 'General' },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  totalRaised: { type: Number, default: 0 },
  donorCount: { type: Number, default: 0 },
  events: [charityEventSchema],
}, { timestamps: true });

module.exports = mongoose.model('Charity', charitySchema);
