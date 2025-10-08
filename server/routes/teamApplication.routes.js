// server/routes/teamApplication.routes.js
import express from 'express';
import TeamApplication from '../models/teamApplication.model.js';
import TryoutChat from '../models/tryoutChat.model.js';
import Team from '../models/team.model.js';
import Player from '../models/player.model.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/team-applications/recruiting-teams - Get teams that are recruiting
router.get('/recruiting-teams', async (req, res) => {
  try {
    const { game, region, role, limit = 20, page = 1 } = req.query;

    const filter = {
      lookingForPlayers: true,
      status: 'active',
      profileVisibility: 'public',
    };

    if (game) filter.primaryGame = game;
    if (region) filter.region = region;
    if (role) filter.openRoles = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const teams = await Team.find(filter)
      .populate('captain', 'username profilePicture inGameName aegisRating')
      .populate('players', 'username profilePicture')
      .sort({ aegisRating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('teamName teamTag logo primaryGame region openRoles aegisRating statistics bio establishedDate totalEarnings');

    const total = await Team.countDocuments(filter);

    res.json({
      teams,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Error fetching recruiting teams:', error);
    res.status(500).json({ error: 'Failed to fetch recruiting teams' });
  }
});

// GET /api/team-applications/looking-for-team - Get players looking for teams
router.get('/looking-for-team', async (req, res) => {
  try {
    const { game, region, role, limit = 20, page = 1 } = req.query;

    const filter = {
      teamStatus: 'looking for a team',
      profileVisibility: 'public',
      team: null,
    };

    if (game) filter.primaryGame = game;
    if (role) filter.inGameRole = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const players = await Player.find(filter)
      .sort({ aegisRating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('username inGameName realName profilePicture primaryGame inGameRole aegisRating statistics country availability verified');

    const total = await Player.countDocuments(filter);

    res.json({
      players,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    });
  } catch (error) {
    console.error('Error fetching LFT players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// POST /api/team-applications/apply/:teamId - Apply to a team
router.post('/apply/:teamId', auth, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { message, appliedRoles } = req.body;
    const playerId = req.user.id;

    // Check if player already has a team
    const player = await Player.findById(playerId);
    if (player.team) {
      return res.status(400).json({ error: 'You are already in a team' });
    }

    // Check if team exists and is recruiting
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (!team.lookingForPlayers) {
      return res.status(400).json({ error: 'Team is not currently recruiting' });
    }

    // Check if team is full
    if (team.players.length >= 5) {
      return res.status(400).json({ error: 'Team roster is full' });
    }

    // Check if player already applied
    const existingApplication = await TeamApplication.findOne({
      team: teamId,
      player: playerId,
      status: { $in: ['pending', 'in_tryout'] },
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this team' });
    }

    // Create application
    const application = new TeamApplication({
      team: teamId,
      player: playerId,
      message,
      appliedRoles,
      status: 'pending',
    });

    await application.save();

    // Populate for response
    await application.populate([
      { path: 'player', select: 'username inGameName profilePicture aegisRating primaryGame inGameRole' },
      { path: 'team', select: 'teamName teamTag logo' },
    ]);

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// GET /api/team-applications/my-applications - Get player's applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await TeamApplication.find({
      player: req.user.id,
    })
      .populate('team', 'teamName teamTag logo captain players')
      .populate({
        path: 'team',
        populate: {
          path: 'captain',
          select: 'username profilePicture',
        },
      })
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET /api/team-applications/team/:teamId - Get applications for a team (captain only)
router.get('/team/:teamId', auth, async (req, res) => {
  try {
    const { teamId } = req.params;

    // Verify user is team captain
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (!team.captain) {
      console.error('Team captain is undefined for team:', teamId);
      return res.status(500).json({ error: 'Team captain information missing' });
    }

    if (!req.user || !req.user.id) {
      console.error('User or user.id is undefined in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (team.captain.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Only team captain can view applications' });
    }

    const applications = await TeamApplication.find({
      team: teamId,
      status: { $in: ['pending', 'in_tryout'] },
    })
      .populate('player', 'username inGameName realName profilePicture aegisRating primaryGame inGameRole statistics availability')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Error fetching team applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// POST /api/team-applications/:applicationId/start-tryout - Start tryout (captain only)
router.post('/:applicationId/start-tryout', auth, async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await TeamApplication.findById(applicationId)
      .populate('team')
      .populate('player', 'username profilePicture');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify user is team captain
    if (application.team.captain.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Only team captain can start tryouts' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Application is not in pending status' });
    }

    // Create tryout chat
    const tryoutChat = new TryoutChat({
      application: application._id,
      team: application.team._id,
      applicant: application.player._id,
      participants: [...application.team.players, application.player._id],
      messages: [
        {
          sender: req.user.id,
          message: `Tryout started for ${application.player.username}. Welcome to the team tryout!`,
          messageType: 'system',
        },
      ],
      status: 'active',
    });

    await tryoutChat.save();

    // Update application
    application.status = 'in_tryout';
    application.tryoutChatId = tryoutChat._id;
    application.tryoutStartedAt = new Date();
    await application.save();

    await tryoutChat.populate('participants', 'username profilePicture inGameName');

    res.json({
      message: 'Tryout started successfully',
      application,
      tryoutChat,
    });
  } catch (error) {
    console.error('Error starting tryout:', error);
    res.status(500).json({ error: 'Failed to start tryout' });
  }
});

// POST /api/team-applications/:applicationId/accept - Accept player (captain only)
router.post('/:applicationId/accept', auth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { notes } = req.body;

    const application = await TeamApplication.findById(applicationId)
      .populate('team')
      .populate('player');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify user is team captain
    if (application.team.captain.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Only team captain can accept players' });
    }

    if (application.status !== 'in_tryout') {
      return res.status(400).json({ error: 'Player must be in tryout to be accepted' });
    }

    // Check if team is full
    if (application.team.players.length >= 5) {
      return res.status(400).json({ error: 'Team roster is full' });
    }

    // Add player to team
    application.team.players.push(application.player._id);
    await application.team.save();

    // Update player
    await Player.findByIdAndUpdate(application.player._id, {
      team: application.team._id,
      teamStatus: 'in a team',
    });

    // Update application
    application.status = 'accepted';
    application.captainNotes = notes || '';
    application.tryoutEndedAt = new Date();
    await application.save();

    // Close tryout chat
    if (application.tryoutChatId) {
      await TryoutChat.findByIdAndUpdate(application.tryoutChatId, {
        status: 'completed',
        endedAt: new Date(),
        $push: {
          messages: {
            sender: req.user.id,
            message: `${application.player.username} has been accepted to the team! Welcome aboard! 🎉`,
            messageType: 'system',
          },
        },
      });
    }

    res.json({
      message: 'Player accepted successfully',
      application,
    });
  } catch (error) {
    console.error('Error accepting player:', error);
    res.status(500).json({ error: 'Failed to accept player' });
  }
});

// POST /api/team-applications/:applicationId/reject - Reject player (captain only)
router.post('/:applicationId/reject', auth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;

    const application = await TeamApplication.findById(applicationId)
      .populate('team')
      .populate('player', 'username');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify user is team captain
    if (application.team.captain.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Only team captain can reject players' });
    }

    if (!['pending', 'in_tryout'].includes(application.status)) {
      return res.status(400).json({ error: 'Cannot reject application in current status' });
    }

    // Update application
    application.status = 'rejected';
    application.rejectionReason = reason || '';
    application.tryoutEndedAt = new Date();
    await application.save();

    // Close tryout chat if exists
    if (application.tryoutChatId) {
      await TryoutChat.findByIdAndUpdate(application.tryoutChatId, {
        status: 'completed',
        endedAt: new Date(),
        $push: {
          messages: {
            sender: req.user.id,
            message: `Tryout has ended. Thank you for your time, ${application.player.username}.`,
            messageType: 'system',
          },
        },
      });
    }

    res.json({
      message: 'Application rejected',
      application,
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ error: 'Failed to reject application' });
  }
});

// DELETE /api/team-applications/:applicationId - Withdraw application
router.delete('/:applicationId', auth, async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await TeamApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify user is the applicant
    if (application.player.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'You can only withdraw your own applications' });
    }

    if (application.status === 'in_tryout') {
      return res.status(400).json({ error: 'Cannot withdraw during active tryout' });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
});

export default router;