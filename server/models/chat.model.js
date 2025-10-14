import mongoose from "mongoose";

const { Schema } = mongoose;

const ChatSchema = new Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
    messageType: { 
      type: String, 
      enum: ['text', 'invitation', 'tournament_reference', 'tournament_invite', 'match_scheduled', 'system'], 
      default: 'text' 
    },
    invitationId: { type: Schema.Types.ObjectId, ref: 'TeamInvitation', required: false },
    invitationStatus: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: false },
    tournamentName: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ChatSchema.index({ senderId: 1, receiverId: 1 });
ChatSchema.index({ receiverId: 1, timestamp: -1 });
ChatSchema.index({ senderId: 1, timestamp: -1 });

const ChatMessage = mongoose.model("ChatMessage", ChatSchema);
export default ChatMessage;