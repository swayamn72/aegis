import express from 'express';
import jwt from 'jsonwebtoken';
import Tournament from '../models/tournament.model.js';
import Team from '../models/team.model.js';
import Player from '../models/player.model.js';
import Organization from '../models/organization.model.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { sendEmail, emailTemplates } from '../utils/emailService.js';

const router = express.Router();

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Middleware to verify organization authentication
const verifyOrgAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.type !== 'organization') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const organization = await Organization.findById(decoded.id);
    if (!organization || organization.approvalStatus !== 'approved') {
      return res.status(403).json({ message: 'Organization not approved' });
    }

    req.organization = organization;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all tournaments created by this organization
router.get('/my-tournaments', verifyOrgAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = { 'organizer.organizationRef': req.organization._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tournaments = await Tournament.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('participatingTeams.team', 'teamName teamTag logo')
      .lean();

    const total = await Tournament.countDocuments(filter);

    res.json({
      tournaments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Error fetching org tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Create a new tournament (pending admin approval)
router.post('/create-tournament', verifyOrgAuth, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const tournamentData = JSON.parse(req.body.tournamentData);

    // Upload images to Cloudinary if provided
    const mediaUrls = {};
    if (req.files) {
      for (const [key, files] of Object.entries(req.files)) {
        if (files && files[0]) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'tournament_media' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(files[0].buffer);
          });
          mediaUrls[key] = result.secure_url;
        }
      }
    }

    // Create tournament with pending approval status
    const newTournament = new Tournament({
      ...tournamentData,
      organizer: {
        name: req.organization.orgName,
        organizationRef: req.organization._id,
        contactEmail: req.organization.email,
        website: req.organization.socials?.website || ''
      },
      media: {
        logo: mediaUrls.logo || tournamentData.media?.logo || '',
        banner: mediaUrls.banner || tournamentData.media?.banner || '',
        coverImage: mediaUrls.coverImage || tournamentData.media?.coverImage || ''
      },
      visibility: 'private', // Hidden until admin approves
      verified: false,
      admins: [req.organization._id],
      // Add approval tracking
      _approvalStatus: 'pending',
      _submittedBy: req.organization._id,
      _submittedAt: new Date()
    });

    await newTournament.save();

    res.status(201).json({
      message: 'Tournament submitted for admin approval',
      tournament: newTournament
    });
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'Failed to create tournament', details: error.message });
  }
});

// Update tournament (only if not approved yet or after approval)
router.put('/:tournamentId', verifyOrgAuth, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const updateData = req.body.tournamentData ? JSON.parse(req.body.tournamentData) : req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if organization owns this tournament
    if (tournament.organizer.organizationRef?.toString() !== req.organization._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this tournament' });
    }

    // Upload new images if provided
    const mediaUrls = {};
    if (req.files) {
      for (const [key, files] of Object.entries(req.files)) {
        if (files && files[0]) {
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'tournament_media' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            stream.end(files[0].buffer);
          });
          mediaUrls[key] = result.secure_url;
        }
      }
    }

    // Merge media updates
    if (Object.keys(mediaUrls).length > 0) {
      updateData.media = {
        ...tournament.media,
        ...mediaUrls
      };
    }

    // Update tournament
    const updatedTournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('participatingTeams.team', 'teamName teamTag logo');

    res.json({
      message: 'Tournament updated successfully',
      tournament: updatedTournament
    });
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ error: 'Failed to update tournament', details: error.message });
  }
});

// Invite team to tournament phase
router.post('/:tournamentId/invite-team', verifyOrgAuth, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { teamId, phaseName, message } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.organizer.organizationRef?.toString() !== req.organization._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const team = await Team.findById(teamId).populate('captain', 'email username').populate('players', 'email username');
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if team already participating
    const alreadyInvited = tournament.participatingTeams.some(
      pt => pt.team.toString() === teamId
    );
    if (alreadyInvited) {
      return res.status(400).json({ error: 'Team already invited/registered' });
    }

    // Create invitation record (you might want a separate TeamTournamentInvitation model)
    // For now, we'll add it to a pending invitations array on the tournament
    if (!tournament._pendingInvitations) {
      tournament._pendingInvitations = [];
    }

    tournament._pendingInvitations.push({
      team: teamId,
      phase: phaseName,
      message: message || `You're invited to participate in ${tournament.tournamentName}`,
      invitedBy: req.organization._id,
      invitedAt: new Date(),
      status: 'pending'
    });

    await tournament.save();

    // Send email notifications to all team members
    try {
      const allPlayers = [team.captain, ...team.players].filter(player => player && player.email);

      for (const player of allPlayers) {
        const playerName = player.username || 'Player';
        const teamName = team.teamName || 'Your Team';
        const tournamentName = tournament.tournamentName || 'Tournament';
        const organizerName = tournament.organizer.name || 'AEGIS Esports';

        const { subject, html } = emailTemplates.teamInvitation(playerName, teamName, tournamentName, organizerName);

        await sendEmail(player.email, subject, html);
      }
    } catch (emailError) {
      console.error('Error sending team invitation emails:', emailError);
    }

    res.json({
      message: 'Team invitation sent successfully',
      invitation: tournament._pendingInvitations[tournament._pendingInvitations.length - 1]
    });
  } catch (error) {
    console.error('Error inviting team:', error);
    res.status(500).json({ error: 'Failed to invite team' });
  }
});

// Get pending invitations for a tournament
router.get('/:tournamentId/invitations', verifyOrgAuth, async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId)
      .populate({
        path: '_pendingInvitations.team',
        select: 'teamName teamTag logo captain',
        populate: {
          path: 'captain',
          select: 'username email'
        }
      });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.organizer.organizationRef?.toString() !== req.organization._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      invitations: tournament._pendingInvitations || []
    });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Search teams to invite
router.get('/search-teams', verifyOrgAuth, async (req, res) => {
  try {
    const { query, game, region, limit = 20 } = req.query;

    const filter = {
      status: 'active',
      profileVisibility: 'public'
    };

    if (query) {
      filter.$or = [
        { teamName: { $regex: query, $options: 'i' } },
        { teamTag: { $regex: query, $options: 'i' } }
      ];
    }

    if (game) filter.primaryGame = game;
    if (region) filter.region = region;

    const teams = await Team.find(filter)
      .populate('captain', 'username profilePicture')
      .populate('players', 'username profilePicture')
      .sort({ aegisRating: -1 })
      .limit(parseInt(limit))
      .select('teamName teamTag logo primaryGame region aegisRating captain players');

    res.json({ teams });
  } catch (error) {
    console.error('Error searching teams:', error);
    res.status(500).json({ error: 'Failed to search teams' });
  }
});

// Delete tournament (only if pending approval)
router.delete('/:tournamentId', verifyOrgAuth, async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.organizer.organizationRef?.toString() !== req.organization._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Only allow deletion if tournament hasn't started or is pending approval
    if (tournament._approvalStatus !== 'pending' && tournament.status !== 'announced') {
      return res.status(400).json({ error: 'Cannot delete active tournament' });
    }

    await Tournament.findByIdAndDelete(tournamentId);

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
});

export default router;