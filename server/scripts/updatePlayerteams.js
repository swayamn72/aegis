import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Player from '../models/player.model.js';

dotenv.config();

const updatePlayerTeams = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const playerId = '68d374d2da1b3d8922da0977';
    const currentTeamId = '68d276998fca88cbad46e096'; // Replace with actual team ID
    const previousTeamIds = ['68d276998fca88cbad46e098', '68d276998fca88cbad46e099']; // Replace with actual team IDs

    const player = await Player.findByIdAndUpdate(
      playerId,
      {
        team: currentTeamId,
        previousTeams: previousTeamIds
      },
      { new: true }
    );

    if (player) {
      console.log('✅ Player updated successfully');
      console.log(`Current Team: ${player.team}`);
      console.log(`Previous Teams: ${player.previousTeams}`);
    } else {
      console.log('❌ Player not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
};

updatePlayerTeams();
