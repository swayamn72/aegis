import express from 'express';
import Match from '../models/match.model.js';
import Tournament from '../models/tournament.model.js';
import Team from '../models/team.model.js';

const router = express.Router();

// Helper function to calculate placement points
const getPlacementPoints = (position) => {
  const pointsMap = {
    1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1
  };
  return pointsMap[position] || 0;
};

// Get all matches for a tournament
router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const matches = await Match.find({ tournament: tournamentId })
      .populate('participatingTeams.team', 'teamName teamTag logo')
      .populate('tournament', 'tournamentName')
      .sort({ scheduledStartTime: 1 });

    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Get matches for a specific phase
router.get('/phase/:phaseId', async (req, res) => {
  try {
    const { phaseId } = req.params;
    const matches = await Match.find({ tournamentPhase: phaseId })
      .populate('participatingTeams.team', 'teamName teamTag logo')
      .sort({ matchNumber: 1 });

    res.json(matches);
  } catch (error) {
    console.error('Error fetching phase matches:', error);
    res.status(500).json({ error: 'Failed to fetch phase matches' });
  }
});

// Create a new match
router.post('/', async (req, res) => {
  try {
    const matchData = req.body;

    console.log('Received match data:', JSON.stringify(matchData, null, 2));

    // Validate tournament exists
    console.log('Validating tournament:', matchData.tournament);
    const tournament = await Tournament.findById(matchData.tournament);
    if (!tournament) {
      console.error('Tournament not found:', matchData.tournament);
      return res.status(404).json({ error: 'Tournament not found' });
    }
    console.log('Tournament found:', tournament._id);

    // Validate teams exist
    console.log('Validating teams...');
    if (matchData.participatingTeams && matchData.participatingTeams.length > 0) {
      for (const teamData of matchData.participatingTeams) {
        console.log('Validating team:', teamData.team);
        const team = await Team.findById(teamData.team);
        if (!team) {
          console.error('Team not found:', teamData.team);
          return res.status(404).json({ error: `Team ${teamData.team} not found` });
        }
        console.log('Team found:', team._id);
      }
    }

    console.log('Creating match...');
    const match = new Match(matchData);
    await match.save();
    console.log('Match saved successfully:', match._id);

    // Populate the saved match
    console.log('Populating match data...');
    await match.populate('participatingTeams.team', 'teamName teamTag logo');
    await match.populate('tournament', 'tournamentName');
    console.log('Match populated successfully');

    console.log('Returning match:', match._id);
    res.status(201).json(match);
  } catch (error) {
    console.error('Error creating match:', error);
    console.error('Error stack:', error.stack);
    if (error.name === 'ValidationError') {
      console.error('Validation error details:', error.message);
      res.status(400).json({ error: 'Validation error', details: error.message });
    } else {
      console.error('Server error:', error.message);
      res.status(500).json({ error: 'Failed to create match', details: error.message });
    }
  }
});

// Update a match
router.put('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const updateData = req.body;

    const match = await Match.findByIdAndUpdate(matchId, updateData, { new: true })
      .populate('participatingTeams.team', 'teamName teamTag logo')
      .populate('tournament', 'tournamentName');

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    console.error('Error updating match:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: 'Validation error', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update match' });
    }
  }
});

// Update match results
router.put('/:matchId/results', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { results } = req.body;

    console.log('Received results update for match:', matchId);
    console.log('Results data:', JSON.stringify(results, null, 2));

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Update participating teams with results
    if (results && results.length > 0) {
      for (const result of results) {
        const teamIndex = match.participatingTeams.findIndex(
          team => team.team.toString() === result.teamId
        );

        if (teamIndex !== -1) {
          // Calculate placement points based on position
          const placementPoints = getPlacementPoints(result.position);

          match.participatingTeams[teamIndex].finalPosition = result.position;
          match.participatingTeams[teamIndex].kills.total = result.kills;
          match.participatingTeams[teamIndex].points.placementPoints = placementPoints;
          match.participatingTeams[teamIndex].points.killPoints = result.kills;
          match.participatingTeams[teamIndex].points.totalPoints = placementPoints + result.kills;

          // Mark as chicken dinner if position 1
          if (result.position === 1) {
            match.participatingTeams[teamIndex].chickenDinner = true;
          }
        } else {
          console.error('Team not found in participating teams:', result.teamId);
        }
      }
    }

    // Update match status to completed
    match.status = 'completed';
    if (!match.actualEndTime) {
      match.actualEndTime = new Date();
    }

    await match.save();
    await match.populate('participatingTeams.team', 'teamName teamTag logo');

    console.log('Updated match:', match._id);
    res.json(match);
  } catch (error) {
    console.error('Error updating match results:', error);
    res.status(500).json({ error: 'Failed to update match results' });
  }
});

// Delete a match
router.delete('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findByIdAndDelete(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: 'Failed to delete match' });
  }
});

// Get match by ID
router.get('/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId)
      .populate('participatingTeams.team', 'teamName teamTag logo')
      .populate('tournament', 'tournamentName');

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

export default router;
