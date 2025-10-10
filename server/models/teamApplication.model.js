// server/models/teamApplication.model.js
import mongoose from 'mongoose';

const teamApplicationSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_tryout', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    // For the roles player is applying for
    appliedRoles: [
      {
        type: String,
        enum: ['IGL', 'assaulter', 'support', 'sniper', 'fragger'],
      },
    ],
    // Tryout chat room (only created when status moves to 'in_tryout')
    tryoutChatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TryoutChat',
      default: null,
    },

    // Rejection reason if rejected
    rejectionReason: {
      type: String,
      trim: true,
    },
    // When tryout started and ended
    tryoutStartedAt: Date,
    tryoutEndedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
teamApplicationSchema.index({ team: 1, status: 1 });
teamApplicationSchema.index({ player: 1, status: 1 });
teamApplicationSchema.index({ team: 1, player: 1 }, { unique: true });

const TeamApplication = mongoose.model('TeamApplication', teamApplicationSchema);

export default TeamApplication;