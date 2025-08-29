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

export default router;
