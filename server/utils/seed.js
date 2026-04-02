/**
 * Database Seeder
 * Creates the default admin account and sample charities on a fresh database.
 *
 * Usage:
 *   cd server
 *   node utils/seed.js
 *
 * Safe to re-run — skips items that already exist.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Inline model defs to keep seeder self-contained regardless of circular deps
const userSchema = new mongoose.Schema({
  fullName: String, email: { type: String, unique: true }, password: { type: String, select: false },
  role: { type: String, default: 'subscriber' }, country: String, phone: String, avatarUrl: String,
  emailVerified: { type: Boolean, default: false },
}, { timestamps: true });
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const charitySchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true }, description: String, shortDescription: String,
  imageUrl: String, bannerUrl: String, websiteUrl: String, category: String,
  totalRaised: { type: Number, default: 0 }, donorCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }, isActive: { type: Boolean, default: true },
}, { timestamps: true });
const Charity = mongoose.models.Charity || mongoose.model('Charity', charitySchema);

// ─── Sample Data ────────────────────────────────────────────────────────────

const ADMIN = {
  fullName: 'Platform Admin',
  email: 'admin@golfcharity.com',
  password: 'Admin@123',
  role: 'admin',
  emailVerified: true,
};

const CHARITIES = [
  {
    name: 'Green Earth Foundation',
    slug: 'green-earth-foundation',
    shortDescription: 'Planting trees, restoring ecosystems, one fairway at a time.',
    description: 'Green Earth Foundation works globally to restore deforested land, plant 1 million trees annually, and educate communities on sustainable living. Your subscription contribution directly funds planting programs across Africa and South-East Asia.',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1504610926078-a1611febcad3?w=1200&q=80',
    websiteUrl: 'https://example.com/green-earth',
    category: 'Environment',
    isFeatured: true,
    totalRaised: 82400,
    donorCount: 612,
  },
  {
    name: 'Kids First Academy',
    slug: 'kids-first-academy',
    shortDescription: 'Education and opportunity for underprivileged children worldwide.',
    description: 'Kids First Academy provides free schooling, meals, and after-school programs to children in underserved communities across 12 countries. Every £1 donated provides a child with educational materials for an entire week.',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1200&q=80',
    websiteUrl: 'https://example.com/kids-first',
    category: 'Children',
    isFeatured: true,
    totalRaised: 64200,
    donorCount: 481,
  },
  {
    name: 'Veterans Support UK',
    slug: 'veterans-support-uk',
    shortDescription: 'Mental health and housing support for UK armed forces veterans.',
    description: 'Veterans Support UK provides free counselling, emergency housing, job placement, and community programs for British veterans and their families. We believe those who served deserve our full support upon return.',
    imageUrl: 'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    websiteUrl: 'https://example.com/veterans-uk',
    category: 'Veterans',
    isFeatured: true,
    totalRaised: 41800,
    donorCount: 329,
  },
  {
    name: 'Food For All',
    slug: 'food-for-all',
    shortDescription: 'Fighting hunger in local communities across the UK.',
    description: 'Food For All operates a network of community food banks, hot meal programs, and nutrition education workshops. Every month we serve over 50,000 meals to families in need across Greater London, Birmingham, and Manchester.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1200&q=80',
    websiteUrl: 'https://example.com/food-for-all',
    category: 'Hunger',
    isFeatured: false,
    totalRaised: 28700,
    donorCount: 218,
  },
  {
    name: 'Heart Health Alliance',
    slug: 'heart-health-alliance',
    shortDescription: 'Funding cardiac research and awareness campaigns.',
    description: 'Heart Health Alliance funds cutting-edge cardiac research, provides free heart screenings in low-income areas, and runs awareness campaigns that have already helped over 10,000 people identify early warning signs of heart disease.',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80',
    websiteUrl: 'https://example.com/heart-health',
    category: 'Health',
    isFeatured: false,
    totalRaised: 19600,
    donorCount: 147,
  },
  {
    name: 'Ocean Cleanup Corps',
    slug: 'ocean-cleanup-corps',
    shortDescription: 'Removing plastic from oceans and protecting marine life.',
    description: 'Ocean Cleanup Corps coordinates international beach cleanups, deploys ocean-going collection systems, and advocates for global plastic reduction policies. To date we have removed over 2 million kg of plastic from the world\'s oceans.',
    imageUrl: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1200&q=80',
    websiteUrl: 'https://example.com/ocean-cleanup',
    category: 'Environment',
    isFeatured: false,
    totalRaised: 15300,
    donorCount: 112,
  },
];

// ─── Seed Runner ─────────────────────────────────────────────────────────────

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB…');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected');

    // Admin user
    const existingAdmin = await User.findOne({ email: ADMIN.email });
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists — skipping');
    } else {
      const admin = new User(ADMIN);
      await admin.save();
      console.log(`✅ Admin created: ${ADMIN.email} / ${ADMIN.password}`);
    }

    // Charities
    let created = 0;
    let skipped = 0;
    for (const c of CHARITIES) {
      const exists = await Charity.findOne({ slug: c.slug });
      if (exists) { skipped++; continue; }
      await Charity.create(c);
      created++;
    }
    console.log(`✅ Charities: ${created} created, ${skipped} skipped`);

    console.log('\n🎉 Seed complete!');
    console.log('──────────────────────────────────');
    console.log('Admin login: admin@golfcharity.com');
    console.log('Password  : Admin@123');
    console.log('──────────────────────────────────');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
