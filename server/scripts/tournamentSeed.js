import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import Player from '../models/player.model.js';
import Team from '../models/team.model.js';

// Load environment variables (ensure it picks from ../.env)
dotenv.config({ path: '../.env' });

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  throw new Error("❌ MONGO_URI is not defined in .env");
}

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

/**
 * Generate Players
 */
const generatePlayers = async (count) => {
  const players = [];
  const usedUsernames = new Set();
  const usedEmails = new Set();

  for (let i = 0; i < count; i++) {
    let username, email;

    // Ensure unique usernames and emails
    do {
      username = faker.internet.username().toLowerCase(); // ✅ updated API
      email = faker.internet.email().toLowerCase();
    } while (usedUsernames.has(username) || usedEmails.has(email));

    usedUsernames.add(username);
    usedEmails.add(email);

    const player = new Player({
      username,
      inGameName: faker.internet.username(), // ✅ updated API
      realName: faker.person.fullName(),
      email,
      password: faker.internet.password(), // Note: hash in production
      verified: faker.datatype.boolean(),
      country: faker.location.country(),
      bio: faker.lorem.paragraph(),
      primaryGame: faker.helpers.arrayElement(['BGMI', 'VALO', 'CS2']),
      earnings: faker.number.int({ min: 0, max: 100000 }),
      inGameRole: faker.helpers.arrayElements(
        ['assaulter', 'IGL', 'support', 'filter', 'sniper'],
        { min: 1, max: 2 }
      ),
      location: faker.location.city(),
      age: faker.number.int({ min: 16, max: 30 }),
      languages: faker.helpers.arrayElements(
        ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada'],
        { min: 1, max: 3 }
      ),
      aegisRating: faker.number.int({ min: 1000, max: 2500 }),
      tournamentsPlayed: faker.number.int({ min: 0, max: 50 }),
      matchesPlayed: faker.number.int({ min: 0, max: 500 }),
      qualifiedEvents: faker.datatype.boolean(),
      qualifiedEventDetails: faker.datatype.boolean()
        ? [faker.lorem.sentence()]
        : [],
      teamStatus: faker.helpers.arrayElement([
        'looking for a team',
        'in a team',
        'open for offers',
      ]),
      availability: faker.helpers.arrayElement([
        'weekends only',
        'evenings',
        'flexible',
        'full time',
      ]),
      discordTag: `${faker.internet.username()}#${faker.number.int({
        min: 1000,
        max: 9999,
      })}`,
      twitch: faker.datatype.boolean() ? faker.internet.url() : '',
      YouTube: faker.datatype.boolean() ? faker.internet.url() : '',
      profileVisibility: faker.helpers.arrayElement([
        'public',
        'friends',
        'private',
      ]),
      cardTheme: faker.helpers.arrayElement([
        'orange',
        'blue',
        'purple',
        'red',
        'green',
        'pink',
      ]),
    });

    players.push(player);
  }

  return await Player.insertMany(players);
};

/**
 * Generate Teams
 */
const generateTeams = async (count, players) => {
  const teams = [];

  for (let i = 0; i < count; i++) {
    const teamPlayers = faker.helpers.arrayElements(players, 4);
    const captain = teamPlayers[0]; // first player as captain

    const team = new Team({
      teamName: faker.company.name(),
      tag: faker.string.alpha({ length: 3, casing: 'upper' }),
      captain: captain._id,
      players: teamPlayers.map((p) => p._id),
      primaryGame: faker.helpers.arrayElement(['BGMI', 'VALO', 'CS2']),
      region: faker.helpers.arrayElement([
        'Asia',
        'India',
        'Europe',
        'North America',
      ]),
      country: faker.location.country(),
      bio: faker.lorem.paragraph(),
      logo: faker.image.url(),
      establishedDate: faker.date.past(),
      totalEarnings: faker.number.int({ min: 0, max: 500000 }),
      aegisRating: faker.number.int({ min: 1000, max: 2500 }),
      qualifiedEvents: faker.datatype.boolean() ? [faker.lorem.word()] : [],
      organization: null,
      socials: {
        discord: faker.datatype.boolean() ? faker.internet.url() : '',
        twitter: faker.datatype.boolean() ? faker.internet.url() : '',
        twitch: faker.datatype.boolean() ? faker.internet.url() : '',
        youtube: faker.datatype.boolean() ? faker.internet.url() : '',
        website: faker.datatype.boolean() ? faker.internet.url() : '',
      },
      profileVisibility: faker.helpers.arrayElement(['public', 'private']),
    });

    teams.push(team);
  }

  return await Team.insertMany(teams);
};

/**
 * Main seeding function
 */
const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...');

    // Clear old data
    await Player.deleteMany({});
    await Team.deleteMany({});
    console.log('🗑️ Cleared existing players and teams.');

    // Generate players
    console.log('👤 Generating 96 players...');
    const players = await generatePlayers(96);
    console.log(`✅ Generated ${players.length} players.`);

    // Generate teams
    console.log('👥 Generating 24 teams...');
    const teams = await generateTeams(24, players);
    console.log(`✅ Generated ${teams.length} teams.`);

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed
seedDatabase();
