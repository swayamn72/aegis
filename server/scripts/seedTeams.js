import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Player from '../models/player.model.js';
import Team from '../models/team.model.js';

dotenv.config();

const seedTeams = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if teams already exist
    const existingTeamsCount = await Team.countDocuments();
    const existingPlayersCount = await Player.countDocuments();

    if (existingTeamsCount > 0) {
      console.log(`✅ ${existingTeamsCount} teams already exist in database`);
      process.exit(0);
    }

    if (existingPlayersCount === 0) {
      console.log('📋 No players found. Creating sample players first...');

      // Sample players data
      const players = [
        // BGMI Players
        {
          username: "shadowhunter",
          inGameName: "ShadowHunter",
          realName: "Arjun Sharma",
          email: "arjun.sharma@email.com",
          password: "$2a$10$hashedpassword1", // In real app, hash passwords properly
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
        },
        {
          username: "phantomace",
          inGameName: "PhantomAce",
          realName: "Vikram Singh",
          email: "vikram.singh@email.com",
          password: "$2a$10$hashedpassword3",
          verified: true,
          country: "India",
          primaryGame: "BGMI",
          inGameRole: ["assaulter", "filter"],
          location: "Bangalore",
          age: 21,
          languages: ["English", "Kannada"],
          aegisRating: 1680,
          tournamentsPlayed: 10,
          matchesPlayed: 320,
          teamStatus: "in a team",
          availability: "full time",
          discordTag: "PhantomAce#9012",
          bio: "Aggressive assaulter with great mechanical skills"
        },
        {
          username: "stealthking",
          inGameName: "StealthKing",
          realName: "Amit Patel",
          email: "amit.patel@email.com",
          password: "$2a$10$hashedpassword4",
          verified: true,
          country: "India",
          primaryGame: "BGMI",
          inGameRole: ["support", "IGL"],
          location: "Ahmedabad",
          age: 23,
          languages: ["Hindi", "Gujarati", "English"],
          aegisRating: 1750,
          tournamentsPlayed: 14,
          matchesPlayed: 420,
          teamStatus: "in a team",
          availability: "full time",
          discordTag: "StealthKing#3456",
          bio: "Support player with excellent communication and strategy"
        },

        // Valorant Players
        {
          username: "neonflash",
          inGameName: "NeonFlash",
          realName: "Karan Gupta",
          email: "karan.gupta@email.com",
          password: "$2a$10$hashedpassword5",
          verified: true,
          country: "India",
          primaryGame: "VALO",
          inGameRole: ["duelist"],
          location: "Pune",
          age: 19,
          languages: ["Hindi", "English"],
          aegisRating: 1920,
          tournamentsPlayed: 18,
          matchesPlayed: 520,
          teamStatus: "in a team",
          availability: "full time",
          discordTag: "NeonFlash#7890",
          bio: "Duelist main with exceptional aim and game sense"
        },
        {
          username: "sagehealer",
          inGameName: "SageHealer",
          realName: "Priya Sharma",
          email: "priya.sharma@email.com",
          password: "$2a$10$hashedpassword6",
          verified: true,
          country: "India",
          primaryGame: "VALO",
          inGameRole: ["sentinel"],
          location: "Chennai",
          age: 20,
          languages: ["Tamil", "English"],
          aegisRating: 1780,
          tournamentsPlayed: 16,
          matchesPlayed: 480,
          teamStatus: "in a team",
          availability: "full time",
          discordTag: "SageHealer#2345",
          bio: "Sentinel player with great utility usage and positioning"
        },
        {
          username: "vipertoxic",
          inGameName: "ViperToxic",
          realName: "Rajesh Kumar",
          email: "rajesh.kumar@email.com",
          password: "$2a$10$hashedpassword7",
          verified: true,
          country: "India",
          primaryGame: "VALO",
          inGameRole: ["controller"],
          location: "Hyderabad",
          age: 22,
          languages: ["Telugu", "English"],
          aegisRating: 1850,
          tournamentsPlayed: 20,
          matchesPlayed: 600,
          teamStatus: "in a team",
          availability: "full time",
          discordTag: "ViperToxic#6789",
          bio: "Controller specialist with excellent map control"
        },
        {
          username: "jettblade",
          inGameName: "JettBlade",
          realName: "Sneha Patel",
          email: "sneha.patel@email.com",
          password: "$2a$10$hashedpassword8",
          verified: true,
          country: "India",
          primaryGame: "VALO",
          inGameRole: ["duelist"],
          location: "Mumbai",
          age: 18,
          languages: ["Hindi", "English"],
          aegisRating: 1950,
          tournamentsPlayed: 22,
          matchesPlayed: 650,
          teamStatus: "in a team",
          availability: "full time",
          discordTag: "JettBlade#0123",
          bio: "Top-tier duelist with incredible mechanical skill"
        },

        // CS2 Players
        {
          username: "headshotpro",
          inGameName: "HeadshotPro",
          realName: "Aakash Reddy",
          email: "aakash.reddy@email.com",
          password: "$2a$10$hashedpassword9",
          verified: true,
          country: "India",
          primaryGame: "CS2",
          inGameRole: ["awper"],
          location: "Bangalore",
          age: 24,
          languages: ["English", "Kannada"],
          aegisRating: 2100,
          tournamentsPlayed: 25,
          matchesPlayed: 800,
          teamStatus: "in a team",
          availability: "full time",
          discordTag: "HeadshotPro#4567",
          bio: "Professional AWPer with exceptional rifle skills"
        },
        {
          username: "riflemaster",
          inGameName: "RifleMaster",
          realName: "Suresh Nair",
          email: "suresh.nair@email.com",
          password: "$2a$10$hashedpassword10",
          verified: true,
          country: "India",
          primaryGame: "CS2",
          inGameRole: ["rifler"],
          location: "Kochi",
          age: 23,
          languages: ["Malayalam", "English"],
          aegisRating: 1980,
          tournamentsPlayed: 20,
          matchesPlayed: 700,
          teamStatus: "in a team",
          availability: "full time",
          discordTag: "RifleMaster#8901",
          bio: "Versatile rifler with excellent game sense"
        }
      ];

      // Insert players
      const createdPlayers = await Player.insertMany(players);
      console.log(`✅ Successfully created ${createdPlayers.length} sample players!`);

      // List the created players
      console.log('\n📋 Created Players:');
      createdPlayers.forEach((player, index) => {
        console.log(`${index + 1}. ${player.username} (${player.primaryGame}) - ${player.inGameName}`);
      });

      // Store player IDs for team creation
      var playerIds = createdPlayers.map(player => player._id);
    } else {
      console.log(`✅ ${existingPlayersCount} players already exist. Using existing players for teams.`);
      const existingPlayers = await Player.find().select('_id username primaryGame');
      var playerIds = existingPlayers.map(player => player._id);
      console.log('\n📋 Using Existing Players:');
      existingPlayers.forEach((player, index) => {
        console.log(`${index + 1}. ${player.username} (${player.primaryGame})`);
      });
    }

    // Sample teams data
    const teams = [
      // BGMI Teams
      {
        teamName: "Shadow Strikers",
        tag: "SS",
        captain: playerIds[0], // shadowhunter
        players: [playerIds[0], playerIds[1], playerIds[2], playerIds[3]], // shadowhunter, blitzstrike, phantomace, stealthking
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
        captain: playerIds[2], // phantomace
        players: [playerIds[2], playerIds[0], playerIds[1]], // phantomace, shadowhunter, blitzstrike
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
      },

      // Valorant Teams
      {
        teamName: "Neon Knights",
        tag: "NK",
        captain: playerIds[4], // neonflash
        players: [playerIds[4], playerIds[5], playerIds[6], playerIds[7]], // neonflash, sagehealer, vipertoxic, jettblade
        primaryGame: "VALO",
        region: "India",
        country: "India",
        bio: "Premier Valorant team with exceptional tactical gameplay",
        logo: "https://placehold.co/128x128/007ACC/FFFFFF?text=NK",
        establishedDate: new Date("2023-02-10"),
        totalEarnings: 320000,
        aegisRating: 1880,
        qualifiedEvents: ["Aegis Valorant Championship 2024", "Valorant Champions Tour"],
        socials: {
          discord: "https://discord.gg/neonknights",
          twitter: "@neonknights",
          twitch: "neonknights",
          youtube: "NeonKnightsGaming"
        }
      },
      {
        teamName: "Viper Strike",
        tag: "VS",
        captain: playerIds[6], // vipertoxic
        players: [playerIds[6], playerIds[4], playerIds[5]], // vipertoxic, neonflash, sagehealer
        primaryGame: "VALO",
        region: "India",
        country: "India",
        bio: "Controller-focused team with excellent map control",
        logo: "https://placehold.co/128x128/005A82/FFFFFF?text=VS",
        establishedDate: new Date("2023-04-05"),
        totalEarnings: 150000,
        aegisRating: 1780,
        qualifiedEvents: ["Aegis Valorant Championship 2024"],
        socials: {
          discord: "https://discord.gg/viperstrike",
          twitter: "@viperstrike"
        }
      },

      // CS2 Teams
      {
        teamName: "Headshot Heroes",
        tag: "HH",
        captain: playerIds[8], // headshotpro
        players: [playerIds[8], playerIds[9]], // headshotpro, riflemaster
        primaryGame: "CS2",
        region: "India",
        country: "India",
        bio: "Professional CS2 team with exceptional aim and teamwork",
        logo: "https://placehold.co/128x128/1F5F1F/FFFFFF?text=HH",
        establishedDate: new Date("2023-01-01"),
        totalEarnings: 450000,
        aegisRating: 2050,
        qualifiedEvents: ["CS2 Global Championship", "ESL Pro League"],
        socials: {
          discord: "https://discord.gg/headshotheroes",
          twitter: "@headshotheroes",
          twitch: "headshotheroes",
          youtube: "HeadshotHeroesGaming",
          website: "https://headshotheroes.com"
        }
      }
    ];

    // Insert teams
    const createdTeams = await Team.insertMany(teams);
    console.log(`\n✅ Successfully created ${createdTeams.length} sample teams!`);

    // List the created teams
    console.log('\n📋 Created Teams:');
    createdTeams.forEach((team, index) => {
      console.log(`${index + 1}. ${team.teamName} [${team.tag}] (${team.primaryGame}) - Captain: ${team.captain}`);
    });

    // Show team compositions
    console.log('\n👥 Team Compositions:');
    for (const team of createdTeams) {
      const teamPlayers = await Player.find({ _id: { $in: team.players } }).select('username inGameName primaryGame');
      console.log(`\n${team.teamName} [${team.tag}]:`);
      teamPlayers.forEach(player => {
        console.log(`  - ${player.inGameName} (${player.username})`);
      });
    }

  } catch (error) {
    console.error('❌ Error seeding teams:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedTeams();
