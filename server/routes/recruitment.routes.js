import express from 'express';
import LFTPost from '../models/lftPost.model.js';
import Player from '../models/player.model.js';
import Team from '../models/team.model.js';
import RecruitmentApproach from '../models/recruitmentApproach.model.js';
import TryoutChat from '../models/tryoutChat.model.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/recruitment/lft-posts - Get LFT posts
router.get('/lft-posts', async (req, res) => {
    try {
        const { game, region, role, limit = 20, page = 1 } = req.query;

        const filter = {};

        if (game) filter.game = game;
        if (region) filter.region = region;
        if (role) filter.roles = role;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const posts = await LFTPost.find(filter)
            .populate('player', 'username inGameName realName profilePicture aegisRating verified')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await LFTPost.countDocuments(filter);

        res.json({
            posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
            },
        });
    } catch (error) {
        console.error('Error fetching LFT posts:', error);
        res.status(500).json({ error: 'Failed to fetch LFT posts' });
    }
});

// POST /api/recruitment/lft-posts - Create LFT post
router.post('/lft-posts', auth, async (req, res) => {
    try {
        const { description, game, roles, region, requirements } = req.body;

        // Check if player already has an active LFT post
        const existingPost = await LFTPost.findOne({
            player: req.user.id,
            status: 'active'
        });

        if (existingPost) {
            return res.status(400).json({ error: 'You already have an active LFT post' });
        }

        const post = new LFTPost({
            player: req.user.id,
            description,
            game,
            roles,
            region,
            requirements,
            status: 'active',
        });

        await post.save();

        await post.populate('player', 'username inGameName realName profilePicture aegisRating verified');

        res.status(201).json({
            message: 'LFT post created successfully',
            post,
        });
    } catch (error) {
        console.error('Error creating LFT post:', error);
        res.status(500).json({ error: 'Failed to create LFT post' });
    }
});

// PUT /api/recruitment/lft-posts/:postId - Update LFT post (FIXED PATH)
router.put('/lft-posts/:postId', auth, async (req, res) => {
    try {
        const { postId } = req.params;
        const updates = req.body;

        const post = await LFTPost.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'LFT post not found' });
        }

        if (post.player.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'You can only edit your own posts' });
        }

        Object.assign(post, updates);
        await post.save();

        await post.populate('player', 'username inGameName realName profilePicture aegisRating verified');

        res.json({
            message: 'LFT post updated successfully',
            post,
        });
    } catch (error) {
        console.error('Error updating LFT post:', error);
        res.status(500).json({ error: 'Failed to update LFT post' });
    }
});

// DELETE /api/recruitment/lft-posts/:postId - Delete LFT post (FIXED PATH)
router.delete('/lft-posts/:postId', auth, async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await LFTPost.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'LFT post not found' });
        }

        if (post.player.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'You can only delete your own posts' });
        }

        post.status = 'inactive';
        await post.save();

        res.json({ message: 'LFT post deleted successfully' });
    } catch (error) {
        console.error('Error deleting LFT post:', error);
        res.status(500).json({ error: 'Failed to delete LFT post' });
    }
});

// GET /api/recruitment/my-posts - Get user's LFT posts
router.get('/my-posts', auth, async (req, res) => {
    try {
        const posts = await LFTPost.find({
            player: req.user.id,
        })
            .populate('player', 'username inGameName realName profilePicture aegisRating verified')
            .sort({ createdAt: -1 });

        res.json({ posts });
    } catch (error) {
        console.error('Error fetching user LFT posts:', error);
        res.status(500).json({ error: 'Failed to fetch LFT posts' });
    }
});

// POST /api/recruitment/approach-player - Send approach request to player
router.post('/approach-player/:playerId', auth, async (req, res) => {
    try {
        const { playerId } = req.params;
        const { message } = req.body;

        // Verify user has a team and is captain
        const user = await Player.findById(req.user.id).populate('team');
        if (!user.team) {
            return res.status(400).json({ error: 'You must be in a team to approach players' });
        }

        const team = await Team.findById(user.team._id).populate('captain players');
        if (team.captain._id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'Only team captains can approach players' });
        }

        // Check if approach already exists
        const existingApproach = await RecruitmentApproach.findOne({
            team: team._id,
            player: playerId,
            status: 'pending'
        });

        if (existingApproach) {
            return res.status(400).json({ error: 'You already have a pending approach with this player' });
        }

        // Create approach request
        const approach = new RecruitmentApproach({
            team: team._id,
            player: playerId,
            message: message || `${team.teamName} would like to discuss recruitment opportunities with you.`,
            status: 'pending'
        });

        await approach.save();

        // Send system notification to player - SIMPLE SYSTEM MESSAGE
        const ChatMessage = (await import('../models/chat.model.js')).default;
        const notification = new ChatMessage({
            senderId: 'system',
            receiverId: playerId,
            message: `🔔 ${team.teamName} has sent you a recruitment approach request: "${approach.message}"`,
            messageType: 'system', // KEEP AS SYSTEM TYPE
            metadata: {
                type: 'recruitment_approach', // Store actual type in metadata
                approachId: approach._id.toString(),
                teamId: team._id.toString(),
                teamName: team.teamName,
                teamLogo: team.logo,
                message: approach.message,
                approachStatus: 'pending'
            },
            timestamp: new Date()
        });

        await notification.save();

        // Emit socket event
        if (global.io) {
            global.io.to(playerId).emit('receiveMessage', {
                _id: notification._id,
                senderId: 'system',
                receiverId: playerId,
                message: notification.message,
                messageType: 'system',
                metadata: notification.metadata,
                timestamp: notification.timestamp
            });
        }

        res.status(201).json({
            message: 'Approach request sent successfully',
            approach
        });
    } catch (error) {
        console.error('Error sending approach request:', error);
        res.status(500).json({ error: 'Failed to send approach request' });
    }
});

