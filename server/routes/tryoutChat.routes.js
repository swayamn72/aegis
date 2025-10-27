// server/routes/tryoutChat.routes.js
import express from 'express';
import TryoutChat from '../models/tryoutChat.model.js';
import TeamApplication from '../models/teamApplication.model.js';
import Team from '../models/team.model.js';
import Player from '../models/player.model.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/tryout-chats/my-chats - Get all tryout chats user is part of
router.get('/my-chats', auth, async (req, res) => {
  try {
    const chats = await TryoutChat.find({
      participants: req.user.id,
      status: 'active',
    })
      .populate('team', 'teamName teamTag logo')
      .populate('applicant', 'username inGameName profilePicture')
      .populate('participants', 'username profilePicture inGameName')
      .sort({ createdAt: -1 });

    res.json({ chats });
  } catch (error) {
    console.error('Error fetching tryout chats:', error);
    res.status(500).json({ error: 'Failed to fetch tryout chats' });
  }
});

// GET /api/tryout-chats/:chatId - Get specific tryout chat
router.get('/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await TryoutChat.findById(chatId)
      .populate('team', 'teamName teamTag logo captain')
      .populate('applicant', 'username inGameName profilePicture')
      .populate('participants', 'username profilePicture inGameName')
      .populate({
        path: 'messages.sender',
        select: 'username profilePicture',
      });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Verify user is a participant
    const isParticipant = chat.participants.some(
      (p) => p._id.toString() === req.user.id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'You are not part of this chat' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Error fetching tryout chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// POST a message to a tryout chat (HTTP fallback - optional)
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    const chat = await TryoutChat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Verify user is a participant
    if (!chat.participants.some((p) => p.toString() === req.user.id)) {
      return res.status(403).json({ error: 'You are not a participant in this chat' });
    }

    const chatMessage = {
      sender: req.user.id,
      message: message,
      messageType: 'text',
      timestamp: new Date(),
    };

    chat.messages.push(chatMessage);
    await chat.save();

    const savedMessage = chat.messages[chat.messages.length - 1];

    // Emit via socket to all participants (redundant if socket already emitted, but ensures delivery)
    if (global.io) {
      global.io.to(`tryout_${chatId}`).emit('tryoutMessage', {
        chatId: chatId,
        message: savedMessage,
      });
    }

    res.json({ chatMessage: savedMessage });
  } catch (error) {
    console.error('Error posting tryout message:', error);
    res.status(500).json({ error: 'Failed to post message' });
  }
});

// GET /api/tryout-chats/application/:applicationId - Get tryout chat by application ID
router.get('/application/:applicationId', auth, async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await TeamApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (!application.tryoutChatId) {
      return res.status(404).json({ error: 'No tryout chat exists for this application' });
    }

    const chat = await TryoutChat.findById(application.tryoutChatId)
      .populate('team', 'teamName teamTag logo captain')
      .populate('applicant', 'username inGameName profilePicture')
      .populate('participants', 'username profilePicture inGameName')
      .populate({
        path: 'messages.sender',
        select: 'username profilePicture',
      });

    // Verify user is a participant
    const isParticipant = chat.participants.some(
      (p) => p._id.toString() === req.user.id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'You are not part of this chat' });
    }

    res.json({ chat });
  } catch (error) {
    console.error('Error fetching tryout chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// NEW: End tryout (either party can call this)
router.post('/:chatId/end-tryout', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const chat = await TryoutChat.findById(chatId)
      .populate('team', 'teamName captain')
      .populate('applicant', 'username');

    if (!chat) {
      return res.status(404).json({ error: 'Tryout chat not found' });
    }

    // Check if user is authorized (team captain or applicant)
    const isTeamCaptain = chat.team.captain.toString() === userId;
    const isApplicant = chat.applicant._id.toString() === userId;

    if (!isTeamCaptain && !isApplicant) {
      return res.status(403).json({ error: 'Not authorized to end this tryout' });
    }

    // Prevent ending if already ended or offer sent
    if (['ended_by_team', 'ended_by_player', 'offer_sent', 'offer_accepted', 'offer_rejected'].includes(chat.tryoutStatus)) {
      return res.status(400).json({ error: 'Tryout already ended or offer in progress' });
    }

    // Update tryout status
    chat.tryoutStatus = isTeamCaptain ? 'ended_by_team' : 'ended_by_player';
    chat.endedAt = new Date();
    chat.endedBy = userId;
    chat.endedByModel = isTeamCaptain ? 'Team' : 'Player';
    chat.endReason = reason || 'No reason provided';

    // Add system message
    const systemMessage = {
      sender: 'system',
      message: `Tryout ended by ${isTeamCaptain ? chat.team.teamName : chat.applicant.username}. Reason: ${chat.endReason}`,
      messageType: 'system',
      timestamp: new Date()
    };
    chat.messages.push(systemMessage);

    await chat.save();

    // Emit to both parties
    if (global.io) {
      global.io.to(`tryout_${chatId}`).emit('tryoutEnded', {
        chatId,
        tryoutStatus: chat.tryoutStatus,
        endedBy: isTeamCaptain ? 'team' : 'player',
        reason: chat.endReason,
        message: systemMessage
      });
    }

    res.json({
      message: 'Tryout ended successfully',
      chat
    });
  } catch (error) {
    console.error('Error ending tryout:', error);
    res.status(500).json({ error: 'Failed to end tryout' });
  }
});

