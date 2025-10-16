import 'dotenv/config';
import mongoose from 'mongoose';

// Import models
import Team from '../models/team.model.js';

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connected to MongoDB for updating team logos');

const updateTeamLogos = async () => {
  const newLogoUrl = 'https://res.cloudinary.com/didazwts6/image/upload/v1760543930/aegis-team-logos/team-logo-68ee91fad1499dc28e024ad2-1760543928189.png';

  try {
    // Update all teams with the new logo
    const result = await Team.updateMany(
      {}, // Empty filter to update all teams
      { $set: { logo: newLogoUrl } }
    );

    console.log(`✅ Successfully updated ${result.modifiedCount} teams with new logo`);
    console.log(`Logo URL: ${newLogoUrl}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating team logos:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
updateTeamLogos();
