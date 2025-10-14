import jwt from 'jsonwebtoken';
import Organization from '../models/organization.model.js';

// Generate JWT token for organization
export const generateOrgToken = (orgId, orgName) => {
  return jwt.sign(
    {
      id: orgId,
      type: 'organization',
      orgName: orgName
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Verify organization JWT token
export const verifyOrgToken = async (req, res, next) => {
  try {
    let token = req.cookies.token; // read cookie

    // If no cookie token, check Authorization header
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    if (decoded.type !== 'organization') {
      return res.status(401).json({
        error: 'Access denied. Invalid token type.'
      });
    }

    const organization = await Organization.findById(decoded.id);

    if (!organization) {
      return res.status(401).json({
        error: 'Access denied. Organization not found.'
      });
    }

    if (organization.approvalStatus !== 'approved') {
      return res.status(403).json({
        error: `Organization account is ${organization.approvalStatus}.`
      });
    }

    req.organization = organization;
    req.orgId = organization._id;
    req.user = {
      id: organization._id,
      type: 'organization',
      orgName: organization.orgName
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired. Please login again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token. Please login again.'
      });
    }

    console.error('Organization auth error:', error);
    res.status(500).json({
      error: 'Internal server error during authentication.'
    });
  }
};

// Optional organization authentication (for routes that work with or without org)
export const optionalOrgAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    if (!token) {
      req.organization = null;
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    if (decoded.type !== 'organization') {
      req.organization = null;
      req.user = null;
      return next();
    }

    const organization = await Organization.findById(decoded.id);

    if (organization && organization.approvalStatus === 'approved') {
      req.organization = organization;
      req.orgId = organization._id;
      req.user = {
        id: organization._id,
        type: 'organization',
        orgName: organization.orgName
      };
    } else {
      req.organization = null;
      req.user = null;
    }

    next();
  } catch (error) {
    req.organization = null;
    req.user = null;
    next();
  }
};
