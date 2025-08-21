import React, { useState } from 'react';
import { Check, Trophy, Calendar, MapPin, TrendingUp, Award, Eye, Settings } from 'lucide-react';
import valoLogo from '../assets/valoLogo.svg'


const AegisProfileCard = () => {
  // Sample player data
  const playerData = {
    realName: "Swayam Nakte",
    inGameName: "Zyaxxxx",
    age: 19,
    location: "Mumbai",
    game: "Valorant",
    rank: "Immortal 3",
    aegisRating: 2847,
    role: "Duelist",
    team: "Neon Esports",
    tournamentsPlayed: 34,
    winRate: 73.2,
    avgKDA: 1.8,
    joinDate: "March 2023",
    verified: true,
    status: "Looking for Team"
  };

  const AegisMascot = () => (
    <div className="relative">
      {/* Main Shield Body */}
      <div className="w-16 h-20 bg-gradient-to-b from-purple-400 via-violet-500 to-fuchsia-600 rounded-t-full rounded-b-lg border-2 border-purple-300 relative overflow-hidden shadow-lg shadow-violet-500/50">
        {/* Shield Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-purple-300/30 rounded-full" />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-200/40 rounded-full" />
        </div>
        
        {/* Neon Inner Glow */}
        <div className="absolute inset-1 bg-gradient-to-b from-purple-300/20 to-violet-400/20 rounded-t-full rounded-b-lg border border-purple-400/30" />
        
        {/* Eyes with neon glow */}
        <div className="absolute top-6 left-3 w-2 h-2 bg-purple-300 rounded-full animate-pulse shadow-lg shadow-purple-400/80" />
        <div className="absolute top-6 right-3 w-2 h-2 bg-purple-300 rounded-full animate-pulse shadow-lg shadow-purple-400/80" />
        
        {/* Mouth/Expression */}
        <div className="absolute top-9 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-purple-200/90 rounded-full shadow-sm shadow-purple-300/60" />
      </div>
      
      {/* Arms/Wings */}
      <div className="absolute top-8 -left-2 w-3 h-6 bg-gradient-to-b from-purple-300 to-violet-400 rounded-full transform rotate-12 shadow-md shadow-purple-400/50" />
      <div className="absolute top-8 -right-2 w-3 h-6 bg-gradient-to-b from-purple-300 to-violet-400 rounded-full transform -rotate-12 shadow-md shadow-purple-400/50" />
      
      {/* Outer Neon Glow Effect */}
      <div className="absolute inset-0 bg-purple-400/40 rounded-t-full rounded-b-lg blur-md -z-10 animate-pulse" />
      <div className="absolute inset-0 bg-violet-500/20 rounded-t-full rounded-b-lg blur-lg -z-20" />
      
      {/* Additional neon ring */}
      <div className="absolute -inset-1 bg-gradient-to-b from-purple-400/30 via-violet-400/30 to-fuchsia-500/30 rounded-t-full rounded-b-lg blur-sm -z-30 animate-pulse" style={{animationDuration: '2s'}} />
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-gray-700 relative">
      
      {/* Header Section */}
      <div className="relative p-6 bg-gradient-to-r from-gray-800/80 to-gray-900/50 backdrop-blur-sm border-b border-purple-400/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <AegisMascot />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white">{playerData.realName}</h2>
                {playerData.verified && (
                  <div className="bg-gradient-to-r from-purple-400 to-violet-500 p-1 rounded-full shadow-lg shadow-purple-400/50">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-purple-400 font-medium">@{playerData.inGameName}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                <Calendar className="w-3 h-3" />
                <span>{playerData.age} years old</span>
                <span>•</span>
                <MapPin className="w-3 h-3" />
                <span>{playerData.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors">
              <Eye className="w-4 h-4 text-gray-300" />
            </button>
            <button className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
          <span className="text-green-400 text-sm font-medium">{playerData.status}</span>
        </div>
      </div>

      {/* Aegis Rating - Prominent Display */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-900/40 to-violet-900/40 border-y border-purple-500/30 shadow-inner shadow-purple-500/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Trophy className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-semibold">Aegis Rating</span>
            </div>
            <div className="text-3xl font-bold text-white drop-shadow-lg">{playerData.aegisRating}</div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-violet-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+127 this month</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Top 15% globally</div>
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <img src={valoLogo} alt="" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{playerData.game}</h3>
              <p className="text-gray-400 text-sm">{playerData.rank} • {playerData.role}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-medium">{playerData.team}</div>
            <div className="text-xs text-gray-400">Current Team</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/50 p-3 rounded-lg text-center border border-purple-400/30 shadow-sm shadow-purple-500/20">
            <div className="text-lg font-bold text-white">{playerData.tournamentsPlayed}</div>
            <div className="text-xs text-gray-400">Tournaments</div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg text-center border border-purple-400/30 shadow-sm shadow-purple-500/20">
            <div className="text-lg font-bold text-purple-400">{playerData.winRate}%</div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg text-center border border-purple-400/30 shadow-sm shadow-purple-500/20">
            <div className="text-lg font-bold text-violet-400">{playerData.avgKDA}</div>
            <div className="text-xs text-gray-400">Avg K/D/A</div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="space-y-2">
          <h4 className="text-white font-medium flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Recent Achievements</span>
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <span className="text-purple-400 text-sm">🥇 Champion - Winter Circuit 2024</span>
              <span className="text-xs text-gray-400">2 days ago</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-violet-500/10 border border-violet-500/30 rounded-lg">
              <span className="text-violet-400 text-sm">🎯 MVP - Regional Qualifier</span>
              <span className="text-xs text-gray-400">1 week ago</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-500/30">
            Connect
          </button>
          <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors border border-purple-400/30">
            Message
          </button>
        </div>

        {/* Member Since */}
        <div className="text-center pt-2 border-t border-purple-400/20">
          <span className="text-xs text-gray-400">Aegis member since {playerData.joinDate}</span>
        </div>
      </div>
    </div>
  );
};

export default AegisProfileCard;
