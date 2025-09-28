import express from 'express';
import Team from '../models/team.model.js';
import Player from '../models/player.model.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/teams - Fetch all teams with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      game,
      region,
      status,
      lookingForPlayers,
      search
    } = req.query;

    // Build filter query
    const filter = {
      profileVisibility: 'public'
    };

    if (game) filter.primaryGame = game;
    if (region) filter.region = region;
    if (status) filter.status = status;
    if (lookingForPlayers === 'true') filter.lookingForPlayers = true;
    
    if (search) {
      filter.$or = [
        { teamName: { $regex: search, $options: 'i' } },
        { teamTag: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const teams = await Team.find(filter)
      .populate('captain', 'username profilePicture primaryGame inGameName realName aegisRating statistics.tournamentsPlayed')
      .populate('players', 'username profilePicture primaryGame inGameName realName aegisRating statistics.tournamentsPlayed inGameRole')
      .populate('organization', 'name logo description')
      .sort({ aegisRating: -1, 'statistics.tournamentsPlayed': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Team.countDocuments(filter);

    res.json({
      teams,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + teams.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error fetching teams' });
  }
});

// GET /api/teams/featured - Get featured/top teams
router.get('/featured', async (req, res) => {
  try {
    const { game, limit = 10 } = req.query;
    
    const filter = {
      profileVisibility: 'public',
      status: 'active'
    };
    
    if (game) filter.primaryGame = game;

    const teams = await Team.find(filter)
      .populate('captain', 'username profilePicture primaryGame inGameName aegisRating')
      .populate('players', 'username profilePicture primaryGame inGameName aegisRating inGameRole')
      .sort({ 
        aegisRating: -1, 
        totalEarnings: -1,
        'statistics.tournamentsPlayed': -1 
      })
      .limit(parseInt(limit))
      .select('teamName teamTag logo primaryGame region aegisRating totalEarnings statistics captain players establishedDate');

    res.json({ teams });
  } catch (error) {
    console.error('Error fetching featured teams:', error);
    res.status(500).json({ message: 'Server error fetching featured teams' });
  }
});

// GET /api/teams/looking-for-players - Get teams looking for players
router.get('/looking-for-players', async (req, res) => {
  try {
    const { game, role, limit = 20 } = req.query;
    
    const filter = {
      lookingForPlayers: true,
      status: 'active',
      profileVisibility: 'public'
    };
    
    if (game) filter.primaryGame = game;
    if (role) filter.openRoles = role;

    const teams = await Team.find(filter)
      .populate('captain', 'username profilePicture primaryGame inGameName discordTag')
      .populate('players', 'username profilePicture primaryGame inGameName inGameRole')
      .sort({ aegisRating: -1 })
      .limit(parseInt(limit))
      .select('teamName teamTag logo primaryGame region aegisRating openRoles captain players establishedDate bio');

    res.json({ teams });
  } catch (error) {
    console.error('Error fetching teams looking for players:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/teams/:id - Fetch a single team by ID
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate({
        path: 'captain',
        select: 'username profilePicture primaryGame inGameName realName age country aegisRating statistics inGameRole discordTag twitch youtube twitter',
        populate: {
          path: 'recentPerformance.tournament',
          select: 'tournamentName startDate'
        }
      })
      .populate({
        path: 'players',
        select: 'username profilePicture primaryGame inGameName realName age country aegisRating statistics inGameRole discordTag verified',
        populate: {
          path: 'recentPerformance.tournament',
          select: 'tournamentName startDate'
        }
      })
      .populate('organization', 'name logo description website establishedDate')
      .populate({
        path: 'recentResults.tournament',
        select: 'tournamentName gameTitle startDate media.logo'
      })
      .populate({
        path: 'qualifiedEvents.tournament',
        select: 'tournamentName gameTitle startDate media.logo'
      })
      .select('-__v');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if team profile is private
    if (team.profileVisibility === 'private') {
      return res.status(403).json({ message: 'This team profile is private' });
    }

    res.json({ team });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Server error fetching team' });
  }
});

// GET /api/teams/my-teams - Fetch teams the current user is part of (requires auth)
router.get('/user/my-teams', auth, async (req, res) => {
  try {
    const teams = await Team.find({ 
      $or: [
        { captain: req.user._id },
        { players: req.user._id }
      ]
    })
    .populate('captain', 'username profilePicture primaryGame')
    .populate('players', 'username profilePicture primaryGame')
    .populate('organization', 'name logo')
    .sort({ establishedDate: -1 })
    .select('-__v');

    res.json({ teams });
  } catch (error) {
    console.error('Error fetching user teams:', error);
    res.status(500).json({ message: 'Server error fetching teams' });
  }
});

// POST /api/teams - Create a new team (requires auth)
router.post('/', auth, async (req, res) => {
  try {
    const {
      teamName,
      teamTag,
      primaryGame,
      region,
      bio,
      logo
    } = req.body;

    // Check if team name already exists
    const existingTeamName = await Team.findOne({ teamName });
    if (existingTeamName) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    // Check if team tag already exists
    if (teamTag) {
      const existingTeamTag = await Team.findOne({ teamTag: teamTag.toUpperCase() });
      if (existingTeamTag) {
        return res.status(400).json({ message: 'Team tag already exists' });
      }
    }

    // Check if user is already captain of another team
    const existingCaptaincy = await Team.findOne({ captain: req.user._id });
    if (existingCaptaincy) {
      return res.status(400).json({ message: 'You are already a captain of another team' });
    }

    // Create the team
    const newTeam = new Team({
      teamName,
      teamTag: teamTag ? teamTag.toUpperCase() : undefined,
      primaryGame: primaryGame || 'BGMI',
      region: region || 'India',
      bio,
      logo,
      captain: req.user._id,
      players: [req.user._id] // Captain is also a player
    });

    await newTeam.save();

    // Update the user's team reference
    await Player.findByIdAndUpdate(req.user._id, {
      team: newTeam._id,
      teamStatus: 'in a team'
    });

    // Populate the response
    await newTeam.populate('captain', 'username profilePicture primaryGame');
    await newTeam.populate('players', 'username profilePicture primaryGame');

    res.status(201).json({
      message: 'Team created successfully',
      team: newTeam
    });
  } catch (error) {
    console.error('Error creating team:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Team name or tag already exists' });
    }
    res.status(500).json({ message: 'Server error creating team' });
  }
});

// PUT /api/teams/:id - Update team (requires auth and ownership)
router.put('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the captain
    if (team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team captain can update team details' });
    }

    const updateData = req.body;
    
    // Don't allow updating captain or players through this route
    delete updateData.captain;
    delete updateData.players;

    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate('captain', 'username profilePicture primaryGame')
    .populate('players', 'username profilePicture primaryGame')
    .populate('organization', 'name logo');

    res.json({
      message: 'Team updated successfully',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Server error updating team' });
  }
});

// POST /api/teams/:id/invite - Invite player to team (requires auth and captaincy)
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const { playerId } = req.body;
    
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the captain
    if (team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team captain can invite players' });
    }

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    // Check if player is already in a team
    if (player.team) {
      return res.status(400).json({ message: 'Player is already in a team' });
    }

    // Check if team is full (assuming max 5 players for BGMI)
    if (team.players.length >= 5) {
      return res.status(400).json({ message: 'Team is already full' });
    }

    // Add logic for team invitations (you might want a separate TeamInvitation model)
    // For now, we'll directly add the player
    team.players.push(playerId);
    await team.save();

    // Update player's team reference
    await Player.findByIdAndUpdate(playerId, {
      team: team._id,
      teamStatus: 'in a team'
    });

    await team.populate('players', 'username profilePicture primaryGame');

    res.json({
      message: 'Player added to team successfully',
      team
    });
  } catch (error) {
    console.error('Error inviting player:', error);
    res.status(500).json({ message: 'Server error inviting player' });
  }
});

