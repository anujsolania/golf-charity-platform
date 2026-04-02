const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Score = require('../models/Score');
const Draw = require('../models/Draw');
const DrawEntry = require('../models/DrawEntry');
const Charity = require('../models/Charity');
const CharityContribution = require('../models/CharityContribution');

const seedData = async () => {
  try {
    // Seed admin
    const adminExists = await User.findOne({ email: 'admin@golfcharity.com' });
    if (!adminExists) {
      const admin = await User.create({
        fullName: 'Platform Admin',
        email: 'admin@golfcharity.com',
        password: 'Admin@123',
        role: 'admin',
        emailVerified: true,
      });
      console.log('✅ Admin created: admin@golfcharity.com / Admin@123');
    }

    // Seed charities
    const charityCount = await Charity.countDocuments();
    if (charityCount === 0) {
      await Charity.insertMany([
        {
          name: 'Green Future Foundation',
          slug: 'green-future-foundation',
          description: 'Dedicated to reforestation and environmental conservation worldwide.',
          shortDescription: 'Planting trees, saving futures.',
          imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600',
          category: 'Environment',
          isFeatured: true,
          totalRaised: 42500,
          donorCount: 312,
        },
        {
          name: 'Children\'s Hope Alliance',
          slug: 'childrens-hope-alliance',
          description: 'Providing education, healthcare, and safe environments for children in need.',
          shortDescription: 'Every child deserves a bright future.',
          imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600',
          category: 'Children',
          isFeatured: true,
          totalRaised: 87300,
          donorCount: 645,
        },
        {
          name: 'Veterans Rising',
          slug: 'veterans-rising',
          description: 'Supporting military veterans with mental health resources, housing, and career guidance.',
          shortDescription: 'Honoring service, enabling recovery.',
          imageUrl: 'https://images.unsplash.com/photo-1569974508382-f9f6ec91fc0a?w=600',
          category: 'Veterans',
          isFeatured: false,
          totalRaised: 31200,
          donorCount: 218,
        },
        {
          name: 'Ocean Care Initiative',
          slug: 'ocean-care-initiative',
          description: 'Fighting plastic pollution and protecting marine ecosystems globally.',
          shortDescription: 'Clean oceans for future generations.',
          imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600',
          category: 'Environment',
          isFeatured: false,
          totalRaised: 19800,
          donorCount: 176,
        },
        {
          name: 'Food For All',
          slug: 'food-for-all',
          description: 'Tackling food insecurity by connecting surplus food with communities that need it most.',
          shortDescription: 'No one should go to bed hungry.',
          imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600',
          category: 'Hunger',
          isFeatured: true,
          totalRaised: 64100,
          donorCount: 489,
        },
      ]);
      console.log('✅ 5 charities seeded');
    }

    console.log('🌱 Seed complete');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
};

module.exports = seedData;
