import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Organization from '../models/organization.model.js';
import { verifyAdminToken } from '../middleware/adminAuth.js'; // Use your existing admin auth

const router = express.Router();

// Register a new organization (pending approval)
router.post('/register', async (req, res) => {
  try {
    const {
      orgName,
      email,
      password,
      country,
      headquarters,
      description,
      contactPhone,
      establishedDate,
      website,
      ownerName,
      ownerSocial
    } = req.body;

    // Validation
    if (!orgName || !email || !password || !country || !ownerName) {
      return res.status(400).json({
        message: 'Please provide organization name, email, password, country, and owner name'
      });
    }

    // Check if organization already exists
    const existingOrg = await Organization.findOne({
      $or: [{ email: email.toLowerCase() }, { orgName }]
    });

    if (existingOrg) {
      return res.status(400).json({
        message: 'Organization with this email or name already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newOrg = new Organization({
      orgName,
      email: email.toLowerCase(),
      password: hashedPassword,
      country,
      headquarters: headquarters || '',
      description: description || '',
      contactPhone: contactPhone || '',
      establishedDate: establishedDate || new Date(),
      socials: {
        website: website || ''
      },
      approvalStatus: 'pending',
      ownerName,
      ownerSocial: ownerSocial || {},
    });

    await newOrg.save();

    // TODO: Send email notification to admins about new registration
    // TODO: Send confirmation email to organization

    res.status(201).json({
      message: 'Organization registration submitted successfully. Pending admin approval.',
      organization: {
        id: newOrg._id,
        orgName: newOrg.orgName,
        email: newOrg.email,
        approvalStatus: newOrg.approvalStatus
      }
    });

  } catch (error) {
    console.error('Organization registration error:', error);
    res.status(500).json({
      message: 'Error registering organization',
      error: error.message
    });
  }
});

// Organization login (only approved organizations can login)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find organization with password field
    const organization = await Organization.findOne({ 
      email: email.toLowerCase() 
    }).select('+password');

    if (!organization) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check approval status
    if (organization.approvalStatus === 'pending') {
      return res.status(403).json({ 
        message: 'Your organization registration is pending admin approval' 
      });
    }

    if (organization.approvalStatus === 'rejected') {
      return res.status(403).json({ 
        message: 'Your organization registration was rejected',
        reason: organization.rejectionReason
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, organization.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: organization._id, 
        type: 'organization',
        orgName: organization.orgName 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Remove password from response
    const orgData = organization.toObject();
    delete orgData.password;

    res.json({
      message: 'Login successful',
      organization: orgData,
      token
    });

  } catch (error) {
    console.error('Organization login error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
});

// Get all pending organizations (Admin only)
router.get('/pending', verifyAdminToken, async (req, res) => {
  try {
    const pendingOrgs = await Organization.find({ 
      approvalStatus: 'pending' 
    }).sort({ createdAt: -1 });

    res.json({
      count: pendingOrgs.length,
      organizations: pendingOrgs
    });

  } catch (error) {
    console.error('Error fetching pending organizations:', error);
    res.status(500).json({
      message: 'Error fetching pending organizations',
      error: error.message
    });
  }
});

// Approve organization (Admin only)
router.patch('/:id/approve', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin._id; // From adminAuth middleware

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (organization.approvalStatus !== 'pending') {
      return res.status(400).json({ 
        message: `Organization is already ${organization.approvalStatus}` 
      });
    }

    organization.approvalStatus = 'approved';
    organization.approvedBy = adminId;
    organization.approvalDate = new Date();
    organization.emailVerified = true; // Auto-verify on approval

    await organization.save();

    // TODO: Send approval email to organization

    res.json({
      message: 'Organization approved successfully',
      organization
    });

  } catch (error) {
    console.error('Error approving organization:', error);
    res.status(500).json({
      message: 'Error approving organization',
      error: error.message
    });
  }
});

// Reject organization (Admin only)
router.patch('/:id/reject', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.admin._id;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (organization.approvalStatus !== 'pending') {
      return res.status(400).json({ 
        message: `Organization is already ${organization.approvalStatus}` 
      });
    }

    organization.approvalStatus = 'rejected';
    organization.approvedBy = adminId;
    organization.approvalDate = new Date();
    organization.rejectionReason = reason || 'Not specified';

    await organization.save();

    // TODO: Send rejection email to organization

    res.json({
      message: 'Organization rejected',
      organization
    });

  } catch (error) {
    console.error('Error rejecting organization:', error);
    res.status(500).json({
      message: 'Error rejecting organization',
      error: error.message
    });
  }
});

// Get organization profile
router.get('/profile', async (req, res) => {
  try {
    // This would typically use auth middleware to get current org
    // For now, implementing basic version
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.type !== 'organization') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const organization = await Organization.findById(decoded.id)
      .populate('teams', 'teamName logo');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ organization });

  } catch (error) {
    console.error('Error fetching organization profile:', error);
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

export default router;