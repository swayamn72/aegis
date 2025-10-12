import express from 'express';
import Team from '../models/team.model.js';
import Player from '../models/player.model.js';
import Match from '../models/match.model.js';
import Tournament from '../models/tournament.model.js';
import TeamInvitation from '../models/teamInvitation.model.js';
import ChatMessage from '../models/chat.model.js';
import auth from '../middleware/auth.js';
import { sendEmail, emailTemplates } from '../utils/emailService.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

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
      .populate('organization', 'orgName logo description')
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

// GET /api/teams/:id - Fetch a single team by ID with recent matches and tournaments
router.get('/:id', auth, async (req, res) => {
  try {
    const teamId = req.params.id.trim();
    const team = await Team.findById(teamId)
      .populate({
        path: 'captain',
        select: 'username profilePicture primaryGame inGameName realName age country aegisRating statistics inGameRole discordTag twitch youtube twitter verified'
      })
      .populate({
        path: 'players',
        select: 'username profilePicture primaryGame inGameName realName age country aegisRating statistics inGameRole discordTag verified'
      })
      .populate('organization', 'orgName logo description website establishedDate')
      .select('-__v');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.profileVisibility === 'private') {
      // Allow access if user is captain or player in the team
      if (!team.players.includes(req.user.id) && team.captain.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'This team profile is private' });
      }
    }

    // Fetch recent matches
    const recentMatches = await Match.find({
      'participatingTeams.team': team._id,
      status: 'completed'
    })
      .sort({ actualEndTime: -1 })
      .limit(5)
      .populate('tournament', 'tournamentName shortName')
      .select('matchNumber matchType map actualEndTime participatingTeams tournament')
      .lean();

    // Format match data
    const formattedMatches = recentMatches.map(match => {
      const teamData = match.participatingTeams.find(
        pt => pt.team.toString() === team._id.toString()
      );
      return {
        _id: match._id,
        matchNumber: match.matchNumber,
        matchType: match.matchType,
        map: match.map,
        date: match.actualEndTime,
        tournament: match.tournament,
        position: teamData?.finalPosition || null,
        kills: teamData?.kills?.total || 0,
        points: teamData?.points?.totalPoints || 0,
        chickenDinner: teamData?.chickenDinner || false
      };
    });

    // Fetch tournaments the team has participated in
    const tournaments = await Tournament.find({
      'participatingTeams.team': team._id
    })
      .sort({ startDate: -1 })
      .limit(10)
      .select('tournamentName shortName startDate endDate status prizePool media tier')
      .lean();

    // Separate ongoing and past tournaments
    const now = new Date();
    const ongoingTournaments = tournaments.filter(t =>
      t.status !== 'completed' && t.status !== 'cancelled' && t.endDate >= now
    );
    const recentTournaments = tournaments.filter(t =>
      t.status === 'completed' || t.endDate < now
    ).slice(0, 5);

    res.json({
      team,
      recentMatches: formattedMatches,
      ongoingTournaments,
      recentTournaments
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Server error fetching team' });
  }
});

// GET /api/teams/user/my-teams - Fetch teams the current user is part of
router.get('/user/my-teams', auth, async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { captain: req.user.id },
        { players: req.user.id }
      ]
    })
      .populate('captain', 'username profilePicture primaryGame')
      .populate('players', 'username profilePicture primaryGame')
      .populate('organization', 'orgName logo')
      .sort({ establishedDate: -1 })
      .select('-__v');

    res.json({ teams });
  } catch (error) {
    console.error('Error fetching user teams:', error);
    res.status(500).json({ message: 'Server error fetching teams' });
  }
});

// POST /api/teams - Create a new team
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

    const existingTeamName = await Team.findOne({ teamName });
    if (existingTeamName) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    if (teamTag) {
      const existingTeamTag = await Team.findOne({ teamTag: teamTag.toUpperCase() });
      if (existingTeamTag) {
        return res.status(400).json({ message: 'Team tag already exists' });
      }
    }

    const existingCaptaincy = await Team.findOne({ captain: req.user.id });
    if (existingCaptaincy) {
      return res.status(400).json({ message: 'You are already a captain of another team' });
    }

    const newTeam = new Team({
      teamName,
      teamTag: teamTag ? teamTag.toUpperCase() : undefined,
      primaryGame: primaryGame || 'BGMI',
      region: region || 'India',
      bio,
      logo,
      captain: req.user.id,
      players: [req.user.id]
    });

    await newTeam.save();

    await Player.findByIdAndUpdate(req.user.id, {
      team: newTeam._id,
      teamStatus: 'in a team'
    });

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

