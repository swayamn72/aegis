import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    inGameName: {
      type: String,
      trim: true,
    },
    realName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
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
    profilePicture: {
      type: String,
      trim: true,
      default: '',
    },
    primaryGame: {
      type: String,
      enum: ['BGMI', 'VALO', 'CS2'],
    },
    earnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    inGameRole: [
      {
        type: String,
        enum: ['assaulter', 'IGL', 'support', 'filter', 'sniper'],
      },
    ],
    location: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      min: 13,
      max: 99,
    },
    languages: [
      {
        type: String,
      },
    ],
    aegisRating: {
      type: Number,
      default: 0,
    },
    tournamentsPlayed: {
      type: Number,
      default: 0,
    },
    matchesPlayed: {
      type: Number,
      default: 0,
    },
    qualifiedEvents: {
      type: Boolean,
      default: false,
    },
    qualifiedEventDetails: [
      {
        type: String,
      },
    ],
    teamStatus: {
      type: String,
      enum: ['looking for a team', 'in a team', 'open for offers'],
    },
    availability: {
      type: String,
      enum: ['weekends only', 'evenings', 'flexible', 'full time'],
    },
    discordTag: {
      type: String,
      trim: true,
      default: '',
    },
    twitch: {
      type: String,
      trim: true,
      default: '',
    },
    YouTube: {
      type: String,
      trim: true,
      default: '',
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public',
    },
    cardTheme: {
      type: String,
      enum: ['orange', 'blue', 'purple', 'red', 'green', 'pink'],
      default: 'orange',
    },
      posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", 
    },
  ],

  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }], // confirmed connections
  sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }], // requests you sent
  receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }], // requests you received

  },
  {
    timestamps: true,
  }
);

const Player = mongoose.model('Player', playerSchema);

export default Player;