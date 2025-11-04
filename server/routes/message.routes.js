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

    // Include 'system' if there are system messages
    const chatUserIds = [...new Set([...sentMessages, ...receivedMessages])];

    // Separate system from actual user IDs
    const actualUserIds = chatUserIds.filter(id => id !== 'system');

    // Fetch user details for these IDs from Player and Organization
    const Player = (await import('../models/player.model.js')).default;
    const Organization = (await import('../models/organization.model.js')).default;

    const players = await Player.find({ _id: { $in: actualUserIds } })
      .select('username profilePicture realName primaryGame aegisRating')
      .sort({ username: 1 })
      .lean();

    const organizations = await Organization.find({ _id: { $in: actualUserIds } })
      .select('orgName logo ownerName')
      .sort({ orgName: 1 })
      .lean();

    // Combine and format
    let chatUsers = [
      ...players.map(p => ({
        _id: p._id,
        username: p.username,
        realName: p.realName,
        profilePicture: p.profilePicture,
        primaryGame: p.primaryGame,
        aegisRating: p.aegisRating,
        isOrganization: false
      })),
      ...organizations.map(o => ({
        _id: o._id,
        username: o.orgName,
        realName: o.ownerName,
        profilePicture: o.logo,
        isOrganization: true
      }))
    ];

    // Add system user if there are system messages
    if (chatUserIds.includes('system')) {
      chatUsers.push({
        _id: 'system',
        username: 'System',
        realName: 'System Notifications',
        profilePicture: null,
        isOrganization: false,
        isSystem: true
      });
    }

    chatUsers.sort((a, b) => a.username.localeCompare(b.username));

    res.json({ users: chatUsers });
  } catch (err) {
    console.error('Error in users/with-chats:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get chat messages between two users - OPTIMIZED
router.get("/:receiverId", auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.receiverId;
    const { limit = 50, before } = req.query; // Add pagination

    const query = {
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    };

    // Pagination support
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ timestamp: -1 }) // Latest first for pagination
      .limit(parseInt(limit))
      .select('senderId receiverId message messageType metadata timestamp invitationId invitationStatus') // Include invitation fields
      .populate({
        path: 'invitationId',
        populate: {
          path: 'team',
          select: 'teamName teamTag logo primaryGame region'
        }
      }) // Populate team data for invitations
      .lean(); // Convert to plain JS objects (faster)

    // Reverse to show oldest first in UI
    res.json(messages.reverse());
  } catch (err) {
    console.error('Error fetching messages:', err);
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
      .limit(10);

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

    if (invitation.toPlayer.toString() !== req.user.id) {
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

    if (invitation.toPlayer.toString() !== req.user.id) {
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

// Send notification message
router.post("/send-notification", auth, async (req, res) => {
  try {
    const { message, messageType, tournamentId, matchId, receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    // Create notification message
    const notificationMessage = new ChatMessage({
      senderId: req.user.id,
      receiverId: receiverId,
      message: message,
      messageType: messageType || 'text',
      tournamentId: tournamentId,
      timestamp: new Date()
    });

    await notificationMessage.save();

    // Emit to receiver
    if (global.io) {
      global.io.to(receiverId).emit('receiveMessage', {
        _id: notificationMessage._id,
        senderId: req.user.id,
        receiverId: receiverId,
        message: message,
        messageType: messageType || 'text',
        tournamentId: tournamentId,
        matchId: matchId,
        timestamp: new Date()
      });
    }

    res.json({ message: 'Notification sent successfully', chatMessage: notificationMessage });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Server error sending notification' });
  }
});

// Get all messages received by the current user
router.get('/messages/received', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await ChatMessage.find({ receiverId: userId })
      .populate('senderId', 'username realName profilePicture')
      .sort({ timestamp: -1 })
      .lean();

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching received messages:', error);
    res.status(500).json({ error: 'Failed to fetch received messages' });
  }
});

// Get system messages for the current user - OPTIMIZED
router.get("/system", auth, async (req, res) => {
  try {
    const { limit = 50, before } = req.query;

    const query = {
      senderId: 'system',
      receiverId: req.user.id
    };

    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select('senderId receiverId message messageType metadata timestamp invitationId invitationStatus')
      .populate({
        path: 'invitationId',
        populate: {
          path: 'team',
          select: 'teamName teamTag logo primaryGame region'
        }
      })
      .lean();

    res.json(messages.reverse());
  } catch (err) {
    console.error('Error fetching system messages:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
