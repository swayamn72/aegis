import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CreatePost from './CreatePost';
import PostList from './PostList';
import {
  User, MapPin, Calendar, Globe, Users, Trophy, Target,
  TrendingUp, Award, Gamepad2, Settings, Share2, Edit,
  Clock, Zap, Medal, ChevronRight, Hash, Activity,
  ExternalLink, UserPlus, Check, X, Shield, Eye,
  BarChart3, Sword, Crown, MessageCircle, Bell, Plus
} from 'lucide-react';

const AegisMyProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [recentTournaments, setRecentTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  const isLoading = !user || !user.username;

  // Reset modal state when component mounts
  useEffect(() => {
    setShowCreatePostModal(false);
  }, []);

  // Fetch additional data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch connections
        const connectionsRes = await fetch('/api/connections', {
          credentials: 'include'
        });
        if (connectionsRes.ok) {
          const data = await connectionsRes.json();
          setConnections(data.connections || []);
          setPendingRequests(data.pendingRequests || []);
        }

        // Fetch recent matches (mock for now)
        // const matchesRes = await fetch(`/api/matches/player/${user._id}`);
        // if (matchesRes.ok) {
        //   const data = await matchesRes.json();
        //   setRecentMatches(data.matches || []);
        // }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const userData = {
    realName: user.realName || 'Not provided',
    username: user.username || '',
    inGameName: user.inGameName || 'Not set',
    age: user.age || 'N/A',
    location: user.location || 'Not provided',
    country: user.country || 'Not provided',
    bio: user.bio || 'No bio yet',
    languages: user.languages || [],
    aegisRating: user.aegisRating || 1200,
    verified: user.verified || false,
    joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    }) : 'Recently',
    primaryGame: user.primaryGame || 'Not selected',
    earnings: user.earnings || 0,
    inGameRole: user.inGameRole || [],
    teamStatus: user.teamStatus || 'Not specified',
    availability: user.availability || 'Not specified',
    discordTag: user.discordTag || '',
    twitch: user.twitch || '',
    youtube: user.youtube || '',
    profileVisibility: user.profileVisibility || 'public',
    profilePicture: user.profilePicture || null,
    statistics: user.statistics || {
      tournamentsPlayed: 0,
      matchesPlayed: 0,
      matchesWon: 0,
      totalKills: 0,
      winRate: 0
    }
  };

  const StatBox = ({ icon: Icon, label, value, color = "cyan" }) => (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 bg-${color}-500/10 rounded-lg`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        <span className="text-zinc-400 text-sm">{label}</span>
      </div>
      <div className={`text-2xl font-bold text-${color}-400`}>{value}</div>
    </div>
  );

  const ConnectionCard = ({ connection, isPending = false }) => (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-medium">{connection.username}</p>
          <p className="text-zinc-400 text-xs">{connection.name || 'Player'}</p>
        </div>
      </div>
      {isPending && (
        <div className="flex gap-2">
          <button className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded border border-green-500/30">
            <Check className="w-4 h-4 text-green-400" />
          </button>
          <button className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/30">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}
    </div>
  );

  const MatchCard = ({ match }) => (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            match.result === 'win' ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span className="text-white font-medium">{match.tournament}</span>
        </div>
        <span className="text-zinc-500 text-xs">{match.date}</span>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-zinc-400 text-xs mb-1">Position</p>
          <p className="text-white font-semibold">#{match.position}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Kills</p>
          <p className="text-cyan-400 font-semibold">{match.kills}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Points</p>
          <p className="text-purple-400 font-semibold">{match.points}</p>
        </div>
      </div>
    </div>
  );

  // Mock data for recent matches
  const mockMatches = [
    { id: 1, tournament: 'Aegis Weekly #12', result: 'win', position: 3, kills: 8, points: 13, date: '2 days ago' },
    { id: 2, tournament: 'Aegis Weekly #11', result: 'loss', position: 12, kills: 4, points: 4, date: '1 week ago' },
    { id: 3, tournament: 'Community Cup', result: 'win', position: 1, kills: 12, points: 22, date: '2 weeks ago' }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-12">
      {/* Create Post Modal - Rendered outside content container for proper overlay */}
      {showCreatePostModal && (
        <CreatePost onClose={() => setShowCreatePostModal(false)} />
      )}

      <div className="max-w-7xl mx-auto px-4">

        {/* Profile Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-cyan-600/20 via-purple-600/20 to-pink-600/20"></div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-4">
              <div className="flex items-end gap-4">
                {/* Profile Picture */}
                <div className="relative">
                  {userData.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt="Profile"
                      className="w-28 h-28 rounded-xl border-4 border-zinc-900 object-cover"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-xl border-4 border-zinc-900 bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                  {userData.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-cyan-500 p-1.5 rounded-full border-2 border-zinc-900">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Names */}
                <div className="mb-2">
                  <h1 className="text-3xl font-bold text-white mb-1">{userData.username}</h1>
                  <p className="text-zinc-400">{userData.realName}</p>
                  {userData.inGameName !== 'Not set' && (
                    <p className="text-cyan-400 text-sm">@{userData.inGameName}</p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 md:mt-0">
                <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg flex items-center gap-2 transition-colors">
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </button>
                <button
                  onClick={() => setShowCreatePostModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Post</span>
                </button>
                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mb-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {userData.location}, {userData.country}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {userData.age} years
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Joined {userData.joinDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className={`w-4 h-4 ${userData.profileVisibility === 'public' ? 'text-green-400' : 'text-yellow-400'}`} />
                {userData.profileVisibility}
              </span>
            </div>

            {/* Bio */}
            <p className="text-zinc-300 mb-4">{userData.bio}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {userData.primaryGame !== 'Not selected' && (
                <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-xs">
                  {userData.primaryGame}
                </span>
              )}
              {userData.teamStatus !== 'Not specified' && (
                <span className={`px-3 py-1 border rounded-full text-xs ${
                  userData.teamStatus === 'looking for a team' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                  userData.teamStatus === 'in a team' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                  'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                }`}>
                  {userData.teamStatus}
                </span>
              )}
              {userData.inGameRole.map(role => (
                <span key={role} className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-xs capitalize">
                  {role}
                </span>
              ))}
              {userData.languages.map(lang => (
                <span key={lang} className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400 text-xs">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatBox 
            icon={Trophy} 
            label="Aegis Rating" 
            value={userData.aegisRating}
            color="cyan"
          />
          <StatBox 
            icon={Target} 
            label="Win Rate" 
            value={`${userData.statistics.winRate}%`}
            color="green"
          />
          <StatBox 
            icon={Sword} 
            label="Total Kills" 
            value={userData.statistics.totalKills}
            color="red"
          />
          <StatBox 
            icon={Medal} 
            label="Tournaments" 
            value={userData.statistics.tournamentsPlayed}
            color="amber"
          />
        </div>

        {/* Tabs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-1 mb-6">
          <div className="flex gap-1 overflow-x-auto">
            {['overview', 'matches', 'tournaments', 'connections', 'social', 'posts'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-cyan-600 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'overview' && (
              <>
                {/* Performance Stats */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Performance
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <p className="text-zinc-400 text-sm mb-1">Matches Played</p>
                      <p className="text-2xl font-bold text-white">{userData.statistics.matchesPlayed}</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <p className="text-zinc-400 text-sm mb-1">Matches Won</p>
                      <p className="text-2xl font-bold text-green-400">{userData.statistics.matchesWon}</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <p className="text-zinc-400 text-sm mb-1">Avg Placement</p>
                      <p className="text-2xl font-bold text-cyan-400">
                        #{userData.statistics.averagePlacement || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <p className="text-zinc-400 text-sm mb-1">Total Damage</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {userData.statistics.totalDamage?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Matches */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-cyan-400" />
                      Recent Matches
                    </h2>
                    <button className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1">
                      View All
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {mockMatches.length > 0 ? (
                      mockMatches.map(match => (
                        <MatchCard key={match.id} match={match} />
                      ))
                    ) : (
                      <div className="text-center py-8 text-zinc-400">
                        <Gamepad2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No matches played yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'matches' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Match History</h2>
                <div className="space-y-3">
                  {mockMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tournaments' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Tournament History</h2>
                <div className="text-center py-12 text-zinc-400">
                  <Trophy className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="mb-2">No tournaments yet</p>
                  <button className="text-cyan-400 hover:text-cyan-300">
                    Browse Tournaments
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'connections' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Connections</h2>
                {connections.length > 0 ? (
                  <div className="space-y-3">
                    {connections.map(conn => (
                      <ConnectionCard key={conn._id} connection={conn} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-zinc-400">
                    <Users className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p className="mb-2">No connections yet</p>
                    <button className="text-cyan-400 hover:text-cyan-300">
                      Find Players
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'social' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Social Links</h2>
                <div className="space-y-3">
                  <SocialLinkCard 
                    icon={Hash}
                    platform="Discord"
                    value={userData.discordTag}
                    color="indigo"
                  />
                  <SocialLinkCard 
                    icon={Activity}
                    platform="Twitch"
                    value={userData.twitch}
                    color="purple"
                  />
                  <SocialLinkCard 
                    icon={ExternalLink}
                    platform="YouTube"
                    value={userData.youtube}
                    color="red"
                  />
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Posts</h2>
                <PostList playerId={user._id} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Team Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Team
              </h3>
              {user.team ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-zinc-800 rounded-lg mx-auto mb-3"></div>
                  <p className="text-white font-medium">Team Name</p>
                  <p className="text-zinc-400 text-sm">Member since {userData.joinDate}</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-zinc-400 mb-3">Not in a team</p>
                  <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm transition-colors">
                    Find a Team
                  </button>
                </div>
              )}
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  Pending Requests
                  <span className="ml-auto bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                    {pendingRequests.length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {pendingRequests.slice(0, 3).map(req => (
                    <ConnectionCard key={req._id} connection={req} isPending />
                  ))}
                </div>
              </div>
            )}

            {/* Earnings */}
            {userData.earnings > 0 && (
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-800/30 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-2 text-green-400">Total Earnings</h3>
                <p className="text-3xl font-bold text-white">₹{userData.earnings.toLocaleString()}</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left flex items-center justify-between transition-colors">
                  <span>Edit Profile</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
                <button className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left flex items-center justify-between transition-colors">
                  <span>Privacy Settings</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
                <button className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-left flex items-center justify-between transition-colors">
                  <span>Notifications</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialLinkCard = ({ icon: Icon, platform, value, color }) => (
  <div className={`p-4 rounded-lg border ${
    value 
      ? `bg-${color}-500/10 border-${color}-500/30` 
      : 'bg-zinc-800/50 border-zinc-700'
  }`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${value ? `text-${color}-400` : 'text-zinc-500'}`} />
        <div>
          <p className="text-white font-medium">{platform}</p>
          <p className={`text-sm ${value ? `text-${color}-300` : 'text-zinc-500 italic'}`}>
            {value || 'Not connected'}
          </p>
        </div>
      </div>
      {value && <ExternalLink className="w-4 h-4 text-zinc-400" />}
    </div>
  </div>
);

export default AegisMyProfile;