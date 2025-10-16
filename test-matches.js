import mongoose from 'mongoose';
import Match from './server/models/match.model.js';

async function test() {
  try {
    await mongoose.connect('mongodb+srv://aegis-admin-1:swayamn75@cluster0.mxdgc7b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

    // Check specific matches
    const match1 = await Match.findById('68f0c4b5407f62bfe0755e2a');
    const match2 = await Match.findById('68f0c54e407f62bfe0755f67');

    console.log('Match 1:', match1 ? { id: match1._id, tournament: match1.tournament, tournamentPhase: match1.tournamentPhase, status: match1.status } : 'Not found');
    console.log('Match 2:', match2 ? { id: match2._id, tournament: match2.tournament, tournamentPhase: match2.tournamentPhase, status: match2.status } : 'Not found');

    // Test the query from the advance-phase endpoint
    const matches = await Match.find({
      tournament: '68edfa7db717fa01732c738a',
      tournamentPhase: 'Qualifiers',
      status: 'completed'
    });

    console.log('Found matches for Qualifiers:', matches.length);
    matches.forEach(match => {
      console.log('Match:', match._id, 'Phase:', match.tournamentPhase, 'Status:', match.status);
    });

    // Check if the tournament ID is correct
    console.log('Tournament ID from user data: 68edfa7db717fa01732c738a');
    console.log('Tournament ID from matches: 68edfa7db717fa01732c7389');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

test();
