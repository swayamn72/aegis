import express from "express";
import Player from "../models/player.model.js";
import auth from "../middleware/auth.js"; 

const router = express.Router();


router.post("/daily-checkin", auth, async (req, res) => {
  try {
    const player = await Player.findById(req.user.id);
    if (!player) return res.status(404).json({ message: "Player not found" });

    const today = new Date();
    const lastCheck = player.lastCheckIn ? new Date(player.lastCheckIn) : null;
    const oneDay = 24 * 60 * 60 * 1000;

   
    if (lastCheck && today - lastCheck < oneDay) {
      return res.status(400).json({ message: "Already checked in today" });
    }

 
    if (lastCheck && today - lastCheck < 2 * oneDay) {
      player.checkInStreak += 1;
    } else {
      player.checkInStreak = 1;
    }


    const reward = 10;
    const streakBonus = player.checkInStreak > 1 ? player.checkInStreak * 2 : 0;
    const totalReward = reward + streakBonus;

   
    player.coins += totalReward;
    player.lastCheckIn = today;
    player.totalCheckIns += 1;

    player.rewardsHistory.push({
      type: "daily_checkin",
      amount: totalReward,
      description: `Daily check-in reward +${reward} and streak bonus +${streakBonus}`,
    });

    await player.save();

    res.json({
      message: "Check-in successful!",
      totalReward,
      newCoinBalance: player.coins,
      streak: player.checkInStreak,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error during check-in", error: error.message });
  }
});



router.post("/tournament-join", auth, async (req, res) => {
  try {
    const player = await Player.findById(req.user.id);
    if (!player) return res.status(404).json({ message: "Player not found" });

    const reward = 50;
    player.coins += reward;

    player.rewardsHistory.push({
      type: "tournament_join",
      amount: reward,
      description: "Reward for joining tournament",
    });

    await player.save();

    res.json({ message: "Tournament reward added!", newCoinBalance: player.coins });
  } catch (error) {
    res.status(500).json({ message: "Error adding tournament reward", error });
  }
});

//fetch coins
router.get("/coins/:id", async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: "Player not found" });
    res.json({ coins: player.coins });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
