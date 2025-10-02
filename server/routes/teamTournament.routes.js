import express from 'express';
import jwt from 'jsonwebtoken';
import Tournament from '../models/tournament.model.js';
import Team from '../models/team.model.js';
import Player from '../models/player.model.js';

const router = express.Router();

// Middleware to verify team captain
const verifyTeamCaptain = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const player = await Player.findById(decoded.id).populate('team');
    if (!player || !player.team) {
      return res.status(403).json({ message: 'Player not in a team' });
    }

    // Check if player is team captain
    const team = player.team;
    if (team.captain.toString() !== player._id.toString()) {
      return res.status(403).json({ message: 'Only team captain can manage tournament invitations' });
    }

    req.player = player;
    req.team = team;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get tournament invitations for current user's team
router.get('/my-team/invitations', verifyTeamCaptain, async (req, res) => {
  try {
    // Find tournaments with pending invitations for this team
    const tournaments = await Tournament.find({
      '_pendingInvitations.team': req.team._id,
      '_pendingInvitations.status': 'pending'
    })
      .populate('organizer.organizationRef', 'orgName logo')
      .select('tournamentName shortName startDate endDate prizePool slots _pendingInvitations media gameTitle region')
      .lean();

    // Filter to only show invitations for this team
    const invitations = tournaments.map(tournament => {
      const invitation = tournament._pendingInvitations.find(
        inv => inv.team.toString() === req.team._id.toString() && inv.status === 'pending'
      );
      
      return {
        _id: invitation._id,
        tournament: {
          _id: tournament._id,
          name: tournament.tournamentName,
          shortName: tournament.shortName,
          startDate: tournament.startDate,
          endDate: tournament.endDate,
          prizePool: tournament.prizePool,
          gameTitle: tournament.gameTitle,
          region: tournament.region,
          media: tournament.media,
          organizer: tournament.organizer
        },
        phase: invitation.phase,
        message: invitation.message,
        invitedAt: invitation.invitedAt,
        status: invitation.status
      };
    });

    res.json({ invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Accept tournament invitation
router.post('/accept-invitation/:tournamentId/:invitationId', verifyTeamCaptain, async (req, res) => {
  try {
    const { tournamentId, invitationId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Find the invitation
    const invitationIndex = tournament._pendingInvitations.findIndex(
      inv => inv._id.toString() === invitationId && inv.team.toString() === req.team._id.toString()
    );

    if (invitationIndex === -1) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const invitation = tournament._pendingInvitations[invitationIndex];

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation already processed' });
    }

    // Check if tournament is full
    if (tournament.participatingTeams.length >= tournament.slots.total) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    // Check if team already registered
    const alreadyRegistered = tournament.participatingTeams.some(
      pt => pt.team.toString() === req.team._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ error: 'Team already registered for this tournament' });
    }

    // Add team to tournament
    tournament.participatingTeams.push({
      team: req.team._id,
      qualifiedThrough: 'invite',
      currentStage: invitation.phase || 'Registered',
      totalTournamentPoints: 0,
      totalTournamentKills: 0
    });

    // Update invitation status
    tournament._pendingInvitations[invitationIndex].status = 'accepted';
    tournament._pendingInvitations[invitationIndex].acceptedAt = new Date();

    await tournament.save();

    res.json({
      message: 'Tournament invitation accepted successfully',
      tournament: {
        _id: tournament._id,
        name: tournament.tournamentName
      }
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Decline tournament invitation
router.post('/decline-invitation/:tournamentId/:invitationId', verifyTeamCaptain, async (req, res) => {
  try {
    const { tournamentId, invitationId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const invitationIndex = tournament._pendingInvitations.findIndex(
      inv => inv._id.toString() === invitationId && inv.team.toString() === req.team._id.toString()
    );

    if (invitationIndex === -1) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Update invitation status
    tournament._pendingInvitations[invitationIndex].status = 'declined';
    tournament._pendingInvitations[invitationIndex].declinedAt = new Date();

    await tournament.save();

    res.json({ message: 'Invitation declined' });
  } catch (error) {
    console.error('Error declining invitation:', error);
    res.status(500).json({ error: 'Failed to decline invitation' });
  }
});

// Get open tournaments for registration
router.get('/open-tournaments', async (req, res) => {
  try {
    const token = req.cookies.token;
    let userTeam = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const player = await Player.findById(decoded.id).populate('team');
        if (player && player.team) {
          userTeam = player.team;
        }
      } catch (err) {
        // User not authenticated, continue without team
      }
    }

    const now = new Date();
    
    // Find tournaments accepting open registrations
    const tournaments = await Tournament.find({
      visibility: 'public',
      status: { $in: ['announced', 'registration_open'] },
      registrationEndDate: { $gte: now },
      'slots.openRegistrations': { $gt: 0 }
    })
      .populate('organizer.organizationRef', 'orgName logo')
      .populate('participatingTeams.team', 'teamName teamTag logo')
      .sort({ startDate: 1 })
      .lean();

    // Filter and enrich tournament data
    const enrichedTournaments = tournaments.map(tournament => {
      const spotsAvailable = tournament.slots.total - tournament.participatingTeams.length;
      const isTeamRegistered = userTeam ? tournament.participatingTeams.some(
        pt => pt.team._id.toString() === userTeam._id.toString()
      ) : false;

      return {
        _id: tournament._id,
        name: tournament.tournamentName,
        shortName: tournament.shortName,
        gameTitle: tournament.gameTitle,
        region: tournament.region,
        tier: tournament.tier,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        registrationEndDate: tournament.registrationEndDate,
        prizePool: tournament.prizePool,
        media: tournament.media,
        organizer: tournament.organizer,
        slots: {
          total: tournament.slots.total,
          filled: tournament.participatingTeams.length,
          available: spotsAvailable
        },
        isTeamRegistered,
        canRegister: !isTeamRegistered && spotsAvailable > 0
      };
    });

    res.json({ tournaments: enrichedTournaments });
  } catch (error) {
    console.error('Error fetching open tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Register team for open tournament
router.post('/register/:tournamentId', verifyTeamCaptain, async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Verify tournament accepts open registrations
    if (tournament.status !== 'registration_open' && tournament.status !== 'announced') {
      return res.status(400).json({ error: 'Tournament registration is closed' });
    }

    // Check registration deadline
    const now = new Date();
    if (tournament.registrationEndDate && now > tournament.registrationEndDate) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    // Check if slots available
    if (tournament.participatingTeams.length >= tournament.slots.total) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    // Check if team already registered
    const alreadyRegistered = tournament.participatingTeams.some(
      pt => pt.team.toString() === req.team._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ error: 'Team already registered for this tournament' });
    }

    // Check game compatibility
    if (tournament.gameTitle !== req.team.primaryGame) {
      return res.status(400).json({ 
        error: `Team primary game (${req.team.primaryGame}) does not match tournament game (${tournament.gameTitle})` 
      });
    }

    // Register team
    tournament.participatingTeams.push({
      team: req.team._id,
      qualifiedThrough: 'open_registration',
      currentStage: 'Registered',
      totalTournamentPoints: 0,
      totalTournamentKills: 0
    });

    await tournament.save();

    res.json({
      message: 'Team registered successfully',
      tournament: {
        _id: tournament._id,
        name: tournament.tournamentName
      }
    });
  } catch (error) {
    console.error('Error registering for tournament:', error);
    res.status(500).json({ error: 'Failed to register for tournament' });
  }
});

// Unregister team from tournament (before tournament starts)
router.post('/unregister/:tournamentId', verifyTeamCaptain, async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if tournament has started
    const now = new Date();
    if (now >= tournament.startDate) {
      return res.status(400).json({ error: 'Cannot unregister after tournament has started' });
    }

    // Find and remove team
    const teamIndex = tournament.participatingTeams.findIndex(
      pt => pt.team.toString() === req.team._id.toString()
    );

    if (teamIndex === -1) {
      return res.status(404).json({ error: 'Team not registered for this tournament' });
    }

    tournament.participatingTeams.splice(teamIndex, 1);
    await tournament.save();

    res.json({ message: 'Team unregistered successfully' });
  } catch (error) {
    console.error('Error unregistering from tournament:', error);
    res.status(500).json({ error: 'Failed to unregister from tournament' });
  }
});

// Get tournaments team is participating in
router.get('/my-team/tournaments', verifyTeamCaptain, async (req, res) => {
  try {
    const tournaments = await Tournament.find({
      'participatingTeams.team': req.team._id,
      visibility: 'public'
    })
      .populate('organizer.organizationRef', 'orgName logo')
      .sort({ startDate: -1 })
      .select('tournamentName shortName startDate endDate status prizePool participatingTeams media gameTitle')
      .lean();

    // Enrich with team-specific data
    const enrichedTournaments = tournaments.map(tournament => {
      const teamParticipation = tournament.participatingTeams.find(
        pt => pt.team.toString() === req.team._id.toString()
      );

      return {
        _id: tournament._id,
        name: tournament.tournamentName,
        shortName: tournament.shortName,
        gameTitle: tournament.gameTitle,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        status: tournament.status,
        prizePool: tournament.prizePool,
        media: tournament.media,
        teamStats: {
          points: teamParticipation?.totalTournamentPoints || 0,
          kills: teamParticipation?.totalTournamentKills || 0,
          currentStage: teamParticipation?.currentStage || 'Unknown',
          qualifiedThrough: teamParticipation?.qualifiedThrough || 'Unknown'
        }
      };
    });

    res.json({ tournaments: enrichedTournaments });
  } catch (error) {
    console.error('Error fetching team tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch team tournaments' });
  }
});

export default router;