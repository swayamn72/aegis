import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Check, CheckCircle, Star, Trophy, Calendar, MapPin, Users, Target, TrendingUp,
  Award, Gamepad2, Eye, Settings, Share2, MessageCircle, UserPlus,
  ArrowUp, ArrowDown, Activity, Clock, Zap, Shield, Sword,
  Medal, Crown, ChevronRight, ExternalLink, Copy, Edit,
  BarChart3, PieChart, LineChart, Hash, Globe, User,
  Languages, Mail, Phone, Camera, Upload, Save, Bell,
  Lock, Unlock, Download, Trash2, AlertTriangle
} from 'lucide-react';

const AegisMyProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-zinc-950 to-neutral-950 text-white">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Map user data from schema
  const userData = {
    realName: user.realName || 'Not provided',
    username: user.username || '',
    inGameName: user.inGameName || 'Not set',
    age: user.age || 'Not provided',
    location: user.location || 'Not provided',
    country: user.country || 'Not provided',
    bio: user.bio || 'No bio added yet. Share something about your gaming journey!',
    languages: user.languages || [],
    aegisRating: user.aegisRating || 1200, // Default starting rating
    peakRating: user.aegisRating ? Math.max(user.aegisRating + 50, user.aegisRating) : 1250,
    verified: user.verified || false,
    joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 'Recently',

    // Gaming data from schema
    primaryGame: user.primaryGame || 'Not selected',
    earnings: user.earnings || 0,
    qualifiedEvents: user.qualifiedEvents || false,
    qualifiedEventDetails: user.qualifiedEventDetails || [],
    inGameRole: user.inGameRole || [],

    // Team data from schema
    teamStatus: user.teamStatus || 'Not specified',
    availability: user.availability || 'Not specified',

    // Social data from schema
    discordTag: user.discordTag || '',
    twitch: user.twitch || '',
    YouTube: user.YouTube || '',
    profileVisibility: user.profileVisibility || 'public',

    // Placeholder data for missing schema fields (to be added later)
    currentStreak: 0,
    winRate: 0,
    avgKDA: 0,
    tournamentsPlayed: 0,
    followers: 0,
    following: 0
  };

  const AegisMascot = () => (
    <div className="relative">
      <div className="w-20 h-24 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 rounded-t-full rounded-b-lg border-2 border-cyan-300 relative overflow-hidden shadow-lg shadow-cyan-500/50">
        <div className="absolute inset-0">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white/20 rounded-full" />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-cyan-200/40 rounded-full" />
        </div>
        
        <div className="absolute inset-1 bg-gradient-to-b from-cyan-300/20 to-purple-400/20 rounded-t-full rounded-b-lg border border-white/30" />
        
        <div className="absolute top-7 left-4 w-2 h-2 bg-white rounded-full animate-pulse shadow-lg shadow-white/80" />
        <div className="absolute top-7 right-4 w-2 h-2 bg-white rounded-full animate-pulse shadow-lg shadow-white/80" />
        
        <div className="absolute top-11 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-white/90 rounded-full shadow-sm shadow-white/60" />
        
        <div className="absolute top-15 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-cyan-300 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
      </div>
      
      <div className="absolute top-10 -left-2 w-3 h-6 bg-gradient-to-b from-cyan-300 to-blue-400 rounded-full transform rotate-12 shadow-md shadow-cyan-400/50" />
      <div className="absolute top-10 -right-2 w-3 h-6 bg-gradient-to-b from-cyan-300 to-blue-400 rounded-full transform -rotate-12 shadow-md shadow-cyan-400/50" />
      
      <div className="absolute inset-0 bg-cyan-400/40 rounded-t-full rounded-b-lg blur-md -z-10 animate-pulse" />
      <div className="absolute inset-0 bg-purple-500/20 rounded-t-full rounded-b-lg blur-lg -z-20" />
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/30' 
          : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  const StatCard = ({ icon: Icon, label, value, change, color = "cyan" }) => (
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

  const InfoCard = ({ title, children, action }) => (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {action && action}
      </div>
      {children}
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-950 via-zinc-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px]">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header Section */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Side - Player Info */}
            <div className="flex-1">
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <AegisMascot />
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-cyan-400 to-purple-500 p-2 rounded-full shadow-lg shadow-cyan-400/50">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <button className="absolute -top-2 -left-2 bg-zinc-700/80 hover:bg-zinc-600/80 p-2 rounded-full transition-colors">
                    <Camera className="w-3 h-3 text-zinc-300" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-white">{userData.username}</h1>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-2 bg-zinc-700/50 hover:bg-cyan-600/50 rounded-lg transition-colors group"
                      >
                        <Edit className="w-5 h-5 text-zinc-300 group-hover:text-cyan-400" />
                      </button>
                      <button className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group">
                        <Share2 className="w-5 h-5 text-zinc-300 group-hover:text-cyan-400" />
                      </button>
                      <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group"
                      >
                        <Settings className="w-5 h-5 text-zinc-300 group-hover:text-cyan-400" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xl text-zinc-300 mb-2">{userData.realName}</p>
                  <p className="text-lg text-purple-400 mb-2">@{userData.inGameName}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-zinc-400 mb-4">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {userData.location}, {userData.country}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {userData.age} years old
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Joined {userData.joinDate}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className={`border rounded-full px-3 py-1 flex items-center gap-2 ${
                      userData.teamStatus === 'looking for a team' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                      userData.teamStatus === 'in a team' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                      userData.teamStatus === 'open for offers' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                      'bg-zinc-500/20 border-zinc-500/30 text-zinc-400'
                    }`}>
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                      <span className="text-sm font-medium capitalize">{userData.teamStatus}</span>
                    </div>
                    
                    {userData.primaryGame !== 'Not selected' && (
                      <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-full px-3 py-1">
                        <span className="text-cyan-400 text-sm font-medium">{userData.primaryGame}</span>
                      </div>
                    )}
                    
                    <div className={`border rounded-full px-3 py-1 ${
                      userData.profileVisibility === 'public' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                      userData.profileVisibility === 'friends' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                      'bg-red-500/20 border-red-500/30 text-red-400'
                    }`}>
                      {userData.profileVisibility === 'public' ? <Globe className="w-3 h-3 inline mr-1" /> :
                       userData.profileVisibility === 'friends' ? <Users className="w-3 h-3 inline mr-1" /> :
                       <Lock className="w-3 h-3 inline mr-1" />}
                      <span className="text-sm font-medium capitalize">{userData.profileVisibility}</span>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-sm mb-6 max-w-2xl leading-relaxed">{userData.bio}</p>

                  {/* Languages */}
                  {userData.languages.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <Languages className="w-4 h-4 text-zinc-400" />
                      <div className="flex flex-wrap gap-2">
                        {userData.languages.map(lang => (
                          <span key={lang} className="bg-purple-500/20 border border-purple-500/30 rounded-full px-2 py-1 text-xs text-purple-300">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* In-Game Roles */}
                  {userData.inGameRole.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-zinc-400" />
                      <div className="flex flex-wrap gap-2">
                        {userData.inGameRole.map(role => (
                          <span key={role} className="bg-orange-500/20 border border-orange-500/30 rounded-full px-2 py-1 text-xs text-orange-300 capitalize">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Quick Stats */}
            <div className="lg:w-80">
              <div className="bg-gradient-to-r from-cyan-600/20 to-purple-500/20 border border-cyan-400/30 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <span className="text-amber-400 font-semibold text-lg">Aegis Rating</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">{userData.aegisRating}</div>
                  <div className="text-amber-400 text-sm">Peak: {userData.peakRating}</div>
                </div>
                <div className="flex items-center justify-center gap-2 text-cyan-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>New player rating</span>
                </div>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-cyan-400" />
                  Achievements
                </h3>
                <div className="space-y-3 text-center">
                  {userData.qualifiedEvents ? (
                    <div>
                      <div className="text-green-400 text-sm mb-1">Official Events Qualified</div>
                      {userData.qualifiedEventDetails.map((event, index) => (
                        <div key={index} className="text-xs text-zinc-400 bg-green-500/10 rounded px-2 py-1 mb-1">
                          {event}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-zinc-400 text-sm">No tournament qualifications yet</div>
                  )}
                  {userData.earnings > 0 && (
                    <div>
                      <div className="text-lg font-bold text-green-400">₹{userData.earnings.toLocaleString()}</div>
                      <div className="text-xs text-zinc-400">Total Earnings</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Community
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">{userData.followers}</div>
                    <div className="text-xs text-zinc-400">Followers</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{userData.following}</div>
                    <div className="text-xs text-zinc-400">Following</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <StatCard icon={Target} label="Win Rate" value="TBD" color="green" />
            <StatCard icon={Zap} label="Avg K/D/A" value="TBD" color="blue" />
            <StatCard icon={Medal} label="Win Streak" value="TBD" color="red" />
            <StatCard icon={Trophy} label="Tournaments" value="0" color="amber" />
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-cyan-400" />
              Account Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors border border-zinc-700">
                  <div className="flex items-center gap-3">
                    <Edit className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">Edit Profile Information</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors border border-zinc-700">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-yellow-400" />
                    <span className="text-white">Notification Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors border border-zinc-700">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-400" />
                    <span className="text-white">Privacy Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors border border-zinc-700">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-blue-400" />
                    <span className="text-white">Export Profile Data</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors border border-zinc-700">
                  <div className="flex items-center gap-3">
                    <Copy className="w-5 h-5 text-purple-400" />
                    <span className="text-white">Copy Profile URL</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
                
                <button className="w-full flex items-center justify-between p-4 bg-red-900/20 hover:bg-red-800/30 rounded-lg transition-colors border border-red-700/50">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">Delete Account</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
          <TabButton id="gaming" label="Gaming Profile" isActive={activeTab === 'gaming'} onClick={setActiveTab} />
          <TabButton id="social" label="Social & Contact" isActive={activeTab === 'social'} onClick={setActiveTab} />
          <TabButton id="activity" label="Recent Activity" isActive={activeTab === 'activity'} onClick={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InfoCard 
                title="Personal Information" 
                action={
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                }
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                    <span className="text-zinc-400">Full Name</span>
                    <span className="text-white font-medium">{userData.realName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                    <span className="text-zinc-400">Age</span>
                    <span className="text-white font-medium">{userData.age}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                    <span className="text-zinc-400">Location</span>
                    <span className="text-white font-medium">{userData.location}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                    <span className="text-zinc-400">Country</span>
                    <span className="text-white font-medium">{userData.country}</span>
                  </div>
                  <div className="flex justify-between items-start py-2 border-b border-zinc-700/50">
                    <span className="text-zinc-400">Languages</span>
                    <div className="text-right">
                      {userData.languages.length > 0 ? (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {userData.languages.map(lang => (
                            <span key={lang} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                              {lang}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">Not specified</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-zinc-400">Account Status</span>
                    <div className="flex items-center gap-2">
                      {userData.verified ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-medium">Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-medium">Unverified</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </InfoCard>

              <InfoCard title="Profile Summary">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-cyan-400" />
                      <span className="text-white font-medium">Current Rating</span>
                    </div>
                    <div className="text-2xl font-bold text-cyan-400 mb-1">{userData.aegisRating}</div>
                    <p className="text-zinc-400 text-sm">You're just getting started on your Aegis journey!</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">Team Status</span>
                    </div>
                    <p className="text-green-300 capitalize">{userData.teamStatus}</p>
                    <p className="text-zinc-400 text-sm">Available: {userData.availability}</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gamepad2 className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Primary Game</span>
                    </div>
                    <p className="text-purple-300">{userData.primaryGame}</p>
                    {userData.inGameRole.length > 0 && (
                      <p className="text-zinc-400 text-sm">Roles: {userData.inGameRole.join(', ')}</p>
                    )}
                  </div>
                </div>
              </InfoCard>
            </div>
          )}

          {activeTab === 'gaming' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InfoCard 
                title="Gaming Statistics"
                action={
                  <span className="text-zinc-500 text-sm">Stats tracking coming soon</span>
                }
              >
                <div className="space-y-4">
                  <div className="text-center py-8 bg-zinc-800/30 rounded-lg">
                    <BarChart3 className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-2">Match statistics will appear here</p>
                    <p className="text-zinc-500 text-sm">Play matches to see your performance data</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-400 mb-1">{userData.aegisRating}</div>
                      <div className="text-zinc-400 text-sm">Current Rating</div>
                    </div>
                    <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-400 mb-1">{userData.peakRating}</div>
                      <div className="text-zinc-400 text-sm">Peak Rating</div>
                    </div>
                  </div>
                </div>
              </InfoCard>

              <InfoCard 
                title="Game Profile"
                action={
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                }
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                    <span className="text-zinc-400">Primary Game</span>
                    <span className="text-white font-medium">{userData.primaryGame}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                    <span className="text-zinc-400">In-Game Name</span>
                    <span className="text-white font-medium">{userData.inGameName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                    <span className="text-zinc-400">Team Status</span>
                    <span className="text-white font-medium capitalize">{userData.teamStatus}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                    <span className="text-zinc-400">Availability</span>
                    <span className="text-white font-medium capitalize">{userData.availability}</span>
                  </div>
                  <div className="flex justify-between items-start py-2 border-b border-zinc-700/50">
                    <span className="text-zinc-400">Roles</span>
                    <div className="text-right">
                      {userData.inGameRole.length > 0 ? (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {userData.inGameRole.map(role => (
                            <span key={role} className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs capitalize">
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">Not specified</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-zinc-700/50">
                    <span className="text-zinc-400">Earnings</span>
                    <span className="text-green-400 font-medium">
                      {userData.earnings > 0 ? `₹${userData.earnings.toLocaleString()}` : 'No earnings yet'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-zinc-400">Qualified Events</span>
                    <div className="text-right">
                      {userData.qualifiedEvents && userData.qualifiedEventDetails.length > 0 ? (
                        <div className="space-y-1">
                          {userData.qualifiedEventDetails.map((event, index) => (
                            <div key={index} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                              {event}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">None yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </InfoCard>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InfoCard 
                title="Social Platforms"
                action={
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                }
              >
                <div className="space-y-4">
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${
                    userData.discordTag ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-zinc-800/50 border-zinc-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-indigo-400" />
                      <div>
                        <p className="text-white font-medium">Discord</p>
                        <p className={`text-sm ${userData.discordTag ? 'text-indigo-300' : 'text-zinc-500 italic'}`}>
                          {userData.discordTag || 'Not connected'}
                        </p>
                      </div>
                    </div>
                    {userData.discordTag && <ExternalLink className="w-4 h-4 text-zinc-400" />}
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg border ${
                    userData.twitch ? 'bg-purple-500/10 border-purple-500/30' : 'bg-zinc-800/50 border-zinc-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Twitch</p>
                        <p className={`text-sm ${userData.twitch ? 'text-purple-300' : 'text-zinc-500 italic'}`}>
                          {userData.twitch || 'Not connected'}
                        </p>
                      </div>
                    </div>
                    {userData.twitch && <ExternalLink className="w-4 h-4 text-zinc-400" />}
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-lg border ${
                    userData.YouTube ? 'bg-red-500/10 border-red-500/30' : 'bg-zinc-800/50 border-zinc-700'
                  }`}>
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="text-white font-medium">YouTube</p>
                        <p className={`text-sm ${userData.YouTube ? 'text-red-300' : 'text-zinc-500 italic'}`}>
                          {userData.YouTube || 'Not connected'}
                        </p>
                      </div>
                    </div>
                    {userData.YouTube && <ExternalLink className="w-4 h-4 text-zinc-400" />}
                  </div>

                  <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-white font-semibold mb-1">Connect Your Accounts</h4>
                        <p className="text-zinc-300 text-sm leading-relaxed">
                          Link your gaming profiles to help other players find and connect with you. 
                          This makes it easier to team up and showcase your skills.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </InfoCard>

              <InfoCard title="Privacy & Visibility">
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${
                    userData.profileVisibility === 'public' ? 'bg-green-500/10 border-green-500/30' :
                    userData.profileVisibility === 'friends' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {userData.profileVisibility === 'public' ? <Globe className="w-5 h-5 text-green-400" /> :
                       userData.profileVisibility === 'friends' ? <Users className="w-5 h-5 text-yellow-400" /> :
                       <Lock className="w-5 h-5 text-red-400" />}
                      <span className="text-white font-medium">Profile Visibility</span>
                    </div>
                    <p className={`capitalize font-medium ${
                      userData.profileVisibility === 'public' ? 'text-green-300' :
                      userData.profileVisibility === 'friends' ? 'text-yellow-300' :
                      'text-red-300'
                    }`}>
                      {userData.profileVisibility}
                    </p>
                    <p className="text-zinc-400 text-xs mt-1">
                      {userData.profileVisibility === 'public' ? 'Anyone can view your profile' :
                       userData.profileVisibility === 'friends' ? 'Only friends can see your profile' :
                       'Your profile is hidden from searches'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Quick Actions</h4>
                    <button className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors border border-zinc-700">
                      <span className="text-white">Change Privacy Settings</span>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors border border-zinc-700">
                      <span className="text-white">Manage Social Links</span>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors border border-zinc-700">
                      <span className="text-white">Export Profile Data</span>
                      <Download className="w-4 h-4 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </InfoCard>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-8">
              <InfoCard title="Recent Activity">
                <div className="text-center py-12 bg-zinc-800/30 rounded-lg">
                  <Clock className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">No Recent Activity</h3>
                  <p className="text-zinc-400 mb-4">Your match history and tournament participation will appear here</p>
                  <button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg transition-all">
                    Join Your First Tournament
                  </button>
                </div>
              </InfoCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoCard title="Match History">
                  <div className="text-center py-8 bg-zinc-800/30 rounded-lg">
                    <Gamepad2 className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-2">No matches played yet</p>
                    <p className="text-zinc-500 text-sm">Connect your game account to track matches</p>
                  </div>
                </InfoCard>

                <InfoCard title="Tournament History">
                  <div className="text-center py-8 bg-zinc-800/30 rounded-lg">
                    <Trophy className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-2">No tournaments yet</p>
                    <p className="text-zinc-500 text-sm">Join tournaments to build your competitive record</p>
                  </div>
                </InfoCard>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-cyan-500/30 flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Complete Profile Setup
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-8 py-3 rounded-lg transition-colors border border-cyan-400/30 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Profile
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-6 py-3 rounded-lg transition-colors border border-zinc-600 flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Copy Profile URL
          </button>
        </div>

        {/* Profile Completion Progress */}
        {!userData.verified && (
          <div className="mt-8 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-amber-400 font-semibold mb-2">Complete Your Profile</h3>
                <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                  Complete your profile to unlock all Aegis features and improve your visibility to potential teammates.
                </p>
                <div className="flex flex-wrap gap-2">
                  {!userData.bio || userData.bio === 'No bio added yet. Share something about your gaming journey!' ? (
                    <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs">Add Bio</span>
                  ) : null}
                  {userData.languages.length === 0 ? (
                    <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs">Add Languages</span>
                  ) : null}
                  {userData.primaryGame === 'Not selected' ? (
                    <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs">Select Main Game</span>
                  ) : null}
                  {!userData.discordTag ? (
                    <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs">Add Discord</span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AegisMyProfile;