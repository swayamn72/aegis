import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';

// Generate JWT token for admin
export const generateAdminToken = (adminId) => {
  return jwt.sign(
    { adminId, type: 'admin' },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Verify admin JWT token
export const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    if (decoded.type !== 'admin') {
      return res.status(401).json({
        error: 'Access denied. Invalid token type.'
      });
    }

    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.status(401).json({
        error: 'Access denied. Admin not found.'
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({
        error: 'Access denied. Admin account is deactivated.'
      });
    }

    if (admin.isLocked()) {
      return res.status(401).json({
        error: 'Account is temporarily locked due to too many failed login attempts.'
      });
    }

    req.admin = admin;
    req.adminId = admin._id;
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

    console.error('Admin auth error:', error);
    res.status(500).json({
      error: 'Internal server error during authentication.'
    });
  }
};

// Check specific permissions
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        error: 'Access denied. Admin not authenticated.'
      });
    }

    if (!req.admin.permissions[permission]) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Check if admin has any of the specified permissions
export const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        error: 'Access denied. Admin not authenticated.'
      });
    }

    const hasPermission = permissions.some(permission => req.admin.permissions[permission]);

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Optional admin authentication (for routes that work with or without admin)
export const optionalAdminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      req.admin = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    if (decoded.type !== 'admin') {
      req.admin = null;
      return next();
    }

    const admin = await Admin.findById(decoded.adminId);

    if (admin && admin.isActive && !admin.isLocked()) {
      req.admin = admin;
      req.adminId = admin._id;
    } else {
      req.admin = null;
    }

    next();
  } catch (error) {
    req.admin = null;
    next();
  }
};
