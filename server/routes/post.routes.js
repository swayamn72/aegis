import express from "express";
import Post from "../models/post.model.js";
import Player from "../models/player.model.js";
import jwt from "jsonwebtoken";

const router = express.Router();


const auth = (req,res,next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"token not provided"});
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded.id;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
};


router.post("/",auth,async(req,res) => {
    try {
        const {caption,media,tags} = req.body;
        const newPost = new Post({
            author: req.user,
            caption,
            media,
            tags,
        });
          
await newPost.save();
res.status(201).json(newPost);

    } catch (error) {
    res.status(500).json({ message: "Error creating post", error });        
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
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching player's posts", error });
  }
});

export default router;




