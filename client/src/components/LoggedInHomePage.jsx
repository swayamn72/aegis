import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import {
  Trophy, Users, Target, TrendingUp, Calendar, MessageSquare,
  Sparkles, Zap, Award, Activity, Gamepad2, ArrowRight, X, Coins
} from 'lucide-react';

// Mock data for API responses (KEPT FOR CANVAS RUNNABILITY)
const mockData = {
  tournaments: [
    { _id: 101, tournamentName: 'Winter Circuit 2025: VALO', startDate: '2025-01-15T12:00:00Z', prizePool: { total: 500000 }, slots: { total: 32 } },
    { _id: 102, tournamentName: 'BGMI Challenger Series', startDate: '2025-01-28T12:00:00Z', prizePool: { total: 200000 }, slots: { total: 64 } },
  ],
  connections: [
    { id: 201, isRecent: true },
    { id: 202, isRecent: false },
    { id: 203, isRecent: true }
  ],
  matches: [
    { _id: 301, time: '2h ago', map: 'Ascent', team1: 'Team X', score: '13 - 11', team2: 'Rivals FC' },
    { _id: 302, time: '1d ago', map: 'Erangel', team1: 'Team X', score: 'Won #1', team2: '18 others' },
  ],
  trendingPlayers: [
    { id: 1, username: 'f0rsakeN', primaryGame: 'VALO', aegisRating: 2847, trend: '+12%' },
    { id: 2, username: 'Demon1', primaryGame: 'VALO', aegisRating: 2756, trend: '+8%' },
    { id: 3, username: 'Jinggg', primaryGame: 'VALO', aegisRating: 2698, trend: '+15%' },
  ],
  opportunities: [
    { id: 1, org: 'Team Soul', role: 'IGL', game: 'BGMI', type: 'Recruitment', posted: '1 day ago' },
    { id: 2, org: 'GodLike Esports', role: 'Coach', game: 'BGMI', type: 'Recruitment', posted: '3 days ago' },
    { id: 3, org: 'S8UL', role: 'Analyst', game: 'VALO', type: 'Recruitment', posted: '1 week ago' },
  ],
  activityFeed: [
    { id: 1, user: 'Boostio', action: 'won a tournament', target: 'VCT Americas', time: '3h ago' },
    { id: 2, user: 'Something', action: 'joined team', target: 'Paper Rex', time: '5h ago' },
    { id: 3, user: 'c0m', action: 'achieved rating', target: '2500 Aegis Rating', time: '1d ago' },
  ]
};

