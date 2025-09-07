import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema(
  {
    tournamentName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    gameTitle: {
      type: String,
      enum: ['BGMI', 'VALO', 'CS2', 'Multi-Game'], // Can be specific or multi-game
      required: true,
    },
    region: { // e.g., "India", "South Asia", "Global"
      type: String,
      trim: true,
      default: 'Global',
    },
    organizer: {
      type: String, // Name of the organizing entity
      trim: true,
      default: 'Aegis Esports', // Default to your platform if you are the primary organizer
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    rulesetLink: { // URL to the official tournament rules
      type: String,
      trim: true,
      default: '',
    },
    prizePool: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR', // Or 'USD', 'EUR', etc.
    },
    format: { // E.g., "Single Elimination", "Double Elimination", "Round Robin", "Group Stage + Playoffs"
      type: String,
      trim: true,
    },
    slots: { // Total number of team slots available
      type: Number,
      min: 0,
      default: 0,
    },
    registeredTeams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
    participatingTeams: [ // Teams that actually made it past registration/qualifiers
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
    matches: [ // All matches played within this tournament
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
      },
    ],
    leaderboard: [ // Final standings or current standings
      {
        team: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Team',
        },
        placement: Number,
        totalPoints: Number,
        totalKills: Number,
        // Add other aggregate stats for the tournament here if needed
      },
    ],
    winner: { // The winning team of the entire tournament
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    mvp: { // Optional: Most Valuable Player of the tournament
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      default: null,
    },
    streamLinks: [ // Where to watch the tournament
      {
        platform: String, // e.g., "YouTube", "Twitch"
        url: String,
      },
    ],
    websiteLink: { // Official tournament website/landing page
      type: String,
      trim: true,
      default: '',
    },
    // Optional: Admins/Moderators for the tournament specific to Aegis
    // admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  },
  {
    timestamps: true,
  }
);

const Tournament = mongoose.model('Tournament', tournamentSchema);

export default Tournament;