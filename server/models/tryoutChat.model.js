// server/models/tryoutChat.model.js
import mongoose from 'mongoose';

const tryoutChatMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  messageType: {
    type: String,
    enum: ['text', 'system'],
    default: 'text',
  },
});

const tryoutChatSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamApplication',
      required: true,
      unique: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    // All team members + applicant
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
    messages: [tryoutChatMessageSchema],
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
tryoutChatSchema.index({ team: 1, status: 1 });
tryoutChatSchema.index({ applicant: 1 });
tryoutChatSchema.index({ participants: 1 });

const TryoutChat = mongoose.model('TryoutChat', tryoutChatSchema);

export default TryoutChat;