import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    orgName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    owner: { // The individual or entity that owns the organization
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player', // Could also be a separate 'User' schema if owners aren't necessarily players
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    country: {
      type: String,
      trim: true,
    },
    headquarters: { // Physical location of the organization
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    logo: { // URL to the organization's main logo
      type: String,
      trim: true,
      default: '',
    },
    establishedDate: {
      type: Date,
      default: Date.now,
    },
    activeGames: [ // List of games the organization currently operates teams in
      {
        type: String,
        enum: ['BGMI', 'VALO', 'CS2'],
      },
    ],
    teams: [ // References to teams owned by this organization
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
    totalEarnings: { // Aggregate earnings across all teams/ventures
      type: Number,
      default: 0,
      min: 0,
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    socials: {
      discord: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
      twitch: { type: String, trim: true, default: '' },
      youtube: { type: String, trim: true, default: '' },
      website: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
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

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;