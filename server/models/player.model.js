// server/models/player.model.js

import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    // --- Core Account Info ---
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true, // Faster searches
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    // --- Aegis Platform Info ---
    aegisRating: {
      type: Number,
      default: 0, // Starting Elo for new players
    },
    verified: {
      type: Boolean,
      default: false,
    },

    // --- BGMI Specific Info (filled later in profile completion) ---
    inGameName: {
      type: String,
      unique: true,
      trim: true,
      sparse: true, // allows multiple nulls until set later
    },
    game: {
      type: String,
      default: 'BGMI', // Defaults to BGMI for this version of the app
    },
    roles: [
      {
        type: String,
        enum: [
          'Entry Fragger',
          'Supporter',
          'IGL', // In-Game Leader
          'Flanker',
          'Scouter',
        ],
      },
    ],

    // Future stats can be added here
    // stats: {
    //   kdRatio: { type: Number, default: 0 },
    //   winRate: { type: Number, default: 0 },
    //   avgSurvivalTime: { type: String, default: '0m' }
    // }
  },
  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

const Player = mongoose.model('Player', playerSchema);

export default Player;
