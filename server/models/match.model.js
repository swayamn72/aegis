import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    matchId: { // A unique identifier for this specific match (e.g., from an API or internal generation)
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament', // Assuming you'll have a Tournament schema later
      required: false, // Not all matches might be part of a formal tournament
    },
    matchRound: { // E.g., "Group Stage - Match 1", "Semi-Finals - Game 3", "Grand Finals"
      type: String,
      trim: true,
    },
    gameTitle: {
      type: String,
      enum: ['BGMI'], // Explicitly BGMI for this schema
      default: 'BGMI',
      required: true,
    },
    map: {
      type: String,
      enum: ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik', 'Nusa'], // Common BGMI maps
      required: true,
    },
    matchDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    participatingTeams: [ // Teams participating in this match
      {
        team: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Team',
          required: true,
        },
        placement: { // Final placement of the team in this match
          type: Number,
          min: 1,
          default: null,
        },
        totalKills: { // Total kills by the team
          type: Number,
          min: 0,
          default: 0,
        },
        points: { // Total points awarded to the team for this match (placement + kill points)
          type: Number,
          min: 0,
          default: 0,
        },
        // You could add other team-specific stats here like damage dealt, survivability score etc.
      },
    ],
    playerStats: [ // Detailed individual player stats for this match
      {
        player: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Player',
          required: true,
        },
        team: { // Which team this player belonged to in this match
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Team',
          required: true,
        },
        kills: {
          type: Number,
          min: 0,
          default: 0,
        },
        damageDealt: {
          type: Number,
          min: 0,
          default: 0,
        },
        headshots: {
          type: Number,
          min: 0,
          default: 0,
        },
        assists: {
          type: Number,
          min: 0,
          default: 0,
        },
        // survivabilityTime: { // in seconds or minutes
        //   type: Number,
        //   min: 0,
        //   default: 0,
        // },
        // other relevant player stats (e.g., healing, revives, knockdowns)
      },
    ],
    winner: { // The winning team (if applicable, e.g., for a single match winner)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    // Optional: Video VODs or stream links
    vodLink: {
      type: String,
      trim: true,
      default: '',
    },
    streamLink: {
      type: String,
      trim: true,
      default: '',
    },
    // Optional: Match officials or casters
    // officials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // casters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

const Match = mongoose.model('Match', matchSchema);

export default Match;