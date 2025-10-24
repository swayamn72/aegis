import express from 'express';
import mongoose from 'mongoose';
import Tournament from '../models/tournament.model.js';
import Match from '../models/match.model.js';
import Team from '../models/team.model.js';
import Player from '../models/player.model.js';
import { sendTeamInvite, acceptTeamInvite, addTeamToPhase, removeTeamFromPhase } from '../controllers/tournament.controller.js';
import auth from '../middleware/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure multer for memory storage
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

const router = express.Router();

// Team invites
router.post('/:tournamentId/invites', auth, async (req, res) => await sendTeamInvite(req, res));
router.post('/invites/:inviteId/accept', auth, async (req, res) => await acceptTeamInvite(req, res));

router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 50, game, region, status, tier, subRegion } = req.query;

    // Build filter query
    const filter = {
      visibility: 'public'
    };

    if (game) filter.gameTitle = game;
    if (region) filter.region = region;
    if (subRegion) filter.subRegion = subRegion;
    if (status) filter.status = status;
    if (tier) filter.tier = tier;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch main tournaments
    const tournaments = await Tournament.find(filter)
      .sort({ startDate: -1, featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(`
        tournamentName shortName gameTitle region subRegion tier status startDate endDate
        prizePool media.logo organizer participatingTeams slots featured verified tags
      `)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo',
        model: 'Team'
      });

    // Fetch live tournaments
    const liveTournaments = await Tournament.findLive(10)
      .select(`
        tournamentName shortName gameTitle region subRegion tier status startDate endDate
        prizePool media.logo organizer participatingTeams streamLinks tags
      `)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo'
      });

    // Fetch upcoming tournaments
    const upcomingTournaments = await Tournament.findUpcoming(20)
      .select(`
        tournamentName shortName gameTitle region subRegion tier status startDate endDate
        prizePool media.logo organizer participatingTeams slots registrationStartDate registrationEndDate tags
      `)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo'
      });

    // Calculate additional fields for main tournaments
    const enrichedTournaments = tournaments.map(tournament => ({
      ...tournament.toObject(),
      // Ensure we have participant count
      participantCount: tournament.participatingTeams?.length || tournament.statistics?.totalParticipatingTeams || 0,
      totalSlots: tournament.slots?.total || null,
      // Format dates properly
      startDate: tournament.startDate ? tournament.startDate.toISOString() : null,
      endDate: tournament.endDate ? tournament.endDate.toISOString() : null,
      // Ensure media has default values
      media: {
        logo: tournament.media?.logo || null,
        banner: tournament.media?.banner || null,
        coverImage: tournament.media?.coverImage || null
      },
      // Ensure organizer has default
      organizer: {
        name: tournament.organizer?.name || 'Unknown Organizer'
      },
      registrationStatus: tournament.registrationDisplayStatus
    }));

    // Enrich live tournaments
    const enrichedLiveTournaments = liveTournaments.map(tournament => ({
      ...tournament.toObject(),
      participantCount: tournament.participatingTeams?.length || 0,
      isLive: tournament.isLive(),
      hasActiveStreams: tournament.streamLinks?.length > 0,
      registrationStatus: tournament.registrationDisplayStatus
    }));

    // Enrich upcoming tournaments
    const enrichedUpcomingTournaments = upcomingTournaments.map(tournament => ({
      ...tournament.toObject(),
      participantCount: tournament.participatingTeams?.length || 0,
      totalSlots: tournament.slots?.total || null,
      registrationStatus: tournament.registrationDisplayStatus,
      daysUntilStart: tournament.startDate ? Math.ceil((new Date(tournament.startDate) - new Date()) / (1000 * 60 * 60 * 24)) : null
    }));

    const total = await Tournament.countDocuments(filter);

    res.json({
      success: true,
      tournaments: enrichedTournaments,
      liveTournaments: enrichedLiveTournaments,
      upcomingTournaments: enrichedUpcomingTournaments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: skip + enrichedTournaments.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tournaments',
      message: error.message
    });
  }
});

