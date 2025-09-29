import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from '../models/post.model.js';
import Player from '../models/player.model.js';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aegis';

async function seedPosts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find existing players
    const players = await Player.find().limit(2); // Get first 2 players
    if (players.length === 0) {
      console.log('❌ No players found. Please run seed script first.');
      return;
    }

    console.log('Found players:', players.map(p => p.username));

    // Create dummy posts
    const dummyPosts = [];
    for (let i = 0; i < 20; i++) {
      const author = players[i % players.length]._id;
      dummyPosts.push({
        author,
        caption: `Post ${i + 1}: Exciting update from the esports world! #Gaming #Esports`,
        tags: ['Gaming', 'Esports', 'Update'],
        media: [
          {
            type: 'image',
            url: `https://via.placeholder.com/400x300?text=Post+${i + 1}`
          }
        ],
        likes: [],
        comments: []
      });
    }

    // Insert posts
    const insertedPosts = await Post.insertMany(dummyPosts);
    console.log(`✅ Inserted ${insertedPosts.length} dummy posts`);

    // Verify posts
    const allPosts = await Post.find().populate('author', 'username');
    console.log('📋 All posts:');
    allPosts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.caption}" by ${post.author.username}`);
    });

  } catch (error) {
    console.error('❌ Error seeding posts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedPosts();
