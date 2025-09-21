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

export default router;