// POST /api/teams/:id/invite - Send team invitation
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const { playerId, message } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Defensive check for captain and user.id
    if (!team.captain || !req.user.id) {
      return res.status(400).json({ message: 'Invalid team captain or user ID' });
    }

    if (team.captain.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only team captain can invite players' });
    }

    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    if (player.team) {
      return res.status(400).json({ message: 'Player is already in a team' });
    }

    if (team.players.length >= 5) {
      return res.status(400).json({ message: 'Team is already full (max 5 players)' });
    }

    // Check for existing pending invitation
    const existingInvitation = await TeamInvitation.findOne({
      team: team._id,
      toPlayer: playerId,
      status: 'pending'
    });

    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already sent to this player' });
    }

    const invitation = new TeamInvitation({
      team: team._id,
      fromPlayer: req.user.id,
      toPlayer: playerId,
      message: message || `Join ${team.teamName}!`
    });

    await invitation.save();

    // Create chat message for invitation
    const chatMessage = new ChatMessage({
      senderId: req.user.id,
      receiverId: playerId,
      message: message || `You have been invited to join the team ${team.teamName}.`,
      messageType: 'invitation',
      invitationId: invitation._id
    });

    await chatMessage.save();
    console.log('Chat message created for team invitation:', chatMessage);

    // Send email notification to invited player
    // In the POST /api/teams/:id/invite route, update the email section:

    // Send email notification to invited player
    try {
      if (player.email) {
        const playerName = player.username || 'Player';
        const teamName = team.teamName || 'Your Team';
        const { subject, html } = emailTemplates.teamInvitation(playerName, teamName, '', '');

        await sendEmail(player.email, subject, html);
      }
    } catch (emailError) {
      console.error('Error sending team invitation email:', emailError.message);
      // Don't fail the invitation if email fails
    }

    res.status(201).json({
      message: 'Team invitation sent successfully',
      invitation
    });
  } catch (error) {
    console.error('Error sending team invitation:', error);
    res.status(500).json({ message: 'Server error sending invitation' });
  }
});

// GET /api/teams/invitations/received - Get received team invitations
router.get('/invitations/received', auth, async (req, res) => {
  try {
    const invitations = await TeamInvitation.find({
      toPlayer: req.user.id,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    })
      .populate('team', 'teamName teamTag logo primaryGame region players')
      .populate('fromPlayer', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({ invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ message: 'Server error fetching invitations' });
  }
});

// POST /api/teams/invitations/:id/accept - Accept team invitation
router.post('/invitations/:id/accept', auth, async (req, res) => {
  try {
    const invitation = await TeamInvitation.findById(req.params.id)
      .populate('team');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.toPlayer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'This invitation is not for you' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation is no longer valid' });
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'cancelled';
      await invitation.save();
      return res.status(400).json({ message: 'Invitation has expired' });
    }

    const player = await Player.findById(req.user.id);
    if (player.team) {
      return res.status(400).json({ message: 'You are already in a team' });
    }

    const team = await Team.findById(invitation.team._id);
    if (team.players.length >= 5) {
      return res.status(400).json({ message: 'Team is already full' });
    }

    // Add player to team
    team.players.push(req.user.id);
    await team.save();

    // Update player
    await Player.findByIdAndUpdate(req.user.id, {
      team: team._id,
      teamStatus: 'in a team'
    });

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // Update related chat message invitationStatus
    await ChatMessage.updateMany(
      { invitationId: invitation._id },
      { $set: { invitationStatus: 'accepted' } }
    );

    res.json({
      message: 'Team invitation accepted successfully',
      team
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ message: 'Server error accepting invitation' });
  }
});

// POST /api/teams/invitations/:id/decline - Decline team invitation
router.post('/invitations/:id/decline', auth, async (req, res) => {
  try {
    const invitation = await TeamInvitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.toPlayer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'This invitation is not for you' });
    }

    invitation.status = 'declined';
    await invitation.save();

    // Update related chat message invitationStatus
    await ChatMessage.updateMany(
      { invitationId: invitation._id },
      { $set: { invitationStatus: 'declined' } }
    );

    res.json({ message: 'Invitation declined' });
  } catch (error) {
    console.error('Error declining invitation:', error);
    res.status(500).json({ message: 'Server error declining invitation' });
  }
});

