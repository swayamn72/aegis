import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Player from "../models/player.model.js";

const router = express.Router();

// --- Signup Route ---
router.post("/signup", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check if email already exists
    const existingEmail = await Player.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // check if username already exists
    const existingUsername = await Player.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new player
    const newPlayer = new Player({
      email,
      password: hashedPassword,
      username,
    });

    await newPlayer.save();

    // generate token
    const token = jwt.sign({ id: newPlayer._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      message: "Signup successful",
      redirect: "/complete-profile",
      player: { id: newPlayer._id, email: newPlayer.email, username: newPlayer.username },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Login Route ---
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // find user by email
    const user = await Player.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      player: { id: user._id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Get Current User Route ---
router.get("/me", async (req, res) => {
  try {
    console.log("GET /me - Cookies received:", req.cookies);
    const token = req.cookies.token;
    if (!token) {
      console.log("GET /me - No token provided");
      return res.status(401).json({ message: "No token provided" });
    }

    console.log("GET /me - Token found, verifying...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("GET /me - Token decoded:", decoded);

    const user = await Player.findById(decoded.id).select("-password");
    console.log("GET /me - User found:", user ? user.username : "null");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

// --- Logout Route ---
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
});

// --- Get All Players Route ---
router.get("/all", async (req, res) => {
  try {
    const players = await Player.find({}).select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      message: "Players retrieved successfully",
      players: players
    });
  } catch (error) {
    console.error("Get all players error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// --- Update Profile Route ---
router.put("/update-profile", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

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

export default router;
