import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Check, Star, Trophy, Calendar, MapPin, Users, Target, TrendingUp,
  Award, Gamepad2, Settings, Share2, MessageCircle, UserPlus,
  ArrowUp, ArrowDown, Activity, Clock, Zap, Shield, Sword,
  Medal, Crown, ChevronRight, ExternalLink, Hash, Globe, Mail,
  Flame, Timer, Crosshair, Eye, BarChart3, Percent, Sparkles
} from 'lucide-react';

const DetailedPlayerProfile = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [tournamentHistory, setTournamentHistory] = useState([]);

  const [currentTeam, setCurrentTeam] = useState(null);

  const loggedInPlayerId = user?._id;

  // Fetch player data
  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/players/${playerId}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch player data');

        const data = await response.json();
        setPlayerData(data.player);

        // Check connection status
        if (data.player.connections?.includes(loggedInPlayerId)) {
          setConnectionStatus('connected');
        } else if (data.player.sentRequests?.includes(loggedInPlayerId)) {
          setConnectionStatus('pending');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [playerId]);

  // Fetch player's current team
  useEffect(() => {
    const fetchTeam = async () => {
      if (!playerData?.team) return;
      try {
        const response = await fetch(`http://localhost:5000/api/teams/${playerData.team}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentTeam(data.team);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
      }
    };
    if (playerData) fetchTeam();
  }, [playerData]);

  // Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/matches/player/${playerId}/recent`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setMatchHistory(data.matches || []);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };
    if (playerId) fetchMatches();
  }, [playerId]);

  // Fetch tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/tournaments/player/${playerId}/recent`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setTournamentHistory(data.tournaments || []);
        }
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      }
    };
    if (playerId) fetchTournaments();
  }, [playerId]);



  const handleConnect = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/connections/send/${playerId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setConnectionStatus('pending');
        await refreshUser();
        alert('Connection request sent!');
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const getGameColor = () => {
    switch (playerData?.primaryGame) {
      case 'VALO': return 'text-red-400';
      case 'CS2': return 'text-blue-400';
      case 'BGMI': return 'text-yellow-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusDisplay = () => {
    switch (playerData?.teamStatus) {
      case 'in a team':
        return (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-semibold">In Team</span>
          </div>
        );
      case 'looking for a team':
        return (
          <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold rounded-lg px-4 py-2">
            Looking For Team
          </div>
        );
      case 'open for offers':
        return (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-semibold rounded-lg px-4 py-2">
            Open For Offers
          </div>
        );
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#FF4500]/30 border-t-[#FF4500] rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400 text-lg font-mono tracking-widest">LOADING PROFILE...</p>
        </div>
      </div>
    );
  }

  if (error || !playerData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error || 'Player not found'}</div>
          <button
            onClick={() => navigate('/players')}
            className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white px-6 py-2 rounded-lg transition-all"
          >
            Back to Players
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-[Inter] pt-[100px] pb-16 relative overflow-hidden">

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-[0.25]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3f3f46" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none"></div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6">

        {/* Hero Section */}
        <div className="mb-8 bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
          <div className="relative p-8">

            {/* Status Badge - Top Right */}
            <div className="absolute top-6 right-6">
              {getStatusDisplay()}
            </div>

            {/* Verified Badge - Top Left */}
            {playerData.verified && (
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-[#FF4500]/10 border border-[#FF4500]/30 rounded-lg px-3 py-2">
                <Check className="w-4 h-4 text-[#FF4500]" />
                <span className="text-[#FF4500] text-sm font-semibold">Verified</span>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 items-start mt-12">

              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                <img
                  src={playerData.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${playerData.username}`}
                  alt={playerData.inGameName}
                  className="w-32 h-32 lg:w-40 lg:h-40 rounded-lg object-cover border-2 border-zinc-800 bg-zinc-900"
                />
                {playerData.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-[#FF4500] p-2 rounded-full shadow-lg">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {playerData.inGameName || playerData.username}
                </h1>

                {playerData.realName && (
                  <p className="text-xl text-zinc-400 mb-4">{playerData.realName}</p>
                )}

                <div className="flex flex-wrap gap-4 text-zinc-500 text-sm mb-6">
                  {playerData.location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {playerData.location}
                    </span>
                  )}
                  {playerData.age && (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {playerData.age} years
                    </span>
                  )}
                  {playerData.languages?.length > 0 && (
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {playerData.languages.join(', ')}
                    </span>
                  )}
                  {playerData.primaryGame && (
                    <span className={`flex items-center gap-2 ${getGameColor()}`}>
                      <Gamepad2 className="w-4 h-4" />
                      {playerData.primaryGame}
                    </span>
                  )}
                </div>

                {playerData.bio && (
                  <p className="text-zinc-400 mb-6 max-w-3xl leading-relaxed">{playerData.bio}</p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {connectionStatus === 'connected' ? (
                    <button className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-6 py-2.5 rounded-lg cursor-not-allowed text-sm font-semibold" disabled>
                      Connected
                    </button>
                  ) : connectionStatus === 'pending' ? (
                    <button className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-6 py-2.5 rounded-lg cursor-not-allowed text-sm font-semibold" disabled>
                      Request Sent
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
                    >
                      <UserPlus className="w-4 h-4" />
                      Connect
                    </button>
                  )}
                  <button className="bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-white px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                  <button className="bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-white px-4 py-2.5 rounded-lg transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Social Links */}
                {(playerData.discordTag || playerData.twitch || playerData.youtube || playerData.twitter) && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {playerData.discordTag && (
                      <a href={`https://discord.com/users/${playerData.discordTag}`} target="_blank" rel="noopener noreferrer"
                        className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 rounded-lg px-3 py-2 transition-all flex items-center gap-2 text-xs font-semibold">
                        <Hash className="w-3 h-3" />
                        {playerData.discordTag}
                      </a>
                    )}
                    {playerData.twitch && (
                      <a href={playerData.twitch} target="_blank" rel="noopener noreferrer"
                        className="bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 rounded-lg px-3 py-2 transition-all flex items-center gap-2 text-xs font-semibold">
                        <Activity className="w-3 h-3" />
                        Twitch
                      </a>
                    )}
                    {playerData.youtube && (
                      <a href={playerData.youtube} target="_blank" rel="noopener noreferrer"
                        className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg px-3 py-2 transition-all flex items-center gap-2 text-xs font-semibold">
                        <ExternalLink className="w-3 h-3" />
                        YouTube
                      </a>
                    )}
                    {playerData.twitter && (
                      <a href={playerData.twitter} target="_blank" rel="noopener noreferrer"
                        className="bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg px-3 py-2 transition-all flex items-center gap-2 text-xs font-semibold">
                        <ExternalLink className="w-3 h-3" />
                        Twitter
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Aegis Rating Card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 min-w-[280px]">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-[#FF4500]" />
                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Aegis Rating</span>
                  </div>
                  <div className="text-5xl font-bold text-white mb-2">{playerData.aegisRating || 0}</div>
                  <div className="flex items-center justify-center gap-2 text-green-400 text-xs">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold">Active Player</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-900">
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-cyan-400">{playerData.statistics?.tournamentsPlayed || 0}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Tournaments</div>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-purple-400">{playerData.connections?.length || 0}</div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Connections</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#FF4500] to-orange-500 h-1"></div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 hover:border-green-500/50 transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Win Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{playerData.statistics?.winRate || 0}%</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 hover:border-blue-500/50 transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <Crosshair className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Avg K/D</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{(playerData.statistics?.totalKills / (playerData.statistics?.matchesPlayed || 1)).toFixed(1)}</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 hover:border-purple-500/50 transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <Gamepad2 className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Matches</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">{playerData.statistics?.matchesPlayed || 0}</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 hover:border-amber-500/50 transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Tournaments</span>
            </div>
            <div className="text-2xl font-bold text-amber-400">{playerData.statistics?.tournamentsPlayed || 0}</div>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 hover:border-green-500/50 transition-all group">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Earnings</span>
            </div>
            <div className="text-2xl font-bold text-green-400">₹{playerData.earnings || 0}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['overview', 'matches', 'tournaments'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 font-semibold rounded-lg transition-all text-sm ${activeTab === tab
                ? 'bg-[#FF4500] text-white'
                : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Team */}
              <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#FF4500]" />
                  Current Team
                </h3>
                {currentTeam ? (
                  <div
                    onClick={() => navigate(`/team/${currentTeam._id}`)}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-[#FF4500]/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {currentTeam.logo ? (
                        <img src={currentTeam.logo} alt={currentTeam.teamName} className="w-16 h-16 rounded-lg bg-zinc-900 border border-zinc-800" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#FF4500] to-orange-500 flex items-center justify-center">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white group-hover:text-[#FF4500] transition-colors">{currentTeam.teamName}</h4>
                        <p className="text-zinc-500 text-sm">{currentTeam.teamTag}</p>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="text-[#FF4500] font-semibold">{currentTeam.aegisRating || 0} Rating</span>
                          <span className="text-zinc-500">{currentTeam.players?.length || 0} Players</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-[#FF4500] transition-colors" />
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center">
                    <Users className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
                    <p className="text-zinc-500">Not currently in a team</p>
                  </div>
                )}

                {/* Previous Teams */}
                {playerData.previousTeams?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-base font-semibold mb-4 text-zinc-400">Previous Teams</h4>
                    <div className="space-y-3">
                      {playerData.previousTeams.slice(0, 3).map((prevTeam, idx) => (
                        <div key={idx} className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium text-sm">Team #{idx + 1}</span>
                            <span className="text-zinc-500 text-xs">{prevTeam.reason || 'Left'}</span>
                          </div>
                          {prevTeam.endDate && (
                            <span className="text-zinc-600 text-xs">
                              Until {new Date(prevTeam.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Player Info */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">Player Info</h3>
                <div className="space-y-5">
                  {playerData.inGameRole?.length > 0 && (
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-3">Roles</p>
                      <div className="flex flex-wrap gap-2">
                        {playerData.inGameRole.map((role, idx) => (
                          <span key={idx} className="bg-[#FF4500]/10 border border-[#FF4500]/30 px-3 py-1.5 rounded-lg text-[#FF4500] text-xs font-semibold">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {playerData.availability && (
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-3">Availability</p>
                      <span className="inline-block bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg text-blue-400 text-xs font-semibold">
                        {playerData.availability}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold mb-3">Member Since</p>
                    <p className="text-white text-sm font-medium">{new Date(playerData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 text-[#FF4500]" />
                Recent Matches
              </h2>
              {matchHistory.length > 0 ? (
                <div className="space-y-4">
                  {matchHistory.map((match) => (
                    <div
                      key={match._id}
                      onClick={() => navigate(`/matches/${match._id}`)}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-[#FF4500]/50 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-white font-semibold group-hover:text-[#FF4500] transition-colors">{match.tournament?.name || 'Tournament'}</h4>
                          <p className="text-zinc-500 text-xs mt-1">{match.map} • {new Date(match.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${match.position <= 3 ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                          }`}>
                          #{match.position}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-white mb-1">{match.kills || 0}</div>
                          <div className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Kills</div>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                          <div className="text-lg font-bold text-[#FF4500] mb-1">{match.points || 0}</div>
                          <div className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Points</div>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                          <div className={`text-lg font-bold mb-1 ${match.chickenDinner ? 'text-amber-400' : 'text-zinc-600'}`}>
                            {match.chickenDinner ? '🏆' : '—'}
                          </div>
                          <div className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Winner</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Gamepad2 className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500">No recent matches found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-[#FF4500]" />
                Tournament History
              </h2>
              {tournamentHistory.length > 0 ? (
                <div className="space-y-4">
                  {tournamentHistory.map((tournament) => (
                    <div
                      key={tournament._id}
                      onClick={() => navigate(`/tournament/${tournament._id}`)}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-[#FF4500]/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold group-hover:text-[#FF4500] transition-colors truncate">{tournament.name}</h4>
                          <p className="text-zinc-500 text-xs mt-1">
                            {new Date(tournament.startDate).toLocaleDateString()} • {tournament.placement || 'Participated'}
                          </p>
                        </div>
                        {tournament.prize && (
                          <div className="text-right">
                            <div className="text-green-400 font-bold text-lg">₹{tournament.prize}</div>
                            <div className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">Prize</div>
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-[#FF4500] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Trophy className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500">No tournament history found</p>
                </div>
              )}
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default DetailedPlayerProfile;