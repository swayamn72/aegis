// backend/models/chat.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const ChatSchema = new Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    messageType: { type: String, enum: ['text', 'invitation'], default: 'text' },
    invitationId: { type: Schema.Types.ObjectId, ref: 'TeamInvitation', required: false },
    invitationStatus: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    timestamp: { type: Date, default: Date.now },
  },
  {
    // optional createdAt/updatedAt
    timestamps: true,
  }
);

const ChatMessage = mongoose.model("ChatMessage", ChatSchema);
export default ChatMessage;
