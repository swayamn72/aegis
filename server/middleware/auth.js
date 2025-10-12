import jwt from "jsonwebtoken";
import Community from "../models/community.model.js";

export default function auth(req, res, next) {
  let token = req.cookies.token; // read cookie

  // If no cookie token, check Authorization header
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT token:', decoded);

    if (decoded.type === 'admin') {
      req.user = {
        id: decoded.adminId,
        isAdmin: true,
        type: 'admin'
      };
    } else {
      req.user = decoded; // player token
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export async function isCommunityAdmin(req, res, next) {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only community admin can perform this action" });
    }

    req.community = community; // attach community to req for later use
    next();
  } catch (error) {
    console.error("Error checking community admin:", error);
    res.status(500).json({ message: "Error checking permissions" });
  }
}
