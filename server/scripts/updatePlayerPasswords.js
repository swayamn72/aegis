import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import Player model
import Player from '../models/player.model.js';

const newPasswordHash = '$2b$10$wUqf/7VZnZ/cUgzdTQ/JcewsSQQky3Ihve1kOk/VfYVBQQV4KrwG.';

async function updatePlayerPasswords() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Update all players' passwords
        const result = await Player.updateMany(
            {}, // Empty filter to update all players
            { $set: { password: newPasswordHash } }
        );

        console.log(`✅ Updated passwords for ${result.modifiedCount} players`);

    } catch (error) {
        console.error('❌ Password update failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

updatePlayerPasswords();
