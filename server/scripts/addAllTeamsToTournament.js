import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import Tournament from '../models/tournament.model.js';
import Team from '../models/team.model.js';

const tournamentId = '690c658f2ffd8b6e4ee38eab';

async function addAllTeamsToTournament() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find the tournament
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            console.error('❌ Tournament not found');
            return;
        }
        console.log(`Found tournament: ${tournament.tournamentName}`);

        // Get all teams
        const teams = await Team.find({});
        console.log(`Found ${teams.length} teams in database`);

        // Get existing participating team IDs
        const existingTeamIds = tournament.participatingTeams.map(pt => pt.team.toString());

        // Add new teams
        let addedCount = 0;
        for (const team of teams) {
            if (!existingTeamIds.includes(team._id.toString())) {
                tournament.participatingTeams.push({
                    team: team._id,
                    qualifiedThrough: 'open_registration',
                    currentStage: '',
                    totalTournamentPoints: 0,
                    totalTournamentKills: 0
                });
                addedCount++;
                console.log(`Added team: ${team.teamName}`);
            } else {
                console.log(`Team already participating: ${team.teamName}`);
            }
        }

        // Save the tournament
        await tournament.save();
        console.log(`✅ Added ${addedCount} teams to tournament. Total participating teams: ${tournament.participatingTeams.length}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

addAllTeamsToTournament();