// DELETE /api/teams/:id/players/:playerId - Remove player from team
router.delete('/:id/players/:playerId', auth, async (req, res) => {
  try {
    const { id: teamId, playerId } = req.params;
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the captain or the player themselves
    const isCapt = team.captain.toString() === req.user._id.toString();
    const isSelf = playerId === req.user._id.toString();
    
    if (!isCapt && !isSelf) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Can't remove the captain
    if (playerId === team.captain.toString()) {
      return res.status(400).json({ message: 'Cannot remove team captain. Transfer captaincy first.' });
    }

    // Remove player from team
    team.players = team.players.filter(p => p.toString() !== playerId);
    await team.save();

    // Update player's team reference
    await Player.findByIdAndUpdate(playerId, {
      $unset: { team: 1 },
      teamStatus: 'looking for a team',
      $push: {
        previousTeams: {
          team: teamId,
          endDate: new Date(),
          reason: isSelf ? 'left' : 'removed'
        }
      }
    });

    res.json({ message: 'Player removed from team successfully' });
  } catch (error) {
    console.error('Error removing player:', error);
    res.status(500).json({ message: 'Server error removing player' });
  }
});

// POST /api/teams/:id/transfer-captaincy - Transfer team captaincy
router.post('/:id/transfer-captaincy', auth, async (req, res) => {
  try {
    const { newCaptainId } = req.body;
    
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the current captain
    if (team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only current captain can transfer captaincy' });
    }

    // Check if new captain is in the team
    if (!team.players.includes(newCaptainId)) {
      return res.status(400).json({ message: 'New captain must be a team member' });
    }

    team.captain = newCaptainId;
    await team.save();

    await team.populate('captain', 'username profilePicture primaryGame');
    await team.populate('players', 'username profilePicture primaryGame');

    res.json({
      message: 'Captaincy transferred successfully',
      team
    });
  } catch (error) {
    console.error('Error transferring captaincy:', error);
    res.status(500).json({ message: 'Server error transferring captaincy' });
  }
});

