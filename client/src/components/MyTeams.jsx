import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, AlertCircle, Crown, History, Star, MapPin, Calendar,
  Trophy, Target, Zap, TrendingUp, Award, Shield, Plus,
  ExternalLink, MessageCircle, Settings, Eye, ChevronRight,
  Medal, Activity, BarChart3, Globe, Gamepad2
} from 'lucide-react';

const MyTeams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchPlayer = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/players/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const playerData = await response.json();
          setPlayer(playerData);
        } else {
          setError('Failed to fetch player data');
        }
      } catch (err) {
        setError('Network error fetching player data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [user]);

  // Aegis Mascot Component
  const AegisMascot = ({ size = "w-12 h-12" }) => (
    <div className={`${size} relative flex-shrink-0`}>
      <div className="w-full h-full bg-gradient-to-b from-orange-400 via-red-500 to-amber-600 rounded-t-full rounded-b-lg border-2 border-orange-300 relative overflow-hidden shadow-lg shadow-orange-500/50">
        <div className="absolute inset-0">
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-300/30 rounded-full" />
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-200/40 rounded-full" />
        </div>
        
        <div className="absolute inset-1 bg-gradient-to-b from-orange-300/20 to-red-400/20 rounded-t-full rounded-b-lg border border-yellow-400/30" />
        
        <div className="absolute top-3 left-2 w-1 h-1 bg-yellow-300 rounded-full animate-pulse shadow-lg shadow-yellow-400/80" />
        <div className="absolute top-3 right-2 w-1 h-1 bg-yellow-300 rounded-full animate-pulse shadow-lg shadow-yellow-400/80" />
        
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-2 h-0.5 bg-yellow-200/90 rounded-full shadow-sm shadow-yellow-300/60" />
      </div>
      
      <div className="absolute top-3 -left-1 w-1.5 h-3 bg-gradient-to-b from-orange-300 to-red-400 rounded-full transform rotate-12 shadow-md shadow-orange-400/50" />
      <div className="absolute top-3 -right-1 w-1.5 h-3 bg-gradient-to-b from-orange-300 to-red-400 rounded-full transform -rotate-12 shadow-md shadow-orange-400/50" />
      
      <div className="absolute inset-0 bg-orange-400/40 rounded-t-full rounded-b-lg blur-md -z-10 animate-pulse" />
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color = "orange", trend }) => (
    <div className={`bg-zinc-800/40 backdrop-blur-sm border border-${color}-400/30 rounded-xl p-4 hover:bg-zinc-800/60 transition-all duration-300 hover:scale-105 shadow-lg shadow-${color}-500/10`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 text-${color}-400`} />
        {trend && (
          <div className={`flex items-center text-xs px-2 py-1 rounded-full bg-${trend > 0 ? 'green' : 'red'}-500/20`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${trend > 0 ? 'text-green-400' : 'text-red-400 rotate-180'}`} />
            <span className={trend > 0 ? 'text-green-400' : 'text-red-400'}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</div>
      <div className="text-zinc-400 text-sm">{label}</div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick, icon: Icon }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-6 py-3 font-medium rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30' 
          : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white border border-zinc-700/50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  const renderTeamCard = (team, isCurrent = false) => (
    <div key={team._id} className={`group relative bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 backdrop-blur-sm border-2 ${isCurrent ? 'border-orange-500/50 shadow-lg shadow-orange-500/20' : 'border-zinc-700/50'} rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 hover:scale-[1.02]`}>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,165,0,0.3) 0%, transparent 50%)', 
        }} />
      </div>

      {/* Current Team Badge */}
      {isCurrent && (
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-gradient-to-r from-orange-500/90 to-red-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-orange-400/50">
          <Crown size={14} className="text-white animate-pulse" />
          <span className="text-white text-xs font-bold">CURRENT</span>
        </div>
      )}

      <div className="relative p-6 space-y-4">
        {/* Team Logo and Header */}
        <div className="flex items-start space-x-4">
          {team.logo ? (
            <div className="relative">
              <img
                src={team.logo}
                alt={`${team.teamName} logo`}
                className="w-16 h-16 rounded-xl object-cover border-2 border-orange-400/50 shadow-lg"
              />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center border-2 border-orange-400/50">
              <AegisMascot size="w-10 h-10" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white mb-1 truncate">{team.teamName}</h3>
            {team.tag && (
              <div className="inline-flex items-center bg-orange-500/20 border border-orange-400/30 px-2 py-1 rounded-lg">
                <span className="text-orange-400 font-bold text-sm">[{team.tag}]</span>
              </div>
            )}
          </div>
        </div>

        {/* Team Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
            <div className="flex items-center space-x-2 mb-1">
              <Gamepad2 className="w-4 h-4 text-blue-400" />
              <span className="text-zinc-400 text-xs font-medium">GAME</span>
            </div>
            <span className="text-white font-semibold text-sm">{team.primaryGame}</span>
          </div>
          
          <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-zinc-400 text-xs font-medium">MEMBERS</span>
            </div>
            <span className="text-white font-semibold text-sm">{team.players?.length || 0}/5</span>
          </div>
          
          <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
            <div className="flex items-center space-x-2 mb-1">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-zinc-400 text-xs font-medium">CAPTAIN</span>
            </div>
            <span className="text-white font-semibold text-sm truncate">{team.captain?.username || 'TBD'}</span>
          </div>
          
          <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
            <div className="flex items-center space-x-2 mb-1">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="text-zinc-400 text-xs font-medium">REGION</span>
            </div>
            <span className="text-white font-semibold text-sm">{team.region || 'N/A'}</span>
          </div>
        </div>

        {/* Team Bio */}
        {team.bio && (
          <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30">
            <p className="text-zinc-300 text-sm line-clamp-2">{team.bio}</p>
          </div>
        )}

        {/* Aegis Rating */}
        {team.aegisRating > 0 && (
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-semibold">Aegis Rating</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-400">{team.aegisRating}</div>
                <div className="text-xs text-orange-300/80">Team Rank</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => navigate(`/team/${team._id}`)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          {isCurrent && (
            <button
              onClick={() => navigate(`/team/${team._id}/settings`)}
              className="bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 hover:text-white py-2 px-3 rounded-lg transition-colors border border-zinc-600/50"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 text-white font-sans pt-[100px]">
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <AegisMascot size="w-8 h-8" />
              </div>
            </div>
            <div className="text-zinc-400 text-lg">Loading your teams...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 text-white font-sans pt-[100px]">
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center space-y-6">
          <div className="relative">
            <AlertCircle size={64} className="text-red-400 mx-auto" />
            <div className="absolute inset-0 bg-red-400/20 blur-xl rounded-full"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Oops! Something went wrong</h2>
            <p className="text-red-400 text-lg">{error}</p>
            <p className="text-zinc-400">Please try refreshing the page or contact support if the issue persists.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/30"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 text-white font-sans pt-[100px]">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-l from-red-500/15 to-amber-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute -bottom-40 left-1/4 w-72 h-72 bg-gradient-to-t from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <AegisMascot size="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-black text-white">My Teams</h1>
              <p className="text-zinc-400 text-lg">Manage your esports journey</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/30 flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Join Team</span>
            </button>
            <button className="bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white px-6 py-3 rounded-xl font-medium transition-colors border border-zinc-700/50 flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Create Team</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {(player?.team || (player?.previousTeams && player.previousTeams.length > 0)) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              label="Total Teams"
              value={(player?.team ? 1 : 0) + (player?.previousTeams?.length || 0)}
              color="blue"
              trend={5}
            />
            <StatCard
              icon={Trophy}
              label="Tournaments Won"
              value="12"
              color="amber"
              trend={8}
            />
            <StatCard
              icon={Target}
              label="Win Rate"
              value="73.2%"
              color="green"
              trend={-2}
            />
            <StatCard
              icon={Medal}
              label="MVP Awards"
              value="8"
              color="purple"
              trend={15}
            />
          </div>
        )}

        {/* Navigation Tabs */}
        {(player?.team || (player?.previousTeams && player.previousTeams.length > 0)) && (
          <div className="flex flex-wrap gap-4 mb-8">
            <TabButton 
              id="current" 
              label="Current Team" 
              icon={Crown}
              isActive={activeTab === 'current'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="history" 
              label="Team History" 
              icon={History}
              isActive={activeTab === 'history'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="achievements" 
              label="Achievements" 
              icon={Award}
              isActive={activeTab === 'achievements'} 
              onClick={setActiveTab} 
            />
          </div>
        )}

        {/* Content */}
        {!player?.team && (!player?.previousTeams || player.previousTeams.length === 0) ? (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-full flex items-center justify-center border border-zinc-700/50 backdrop-blur-sm">
                <Users size={48} className="text-zinc-500" />
              </div>
              <div className="absolute inset-0 bg-zinc-500/20 blur-xl rounded-full"></div>
            </div>
            
            <div className="space-y-4 max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-white">Ready to Join the Elite?</h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                You haven't joined any teams yet. Start your esports journey by joining or creating a team to compete with the best players worldwide.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Find Teams</span>
                </button>
                <button className="bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors border border-zinc-700/50 flex items-center justify-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create Team</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Current Team Section */}
            {activeTab === 'current' && player?.team && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Crown size={28} className="text-orange-500" />
                  <h2 className="text-3xl font-bold text-white">Current Team</h2>
                  <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                    <span className="text-green-400 text-sm font-medium">Active</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                  {renderTeamCard(player.team, true)}
                  
                  {/* Team Performance Card */}
                  <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 backdrop-blur-sm border-2 border-zinc-700/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                      <BarChart3 className="w-6 h-6 text-orange-400" />
                      <span>Team Performance</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
                        <div className="text-2xl font-bold text-green-400 mb-1">73%</div>
                        <div className="text-zinc-400 text-sm">Win Rate</div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
                        <div className="text-2xl font-bold text-blue-400 mb-1">15</div>
                        <div className="text-zinc-400 text-sm">Matches Played</div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
                        <div className="text-2xl font-bold text-amber-400 mb-1">3</div>
                        <div className="text-zinc-400 text-sm">Tournaments Won</div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-700/50">
                        <div className="text-2xl font-bold text-purple-400 mb-1">1,247</div>
                        <div className="text-zinc-400 text-sm">Team Rating</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 text-sm">Recent Form</span>
                        <div className="flex space-x-1">
                          {['W', 'W', 'L', 'W', 'W'].map((result, index) => (
                            <div key={index} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${result === 'W' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                              {result}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2">
                        <Activity className="w-4 h-4" />
                        <span>View Detailed Stats</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team History Section */}
            {activeTab === 'history' && player?.previousTeams && player.previousTeams.length > 0 && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <History size={28} className="text-zinc-400" />
                  <h2 className="text-3xl font-bold text-white">Team History</h2>
                  <div className="px-3 py-1 bg-zinc-500/20 border border-zinc-500/30 rounded-full">
                    <span className="text-zinc-400 text-sm font-medium">{player.previousTeams.length} Teams</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {player.previousTeams.map((team) => renderTeamCard(team, false))}
                </div>
              </div>
            )}

            {/* Achievements Section */}
            {activeTab === 'achievements' && (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <Award size={28} className="text-amber-400" />
                  <h2 className="text-3xl font-bold text-white">Achievements</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Sample achievements */}
                  {[
                    { title: 'Champion', desc: 'Won Winter Circuit 2024', color: 'amber', icon: Trophy },
                    { title: 'MVP', desc: 'Regional Qualifier MVP', color: 'purple', icon: Star },
                    { title: 'Rising Star', desc: 'First tournament victory', color: 'green', icon: TrendingUp },
                    { title: 'Team Player', desc: '50+ matches with current team', color: 'blue', icon: Users },
                    { title: 'Clutch Master', desc: '10 clutch victories', color: 'red', icon: Target },
                    { title: 'Veteran', desc: '1 year on Aegis', color: 'orange', icon: Medal }
                  ].map((achievement, index) => (
                    <div key={index} className={`bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 backdrop-blur-sm border-2 border-${achievement.color}-400/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg shadow-${achievement.color}-500/10`}>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-12 h-12 bg-gradient-to-br from-${achievement.color}-500 to-${achievement.color}-600 rounded-xl flex items-center justify-center`}>
                          <achievement.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold">{achievement.title}</h3>
                          <p className="text-zinc-400 text-sm">{achievement.desc}</p>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500">Earned 2 days ago</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTeams;