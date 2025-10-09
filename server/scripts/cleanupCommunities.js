import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Community from '../models/community.model.js';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aegis';

async function cleanupCommunities() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all communities
    const allCommunities = await Community.find();
    console.log(`📋 Found ${allCommunities.length} communities`);

    // Identify invalid communities (missing name, empty name, or "undefined")
    const invalidCommunities = allCommunities.filter(com => !com.name || com.name.trim() === '' || com.name === 'undefined');
    console.log(`❌ Found ${invalidCommunities.length} invalid communities`);
    invalidCommunities.forEach(com => console.log(`Invalid: name="${com.name}", id=${com._id}`));

    // Delete invalid communities
    if (invalidCommunities.length > 0) {
      // Try deleting by name "undefined" since id might be undefined
      await Community.deleteMany({ name: 'undefined' });
      console.log(`🗑️ Deleted communities with name "undefined"`);
    }

    // Verify remaining communities
    const remainingCommunities = await Community.find();
    console.log(`✅ Remaining communities: ${remainingCommunities.length}`);
    remainingCommunities.forEach((community, index) => {
      console.log(`${index + 1}. "${community.name}" - ${community.membersCount} members`);
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

cleanupCommunities();
