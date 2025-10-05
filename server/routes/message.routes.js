import express from "express";
import ChatMessage from "../models/chat.model.js";
import TeamInvitation from "../models/teamInvitation.model.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get all users who have chat messages with the current user
router.get("/users/with-chats", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all unique users who have exchanged messages with the current user
    const sentMessages = await ChatMessage.find({ senderId: userId }).distinct('receiverId');
    const receivedMessages = await ChatMessage.find({ receiverId: userId }).distinct('senderId');

    const chatUserIds = [...new Set([...sentMessages, ...receivedMessages])];

    // Fetch user details for these IDs
    const Player = (await import('../models/player.model.js')).default;
    const chatUsers = await Player.find({ _id: { $in: chatUserIds } })
      .select('username profilePicture realName primaryGame aegisRating')
      .sort({ username: 1 });

    res.json({ users: chatUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get chat messages between two users
router.get("/:receiverId", auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiverId;

    const messages = await ChatMessage.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ timestamp: 1 })
      .limit(50); // Limit to last 50 messages for performance

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get team invitations for chat display
router.get("/invitations/for-chat", auth, async (req, res) => {
  try {
    const invitations = await TeamInvitation.find({
      toPlayer: req.user.id,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    })
      .populate('team', 'teamName teamTag logo primaryGame region players')
      .populate('fromPlayer', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(10); // Show last 10 invitations

    res.json({ invitations });
  } catch (error) {
    console.error('Error fetching chat invitations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Accept team invitation from chat
router.post("/invitations/:id/accept", auth, async (req, res) => {
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


    const Player = (await import('../models/player.model.js')).default;
    const Team = (await import('../models/team.model.js')).default;

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

    res.json({
      message: 'Team invitation accepted successfully',
      team
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ message: 'Server error accepting invitation' });
  }
});

// Decline team invitation from chat
router.post("/invitations/:id/decline", auth, async (req, res) => {
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

    res.json({ message: 'Invitation declined' });
  } catch (error) {
    console.error('Error declining invitation:', error);
    res.status(500).json({ message: 'Server error declining invitation' });
  }
});

// Send tournament reference message to team captain
router.post("/tournament-reference/:tournamentId", auth, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { captainId } = req.body;

    if (!captainId) {
      return res.status(400).json({ message: 'Captain ID is required' });
    }

    // Verify the tournament exists
    const Tournament = (await import('../models/tournament.model.js')).default;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Create tournament reference message
    const message = new ChatMessage({
      senderId: req.user.id,
      receiverId: captainId,
      message: `Check out this tournament: ${tournament.tournamentName}`,
      messageType: 'tournament_reference',
      tournamentId: tournamentId,
    });

    await message.save();

    res.json({ message: 'Tournament reference sent to captain', chatMessage: message });
  } catch (error) {
    console.error('Error sending tournament reference:', error);
    res.status(500).json({ message: 'Server error sending tournament reference' });
  }
});

export default router;
