// Run this migration script once
import mongoose from 'mongoose';
import Team from './models/team.model.js';
import Player from './models/player.model.js';

// Update existing teams to use new field names
await Team.updateMany(
  { tag: { $exists: true } },
  { $rename: { tag: 'teamTag' } }
);

// Initialize new statistics fields for existing players/teams
await Player.updateMany(
  { statistics: { $exists: false } },
  { $set: { statistics: {
    tournamentsPlayed: 0,
    matchesPlayed: 0,
    matchesWon: 0,
    totalKills: 0,
    totalDamage: 0,
    totalDeaths: 0,
    averagePlacement: 0,
    chickenDinners: 0,
    headshotPercentage: 0,
    kdRatio: 0,
    winRate: 0
  }}}
);

await Team.updateMany(
  { statistics: { $exists: false } },
  { $set: { statistics: {
    tournamentsPlayed: 0,
    matchesPlayed: 0,
    matchesWon: 0,
    totalKills: 0,
    totalDamage: 0,
    chickenDinners: 0,
    averagePlacement: 0,
    winRate: 0
  }}}
);