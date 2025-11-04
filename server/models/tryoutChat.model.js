// server/models/tryoutChat.model.js
import mongoose from 'mongoose';

const tryoutChatSchema = new mongoose.Schema(
  {
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
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    chatType: {
      type: String,
      enum: ['application', 'recruitment'],
      default: 'application',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    messages: [
      {
        sender: {
          type: String, // Can be 'system' or Player ObjectId as string
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        messageType: {
          type: String,
          enum: ['text', 'system', 'team_offer'],
          default: 'text',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    locked: {
      type: Boolean,
      default: false,
    },
    // NEW: Tryout status
    tryoutStatus: {
      type: String,
      enum: ['active', 'ended_by_team', 'ended_by_player', 'offer_sent', 'offer_accepted', 'offer_rejected'],
      default: 'active'
    },
    // NEW: Team join offer
    teamOffer: {
      status: {
        type: String,
        enum: ['none', 'pending', 'accepted', 'rejected'],
        default: 'none'
      },
      sentAt: Date,
      respondedAt: Date,
      message: String
    },
    endedAt: Date,
    endedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'endedByModel'
    },
    endedByModel: {
      type: String,
      enum: ['Team', 'Player']
    },
    endReason: String
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
tryoutChatSchema.index({ team: 1, applicant: 1 });
tryoutChatSchema.index({ participants: 1 });
tryoutChatSchema.index({ status: 1 });

const TryoutChat = mongoose.model('TryoutChat', tryoutChatSchema);

export default TryoutChat;