// server/routes/tryoutChat.routes.js
import express from 'express';
import TryoutChat from '../models/tryoutChat.model.js';
import TeamApplication from '../models/teamApplication.model.js';
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

// POST /api/tryout-chats/:chatId/messages - Send message in tryout chat
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const chat = await TryoutChat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (chat.status !== 'active') {
      return res.status(400).json({ error: 'This chat is no longer active' });
    }

    // Verify user is a participant
    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user.id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'You are not part of this chat' });
    }

    // Add message
    chat.messages.push({
      sender: req.user.id,
      message: message.trim(),
      messageType: 'text',
    });

    await chat.save();

    // Populate sender info for response
    await chat.populate({
      path: 'messages.sender',
      select: 'username profilePicture',
    });

    const newMessage = chat.messages[chat.messages.length - 1];

    res.json({
      message: 'Message sent',
      chatMessage: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
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

export default router;