import express from "express";
import Community from "../models/community.model.js";
import auth from "../middleware/auth.js";

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

// Create a new community
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Community name is required" });
    }

    const newCommunity = new Community({
      name,
      description: description || "",
      image: image || "",
      admin: req.user.id,
      members: [req.user.id],
      membersCount: 1,
    });

    await newCommunity.save();
    res.status(201).json(newCommunity);
  } catch (error) {
    console.error("Error creating community:", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "Community name already exists" });
    } else {
      res.status(500).json({ message: "Error creating community", error: error.message });
    }
  }
});

// Join a community
router.put("/:id/join", auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (community.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Already a member of this community" });
    }

    community.members.push(req.user.id);
    community.membersCount += 1;
    await community.save();

    res.json({ message: "Joined community successfully", community });
  } catch (error) {
    console.error("Error joining community:", error);
    res.status(500).json({ message: "Error joining community" });
  }
});

// Leave a community
router.put("/:id/leave", auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    if (!community.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Not a member of this community" });
    }

    if (community.admin.toString() === req.user.id) {
      return res.status(400).json({ message: "Admin cannot leave the community" });
    }

    community.members = community.members.filter(member => member.toString() !== req.user.id);
    community.membersCount -= 1;
    await community.save();

    res.json({ message: "Left community successfully", community });
  } catch (error) {
    console.error("Error leaving community:", error);
    res.status(500).json({ message: "Error leaving community" });
  }
});

// Get community by ID
router.get("/:id", async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate("admin", "username profilePic").populate("members", "username profilePic");
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