const LoggedInHomepage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('feed');
  const [recentMatches, setRecentMatches] = useState([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [trendingPlayers, setTrendingPlayers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [connections, setConnections] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  const dataLoaded = useRef(false);

  useEffect(() => {
    const loadInitialData = async () => {
      if (dataLoaded.current || !user) return;
      dataLoaded.current = true;

      try {
        const tournamentsResponse = await fetch('/api/tournaments/get-recent3-tourney', {
          credentials: 'include',
        });
        if (tournamentsResponse.ok) {
          const tournamentsData = await tournamentsResponse.json();
          setUpcomingTournaments(tournamentsData.tournaments);
        } else {
          setUpcomingTournaments(mockData.tournaments.slice(0, 3));
        }

        setConnections(mockData.connections);

        const matchesResponse = await fetch('/api/matches/recent3matches', {
          credentials: 'include',
        });
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          setRecentMatches(matchesData.matches);
        } else {
          setRecentMatches(mockData.matches);
        }

        setTrendingPlayers(mockData.trendingPlayers);
        setOpportunities(mockData.opportunities);
        setActivityFeed(mockData.activityFeed);

        if (!user?.profilePicture || !user?.bio || !user?.primaryGame) {
          setShowProfileAlert(true);
        }

      } catch (error) {
        console.error('Error setting dashboard data:', error);
        setUpcomingTournaments(mockData.tournaments.slice(0, 3));
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user]);

  const handleDailyCheckIn = async () => {
    if (checkInLoading) return;

    try {
      setCheckInLoading(true);
      const response = await fetch('/api/reward/daily-checkin', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Daily check-in successful! You earned ${data.reward} coins!`, {
          position: "top-center",
          autoClose: 5000,
          theme: "dark",
        });
        await refreshUser();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to check in', {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
      }
    } catch (error) {
      console.error('Daily check-in error:', error);
      toast.error('Network error. Please try again.', {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
    } finally {
      setCheckInLoading(false);
    }
  };

  const quickStats = [
    {
      label: 'Aegis Rating',
      value: user?.aegisRating || 1200,
      change: '+45',
      icon: TrendingUp,
      bgColor: 'bg-[#FF4500]/10',
      textColor: 'text-[#FF4500]',
      ringColor: 'ring-[#FF4500]',
    },
    {
      label: 'Tournaments',
      value: user?.statistics?.tournamentsPlayed || 0,
      change: '+3',
      icon: Trophy,
      bgColor: 'bg-cyan-500/10',
      textColor: 'text-cyan-400',
      ringColor: 'ring-cyan-400',
    },
    {
      label: 'Connections',
      value: connections.length || 0,
      change: `+${connections.filter(c => c.isRecent).length || 0}`,
      icon: Users,
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
      ringColor: 'ring-purple-400',
    },
    {
      label: 'Win Rate',
      value: `${user?.statistics?.winRate || 0}%`,
      change: '+2%',
      icon: Award,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      ringColor: 'ring-green-400',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#FF4500]/30 border-t-[#FF4500] rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400 text-lg font-mono tracking-widest">ESTABLISHING DATA LINK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-[Inter] pt-[120px] pb-16 relative overflow-hidden">
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-[0.15]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none"></div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-1">
                <span className="text-zinc-500">welcome</span>{' '}
                <span className="text-[#FF4500]">{user?.username}</span>
              </h1>
              <p className="text-zinc-600 text-sm uppercase tracking-[0.3em] font-medium">
                READY TO DOMINATE THE COMPETITIVE MATRIX.
              </p>
            </div>
            
            {showProfileAlert && (!user?.profilePicture || !user?.bio || !user?.primaryGame) && (
              <div className="relative">
                <button
                  onClick={() => { navigate('/settings'); setShowProfileAlert(false); }}
                  className="flex items-center gap-2 bg-[#FF4500] hover:bg-[#FF4500]/90 px-5 py-2.5 rounded-md font-semibold text-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  COMPLETE PROFILE
                </button>
                <button
                  onClick={() => setShowProfileAlert(false)}
                  className="absolute -top-2 -right-2 text-white hover:text-zinc-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {quickStats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 hover:border-zinc-800 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-zinc-600 text-xs uppercase tracking-[0.2em] mb-2 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
              </div>
              <p className="text-green-400 text-sm flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.change} gain
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDailyCheckIn}
              disabled={checkInLoading}
              className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 px-4 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50"
            >
              <Coins className="w-4 h-4" />
              {checkInLoading ? 'CHECKING...' : 'DAILY CHECK-IN'}
            </button>
            <button
              onClick={() => navigate('/players')}
              className="flex items-center gap-2 bg-[#FF4500]/10 hover:bg-[#FF4500]/20 border border-[#FF4500]/20 text-[#FF4500] px-4 py-2 rounded-md text-sm font-medium transition-all"
            >
              <Users className="w-4 h-4" />
              FIND TEAMS
            </button>
            <button
              onClick={() => navigate('/players')}
              className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 px-4 py-2 rounded-md text-sm font-medium transition-all"
            >
              <Target className="w-4 h-4" />
              SCOUT TALENT
            </button>
            <button
              onClick={() => navigate('/tournaments')}
              className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 px-4 py-2 rounded-md text-sm font-medium transition-all"
            >
              <Trophy className="w-4 h-4" />
              COMPETE NOW
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 px-4 py-2 rounded-md text-sm font-medium transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              MESSAGES
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Activity Feed (2 columns wide) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Activity Feed */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
              <div className="border-b border-zinc-900 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-300">
                    <Zap className="w-5 h-5 text-[#FF4500]" />
                    GLOBAL ACTIVITY STREAM
                  </h2>
                  <div className="flex gap-1 bg-black/50 rounded-md p-1">
                    {['feed', 'trending'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 rounded text-xs font-semibold uppercase transition-all ${
                          activeTab === tab
                            ? 'bg-[#FF4500] text-white'
                            : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-zinc-900">
                {activityFeed.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 hover:bg-zinc-900/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF4500] to-purple-600 flex items-center justify-center text-sm font-bold shrink-0">
                        {activity.user[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-300">
                          <span className="font-bold text-white">{activity.user}</span>
                          {' '}<span className="text-zinc-500">{activity.action}</span>{' '}
                          <span className="font-semibold text-[#FF4500]">{activity.target}</span>
                        </p>
                        <p className="text-xs text-zinc-600 mt-1">{activity.time}</p>
                      </div>
                      <button className="text-zinc-700 hover:text-[#FF4500] transition-colors opacity-0 group-hover:opacity-100">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 text-center border-t border-zinc-900">
                <button className="text-[#FF4500] hover:text-[#FF4500]/80 text-sm font-semibold flex items-center mx-auto gap-2 group">
                  VIEW ALL ACTIVITY
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Recruitment Matrix */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
              <div className="border-b border-zinc-900 p-5">
                <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-300">
                  <Target className="w-5 h-5 text-cyan-400" />
                  RECRUITMENT MATRIX
                </h2>
              </div>

              <div className="divide-y divide-zinc-900">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-4 hover:bg-zinc-900/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">{opp.role}</h3>
                          <span className="px-2 py-0.5 bg-[#FF4500]/20 border border-[#FF4500]/30 text-[#FF4500] text-xs font-semibold rounded">
                            {opp.game}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500">
                          {opp.org} • {opp.type} • {opp.posted}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate('/opportunities')}
                        className="bg-[#FF4500] hover:bg-[#FF4500]/90 px-4 py-2 rounded-md text-sm font-semibold transition-all"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 text-center border-t border-zinc-900">
                <button
                  onClick={() => navigate('/opportunities')}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold flex items-center mx-auto gap-2 group"
                >
                  BROWSE ALL OPPORTUNITIES
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Tournaments & Players */}
          <div className="space-y-6">
            
            {/* Upcoming Tournaments */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
              <div className="border-b border-zinc-900 p-5">
                <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-300">
                  <Gamepad2 className="w-5 h-5 text-purple-400" />
                  UPCOMING COMPETITIONS
                </h2>
              </div>

              <div className="p-4 space-y-3">
                {upcomingTournaments.length > 0 ? (
                  upcomingTournaments.map((tournament) => (
                    <div
                      key={tournament._id}
                      onClick={() => navigate(`/tournament/${tournament._id}`)}
                      className="bg-zinc-900/50 border border-zinc-900 rounded-lg p-4 hover:border-zinc-800 transition-colors cursor-pointer"
                    >
                      <h3 className="font-bold text-white mb-3 text-sm">{tournament.tournamentName}</h3>
                      <div className="space-y-2 text-xs text-zinc-500">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-purple-400" />
                          {new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="flex items-center gap-2">
                          <Trophy className="w-3 h-3 text-[#FF4500]" />
                          <span className="font-bold text-[#FF4500]">
                            {tournament.prizePool?.total ? `₹${tournament.prizePool.total.toLocaleString()}` : 'TBD'}
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Users className="w-3 h-3 text-cyan-400" />
                          {tournament.slots?.total || 0} teams
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/tournament/${tournament._id}`); }}
                        className="w-full mt-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 py-2 rounded-md text-xs font-semibold transition-all"
                      >
                        Register Now
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-zinc-800" />
                    <p className="text-sm text-zinc-600">No upcoming events</p>
                  </div>
                )}
              </div>

              <div className="p-4 text-center border-t border-zinc-900">
                <button
                  onClick={() => navigate('/tournaments')}
                  className="text-purple-400 hover:text-purple-300 text-sm font-semibold flex items-center mx-auto gap-2 group"
                >
                  VIEW ALL TOURNAMENTS
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Trending Players */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
              <div className="border-b border-zinc-900 p-5">
                <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-300">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  TOP GAINING PLAYERS
                </h2>
              </div>

              <div className="p-4 space-y-3">
                {trendingPlayers.map((player, idx) => (
                  <div
                    key={player.id}
                    onClick={() => navigate(`/players/${player.id}`)}
                    className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-900 rounded-lg p-3 hover:border-zinc-800 transition-colors cursor-pointer"
                  >
                    <div className="text-lg font-bold w-6 text-green-400">#{idx + 1}</div>
                    <div className="w-9 h-9 rounded-full bg-[#FF4500]/20 border border-[#FF4500]/30 flex items-center justify-center font-bold text-sm text-[#FF4500]">
                      {player.username[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm truncate">{player.username}</p>
                      <p className="text-xs text-zinc-600">{player.primaryGame}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-cyan-400 text-sm">{player.aegisRating}</p>
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> {player.trend}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 text-center border-t border-zinc-900">
                <button
                  onClick={() => navigate('/players')}
                  className="text-green-400 hover:text-green-300 text-sm font-semibold flex items-center mx-auto gap-2 group"
                >
                  VIEW GLOBAL RANKINGS
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Recent Matches */}
            {recentMatches.length > 0 && (
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
                <div className="border-b border-zinc-900 p-5">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-300">
                    <Activity className="w-5 h-5 text-[#FF4500]" />
                    MATCH HISTORY LOG
                  </h2>
                </div>

                <div className="p-4 space-y-3">
                  {recentMatches.map((match) => (
                    <div
                      key={match._id}
                      className="bg-zinc-900/50 border border-zinc-900 rounded-lg p-4 hover:border-zinc-800 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-600">{match.time || 'RECENTLY'}</span>
                        <span className="text-xs bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded font-semibold">
                          {match.map || 'MAP'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white font-bold truncate max-w-[35%]">{match.team1 || 'TEAM A'}</span>
                        <span className="text-[#FF4500] font-bold mx-2">{match.score || 'VS'}</span>
                        <span className="text-white font-bold truncate max-w-[35%]">{match.team2 || 'TEAM B'}</span>
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