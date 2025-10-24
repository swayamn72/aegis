import express from 'express';
import auth from '../middleware/auth.js';
import Match from '../models/match.model.js';
import Tournament from '../models/tournament.model.js';
import Team from '../models/team.model.js';
import Player from '../models/player.model.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to calculate placement points
const getPlacementPoints = (position) => {
  const pointsMap = {
    1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1
  };
  return pointsMap[position] || 0;
};

// Get scheduled matches for a tournament
router.get('/scheduled/:tournamentId', async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const matches = await Match.find({
      tournament: tournamentId,
      status: 'scheduled'
    })
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo'
      })
      .populate('tournament', 'tournamentName shortName')
      .sort({ scheduledStartTime: 1 })
      .lean();

    res.json({ matches });
  } catch (error) {
    console.error('Error fetching scheduled matches:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled matches' });
  }
});

// Schedule a new match
router.post('/schedule', async (req, res) => {
  try {
    const matchData = req.body;

    console.log('Scheduling match data:', JSON.stringify(matchData, null, 2));

    // Validate tournament exists
    const tournament = await Tournament.findById(matchData.tournament);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Validate phase exists in tournament
    const phase = tournament.phases?.find(p => p.name === matchData.tournamentPhase);
    if (!phase) {
      return res.status(400).json({ error: 'Invalid tournament phase' });
    }

    // Normalize incoming group ids to strings
    const selectedGroupIds = (matchData.participatingGroups || []).map(g => g?.toString());

    // Collect teams from selected groups (match by _id or name)
    const teamsFromGroups = selectedGroupIds.flatMap(groupId => {
      const group = phase.groups?.find(g =>
        g?._id?.toString() === groupId ||
        g?.id?.toString?.() === groupId ||
        g?.name === groupId
      );
      return group?.teams || [];
    });

    // Remove duplicates and normalize team ids to strings
    const uniqueTeamIds = [...new Set(teamsFromGroups.map(t => t?.toString()))];

    // Create participatingTeams array with just team references
    const participatingTeams = uniqueTeamIds.map(teamId => ({
      team: teamId,
      finalPosition: null,
      points: { placementPoints: 0, killPoints: 0, totalPoints: 0 },
      kills: { total: 0, breakdown: [] },
      chickenDinner: false
    }));

    // Get the next match number for this tournament
    const lastMatch = await Match.findOne({ tournament: matchData.tournament })
      .sort({ matchNumber: -1 })
      .select('matchNumber');
    const nextMatchNumber = lastMatch ? lastMatch.matchNumber + 1 : 1;

    // Create the match with scheduled status and persist participatingGroups
    const scheduledMatch = new Match({
      ...matchData,
      participatingTeams,
      participatingGroups: selectedGroupIds,
      matchNumber: nextMatchNumber,
      status: 'scheduled',
      matchType: 'scheduled'
    });

    await scheduledMatch.save();

    // Update the tournament's phase to include this match
    if (tournament) {
      const phase = tournament.phases?.find(p => p.name === matchData.tournamentPhase);
      if (phase) {
        phase.matches.push(scheduledMatch._id);
        await tournament.save();
      }
    }

    // Populate the saved match for response
    await scheduledMatch.populate('participatingTeams.team', 'teamName teamTag logo');
    await scheduledMatch.populate('tournament', 'tournamentName');

    // Send notification to all participating teams' players
    const teams = await Team.find({ _id: { $in: uniqueTeamIds } }).populate('players', 'username');
    const allPlayers = teams.flatMap(team => team.players);

    for (const player of allPlayers) {
      const ChatMessage = (await import('../models/chat.model.js')).default;
      const notificationMessage = new ChatMessage({
        senderId: 'system',
        receiverId: player._id.toString(),
        message: `Match scheduled: ${matchData.matchName} in ${tournament.tournamentName} - ${matchData.tournamentPhase} at ${new Date(matchData.scheduledStartTime).toLocaleString()}`,
        messageType: 'match_scheduled',
        tournamentId: matchData.tournament,
        matchId: scheduledMatch._id,
        timestamp: new Date()
      });

      await notificationMessage.save();

      // Emit to player via socket
      if (global.io) {
        global.io.to(player._id.toString()).emit('receiveMessage', {
          _id: notificationMessage._id,
          senderId: 'system',
          receiverId: player._id.toString(),
          message: notificationMessage.message,
          messageType: 'match_scheduled',
          tournamentId: matchData.tournament,
          matchId: scheduledMatch._id,
          timestamp: new Date()
        });
      }
    }

    res.status(201).json(scheduledMatch);

  } catch (error) {
    console.error('Error scheduling match:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: 'Validation error', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to schedule match', details: error.message });
    }
  }
});