// Get tournaments by status with better error handling
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const { limit = 20, game, region, subRegion } = req.query;

    const filter = {
      status: status,
      visibility: 'public'
    };

    if (game) filter.gameTitle = game;
    if (region) filter.region = region;
    if (subRegion) filter.subRegion = subRegion;

    const tournaments = await Tournament.find(filter)
      .sort({ startDate: status === 'completed' ? -1 : 1 })
      .limit(parseInt(limit))
      .select(`
        tournamentName shortName gameTitle region subRegion tier status startDate endDate
        prizePool media organizer participatingTeams statistics slots tags
      `)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo'
      });

    const enrichedTournaments = tournaments.map(tournament => ({
      ...tournament.toObject(),
      participantCount: tournament.participatingTeams?.length || tournament.statistics?.totalParticipatingTeams || 0,
      totalSlots: tournament.slots?.total || null,
      startDate: tournament.startDate ? tournament.startDate.toISOString() : null,
      endDate: tournament.endDate ? tournament.endDate.toISOString() : null,
      registrationStatus: tournament.registrationDisplayStatus
    }));

    res.json({ tournaments: enrichedTournaments });
  } catch (error) {
    console.error('Error fetching tournaments by status:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Get live tournaments with real-time status checking
router.get('/live', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const tournaments = await Tournament.findLive(parseInt(limit))
      .select(`
        tournamentName shortName gameTitle region subRegion tier status startDate endDate
        prizePool media organizer participatingTeams statistics streamLinks tags
      `)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo'
      });

    const enrichedTournaments = tournaments.map(tournament => ({
      ...tournament.toObject(),
      participantCount: tournament.participatingTeams?.length || 0,
      isLive: tournament.isLive(),
      hasActiveStreams: tournament.streamLinks?.length > 0,
      registrationStatus: tournament.registrationDisplayStatus
    }));

    res.json({
      success: true,
      tournaments: enrichedTournaments
    });
  } catch (error) {
    console.error('Error fetching live tournaments:', error);
    res.status(500).json({
      success: false,  // ADD THIS
      error: 'Failed to fetch live tournaments',
      message: error.message  // ADD THIS
    });
  }
});

// Get upcoming tournaments
router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const { limit = 20 } = req.query;

    const tournaments = await Tournament.findUpcoming(parseInt(limit))
      .select(`
        tournamentName shortName gameTitle region subRegion tier status startDate endDate
        prizePool media organizer participatingTeams statistics slots registrationStartDate registrationEndDate tags
      `)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo'
      });

    const enrichedTournaments = tournaments.map(tournament => ({
      ...tournament.toObject(),
      participantCount: tournament.participatingTeams?.length || 0,
      totalSlots: tournament.slots?.total || null,
      registrationStatus: tournament.registrationDisplayStatus,
      daysUntilStart: tournament.startDate ? Math.ceil((new Date(tournament.startDate) - now) / (1000 * 60 * 60 * 24)) : null
    }));

    res.json({
      success: true,  // ADD THIS
      tournaments: enrichedTournaments
    });
  } catch (error) {
    console.error('Error fetching upcoming tournaments:', error);
    res.status(500).json({
      success: false,  // ADD THIS
      error: 'Failed to fetch upcoming tournaments',
      message: error.message  // ADD THIS
    });
  }
});

// Get featured tournaments
router.get('/featured', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const tournaments = await Tournament.find({
      featured: true,
      visibility: 'public'
    })
      .sort({ startDate: -1, tier: 1 }) // S-tier first, then by date
      .limit(parseInt(limit))
      .select(`
        tournamentName shortName gameTitle region subRegion tier status startDate endDate
        prizePool media organizer participatingTeams statistics streamLinks tags
      `)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo'
      });

    const enrichedTournaments = tournaments.map(tournament => ({
      ...tournament.toObject(),
      participantCount: tournament.participatingTeams?.length || 0,
      isLive: tournament.isLive(),
      registrationStatus: tournament.registrationDisplayStatus
    }));

    res.json({ tournaments: enrichedTournaments });
  } catch (error) {
    console.error('Error fetching featured tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch featured tournaments' });
  }
});

