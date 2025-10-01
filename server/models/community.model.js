import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    membersCount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: "",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    }],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Community = mongoose.model("Community", communitySchema);

export default Community;
