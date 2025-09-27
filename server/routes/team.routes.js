import express from 'express';
import Team from '../models/team.model.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/teams/:id - Fetch a single team by ID
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('captain', 'username profilePicture primaryGame inGameName realName')
      .populate('players', 'username profilePicture primaryGame inGameName realName verified inGameRole aegisRating tournamentsPlayed matchesPlayed')
      .populate('organization', 'orgName logo description establishedDate')
      .select('-__v -profileVisibility');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Server error fetching team' });
  }
});

// GET /api/teams/my-teams - Fetch teams the current user is part of
router.get('/my-teams', auth, async (req, res) => {
  try {
    const teams = await Team.find({ players: req.user._id })
      .populate('captain', 'username profilePicture primaryGame')
      .populate('players', 'username profilePicture primaryGame')
      .populate('organization', 'name logo')
      .select('-__v')
      .sort({ establishedDate: -1 });

    res.json(teams);
  } catch (error) {
    console.error('Error fetching user teams:', error);
    res.status(500).json({ message: 'Server error fetching teams' });
  }
});

export default router;
