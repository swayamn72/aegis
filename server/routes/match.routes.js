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
    const { status, phase, limit = 50 } = req.query;
    
    const filter = { tournament: tournamentId };
    if (status) filter.status = status;
    if (phase) filter.tournamentPhase = phase;
    
    const matches = await Match.find(filter)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo'
      })
      .populate('tournament', 'tournamentName shortName')
      .sort({ scheduledStartTime: -1 })
      .limit(parseInt(limit))
      .lean();

    const formattedMatches = matches.map(match => ({
      _id: match._id,
      matchNumber: match.matchNumber,
      matchType: match.matchType,
      phase: match.tournamentPhase,
      scheduledStartTime: match.scheduledStartTime,
      actualStartTime: match.actualStartTime,
      actualEndTime: match.actualEndTime,
      status: match.status,
      map: match.map,
      duration: match.matchDuration,
      teams: match.participatingTeams?.map(pt => ({
        _id: pt.team?._id,
        name: pt.team?.teamName || pt.teamName || 'Unknown Team',
        tag: pt.team?.teamTag || pt.teamTag,
        logo: pt.team?.logo,
        position: pt.finalPosition,
        kills: pt.kills?.total || 0,
        points: pt.points?.totalPoints || 0,
        damage: pt.totalDamage || 0,
        survivalTime: pt.survivalTime || 0,
        chickenDinner: pt.chickenDinner || false
      })) || [],
      stats: {
        totalKills: match.matchStats?.totalKills || 0,
        totalDamage: match.matchStats?.totalDamage || 0,
        averageSurvivalTime: match.matchStats?.averageSurvivalTime || 0,
        mostKillsPlayer: match.matchStats?.mostKillsPlayer,
        mostDamagePlayer: match.matchStats?.mostDamagePlayer
      }
    }));

    res.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Get match results for leaderboard
router.get('/tournament/:tournamentId/results', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { phase } = req.query;
    
    const filter = { 
      tournament: tournamentId,
      status: 'completed'
    };
    if (phase) filter.tournamentPhase = phase;
    
    const matches = await Match.find(filter)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo'
      })
      .sort({ actualEndTime: -1 })
      .lean();

    // Aggregate team performance across matches
    const teamStats = {};
    
    matches.forEach(match => {
      match.participatingTeams?.forEach(pt => {
        if (!pt.team) return;
        
        const teamId = pt.team._id.toString();
        if (!teamStats[teamId]) {
          teamStats[teamId] = {
            team: {
              _id: pt.team._id,
              name: pt.team.teamName,
              tag: pt.team.teamTag,
              logo: pt.team.logo
            },
            matchesPlayed: 0,
            totalPoints: 0,
            totalKills: 0,
            totalDamage: 0,
            chickenDinners: 0,
            averagePlacement: 0,
            totalPlacement: 0,
            bestPlacement: 16
          };
        }
        
        const stats = teamStats[teamId];
        stats.matchesPlayed += 1;
        stats.totalPoints += pt.points?.totalPoints || 0;
        stats.totalKills += pt.kills?.total || 0;
        stats.totalDamage += pt.totalDamage || 0;
        if (pt.chickenDinner) stats.chickenDinners += 1;
        
        const placement = pt.finalPosition || 16;
        stats.totalPlacement += placement;
        if (placement < stats.bestPlacement) {
          stats.bestPlacement = placement;
        }
      });
    });

    // Calculate averages and sort
    const leaderboard = Object.values(teamStats)
      .map(stats => ({
        ...stats,
        averagePlacement: stats.matchesPlayed > 0 ? 
          (stats.totalPlacement / stats.matchesPlayed).toFixed(1) : 16,
        averagePoints: stats.matchesPlayed > 0 ? 
          (stats.totalPoints / stats.matchesPlayed).toFixed(1) : 0
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    res.json({
      leaderboard,
      totalMatches: matches.length,
      phase: phase || 'Overall'
    });
  } catch (error) {
    console.error('Error fetching match results:', error);
    res.status(500).json({ error: 'Failed to fetch match results' });
  }
});

// Get live match information
router.get('/tournament/:tournamentId/live', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    const liveMatch = await Match.findOne({
      tournament: tournamentId,
      status: 'in_progress'
    })
    .populate({
      path: 'participatingTeams.team',
      select: 'teamName teamTag logo'
    })
    .populate('tournament', 'tournamentName currentCompetitionPhase')
    .lean();

    if (!liveMatch) {
      return res.json({ liveMatch: null });
    }

    const formattedMatch = {
      _id: liveMatch._id,
      matchNumber: liveMatch.matchNumber,
      phase: liveMatch.tournamentPhase,
      map: liveMatch.map,
      startTime: liveMatch.actualStartTime || liveMatch.scheduledStartTime,
              teams: liveMatch.participatingTeams?.slice(0, 4).map(pt => ({
        _id: pt.team?._id,
        name: pt.team?.teamName || pt.teamName || 'Unknown Team',
        tag: pt.team?.teamTag || pt.teamTag,
        logo: pt.team?.logo,
        position: pt.finalPosition,
        kills: pt.kills?.total || 0,
        status: pt.finalPosition ? 'eliminated' : 'alive'
      })) || [],
      tournament: {
        name: liveMatch.tournament?.tournamentName,
        phase: liveMatch.tournament?.currentCompetitionPhase
      }
    };

    res.json({ liveMatch: formattedMatch });
  } catch (error) {
    console.error('Error fetching live match:', error);
    res.status(500).json({ error: 'Failed to fetch live match' });
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
          match.participatingTeams[teamIndex].kills.total = result.kills || 0;
          match.participatingTeams[teamIndex].totalDamage = result.damage || 0;
          match.participatingTeams[teamIndex].survivalTime = result.survivalTime || 0;
          match.participatingTeams[teamIndex].points.placementPoints = placementPoints;
          match.participatingTeams[teamIndex].points.killPoints = result.kills || 0;
          match.participatingTeams[teamIndex].points.totalPoints = placementPoints + (result.kills || 0);

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

// Get match statistics for a tournament
router.get('/tournament/:tournamentId/stats', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    const stats = await Match.aggregate([
      { $match: { tournament: new mongoose.Types.ObjectId(tournamentId) } },
      {
        $group: {
          _id: null,
          totalMatches: { $sum: 1 },
          completedMatches: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalKills: { $sum: '$matchStats.totalKills' },
          totalDamage: { $sum: '$matchStats.totalDamage' },
          avgDuration: { $avg: '$matchDuration' },
          maps: { $push: '$map' }
        }
      }
    ]);

    const result = stats[0] || {
      totalMatches: 0,
      completedMatches: 0,
      totalKills: 0,
      totalDamage: 0,
      avgDuration: 0,
      maps: []
    };

    // Calculate map statistics
    const mapStats = {};
    result.maps.forEach(map => {
      if (map) {
        mapStats[map] = (mapStats[map] || 0) + 1;
      }
    });

    result.mapStats = Object.entries(mapStats).map(([mapName, count]) => ({
      mapName,
      timesPlayed: count,
      percentage: ((count / result.totalMatches) * 100).toFixed(1)
    }));

    result.averageKills = result.completedMatches > 0 ? 
      Math.round(result.totalKills / result.completedMatches) : 0;

    delete result.maps;

    res.json(result);
  } catch (error) {
    console.error('Error fetching match statistics:', error);
    res.status(500).json({ error: 'Failed to fetch match statistics' });
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