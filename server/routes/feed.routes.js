import express from "express";
import Post from "../models/post.model.js";
import Player from "../models/player.model.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, async (req, res) => {
  try {
    const { caption, tags, media } = req.body;

    // Validate required fields
    if (!caption || caption.trim().length === 0) {
      return res.status(400).json({ message: "Caption is required" });
    }

    // Create new post
    const newPost = new Post({
      author: req.user.id,
      caption: caption.trim(),
      tags: tags || [],
      media: media || [],
    });

    await newPost.save();

    // Populate author information for response
    await newPost.populate("author", "username email");

    res.status(201).json({
      message: "Post created successfully",
      post: newPost
    });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/myfeed", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    // Get the current user and their connections
    const user = await Player.findById(req.user.id).populate("connections");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectionIds = user.connections.map(conn => conn._id);
    const authorIds = [req.user.id, ...connectionIds];

const posts = await Post.find({ author: { $in: authorIds } })
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .populate("author", "username email")
  .populate("likes", "username profilePic")
  .populate({
    path: "comments.player",
    select: "username profilePic"
  });

res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
