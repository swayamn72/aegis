import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Tournament from '../models/tournament.model.js';
import Match from '../models/match.model.js';
import Team from '../models/team.model.js';
import Admin from '../models/admin.model.js';
import Reward from '../models/reward.model.js';
import { verifyAdminToken, requirePermission, generateAdminToken } from '../middleware/adminAuth.js';
import { getAllBugReports, updateBugReportStatus } from '../controllers/support.controller.js';

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({
        error: 'Invalid email.'
      });
    }

    if (admin.isLocked()) {
      return res.status(401).json({
        error: 'Account is temporarily locked. Please try again later.'
      });
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      await admin.incLoginAttempts();
      return res.status(401).json({
        error: 'Invalid password.'
      });
    }

    // Successful login
    await admin.resetLoginAttempts();

    const token = generateAdminToken(admin._id);

    // Set cookie for compatibility with auth middleware
    res.cookie('token', token, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      error: 'Internal server error during login.'
    });
  }
});

// Verify admin token
router.get('/verify', verifyAdminToken, (req, res) => {
  res.json({
    valid: true,
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      role: req.admin.role,
      permissions: req.admin.permissions
    }
  });
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// TOURNAMENT CRUD OPERATIONS

// Get all tournaments (admin view)
router.get('/tournaments', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, gameTitle } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.$or = [
        { tournamentName: { $regex: search, $options: 'i' } },
        { shortName: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (gameTitle) {
      query.gameTitle = gameTitle;
    }

    const tournaments = await Tournament.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('participatingTeams.team', 'teamName logo')
      .populate('organizer.organizationRef', 'name');

    const total = await Tournament.countDocuments(query);

    res.json({
      tournaments,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: tournaments.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Create tournament with image uploads
router.post('/tournaments', verifyAdminToken, requirePermission('canCreateTournament'), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const tournamentData = req.body;

    // Parse JSON strings back to objects/values since FormData sends everything as strings
    for (const key in tournamentData) {
      if (typeof tournamentData[key] === 'string') {
        try {
          tournamentData[key] = JSON.parse(tournamentData[key]);
        } catch (e) {
          // If it's not valid JSON, keep as string
        }
      }
    }

    // Validate required fields
    if (!tournamentData.tournamentName || !tournamentData.gameTitle || !tournamentData.startDate || !tournamentData.endDate) {
      return res.status(400).json({
        error: 'Missing required fields: tournamentName, gameTitle, startDate, endDate'
      });
    }

    // Handle logo upload
    let logoUrl = '';
    if (req.files && req.files.logo && req.files.logo[0]) {
      const logoResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'tournaments/logos' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        ).end(req.files.logo[0].buffer);
      });
      logoUrl = logoResult;
    }

    // Handle cover image upload
    let coverImageUrl = '';
    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      const coverResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'tournaments/covers' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        ).end(req.files.coverImage[0].buffer);
      });
      coverImageUrl = coverResult;
    }

    // Set media fields if images were uploaded
    if (logoUrl || coverImageUrl) {
      tournamentData.media = {
        ...(tournamentData.media || {}),
        logo: logoUrl,
        coverImage: coverImageUrl
      };
    }

    const tournament = new Tournament(tournamentData);
    await tournament.save();

    await tournament.populate('participatingTeams.team', 'teamName logo');
    await tournament.populate('organizer.organizationRef', 'name');

    res.status(201).json({
      message: 'Tournament created successfully',
      tournament
    });
  } catch (error) {
    console.error('Error creating tournament:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Tournament name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create tournament' });
    }
  }
});

