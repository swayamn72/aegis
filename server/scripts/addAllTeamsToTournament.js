import 'dotenv/config';
import mongoose from 'mongoose';

// Import models
import Team from '../models/team.model.js';
import Tournament from '../models/tournament.model.js';

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Connected to MongoDB for adding teams to tournament');

const addAllTeamsToTournament = async () => {
  const tournamentId = '68f1374f008ffc6eb33697e6';
  const excludeTeamId = '68ee91fad1499dc28e024ad2';

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

    console.log(`Adding teams to tournament: ${tournament.tournamentName}`);
    console.log(`First phase: ${firstPhase.name}`);

    // Fetch all teams except the excluded one
    const allTeams = await Team.find({ _id: { $ne: excludeTeamId } });
    console.log(`Found ${allTeams.length} teams to potentially add (excluding ${excludeTeamId})`);

    let addedToParticipating = 0;
    let addedToPhase = 0;

    for (const team of allTeams) {
      // Check if team is already in participatingTeams
      const alreadyParticipating = tournament.participatingTeams.some(pt => pt.team.toString() === team._id.toString());
      if (!alreadyParticipating) {
        tournament.participatingTeams.push({
          team: team._id,
          qualifiedThrough: 'open_registration',
          currentStage: firstPhase.name,
          totalTournamentPoints: 0,
          totalTournamentKills: 0,
        });
        addedToParticipating++;
      }

      // Check if team is already in first phase teams
      const alreadyInPhase = firstPhase.teams.some(pt => pt.toString() === team._id.toString());
      if (!alreadyInPhase) {
        firstPhase.teams.push(team._id);
        addedToPhase++;
      }
    }

    // Save the tournament
    await tournament.save();

    console.log(`\n✅ Successfully added teams:`);
    console.log(`- Added ${addedToParticipating} teams to participatingTeams`);
    console.log(`- Added ${addedToPhase} teams to first phase teams (${firstPhase.name})`);
    console.log(`- Total participating teams now: ${tournament.participatingTeams.length}`);
    console.log(`- Total teams in first phase now: ${firstPhase.teams.length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding teams to tournament:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the script
addAllTeamsToTournament();
