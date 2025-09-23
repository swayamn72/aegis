import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/aegis-esports';

const checkDatabase = async () => {
  try {
    console.log('🔌 Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const teams = await mongoose.connection.db.collection('teams').find().toArray();
    console.log('\n📋 Teams in database:');
    if (teams.length === 0) {
      console.log('❌ No teams found in database!');
    } else {
      teams.forEach((team, index) => {
        console.log(`${index + 1}. ${team.teamName} [${team.tag}] - ${team.primaryGame}`);
      });
    }

    const players = await mongoose.connection.db.collection('players').find().toArray();
    console.log('\n📋 Players in database:');
    if (players.length === 0) {
      console.log('❌ No players found in database!');
    } else {
      players.forEach((player, index) => {
        console.log(`${index + 1}. ${player.username} - ${player.primaryGame}`);
      });
    }

    console.log('\n✅ Database check completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
};

checkDatabase();