// DELETE /api/teams/:id - Disband team (requires auth and captaincy)
router.delete('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is the captain
    if (team.captain.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only team captain can disband team' });
    }

    // Update all players' team references
    await Player.updateMany(
      { _id: { $in: team.players } },
      {
        $unset: { team: 1 },
        teamStatus: 'looking for a team',
        $push: {
          previousTeams: {
            team: team._id,
            endDate: new Date(),
            reason: 'team disbanded'
          }
        }
      }
    );

    // Mark team as disbanded instead of deleting
    team.status = 'disbanded';
    await team.save();

    res.json({ message: 'Team disbanded successfully' });
  } catch (error) {
    console.error('Error disbanding team:', error);
    res.status(500).json({ message: 'Server error disbanding team' });
  }
});

// GET /api/teams/search - Search teams
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { game, region, limit = 20 } = req.query;

    const filter = {
      profileVisibility: 'public',
      status: 'active',
      $or: [
        { teamName: { $regex: query, $options: 'i' } },
        { teamTag: { $regex: query, $options: 'i' } }
      ]
    };

    if (game) filter.primaryGame = game;
    if (region) filter.region = region;

    const teams = await Team.find(filter)
      .populate('captain', 'username profilePicture primaryGame')
      .populate('players', 'username profilePicture primaryGame')
      .sort({ aegisRating: -1 })
      .limit(parseInt(limit))
      .select('teamName teamTag logo primaryGame region aegisRating captain players establishedDate');

    res.json({ teams });
  } catch (error) {
    console.error('Error searching teams:', error);
    res.status(500).json({ message: 'Server error searching teams' });
  }
});

export default router;