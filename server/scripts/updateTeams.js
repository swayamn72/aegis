import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Team from '../models/team.model.js';

// Load environment variables
dotenv.config({ path: '../.env' });

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  throw new Error("MONGO_URI is not defined in .env");
}

const updateTeams = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected");

    const result = await Team.updateMany({}, { $set: { primaryGame: "BGMI" } });

    console.log(`✅ Updated ${result.modifiedCount} teams to primaryGame = "BGMI"`);
  } catch (err) {
    console.error("❌ Error updating teams:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
};

updateTeams();
