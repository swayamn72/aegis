import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    // --- Basic Match Information ---
    matchNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    
    // --- Tournament Reference ---
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
      index: true,
    },
    tournamentPhase: {
      type: String,
      trim: true,
      required: true, // e.g., "Group Stage Day 1", "Grand Finals"
    },
    
    // --- Match Timing ---
    scheduledStartTime: {
      type: Date,
      required: true,
      index: true,
    },
    
    // --- Match Status ---
    status: {
      type: String,
      enum: [
        'scheduled',
        'in_progress',
        'completed',
        'cancelled',
      ],
      default: 'scheduled',
      index: true,
    },
    
    // --- Map ---
    map: {
      type: String,
      enum: ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Rondo'],
      required: true,
    },
    
    // --- Participating Teams (up to 25 teams) ---
    participatingTeams: [
      {
        team: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Team',
          required: true,
        },
        teamName: String,
        teamTag: String,
        players: [ // 4 players per team
          {
            player: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Player',
              required: true,
            },
            playerName: String, 
            role: {
              type: String,
              enum: ['IGL', 'assaulter', 'support', 'sniper', 'fragger'],
            },
          }
        ],
        // Team's overall performance in this match
        finalPosition: { // 1st, 2nd, 3rd, etc. - null for unplayed matches
          type: Number,
          min: 1,
          max: 25,
          default: null,
        },
        points: {
          placementPoints: { type: Number, default: 0 },
          killPoints: { type: Number, default: 0 },
          totalPoints: { type: Number, default: 0 },
        },
        kills: {
          total: { type: Number, default: 0 },
          breakdown: [
            {
              player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
              kills: { type: Number, default: 0 },
            }
          ]
        },
        chickenDinner: { // Did this team win the match?
          type: Boolean,
          default: false,
        },
      }
    ],
    
    // --- Match Statistics ---
    matchStats: {
      totalKills: { type: Number, default: 0 },
      mostKillsPlayer: {
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
        kills: Number,
      },
    },
    
    // --- Streaming ---
    streamUrls: [
      {
        platform: {
          type: String,
          enum: ['YouTube', 'Twitch', 'Facebook Gaming', 'Loco', 'Rooter'],
        },
        url: String,
        language: String,
        isMain: Boolean,
      }
    ],
    
    // --- Points System Reference ---
    pointsSystem: {
      placementPoints: {
        1: { type: Number, default: 10 }, // 1st place
        2: { type: Number, default: 6 },  // 2nd place
        3: { type: Number, default: 5 },  // 3rd place
        4: { type: Number, default: 4 },  // 4th place
        5: { type: Number, default: 3 },  // 5th place
        6: { type: Number, default: 2 },  // 6th place
        7: { type: Number, default: 1 },  // 7th place
        8: { type: Number, default: 1 },  // 8th place
        // 9th-16th get 0 points typically
      },
      killPoints: {
        type: Number,
        default: 1, // 1 point per kill
      },
    },

    // --- Metadata ---
    tags: [String], // For categorization
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Indexes for better query performance ---
matchSchema.index({ tournament: 1, matchNumber: 1 });
matchSchema.index({ status: 1, scheduledStartTime: 1 });
matchSchema.index({ map: 1, status: 1 });
matchSchema.index({ matchType: 1, scheduledStartTime: -1 });
matchSchema.index({ 'participatingTeams.team': 1 });
matchSchema.index({ createdAt: -1 });

// --- Virtuals ---

// Virtual for winner team
matchSchema.virtual('winner').get(function() {
  return this.participatingTeams.find(team => team.finalPosition === 1);
});

// Virtual for chicken dinner team
matchSchema.virtual('chickenDinnerTeam').get(function() {
  return this.participatingTeams.find(team => team.chickenDinner === true);
});

// Virtual for teams count
matchSchema.virtual('teamsCount').get(function() {
  return this.participatingTeams.length;
});

// Virtual to check if match is live
matchSchema.virtual('isLive').get(function() {
  return this.status === 'in_progress';
});

// --- Pre-save middleware ---
matchSchema.pre('save', function(next) {
  
  // Calculate total match stats from participating teams
  if (this.participatingTeams && this.participatingTeams.length > 0) {
    this.matchStats.totalKills = this.participatingTeams.reduce((total, team) => total + team.kills.total, 0);
    
  }
  
  next();
});

// --- Instance Methods ---

// Method to get team by position
matchSchema.methods.getTeamByPosition = function(position) {
  return this.participatingTeams.find(team => team.finalPosition === position);
};

// Method to get top N teams
matchSchema.methods.getTopTeams = function(n = 3) {
  return this.participatingTeams
    .filter(team => team.finalPosition)
    .sort((a, b) => a.finalPosition - b.finalPosition)
    .slice(0, n);
};

// Method to calculate team's total points
matchSchema.methods.calculateTeamPoints = function(teamId) {
  const team = this.participatingTeams.find(t => t.team.toString() === teamId.toString());
  if (!team) return 0;
  
  const placementPoints = this.pointsSystem.placementPoints[team.finalPosition] || 0;
  const killPoints = team.kills.total * this.pointsSystem.killPoints;
  
  return placementPoints + killPoints;
};

// Method to get match leaderboard
matchSchema.methods.getLeaderboard = function() {
  return this.participatingTeams
    .map(team => ({
      team: team.team,
      teamName: team.teamName,
      position: team.finalPosition,
      kills: team.kills.total,
      totalPoints: team.points.totalPoints,
      survivalTime: team.survivalTime,
      chickenDinner: team.chickenDinner
    }))
    .sort((a, b) => a.position - b.position);
};

// --- Static Methods ---

// Find matches by tournament
matchSchema.statics.findByTournament = function(tournamentId, limit = 20) {
  return this.find({ tournament: tournamentId })
    .sort({ scheduledStartTime: -1 })
    .limit(limit)
    .populate('participatingTeams.team', 'teamName teamTag logo')
    .populate('tournament', 'tournamentName shortName');
};

// Find live matches
matchSchema.statics.findLive = function() {
  return this.find({ 
    status: 'in_progress',
    visibility: 'public'
  })
  .populate('participatingTeams.team', 'teamName teamTag logo')
  .populate('tournament', 'tournamentName shortName')
  .sort({ scheduledStartTime: 1 });
};

// Find recent completed matches
matchSchema.statics.findRecentCompleted = function(limit = 10) {
  return this.find({ 
    status: 'completed',
    visibility: 'public'
  })
  .sort({ actualEndTime: -1 })
  .limit(limit)
  .populate('participatingTeams.team', 'teamName teamTag logo')
  .populate('tournament', 'tournamentName shortName');
};

// Find matches by map
matchSchema.statics.findByMap = function(map, limit = 10) {
  return this.find({ 
    map: map,
    status: 'completed',
    visibility: 'public'
  })
  .sort({ actualEndTime: -1 })
  .limit(limit);
};

const Match = mongoose.model('Match', matchSchema);

export default Match;