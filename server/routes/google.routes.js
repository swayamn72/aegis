import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import Player from '../models/player.model.js';
import Organization from '../models/organization.model.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google signup for players and organizations
router.post('/google-signup', async (req, res) => {
  try {
    const { id_token, role } = req.body;

    if (!id_token) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    if (!role || !['player', 'organization'].includes(role)) {
      return res.status(400).json({ message: 'Role must be player or organization' });
    }

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (role === 'player') {
      
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
        isVerified: true, // Google accounts are pre-verified
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
    } else if (role === 'organization') {
      
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
    console.error('Google signup error:', error);
    res.status(500).json({ message: 'Server error during Google signup' });
  }
});


router.post('/google-login', async (req, res) => {
  try {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({ message: 'ID token is required' });
    }

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email } = payload;

   
    const player = await Player.findOne({ $or: [{ googleId }, { email }] });

    if (!player) {
      return res.status(404).json({ message: 'No account found with this Google account. Please sign up first.' });
    }

  
    if (!player.googleId) {
      player.googleId = googleId;
      await player.save();
    }

  
    const token = jwt.sign(
      { id: player._id, role: 'player' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );


    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: player._id,
        username: player.username,
        email: player.email,
        profilePicture: player.profilePicture,
        role: 'player',
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Server error during Google login' });
  }
});

export default router;