// PUT /api/teams/:id - Update team
router.put('/:id', auth, upload.single('logo'), async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.captain.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only team captain can update team details' });
    }

    const updateData = {};

    // Handle file upload for logo
    if (req.file) {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'aegis-team-logos',
            public_id: `team-logo-${req.params.id}-${Date.now()}`,
            transformation: [{ width: 300, height: 300, crop: 'fill' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      updateData.logo = result.secure_url;
    }

    // Handle other form fields (JSON data)
    if (req.body) {
      const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      Object.assign(updateData, bodyData);
    }

    // Remove protected fields
    delete updateData.captain;
    delete updateData.players;

    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('captain', 'username profilePicture primaryGame')
      .populate('players', 'username profilePicture primaryGame')
      .populate('organization', 'orgName logo');

    res.json({
      message: 'Team updated successfully',
      team: updatedTeam
    });
  } catch (error) {
    console.error('Error updating team:', error);
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error updating team' });
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

    const isCapt = team.captain.toString() === req.user.id.toString();
    const isSelf = playerId === req.user.id.toString();

    if (!isCapt && !isSelf) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    if (playerId === team.captain.toString()) {
      return res.status(400).json({ message: 'Cannot remove team captain. Transfer captaincy first.' });
    }

    team.players = team.players.filter(p => p.toString() !== playerId);
    await team.save();

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

    if (team.captain.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only current captain can transfer captaincy' });
    }

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

// DELETE /api/teams/:id - Disband team
router.delete('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.captain.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Only team captain can disband team' });
    }

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

    team.status = 'disbanded';
    await team.save();

    res.json({ message: 'Team disbanded successfully' });
  } catch (error) {
    console.error('Error disbanding team:', error);
    res.status(500).json({ message: 'Server error disbanding team' });
  }
});

// POST /api/teams/available - Get teams available for tournament phase
router.post('/available', auth, async (req, res) => {
  try {
    const { tournamentId, phase } = req.body;

    if (!tournamentId || !phase) {
      return res.status(400).json({
        message: 'Tournament ID and phase are required'
      });
    }

    // Get tournament to check teams that might have pending invites
    const tournament = await Tournament.findById(tournamentId)
      .populate('participatingTeams.team', '_id')
      .select('participatingTeams');

    if (!tournament) {
      return res.status(404).json({
        message: 'Tournament not found'
      });
    }

    // Get teams already in the selected phase
    const teamsInPhase = tournament.participatingTeams
      .filter(pt => pt.currentStage === phase)
      .map(pt => pt.team._id.toString());

    // Get teams that have pending invites for this phase
    const teamsWithPendingInvites = tournament.participatingTeams
      .filter(pt => pt.invites?.some(inv => inv.phase === phase && inv.status === 'pending'))
      .map(pt => pt.team._id.toString());

    // Find all active teams except those in phase or with pending invites
    const availableTeams = await Team.find({
      _id: { $nin: [...new Set([...teamsInPhase, ...teamsWithPendingInvites])] },
      status: 'active',
      profileVisibility: 'public'
    })
      .select('teamName teamTag logo primaryGame region aegisRating players')
      .populate('players', 'username')
      .sort({ aegisRating: -1, teamName: 1 })
      .limit(50);

    res.json({ teams: availableTeams });
  } catch (err) {
    console.error('Error getting available teams:', err);
    res.status(500).json({
      message: 'Error getting available teams'
    });
  }
});

// GET /api/teams/search/:query - Search teams and players
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { game, region, limit = 20, searchType = 'all' } = req.query;

    const results = {};

    // Search teams
    if (searchType === 'all' || searchType === 'teams') {
      const teamFilter = {
        profileVisibility: 'public',
        status: 'active',
        $or: [
          { teamName: { $regex: query, $options: 'i' } },
          { teamTag: { $regex: query, $options: 'i' } }
        ]
      };

      if (game) teamFilter.primaryGame = game;
      if (region) teamFilter.region = region;

      results.teams = await Team.find(teamFilter)
        .populate('captain', 'username profilePicture primaryGame')
        .populate('players', 'username profilePicture primaryGame')
        .sort({ aegisRating: -1 })
        .limit(parseInt(limit))
        .select('teamName teamTag logo primaryGame region aegisRating captain players establishedDate');
    }

    // Search players
    if (searchType === 'all' || searchType === 'players') {
      const playerFilter = {
        profileVisibility: 'public',
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { inGameName: { $regex: query, $options: 'i' } },
          { realName: { $regex: query, $options: 'i' } }
        ]
      };

      if (game) playerFilter.primaryGame = game;

      results.players = await Player.find(playerFilter)
        .populate('team', 'teamName teamTag')
        .sort({ aegisRating: -1 })
        .limit(parseInt(limit))
        .select('username inGameName realName profilePicture primaryGame aegisRating teamStatus team');
    }

    res.json(results);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ message: 'Server error searching' });
  }
});

export default router;