// Get recent 3 tournaments open for all with open registrations
router.get('/get-recent3-tourney', async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const tournaments = await Tournament.find({
      isOpenForAll: true,
      visibility: 'public'
    })
      .sort({ startDate: 1 }) // Soonest first
      .limit(parseInt(limit))
      .select(`
        tournamentName shortName gameTitle region subRegion tier status startDate endDate
        prizePool media organizer participatingTeams statistics slots registrationStartDate registrationEndDate tags
      `)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo'
      });

    // Filter for tournaments with open registrations
    const openTournaments = tournaments.filter(tournament => tournament.registrationDisplayStatus === 'Open');

    const enrichedTournaments = openTournaments.map(tournament => ({
      ...tournament.toObject(),
      participantCount: tournament.participatingTeams?.length || 0,
      totalSlots: tournament.slots?.total || null,
      registrationStatus: tournament.registrationDisplayStatus,
      _id: tournament._id
    }));

    res.json({ tournaments: enrichedTournaments });
  } catch (error) {
    console.error('Error fetching recent 3 tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch recent 3 tournaments' });
  }
});

// Get single tournament by ID with comprehensive data
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { mobile, includeMatches = 'true' } = req.query; // Add query params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid tournament ID' });
    }

    // Base query - always needed
    let tournamentQuery = Tournament.findById(id);

    // Conditional population based on client type
    if (mobile === 'true') {
      // Lighter populate for mobile
      tournamentQuery = tournamentQuery
        .populate({
          path: 'participatingTeams.team',
          select: 'teamName teamTag logo' // Only essential fields
        })
        .populate({
          path: 'phases.teams',
          select: 'teamName logo'
        })
        .populate({
          path: 'phases.groups.teams',
          select: 'teamName teamTag logo'
        });
    } else {
      // Full populate for web (your existing code)
      tournamentQuery = tournamentQuery
        .populate({
          path: 'participatingTeams.team',
          select: 'teamName teamTag logo primaryGame region establishedDate'
        })
        .populate({
          path: 'phases.teams',
          select: 'teamName logo'
        })
        .populate({
          path: 'phases.groups.teams',
          select: 'teamName teamTag logo'
        })
        .populate({
          path: 'phases.groups.standings.team',
          select: 'teamName teamTag logo'
        });
    }

    const tournament = await tournamentQuery;

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Fetch matches only if needed (mobile can lazy-load this)
    let recentMatches = [];
    if (includeMatches === 'true') {
      const matchLimit = mobile === 'true' ? 10 : 20; // Less matches for mobile
      recentMatches = await Match.find({ tournament: id })
        .sort({ scheduledStartTime: -1 })
        .limit(matchLimit)
        .populate({
          path: 'participatingTeams.team',
          select: 'teamName teamTag'
        })
        .select(`
          matchNumber matchType tournamentPhase scheduledStartTime actualStartTime actualEndTime
          status map participatingTeams matchStats
        `)
        .lean();
    }

    // Match stats aggregation
    const matchStatsAgg = await Match.aggregate([
      { $match: { tournament: new mongoose.Types.ObjectId(id), status: 'completed' } },
      {
        $group: {
          _id: null,
          totalMatches: { $sum: 1 },
          totalKills: { $sum: '$matchStats.totalKills' },
          totalDamage: { $sum: '$matchStats.totalDamage' },
          avgMatchDuration: { $avg: '$matchStats.matchDuration' }
        }
      }
    ]);

    const liveStats = matchStatsAgg[0] || {};

    // Build tournament data (your existing code)
    const tournamentData = {
      _id: tournament._id,
      name: tournament.tournamentName,
      shortName: tournament.shortName,
      game: tournament.gameTitle,
      region: tournament.region,
      tier: tournament.tier,
      status: tournament.status,
      currentPhase: tournament.currentCompetitionPhase,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      registrationStartDate: tournament.registrationStartDate,
      registrationEndDate: tournament.registrationEndDate,
      teams: tournament.participatingTeams?.length || 0,
      totalSlots: tournament.slots?.total || 0,
      participatingTeams: tournament.participatingTeams?.map(pt => ({
        team: {
          _id: pt.team.id,
          teamName: pt.team.teamName,
          teamTag: pt.team.teamTag,
          logo: pt.team.logo
        },
        group: pt.group,
        qualifiedThrough: pt.qualifiedThrough,
        currentStage: pt.currentStage
      })) || [],
      description: tournament.description || `${tournament.tournamentName} is a competitive ${tournament.gameTitle} tournament featuring top teams from ${tournament.region}.`,

      media: {
        banner: tournament.media?.banner || null,
        coverImage: tournament.media?.coverImage || null,
        logo: tournament.media?.logo || null
      },

      organizer: {
        name: tournament.organizer?.name || 'AEGIS Esports',
        website: tournament.organizer?.website || null,
        contactEmail: tournament.organizer?.contactEmail || null
      },

      format: tournament.format || 'Battle Royale Points System',
      formatDetails: tournament.formatDetails,

      gameSettings: tournament.gameSettings || {
        serverRegion: tournament.region || 'Asia',
        gameMode: 'TPP Squad',
        maps: ['Erangel', 'Miramar', 'Sanhok'],
        pointsSystem: {
          killPoints: 1,
          placementPoints: {
            1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1
          }
        }
      },

      prizePool: tournament.prizePool || {
        total: 0,
        currency: 'INR',
        distribution: [],
        individualAwards: []
      },

      phases: tournament.phases?.map(phase => ({
        _id: phase._id,
        name: phase.name,
        type: phase.type,
        status: phase.status,
        startDate: phase.startDate,
        endDate: phase.endDate,
        description: phase.details,
        teams: phase.teams || [],
        groups: phase.groups || []
      })) || [],

      statistics: {
        totalMatches: liveStats.totalMatches || 0,
        totalParticipatingTeams: tournament.participatingTeams?.length || 0,
        totalKills: liveStats.totalKills || 0,
        totalDamage: liveStats.totalDamage || 0,
        avgMatchDuration: liveStats.avgMatchDuration || 0,
        ...tournament.statistics?.viewership && {
          viewership: tournament.statistics.viewership
        }
      },

      streamLinks: tournament.streamLinks?.map(stream => ({
        platform: stream.platform,
        url: stream.url,
        language: stream.language,
        isOfficial: stream.isOfficial || false
      })) || [],

      socialMedia: tournament.socialMedia || {},

      featured: tournament.featured || false,
      verified: tournament.verified || false
    };

    // Build schedule data
    const scheduleData = recentMatches.map(match => ({
      _id: match._id,
      phase: match.tournamentPhase || 'Group Stage',
      match: `Match ${match.matchNumber}`,
      matchType: match.matchType,
      teams: match.participatingTeams?.slice(0, 2).map(pt =>
        pt.team?.teamName || 'TBD'
      ).join(' vs ') || 'TBD vs TBD',
      map: match.map,
      date: match.scheduledStartTime ? match.scheduledStartTime.toISOString().split('T')[0] : null,
      time: match.scheduledStartTime ? match.scheduledStartTime.toTimeString().slice(0, 5) : null,
      status: match.status,
      actualStartTime: match.actualStartTime,
      actualEndTime: match.actualEndTime
    }));

    // Build groups data
    const groupsData = {};
    if (tournament.phases && tournament.phases.length > 0) {
      for (const phase of tournament.phases) {
        if (phase.groups && phase.groups.length > 0) {
          groupsData[phase.name] = {};
          for (const group of phase.groups) {
            const groupKey = group.name?.replace('Group ', '') || 'A';
            groupsData[phase.name][groupKey] = {
              teams: group.teams?.map(team => ({
                _id: team._id,
                name: team.teamName || 'Unknown Team',
                tag: team.teamTag,
                logo: team.logo || null
              })) || [],
              standings: group.standings?.map(standing => ({
                team: {
                  _id: standing.team._id,
                  name: standing.team.teamName,
                  tag: standing.team.teamTag,
                  logo: standing.team.logo
                },
                position: standing.position,
                matchesPlayed: standing.matchesPlayed || 0,
                points: standing.points || 0,
                kills: standing.kills || 0,
                chickenDinners: standing.chickenDinners || 0
              })) || []
            };
          }
        }
      }
    }

    res.json({
      tournamentData,
      scheduleData: includeMatches === 'true' ? scheduleData : [],
      groupsData,
      tournamentStats: tournamentData.statistics,
      streamLinks: tournamentData.streamLinks
    });

  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament details' });
  }
});
// Get tournaments a player has participated in
router.get('/player/:playerId/recent', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { limit = 10 } = req.query;

    // First, find teams the player is/was on
    const player = await Player.findById(playerId).select('team previousTeams');
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const teamIds = [
      player.team,
      ...(player.previousTeams?.map(pt => pt.team) || [])
    ].filter(Boolean);

    // Find tournaments these teams participated in
    const tournaments = await Tournament.find({
      'participatingTeams.team': { $in: teamIds }
    })
      .sort({ startDate: -1 })
      .limit(parseInt(limit))
      .select('tournamentName shortName startDate endDate prizePool participatingTeams finalStandings')
      .lean();

    const formattedTournaments = tournaments.map(tournament => {
      // Find team's placement
      const teamParticipation = tournament.participatingTeams.find(pt =>
        teamIds.some(tid => tid?.toString() === pt.team.toString())
      );

      const standing = tournament.finalStandings?.find(fs =>
        teamIds.some(tid => tid?.toString() === fs.team.toString())
      );

      return {
        _id: tournament._id,
        name: tournament.tournamentName,
        shortName: tournament.shortName,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        placement: standing?.position || teamParticipation?.currentStage || 'Participated',
        prize: standing?.prize?.amount || 0
      };
    });

    res.json({ tournaments: formattedTournaments });
  } catch (error) {
    console.error('Error fetching player tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch player tournaments' });
  }
});

