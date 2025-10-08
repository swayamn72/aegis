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
