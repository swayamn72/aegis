import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Community from '../models/community.model.js';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aegis';

async function seedCommunities() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create dummy communities
    const dummyCommunities = [
      {
        name: 'Valorant India',
        description: 'Find scrims, tips, and Valorant players from India. Join the community to connect with fellow gamers!',
        membersCount: 25430,
        image: 'https://img.icons8.com/color/96/valorant.png',
      },
      {
        name: 'CS:GO Global',
        description: 'Global CS:GO community — tournaments, memes, and updates. The ultimate hub for Counter-Strike enthusiasts.',
        membersCount: 40500,
        image: 'https://img.icons8.com/color/96/counter-strike.png',
      },
      {
        name: 'Esports Careers',
        description: 'A place to connect and grow your esports career. Network with professionals and discover opportunities.',
        membersCount: 10250,
        image: 'https://img.icons8.com/color/96/trophy.png',
      }
    ];

    // Insert communities
    const insertedCommunities = await Community.insertMany(dummyCommunities);
    console.log(`✅ Inserted ${insertedCommunities.length} dummy communities`);

    // Verify communities
    const allCommunities = await Community.find();
    console.log('📋 All communities:');
    allCommunities.forEach((community, index) => {
      console.log(`${index + 1}. "${community.name}" - ${community.membersCount} members`);
    });

  } catch (error) {
    console.error('❌ Error seeding communities:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedCommunities();
