import mongoose from 'mongoose';
import dotenv from '../dotenv';
import Tournament from '../models/tournament.model.js';

dotenv.config();

const seedTournaments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if tournaments already exist
    const existingCount = await Tournament.countDocuments();

    if (existingCount > 0) {
      console.log(`✅ ${existingCount} tournaments already exist in database`);
      process.exit(0);
    }

    // Sample tournaments data
    const tournaments = [
      {
        tournamentName: "Aegis Valorant Championship 2024",
        shortName: "AVC 2024",
        gameTitle: "Valorant",
        tier: "A",
        region: "India",
        status: "upcoming",
        startDate: new Date("2024-12-15T10:00:00Z"),
        endDate: new Date("2024-12-20T18:00:00Z"),
        registrationStartDate: new Date("2024-11-01T00:00:00Z"),
        registrationEndDate: new Date("2024-12-10T23:59:59Z"),
        prizePool: {
          total: 500000,
          currency: "INR",
          distribution: {
            first: 250000,
            second: 150000,
            third: 100000
          }
        },
        slots: {
          total: 32,
          registered: 28
        },
        organizer: {
          name: "Aegis Esports",
          contactEmail: "tournaments@aegis.com"
        },
        media: {
          logo: "https://placehold.co/128x128/FF4554/FFFFFF?text=AVC",
          banner: "https://placehold.co/800x300/FF4554/FFFFFF?text=Aegis+Valorant+Championship"
        },
        visibility: "public",
        featured: false
      },
      {
        tournamentName: "BGMI Pro League - Winter 2024",
        shortName: "BGPL Winter 2024",
        gameTitle: "BGMI",
        tier: "S",
        region: "India",
        status: "in_progress",
        startDate: new Date("2024-11-20T12:00:00Z"),
        endDate: new Date("2024-12-05T20:00:00Z"),
        registrationStartDate: new Date("2024-10-15T00:00:00Z"),
        registrationEndDate: new Date("2024-11-15T23:59:59Z"),
        prizePool: {
          total: 1000000,
          currency: "INR",
          distribution: {
            first: 500000,
            second: 300000,
            third: 200000
          }
        },
        slots: {
          total: 64,
          registered: 64
        },
        organizer: {
          name: "Aegis Esports",
          contactEmail: "bgmi@aegis.com"
        },
        media: {
          logo: "https://placehold.co/128x128/F2A900/FFFFFF?text=BGPL",
          banner: "https://placehold.co/800x300/F2A900/FFFFFF?text=BGMI+Pro+League"
        },
        visibility: "public",
        featured: false
      },
      {
        tournamentName: "CS2 Global Championship",
        shortName: "CS2 GC 2024",
        gameTitle: "CS2",
        tier: "S",
        region: "Global",
        status: "completed",
        startDate: new Date("2024-10-01T14:00:00Z"),
        endDate: new Date("2024-10-15T22:00:00Z"),
        registrationStartDate: new Date("2024-08-01T00:00:00Z"),
        registrationEndDate: new Date("2024-09-25T23:59:59Z"),
        prizePool: {
          total: 2000000,
          currency: "USD",
          distribution: {
            first: 1000000,
            second: 600000,
            third: 400000
          }
        },
        slots: {
          total: 16,
          registered: 16
        },
        organizer: {
          name: "Aegis Esports",
          contactEmail: "cs2@aegis.com"
        },
        media: {
          logo: "https://placehold.co/128x128/007ACC/FFFFFF?text=CS2",
          banner: "https://placehold.co/800x300/007ACC/FFFFFF?text=CS2+Global+Championship"
        },
        visibility: "public",
        featured: false
      },
      {
        tournamentName: "League of Legends - Rift Rivals",
        shortName: "LoL RR 2024",
        gameTitle: "LoL",
        tier: "A",
        region: "Asia",
        status: "registration_open",
        startDate: new Date("2024-12-01T16:00:00Z"),
        endDate: new Date("2024-12-10T20:00:00Z"),
        registrationStartDate: new Date("2024-11-01T00:00:00Z"),
        registrationEndDate: new Date("2024-11-25T23:59:59Z"),
        prizePool: {
          total: 750000,
          currency: "INR",
          distribution: {
            first: 400000,
            second: 250000,
            third: 100000
          }
        },
        slots: {
          total: 8,
          registered: 5
        },
        organizer: {
          name: "Aegis Esports",
          contactEmail: "lol@aegis.com"
        },
        media: {
          logo: "https://placehold.co/128x128/005A82/FFFFFF?text=LoL",
          banner: "https://placehold.co/800x300/005A82/FFFFFF?text=League+of+Legends"
        },
        visibility: "public",
        featured: false
      }
    ];

    // Insert tournaments
    await Tournament.insertMany(tournaments);
    console.log(`✅ Successfully created ${tournaments.length} sample tournaments!`);

    // List the created tournaments
    const createdTournaments = await Tournament.find().select('tournamentName gameTitle status');
    console.log('\n📋 Created Tournaments:');
    createdTournaments.forEach((tournament, index) => {
      console.log(`${index + 1}. ${tournament.tournamentName} (${tournament.gameTitle}) - ${tournament.status}`);
    });

  } catch (error) {
    console.error('❌ Error seeding tournaments:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
};

// Run the seed function
seedTournaments();
