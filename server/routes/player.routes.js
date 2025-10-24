import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Player from "../models/player.model.js";
import Post from "../models/post.model.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import auth from "../middleware/auth.js";
const router = express.Router();

// routes in this file 
// "/signup"
// "/login"
// "/logout"
// "/me"
// "/all"
// "/:id"
// "/username/:username"
// "/update-profile"
// "/upload-pfp"

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});
// --- Signup Route (Email/Password) ---
router.post("/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEmail = await Player.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingUsername = await Player.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPlayer = new Player({
      email,
      password: hashedPassword,
      username,
    });

    await newPlayer.save();

    const token = jwt.sign({ id: newPlayer._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      message: "Signup successful",
      token: token,
      player: {
        id: newPlayer._id,
        email: newPlayer.email,
        username: newPlayer.username,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// --- Login Route (Email/Password) ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await Player.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({ message: "This account uses Google login only" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Still set cookie for web clients
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // IMPORTANT: Also send token in response body for mobile clients
    res.status(200).json({
      message: "Login successful",
      token: token,  // Make sure this is included!
      player: { id: user._id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Logout Route (Same for all users) ---
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});

// --- Get Current User Route ---
router.get("/me", auth, async (req, res) => {
  try {
    // req.user.id is set by the auth middleware
    const userId = req.user.id;

    const user = await Player.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Get All Players Route ---
router.get("/all", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    const players = await Player.find({})
      .select("-password")
      .sort({ aegisRating: -1 })
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      message: "Players retrieved successfully",
      players: players
    });
  } catch (error) {
    console.error("Get all players error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/username/:username", async (req, res) => {
  try {
    const username = req.params.username;

    if (!username || username.trim() === '') {
      return res.status(400).json({ message: "Invalid username" });
    }

    // Case-insensitive search for username
    const player = await Player.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    }).select("-password");

    if (!player) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ player });
  } catch (error) {
    console.error("Get player by username error:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// --- Get Player by ID Route ---
router.get("/:id", async (req, res) => {
  try {
    const playerId = req.params.id;
    if (!playerId || playerId === 'undefined') {
      return res.status(400).json({ message: "Invalid player ID" });
    }
    const player = await Player.findById(playerId).select("-password");
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.status(200).json({ player });
  } catch (error) {
    console.error("Get player by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Update Profile Route ---
router.put("/update-profile", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Validate required fields if provided
    if (updateData.age && (updateData.age < 13 || updateData.age > 99)) {
      return res.status(400).json({ message: "Age must be between 13 and 99" });
    }

    // Update the player document
    const updatedPlayer = await Player.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedPlayer) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      player: updatedPlayer
    });
  } catch (error) {
    console.error("Update profile error:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/profile-picture-url", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Player.findById(userId).select("profilePicture");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ profilePicture: user.profilePicture || null });
  } catch (error) {
    console.error("Get profile picture error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Upload Profile Picture Route ---
router.post("/upload-pfp", auth, upload.single('profilePicture'), async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'aegis-pfps',
          public_id: `pfp-${userId}-${Date.now()}`,
          transformation: [{ width: 300, height: 300, crop: 'fill' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Update player with new PFP URL
    const updatedPlayer = await Player.findByIdAndUpdate(
      userId,
      { $set: { profilePicture: result.secure_url } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedPlayer) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: result.secure_url,
      player: updatedPlayer
    });
  } catch (error) {
    console.error("Upload PFP error:", error);
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// // Creation of Posts
// router.post("/create-post", async (req, res) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) return res.status(401).json({ message: "No token provided" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;

//     const { caption, media, tags } = req.body;

//     const newPost = await Post.create({
//       author: userId,
//       caption,
//       media,
//       tags,
//     });


//     await Player.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });

//     res.status(201).json({
//       message: "Post created successfully",
//       post: newPost,
//     });
//   } catch (error) {
//     console.error("Create post error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Get all Posts of player
// router.get("/my-posts", async (req, res) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) return res.status(401).json({ message: "No token provided" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;

//     const posts = await Post.find({ author: userId })
//       .populate("author", "username email")
//       .sort({ createdAt: -1 });

//     res.status(200).json({ posts });
//   } catch (error) {
//     console.error("Get posts error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });




// //delete post
// router.delete("/delete-post/:postId", async (req, res) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) return res.status(401).json({ message: "No token provided" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;
//     const postId = req.params.postId;


//     const updatedPlayer = await Player.findByIdAndUpdate(
//       userId,
//       { $pull: { posts: { _id: postId } } },
//       { new: true }
//     );

//     if (!updatedPlayer) {
//       return res.status(404).json({ message: "Player not found" });
//     }

//     res.status(200).json({ message: "Post deleted successfully" });
//   } catch (error) {
//     console.error("Delete post error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });




export default router;
