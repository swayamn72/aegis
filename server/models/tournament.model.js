import mongoose from 'mongoose';
import slugify from 'slugify'; // Consider installing 'slugify' package: npm install slugify

const tournamentSchema = new mongoose.Schema(
  {
    // --- Basic Tournament Information ---
    tournamentName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      maxlength: 150,
    },
    shortName: { // Abbreviated name for display, e.g., "BGIS 2023"
      type: String,
      trim: true,
      maxlength: 50,
    },
    slug: { // URL-friendly identifier (e.g., 'bgis-2023-grand-finals')
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    gameTitle: {
      type: String,
      enum: ['BGMI', 'Multi-Game'], // Primarily BGMI for this schema
      default: 'BGMI',
      required: true,
      index: true,
    },

    // --- Tournament Classification ---
    tier: { // S-Tier, A-Tier, B-Tier, C-Tier (common esports classification)
      type: String,
      enum: ['S', 'A', 'B', 'C', 'Community'],
      default: 'Community', // More common for local/smaller events
      index: true,
    },
    region: { // Geographic scope
      type: String,
      enum: ['Global', 'Asia', 'India', 'South Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Middle East', 'Africa'],
      default: 'India',
      index: true,
    },
    subRegion: { // More specific regional classification, e.g., "Maharashtra"
      type: String,
      trim: true,
    },

    // --- Organizer Information ---
    organizer: {
      name: {
        type: String,
        required: true,
        trim: true,
        default: 'Aegis Esports',
      },
      website: String, // URL to organizer's website
      contactEmail: String, // Organizer's contact email
      organizationRef: { // Optional: reference to your Organization schema
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
      },
    },
    sponsors: [
      {
        name: String,
        logoUrl: String,
        website: String,
        tier: { // e.g., "Title", "Presenting", "Official", "Supporting"
          type: String,
          enum: ['Title', 'Presenting', 'Official', 'Supporting'],
        },
      },
    ],

    // --- Tournament Timeline ---
    announcementDate: Date,
    registrationStartDate: Date,
    registrationEndDate: Date,
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        'announced',
        'registration_open',
        'registration_closed',
        'qualifiers_in_progress', // More specific phase
        'in_progress',
        'completed',
        'cancelled',
        'postponed'
      ],
      default: 'announced',
      index: true,
    },

    // --- Tournament Structure & Participation ---
    format: { // e.g., "Battle Royale Points System", "Elimination Format"
      type: String,
      enum: [
        'Battle Royale Points System', // Standard for BGMI
        'Elimination Format', // Custom stages
        'Custom'
      ],
      required: true,
    },
    formatDetails: { // Detailed explanation of how the format works (e.g., scoring rules)
      type: String,
      trim: true,
    },
    slots: { // Overall team slots
      total: {
        type: Number,
        required: true,
        min: 2,
      },
      invited: { // Number of invited teams
        type: Number,
        default: 0,
      },
      fromQualifiers: { // Number of teams advancing from qualifiers
        type: Number,
        default: 0,
      },
      openRegistrations: { // Number of teams from open registration
        type: Number,
        default: 0,
      },
    },
    // The actual teams competing in the tournament
    participatingTeams: [
      {
        team: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Team',
          required: true,
        },
        seed: Number, // Initial seeding
        group: String, // For group stage tournaments (e.g., "Group A")
        qualifiedThrough: { // How the team entered (invite, qualifier, open, wildcard)
          type: String,
          enum: ['invite', 'qualifier', 'open_registration', 'wildcard'],
        },
        currentStage: { // Which stage the team is currently in/was eliminated from
          type: String,
          trim: true,
        },
        // You can add aggregate team stats for THIS tournament here
        totalTournamentPoints: { type: Number, default: 0 },
        totalTournamentKills: { type: Number, default: 0 },
      },
    ],

    // --- Tournament Phases (e.g., Qualifiers, Group Stage, Grand Finals) ---
    phases: [
      {
        name: String, // e.g., "Online Qualifiers", "Group Stage 1", "Semi-Finals", "Grand Finals"
        type: { // Type of phase
          type: String,
          enum: ['qualifier', 'group_stage', 'elimination_stage', 'final_stage'],
          required: true,
        },
        startDate: Date,
        endDate: Date,
        status: { // Status of this specific phase
          type: String,
          enum: ['upcoming', 'in_progress', 'completed'],
          default: 'upcoming',
        },
        matches: [{ // Matches belonging to this phase
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Match',
        }],
        rulesetSpecifics: String, // Any rules specific to this phase
        details: String, // e.g., "Top 8 teams advance"
      },
    ],

    // --- Groups (for group stage tournaments) ---
    groups: [
      {
        name: String, // e.g., "Group Alpha", "Group Beta"
        teams: [{ // Teams specifically in this group
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Team',
        }],
        standings: [ // Group-specific standings
          {
            team: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Team',
            },
            position: Number,
            matchesPlayed: { type: Number, default: 0 },
            chickenDinners: { type: Number, default: 0 }, // For BR games
            points: { type: Number, default: 0 },
            kills: { type: Number, default: 0 },
            netChange: { type: Number, default: 0 }, // Position change if tracked live
          },
        ],
      },
    ],

    // --- Overall Tournament Results ---
    finalStandings: [
      {
        position: {
          type: Number,
          required: true,
        },
        team: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Team',
          required: true,
        },
        prize: { // Prize won by this team
          amount: Number,
          currency: {
            type: String,
            default: 'INR',
          },
        },
        tournamentPointsAwarded: Number, // Points for an overarching circuit
        qualification: String, // What this placement qualifies them for (e.g., "Next Stage", "Regional Finals")
      },
    ],

    // --- Prize Information ---
    prizePool: {
      total: {
        type: Number,
        min: 0,
        default: 0,
      },
      currency: {
        type: String,
        enum: ['INR', 'USD', 'EUR', 'GBP'],
        default: 'INR',
      },
      distribution: [ // How the prize pool is split for team positions
        {
          position: String, // "1st", "2nd", "3rd", "3rd-4th"
          amount: Number,
          percentage: Number,
        },
      ],
      individualAwards: [ // Individual player awards (MVP, Best IGL, etc.)
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          description: {
            type: String,
            trim: true,
          },
          amount: {
            type: Number,
            min: 0,
            default: 0,
          },
          percentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
          },
          recipient: { // Who won this award (populated after tournament ends)
            player: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Player',
            },
            team: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Team',
            },
          },
          awarded: {
            type: Boolean,
            default: false,
          },
          awardedDate: Date,
        },
      ],
    },

    // --- Tournament Statistics ---
    statistics: {
      totalMatches: { type: Number, default: 0 },
      totalParticipatingTeams: { type: Number, default: 0 }, // Count of teams in `participatingTeams`
      totalKills: { type: Number, default: 0 }, // Aggregate from all matches
      totalDamage: { type: Number, default: 0 }, // Aggregate from all matches
      averageMatchDuration: Number, // in minutes
      longestMatch: Number, // in minutes
      shortestMatch: Number, // in minutes
      mostKillsInMatch: {
        count: Number,
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }, // Link to specific player
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
        match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
      },
      mostChickenDinners: {
        count: Number,
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
      },
      viewership: { // Aggregate viewership stats
        peak: Number,
        average: Number,
        totalHoursWatched: Number,
      },
    },

    // --- Awards and Recognition ---
    awards: [
      {
        type: { // e.g., "MVP", "Fan Favorite", "Most Kills"
          type: String,
          enum: ['MVP', 'Best Player', 'Most Kills', 'Fan Favorite', 'Aegis Star'],
        },
        recipient: {
          player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
          team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
        },
        description: String, // e.g., "Highest Kills in Finals"
      },
    ],

    // --- Media and Coverage ---
    media: {
      logo: String, // URL for tournament logo
      banner: String, // URL for main banner image
      trailer: String, // URL for announcement trailer video
      gallery: [String], // Array of image URLs for event gallery
    },
    streamLinks: [ // Where to watch the tournament
      {
        platform: {
          type: String,
          enum: ['YouTube', 'Twitch', 'Facebook Gaming', 'Loco', 'Rooter', 'JioGames', 'Custom'], // Added Indian platforms
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        language: {
          type: String,
          default: 'English',
        },
        isOfficial: { // Is this an official stream
          type: Boolean,
          default: false,
        },
      },
    ],
    socialMedia: { // Tournament specific social media links
      twitter: String,
      instagram: String,
      discord: String,
      facebook: String,
      youtube: String, // Added YouTube for VODs/streams
    },

    // --- Documentation and Rules ---
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    rulesetDocument: String, // URL to full ruleset PDF/document
    websiteLink: String, // Official tournament website/landing page

    // --- Game Specific Settings (BGMI) ---
    gameSettings: {
      serverRegion: String, // e.g., "India", "Middle East"
      gameMode: {
        type: String,
        enum: ['TPP Squad', 'FPP Squad', 'TPP Duo', 'FPP Duo', 'TPP Solo', 'FPP Solo', 'Custom'],
        default: 'TPP Squad',
      },
      maps: { // Maps in rotation for this tournament
        type: [String],
        enum: ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik', 'Nusa', 'Rondo'],
        default: ['Erangel', 'Miramar'], // Common starting maps
      },
      pointsSystem: mongoose.Schema.Types.Mixed, // Detailed object for BGMI specific point system
    },

    // --- Administrative ---
    visibility: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'public',
    },
    featured: { // To highlight on homepages
      type: Boolean,
      default: false,
      index: true,
    },
    verified: { // Marks as an officially verified tournament
      type: Boolean,
      default: false,
      index: true,
    },
    admins: [ // Aegis platform users who administer this tournament
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player', // Assuming 'Player' can also be an admin, or create a 'User' schema
      },
    ],

    // --- Qualification and Series Information ---
    parentSeries: { // If this tournament is part of a larger series (e.g., "BGIS Qualifiers" -> "BGIS Grand Finals")
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TournamentSeries', // You might want a separate schema for this
    },
    qualifiesFor: [ // What this tournament leads to
      {
        tournament: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Tournament',
        },
        slots: Number, // How many teams qualify
        details: String, // e.g., "Top 4 teams advance to Finals"
      },
    ],

    // --- Metadata ---
    tags: [String], // For categorization and search (e.g., "LAN", "Online", "Charity")
    notes: String, // Internal notes for admins
    externalIds: { // IDs from other platforms for cross-referencing
      liquipedia: String,
      battlefy: String,
      challengermode: String,
      // Add more as needed
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Indexes for better query performance ---
tournamentSchema.index({ gameTitle: 1, region: 1, startDate: -1 });
tournamentSchema.index({ status: 1, startDate: -1 });
tournamentSchema.index({ featured: 1, startDate: -1 });
tournamentSchema.index({ 'prizePool.total': -1 });
tournamentSchema.index({ tags: 1 });
tournamentSchema.index({ 'organizer.name': 1 }); // Index on organizer name

// --- Virtuals (derived properties not stored in DB) ---

// Virtual for tournament duration in days
tournamentSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for registration status (more robust)
tournamentSchema.virtual('registrationDisplayStatus').get(function() {
  const now = new Date();
  if (this.status === 'cancelled') return 'Cancelled';
  if (this.status === 'completed') return 'Completed';
  if (this.status === 'in_progress' || this.status.includes('_in_progress')) return 'Live';

  if (!this.registrationStartDate || !this.registrationEndDate) return 'Closed';
  if (now < this.registrationStartDate) return 'Upcoming';
  if (now >= this.registrationStartDate && now <= this.registrationEndDate) {
    // Check if slots are full
    const currentParticipatingTeams = this.participatingTeams ? this.participatingTeams.length : 0;
    if (currentParticipatingTeams >= this.slots.total) {
      return 'Slots Full';
    }
    return 'Open';
  }
  if (now > this.registrationEndDate) return 'Closed';
  return 'Unknown';
});


// Virtual for current competition phase
tournamentSchema.virtual('currentCompetitionPhase').get(function() {
  if (!this.phases || this.phases.length === 0) return null;
  const now = new Date();
  const current = this.phases.find(phase => phase.startDate <= now && phase.endDate >= now);
  if (current) return current.name;
  const next = this.phases.find(phase => phase.startDate > now);
  if (next) return `Next: ${next.name}`;
  const lastCompleted = this.phases.find(phase => phase.status === 'completed');
  if (lastCompleted) return `Last: ${lastCompleted.name}`;
  return null;
});

// --- Pre-save middleware to generate slug ---
tournamentSchema.pre('save', function(next) {
  if (this.isModified('tournamentName') && this.tournamentName) {
    this.slug = slugify(this.tournamentName, { lower: true, strict: true });
  }
  // Ensure the total participating teams count is updated
  this.statistics.totalParticipatingTeams = this.participatingTeams ? this.participatingTeams.length : 0;
  next();
});

// --- Methods (instance methods) ---

// Method to check if tournament is currently live/in-progress
tournamentSchema.methods.isLive = function() {
  const now = new Date();
  return (this.startDate <= now && this.endDate >= now && 
          ['in_progress', 'qualifiers_in_progress', 'group_stage', 'playoffs', 'finals'].includes(this.status));
};

// Method to get a specific phase by name
tournamentSchema.methods.getPhase = function(phaseName) {
  return this.phases.find(phase => phase.name === phaseName);
};

// --- Statics (static methods) ---

// Static method to find tournaments by game and region
tournamentSchema.statics.findByGameAndRegion = function(gameTitle, region, limit = 10) {
  return this.find({
    gameTitle,
    region,
    visibility: 'public'
  })
  .sort({ startDate: -1 })
  .limit(limit)
  .populate('participatingTeams.team', 'teamName logo') // Only participating teams now
  .populate('winner', 'teamName logo'); // Populate winner if needed
};

// Static method to find upcoming tournaments
tournamentSchema.statics.findUpcoming = function(limit = 10) {
  const now = new Date();
  return this.find({
    startDate: { $gte: now },
    visibility: 'public'
  })
  .sort({ startDate: 1 })
  .limit(limit);
};

// Static method to find live tournaments
tournamentSchema.statics.findLive = function(limit = 10) {
  const now = new Date();
  return this.find({
    startDate: { $lte: now },
    endDate: { $gte: now },
    status: { $in: ['qualifiers_in_progress', 'in_progress', 'group_stage', 'playoffs', 'finals'] },
    visibility: 'public'
  })
  .sort({ startDate: 1 })
  .limit(limit);
};


const Tournament = mongoose.model('Tournament', tournamentSchema);

export default Tournament;