// Search tournaments
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20, game, region, subRegion } = req.query;

    const filter = {
      visibility: 'public',
      $or: [
        { tournamentName: { $regex: query, $options: 'i' } },
        { shortName: { $regex: query, $options: 'i' } },
        { 'organizer.name': { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    if (game) filter.gameTitle = game;
    if (region) filter.region = region;
    if (subRegion) filter.subRegion = subRegion;

    const tournaments = await Tournament.find(filter)
      .sort({ startDate: -1, featured: -1 })
      .limit(parseInt(limit))
      .select(`
        tournamentName shortName gameTitle region subRegion tier status startDate endDate
        prizePool media organizer participatingTeams tags
      `)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo'
      });

    const enrichedTournaments = tournaments.map(tournament => ({
      ...tournament.toObject(),
      participantCount: tournament.participatingTeams?.length || 0,
      startDate: tournament.startDate ? tournament.startDate.toISOString() : null,
      endDate: tournament.endDate ? tournament.endDate.toISOString() : null,
      registrationStatus: tournament.registrationDisplayStatus
    }));

    res.json({ tournaments: enrichedTournaments });
  } catch (error) {
    console.error('Error searching tournaments:', error);
    res.status(500).json({ error: 'Failed to search tournaments' });
  }
});

// Update tournament overview details (name, shortName, visibility, media)
router.put('/:id', auth, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // Get data from body

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid tournament ID' });
    }

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if user is admin or organizer
    if (tournament.organizer.toString() !== req.user.id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to update this tournament' });
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
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate({
      path: 'participatingTeams.team',
      select: 'teamName teamTag logo'
    });

    res.json({
      message: 'Tournament updated successfully',
      tournament: updatedTournament
    });
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ error: 'Failed to update tournament', details: error.message });
  }
});

