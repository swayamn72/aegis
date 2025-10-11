import express from 'express';
import admin from '../firebaseAdmin.js'; // Use Firebase Admin for verification
import Player from '../models/player.model.js';
import Organization from '../models/organization.model.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Google signup for players and organizations
router.post('/google-signup', async (req, res) => {
  try {
    const { id_token, role } = req.body;

    if (!id_token) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    if (!role || !['Player', 'Organization'].includes(role)) {
      return res.status(400).json({ message: 'Role must be Player or Organization' });
    }

    const lowerRole = role.toLowerCase();

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(id_token);
    const { email, name, picture, uid: googleId } = decodedToken;

    if (lowerRole === 'player') {
      
      let player = await Player.findOne({ $or: [{ email }, { googleId }] });

      if (player) {
        return res.status(400).json({ message: 'Player already exists with this email or Google account' });
      }

   
      let username = name.replace(/\s+/g, '').toLowerCase();
      let counter = 1;
      let originalUsername = username;

      while (await Player.findOne({ username })) {
        username = `${originalUsername}${counter}`;
        counter++;
      }

      // Create new player
      player = new Player({
        username,
        email,
        googleId,
        profilePicture: picture,
        password: 'google-auth', // Dummy password for Google signups
        verified: true, // Google accounts are pre-verified
      });

      await player.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: player._id, role: 'player' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        message: 'Player account created successfully',
        user: {
          id: player._id,
          username: player.username,
          email: player.email,
          profilePicture: player.profilePicture,
          role: 'player',
        },
      });
    } else if (lowerRole === 'organization') {
      
      let organization = await Organization.findOne({ $or: [{ email }, { googleId }] });

      if (organization) {
        return res.status(400).json({ message: 'Organization already exists with this email or Google account' });
      }

      
      let orgName = name.replace(/\s+/g, '').toLowerCase();
      let counter = 1;
      let originalOrgName = orgName;

      while (await Organization.findOne({ orgName })) {
        orgName = `${originalOrgName}${counter}`;
        counter++;
      }

      
      organization = new Organization({
        orgName,
        ownerName: name,
        email,
        googleId,
        logo: picture,
        password: 'google-auth', // Dummy password for Google signups
        country: 'Not specified', // Required field, set default for Google signups
        approvalStatus: 'pending',
        emailVerified: true, 
      });

      await organization.save();

      res.status(201).json({
        message: 'Organization account created successfully! Pending admin approval.',
        user: {
          id: organization._id,
          orgName: organization.orgName,
          email: organization.email,
          logo: organization.logo,
          role: 'organization',
        },
      });
    }
  } catch (error) {
    console.error('Google signup error:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error during Google signup', details: error.message });
  }
});


router.post('/google-login', async (req, res) => {
  try {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(id_token);
    const { email, uid: googleId } = decodedToken;

    // Check for player first
    let user = await Player.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Player login
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      const token = jwt.sign(
        { id: user._id, role: 'player' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          role: 'player',
        },
      });
    }

    // Check for organization
    const organization = await Organization.findOne({ $or: [{ googleId }, { email }] });

    if (organization) {
      const token = jwt.sign(
        { id: organization._id, role: 'organization' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: 'Login successful',
        user: {
          id: organization._id,
          orgName: organization.orgName,
          email: organization.email,
          logo: organization.logo,
          role: 'organization',
          status: organization.approvalStatus,
        },
      });
    }

    return res.status(404).json({ message: 'No account found with this Google account. Please sign up first.' });
  } catch (error) {
    console.error('Google login error:', error);
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ message: 'Invalid ID token' });
    }
    res.status(500).json({ message: 'Server error during Google login' });
  }
});

export default router;
