import 'dotenv/config';
import mongoose from 'mongoose';

// Import models
import Tournament from '../models/tournament.model.js';

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connected to MongoDB for adding participating teams to first phase');

const addParticipatingTeamsToFirstPhase = async () => {
  const tournamentId = '68f1374f008ffc6eb33697e6';

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

    console.log(`Adding participating teams to first phase: ${tournament.tournamentName}`);
    console.log(`First phase: ${firstPhase.name}`);
    console.log(`Current participating teams: ${tournament.participatingTeams.length}`);
    console.log(`Current teams in first phase: ${firstPhase.teams.length}`);

    let addedCount = 0;

    // Ensure firstPhase.teams is an array
    if (!firstPhase.teams) {
      firstPhase.teams = [];
    }

    // Add each participating team to first phase if not already present
    tournament.participatingTeams.forEach(participatingTeam => {
      const teamId = participatingTeam.team;
      const alreadyInPhase = firstPhase.teams.some(t => t.toString() === teamId.toString());

      if (!alreadyInPhase) {
        firstPhase.teams.push(teamId);
        addedCount++;
      }
    });

    // Save the tournament
    await tournament.save();

    console.log(`\n✅ Successfully added teams to first phase:`);
    console.log(`- Added ${addedCount} teams to first phase teams`);
    console.log(`- Total teams in first phase now: ${firstPhase.teams.length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding teams to first phase:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
addParticipatingTeamsToFirstPhase();
