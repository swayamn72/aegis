import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Player from '../models/player.model.js';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple possible .env locations
const possibleEnvPaths = [
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '.env'),
  '.env'
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  try {
    const result = dotenv.config({ path: envPath, debug: true });
    if (result.parsed && Object.keys(result.parsed).length > 0) {
      console.log(`✅ Environment variables loaded from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    // Continue to next path
  }
}

if (!envLoaded) {
  console.log('⚠️  No .env file found. Trying process.env directly...');
}

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ MONGO_URI is not defined.");
  console.log("📋 Current environment variables related to MONGO:");
  Object.keys(process.env)
    .filter(key => key.includes('MONGO'))
    .forEach(key => console.log(`   ${key}: ${process.env[key]}`));
  
  console.log("\n💡 Please ensure your .env file contains:");
  console.log("   MONGO_URI=mongodb://localhost:27017/your-database");
  console.log("   or");
  console.log("   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database");
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/**
 * Update Players with Random Profile Pictures
 */
const updatePlayerPFPs = async () => {
  try {
    console.log('🔄 Starting profile picture updates...');

    // Fetch all players
    const players = await Player.find({});
    console.log(`📊 Found ${players.length} players to update.`);

    if (players.length === 0) {
      console.log('ℹ️  No players found in the database.');
      return;
    }

    let updatedCount = 0;

    for (const player of players) {
      // Generate a random avatar URL for profile picture
      const profilePicture = faker.image.avatar(); // Generates a random avatar image URL

      // Update the player
      player.profilePicture = profilePicture;
      await player.save();

      updatedCount++;
      if (updatedCount % 10 === 0 || updatedCount === players.length) {
        console.log(`✅ Updated ${updatedCount}/${players.length} players.`);
      }
    }

    console.log(`🎉 Successfully updated ${updatedCount} players with random profile pictures!`);
  } catch (error) {
    console.error('❌ Error updating player PFPs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📤 Database connection closed.');
  }
};

// Run the update
updatePlayerPFPs();