// Delete a scheduled match
router.delete('/scheduled/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Only allow deletion of scheduled matches
    if (match.status !== 'scheduled') {
      return res.status(400).json({ error: 'Only scheduled matches can be deleted' });
    }

    await Match.findByIdAndDelete(matchId);
    res.json({ message: 'Scheduled match deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled match:', error);
    res.status(500).json({ error: 'Failed to delete scheduled match' });
  }
});

// Get all matches for a tournament
router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { 
      status, 
      phase, 
      limit = 20,  // Reduced from 50
      offset = 0,  // NEW: For pagination
      mobile = 'false' // NEW: Mobile flag
    } = req.query;

    const filter = { tournament: tournamentId };
    if (status) filter.status = status;
    if (phase) filter.tournamentPhase = phase;

    // Count total matches for pagination
    const totalMatches = await Match.countDocuments(filter);

    let matchQuery = Match.find(filter)
      .sort({ scheduledStartTime: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    // Conditional population based on mobile
    if (mobile === 'true') {
      matchQuery = matchQuery
        .populate({
          path: 'participatingTeams.team',
          select: 'teamName teamTag logo' // Only essential fields
        })
        .populate('tournament', 'tournamentName shortName');
    } else {
      matchQuery = matchQuery
        .populate({
          path: 'participatingTeams.team',
          select: 'teamName teamTag logo'
        })
        .populate('tournament', 'tournamentName shortName');
    }

    const matches = await matchQuery.lean();

    res.json({ 
      matches,
      pagination: {
        total: totalMatches,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < totalMatches
      }
    });
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

    // Keep match status as in_progress to allow further editing
    match.status = 'in_progress';

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
          maps: { $push: '$map' }
        }
      }
    ]);

    const result = stats[0] || {
      totalMatches: 0,
      completedMatches: 0,
      totalKills: 0,
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

// Get recent matches for a specific player
router.get('/player/:playerId/recent', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { limit = 10 } = req.query;

    const matches = await Match.find({
      'participatingTeams.players.player': playerId,
      status: 'completed'
    })
      .sort({ actualEndTime: -1 })
      .limit(parseInt(limit))
      .populate('tournament', 'tournamentName shortName')
      .lean();

    const formattedMatches = matches.map(match => {
      // Find the team this player was on
      const playerTeam = match.participatingTeams.find(team =>
        team.players?.some(p => p.player.toString() === playerId)
      );

      return {
        _id: match._id,
        tournament: match.tournament,
        map: match.map,
        date: match.actualEndTime || match.scheduledStartTime,
        position: playerTeam?.finalPosition,
        kills: playerTeam?.kills?.total || 0,
        points: playerTeam?.points?.totalPoints || 0,
        chickenDinner: playerTeam?.chickenDinner || false
      };
    });

    res.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Error fetching player matches:', error);
    res.status(500).json({ error: 'Failed to fetch player matches' });
  }
});

// Share room credentials for a match
router.post('/:matchId/share-credentials', async (req, res) => {
  try {
    const { matchId } = req.params;
    const { roomId, password } = req.body;

    if (!roomId || !password) {
      return res.status(400).json({ error: 'Room ID and password are required' });
    }

    const match = await Match.findById(matchId).populate('tournament', 'tournamentName logo');
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Update room credentials
    match.roomCredentials = {
      roomId: roomId.trim(),
      password: password.trim(),
      sharedAt: new Date(),
      sharedBy: req.user?.id || null
    };

    await match.save();

    // Send notifications to all participating teams' players
    const teams = await Team.find({ _id: { $in: match.participatingTeams.map(pt => pt.team) } })
      .populate('players', 'username');
    const allPlayers = teams.flatMap(team => team.players);

    const notificationPromises = allPlayers.map(async (player) => {
      const ChatMessage = (await import('../models/chat.model.js')).default;
      const tournamentName = match.tournament?.tournamentName || 'Unknown Tournament';
      const tournamentPhase = match.tournamentPhase || 'Unknown Phase';
      const matchNumber = match.matchNumber || 'Unknown';

      const notificationMessage = new ChatMessage({
        senderId: 'system',
        receiverId: player._id.toString(),
        message: `Room credentials for Match #${matchNumber} (${tournamentPhase}) in ${tournamentName}: Room ID: ${roomId}, Password: ${password}`,
        messageType: 'system',
        tournamentId: match.tournament?._id || match.tournament,
        matchId: match._id,
        timestamp: new Date(),
        tournamentLogo: match.tournament?.logo
      });

      await notificationMessage.save();

      // Emit to player via socket
      if (global.io) {
        global.io.to(player._id.toString()).emit('receiveMessage', {
          _id: notificationMessage._id,
          senderId: 'system',
          receiverId: player._id.toString(),
          message: notificationMessage.message,
          messageType: 'system',
          tournamentId: match.tournament,
          matchId: match._id,
          timestamp: new Date()
        });
      }
    });

    await Promise.all(notificationPromises);

    res.json({
      message: 'Room credentials shared successfully',
      roomCredentials: match.roomCredentials
    });
  } catch (error) {
    console.error('Error sharing room credentials:', error);
    res.status(500).json({ error: 'Failed to share room credentials' });
  }
});

