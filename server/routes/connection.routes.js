import express from "express";
import Player from "../models/player.model.js";
import auth from "../middleware/auth.js";


const router = express.Router();


router.post("/send/:playerId", auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.playerId;

    if (senderId === receiverId) {
      return res.status(400).json({ message: "You can't connect with yourself" });
    }

    const sender = await Player.findById(senderId);
    const receiver = await Player.findById(receiverId);

    if (!receiver) return res.status(404).json({ message: "User not found" });

    // Already connected?
    if (sender.connections.includes(receiverId)) {
      return res.status(400).json({ message: "Already connected" });
    }

    // Already requested?
    if (sender.sentRequests.includes(receiverId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Add request
    sender.sentRequests.push(receiverId);
    receiver.receivedRequests.push(senderId);

    await sender.save();
    await receiver.save();

    res.json({ message: "Connection request sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.post("/accept/:playerId", auth, async (req, res) => {
  try {
    const receiverId = req.user.id;
    const senderId = req.params.playerId;

    const receiver = await Player.findById(receiverId);
    const sender = await Player.findById(senderId);

    if (!sender || !receiver) return res.status(404).json({ message: "User not found" });

    // Check if request exists
    if (!receiver.receivedRequests.includes(senderId)) {
      return res.status(400).json({ message: "No request from this user" });
    }

    // Add to connections
    receiver.connections.push(senderId);
    sender.connections.push(receiverId);

    // Remove from requests
    receiver.receivedRequests = receiver.receivedRequests.filter(
      (id) => id.toString() !== senderId
    );
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== receiverId
    );

    await receiver.save();
    await sender.save();

    res.json({ message: "Connection accepted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject a request
router.post("/reject/:playerId", auth, async (req, res) => {
  try {
    const receiverId = req.user.id;
    const senderId = req.params.playerId;

    const receiver = await Player.findById(receiverId);
    const sender = await Player.findById(senderId);

    if (!receiver || !sender) return res.status(404).json({ message: "User not found" });

    receiver.receivedRequests = receiver.receivedRequests.filter(
      (id) => id.toString() !== senderId
    );
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== receiverId
    );

    await receiver.save();
    await sender.save();

    res.json({ message: "Connection request rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get("/requests", auth, async (req, res) => {
  try {
    const receiverId = req.user.id;
    const receiver = await Player.findById(receiverId)
      .populate("receivedRequests", "username avatar name"); // populate user info

    if (!receiver) return res.status(404).json({ message: "User not found" });

    res.json({ requests: receiver.receivedRequests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



export default router;