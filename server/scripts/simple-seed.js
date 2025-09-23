import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/aegis-esports';

const simpleSeed = async () => {
  try {
    console.log('🔌 Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Insert sample players directly
    const players = [
      {
        username: "shadowhunter",
        inGameName: "ShadowHunter",
        realName: "Arjun Sharma",
        email: "arjun.sharma@email.com",
        password: "$2a$10$hashedpassword1",
        verified: true,
        country: "India",
        primaryGame: "BGMI",
        inGameRole: ["IGL", "assaulter"],
        location: "Mumbai",
        age: 22,
        languages: ["Hindi", "English"],
        aegisRating: 1850,
        tournamentsPlayed: 15,
        matchesPlayed: 450,
        teamStatus: "in a team",
        availability: "full time",
        discordTag: "ShadowHunter#1234",
        bio: "Professional BGMI player with 3 years of competitive experience"
      },
      {
        username: "blitzstrike",
        inGameName: "BlitzStrike",
        realName: "Rohit Kumar",
        email: "rohit.kumar@email.com",
        password: "$2a$10$hashedpassword2",
        verified: true,
        country: "India",
        primaryGame: "BGMI",
        inGameRole: ["sniper", "support"],
        location: "Delhi",
        age: 20,
        languages: ["Hindi", "English"],
        aegisRating: 1720,
        tournamentsPlayed: 12,
        matchesPlayed: 380,
        teamStatus: "in a team",
        availability: "full time",
        discordTag: "BlitzStrike#5678",
        bio: "Sniper specialist with excellent positioning and game sense"
      }
    ];

    const playerResult = await mongoose.connection.db.collection('players').insertMany(players);
    console.log('✅ Players inserted:', playerResult.insertedCount);

    // Get player IDs
    const player1 = await mongoose.connection.db.collection('players').findOne({username: "shadowhunter"});
    const player2 = await mongoose.connection.db.collection('players').findOne({username: "blitzstrike"});

    // Insert sample teams
    const teams = [
      {
        teamName: "Shadow Strikers",
        tag: "SS",
        captain: player1._id,
        players: [player1._id, player2._id],
        primaryGame: "BGMI",
        region: "India",
        country: "India",
        bio: "One of the top BGMI teams in India with exceptional teamwork and strategy",
        logo: "https://placehold.co/128x128/FF4554/FFFFFF?text=SS",
        establishedDate: new Date("2023-01-15"),
        totalEarnings: 250000,
        aegisRating: 1800,
        qualifiedEvents: ["Aegis Valorant Championship 2024", "BGMI Pro League - Winter 2024"],
        socials: {
          discord: "https://discord.gg/shadowstrikers",
          twitter: "@shadowstrikers",
          twitch: "shadowstrikers",
          youtube: "ShadowStrikersGaming"
        }
      },
      {
        teamName: "Phantom Elite",
        tag: "PE",
        captain: player2._id,
        players: [player2._id, player1._id],
        primaryGame: "BGMI",
        region: "India",
        country: "India",
        bio: "Aggressive BGMI team known for their fast-paced gameplay",
        logo: "https://placehold.co/128x128/F2A900/FFFFFF?text=PE",
        establishedDate: new Date("2023-03-20"),
        totalEarnings: 180000,
        aegisRating: 1720,
        qualifiedEvents: ["BGMI Pro League - Winter 2024"],
        socials: {
          discord: "https://discord.gg/phantomelite",
          twitter: "@phantomelite",
          twitch: "phantomelite"
        }
      }
    ];

    const teamResult = await mongoose.connection.db.collection('teams').insertMany(teams);
    console.log('✅ Teams inserted:', teamResult.insertedCount);

    // Verify the data
    const teamsList = await mongoose.connection.db.collection('teams').find().toArray();
    const playersList = await mongoose.connection.db.collection('players').find().toArray();

    console.log('\n📋 Created Teams:');
    teamsList.forEach((team, index) => {
      console.log(`${index + 1}. ${team.teamName} [${team.tag}] (${team.primaryGame})`);
    });

    console.log('\n📋 Created Players:');
    playersList.forEach((player, index) => {
      console.log(`${index + 1}. ${player.username} (${player.primaryGame}) - ${player.inGameName}`);
    });

    console.log('\n✅ Mock data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
};

simpleSeed();