// Get recent 3 matches for the logged-in player
router.get('/recent3matches', auth, async (req, res) => {
  try {
    console.log('🔍 Recent matches endpoint hit');
    console.log('User from auth middleware:', req.user);
    
    // FIX: JWT payload uses 'id', not '_id'
    if (!req.user || !req.user.id) {
      console.log('❌ No user found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const playerId = req.user.id; // Changed from req.user._id to req.user.id
    console.log('✅ Player ID:', playerId);

    // OPTIMIZATION 1: Use lean() and minimal field selection
    const playerTeams = await Team.find({ players: playerId })
      .select('_id teamName')
      .lean();
    
    console.log('📋 Player teams found:', playerTeams.length);
    console.log('Teams:', playerTeams);
    
    const teamIds = playerTeams.map(team => team._id);

    // Early return if player has no teams
    if (teamIds.length === 0) {
      console.log('⚠️ Player has no teams - returning empty array');
      return res.json({ matches: [] });
    }
    
    console.log('🎯 Searching for matches with team IDs:', teamIds);

    // OPTIMIZATION 2: Single optimized query with projection
    const matches = await Match.find({
      'participatingTeams.team': { $in: teamIds },
      status: 'completed'
    })
      .select('participatingTeams map actualEndTime scheduledStartTime tournament')
      .sort({ actualEndTime: -1 })
      .limit(3)
      .populate('participatingTeams.team', 'teamName')
      .populate('tournament', 'tournamentName')
      .lean()
      .exec();

    console.log('🎮 Matches found:', matches.length);
    if (matches.length > 0) {
      console.log('Match sample:', JSON.stringify(matches[0], null, 2));
    }

    // OPTIMIZATION 3: Efficient data transformation
    const teamIdStrings = new Set(teamIds.map(id => id.toString()));
    
    const formattedMatches = matches.map(match => {
      // Find player's team using Set for O(1) lookup
      const playerTeam = match.participatingTeams.find(team =>
        team.team && teamIdStrings.has(team.team._id.toString())
      );
      
      if (!playerTeam) {
        console.log('⚠️ Player team not found in match:', match._id);
        return null; // Skip if player's team not found
      }

      const otherTeams = match.participatingTeams.filter(
        team => team.team && !teamIdStrings.has(team.team._id.toString())
      );

      // Calculate score efficiently
      let score;
      if (playerTeam.finalPosition === 1) {
        score = 'Won #1';
      } else {
        const playerKills = playerTeam.kills?.total || 0;
        const otherKills = otherTeams.reduce((sum, t) => sum + (t.kills?.total || 0), 0);
        score = `${playerKills} - ${otherKills}`;
      }

      // Format time once
      const date = match.actualEndTime || match.scheduledStartTime;
      const time = date 
        ? new Date(date).toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        : 'Recent';

      return {
        _id: match._id,
        time,
        map: match.map || 'Unknown',
        team1: playerTeam.team?.teamName || 'Your Team',
        score,
        team2: otherTeams[0]?.team?.teamName || 'Others'
      };
    }).filter(Boolean); // Remove any null entries

    console.log('✅ Returning formatted matches:', formattedMatches.length);
    console.log('Formatted data:', JSON.stringify(formattedMatches, null, 2));
    
    res.json({ matches: formattedMatches });
    
  } catch (error) {
    console.error('❌ Error fetching recent matches:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch recent matches',
      details: error.message 
    });
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