// POST /api/recruitment/approach/:approachId/accept - Accept approach request
router.post('/approach/:approachId/accept', auth, async (req, res) => {
    try {
        const { approachId } = req.params;

        const approach = await RecruitmentApproach.findById(approachId)
            .populate('team')
            .populate('player');

        if (!approach) {
            return res.status(404).json({ error: 'Approach request not found' });
        }

        if (approach.player._id.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'This approach is not for you' });
        }

        if (approach.status !== 'pending') {
            return res.status(400).json({ error: 'This approach has already been processed' });
        }

        // Get all team members (populate if needed)
        const team = await Team.findById(approach.team._id).populate('players captain');

        // Create participants array: all team players + the applicant
        const allParticipants = [
            ...team.players.map(p => p._id),
            approach.player._id
        ];

        // Remove duplicates
        const uniqueParticipants = [...new Set(allParticipants.map(id => id.toString()))];

        // CREATE GROUP TRYOUT CHAT
        const TryoutChat = (await import('../models/tryoutChat.model.js')).default;
        const tryoutChat = new TryoutChat({
            team: team._id,
            applicant: approach.player._id,
            participants: uniqueParticipants,
            status: 'active',
            chatType: 'recruitment',
            metadata: {
                approachId: approach._id,
                initiatedBy: 'team'
            },
            messages: [
                {
                    sender: 'system',
                    message: `${approach.player.username} has accepted the recruitment approach from ${team.teamName}. All team members can now discuss opportunities.`,
                    messageType: 'system',
                    timestamp: new Date()
                }
            ]
        });

        await tryoutChat.save();

        // Update approach
        approach.status = 'accepted';
        approach.tryoutChatId = tryoutChat._id;
        await approach.save();

        // Update the original system message to show it's accepted
        const ChatMessage = (await import('../models/chat.model.js')).default;
        await ChatMessage.updateOne(
            { 'metadata.approachId': approachId },
            { $set: { 'metadata.approachStatus': 'accepted' } }
        );

        // Notify all team members about new tryout chat - SIMPLE SYSTEM MESSAGES
        for (const memberId of team.players) {
            const notification = new ChatMessage({
                senderId: 'system',
                receiverId: memberId._id.toString(),
                message: `✅ ${approach.player.username} accepted your recruitment approach! Tryout chat created.`,
                messageType: 'system',
                metadata: {
                    type: 'tryout_chat_created',
                    tryoutChatId: tryoutChat._id.toString(),
                    playerName: approach.player.username
                },
                timestamp: new Date()
            });
            await notification.save();

            if (global.io) {
                global.io.to(memberId._id.toString()).emit('receiveMessage', {
                    _id: notification._id,
                    senderId: 'system',
                    receiverId: memberId._id.toString(),
                    message: notification.message,
                    messageType: 'system',
                    metadata: notification.metadata,
                    timestamp: notification.timestamp
                });
            }
        }

        // Populate for response
        await tryoutChat.populate('team applicant participants');

        res.json({
            message: 'Approach accepted and tryout chat created',
            tryoutChat
        });
    } catch (error) {
        console.error('Error accepting approach:', error);
        res.status(500).json({ error: 'Failed to accept approach' });
    }
});

// POST /api/recruitment/approach/:approachId/reject - Reject approach request
router.post('/approach/:approachId/reject', auth, async (req, res) => {
    try {
        const { approachId } = req.params;
        const { reason } = req.body;

        const approach = await RecruitmentApproach.findById(approachId);

        if (!approach) {
            return res.status(404).json({ error: 'Approach request not found' });
        }

        if (approach.player.toString() !== req.user.id.toString()) {
            return res.status(403).json({ error: 'This approach is not for you' });
        }

        approach.status = 'rejected';
        approach.rejectionReason = reason || 'Not interested';
        await approach.save();

        // Update the original system message
        const ChatMessage = (await import('../models/chat.model.js')).default;
        await ChatMessage.updateOne(
            { 'metadata.approachId': approachId },
            { $set: { 'metadata.approachStatus': 'rejected' } }
        );

        res.json({ message: 'Approach rejected' });
    } catch (error) {
        console.error('Error rejecting approach:', error);
        res.status(500).json({ error: 'Failed to reject approach' });
    }
});

// GET /api/recruitment/my-approaches - Get user's approach requests
router.get('/my-approaches', auth, async (req, res) => {
    try {
        // Find approaches where user is either the player being approached OR captain of approaching team
        const player = await Player.findById(req.user.id);

        const approaches = await RecruitmentApproach.find({
            $or: [
                { player: req.user.id }, // Approaches to this player
                { team: player.team } // Approaches from this player's team (if they're captain)
            ]
        })
            .populate('team', 'teamName logo')
            .populate('player', 'username profilePicture aegisRating')
            .sort({ createdAt: -1 });

        res.json({ approaches });
    } catch (error) {
        console.error('Error fetching approaches:', error);
        res.status(500).json({ error: 'Failed to fetch approaches' });
    }
});

export default router;