// Send invite to team for a phase

// Admin phase team management
router.post('/:id/phases/:phase/teams', auth, async (req, res) => await addTeamToPhase(req, res));
router.delete('/:id/phases/:phase/teams/:teamId', auth, async (req, res) => await removeTeamFromPhase(req, res));

// Update groups for a specific phase
router.put('/:id/groups', async (req, res) => {
  try {
    const { id } = req.params;
    const { groups, phaseId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(phaseId)) {
      return res.status(400).json({ error: 'Invalid tournament or phase ID' });
    }

    if (!groups || !Array.isArray(groups)) {
      return res.status(400).json({ error: 'Groups must be a non-empty array' });
    }

    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check authorization (admin only for now) - temporarily disabled for testing
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ error: 'Admin access required to update groups' });
    // }

    // Validate phase exists
    const phaseIndex = tournament.phases.findIndex(p => p._id.toString() === phaseId);
    if (phaseIndex === -1) {
      return res.status(404).json({ error: 'Phase not found' });
    }

    // Validate team IDs
    for (const group of groups) {
      for (const teamId of group.teams) {
        if (!mongoose.Types.ObjectId.isValid(teamId)) {
          return res.status(400).json({ error: `Invalid team ID: ${teamId}` });
        }
      }
    }

    // Ensure teams are ObjectIds
    const validatedGroups = groups.map(group => ({
      ...group,
      teams: group.teams.map(teamId => new mongoose.Types.ObjectId(teamId))
    }));

    // Update the specific phase's groups using arrayFilters
    const updatedTournament = await Tournament.findOneAndUpdate(
      { _id: id },
      { $set: { 'phases.$[phase].groups': validatedGroups } },
      {
        arrayFilters: [{ 'phase._id': phaseId }],
        new: true,
        runValidators: true
      }
    );

    if (!updatedTournament) {
      return res.status(500).json({ error: 'Failed to update groups' });
    }

    res.json({
      message: 'Groups updated successfully',
      tournament: updatedTournament
    });
  } catch (error) {
    console.error('Error updating groups:', error);
    res.status(500).json({ error: 'Failed to update groups', details: error.message });
  }
});

