// backend/models/chat.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const ChatSchema = new Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    // optional createdAt/updatedAt
    timestamps: true,
  }
);

const ChatMessage = mongoose.model("ChatMessage", ChatSchema);
export default ChatMessage;
