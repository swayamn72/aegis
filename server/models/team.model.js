import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    tag: { // Abbreviated tag for display, e.g., "TSM", "NRG"
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 5,
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player', // Reference to the Player who is the captain
      required: true,
    },
    players: [ // Roster of players in the team
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
    primaryGame: {
      type: String,
      enum: ['BGMI', 'VALO', 'CS2'],
      required: true,
    },
    region: { // e.g., "North America", "Europe", "APAC"
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
    logo: { // URL to the team's logo
      type: String,
      trim: true,
      default: '',
    },
    establishedDate: {
      type: Date,
      default: Date.now,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    aegisRating: { // Team-level rating
      type: Number,
      default: 0,
    },
    qualifiedEvents: [ // List of events they've qualified for (strings or IDs to Event schema)
      {
        type: String, // Or mongoose.Schema.Types.ObjectId, ref: 'Event' if you make an Event schema
      },
    ],
    organization: { // If the team belongs to a larger organization
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    socials: {
      discord: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
      twitch: { type: String, trim: true, default: '' },
      youtube: { type: String, trim: true, default: '' },
      website: { type: String, trim: true, default: '' },
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
  },
  {
    timestamps: true,
  }
);

// Add a compound unique index to prevent a player from being captain of multiple teams
// and to ensure no two teams have the same tag (if desired, though teamName handles uniqueness)
// teamSchema.index({ captain: 1, primaryGame: 1 }, { unique: true }); // Example: captain can only captain one team per game

const Team = mongoose.model('Team', teamSchema);

export default Team;