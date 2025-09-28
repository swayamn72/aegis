import express from 'express';
import mongoose from 'mongoose';
import Tournament from '../models/tournament.model.js';
import Match from '../models/match.model.js';
import Team from '../models/team.model.js';

const router = express.Router();

// Get all tournaments (excluding featured/primary ones)
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 50, game, region, status, tier } = req.query;
    
    // Build filter query
    const filter = {
      visibility: 'public'
    };
    
    if (game) filter.gameTitle = game;
    if (region) filter.region = region;
    if (status) filter.status = status;
    if (tier) filter.tier = tier;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tournaments = await Tournament.find(filter)
      .sort({ startDate: -1, featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(`
        tournamentName shortName gameTitle region tier status startDate endDate 
        prizePool media organizer participatingTeams statistics slots featured verified
      `)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo',
        model: 'Team'
      })
      .lean();

    // Calculate additional fields
    const enrichedTournaments = tournaments.map(tournament => ({
      ...tournament,
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
      }
    }));

    const total = await Tournament.countDocuments(filter);

    res.json({
      tournaments: enrichedTournaments,
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
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Get tournaments by status with better error handling
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const { limit = 20, game, region } = req.query;
    
    const filter = {
      status: status,
      visibility: 'public'
    };
    
    if (game) filter.gameTitle = game;
    if (region) filter.region = region;

    const tournaments = await Tournament.find(filter)
      .sort({ startDate: status === 'completed' ? -1 : 1 })
      .limit(parseInt(limit))
      .select(`
        tournamentName shortName gameTitle region tier status startDate endDate 
        prizePool media organizer participatingTeams statistics slots
      `)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo'
      })
      .lean();

    const enrichedTournaments = tournaments.map(tournament => ({
      ...tournament,
      participantCount: tournament.participatingTeams?.length || tournament.statistics?.totalParticipatingTeams || 0,
      totalSlots: tournament.slots?.total || null,
      startDate: tournament.startDate ? tournament.startDate.toISOString() : null,
      endDate: tournament.endDate ? tournament.endDate.toISOString() : null
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
    const now = new Date();
    const { limit = 10 } = req.query;
    
    const tournaments = await Tournament.find({
      $and: [
        {
          $or: [
            { startDate: { $lte: now }, endDate: { $gte: now } },
            { status: { $in: ['qualifiers_in_progress', 'in_progress', 'group_stage', 'playoffs', 'finals'] } }
          ]
        },
        { visibility: 'public' }
      ]
    })
    .sort({ startDate: 1 })
    .limit(parseInt(limit))
    .select(`
      tournamentName shortName gameTitle region tier status startDate endDate 
      prizePool media organizer participatingTeams statistics streamLinks
    `)
    .populate({
      path: 'participatingTeams.team',
      select: 'teamName teamTag logo'
    })
    .lean();

    const enrichedTournaments = tournaments.map(tournament => ({
      ...tournament,
      participantCount: tournament.participatingTeams?.length || 0,
      isLive: ['qualifiers_in_progress', 'in_progress', 'group_stage', 'playoffs', 'finals'].includes(tournament.status),
      hasActiveStreams: tournament.streamLinks?.length > 0
    }));

    res.json({ tournaments: enrichedTournaments });
  } catch (error) {
    console.error('Error fetching live tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch live tournaments' });
  }
});

