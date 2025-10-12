import 'dotenv/config';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

// Import models (matching index.js style)
import Player from '../models/player.model.js';
import Team from '../models/team.model.js';
import Tournament from '../models/tournament.model.js';

// Connect to MongoDB using the same URI as in index.js
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connected to MongoDB for test data generation');

const generateTestData = async () => {
  const tournamentId = '68ea0e64d2d97b750a22d188';

  try {
    // Find the tournament and populate phases
    const tournament = await Tournament.findById(tournamentId).populate('phases');
    if (!tournament) {
      throw new Error(`Tournament with ID ${tournamentId} not found`);
    }

    const firstPhase = tournament.phases && tournament.phases.length > 0 ? tournament.phases[0] : null;
    if (!firstPhase) {
      throw new Error('No phases found in the tournament');
    }

    console.log(`Generating test data for tournament: ${tournament.tournamentName}`);
    console.log(`First phase: ${firstPhase.name}`);

    const participatingEntries = [];
    const phaseTeamIds = [];

    for (let i = 0; i < 30; i++) {
      // Generate 4 players for the team
      const players = [];
      for (let j = 0; j < 4; j++) {
        const playerData = {
          username: faker.internet.username(),
          realName: faker.person.fullName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          // Optional fields
          inGameName: `${faker.person.firstName()}${Math.floor(Math.random() * 10000)}`,
          // Add more fields if needed based on schema
        };
        const player = new Player(playerData);
        await player.save();
        players.push(player._id);
      }

      // Generate team
      const teamData = {
        teamName: `Test Team ${i + 1} - ${faker.lorem.words(2)}`,
        teamTag: `TT${String(i + 1).padStart(2, '0')}`,
        logo: faker.image.url(200, 200, 'people'), // Fake logo URL
        captain: players[0], // Set first player as captain
        players: players,
        primaryGame: 'BGMI', // Required field
        // Add more fields if needed
      };
      const team = new Team(teamData);
      await team.save();

      // Prepare participatingTeams entry
      participatingEntries.push({
        team: team._id,
        currentStage: firstPhase.name,
        qualifiedThrough: 'open_registration',
        totalTournamentPoints: 0,
        totalTournamentKills: 0,
      });

      // Add to phase teams
      phaseTeamIds.push(team._id);

      console.log(`Created Team ${i + 1}: ${team.teamName}`);
    }

    // Update tournament
    tournament.participatingTeams.push(...participatingEntries);
    firstPhase.teams.push(...phaseTeamIds);
    await tournament.save();

    console.log(`\n✅ Successfully generated and added:`);
    console.log(`- 30 teams with 120 players total`);
    console.log(`- Added to participatingTeams (currentStage: ${firstPhase.name})`);
    console.log(`- Added to first phase teams: ${firstPhase.name}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating test data:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
generateTestData();
