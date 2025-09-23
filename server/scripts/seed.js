import mongoose from "mongoose";
import dotenv from "dotenv";
import Player from "../models/player.model.js";
import Team from "../models/team.model.js";

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/aegis";

async function seed() {
  try {
    // 1. Connect
    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB Connected");

    // 2. Clear old data (optional)
    await Player.deleteMany({});
    await Team.deleteMany({});
    console.log("🗑️ Cleared old data");

    // 3. Create players
    const players = await Player.insertMany([
      {
        username: "player1",
        inGameName: "AceShooter",
        realName: "John Doe",
        email: "player1@example.com",
        password: "hashedpassword", // ⚠️ Replace with hashed password in real app
        primaryGame: "BGMI",
        inGameRole: ["IGL"],
        country: "India",
        age: 20,
      },
      {
        username: "player2",
        inGameName: "SharpEye",
        realName: "Alex Lee",
        email: "player2@example.com",
        password: "hashedpassword",
        primaryGame: "BGMI",
        inGameRole: ["assaulter"],
        country: "India",
        age: 21,
      },
      {
        username: "player3",
        inGameName: "SilentSniper",
        realName: "Sam Patel",
        email: "player3@example.com",
        password: "hashedpassword",
        primaryGame: "BGMI",
        inGameRole: ["sniper"],
        country: "India",
        age: 19,
      },
      {
        username: "player4",
        inGameName: "ShieldWall",
        realName: "Ravi Kumar",
        email: "player4@example.com",
        password: "hashedpassword",
        primaryGame: "BGMI",
        inGameRole: ["support"],
        country: "India",
        age: 22,
      },
    ]);

    console.log("✅ Players created");

    // 4. Create team (Player1 = captain)
    const team = await Team.create({
      teamName: "Team Titans",
      tag: "TTN",
      captain: players[0]._id,
      players: players.map((p) => p._id),
      primaryGame: "BGMI",
      region: "APAC",
      country: "India",
      bio: "A rising BGMI squad aiming for the top!",
      socials: {
        discord: "discord.gg/teamtitans",
        twitter: "@TeamTitans",
      },
    });

    console.log("✅ Team created");

    // 5. Populate to check
    const result = await Team.findById(team._id)
      .populate("players")
      .populate("captain");

    console.log("🎉 Final Team with Players:\n", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB Disconnected");
  }
}

seed();
