import React, { useState } from 'react';
import { Check, Star, Trophy, Calendar, MapPin, Users, Target, TrendingUp, Award, Gamepad2, Eye, Settings } from 'lucide-react';
import bgmiLogo from '../assets/gameLogos/pubgm.png'
import teamLogo from '../assets/TeamLogos/falcons.png'

const AegisProfileCardBGMI = ({ cardTheme = 'orange', playerData }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Use provided playerData or fallback to sample data
  const data = playerData || {
    realName: "Swayam Nakte",
    inGameName: "Zyaxxxx",
    age: 21,
    location: "Delhi",
    game: "BGMI",
    rank: "Conqueror",
    aegisRating: 2950,
    role: "Assaulter",
    team: "Falcons",
    tournamentsPlayed: 28,
    winRate: 68.5,
    avgKDA: 2.1,
    joinDate: "January 2023",
    verified: true,
    status: "Looking for Squad",
    cardTheme: 'orange'
  };

  // Use cardTheme from props or data
  const theme = cardTheme || data.cardTheme || 'orange';

  const themeColors = {
    orange: {
      from: 'from-orange-400',
      via: 'via-red-500',
      to: 'to-amber-600',
      border: 'border-orange-300',
      shadow: 'shadow-orange-500/50',
      innerGlowFrom: 'from-orange-300/20',
      innerGlowTo: 'to-red-400/20',
      innerBorder: 'border-yellow-400/30',
      neonRingFrom: 'from-yellow-400/30',
      neonRingVia: 'via-orange-400/30',
      neonRingTo: 'to-red-500/30',
      outerGlow: 'bg-orange-400/40',
      outerGlow2: 'bg-red-500/20',
      armFrom: 'from-orange-300',
      armTo: 'to-red-400',
      armShadow: 'shadow-orange-400/50',
      badgeFrom: 'from-orange-400',
      badgeTo: 'to-red-500',
      badgeShadow: 'shadow-orange-400/50',
      borderColor: 'border-orange-400/30',
      shadowColor: 'shadow-orange-500/20',
      ratingText: 'text-amber-400',
      winRateText: 'text-orange-400',
      avgKDAText: 'text-amber-400',
    },
    blue: {
      from: 'from-blue-400',
      via: 'via-blue-600',
      to: 'to-blue-700',
      border: 'border-blue-400',
      shadow: 'shadow-blue-500/50',
      innerGlowFrom: 'from-blue-300/20',
      innerGlowTo: 'to-blue-600/20',
      innerBorder: 'border-blue-400/30',
      neonRingFrom: 'from-blue-400/30',
      neonRingVia: 'via-blue-500/30',
      neonRingTo: 'to-blue-700/30',
      outerGlow: 'bg-blue-400/40',
      outerGlow2: 'bg-blue-600/20',
      armFrom: 'from-blue-300',
      armTo: 'to-blue-600',
      armShadow: 'shadow-blue-400/50',
      badgeFrom: 'from-blue-400',
      badgeTo: 'to-blue-600',
      badgeShadow: 'shadow-blue-400/50',
      borderColor: 'border-blue-400/30',
      shadowColor: 'shadow-blue-500/20',
      ratingText: 'text-blue-400',
      winRateText: 'text-blue-400',
      avgKDAText: 'text-blue-400',
    },
    purple: {
      from: 'from-purple-400',
      via: 'via-purple-600',
      to: 'to-purple-700',
      border: 'border-purple-400',
      shadow: 'shadow-purple-500/50',
      innerGlowFrom: 'from-purple-300/20',
      innerGlowTo: 'to-purple-600/20',
      innerBorder: 'border-purple-400/30',
      neonRingFrom: 'from-purple-400/30',
      neonRingVia: 'via-purple-500/30',
      neonRingTo: 'to-purple-700/30',
      outerGlow: 'bg-purple-400/40',
      outerGlow2: 'bg-purple-600/20',
      armFrom: 'from-purple-300',
      armTo: 'to-purple-600',
      armShadow: 'shadow-purple-400/50',
      badgeFrom: 'from-purple-400',
      badgeTo: 'to-purple-600',
      badgeShadow: 'shadow-purple-400/50',
      borderColor: 'border-purple-400/30',
      shadowColor: 'shadow-purple-500/20',
      ratingText: 'text-purple-400',
      winRateText: 'text-purple-400',
      avgKDAText: 'text-purple-400',
    },
    red: {
      from: 'from-red-400',
      via: 'via-red-600',
      to: 'to-red-700',
      border: 'border-red-400',
      shadow: 'shadow-red-500/50',
      innerGlowFrom: 'from-red-300/20',
      innerGlowTo: 'to-red-600/20',
      innerBorder: 'border-red-400/30',
      neonRingFrom: 'from-red-400/30',
      neonRingVia: 'via-red-500/30',
      neonRingTo: 'to-red-700/30',
      outerGlow: 'bg-red-400/40',
      outerGlow2: 'bg-red-600/20',
      armFrom: 'from-red-300',
      armTo: 'to-red-600',
      armShadow: 'shadow-red-400/50',
      badgeFrom: 'from-red-400',
      badgeTo: 'to-red-600',
      badgeShadow: 'shadow-red-400/50',
      borderColor: 'border-red-400/30',
      shadowColor: 'shadow-red-500/20',
      ratingText: 'text-red-400',
      winRateText: 'text-red-400',
      avgKDAText: 'text-red-400',
    },
    green: {
      from: 'from-green-400',
      via: 'via-green-600',
      to: 'to-green-700',
      border: 'border-green-400',
      shadow: 'shadow-green-500/50',
      innerGlowFrom: 'from-green-300/20',
      innerGlowTo: 'to-green-600/20',
      innerBorder: 'border-green-400/30',
      neonRingFrom: 'from-green-400/30',
      neonRingVia: 'via-green-500/30',
      neonRingTo: 'to-green-700/30',
      outerGlow: 'bg-green-400/40',
      outerGlow2: 'bg-green-600/20',
      armFrom: 'from-green-300',
      armTo: 'to-green-600',
      armShadow: 'shadow-green-400/50',
      badgeFrom: 'from-green-400',
      badgeTo: 'to-green-600',
      badgeShadow: 'shadow-green-400/50',
      borderColor: 'border-green-400/30',
      shadowColor: 'shadow-green-500/20',
      ratingText: 'text-green-400',
      winRateText: 'text-green-400',
      avgKDAText: 'text-green-400',
    },
    pink: {
      from: 'from-pink-400',
      via: 'via-pink-600',
      to: 'to-pink-700',
      border: 'border-pink-400',
      shadow: 'shadow-pink-500/50',
      innerGlowFrom: 'from-pink-300/20',
      innerGlowTo: 'to-pink-600/20',
      innerBorder: 'border-pink-400/30',
      neonRingFrom: 'from-pink-400/30',
      neonRingVia: 'via-pink-500/30',
      neonRingTo: 'to-pink-700/30',
      outerGlow: 'bg-pink-400/40',
      outerGlow2: 'bg-pink-600/20',
      armFrom: 'from-pink-300',
      armTo: 'to-pink-600',
      armShadow: 'shadow-pink-400/50',
      badgeFrom: 'from-pink-400',
      badgeTo: 'to-pink-600',
      badgeShadow: 'shadow-pink-400/50',
      borderColor: 'border-pink-400/30',
      shadowColor: 'shadow-pink-500/20',
      ratingText: 'text-pink-400',
      winRateText: 'text-pink-400',
      avgKDAText: 'text-pink-400',
    }
  };

  const colors = themeColors[theme] || themeColors.orange;

  const AegisMascot = () => (
    <div className="relative">
      {/* Main Shield Body */}
      <div className={`w-16 h-20 bg-gradient-to-b ${colors.from} ${colors.via} ${colors.to} rounded-t-full rounded-b-lg border-2 ${colors.border} relative overflow-hidden shadow-lg ${colors.shadow}`}>
        {/* Shield Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-300/30 rounded-full" />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-200/40 rounded-full" />
        </div>

        {/* Neon Inner Glow */}
        <div className={`absolute inset-1 bg-gradient-to-b ${colors.innerGlowFrom} ${colors.innerGlowTo} rounded-t-full rounded-b-lg border ${colors.innerBorder}`} />

        {/* Eyes with neon glow */}
        <div className="absolute top-6 left-3 w-2 h-2 bg-yellow-300 rounded-full animate-pulse shadow-lg shadow-yellow-400/80" />
        <div className="absolute top-6 right-3 w-2 h-2 bg-yellow-300 rounded-full animate-pulse shadow-lg shadow-yellow-400/80" />

        {/* Mouth/Expression */}
        <div className="absolute top-9 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-yellow-200/90 rounded-full shadow-sm shadow-yellow-300/60" />
      </div>

      {/* Arms/Wings */}
      <div className={`absolute top-8 -left-2 w-3 h-6 bg-gradient-to-b ${colors.armFrom} ${colors.armTo} rounded-full transform rotate-12 shadow-md ${colors.armShadow}`} />
      <div className={`absolute top-8 -right-2 w-3 h-6 bg-gradient-to-b ${colors.armFrom} ${colors.armTo} rounded-full transform -rotate-12 shadow-md ${colors.armShadow}`} />

      {/* Outer Neon Glow Effect */}
      <div className={`absolute inset-0 ${colors.outerGlow} rounded-t-full rounded-b-lg blur-md -z-10 animate-pulse`} />
      <div className={`absolute inset-0 ${colors.outerGlow2} rounded-t-full rounded-b-lg blur-lg -z-20`} />

      {/* Additional neon ring */}
      <div className={`absolute -inset-1 bg-gradient-to-b ${colors.neonRingFrom} ${colors.neonRingVia} ${colors.neonRingTo} rounded-t-full rounded-b-lg blur-sm -z-30 animate-pulse`} style={{animationDuration: '2s'}} />
    </div>
  );

  return (
    <div className={`max-w-md mx-auto bg-gradient-to-br from-amber-950 to-orange-950 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 relative`}>

      {/* Header Section */}
      <div className="relative p-6 bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm border-b border-orange-400/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <AegisMascot />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white">{data.realName}</h2>
                {data.verified && (
                  <div className={`bg-gradient-to-r ${colors.badgeFrom} ${colors.badgeTo} p-1 rounded-full shadow-lg ${colors.badgeShadow}`}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-orange-400 font-medium">@{data.inGameName}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                <Calendar className="w-3 h-3" />
                <span>{data.age} years old</span>
                <span>•</span>
                <MapPin className="w-3 h-3" />
                <span>{data.location}</span>
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
          <span className="text-green-400 text-sm font-medium">{data.status}</span>
        </div>
      </div>

      {/* Aegis Rating - Prominent Display */}
      <div className={`px-6 py-4 bg-gradient-to-r ${colors.from} ${colors.to} border-y ${colors.borderColor} shadow-inner ${colors.shadowColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`flex items-center space-x-2 mb-1`}>
              <Trophy className={`w-5 h-5 ${colors.ratingText}`} />
              <span className={`${colors.ratingText} font-semibold`}>Aegis Rating</span>
            </div>
            <div className={`text-3xl font-bold text-white drop-shadow-lg`}>{data.aegisRating}</div>
          </div>
          <div className="text-right">
            <div className={`flex items-center space-x-1 ${colors.winRateText} text-sm`}>
              <TrendingUp className="w-4 h-4" />
              <span>+145 this month</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Top 12% globally</div>
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <img src={bgmiLogo} alt="BGMI Logo" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{data.game}</h3>
              <p className="text-gray-400 text-sm">{data.role}</p>
            </div>
          </div>
          <div className="text-right flex items-center space-x-3">
            <div className="text-white font-medium">{data.team}</div>
            <img src={teamLogo} alt="Team Logo" className="w-8 h-8 rounded-full" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/50 p-3 rounded-lg text-center border border-orange-400/30 shadow-sm shadow-orange-500/20">
            <div className="text-lg font-bold text-white">{data.tournamentsPlayed}</div>
            <div className="text-xs text-gray-400">Tournaments</div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg text-center border border-orange-400/30 shadow-sm shadow-orange-500/20">
            <div className="text-lg font-bold text-orange-400">{data.winRate}%</div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-lg text-center border border-orange-400/30 shadow-sm shadow-orange-500/20">
            <div className="text-lg font-bold text-amber-400">{data.avgKDA}</div>
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
            <div className="flex items-center justify-between p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <span className="text-amber-400 text-sm">🥇 Chicken Dinner - PMPL 2024</span>
              <span className="text-xs text-gray-400">3 days ago</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <span className="text-orange-400 text-sm">🎯 MVP - BGMI Masters</span>
              <span className="text-xs text-gray-400">1 week ago</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/30">
            Connect
          </button>
          <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors border border-orange-400/30">
            Message
          </button>
        </div>

        {/* Member Since */}
        <div className="text-center pt-2 border-t border-orange-400/20">
          <span className="text-xs text-gray-400">Aegis member since {data.joinDate}</span>
        </div>
      </div>
    </div>
  );
};

export default AegisProfileCardBGMI;