// Get upcoming tournaments
router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const { limit = 20 } = req.query;
    
    const tournaments = await Tournament.find({
      $or: [
        { startDate: { $gte: now } },
        { status: { $in: ['announced', 'registration_open', 'registration_closed'] } }
      ],
      visibility: 'public'
    })
    .sort({ startDate: 1 })
    .limit(parseInt(limit))
    .select(`
      tournamentName shortName gameTitle region tier status startDate endDate 
      prizePool media organizer participatingTeams statistics slots registrationStartDate registrationEndDate
    `)
    .lean();

    const enrichedTournaments = tournaments.map(tournament => {
      let registrationStatus = 'closed';
      if (tournament.registrationStartDate && tournament.registrationEndDate) {
        if (now < tournament.registrationStartDate) {
          registrationStatus = 'upcoming';
        } else if (now >= tournament.registrationStartDate && now <= tournament.registrationEndDate) {
          registrationStatus = 'open';
        }
      }

      return {
        ...tournament,
        participantCount: tournament.participatingTeams?.length || 0,
        totalSlots: tournament.slots?.total || null,
        registrationStatus,
        daysUntilStart: tournament.startDate ? Math.ceil((new Date(tournament.startDate) - now) / (1000 * 60 * 60 * 24)) : null
      };
    });

    res.json({ tournaments: enrichedTournaments });
  } catch (error) {
    console.error('Error fetching upcoming tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming tournaments' });
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
      tournamentName shortName gameTitle region tier status startDate endDate 
      prizePool media organizer participatingTeams statistics streamLinks
    `)
    .populate({
      path: 'participatingTeams.team',
      select: 'teamName teamTag logo'
    })
    .lean();

    const enrichedTournaments = tournaments.map(tournament => ({
      ...tournament,
      participantCount: tournament.participatingTeams?.length || 0,
      isLive: ['qualifiers_in_progress', 'in_progress', 'group_stage', 'playoffs', 'finals'].includes(tournament.status)
    }));

    res.json({ tournaments: enrichedTournaments });
  } catch (error) {
    console.error('Error fetching featured tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch featured tournaments' });
  }
});

// Get single tournament by ID with comprehensive data
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid tournament ID' });
    }

    const tournament = await Tournament.findById(id)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag logo primaryGame region establishedDate'
      })
      .populate('organizer', 'name website contactEmail')
      .populate({
        path: 'phases.groups.teams',
        select: 'teamName teamTag logo'
      })
      .populate({
        path: 'phases.groups.standings.team',
        select: 'teamName teamTag logo'
      })
      .lean();

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Fetch recent matches for this tournament
    const recentMatches = await Match.find({ tournament: id })
      .sort({ scheduledStartTime: -1 })
      .limit(20)
      .populate({
        path: 'participatingTeams.team',
        select: 'teamName teamTag'
      })
      .select(`
        matchNumber matchType tournamentPhase scheduledStartTime actualStartTime actualEndTime
        status map participatingTeams matchStats
      `)
      .lean();

    // Calculate live statistics from matches
    const matchStatsAgg = await Match.aggregate([
      { $match: { tournament: new mongoose.Types.ObjectId(id), status: 'completed' } },
      {
        $group: {
          _id: null,
          totalMatches: { $sum: 1 },
          totalKills: { $sum: '$matchStats.totalKills' },
          totalDamage: { $sum: '$matchStats.totalDamage' },
          avgDuration: { $avg: '$matchDuration' },
          minDuration: { $min: '$matchDuration' },
          maxDuration: { $max: '$matchDuration' }
        }
      }
    ]);

    const liveStats = matchStatsAgg[0] || {};

    // Build comprehensive tournament data
    const tournamentData = {
      _id: tournament._id,
      name: tournament.tournamentName,
      shortName: tournament.shortName,
      game: tournament.gameTitle,
      region: tournament.region,
      tier: tournament.tier,
      status: tournament.status,
      currentPhase: tournament.currentCompetitionPhase || 
                   tournament.phases?.find(p => p.status === 'in_progress')?.name || 
                   'Not Started',
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      registrationStartDate: tournament.registrationStartDate,
      registrationEndDate: tournament.registrationEndDate,
      teams: tournament.participatingTeams?.length || 0,
      totalSlots: tournament.slots?.total || 0,
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
        name: phase.name,
        type: phase.type,
        status: phase.status,
        startDate: phase.startDate,
        endDate: phase.endDate,
        description: phase.details,
        groups: phase.groups || []
      })) || [],
      
      statistics: {
        totalMatches: liveStats.totalMatches || 0,
        totalParticipatingTeams: tournament.participatingTeams?.length || 0,
        totalKills: liveStats.totalKills || 0,
        averageMatchDuration: Math.round(liveStats.avgDuration || 0),
        shortestMatch: liveStats.minDuration || 0,
        longestMatch: liveStats.maxDuration || 0,
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

    // Build schedule data from matches
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

    // Build groups data from tournament phases
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
      scheduleData,
      groupsData,
      tournamentStats: tournamentData.statistics,
      streamLinks: tournamentData.streamLinks
    });

  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament details' });
  }
});

// Search tournaments
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20, game, region } = req.query;

    const filter = {
      visibility: 'public',
      $or: [
        { tournamentName: { $regex: query, $options: 'i' } },
        { shortName: { $regex: query, $options: 'i' } },
        { 'organizer.name': { $regex: query, $options: 'i' } }
      ]
    };

    if (game) filter.gameTitle = game;
    if (region) filter.region = region;

    const tournaments = await Tournament.find(filter)
      .sort({ startDate: -1, featured: -1 })
      .limit(parseInt(limit))
      .select(`
        tournamentName shortName gameTitle region tier status startDate endDate 
        prizePool media organizer participatingTeams
      `)
      .lean();

    res.json({ tournaments });
  } catch (error) {
    console.error('Error searching tournaments:', error);
    res.status(500).json({ error: 'Failed to search tournaments' });
  }
});

export default router;