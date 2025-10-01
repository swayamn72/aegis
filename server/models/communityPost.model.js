import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    caption: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    media: [
      {
        type: { type: String, enum: ["image", "video"], required: true },
        url: { type: String, required: true },
      },
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    comments: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);

export default CommunityPost;
