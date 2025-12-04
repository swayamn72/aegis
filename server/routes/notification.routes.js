import express from "express";
import auth from "../middleware/auth.js";
import TeamInvitation from "../models/teamInvitation.model.js";
import Player from "../models/player.model.js";
import Chat from "../models/chat.model.js";
import RecruitmentApproach from "../models/recruitmentApproach.model.js";


const router = express.Router();

// Get all notifications for the current user
router.get("/all", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Parallel fetch all notification types
    const [teamInvitations, connectionRequests, systemMessages, recruitmentApproaches] = await Promise.all([
      // Team invitations received by user
      TeamInvitation.find({ toPlayer: userId, status: 'pending' })
        .populate('fromPlayer', 'username profilePicture')
        .populate('team', 'teamName logo')
        .sort({ createdAt: -1 }),

      // Connection requests received by user (from Player model)
      Player.find({ receivedRequests: userId })
        .select('username profilePicture realName')
        .sort({ createdAt: -1 }),

      // System messages (excluding recruitment approaches to avoid duplicates)
      Chat.find({
        toUser: userId,
        type: 'system',
        'metadata.type': { $ne: 'recruitment_approach' }
      })
        .sort({ timestamp: -1 })
        .limit(20),

      // Pending recruitment approaches
      RecruitmentApproach.find({ toPlayer: userId, status: 'pending' })
        .populate('fromPlayer', 'username')
        .populate('team', 'teamName logo')
        .sort({ createdAt: -1 })
    ]);


    // Format and combine all notifications
    const notifications = [
      ...teamInvitations.map(inv => ({
        _id: inv._id,
        type: 'team_invitation',
        team: inv.team,
        fromPlayer: inv.fromPlayer,
        createdAt: inv.createdAt
      })),
      ...connectionRequests.map(req => ({
        _id: req._id,
        type: 'connection_request',
        fromPlayer: req.fromPlayer,
        createdAt: req.createdAt
      })),
      ...systemMessages.map(msg => ({
        _id: msg._id,
        type: 'system_message',
        message: msg.message,
        metadata: msg.metadata,
        createdAt: msg.timestamp
      })),
      ...recruitmentApproaches.map(approach => ({
        _id: approach._id,
        type: 'recruitment_approach',
        team: approach.team,
        fromPlayer: approach.fromPlayer,
        message: approach.message,
        createdAt: approach.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      notifications,
      counts: {
        teamInvitations: teamInvitations.length,
        connectionRequests: connectionRequests.length,
        systemMessages: systemMessages.length,
        recruitmentApproaches: recruitmentApproaches.length,
        total: notifications.length
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

export default router;
