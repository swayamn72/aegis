import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Trophy, Users, Target, TrendingUp, Calendar, MessageSquare, 
  Sparkles, Zap, Award, Activity, Gamepad2, ArrowRight
} from 'lucide-react';

const LoggedInHomepage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [recentMatches, setRecentMatches] = useState([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [trendingPlayers, setTrendingPlayers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [connections, setConnections] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch upcoming tournaments
        const tournamentsRes = await fetch('/api/tournaments?status=upcoming&limit=3', {
          credentials: 'include'
        });
        if (tournamentsRes.ok) {
          const tournamentsData = await tournamentsRes.json();
          setUpcomingTournaments(tournamentsData.tournaments || []);
        }

        // Fetch connections
        const connectionsRes = await fetch('/api/connections', {
          credentials: 'include'
        });
        if (connectionsRes.ok) {
          const connectionsData = await connectionsRes.json();
          setConnections(connectionsData.connections || []);
        }

        // Fetch recent matches
        const matchesRes = await fetch('/api/matches/recent?limit=2', {
          credentials: 'include'
        });
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setRecentMatches(matchesData.matches || []);
        }

        // Mock trending players
        setTrendingPlayers([
          { id: 1, username: 'f0rsakeN', primaryGame: 'VALO', aegisRating: 2847, trend: '+12%' },
          { id: 2, username: 'Demon1', primaryGame: 'VALO', aegisRating: 2756, trend: '+8%' },
          { id: 3, username: 'Jinggg', primaryGame: 'VALO', aegisRating: 2698, trend: '+15%' },
        ]);

        setOpportunities([
          { id: 1, org: 'Team Soul', role: 'IGL', game: 'BGMI', type: 'Recruitment', posted: '1 day ago' },
          { id: 2, org: 'GodLike Esports', role: 'Coach', game: 'BGMI', type: 'Recruitment', posted: '3 days ago' },
          { id: 3, org: 'S8UL', role: 'Analyst', game: 'VALO', type: 'Recruitment', posted: '1 week ago' },
        ]);

        setActivityFeed([
          { id: 1, user: 'Boostio', action: 'won a tournament', target: 'VCT Americas', time: '3h ago' },
          { id: 2, user: 'Something', action: 'joined team', target: 'Paper Rex', time: '5h ago' },
          { id: 3, user: 'c0m', action: 'achieved rating', target: '2500 Aegis Rating', time: '1d ago' },
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const quickStats = [
    { 
      label: 'Your Rating', 
      value: user?.aegisRating || 1200, 
      change: '+45', 
      icon: TrendingUp, 
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-400'
    },
    { 
      label: 'Tournaments', 
      value: user?.statistics?.tournamentsPlayed || 0, 
      change: '+3', 
      icon: Trophy, 
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400'
    },
    { 
      label: 'Connections', 
      value: connections.length || 0, 
      change: `+${connections.filter(c => c.isRecent).length || 0}`, 
      icon: Users, 
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400'
    },
    { 
      label: 'Win Rate', 
      value: `${user?.statistics?.winRate || 0}%`, 
      change: '+2%', 
      icon: Award, 
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 text-white pt-[100px]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-purple-600/10 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.username}!</h1>
              <p className="text-zinc-400">Ready to dominate the esports arena?</p>
            </div>
            {(!user?.profilePicture || !user?.bio || !user?.primaryGame) && (
              <button 
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2 bg-gradient-to-r from-[#FF4500] to-orange-600 px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                Complete Profile
              </button>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, idx) => (
              <div key={idx} className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-5 border border-zinc-800 hover:border-zinc-700 transition-all group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-zinc-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change} this week
                    </span>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => navigate('/players')}
              className="flex items-center gap-2 bg-zinc-800/70 px-5 py-2.5 rounded-lg hover:bg-zinc-700 transition-all border border-zinc-700"
            >
              <Users className="w-4 h-4" />
              Find Teams
            </button>
            <button 
              onClick={() => navigate('/players')}
              className="flex items-center gap-2 bg-zinc-800/70 px-5 py-2.5 rounded-lg hover:bg-zinc-700 transition-all border border-zinc-700"
            >
              <Target className="w-4 h-4" />
              Scout Players
            </button>
            <button 
              onClick={() => navigate('/tournaments')}
              className="flex items-center gap-2 bg-zinc-800/70 px-5 py-2.5 rounded-lg hover:bg-zinc-700 transition-all border border-zinc-700"
            >
              <Trophy className="w-4 h-4" />
              Join Tournament
            </button>
            <button 
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2 bg-zinc-800/70 px-5 py-2.5 rounded-lg hover:bg-zinc-700 transition-all border border-zinc-700"
            >
              <MessageSquare className="w-4 h-4" />
              Messages
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Activity Feed */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Zap className="w-6 h-6 text-[#FF4500]" />
                    Activity Feed
                  </h2>
                  <div className="flex gap-2">
                    {['feed', 'trending'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeTab === tab
                            ? 'bg-gradient-to-r from-[#FF4500] to-orange-600 text-white'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-zinc-800">
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="p-5 hover:bg-zinc-800/30 transition-colors cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4500] to-orange-600 flex items-center justify-center text-xl font-bold shrink-0">
                        {activity.user[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-200">
                          <span className="font-semibold text-white">{activity.user}</span>
                          {' '}{activity.action}{' '}
                          <span className="font-semibold text-[#FF4500]">{activity.target}</span>
                        </p>
                        <p className="text-zinc-500 text-sm mt-1">{activity.time}</p>
                      </div>
                      <button className="text-zinc-400 hover:text-white transition-colors">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 text-center border-t border-zinc-800">
                <button className="text-[#FF4500] hover:text-orange-300 font-medium text-sm">
                  View All Activity →
                </button>
              </div>
            </div>

            {/* Opportunities */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-6 border-b border-zinc-800">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Target className="w-6 h-6 text-[#FF4500]" />
                  Opportunities for You
                </h2>
              </div>

              <div className="divide-y divide-zinc-800">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="p-5 hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-white">{opp.role}</h3>
                          <span className="px-2 py-1 bg-[#FF4500]/20 border border-[#FF4500]/30 text-[#FF4500] text-xs rounded-full">
                            {opp.game}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm">
                          {opp.org} • {opp.type} • {opp.posted}
                        </p>
                      </div>
                      <button className="bg-gradient-to-r from-[#FF4500] to-orange-600 hover:from-orange-600 hover:to-orange-700 px-5 py-2 rounded-lg font-medium transition-colors">
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 text-center border-t border-zinc-800">
                <button 
                  onClick={() => navigate('/opportunities')}
                  className="text-[#FF4500] hover:text-orange-300 font-medium text-sm"
                >
                  Browse All Opportunities →
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Upcoming Tournaments */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-5 border-b border-zinc-800">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#FF4500]" />
                  Upcoming Tournaments
                </h2>
              </div>

              <div className="p-4 space-y-3">
                {upcomingTournaments.length > 0 ? upcomingTournaments.map((tournament) => (
                  <div 
                    key={tournament._id} 
                    onClick={() => navigate(`/tournaments/${tournament._id}`)}
                    className="bg-zinc-800/30 rounded-lg p-4 hover:bg-zinc-800/50 transition-colors border border-zinc-700/30 cursor-pointer"
                  >
                    <h3 className="font-semibold text-white mb-2">{tournament.tournamentName}</h3>
                    <div className="space-y-1 text-sm text-zinc-400">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        {tournament.prizePool?.total ? `₹${tournament.prizePool.total.toLocaleString()}` : 'TBD'}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {tournament.slots?.total || 0} teams
                      </p>
                    </div>
                    <button className="w-full mt-3 bg-[#FF4500]/20 hover:bg-[#FF4500]/30 border border-[#FF4500]/30 text-[#FF4500] py-2 rounded-lg text-sm font-medium transition-colors">
                      Register Now
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-6 text-zinc-400">
                    <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No upcoming tournaments</p>
                  </div>
                )}
              </div>

              <div className="p-4 text-center border-t border-zinc-800">
                <button 
                  onClick={() => navigate('/tournaments')}
                  className="text-[#FF4500] hover:text-orange-300 font-medium text-sm"
                >
                  View All Tournaments →
                </button>
              </div>
            </div>

            {/* Trending Players */}
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-5 border-b border-zinc-800">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#FF4500]" />
                  Trending Players
                </h2>
              </div>

              <div className="p-4 space-y-3">
                {trendingPlayers.map((player, idx) => (
                  <div 
                    key={player.id} 
                    onClick={() => navigate(`/players/${player.id}`)}
                    className="flex items-center gap-3 bg-zinc-800/30 rounded-lg p-3 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <div className="text-[#FF4500] font-bold text-lg w-6">#{idx + 1}</div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF4500] to-orange-600 flex items-center justify-center font-bold shrink-0">
                      {player.username[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{player.username}</p>
                      <p className="text-xs text-zinc-400">{player.primaryGame}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#FF4500]">{player.aegisRating}</p>
                      <p className="text-xs text-green-400">{player.trend}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 text-center border-t border-zinc-800">
                <button 
                  onClick={() => navigate('/players')}
                  className="text-[#FF4500] hover:text-orange-300 font-medium text-sm"
                >
                  View All Players →
                </button>
              </div>
            </div>

            {/* Recent Matches */}
            {recentMatches.length > 0 && (
              <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 overflow-hidden">
                <div className="p-5 border-b border-zinc-800">
                  <h2 className="text-xl font-bold">Recent Matches</h2>
                </div>

                <div className="p-4 space-y-3">
                  {recentMatches.map((match) => (
                    <div key={match._id} className="bg-zinc-800/30 rounded-lg p-4 hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-400">{match.time || 'Recently'}</span>
                        <span className="text-xs bg-purple-500/20 border border-purple-500/30 text-purple-400 px-2 py-1 rounded">
                          {match.map || 'Map'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{match.team1 || 'Team A'}</span>
                        <span className="text-[#FF4500] font-bold">{match.score || 'vs'}</span>
                        <span className="text-white font-medium">{match.team2 || 'Team B'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoggedInHomepage;