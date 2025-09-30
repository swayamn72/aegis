import express from "express";
import Post from "../models/post.model.js";
import Player from "../models/player.model.js";
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


router.post("/", auth, upload.array("media", 5), async(req,res) => {
    try {
        const {caption, tags} = req.body;

        if (!caption || caption.trim().length === 0) {
            return res.status(400).json({ message: "Caption is required" });
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
                                folder: "aegis_posts",
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

        const newPost = new Post({
            author: req.user.id,
            caption: caption.trim(),
            media: mediaFiles,
            tags: tags ? JSON.parse(tags) : [],
        });

        await newPost.save();
        await newPost.populate("author", "username email");

        res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });

    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Error creating post", error: error.message });
    }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username inGameName profileVisibility")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
});


router.get("/player/:id", async (req, res) => {
  try {
    const playerId = req.params.id;
    const posts = await Post.find({ author: playerId })
      .populate("author", "username inGameName")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching player's posts", error });
  }
});

// Update a post
router.put("/:id", auth, upload.array("media", 5), async (req, res) => {
  try {
    const postId = req.params.id;
    const { caption, tags, removeMedia } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    // Handle media removal
    let updatedMedia = post.media;
    if (removeMedia) {
      const mediaToRemove = JSON.parse(removeMedia);
      updatedMedia = post.media.filter(item => !mediaToRemove.includes(item.url));
    }

    // Handle new media uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const streamUpload = () => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                resource_type: file.mimetype.startsWith("video") ? "video" : "image",
                folder: "aegis_posts",
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
        updatedMedia.push({
          type: file.mimetype.startsWith("video") ? "video" : "image",
          url: result.secure_url,
        });
      }
    }

    // Update post
    post.caption = caption ? caption.trim() : post.caption;
    post.media = updatedMedia;
    post.tags = tags ? JSON.parse(tags) : post.tags;
    post.updatedAt = new Date();

    await post.save();
    await post.populate("author", "username inGameName");

    res.json({
      message: "Post updated successfully",
      post
    });

  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ message: "Error updating post", error: error.message });
  }
});

// Delete a post
router.delete("/:id", auth, async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    // Delete media from Cloudinary
    for (const mediaItem of post.media) {
      try {
        const publicId = mediaItem.url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`aegis_posts/${publicId}`);
      } catch (cloudinaryError) {
        console.error("Error deleting media from Cloudinary:", cloudinaryError);
      }
    }

    await Post.findByIdAndDelete(postId);

    res.json({ message: "Post deleted successfully" });

  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post", error: error.message });
  }
});

// Like/Unlike a post
router.post("/:id/like", auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex > -1) {
      // User already liked, remove like
      post.likes.splice(likeIndex, 1);
    } else {
      // User hasn't liked, add like
      post.likes.push(userId);
    }

    await post.save();
    await post.populate("likes", "username profilePic");

    res.json({
      message: likeIndex > -1 ? "Like removed" : "Post liked",
      likes: post.likes
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Error toggling like", error: error.message });
  }
});

// Add a comment to a post
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      player: userId,
      content: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();
    await post.populate({
      path: "comments.player",
      select: "username profilePic"
    });

    res.status(201).json({
      message: "Comment added successfully",
      comment: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
});

export default router;




