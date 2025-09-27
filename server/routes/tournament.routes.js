import express from 'express';
import Tournament from '../models/tournament.model.js';

const router = express.Router();

// Get all tournaments (excluding featured/primary ones)
router.get('/all', async (req, res) => {
  try {
    const tournaments = await Tournament.find({
      visibility: 'public',
      featured: { $ne: true } // Exclude featured tournaments
    })
    .sort({ startDate: -1 })
    .limit(50)
    .select('tournamentName gameTitle region tier status startDate endDate prizePool media organizer participatingTeams')
    .populate('participatingTeams.team', 'teamName logo');

    res.json({ tournaments });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Get tournaments by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const tournaments = await Tournament.find({
      status: status,
      visibility: 'public',
      featured: { $ne: true }
    })
    .sort({ startDate: -1 })
    .limit(20)
    .select('tournamentName gameTitle region tier status startDate endDate prizePool media organizer');

    res.json({ tournaments });
  } catch (error) {
    console.error('Error fetching tournaments by status:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Get tournaments by game
router.get('/game/:gameTitle', async (req, res) => {
  try {
    const { gameTitle } = req.params;
    const tournaments = await Tournament.find({
      gameTitle: gameTitle,
      visibility: 'public',
      featured: { $ne: true }
    })
    .sort({ startDate: -1 })
    .limit(20)
    .select('tournamentName gameTitle region tier status startDate endDate prizePool media organizer');

    res.json({ tournaments });
  } catch (error) {
    console.error('Error fetching tournaments by game:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Get live tournaments
router.get('/live', async (req, res) => {
  try {
    const now = new Date();
    const tournaments = await Tournament.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: { $in: ['qualifiers_in_progress', 'in_progress', 'group_stage', 'playoffs', 'finals'] },
      visibility: 'public',
      featured: { $ne: true }
    })
    .sort({ startDate: 1 })
    .limit(10)
    .select('tournamentName gameTitle region tier status startDate endDate prizePool media organizer');

    res.json({ tournaments });
  } catch (error) {
    console.error('Error fetching live tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch live tournaments' });
  }
});

// Get upcoming tournaments
router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const tournaments = await Tournament.find({
      startDate: { $gte: now },
      visibility: 'public',
      featured: { $ne: true }
    })
    .sort({ startDate: 1 })
    .limit(20)
    .select('tournamentName gameTitle region tier status startDate endDate prizePool media organizer');

    res.json({ tournaments });
  } catch (error) {
    console.error('Error fetching upcoming tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming tournaments' });
  }
});

// Get single tournament by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id)
      .populate('participatingTeams.team', 'teamName logo')
      .populate('organizer', 'name');

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Mock additional data for the detailed view
    const tournamentData = {
      name: tournament.tournamentName,
      game: tournament.gameTitle,
      region: tournament.region,
      tier: tournament.tier,
      status: tournament.status,
      currentPhase: tournament.currentPhase || 'Group Stage',
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      teams: tournament.participatingTeams?.length || 0,
      description: tournament.description || 'A competitive esports tournament featuring top teams from around the world.',
      media: {
        banner: tournament.media?.banner || 'https://placehold.co/1200x400/1a1a1a/ffffff?text=Tournament+Banner',
        coverImage: tournament.media?.coverImage || 'https://placehold.co/1200x600/1a1a1a/ffffff?text=Tournament+Cover+Image',
        logo: tournament.media?.logo || 'https://placehold.co/200x200/1a1a1a/ffffff?text=Logo'
      },
      organizer: {
        name: tournament.organizer?.name || 'AEGIS Esports'
      },
      venue: tournament.venue || 'Online',
      format: tournament.format || 'Single Elimination',
      gameSettings: tournament.gameSettings || {
        mode: 'TPP',
        serverRegion: 'Asia',
        maps: ['Erangel', 'Miramar', 'Sanhok'],
        pointsSystem: {
          killPoints: 1,
          placementPoints: {
            1: 10,
            2: 6,
            3: 5,
            4: 4
          }
        }
      },
      prizePool: tournament.prizePool || {
        total: 10000000,
        currency: 'INR',
        distribution: [
          { position: '1st', amount: 5000000 },
          { position: '2nd', amount: 3000000 },
          { position: '3rd', amount: 2000000 }
        ],
        individualAwards: [
          { award: 'Most Kills', description: 'Player with highest eliminations', amount: 100000 }
        ]
      },
      phases: tournament.phases || [
        { name: 'Group Stage', status: 'completed', startDate: '2025-08-15', endDate: '2025-08-20', description: 'Round-robin group matches' },
        { name: 'Playoffs', status: 'in_progress', startDate: '2025-08-22', endDate: '2025-08-25', description: 'Single elimination bracket' },
        { name: 'Finals', status: 'upcoming', startDate: '2025-08-27', endDate: '2025-08-27', description: 'Championship final' }
      ],
      viewership: {
        currentViewers: 125000,
        peakViewers: 250000,
        totalViews: 2500000,
        averageViewers: 180000
      }
    };

    const scheduleData = [
      { phase: 'Group Stage', match: 'Group A - Round 1 - Match 1', teams: 'Team Soul vs TSM', date: '2025-08-15', time: '18:00', status: 'completed' },
      { phase: 'Group Stage', match: 'Group A - Round 1 - Match 2', teams: 'GodLike vs OR Esports', date: '2025-08-15', time: '19:30', status: 'completed' },
      { phase: 'Playoffs', match: 'Quarter Finals - Match 1', teams: 'Team Soul vs Blind Esports', date: '2025-08-22', time: '18:00', status: 'upcoming', streamUrl: 'https://twitch.tv/aegisesports' },
      { phase: 'Playoffs', match: 'Quarter Finals - Match 2', teams: 'TSM vs Revenant', date: '2025-08-22', time: '19:30', status: 'upcoming' }
    ];

    const groupsData = {
      A: {
        standings: [
          { rank: 1, team: { name: 'Team Soul', logo: 'https://placehold.co/40x40/FF6B6B/FFFFFF?text=S' }, points: 45, kills: 156, averagePlacement: 2.3, matchesPlayed: 6, chickenDinners: 2, isQualified: true },
          { rank: 2, team: { name: 'TSM', logo: 'https://placehold.co/40x40/4ECDC4/FFFFFF?text=T' }, points: 42, kills: 142, averagePlacement: 2.5, matchesPlayed: 6, chickenDinners: 1, isQualified: true },
          { rank: 3, team: { name: 'GodLike', logo: 'https://placehold.co/40x40/45B7D1/FFFFFF?text=G' }, points: 38, kills: 134, averagePlacement: 2.8, matchesPlayed: 6, chickenDinners: 1, isQualified: false },
          { rank: 4, team: { name: 'OR Esports', logo: 'https://placehold.co/40x40/F7DC6F/FFFFFF?text=OR' }, points: 35, kills: 128, averagePlacement: 3.1, matchesPlayed: 6, chickenDinners: 0, isQualified: false }
        ]
      },
      B: {
        standings: [
          { rank: 1, team: { name: 'Revenant', logo: 'https://placehold.co/40x40/BB8FCE/FFFFFF?text=R' }, points: 47, kills: 164, averagePlacement: 2.1, matchesPlayed: 6, chickenDinners: 3, isQualified: true },
          { rank: 2, team: { name: 'Blind Esports', logo: 'https://placehold.co/40x40/85C1E9/FFFFFF?text=BE' }, points: 44, kills: 148, averagePlacement: 2.4, matchesPlayed: 6, chickenDinners: 2, isQualified: true },
          { rank: 3, team: { name: 'Velocity Gaming', logo: 'https://placehold.co/40x40/82E0AA/FFFFFF?text=VG' }, points: 39, kills: 138, averagePlacement: 2.7, matchesPlayed: 6, chickenDinners: 1, isQualified: false },
          { rank: 4, team: { name: 'Team XO', logo: 'https://placehold.co/40x40/F1948A/FFFFFF?text=XO' }, points: 36, kills: 132, averagePlacement: 3.0, matchesPlayed: 6, chickenDinners: 0, isQualified: false }
        ]
      }
    };

    const tournamentStats = {
      completedMatches: 24,
      totalMatches: 30,
      totalKills: 1250,
      averageKills: 52,
      chickenDinners: 12,
      averageMatchDuration: 24,
      shortestMatch: 18,
      longestMatch: 32,
      mostKillsInMatch: { player: 'ScoutOP', team: 'Team Soul', count: 18 },
      highestDamageInMatch: { player: 'Jonathan', team: 'TSM', amount: 3245 },
      mapStats: [
        { mapName: 'Erangel', timesPlayed: 12, averageDuration: 26, averageKills: 54 },
        { mapName: 'Miramar', timesPlayed: 10, averageDuration: 22, averageKills: 48 },
        { mapName: 'Sanhok', timesPlayed: 8, averageDuration: 20, averageKills: 46 }
      ]
    };

    const streamLinks = [
      { title: 'Main Stream', viewers: 125000, isLive: true, platform: 'Twitch', language: 'English', commentaryType: 'Professional' },
      { title: 'Hindi Stream', viewers: 45000, isLive: true, platform: 'YouTube', language: 'Hindi', commentaryType: 'Professional' },
      { title: 'Telugu Stream', viewers: 28000, isLive: true, platform: 'Twitch', language: 'Telugu', commentaryType: 'Professional' },
      { title: 'Tamil Stream', viewers: 15000, isLive: false, platform: 'YouTube', language: 'Tamil', commentaryType: 'Professional' }
    ];

    res.json({
      tournamentData,
      scheduleData,
      groupsData,
      tournamentStats,
      streamLinks
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

// Update tournament groups (for backward compatibility)
router.put('/:tournamentId/groups', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { groups, phaseId } = req.body;

    let updateData;

    if (phaseId) {
      // Update groups within a specific phase
      updateData = {
        $set: { 'phases.$[phase].groups': groups }
      };
      const options = {
        arrayFilters: [{ 'phase.name': phaseId }], // Use phase name instead of _id
        new: true
      };

      const tournament = await Tournament.findByIdAndUpdate(tournamentId, updateData, options);

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }
    } else {
      // Update groups at tournament level (backward compatibility)
      updateData = { groups };
      const tournament = await Tournament.findByIdAndUpdate(tournamentId, updateData, { new: true });

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }
    }

    res.json({ tournament });
  } catch (error) {
    console.error('Error updating tournament groups:', error);
    res.status(500).json({ error: 'Failed to update tournament groups' });
  }
});

export default router;