// NEW: Send team join offer (team captain only)
router.post('/:chatId/send-offer', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    const chat = await TryoutChat.findById(chatId)
      .populate('team', 'teamName captain logo players')
      .populate('applicant', 'username');

    if (!chat) {
      return res.status(404).json({ error: 'Tryout chat not found' });
    }

    // Check if user is team captain
    if (chat.team.captain.toString() !== userId) {
      return res.status(403).json({ error: 'Only team captain can send offers' });
    }

    // Check if tryout is active
    if (chat.tryoutStatus !== 'active') {
      return res.status(400).json({ error: 'Tryout is not active' });
    }

    // Check if team is full (max 5 players)
    if (chat.team.players.length >= 5) {
      return res.status(400).json({ error: 'Team is already full (max 5 players)' });
    }

    // Update chat with offer
    chat.tryoutStatus = 'offer_sent';
    chat.teamOffer = {
      status: 'pending',
      sentAt: new Date(),
      message: message || `${chat.team.teamName} would like to invite you to join the team!`
    };

    // Add system message
    const systemMessage = {
      sender: 'system',
      message: `${chat.team.teamName} has sent you a team join offer! Check the message above to accept or decline.`,
      messageType: 'team_offer',
      metadata: {
        offerMessage: chat.teamOffer.message,
        teamName: chat.team.teamName,
        teamLogo: chat.team.logo
      },
      timestamp: new Date()
    };
    chat.messages.push(systemMessage);

    await chat.save();

    // Emit to both parties
    if (global.io) {
      global.io.to(`tryout_${chatId}`).emit('teamOfferSent', {
        chatId,
        offer: chat.teamOffer,
        message: systemMessage
      });
    }

    res.json({
      message: 'Team offer sent successfully',
      chat
    });
  } catch (error) {
    console.error('Error sending team offer:', error);
    res.status(500).json({ error: 'Failed to send team offer' });
  }
});

// NEW: Accept team offer (applicant only)
router.post('/:chatId/accept-offer', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await TryoutChat.findById(chatId)
      .populate('team')
      .populate('applicant');

    if (!chat) {
      return res.status(404).json({ error: 'Tryout chat not found' });
    }

    // Check if user is the applicant
    if (chat.applicant._id.toString() !== userId) {
      return res.status(403).json({ error: 'Only the applicant can accept this offer' });
    }

    // Check if offer is pending
    if (chat.teamOffer.status !== 'pending') {
      return res.status(400).json({ error: 'No pending offer to accept' });
    }

    // Check if player already has a team
    const player = await Player.findById(userId);
    if (player.team) {
      return res.status(400).json({ error: 'You are already in a team' });
    }

    // Check if team is full
    const team = await Team.findById(chat.team._id);
    if (team.players.length >= 5) {
      return res.status(400).json({ error: 'Team is already full' });
    }

    // Add player to team
    team.players.push(userId);
    await team.save();

    // Update player
    player.team = team._id;
    player.teamStatus = 'in a team';
    await player.save();

    // Update chat
    chat.tryoutStatus = 'offer_accepted';
    chat.teamOffer.status = 'accepted';
    chat.teamOffer.respondedAt = new Date();

    // Add system message
    const systemMessage = {
      sender: 'system',
      message: `🎉 ${chat.applicant.username} has joined ${team.teamName}!`,
      messageType: 'system',
      timestamp: new Date()
    };
    chat.messages.push(systemMessage);

    await chat.save();

    // Update team application status if exists
    const application = await TeamApplication.findOne({
      player: userId,
      team: team._id,
      status: 'in_tryout'
    });
    if (application) {
      application.status = 'accepted';
      await application.save();
    }

    // Emit to both parties
    if (global.io) {
      global.io.to(`tryout_${chatId}`).emit('teamOfferAccepted', {
        chatId,
        message: systemMessage
      });
    }

    res.json({
      message: 'Team offer accepted successfully',
      chat,
      team
    });
  } catch (error) {
    console.error('Error accepting team offer:', error);
    res.status(500).json({ error: 'Failed to accept team offer' });
  }
});

// NEW: Reject team offer (applicant only)
router.post('/:chatId/reject-offer', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const chat = await TryoutChat.findById(chatId)
      .populate('team', 'teamName')
      .populate('applicant', 'username');

    if (!chat) {
      return res.status(404).json({ error: 'Tryout chat not found' });
    }

    // Check if user is the applicant
    if (chat.applicant._id.toString() !== userId) {
      return res.status(403).json({ error: 'Only the applicant can reject this offer' });
    }

    // Check if offer is pending
    if (chat.teamOffer.status !== 'pending') {
      return res.status(400).json({ error: 'No pending offer to reject' });
    }

    // Update chat
    chat.tryoutStatus = 'offer_rejected';
    chat.teamOffer.status = 'rejected';
    chat.teamOffer.respondedAt = new Date();

    // Add system message
    const systemMessage = {
      sender: 'system',
      message: `${chat.applicant.username} has declined the team offer. Reason: ${reason || 'Not specified'}`,
      messageType: 'system',
      timestamp: new Date()
    };
    chat.messages.push(systemMessage);

    await chat.save();

    // Emit to both parties
    if (global.io) {
      global.io.to(`tryout_${chatId}`).emit('teamOfferRejected', {
        chatId,
        reason,
        message: systemMessage
      });
    }

    res.json({
      message: 'Team offer rejected',
      chat
    });
  } catch (error) {
    console.error('Error rejecting team offer:', error);
    res.status(500).json({ error: 'Failed to reject team offer' });
  }
});

export default router;