import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Check, Star, Trophy, Calendar, MapPin, Users, Target, TrendingUp,
  Award, Gamepad2, Settings, Share2, MessageCircle, UserPlus,
  ArrowUp, ArrowDown, Activity, Clock, Zap, Shield, Sword,
  Medal, Crown, ChevronRight, ExternalLink, Hash, Globe, Mail,
  Flame, Timer, Crosshair
} from 'lucide-react';

const DetailedPlayerProfile = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [matchHistory, setMatchHistory] = useState([]);
  const [tournamentHistory, setTournamentHistory] = useState([]);
  const [connections, setConnections] = useState([]);
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

  // Fetch connections
  useEffect(() => {
    const fetchConnections = async () => {
      if (!playerData?.connections) return;
      try {
        const connectionPromises = playerData.connections.slice(0, 6).map(connId =>
          fetch(`http://localhost:5000/api/players/${connId}`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : null)
        );
        const results = await Promise.all(connectionPromises);
        setConnections(results.filter(r => r).map(r => r.player));
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };
    if (playerData) fetchConnections();
  }, [playerData]);

  const handleConnect = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/connections/send/${playerId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        setConnectionStatus('pending');
        alert('Connection request sent!');
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error || !playerData) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">{error || 'Player not found'}</div>
      </div>
    );
  }

  const AegisMascot = () => (
    <div className="relative">
      <div className="w-24 h-28 bg-gradient-to-b from-orange-400 via-red-500 to-amber-600 rounded-t-full rounded-b-lg border-2 border-orange-300 relative overflow-hidden shadow-xl shadow-orange-500/50">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-300/20 to-red-400/20 rounded-t-full rounded-b-lg border border-yellow-400/30" />
        <div className="absolute top-8 left-5 w-2 h-2 bg-yellow-300 rounded-full animate-pulse shadow-lg shadow-yellow-400/80" />
        <div className="absolute top-8 right-5 w-2 h-2 bg-yellow-300 rounded-full animate-pulse shadow-lg shadow-yellow-400/80" />
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-yellow-200/90 rounded-full" />
      </div>
      <div className="absolute top-12 -left-2 w-3 h-6 bg-gradient-to-b from-orange-300 to-red-400 rounded-full transform rotate-12" />
      <div className="absolute top-12 -right-2 w-3 h-6 bg-gradient-to-b from-orange-300 to-red-400 rounded-full transform -rotate-12" />
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Hero Section */}
        <div className="relative mb-8 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-amber-600/20 backdrop-blur-3xl" />
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Profile Picture */}
              <div className="relative flex-shrink-0">
                {playerData.profilePicture ? (
                  <img
                    src={playerData.profilePicture}
                    alt={playerData.inGameName}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-orange-400/50 shadow-2xl"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40"><AegisMascot /></div>
                )}
                {playerData.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 p-3 rounded-full shadow-lg">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <h1 className="text-4xl md:text-5xl font-bold text-white">{playerData.inGameName || playerData.username}</h1>
                  {playerData.teamStatus && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-full px-4 py-1 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm font-medium">{playerData.teamStatus}</span>
                    </div>
                  )}
                </div>
                
                {playerData.realName && (
                  <p className="text-xl text-zinc-300 mb-4">{playerData.realName}</p>
                )}

                <div className="flex flex-wrap gap-4 text-zinc-400 mb-6">
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
                    <span className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4" />
                      {playerData.primaryGame}
                    </span>
                  )}
                </div>

                {playerData.bio && (
                  <p className="text-zinc-300 mb-6 max-w-3xl">{playerData.bio}</p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {connectionStatus === 'connected' ? (
                    <button className="bg-zinc-700 px-6 py-2 rounded-lg cursor-not-allowed" disabled>
                      Connected
                    </button>
                  ) : connectionStatus === 'pending' ? (
                    <button className="bg-zinc-700 px-6 py-2 rounded-lg cursor-not-allowed" disabled>
                      Request Sent
                    </button>
                  ) : (
                    <button
                      onClick={handleConnect}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-6 py-2 rounded-lg transition-all flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Connect
                    </button>
                  )}
                  <button className="bg-zinc-800/50 hover:bg-zinc-700/50 px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                  <button className="bg-zinc-800/50 hover:bg-zinc-700/50 px-4 py-2 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-zinc-900/80 border border-orange-400/30 rounded-2xl p-6 min-w-[280px]">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <span className="text-amber-400 font-semibold">Aegis Rating</span>
                  </div>
                  <div className="text-5xl font-bold text-white mb-1">{playerData.aegisRating || 0}</div>
                  <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>Active Player</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{playerData.statistics?.tournamentsPlayed || 0}</div>
                    <div className="text-xs text-zinc-400">Tournaments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{playerData.connections?.length || 0}</div>
                    <div className="text-xs text-zinc-400">Connections</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3 mt-6">
              {playerData.discordTag && (
                <a href={`https://discord.com/users/${playerData.discordTag}`} target="_blank" rel="noopener noreferrer"
                  className="bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 rounded-lg px-4 py-2 transition-colors flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  {playerData.discordTag}
                </a>
              )}
              {playerData.twitch && (
                <a href={playerData.twitch} target="_blank" rel="noopener noreferrer"
                  className="bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/30 rounded-lg px-4 py-2 transition-colors flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Twitch
                </a>
              )}
              {playerData.youtube && (
                <a href={playerData.youtube} target="_blank" rel="noopener noreferrer"
                  className="bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 rounded-lg px-4 py-2 transition-colors flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  YouTube
                </a>
              )}
              {playerData.twitter && (
                <a href={playerData.twitter} target="_blank" rel="noopener noreferrer"
                  className="bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 rounded-lg px-4 py-2 transition-colors flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Twitter
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-green-400/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="text-xs text-zinc-400">Win Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{playerData.statistics?.winRate || 0}%</div>
          </div>
          <div className="bg-zinc-900/50 border border-blue-400/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crosshair className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-zinc-400">Avg K/D</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{(playerData.statistics?.totalKills / (playerData.statistics?.matchesPlayed || 1)).toFixed(1)}</div>
          </div>
          <div className="bg-zinc-900/50 border border-purple-400/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gamepad2 className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-zinc-400">Matches</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">{playerData.statistics?.matchesPlayed || 0}</div>
          </div>
          <div className="bg-zinc-900/50 border border-amber-400/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-zinc-400">Tournaments</span>
            </div>
            <div className="text-2xl font-bold text-amber-400">{playerData.statistics?.tournamentsPlayed || 0}</div>
          </div>
          <div className="bg-zinc-900/50 border border-green-400/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-green-400" />
              <span className="text-xs text-zinc-400">Earnings</span>
            </div>
            <div className="text-2xl font-bold text-green-400">₹{playerData.earnings || 0}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 border-b border-zinc-800 pb-4">
          {['overview', 'matches', 'tournaments', 'connections'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                  : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50'
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
              <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Users className="w-6 h-6 text-orange-400" />
                  Current Team
                </h3>
                {currentTeam ? (
                  <div 
                    onClick={() => navigate(`/team/${currentTeam._id}`)}
                    className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 hover:border-orange-500/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {currentTeam.logo && (
                        <img src={currentTeam.logo} alt={currentTeam.teamName} className="w-16 h-16 rounded-lg" />
                      )}
                      <div>
                        <h4 className="text-xl font-bold text-white">{currentTeam.teamName}</h4>
                        <p className="text-zinc-400">{currentTeam.teamTag}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-orange-400">{currentTeam.aegisRating || 0} Rating</span>
                          <span className="text-zinc-400">{currentTeam.players?.length || 0} Players</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-400">Not currently in a team</p>
                )}

                {/* Previous Teams */}
                {playerData.previousTeams?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-4">Previous Teams</h4>
                    <div className="space-y-3">
                      {playerData.previousTeams.slice(0, 3).map((prevTeam, idx) => (
                        <div key={idx} className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">Team #{idx + 1}</span>
                            <span className="text-zinc-400 text-sm">{prevTeam.reason || 'Left'}</span>
                          </div>
                          {prevTeam.endDate && (
                            <span className="text-zinc-500 text-xs">
                              Until {new Date(prevTeam.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Role & Info */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6">Player Info</h3>
                <div className="space-y-4">
                  {playerData.inGameRole?.length > 0 && (
                    <div>
                      <p className="text-zinc-400 text-sm mb-2">Roles</p>
                      <div className="flex flex-wrap gap-2">
                        {playerData.inGameRole.map((role, idx) => (
                          <span key={idx} className="bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-full text-orange-400 text-sm">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {playerData.availability && (
                    <div>
                      <p className="text-zinc-400 text-sm mb-2">Availability</p>
                      <span className="bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full text-blue-400 text-sm">
                        {playerData.availability}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-zinc-400 text-sm mb-2">Member Since</p>
                    <p className="text-white">{new Date(playerData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-6">Recent Matches</h2>
              {matchHistory.length > 0 ? (
                <div className="space-y-4">
                  {matchHistory.map((match) => (
                    <div
                      key={match._id}
                      onClick={() => navigate(`/matches/${match._id}`)}
                      className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 hover:border-orange-500/50 transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-medium">{match.tournament?.name || 'Tournament'}</h4>
                          <p className="text-zinc-400 text-sm">{match.map} • {new Date(match.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          match.position <= 3 ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-300'
                        }`}>
                          #{match.position}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-white font-medium">{match.kills || 0}</div>
                          <div className="text-zinc-400 text-xs">Kills</div>
                        </div>
                        <div>
                          <div className="text-orange-400 font-medium">{match.points || 0}</div>
                          <div className="text-zinc-400 text-xs">Points</div>
                        </div>
                        <div>
                          <div className={`font-medium ${match.chickenDinner ? 'text-amber-400' : 'text-zinc-400'}`}>
                            {match.chickenDinner ? '🏆' : '-'}
                          </div>
                          <div className="text-zinc-400 text-xs">Winner</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 text-center py-8">No recent matches found</p>
              )}
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-6">Tournament History</h2>
              {tournamentHistory.length > 0 ? (
                <div className="space-y-4">
                  {tournamentHistory.map((tournament) => (
                    <div
                      key={tournament._id}
                      onClick={() => navigate(`/tournament/${tournament._id}`)}
                      className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 hover:border-orange-500/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <Trophy className="w-12 h-12 text-orange-400" />
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{tournament.name}</h4>
                          <p className="text-zinc-400 text-sm">
                            {new Date(tournament.startDate).toLocaleDateString()} • {tournament.placement || 'Participated'}
                          </p>
                        </div>
                        {tournament.prize && (
                          <div className="text-right">
                            <div className="text-green-400 font-bold">₹{tournament.prize}</div>
                            <div className="text-zinc-400 text-xs">Prize</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 text-center py-8">No tournament history found</p>
              )}
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-2xl font-bold mb-6">Connections ({connections.length})</h2>
              {connections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connections.map((connection) => (
                    <div
                      key={connection._id}
                      onClick={() => navigate(`/detailed/${connection._id}`)}
                      className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:border-orange-500/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {connection.profilePicture ? (
                          <img src={connection.profilePicture} alt={connection.username} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{connection.inGameName || connection.username}</h4>
                          <p className="text-zinc-400 text-sm truncate">{connection.aegisRating || 0} Rating</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 text-center py-8">No connections yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedPlayerProfile;