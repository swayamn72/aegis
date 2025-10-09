import express from "express";
import CommunityPost from "../models/communityPost.model.js";
import Community from "../models/community.model.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed"), false);
    }
  },
});

// Create a new community post
router.post("/", auth, upload.array("media", 5), async (req, res) => {
  try {
    const { caption, tags, communityId } = req.body;

    if (!caption || caption.trim().length === 0) {
      return res.status(400).json({ message: "Caption is required" });
    }

    if (!communityId) {
      return res.status(400).json({ message: "Community ID is required" });
    }

    // Check if user is member of the community
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    if (!community.members.some(member => member.toString() === req.user.id)) {
      return res.status(403).json({ message: "Only community members can post" });
    }

    // Upload files to Cloudinary
    const mediaFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const streamUpload = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: file.mimetype.startsWith("video")
                  ? "video"
                  : "image",
                folder: "aegis_community_posts",
              },
              (error, result) => {
                if (result) {
                  resolve(result);
                } else {
                  reject(error);
                }
              }
            );
            stream.end(file.buffer);
          });
        };

        const result = await streamUpload();

        mediaFiles.push({
          type: file.mimetype.startsWith("video") ? "video" : "image",
          url: result.secure_url,
        });
      }
    }

    const newPost = new CommunityPost({
      community: communityId,
      author: req.user.id,
      caption: caption.trim(),
      media: mediaFiles,
      tags: tags ? JSON.parse(tags) : [],
    });

    await newPost.save();
    await newPost.populate("author", "username email");

    res.status(201).json({
      message: "Community post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error creating community post:", error);
    res.status(500).json({ message: "Error creating community post", error: error.message });
  }
});

// Get posts by community ID
router.get("/community/:communityId", async (req, res) => {
  try {
    const { communityId } = req.params;
    const { sort = 'new' } = req.query;

    let sortOption = { createdAt: -1 }; // default new
    if (sort === 'top') {
      sortOption = { likes: -1 };
    } else if (sort === 'hot') {
      sortOption = { likes: -1 }; // for now, same as top
    }

    const posts = await CommunityPost.find({ community: communityId })
      .populate("author", "username email profilePic")
      .sort(sortOption);

    res.json(posts);
  } catch (error) {
    console.error("Error fetching community posts:", error);
    res.status(500).json({ message: "Error fetching community posts" });
  }
});

// Like/Unlike a post
router.put("/:postId/like", auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is member of the community of the post
    const community = await Community.findById(post.community);
    if (!community.members.some(member => member.toString() === userId)) {
      return res.status(403).json({ message: "Only community members can like posts" });
    }

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ message: isLiked ? "Unliked" : "Liked", likes: post.likes.length });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Error liking post" });
  }
});

// Add a comment to a post
router.post("/:postId/comment", auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is member of the community of the post
    const community = await Community.findById(post.community);
    if (!community.members.some(member => member.toString() === req.user.id)) {
      return res.status(403).json({ message: "Only community members can comment on posts" });
    }

    const newComment = {
      player: req.user.id,
      content: content.trim(),
    };

    post.comments.push(newComment);
    await post.save();
    await post.populate("comments.player", "username profilePic");

    res.status(201).json({ message: "Comment added", comment: post.comments[post.comments.length - 1] });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment" });
  }
});

export default router;
