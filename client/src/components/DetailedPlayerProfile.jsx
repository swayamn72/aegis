import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Check, Star, Trophy, Calendar, MapPin, Users, Target, TrendingUp,
  Award, Gamepad2, Eye, Settings, Share2, MessageCircle, UserPlus,
  ArrowUp, ArrowDown, Activity, Clock, Zap, Shield, Sword,
  Medal, Crown, ChevronRight, ExternalLink, Copy,
  BarChart3, PieChart, LineChart, Hash, Globe
} from 'lucide-react';

const DetailedPlayerProfile = () => {
  const { playerId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [ratingPeriod, setRatingPeriod] = useState('6months');
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/players/${playerId}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch player data');
        }
        const data = await response.json();
        setPlayerData(data.player);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [playerId]);

  if (loading) {
    return <div className="text-white p-6">Loading player profile...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-6">Error: {error}</div>;
  }

  if (!playerData) {
    return <div className="text-white p-6">No player data found.</div>;
  }

  // Map playerData fields to expected variables for UI
  const mappedPlayer = {
    realName: playerData.realName || 'N/A',
    inGameName: playerData.inGameName || playerData.username || 'N/A',
    age: playerData.age || 'N/A',
    location: playerData.location || playerData.country || 'N/A',
    country: playerData.country || 'N/A',
    game: playerData.primaryGame || 'N/A',
    rank: 'N/A', // Not in schema
    aegisRating: playerData.aegisRating || 0,
    peakRating: 0, // Not in schema
    role: playerData.inGameRole?.join(', ') || 'N/A',
    team: playerData.teamStatus || 'N/A',
    tournamentsPlayed: playerData.tournamentsPlayed || 0,
    winRate: 0, // Not in schema
    avgKDA: 0, // Not in schema
    joinDate: playerData.createdAt ? new Date(playerData.createdAt).toLocaleDateString() : 'N/A',
    verified: playerData.verified || false,
    status: playerData.teamStatus || 'N/A',
    bio: playerData.bio || '',
    primaryAgent: 'N/A', // Not in schema
    secondaryAgent: 'N/A', // Not in schema
    playstyle: 'N/A', // Not in schema
    languages: playerData.languages || [],
    socials: { // Use schema fields
      discord: playerData.discordTag || '',
      twitch: playerData.twitch || '',
      youtube: playerData.YouTube || '',
    },
    currentStreak: 0, // Not in schema
    followers: 0, // Not in schema
    following: 0, // Not in schema
    earnings: playerData.earnings || 0,
    matchesPlayed: playerData.matchesPlayed || 0,
    qualifiedEvents: playerData.qualifiedEvents || false,
    qualifiedEventDetails: playerData.qualifiedEventDetails || [],
    availability: playerData.availability || 'N/A',
    profileVisibility: playerData.profileVisibility || 'public',
    cardTheme: playerData.cardTheme || 'orange',
  };

  // Match history data
  const matchHistory = [
    { id: 1, date: "2025-08-24", opponent: "Team Vitality", result: "Win", score: "13-9", map: "Ascent", kda: "24/12/8", rating: 1.8, ratingChange: +12 },
    { id: 2, date: "2025-08-23", opponent: "FunPlus Phoenix", result: "Loss", score: "11-13", map: "Bind", kda: "18/15/6", rating: 1.2, ratingChange: -8 },
    { id: 3, date: "2025-08-22", opponent: "Paper Rex", result: "Win", score: "13-7", map: "Split", kda: "26/10/5", rating: 2.1, ratingChange: +15 },
    { id: 4, date: "2025-08-21", opponent: "Team Liquid", result: "Win", score: "13-11", map: "Haven", kda: "22/14/9", rating: 1.6, ratingChange: +9 },
    { id: 5, date: "2025-08-20", opponent: "LOUD", result: "Loss", score: "8-13", map: "Fracture", kda: "15/18/7", rating: 0.9, ratingChange: -11 }
  ];

  // Tournament history
  const tournamentHistory = [
    { 
      id: 1, 
      name: "Valorant Champions 2024", 
      placement: "2nd", 
      prize: "$45,000", 
      date: "2024-12-15", 
      teams: 32,
      ratingChange: +87,
      status: "completed"
    },
    { 
      id: 2, 
      name: "VCT Stage 2 Masters", 
      placement: "5-6th", 
      prize: "$12,000", 
      date: "2024-11-20", 
      teams: 16,
      ratingChange: +23,
      status: "completed"
    },
    { 
      id: 3, 
      name: "Regional Qualifier", 
      placement: "1st", 
      prize: "$8,500", 
      date: "2024-10-10", 
      teams: 64,
      ratingChange: +54,
      status: "completed"
    },
    { 
      id: 4, 
      name: "Aegis Championship Series 1", 
      placement: "TBD", 
      prize: "$50,000", 
      date: "2025-08-25", 
      teams: 32,
      ratingChange: 0,
      status: "ongoing"
    }
  ];

  // Rating history data (simplified)
  const ratingHistory = [
    { date: "2025-02", rating: 2756 },
    { date: "2025-03", rating: 2789 },
    { date: "2025-04", rating: 2812 },
    { date: "2025-05", rating: 2834 },
    { date: "2025-06", rating: 2801 },
    { date: "2025-07", rating: 2847 },
    { date: "2025-08", rating: 2847 }
  ];

  const achievements = [
    { icon: "🏆", title: "Champion - Winter Circuit 2024", date: "2 days ago", rarity: "legendary" },
    { icon: "🎯", title: "MVP - Regional Qualifier", date: "1 week ago", rarity: "epic" },
    { icon: "⚡", title: "10-Game Win Streak", date: "2 weeks ago", rarity: "rare" },
    { icon: "🔥", title: "Clutch Master", date: "1 month ago", rarity: "epic" },
    { icon: "⭐", title: "Rising Star Award", date: "2 months ago", rarity: "rare" }
  ];

  const AegisMascot = () => (
    <div className="relative">
      <div className="w-20 h-24 bg-gradient-to-b from-orange-400 via-red-500 to-amber-600 rounded-t-full rounded-b-lg border-2 border-orange-300 relative overflow-hidden shadow-lg shadow-orange-500/50">
        <div className="absolute inset-0">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-300/30 rounded-full" />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-200/40 rounded-full" />
        </div>
        <div className="absolute inset-1 bg-gradient-to-b from-orange-300/20 to-red-400/20 rounded-t-full rounded-b-lg border border-yellow-400/30" />
        <div className="absolute top-7 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse shadow-lg shadow-yellow-400/80" />
        <div className="absolute top-7 right-4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse shadow-lg shadow-yellow-400/80" />
        <div className="absolute top-11 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-yellow-200/90 rounded-full shadow-sm shadow-yellow-300/60" />
      </div>
      <div className="absolute top-10 -left-2 w-3 h-6 bg-gradient-to-b from-orange-300 to-red-400 rounded-full transform rotate-12 shadow-md shadow-orange-400/50" />
      <div className="absolute top-10 -right-2 w-3 h-6 bg-gradient-to-b from-orange-300 to-red-400 rounded-full transform -rotate-12 shadow-md shadow-orange-400/50" />
      <div className="absolute inset-0 bg-orange-400/40 rounded-t-full rounded-b-lg blur-md -z-10 animate-pulse" />
      <div className="absolute inset-0 bg-red-500/20 rounded-t-full rounded-b-lg blur-lg -z-20" />
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30' 
          : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  const StatCard = ({ icon: Icon, label, value, change, color = "orange" }) => (
    <div className={`bg-zinc-800/50 border border-${color}-400/30 rounded-xl p-4 shadow-lg shadow-${color}-500/10`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-6 h-6 text-${color}-400`} />
        {change && (
          <div className={`flex items-center gap-1 text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(change)}
            </div>
          )}


        </div>
      <div className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</div>
      <div className="text-zinc-400 text-sm">{label}</div>
    </div>
  );

  return (
    
   
    <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px]">
      <div className="container mx-auto px-6 py-8">
       
        {/* Header Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Side - Player Info */}
            <div className="flex-1">
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <AegisMascot />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 p-2 rounded-full shadow-lg shadow-orange-400/50">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-white">{playerData.inGameName}</h1>
                    <div className="flex gap-2">
                      <button className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group">
                        <Share2 className="w-5 h-5 text-zinc-300 group-hover:text-orange-400" />
                      </button>
                      <button className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group">
                        <MessageCircle className="w-5 h-5 text-zinc-300 group-hover:text-orange-400" />
                      </button>
                      <button className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group">
                        <UserPlus className="w-5 h-5 text-zinc-300 group-hover:text-orange-400" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xl text-zinc-300 mb-2">{playerData.realName}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-zinc-400 mb-4">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {playerData.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {playerData.age} years old
                    </span>
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {playerData.languages.join(', ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm font-medium">{playerData.status}</span>
                    </div>
                    <div className="bg-orange-500/20 border border-orange-500/30 rounded-full px-3 py-1">
                      <span className="text-orange-400 text-sm font-medium">{playerData.role}</span>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1">
                      <span className="text-blue-400 text-sm font-medium">{playerData.playstyle}</span>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-sm mb-6 max-w-2xl">{playerData.bio}</p>

                  {/* Social Links */}
                  <div className="flex gap-3">
                    {mappedPlayer.socials.discord && (
                      <button className="flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg px-3 py-2 text-indigo-400 hover:bg-indigo-600/30 transition-colors">
                        <Hash className="w-4 h-4" />
                        Discord
                      </button>
                    )}
                    {mappedPlayer.socials.twitch && (
                      <button className="flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-400 hover:bg-purple-600/30 transition-colors">
                        <Activity className="w-4 h-4" />
                        Twitch
                      </button>
                    )}
                    {mappedPlayer.socials.youtube && (
                      <button className="flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 hover:bg-red-600/30 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        YouTube
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Quick Stats */}
            <div className="lg:w-80">
              <div className="bg-gradient-to-r from-orange-600/20 to-red-500/20 border border-orange-400/30 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <span className="text-amber-400 font-semibold text-lg">Aegis Rating</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">{playerData.aegisRating}</div>
                  <div className="text-amber-400 text-sm">Peak: {playerData.peakRating}</div>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+127 this month</span>
                </div>
              </div>



              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-400" />
                  Community
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">{playerData.followers}</div>
                    <div className="text-xs text-zinc-400">Followers</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{playerData.following}</div>
                    <div className="text-xs text-zinc-400">Following</div>
                  </div>
                </div>

              </div>
              
            </div>
            
          </div>
            <div className="grid grid-cols-5 gap-4 mb-6 mt-6">
                <StatCard icon={Target} label="Win Rate" value={`${playerData.winRate}%`} change={2.3} color="green" />
                <StatCard icon={Zap} label="Avg K/D/A" value={playerData.avgKDA} change={0.2} color="blue" />
                <StatCard icon={Gamepad2} label="Matches Played" value={playerData.matchesPlayed} change={3} color="purple" />
                <StatCard icon={Trophy} label="Tournaments" value={playerData.tournamentsPlayed} change={2} color="amber" />
                <StatCard icon={Trophy} label="Earnings" value={`$${playerData.earnings}`} color="green" />
              </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
          <TabButton id="matches" label="Match History" isActive={activeTab === 'matches'} onClick={setActiveTab} />
          <TabButton id="tournaments" label="Tournaments" isActive={activeTab === 'tournaments'} onClick={setActiveTab} />
          <TabButton id="achievements" label="Achievements" isActive={activeTab === 'achievements'} onClick={setActiveTab} />
          <TabButton id="ratings" label="Rating History" isActive={activeTab === 'ratings'} onClick={setActiveTab} />
          <TabButton id="additional" label="Additional Info" isActive={activeTab === 'additional'} onClick={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Game Stats */}
              <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Gamepad2 className="w-6 h-6 text-orange-400" />
                  Game Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">{playerData.aegisRating}</div>
                    <div className="text-zinc-400 text-sm">Current Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{playerData.winRate}%</div>
                    <div className="text-zinc-400 text-sm">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{playerData.avgKDA}</div>
                    <div className="text-zinc-400 text-sm">Avg K/D/A</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{playerData.tournamentsPlayed}</div>
                    <div className="text-zinc-400 text-sm">Tournaments</div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">Primary Agent</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Sword className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{playerData.primaryAgent}</div>
                        <div className="text-zinc-400 text-sm">87% Pick Rate</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-3">Secondary Agent</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{playerData.secondaryAgent}</div>
                        <div className="text-zinc-400 text-sm">13% Pick Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {matchHistory.slice(0, 3).map((match, index) => (
                    <div key={match.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                      <div>
                        <div className={`font-medium text-sm ${match.result === 'Win' ? 'text-green-400' : 'text-red-400'}`}>
                          {match.result} vs {match.opponent}
                        </div>
                        <div className="text-zinc-400 text-xs">{match.map} • {match.kda}</div>
                      </div>
                      <div className={`text-sm font-medium ${match.ratingChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {match.ratingChange > 0 ? '+' : ''}{match.ratingChange}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Match History</h2>
              <div className="space-y-4">
                {matchHistory.map((match) => (
                  <div key={match.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-orange-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${match.result === 'Win' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="text-white font-medium">{match.opponent}</div>
                          <div className="text-zinc-400 text-sm">{match.date} • {match.map}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${match.result === 'Win' ? 'text-green-400' : 'text-red-400'}`}>
                          {match.score}
                        </div>
                        <div className="text-zinc-400 text-sm">{match.result}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-zinc-600">
                      <div className="text-center">
                        <div className="text-white font-medium">{match.kda}</div>
                        <div className="text-zinc-400 text-xs">K/D/A</div>
                      </div>
                      <div className="text-center">
                        <div className="text-orange-400 font-medium">{match.rating}</div>
                        <div className="text-zinc-400 text-xs">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-medium ${match.ratingChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {match.ratingChange > 0 ? '+' : ''}{match.ratingChange}
                        </div>
                        <div className="text-zinc-400 text-xs">Aegis ∆</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Tournament History</h2>
              <div className="space-y-4">
                {tournamentHistory.map((tournament) => (
                  <div key={tournament.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-orange-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          tournament.status === 'ongoing' ? 'bg-red-500/20 border border-red-500/50' : 'bg-zinc-700'
                        }`}>
                          {tournament.status === 'ongoing' ? (
                            <Activity className="w-6 h-6 text-red-400 animate-pulse" />
                          ) : (
                            <Trophy className="w-6 h-6 text-orange-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">{tournament.name}</div>
                          <div className="text-zinc-400 text-sm">{tournament.date} • {tournament.teams} Teams</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{tournament.placement}</div>
                        <div className="text-green-400 text-sm">{tournament.prize}</div>
                      </div>
                    </div>
                    
                    {tournament.ratingChange !== 0 && (
                      <div className="flex justify-end pt-3 border-t border-zinc-600">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                          tournament.ratingChange > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {tournament.ratingChange > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {Math.abs(tournament.ratingChange)} Aegis Rating
                        </div>
            </div>
          )}

          {activeTab === 'additional' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Additional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-green-400" />
                    Earnings
                  </h3>
                  <div className="text-2xl font-bold text-green-400">${mappedPlayer.earnings}</div>
                  <div className="text-zinc-400 text-sm">Total Prize Money</div>
                </div>

                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-blue-400" />
                    Matches Played
                  </h3>
                  <div className="text-2xl font-bold text-blue-400">{mappedPlayer.matchesPlayed}</div>
                  <div className="text-zinc-400 text-sm">Total Matches</div>
                </div>

                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5 text-purple-400" />
                    Qualified Events
                  </h3>
                  <div className="text-2xl font-bold text-purple-400">{mappedPlayer.qualifiedEvents ? 'Yes' : 'No'}</div>
                  <div className="text-zinc-400 text-sm">Event Qualification</div>
                </div>

                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-400" />
                    Availability
                  </h3>
                  <div className="text-2xl font-bold text-orange-400">{mappedPlayer.availability}</div>
                  <div className="text-zinc-400 text-sm">Current Status</div>
                </div>
              </div>

              {mappedPlayer.qualifiedEventDetails && mappedPlayer.qualifiedEventDetails.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-white mb-4">Qualified Event Details</h3>
                  <div className="space-y-3">
                    {mappedPlayer.qualifiedEventDetails.map((event, index) => (
                      <div key={index} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                        <div className="text-white font-medium">{event}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Achievements & Awards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`p-4 rounded-lg border transition-all duration-200 hover:scale-105 ${
                    achievement.rarity === 'legendary' ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/20' :
                    achievement.rarity === 'epic' ? 'bg-purple-500/10 border-purple-500/30 shadow-lg shadow-purple-500/20' :
                    'bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/20'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 ${
                          achievement.rarity === 'legendary' ? 'text-amber-400' :
                          achievement.rarity === 'epic' ? 'text-purple-400' :
                          'text-blue-400'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className="text-zinc-400 text-sm">{achievement.date}</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        achievement.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-300' :
                        achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {achievement.rarity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ratings' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Aegis Rating History</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRatingPeriod('3months')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      ratingPeriod === '3months' ? 'bg-orange-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    3M
                  </button>
                  <button
                    onClick={() => setRatingPeriod('6months')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      ratingPeriod === '6months' ? 'bg-orange-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    6M
                  </button>
                  <button
                    onClick={() => setRatingPeriod('1year')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      ratingPeriod === '1year' ? 'bg-orange-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    1Y
                  </button>
                </div>
              </div>

              {/* Rating Chart Placeholder */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 mb-6">
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                    <p className="text-zinc-400">Rating chart visualization would go here</p>
                    <p className="text-zinc-500 text-sm mt-2">Current: {playerData.aegisRating} | Peak: {playerData.peakRating}</p>
                  </div>
                </div>
              </div>

              {/* Rating Milestones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800/50 border border-amber-400/30 rounded-lg p-4 text-center">
                  <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-amber-400 mb-1">{playerData.peakRating}</div>
                  <div className="text-zinc-400 text-sm">All-Time Peak</div>
                </div>
                
                <div className="bg-zinc-800/50 border border-orange-400/30 rounded-lg p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-400 mb-1">{playerData.aegisRating}</div>
                  <div className="text-zinc-400 text-sm">Current Rating</div>
                </div>

                <div className="bg-zinc-800/50 border border-green-400/30 rounded-lg p-4 text-center">
                  <ArrowUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400 mb-1">+187</div>
                  <div className="text-zinc-400 text-sm">Monthly Gain</div>
                </div>
              </div>

              {/* Recent Rating Changes */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-white mb-4">Recent Rating Changes</h3>
                <div className="space-y-3">
                  {tournamentHistory.slice(0, 5).map((tournament) => (
                    <div key={tournament.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          tournament.ratingChange > 0 ? 'bg-green-500' : 
                          tournament.ratingChange < 0 ? 'bg-red-500' : 'bg-zinc-500'
                        }`} />
                        <div>
                          <div className="text-white font-medium text-sm">{tournament.name}</div>
                          <div className="text-zinc-400 text-xs">{tournament.date} • {tournament.placement}</div>
                        </div>
                      </div>
                      {tournament.ratingChange !== 0 && (
                        <div className={`text-sm font-medium ${
                          tournament.ratingChange > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {tournament.ratingChange > 0 ? '+' : ''}{tournament.ratingChange}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/30">
            Send Friend Request
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-8 py-3 rounded-lg transition-colors border border-orange-400/30">
            Message Player
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-6 py-3 rounded-lg transition-colors border border-zinc-600 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Profile
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-6 py-3 rounded-lg transition-colors border border-zinc-600 flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Copy Profile URL
          </button>
        </div>
      </div>
    </div>
    
  );
};

export default DetailedPlayerProfile;