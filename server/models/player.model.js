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

    // --- Personal Info (Step 1 from AegisProfileCompletion) ---
    realName: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      min: 13,
      max: 99,
    },
    location: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    languages: [
      {
        type: String,
        enum: ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Punjabi'],
      },
    ],

    // --- Gaming Info (Step 2 from AegisProfileCompletion) ---
    inGameName: {
      type: String,
      unique: true,
      trim: true,
      sparse: true, // Allows multiple nulls until set later
    },
    primaryGame: {
      type: String,
      enum: ['BGMI', 'PUBG Mobile', 'Free Fire', 'Call of Duty Mobile', 'Valorant Mobile'],
      default: 'BGMI',
    },
    experienceYears: {
      type: Number,
      min: 0,
    },
    earnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    qualifiedEvents: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no',
    },
    qualifiedEventsDetails: {
      type: String,
      trim: true,
      default: '',
    },
    inGameRole: [
      {
        type: String,
        enum: ['Aggressive', 'Passive', 'Balanced', 'Sniper', 'Rusher', 'Support', 'Leader', 'Flex'],
      },
    ],

    // --- Team & Goals (Step 3 from AegisProfileCompletion) ---
    teamStatus: {
      type: String,
      enum: ['Looking for Team', 'In a Team', 'Team Captain', 'Solo Player', 'Open to Offers'],
    },
    lookingFor: [
      {
        type: String,
        enum: [
          'Competitive Team',
          'Casual Gaming',
          'Tournament Play',
          'Rank Climbing',
          'Coaching/Mentoring',
          'Content Creation',
          'Practice Partners',
          'Community Building',
        ],
      },
    ],
    availability: {
      type: String,
      enum: ['Weekends Only', 'Evenings (6-11 PM)', 'Flexible Schedule', 'Full-time Available', 'Part-time (20+ hrs/week)'],
    },
    competitiveGoals: {
      type: String,
      trim: true,
      default: '',
    },

    // --- Social & Contact (Step 4 from AegisProfileCompletion) ---
    discordTag: {
      type: String,
      trim: true,
      default: '',
    },
    twitterHandle: {
      type: String,
      trim: true,
      default: '',
    },
    twitchChannel: {
      type: String,
      trim: true,
      default: '',
    },
    youtubeChannel: {
      type: String,
      trim: true,
      default: '',
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
    },
  },
  {
    timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
  }
);

const Player = mongoose.model('Player', playerSchema);

export default Player;