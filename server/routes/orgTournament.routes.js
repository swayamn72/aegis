import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Tournament from '../models/tournament.model.js';
import Team from '../models/team.model.js';
import Player from '../models/player.model.js';
import Organization from '../models/organization.model.js';
import Match from '../models/match.model.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Multer setup
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

// Auth middleware
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

// Helper function for placement points
const getPlacementPoints = (position) => {
  const pointsMap = { 1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1 };
  return pointsMap[position] || 0;
};

// Get all tournaments
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
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// Get specific tournament
router.get('/:tournamentId', verifyOrgAuth, async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId)
      .populate('participatingTeams.team', 'teamName teamTag logo primaryGame region')
      .populate('phases.teams', 'teamName teamTag logo')
      .populate('phases.groups.teams', 'teamName teamTag logo')
      .populate('phases.groups.standings.team', 'teamName teamTag logo');

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.organizer.organizationRef?.toString() !== req.organization._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ tournament });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

// Create tournament
router.post('/create-tournament', verifyOrgAuth, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const tournamentData = JSON.parse(req.body.tournamentData);

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
      visibility: 'private',
      verified: false,
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

// Update tournament
router.put('/:tournamentId', verifyOrgAuth, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { tournamentId } = req.params;
    let updateData = req.body.tournamentData ? JSON.parse(req.body.tournamentData) : req.body;

    if (updateData.phases && typeof updateData.phases === 'string') {
      updateData.phases = JSON.parse(updateData.phases);
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.organizer.organizationRef?.toString() !== req.organization._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

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

    if (Object.keys(mediaUrls).length > 0) {
      updateData.media = { ...tournament.media, ...mediaUrls };
    }

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

// Add team to phase
router.post('/:tournamentId/phases/:phase/teams', verifyOrgAuth, async (req, res) => {
  try {
    const { tournamentId, phase } = req.params;
    const { teamId } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.organizer.organizationRef?.toString() !== req.organization._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const phaseIndex = tournament.phases.findIndex(p => p.name === phase);
    if (phaseIndex === -1) {
      return res.status(404).json({ error: 'Phase not found' });
    }

    const targetPhase = tournament.phases[phaseIndex];
    if (!targetPhase.teams) targetPhase.teams = [];

    if (targetPhase.teams.some(t => t.toString() === teamId)) {
      return res.status(400).json({ error: 'Team already in this phase' });
    }

    targetPhase.teams.push(teamId);

    const participatingTeamIndex = tournament.participatingTeams.findIndex(
      pt => pt.team.toString() === teamId
    );
    if (participatingTeamIndex !== -1) {
      tournament.participatingTeams[participatingTeamIndex].currentStage = phase;
    }

    await tournament.save();
    res.json({ tournament });
  } catch (error) {
    console.error('Error adding team to phase:', error);
    res.status(500).json({ error: 'Failed to add team to phase' });
  }
});

// Remove team from phase
router.delete('/:tournamentId/phases/:phase/teams/:teamId', verifyOrgAuth, async (req, res) => {
  try {
    const { tournamentId, phase, teamId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.organizer.organizationRef?.toString() !== req.organization._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const phaseIndex = tournament.phases.findIndex(p => p.name === phase);
    if (phaseIndex === -1) {
      return res.status(404).json({ error: 'Phase not found' });
    }

    const targetPhase = tournament.phases[phaseIndex];
    if (!targetPhase.teams) targetPhase.teams = [];

    const teamIndexInPhase = targetPhase.teams.findIndex(t => t.toString() === teamId);
    if (teamIndexInPhase === -1) {
      return res.status(400).json({ error: 'Team not in this phase' });
    }

    targetPhase.teams.splice(teamIndexInPhase, 1);

    const participatingTeamIndex = tournament.participatingTeams.findIndex(
      pt => pt.team.toString() === teamId
    );
    if (participatingTeamIndex !== -1) {
      tournament.participatingTeams[participatingTeamIndex].currentStage = '';
    }

    await tournament.save();
    res.json({ tournament });
  } catch (error) {
    console.error('Error removing team from phase:', error);
    res.status(500).json({ error: 'Failed to remove team from phase' });
  }
});

// **FIXED ADVANCE PHASE ROUTE** - Now properly handles phase name references
router.post('/:tournamentId/advance-phase', verifyOrgAuth, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { phaseName } = req.body;

    console.log('=== ADVANCE PHASE START ===');
    console.log('Tournament ID:', tournamentId);
    console.log('Phase Name:', phaseName);

    const tournament = await Tournament.findById(tournamentId)
      .populate('participatingTeams.team', 'teamName teamTag logo');

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.organizer.organizationRef?.toString() !== req.organization._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const phaseIndex = tournament.phases.findIndex(p => p.name === phaseName);
    if (phaseIndex === -1) {
      return res.status(404).json({ error: 'Phase not found' });
    }

    const currentPhase = tournament.phases[phaseIndex];
    console.log('Current phase:', currentPhase.name, 'Status:', currentPhase.status);

    // Fetch completed matches for this phase
    const matches = await Match.find({
      tournament: tournamentId,
      tournamentPhase: phaseName,
      status: 'completed'
    }).populate('participatingTeams.team', 'teamName teamTag logo');

    console.log(`Found ${matches.length} completed matches`);

    // Calculate overall standings from matches
    const overallTeamStandings = {};

    matches.forEach((match) => {
      match.participatingTeams?.forEach(teamResult => {
        const teamId = teamResult.team?._id || teamResult.team;
        if (!teamId) return;

        const teamIdStr = teamId.toString();

        if (!overallTeamStandings[teamIdStr]) {
          overallTeamStandings[teamIdStr] = {
            team: teamId,
            position: 0,
            matchesPlayed: 0,
            chickenDinners: 0,
            points: 0,
            kills: 0
          };
        }

        const position = teamResult.finalPosition;
        const kills = teamResult.kills?.total || 0;

        if (position || kills > 0) {
          const placementPoints = getPlacementPoints(position);
          const totalMatchPoints = placementPoints + kills;

          overallTeamStandings[teamIdStr].points += totalMatchPoints;
          overallTeamStandings[teamIdStr].kills += kills;
          overallTeamStandings[teamIdStr].matchesPlayed += 1;

          if (position === 1) {
            overallTeamStandings[teamIdStr].chickenDinners += 1;
          }
        }
      });
    });

    // Sort overall standings
    const sortedOverallStandings = Object.values(overallTeamStandings)
      .sort((a, b) => {
        if (a.points !== b.points) return b.points - a.points;
        if (a.kills !== b.kills) return b.kills - a.kills;
        if (a.chickenDinners !== b.chickenDinners) return b.chickenDinners - a.chickenDinners;
        return a.matchesPlayed - b.matchesPlayed;
      })
      .map((standing, index) => ({
        ...standing,
        position: index + 1
      }));

    console.log('Sorted overall standings:', sortedOverallStandings.length, 'teams');

    // Calculate group-specific standings
    if (currentPhase.groups && currentPhase.groups.length > 0) {
      currentPhase.groups.forEach(group => {
        if (!group.teams || group.teams.length === 0) return;

        const groupTeamIds = group.teams.map(t => t.toString());
        const groupStandings = {};

        matches.forEach(match => {
          match.participatingTeams?.forEach(teamResult => {
            const teamId = teamResult.team?._id || teamResult.team;
            const teamIdStr = teamId?.toString();

            if (teamIdStr && groupTeamIds.includes(teamIdStr)) {
              if (!groupStandings[teamIdStr]) {
                groupStandings[teamIdStr] = {
                  team: teamId,
                  position: 0,
                  matchesPlayed: 0,
                  chickenDinners: 0,
                  points: 0,
                  kills: 0
                };
              }

              const position = teamResult.finalPosition;
              const kills = teamResult.kills?.total || 0;

              if (position || kills > 0) {
                const placementPoints = getPlacementPoints(position);
                groupStandings[teamIdStr].points += placementPoints + kills;
                groupStandings[teamIdStr].kills += kills;
                groupStandings[teamIdStr].matchesPlayed += 1;
                if (position === 1) groupStandings[teamIdStr].chickenDinners += 1;
              }
            }
          });
        });

        // Sort and assign to group
        group.standings = Object.values(groupStandings)
          .sort((a, b) => {
            if (a.points !== b.points) return b.points - a.points;
            if (a.kills !== b.kills) return b.kills - a.kills;
            if (a.chickenDinners !== b.chickenDinners) return b.chickenDinners - a.chickenDinners;
            return a.matchesPlayed - b.matchesPlayed;
          })
          .map((standing, index) => ({
            ...standing,
            position: index + 1
          }));

        console.log(`Group ${group.name} standings:`, group.standings.length, 'teams');
      });
    }

    // Populate team data in standings
    const allTeamIds = new Set(sortedOverallStandings.map(s => s.team.toString()));
    currentPhase.groups?.forEach(group => {
      group.standings?.forEach(s => allTeamIds.add(s.team.toString()));
    });

    const teams = await Team.find({ _id: { $in: Array.from(allTeamIds) } })
      .select('teamName teamTag logo');
    
    const teamMap = {};
    teams.forEach(team => {
      teamMap[team._id.toString()] = {
        _id: team._id,
        teamName: team.teamName,
        teamTag: team.teamTag,
        logo: team.logo
      };
    });

    // Populate overall standings
    sortedOverallStandings.forEach(standing => {
      const teamData = teamMap[standing.team.toString()];
      if (teamData) standing.team = teamData;
    });

    // Populate group standings
    currentPhase.groups?.forEach(group => {
      group.standings?.forEach(standing => {
        const teamData = teamMap[standing.team.toString()];
        if (teamData) standing.team = teamData;
      });
    });

    // Store overall standings in a special group
    if (!currentPhase.groups) currentPhase.groups = [];
    let overallGroup = currentPhase.groups.find(g => g.name === 'overall');
    if (!overallGroup) {
      overallGroup = { name: 'overall', teams: [], standings: [] };
      currentPhase.groups.push(overallGroup);
    }
    overallGroup.standings = sortedOverallStandings;

    // Mark current phase as completed
    currentPhase.status = 'completed';
    console.log('Marked phase as completed');

    // Advance teams to next phase
    const teamsAdvanced = [];
    if (phaseIndex + 1 < tournament.phases.length) {
      // ✅ FIXED: Now properly finds next phase by name from qualification rules
      if (currentPhase.qualificationRules && currentPhase.qualificationRules.length > 0) {
        console.log('Using CURRENT phase qualification rules');
        
        const qualifiedTeams = new Set();

        currentPhase.qualificationRules.forEach(rule => {
          const numberOfTeams = rule.numberOfTeams || 0;
          const source = rule.source || 'overall';
          const nextPhaseName = rule.nextPhase; // ✅ This is now a string (phase name)
          
          console.log(`Rule: ${numberOfTeams} teams from ${source} to ${nextPhaseName}`);

          // ✅ Find next phase by name
          const nextPhaseIndex = tournament.phases.findIndex(p => p.name === nextPhaseName);
          if (nextPhaseIndex === -1) {
            console.warn(`Next phase "${nextPhaseName}" not found`);
            return;
          }

          const nextPhase = tournament.phases[nextPhaseIndex];

          if (source === 'overall' && sortedOverallStandings.length > 0) {
            const topTeams = sortedOverallStandings
              .slice(0, numberOfTeams)
              .map(s => s.team._id.toString());
            console.log('Teams from overall:', topTeams);
            topTeams.forEach(t => qualifiedTeams.add(t));
          } else if (source === 'from_each_group') {
            currentPhase.groups?.forEach(group => {
              if (group.name === 'overall') return; // Skip overall group
              if (group.standings && group.standings.length > 0) {
                const topTeamsFromGroup = group.standings
                  .slice(0, numberOfTeams)
                  .map(s => s.team._id.toString());
                console.log(`Teams from group ${group.name}:`, topTeamsFromGroup);
                topTeamsFromGroup.forEach(t => qualifiedTeams.add(t));
              }
            });
          }

          // Add qualified teams to the next phase
          const qualifiedTeamsArray = Array.from(qualifiedTeams);
          console.log(`Adding ${qualifiedTeamsArray.length} teams to ${nextPhase.name}`);
          
          if (!nextPhase.teams) nextPhase.teams = [];
          
          // Add only new teams (avoid duplicates)
          qualifiedTeamsArray.forEach(teamId => {
            if (!nextPhase.teams.some(t => t.toString() === teamId)) {
              nextPhase.teams.push(teamId);
            }
          });

          nextPhase.status = 'upcoming';

          // Update participating teams' current stage
          qualifiedTeamsArray.forEach(teamId => {
            const ptIndex = tournament.participatingTeams.findIndex(
              pt => (pt.team?._id || pt.team).toString() === teamId
            );
            if (ptIndex !== -1) {
              tournament.participatingTeams[ptIndex].currentStage = nextPhase.name;
            }
          });

          teamsAdvanced.push(...qualifiedTeamsArray);
        });
      } else {
        console.log('No qualification rules - advancing all teams');
        const nextPhase = tournament.phases[phaseIndex + 1];
        const allTeams = currentPhase.teams || [];
        nextPhase.teams = allTeams.map(t => t.toString());
        nextPhase.status = 'upcoming';

        nextPhase.teams.forEach(teamId => {
          const ptIndex = tournament.participatingTeams.findIndex(
            pt => (pt.team?._id || pt.team).toString() === teamId.toString()
          );
          if (ptIndex !== -1) {
            tournament.participatingTeams[ptIndex].currentStage = nextPhase.name;
          }
        });

        teamsAdvanced.push(...nextPhase.teams);
      }
    } else {
      console.log('This is the final phase');
      // This is the final phase - update final standings
      tournament.finalStandings = sortedOverallStandings.map((standing, index) => ({
        position: index + 1,
        team: standing.team._id,
        tournamentPointsAwarded: standing.points,
        prize: tournament.prizePool?.distribution?.find(d => 
          d.position === (index + 1) || d.position === (index + 1).toString()
        )
      }));
      tournament.status = 'completed';
      console.log('Updated final standings');
    }

    await tournament.save();
    console.log('Tournament saved successfully');
    console.log('=== ADVANCE PHASE END ===');

    res.json({
      message: 'Phase advanced successfully',
      teamsAdvanced: teamsAdvanced.length,
      standingsCalculated: sortedOverallStandings.length,
      matchesProcessed: matches.length,
      tournament
    });
  } catch (error) {
    console.error('Error advancing phase:', error);
    res.status(500).json({ error: 'Failed to advance phase', details: error.message });
  }
});

// Delete tournament
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