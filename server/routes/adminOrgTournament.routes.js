import express from 'express';
import Tournament from '../models/tournament.model.js';
import { verifyAdminToken } from '../middleware/adminAuth.js';

const router = express.Router();

// Get all pending organization tournaments
router.get('/pending-org-tournaments', verifyAdminToken, async (req, res) => {
  try {
    const pendingTournaments = await Tournament.find({
      _approvalStatus: 'pending',
      'organizer.organizationRef': { $exists: true }
    })
      .populate('organizer.organizationRef', 'orgName logo email')
      .sort({ _submittedAt: -1 })
      .lean();

    res.json({
      tournaments: pendingTournaments,
      count: pendingTournaments.length
    });
  } catch (error) {
    console.error('Error fetching pending org tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch pending tournaments' });
  }
});

// Approve organization tournament
router.post('/approve-org-tournament/:tournamentId', verifyAdminToken, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { featured = false, verified = true } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament._approvalStatus !== 'pending') {
      return res.status(400).json({ error: 'Tournament is not pending approval' });
    }

    // Approve tournament
    tournament._approvalStatus = 'approved';
    tournament._approvedBy = req.admin._id;
    tournament._approvedAt = new Date();
    tournament.visibility = 'public';
    tournament.verified = verified;
    tournament.featured = featured;
    tournament.status = 'announced'; // Set initial status

    await tournament.save();

    // TODO: Send notification to organization

    res.json({
      message: 'Tournament approved successfully',
      tournament
    });
  } catch (error) {
    console.error('Error approving tournament:', error);
    res.status(500).json({ error: 'Failed to approve tournament' });
  }
});

// Reject organization tournament
router.post('/reject-org-tournament/:tournamentId', verifyAdminToken, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament._approvalStatus !== 'pending') {
      return res.status(400).json({ error: 'Tournament is not pending approval' });
    }

    // Reject tournament
    tournament._approvalStatus = 'rejected';
    tournament._rejectedBy = req.admin._id;
    tournament._rejectedAt = new Date();
    tournament._rejectionReason = reason;
    tournament.visibility = 'private';

    await tournament.save();

    // TODO: Send notification to organization with rejection reason

    res.json({
      message: 'Tournament rejected',
      tournament
    });
  } catch (error) {
    console.error('Error rejecting tournament:', error);
    res.status(500).json({ error: 'Failed to reject tournament' });
  }
});

// Get all organization tournaments (approved, pending, rejected)
router.get('/org-tournaments', verifyAdminToken, async (req, res) => {
  try {
    const { status, orgId, page = 1, limit = 20 } = req.query;

    const filter = {
      'organizer.organizationRef': { $exists: true }
    };

    if (status) filter._approvalStatus = status;
    if (orgId) filter['organizer.organizationRef'] = orgId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tournaments = await Tournament.find(filter)
      .populate('organizer.organizationRef', 'orgName logo email')
      .sort({ _submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
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

export default router;