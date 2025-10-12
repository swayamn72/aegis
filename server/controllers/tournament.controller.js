import Tournament from '../models/tournament.model.js';
import TeamInvitation from '../models/teamInvitation.model.js';
import Team from '../models/team.model.js';
import Player from '../models/player.model.js';
import emailService from '../utils/emailService.js';
import TournamentTeamInvite from '../models/tournamentTeamInvite.model.js';

// Send invite to team for a specific phase
export const sendTeamInvite = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { teamId, phase } = req.body;
    const organizerId = req.user.id;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // Calculate invite expiry (2 hours before phase start)
    const phaseObj = tournament.phases.find(p => p.name === phase);
    const phaseStart = phaseObj?.startDate || tournament.startDate;
    const expiry = new Date(phaseStart).getTime() - 2 * 60 * 60 * 1000;

    // Create tournament team invite
    const invite = new TournamentTeamInvite({
      tournament: tournamentId,
      team: teamId,
      phase,
      organizer: organizerId,
      status: 'pending',
      message: `You are invited to join phase '${phase}' of tournament '${tournament.tournamentName}'.`,
      expiresAt: new Date(expiry)
    });
    await invite.save();


    // Send chat message to team captain
    try {
      const ChatMessage = (await import('../models/chat.model.js')).default;
      const captainId = team.captain.toString();
      const savedMessage = await ChatMessage.create({
        senderId: organizerId,
        receiverId: captainId,
        message: invite.message,
        messageType: 'tournament_invite',
        invitationId: invite._id,
        invitationStatus: invite.status,
        tournamentId: tournamentId,
        timestamp: new Date(),
        // Optionally include tournament name for UI
        tournamentName: tournament.tournamentName
      });
      // Emit to receiver
      const msgToEmit = {
        _id: savedMessage._id,
        senderId: organizerId,
        receiverId: captainId,
        message: invite.message,
        messageType: 'tournament_invite',
        invitationId: invite._id,
        invitationStatus: invite.status,
        tournamentId: tournamentId,
        timestamp: new Date(),
        tournamentName: tournament.tournamentName
      };
      global.io.to(captainId).emit('receiveMessage', msgToEmit);
      // Also emit to sender (organizer) so they see it in their chat
      global.io.to(organizerId).emit('receiveMessage', msgToEmit);
    } catch (chatErr) {
      console.error('Error sending tournament invite chat message:', chatErr);
    }

    // Send email to team captain
    const captain = await Player.findById(team.captain).select('email');
    if (captain && captain.email) {
      await emailService.sendEmail(
        captain.email,
        `Tournament Invite: ${tournament.tournamentName}`,
        invite.message
      );
    }

    res.json({ success: true, invite });
  } catch (err) {
    console.error('Error sending invite:', err);
    res.status(500).json({ error: 'Failed to send invite' });
  }
};

export const addTeamToPhase = async (req, res) => {
  try {
    const { id: tournamentId, phase } = req.params;
    const { teamId } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check authorization (admin or organizer)
    if (tournament.organizer.toString() !== req.user.id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find phase by name
    const phaseIndex = tournament.phases.findIndex(p => p.name === phase);
    if (phaseIndex === -1) {
      return res.status(404).json({ message: 'Phase not found' });
    }

    const targetPhase = tournament.phases[phaseIndex];
    targetPhase.teams = targetPhase.teams || [];

    // Check if team already in phase
    if (targetPhase.teams.includes(teamId)) {
      return res.status(400).json({ message: 'Team already in this phase' });
    }

    // Add team to phase
    targetPhase.teams.push(teamId);

    // Update participatingTeam's currentStage
    const participatingTeamIndex = tournament.participatingTeams.findIndex(pt => pt.team.toString() === teamId);
    if (participatingTeamIndex !== -1) {
      tournament.participatingTeams[participatingTeamIndex].currentStage = phase;
    }

    await tournament.save();

    res.json({ tournament });
  } catch (error) {
    console.error('Error adding team to phase:', error);
    res.status(500).json({ message: 'Failed to add team to phase' });
  }
};

export const removeTeamFromPhase = async (req, res) => {
  try {
    const { id: tournamentId, phase, teamId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check authorization
    if (tournament.organizer.toString() !== req.user.id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find phase
    const phaseIndex = tournament.phases.findIndex(p => p.name === phase);
    if (phaseIndex === -1) {
      return res.status(404).json({ message: 'Phase not found' });
    }

    const targetPhase = tournament.phases[phaseIndex];
    targetPhase.teams = targetPhase.teams || [];

    // Remove team from phase
    const teamIndexInPhase = targetPhase.teams.findIndex(t => t.toString() === teamId);
    if (teamIndexInPhase === -1) {
      return res.status(400).json({ message: 'Team not in this phase' });
    }
    targetPhase.teams.splice(teamIndexInPhase, 1);

    // Update participatingTeam's currentStage to empty
    const participatingTeamIndex = tournament.participatingTeams.findIndex(pt => pt.team.toString() === teamId);
    if (participatingTeamIndex !== -1) {
      tournament.participatingTeams[participatingTeamIndex].currentStage = '';
    }

    await tournament.save();

    res.json({ tournament });
  } catch (error) {
    console.error('Error removing team from phase:', error);
    res.status(500).json({ message: 'Failed to remove team from phase' });
  }
};

// Accept invite
export const acceptTeamInvite = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const invite = await TournamentTeamInvite.findById(inviteId).populate('team');
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (invite.status !== 'pending') return res.status(400).json({ error: 'Invite not pending' });
    if (invite.expiresAt < new Date()) return res.status(400).json({ error: 'Invite expired' });

    // Check if the user is the captain of the team
    if (invite.team.captain.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Only the team captain can accept this invite' });
    }

    invite.status = 'accepted';
    await invite.save();

    // Add team to tournament phase
    const tournament = await Tournament.findById(invite.tournament);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    const phaseIdx = tournament.phases.findIndex(p => p.name === invite.phase);
    if (phaseIdx === -1) return res.status(404).json({ error: 'Phase not found' });
    tournament.phases[phaseIdx].groups = tournament.phases[phaseIdx].groups || [];
    // Add team to first group (or create one if none)
    if (tournament.phases[phaseIdx].groups.length === 0) {
      tournament.phases[phaseIdx].groups.push({ name: 'Group A', teams: [] });
    }
    tournament.phases[phaseIdx].groups[0].teams.push(invite.team);
    await tournament.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Error accepting invite:', err);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
};