// Get single tournament
router.get('/tournaments/:id', verifyAdminToken, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('participatingTeams.team', 'teamName logo teamTag')
      .populate('organizer.organizationRef', 'name');

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({ tournament });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

router.put('/tournaments/:id', verifyAdminToken, requirePermission('canEditTournament'), upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const updateData = req.body;

    // Parse JSON strings back to objects/values since FormData sends everything as strings
    for (const key in updateData) {
      if (typeof updateData[key] === 'string') {
        try {
          updateData[key] = JSON.parse(updateData[key]);
        } catch (e) {
          // If it's not valid JSON, keep as string
        }
      }
    }

    // Handle logo upload if provided
    if (req.files && req.files.logo && req.files.logo[0]) {
      const logoResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'tournaments/logos' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        ).end(req.files.logo[0].buffer);
      });
      updateData.media = updateData.media || {};
      updateData.media.logo = logoResult;
    }

    // Handle cover image upload if provided
    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      const coverResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'tournaments/covers' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        ).end(req.files.coverImage[0].buffer);
      });
      updateData.media = updateData.media || {};
      updateData.media.coverImage = coverResult;
    }

    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('participatingTeams.team', 'teamName logo')
    .populate('organizer.organizationRef', 'name');

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({
      message: 'Tournament updated successfully',
      tournament
    });
  } catch (error) {
    console.error('Error updating tournament:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Tournament name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update tournament' });
    }
  }
});

// Delete tournament
router.delete('/tournaments/:id', verifyAdminToken, requirePermission('canDeleteTournament'), async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
});

// MATCH CRUD OPERATIONS

