import express from "express";
import Community from "../models/community.model.js";

const router = express.Router();

// Get all communities
router.get("/", async (req, res) => {
  try {
    const communities = await Community.find().sort({ membersCount: -1 });
    res.json(communities);
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({ message: "Error fetching communities" });
  }
});

// Get community by ID
router.get("/:id", async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    res.json(community);
  } catch (error) {
    console.error("Error fetching community:", error);
    res.status(500).json({ message: "Error fetching community" });
  }
});

export default router;
