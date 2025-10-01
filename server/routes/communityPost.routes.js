import express from "express";
import CommunityPost from "../models/communityPost.model.js";
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

    const posts = await CommunityPost.find({ community: communityId })
      .populate("author", "username email profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching community posts:", error);
    res.status(500).json({ message: "Error fetching community posts" });
  }
});

export default router;