// Get all matches
router.get('/matches', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, tournament } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.$or = [
        { 'participatingTeams.teamName': { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (tournament) {
      query.tournament = tournament;
    }

    const matches = await Match.find(query)
      .sort({ scheduledStartTime: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('tournament', 'tournamentName shortName')
      .populate('participatingTeams.team', 'teamName teamTag logo');

    const total = await Match.countDocuments(query);

    res.json({
      matches,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: matches.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Create match
router.post('/matches', verifyAdminToken, requirePermission('canCreateMatch'), async (req, res) => {
  try {
    const matchData = req.body;

    // Validate required fields
    if (!matchData.tournament || !matchData.matchNumber || !matchData.scheduledStartTime || !matchData.map) {
      return res.status(400).json({
        error: 'Missing required fields: tournament, matchNumber, scheduledStartTime, map'
      });
    }

    const match = new Match(matchData);
    await match.save();

    await match.populate('tournament', 'tournamentName shortName');
    await match.populate('participatingTeams.team', 'teamName teamTag logo');

    res.status(201).json({
      message: 'Match created successfully',
      match
    });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// Get single match
router.get('/matches/:id', verifyAdminToken, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('tournament', 'tournamentName shortName')
      .populate('participatingTeams.team', 'teamName teamTag logo')
      .populate('participatingTeams.players.player', 'username inGameName');

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({ match });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
});

// Update match
router.put('/matches/:id', verifyAdminToken, requirePermission('canEditMatch'), async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('tournament', 'tournamentName shortName')
    .populate('participatingTeams.team', 'teamName teamTag logo');

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({
      message: 'Match updated successfully',
      match
    });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ error: 'Failed to update match' });
  }
});

// Delete match
router.delete('/matches/:id', verifyAdminToken, requirePermission('canDeleteMatch'), async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({ error: 'Failed to delete match' });
  }
});

// DASHBOARD ENDPOINTS

// Get dashboard statistics
router.get('/dashboard/stats', verifyAdminToken, async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Get tournament stats
    const totalTournaments = await Tournament.countDocuments();
    const activeTournaments = await Tournament.countDocuments({
      status: { $in: ['in_progress', 'qualifiers_in_progress', 'group_stage', 'playoffs', 'finals'] }
    });
    const upcomingTournaments = await Tournament.countDocuments({
      startDate: { $gte: now },
      status: { $in: ['announced', 'registration_open', 'upcoming'] }
    });

    // Get match stats
    const totalMatches = await Match.countDocuments();
    const activeMatches = await Match.countDocuments({
      status: 'in_progress'
    });
    const scheduledMatches = await Match.countDocuments({
      status: 'scheduled',
      scheduledStartTime: { $gte: now }
    });

    // Get player stats (from participating teams)
    const tournamentsWithTeams = await Tournament.find({
      'participatingTeams.0': { $exists: true }
    }).populate('participatingTeams.team');

    let totalPlayers = 0;
    tournamentsWithTeams.forEach(tournament => {
      if (tournament.participatingTeams) {
        totalPlayers += tournament.participatingTeams.length;
      }
    });

    // Calculate trends (simplified - in real app you'd compare with previous periods)
    const stats = {
      totalTournaments,
      activeMatches: activeMatches,
      totalPlayers,
      upcomingEvents: upcomingTournaments + scheduledMatches,
      trends: {
        tournaments: 12, // Mock trend data
        matches: -5,
        players: 8,
        events: 15
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get recent activity (mock data for now)
router.get('/dashboard/activity', verifyAdminToken, async (req, res) => {
  try {
    // Mock recent activities - in real app, you'd track these in a separate collection
    const activities = [
      {
        type: 'success',
        message: 'New tournament "BGMI Championship" created',
        time: '2 hours ago'
      },
      {
        type: 'warning',
        message: 'Match #1245 requires admin review',
        time: '4 hours ago'
      },
      {
        type: 'success',
        message: 'Player verification completed for 15 players',
        time: '6 hours ago'
      },
      {
        type: 'info',
        message: 'Server maintenance scheduled for tonight',
        time: '1 day ago'
      }
    ];

    res.json({ activities });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// TEAM SEARCH ENDPOINT
// Search teams for tournament invitations
router.get('/teams/search', verifyAdminToken, async (req, res) => {
  try {
    const { query, gameTitle, limit = 10 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = new RegExp(query, 'i');

    let searchQuery = {
      $or: [
        { teamName: searchRegex },
        { tag: searchRegex }
      ]
    };

    if (gameTitle) {
      searchQuery.primaryGame = gameTitle;
    }

    const teams = await Team.find(searchQuery)
      .select('teamName tag logo primaryGame region country captain')
      .populate('captain', 'username inGameName')
      .limit(parseInt(limit))
      .sort({ teamName: 1 });

    res.json({
      teams,
      count: teams.length
    });
  } catch (error) {
    console.error('Error searching teams:', error);
    res.status(500).json({ error: 'Failed to search teams' });
  }
});

// BUG REPORT MANAGEMENT

// Get all bug reports
router.get('/bug-reports', verifyAdminToken, getAllBugReports);

// Update bug report status
router.put('/bug-reports/:id/status', verifyAdminToken, updateBugReportStatus);

// REWARD CRUD OPERATIONS

// Get all rewards
router.get('/rewards', verifyAdminToken, async (req, res) => {
  try {
    const rewards = await Reward.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ rewards });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// Create reward
router.post('/rewards', verifyAdminToken, requirePermission('canCreateTournament'), async (req, res) => {
  try {
    const { name, points, description, image } = req.body;

    if (!name || !points) {
      return res.status(400).json({
        error: 'Name and points are required'
      });
    }

    const reward = new Reward({
      name,
      points: parseInt(points),
      description,
      image
    });

    await reward.save();

    res.status(201).json({
      message: 'Reward created successfully',
      reward
    });
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({ error: 'Failed to create reward' });
  }
});

// Update reward
router.put('/rewards/:id', verifyAdminToken, requirePermission('canEditTournament'), async (req, res) => {
  try {
    const { name, points, description, image, isActive } = req.body;

    const reward = await Reward.findByIdAndUpdate(
      req.params.id,
      {
        name,
        points: parseInt(points),
        description,
        image,
        isActive
      },
      { new: true, runValidators: true }
    );

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json({
      message: 'Reward updated successfully',
      reward
    });
  } catch (error) {
    console.error('Error updating reward:', error);
    res.status(500).json({ error: 'Failed to update reward' });
  }
});

// Delete reward
router.delete('/rewards/:id', verifyAdminToken, requirePermission('canDeleteTournament'), async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json({ message: 'Reward deleted successfully' });
  } catch (error) {
    console.error('Error deleting reward:', error);
    res.status(500).json({ error: 'Failed to delete reward' });
  }
});

// Get admin profile
router.get('/profile', verifyAdminToken, (req, res) => {
  res.json({
    admin: {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      role: req.admin.role,
      permissions: req.admin.permissions,
      lastLogin: req.admin.lastLogin,
      createdAt: req.admin.createdAt
    }
  });
});

export default router;
