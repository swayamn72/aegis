import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      maxlength: 100,
    },
    teamTag: { 
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 5,
    },
    logo: { 
      type: String,
      trim: true,
      default: 'https://placehold.co/200x200/1a1a1a/ffffff?text=TEAM',
    },
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
      },
    ],
    primaryGame: {
      type: String,
      enum: ['BGMI', 'VALO', 'CS2'],
      required: true,
      default: 'BGMI',
    },
    region: {
      type: String,
      enum: ['Global', 'India'],
      default: 'India',
    },
    country: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
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
      min: 0,
      max: 3000,
    },
    
    // Tournament and match statistics
    statistics: {
      tournamentsPlayed: { type: Number, default: 0 },
      matchesPlayed: { type: Number, default: 0 },
      totalKills: { type: Number, default: 0 },
      chickenDinners: { type: Number, default: 0 },
      averagePlacement: { type: Number, default: 0 },
      winRate: { type: Number, default: 0 }, 
    },
    
    // Recent tournament results
    recentResults: [
      {
        tournament: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tournament',
        },
        placement: Number,
        points: Number,
        earnings: Number,
        date: Date,
      }
    ],
    
    qualifiedEvents: [ 
      {
        tournament: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tournament',
        },
        eventName: String,
        qualificationDate: Date,
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
    
    // Team status and availability
    status: {
      type: String,
      enum: ['active', 'inactive', 'disbanded', 'looking_for_players'],
      default: 'active',
    },
    
    // Recruitment information
    lookingForPlayers: {
      type: Boolean,
      default: false,
    },
    openRoles: [
      {
        type: String,
        enum: ['IGL', 'assaulter', 'support', 'sniper', 'fragger'],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for win rate calculation
teamSchema.virtual('winRatePercentage').get(function() {
  if (this.statistics.matchesPlayed === 0) return 0;
  return Math.round((this.statistics.matchesWon / this.statistics.matchesPlayed) * 100);
});

// Virtual for average kills per match
teamSchema.virtual('averageKillsPerMatch').get(function() {
  if (this.statistics.matchesPlayed === 0) return 0;
  return Math.round((this.statistics.totalKills / this.statistics.matchesPlayed) * 100) / 100;
});

// Indexes for better query performance
teamSchema.index({ teamName: 1, primaryGame: 1 });
teamSchema.index({ region: 1, primaryGame: 1 });
teamSchema.index({ 'statistics.tournamentsPlayed': -1 });
teamSchema.index({ totalEarnings: -1 });
teamSchema.index({ aegisRating: -1 });
teamSchema.index({ status: 1, lookingForPlayers: 1 });
teamSchema.index({ players: 1 });

// Pre-save middleware to calculate win rate
teamSchema.pre('save', function(next) {
  if (this.statistics.matchesPlayed > 0) {
    this.statistics.winRate = Math.round((this.statistics.matchesWon / this.statistics.matchesPlayed) * 100);
  }
  next();
});

// Static method to find teams by game and region
teamSchema.statics.findByGameAndRegion = function(game, region, limit = 10) {
  return this.find({
    primaryGame: game,
    region: region,
    profileVisibility: 'public',
    status: 'active'
  })
  .populate('captain', 'username profilePicture')
  .populate('players', 'username profilePicture')
  .sort({ aegisRating: -1 })
  .limit(limit);
};

// Static method to find teams looking for players
teamSchema.statics.findLookingForPlayers = function(game, role, limit = 10) {
  const query = {
    lookingForPlayers: true,
    status: 'active',
    profileVisibility: 'public'
  };
  
  if (game) query.primaryGame = game;
  if (role) query.openRoles = role;
  
  return this.find(query)
    .populate('captain', 'username profilePicture')
    .populate('players', 'username profilePicture')
    .sort({ aegisRating: -1 })
    .limit(limit);
};

const Team = mongoose.model('Team', teamSchema);

export default Team;