// Admin routes for tournament approval system
router.get('/admin/pending-approval', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const tournaments = await Tournament.find({
      _approvalStatus: 'pending'
    })
      .sort({ _submittedAt: -1 })
      .populate('_submittedBy', 'name email')
      .select('tournamentName shortName gameTitle region tier _submittedAt _submittedBy organizer');

    res.json({ tournaments });
  } catch (error) {
    console.error('Error fetching pending tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch pending tournaments' });
  }
});

router.post('/:id/approve', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const tournament = await Tournament.findByIdAndUpdate(
      id,
      {
        _approvalStatus: 'approved',
        _approvedBy: req.user.id,
        _approvedAt: new Date()
      },
      { new: true }
    );

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({
      message: 'Tournament approved successfully',
      tournament
    });
  } catch (error) {
    console.error('Error approving tournament:', error);
    res.status(500).json({ error: 'Failed to approve tournament' });
  }
});

router.post('/:id/reject', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const tournament = await Tournament.findByIdAndUpdate(
      id,
      {
        _approvalStatus: 'rejected',
        _rejectedBy: req.user.id,
        _rejectedAt: new Date(),
        _rejectionReason: reason
      },
      { new: true }
    );

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({
      message: 'Tournament rejected successfully',
      tournament
    });
  } catch (error) {
    console.error('Error rejecting tournament:', error);
    res.status(500).json({ error: 'Failed to reject tournament' });
  }
});

// NEW ROUTE: Lightweight summary for mobile initial load
router.get('/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid tournament ID' });
    }

    const tournament = await Tournament.findById(id)
      .select(`
        tournamentName shortName gameTitle region tier status currentCompetitionPhase
        startDate endDate registrationStartDate registrationEndDate
        media.logo media.banner media.coverImage
        prizePool.total prizePool.currency
        slots.total
        organizer.name
        gameSettings.maps gameSettings.gameMode gameSettings.pointsSystem
        streamLinks
        socialMedia
      `)
      .lean();

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Get team count
    const teamCount = await Tournament.findById(id)
      .select('participatingTeams')
      .lean()
      .then(t => t?.participatingTeams?.length || 0);

    // Get basic stats
    const stats = await Match.aggregate([
      { $match: { tournament: new mongoose.Types.ObjectId(id), status: 'completed' } },
      {
        $group: {
          _id: null,
          totalMatches: { $sum: 1 },
          totalKills: { $sum: '$matchStats.totalKills' }
        }
      }
    ]);

    res.json({
      tournament: {
        _id: tournament._id,
        name: tournament.tournamentName,
        shortName: tournament.shortName,
        game: tournament.gameTitle,
        region: tournament.region,
        tier: tournament.tier,
        status: tournament.status,
        currentPhase: tournament.currentCompetitionPhase,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        registrationStartDate: tournament.registrationStartDate,
        registrationEndDate: tournament.registrationEndDate,
        teams: teamCount,
        totalSlots: tournament.slots?.total || 0,
        media: tournament.media,
        prizePool: tournament.prizePool,
        organizer: tournament.organizer,
        gameSettings: tournament.gameSettings,
        streamLinks: tournament.streamLinks,
        socialMedia: tournament.socialMedia,
        statistics: {
          totalMatches: stats[0]?.totalMatches || 0,
          totalKills: stats[0]?.totalKills || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching tournament summary:', error);
    res.status(500).json({ error: 'Failed to fetch tournament summary' });
  }
});

export default router;
