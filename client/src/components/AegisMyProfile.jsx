import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User, Gamepad2, Trophy, MapPin, Calendar, Globe, Target, Users,
  Zap, Shield, Camera, CheckCircle, Star, Award, ArrowRight, Edit,
  Clock, Activity, Hash, ExternalLink, Medal, Crown, Languages,
  Settings, Eye, EyeOff, Share2, Download, Mail, Phone
} from 'lucide-react';

const AegisMyProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading user profile...
      </div>
    );
  }

  const userData = {
    realName: user.realName || '',
    username: user.username || '',
    age: user.age || '',
    location: user.location || '',
    country: user.country || '',
    bio: user.bio || '',
    languages: user.languages || [],
    joinedDate: user.createdAt || '',

    primaryGame: user.primaryGame || '',
    experienceYears: user.experienceYears || '',
    earnings: user.earnings ? `₹${user.earnings}` : '',
    qualifiedEvents: user.qualifiedEvents || 'no',
    qualifiedEventsDetails: user.qualifiedEventsDetails || '',
    inGameRole: user.inGameRole || [],
    currentRank: user.currentRank || '',
    kd: user.kd || '',

    teamStatus: user.teamStatus || '',
    lookingFor: user.lookingFor || [],
    availability: user.availability || '',
    competitiveGoals: user.competitiveGoals || '',
    preferredGameModes: user.preferredGameModes || [],

    discordTag: user.discordTag || '',
    twitterHandle: user.twitterHandle || '',
    twitchChannel: user.twitchChannel || '',
    youtubeChannel: user.youtubeChannel || '',
    profileVisibility: user.profileVisibility || 'public',

    totalMatches: user.totalMatches || 0,
    winRate: user.winRate || '',
    avgDamage: user.avgDamage || 0,
    achievements: user.achievements || [],
    endorsements: user.endorsements || 0,
  };

  const AegisProfileMascot = () => (
    <div className="relative">
      <div className="w-16 h-20 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 rounded-t-full rounded-b-lg border-2 border-cyan-300 relative overflow-hidden shadow-lg shadow-cyan-500/50">
        <div className="absolute inset-0">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white/20 rounded-full" />
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-cyan-200/40 rounded-full" />
        </div>
        
        <div className="absolute inset-1 bg-gradient-to-b from-cyan-300/20 to-purple-400/20 rounded-t-full rounded-b-lg border border-white/30" />
        
        <div className="absolute top-6 left-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-lg shadow-white/80" />
        <div className="absolute top-6 right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-lg shadow-white/80" />
        
        <div className="absolute top-9 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-white/90 rounded-full shadow-sm shadow-white/60" />
        
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-bounce" style={{animationDelay: '0.5s'}} />
      </div>
      
      <div className="absolute top-8 -left-1.5 w-2.5 h-5 bg-gradient-to-b from-cyan-300 to-blue-400 rounded-full transform rotate-12 shadow-md shadow-cyan-400/50" />
      <div className="absolute top-8 -right-1.5 w-2.5 h-5 bg-gradient-to-b from-cyan-300 to-blue-400 rounded-full transform -rotate-12 shadow-md shadow-cyan-400/50" />
      
      <div className="absolute inset-0 bg-cyan-400/40 rounded-t-full rounded-b-lg blur-md -z-10 animate-pulse" />
      <div className="absolute inset-0 bg-purple-500/20 rounded-t-full rounded-b-lg blur-lg -z-20" />
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, gradient = "from-cyan-500 to-blue-600" }) => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-zinc-400 text-sm">{title}</p>
          <p className="text-white font-bold text-lg">{value}</p>
        </div>
      </div>
    </div>
  );

  const InfoSection = ({ title, children }) => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        {title}
      </h3>
      {children}
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        active
          ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-400/50'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950/30 via-slate-950 to-zinc-950 relative overflow-hidden mt-[100px]">
      
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-15">
        {[...Array(40)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse" 
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`, 
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s` 
            }} 
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <AegisProfileMascot />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
              My 
              <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Aegis Profile
              </span>
            </h1>
            <p className="text-lg text-zinc-400">
              Your gaming journey and achievements
            </p>
          </div>

          {/* Profile Header Card */}
          <div className="bg-gradient-to-r from-purple-900/20 via-slate-900/40 to-zinc-900/40 backdrop-blur-md border border-purple-500/20 rounded-3xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              
              {/* Profile Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full p-1">
                  <div className="w-full h-full bg-zinc-800 rounded-full flex items-center justify-center">
                    <User className="w-16 h-16 text-purple-400" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 bg-green-500 p-2 rounded-full">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-white">{userData.realName}</h2>
                  <div className="bg-purple-500/20 px-3 py-1 rounded-full">
                    <span className="text-purple-300 text-sm font-medium">@{userData.username}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="flex items-center gap-1 text-zinc-300">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{userData.location}, {userData.country}</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-300">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Joined Jan 2024</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-300">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{userData.endorsements} Endorsements</span>
                  </div>
                </div>
                
                <p className="text-zinc-400 text-sm leading-relaxed mb-4 max-w-lg">
                  {userData.bio}
                </p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {userData.languages.map(lang => (
                    <span key={lang} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
                <button className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-6 py-3 rounded-xl transition-all border border-white/20">
                  <Share2 className="w-4 h-4" />
                  Share Profile
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Trophy} title="Current Rank" value={userData.currentRank} gradient="from-yellow-500 to-orange-600" />
            <StatCard icon={Target} title="K/D Ratio" value={userData.kd} gradient="from-red-500 to-pink-600" />
            <StatCard icon={Medal} title="Win Rate" value={userData.winRate} gradient="from-green-500 to-emerald-600" />
            <StatCard icon={Award} title="Earnings" value={userData.earnings} gradient="from-purple-500 to-indigo-600" />
          </div>

          {/* Tab Navigation */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-8">
            <div className="flex flex-wrap gap-2">
              <TabButton id="overview" label="Overview" icon={User} active={activeTab === 'overview'} />
              <TabButton id="gaming" label="Gaming Stats" icon={Gamepad2} active={activeTab === 'gaming'} />
              <TabButton id="team" label="Team & Goals" icon={Users} active={activeTab === 'team'} />
              <TabButton id="social" label="Social Links" icon={Globe} active={activeTab === 'social'} />
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InfoSection title="Personal Information">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Age</span>
                    <span className="text-white font-medium">{userData.age} years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Location</span>
                    <span className="text-white font-medium">{userData.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Country</span>
                    <span className="text-white font-medium">{userData.country}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-zinc-400">Languages</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {userData.languages.map(lang => (
                        <span key={lang} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </InfoSection>

              <InfoSection title="Achievements">
                <div className="space-y-3">
                  {userData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">{achievement}</span>
                    </div>
                  ))}
                </div>
              </InfoSection>
            </div>
          )}

          {activeTab === 'gaming' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InfoSection title="Gaming Profile">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Primary Game</span>
                    <span className="text-white font-medium">{userData.primaryGame}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Experience</span>
                    <span className="text-white font-medium">{userData.experienceYears} years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Total Matches</span>
                    <span className="text-white font-medium">{userData.totalMatches}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Average Damage</span>
                    <span className="text-white font-medium">{userData.avgDamage}</span>
                  </div>
                </div>
              </InfoSection>

              <InfoSection title="Qualified Events">
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-white font-medium mb-2">Official Tournaments</p>
                    <p className="text-zinc-300 text-sm">{userData.qualifiedEventsDetails}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-zinc-400 text-sm">In-Game Roles:</span>
                    {userData.inGameRole.map(role => (
                      <span key={role} className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-medium">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </InfoSection>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InfoSection title="Team Status & Goals">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Current Status</span>
                    </div>
                    <p className="text-purple-300">{userData.teamStatus}</p>
                  </div>
                  
                  <div>
                    <p className="text-zinc-400 text-sm mb-2">Looking For:</p>
                    <div className="flex flex-wrap gap-2">
                      {userData.lookingFor.map(item => (
                        <span key={item} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Availability</span>
                    <span className="text-white font-medium">{userData.availability}</span>
                  </div>
                </div>
              </InfoSection>

              <InfoSection title="Competitive Goals">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-amber-300 text-sm leading-relaxed">
                      {userData.competitiveGoals}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-zinc-400 text-sm mb-2">Preferred Game Modes:</p>
                    <div className="flex flex-wrap gap-2">
                      {userData.preferredGameModes.map(mode => (
                        <span key={mode} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                          {mode}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </InfoSection>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InfoSection title="Social Platforms">
                <div className="space-y-4">
                  {userData.discordTag && (
                    <div className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Hash className="w-5 h-5 text-indigo-400" />
                        <div>
                          <p className="text-white font-medium">Discord</p>
                          <p className="text-indigo-300 text-sm">{userData.discordTag}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    </div>
                  )}

                  {userData.twitterHandle && (
                    <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Hash className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Twitter</p>
                          <p className="text-blue-300 text-sm">{userData.twitterHandle}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    </div>
                  )}

                  {userData.twitchChannel && (
                    <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">Twitch</p>
                          <p className="text-purple-300 text-sm">{userData.twitchChannel}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    </div>
                  )}

                  {userData.youtubeChannel && (
                    <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ExternalLink className="w-5 h-5 text-red-400" />
                        <div>
                          <p className="text-white font-medium">YouTube</p>
                          <p className="text-red-300 text-sm">{userData.youtubeChannel}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-400" />
                    </div>
                  )}
                </div>
              </InfoSection>

              <InfoSection title="Privacy Settings">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">Profile Visibility</span>
                    </div>
                    <p className="text-green-300 capitalize">{userData.profileVisibility}</p>
                    <p className="text-zinc-400 text-xs mt-1">Your profile is visible to everyone</p>
                  </div>

                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                      <span className="text-white">Manage Privacy</span>
                      <Settings className="w-4 h-4 text-zinc-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                      <span className="text-white">Download Profile Data</span>
                      <Download className="w-4 h-4 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </InfoSection>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-12 pt-8 border-t border-white/10">
            <p className="text-zinc-400 text-sm">
              Profile created on {new Date(userData.joinedDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AegisMyProfile;