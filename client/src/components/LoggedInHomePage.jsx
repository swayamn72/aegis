import React, { useState, useEffect, useRef } from 'react'; // Imported useRef
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Trophy, Users, Target, TrendingUp, Calendar, MessageSquare,
  Sparkles, Zap, Award, Activity, Gamepad2, ArrowRight, X, Coins
} from 'lucide-react';

// Mocked Auth Context for standalone display (KEPT FOR CANVAS RUNNABILITY)
const useAuth = () => ({
    user: { 
        username: 'ProPlayerX', 
        aegisRating: 2475, 
        statistics: { tournamentsPlayed: 8, winRate: 62 },
        profilePicture: 'placeholder.png', // Mock data
        bio: 'Competitive VALORANT IGL', // Mock data
        primaryGame: 'VALO' // Mock data
    }
});
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
  // Original function definitions and state hooks kept as is
  const navigate = (path) => console.log('Navigating to:', path);
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

  // FIX: Ref to ensure the initial data loading runs exactly once.
  const dataLoaded = useRef(false);

  useEffect(() => {
    // FIX: Decouple the data fetching/setting from the 'user' dependency logic
    // to prevent potential multiple re-runs if the user object reference changes slightly.
    // We only want the *content* to load once.

    const loadInitialData = () => {
      // FIX: Guard against multiple execution
      if (dataLoaded.current || !user) return;
      dataLoaded.current = true;
      
      try {
        // NOTE: We don't need to set loading to true here, as the component 
        // is already loading based on its initial state (loading=true).
        // Setting it true again immediately followed by false can contribute 
        // to the loop warning.

        // Populating Tournaments (formerly fetched)
        setUpcomingTournaments(mockData.tournaments.slice(0, 3));

        // Populating Connections (formerly fetched)
        setConnections(mockData.connections);

        // Populating Recent Matches (formerly fetched)
        setRecentMatches(mockData.matches);

        // Mock trending players (Original code already mocked this)
        setTrendingPlayers(mockData.trendingPlayers);

        // Populating Opportunities (Original code already mocked this)
        setOpportunities(mockData.opportunities);

        // Populating Activity Feed (Original code already mocked this)
        setActivityFeed(mockData.activityFeed);

        // Check for profile alert logic (original logic)
        if (!user?.profilePicture || !user?.bio || !user?.primaryGame) {
            setShowProfileAlert(true);
        }

      } catch (error) {
        console.error('Error setting dashboard data from mock:', error);
      } finally {
        // Set loading to false only after all state setters have finished
        setLoading(false);
      }
    };

    loadInitialData();
    
    // The dependency array is kept empty or minimal to respect the single-run intention
    // while checking for 'user' existence inside the function.
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
        await refreshUser(); // Refresh user data to update navbar
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
      textColor: 'text-[#FF4500]', // Primary Accent
      ringColor: 'ring-[#FF4500]',
    },
    {
      label: 'Tournaments',
      value: user?.statistics?.tournamentsPlayed || 0,
      change: '+3',
      icon: Trophy,
      bgColor: 'bg-cyan-500/10',
      textColor: 'text-cyan-400', // Secondary Accent 1
      ringColor: 'ring-cyan-400',
    },
    {
      label: 'Connections',
      value: connections.length || 0,
      change: `+${connections.filter(c => c.isRecent).length || 0}`,
      icon: Users,
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400', // Secondary Accent 2
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
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#FF4500]/30 border-t-[#FF4500] rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400 text-lg font-mono tracking-widest">ESTABLISHING DATA LINK...</p>
        </div>
      </div>
    );
  }

  // Ultra-dark, sharp-edged card wrapper
  const CardWrapper = ({ children, className = "" }) => (
    <div className={`bg-zinc-900 shadow-2xl shadow-black/80 rounded-2xl border border-zinc-800 transition-all duration-300 ${className}`}>
        {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020202] via-[#0a0a0a] to-[#020202] text-white font-[Inter] pt-[120px] pb-16">
      
      {/* Background Circuitry Effect */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#27272a" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        
        {/* Hero Section */}
        <div className="mb-12 border-b border-zinc-800/50 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-7xl font-black mb-2 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 drop-shadow-xl shadow-white/10">
                STATUS: <span className="text-[#FF4500] transition-colors hover:text-white">{user?.username}</span>
              </h1>
              <p className="text-zinc-500 text-lg font-mono tracking-widest uppercase">
                Ready to dominate the competitive matrix.
              </p>
            </div>
            {/* Profile Alert (Original logic preserved) */}
            {(!user?.profilePicture || !user?.bio || !user?.primaryGame) && (
              <div className="relative">
                  <button 
                    onClick={() => { navigate('/settings'); setShowProfileAlert(false); }}
                    className="flex items-center gap-3 bg-gradient-to-r from-[#FF4500] to-orange-600 px-7 py-3 rounded-full font-extrabold uppercase text-sm tracking-wider transition-all shadow-2xl shadow-[#FF4500]/50 transform hover:scale-[1.05] ring-4 ring-transparent hover:ring-[#FF4500]/30"
                  >
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    ACTIVATE PROFILE
                  </button>
                  <button 
                      onClick={() => setShowProfileAlert(false)}
                      className="absolute -top-1 -right-1 text-white/50 hover:text-white transition-colors p-1 rounded-full bg-black/80 border border-zinc-800"
                  >
                      <X className="w-4 h-4" />
                  </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Grid - High-Tech Readouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {quickStats.map((stat, idx) => (
            <div key={idx} className={`relative p-5 rounded-xl group overflow-hidden 
                bg-zinc-900/70 border border-zinc-800 transition-all duration-300
                hover:border-[#FF4500] hover:scale-[1.01] shadow-xl shadow-black/50`}>
                
                {/* Visualizer Bar Effect */}
                <div className={`absolute bottom-0 left-0 h-1 w-full ${stat.textColor.replace('text-', 'bg-')}/50 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                {/* <div className={`absolute bottom-0 left-0 h-1 w-[${Math.min(stat.value / 25, 100)}%] ${stat.textColor.replace('text-', 'bg-')} transition-all duration-1000 ease-out`}></div> */}

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2 font-mono">{stat.label}</p>
                    <p className="text-4xl font-extrabold tracking-tighter mb-1">{stat.value}</p>
                    <span className="text-green-400 text-sm flex items-center gap-1 font-mono">
                      <TrendingUp className="w-4 h-4" />
                      {stat.change} gain
                    </span>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor} ring-2 ${stat.ringColor}/30 transition-all duration-300 group-hover:ring-4 group-hover:ring-offset-2 group-hover:ring-offset-zinc-900`}>
                    <stat.icon className={`w-7 h-7 ${stat.textColor} transform group-hover:rotate-12`} />
                  </div>
                </div>
            </div>
          ))}
        </div>

        {/* Quick Action Buttons - Neon Segmented */}
        <div className="flex flex-wrap gap-4 mb-16 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 shadow-inner shadow-black/50">
          <button
            onClick={handleDailyCheckIn}
            disabled={checkInLoading}
            className="flex items-center gap-2 bg-black/50 px-5 py-2.5 rounded-lg border border-green-500/50 text-green-400 hover:bg-green-500 hover:text-black transition-all font-semibold uppercase text-sm tracking-widest shadow-lg shadow-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Coins className="w-5 h-5" />
            {checkInLoading ? 'CHECKING...' : 'DAILY CHECK-IN'}
          </button>
          <button
            onClick={() => navigate('/players')}
            className="flex items-center gap-2 bg-black/50 px-5 py-2.5 rounded-lg border border-[#FF4500]/50 text-[#FF4500] hover:bg-[#FF4500] hover:text-black transition-all font-semibold uppercase text-sm tracking-widest shadow-lg shadow-black/30"
          >
            <Users className="w-5 h-5" />
            FIND TEAMS
          </button>
          <button
            onClick={() => navigate('/players')}
            className="flex items-center gap-2 bg-black/50 px-5 py-2.5 rounded-lg border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all font-semibold uppercase text-sm tracking-widest shadow-lg shadow-black/30"
          >
            <Target className="w-5 h-5" />
            SCOUT TALENT
          </button>
          <button
            onClick={() => navigate('/tournaments')}
            className="flex items-center gap-2 bg-black/50 px-5 py-2.5 rounded-lg border border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white transition-all font-semibold uppercase text-sm tracking-widest shadow-lg shadow-black/30"
          >
            <Trophy className="w-5 h-5" />
            COMPETE NOW
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2 bg-black/50 px-5 py-2.5 rounded-lg border border-zinc-600/50 text-zinc-400 hover:bg-zinc-700/80 transition-all font-semibold uppercase text-sm tracking-widest shadow-lg shadow-black/30"
          >
            <MessageSquare className="w-5 h-5" />
            MESSAGES
          </button>
        </div>


        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Main Feed & Opportunities) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Activity Feed */}
            <CardWrapper>
              <div className="p-6 border-b border-zinc-800 bg-zinc-800/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 drop-shadow-md">
                    <Zap className="w-7 h-7 text-[#FF4500] drop-shadow-lg" />
                    GLOBAL ACTIVITY STREAM
                  </h2>
                  {/* Tab Navigation - Tactical Look */}
                  <div className="flex gap-1 p-1 bg-black rounded-lg border border-zinc-700 shadow-inner shadow-black/50">
                    {['feed', 'trending'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                          activeTab === tab
                            ? 'bg-gradient-to-r from-[#FF4500] to-orange-600 text-white shadow-md shadow-[#FF4500]/30'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-zinc-800">
                {activityFeed.map((activity) => (
                  <div key={activity.id} className="p-5 hover:bg-zinc-800/70 transition-colors cursor-pointer border-l-4 border-transparent hover:border-l-4 hover:border-l-[#FF4500] group">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF4500] to-purple-600 flex items-center justify-center text-lg font-black shrink-0 ring-2 ring-zinc-800">
                        {activity.user[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-200 text-lg">
                          <span className="font-extrabold text-white group-hover:text-cyan-400 transition-colors">{activity.user}</span>
                          {' '}<span className="text-zinc-400">{activity.action}</span>{' '}
                          <span className="font-bold text-[#FF4500]">{activity.target}</span>
                        </p>
                        <p className="text-zinc-600 text-sm mt-1 flex items-center gap-1 font-mono">
                            <Activity className="w-3 h-3 text-zinc-700"/> {activity.time}
                        </p>
                      </div>
                      <button className="text-zinc-600 hover:text-[#FF4500] transition-colors p-2 rounded-full hover:bg-zinc-800">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 text-center border-t border-zinc-800 bg-zinc-900/50">
                <button className="text-[#FF4500] hover:text-orange-300 font-bold text-base flex items-center mx-auto gap-2 group uppercase tracking-widest">
                  VIEW ALL ACTIVITY <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </CardWrapper>

            {/* Opportunities */}
            <CardWrapper>
              <div className="p-6 border-b border-zinc-800 bg-zinc-800/50">
                <h2 className="text-3xl font-black flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-md">
                  <Target className="w-7 h-7 text-cyan-400 drop-shadow-lg" />
                  RECRUITMENT MATRIX
                </h2>
              </div>

              <div className="divide-y divide-zinc-800">
                {opportunities.map((opp) => (
                  <div key={opp.id} className="p-5 hover:bg-zinc-800/70 transition-colors border-l-4 border-transparent hover:border-l-cyan-400">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-extrabold text-xl text-white tracking-wide">{opp.role}</h3>
                          <span className="px-3 py-1 bg-[#FF4500]/20 border border-[#FF4500]/50 text-[#FF4500] text-xs font-bold rounded-full shadow-inner shadow-black/20 font-mono">
                            {opp.game}
                          </span>
                        </div>
                        <p className="text-zinc-500 text-sm font-medium">
                          <span className="text-zinc-300 font-semibold">{opp.org}</span> • {opp.type} • Posted {opp.posted}
                        </p>
                      </div>
                      <button 
                        onClick={() => { navigate('/opportunities'); /* Original apply logic */ }}
                        className="flex-shrink-0 bg-gradient-to-r from-[#FF4500] to-orange-600 hover:from-orange-600 hover:to-orange-700 px-6 py-2.5 rounded-lg font-bold tracking-wider transition-all shadow-lg shadow-[#FF4500]/30 transform hover:scale-[1.05] uppercase text-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 text-center border-t border-zinc-800 bg-zinc-900/50">
                <button 
                  onClick={() => navigate('/opportunities')}
                  className="text-cyan-400 hover:text-cyan-300 font-bold text-base flex items-center mx-auto gap-2 group uppercase tracking-widest"
                >
                  BROWSE ALL OPPORTUNITIES <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </CardWrapper>
          </div>

          {/* Right Column (Tournaments & Players) */}
          <div className="space-y-8">
            
            {/* Upcoming Tournaments */}
            <CardWrapper>
              <div className="p-5 border-b border-zinc-800 bg-zinc-800/50">
                <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                  <Gamepad2 className="w-6 h-6 text-purple-400" />
                  UPCOMING COMPETITIONS
                </h2>
              </div>

              <div className="p-4 space-y-3">
                {upcomingTournaments.length > 0 ? upcomingTournaments.map((tournament) => (
                  <div 
                    key={tournament._id} 
                    onClick={() => navigate(`/tournaments/${tournament._id}`)}
                    className="bg-zinc-800/60 rounded-xl p-4 hover:bg-zinc-800/80 transition-colors border-l-4 border-purple-500/30 cursor-pointer shadow-md shadow-black/30"
                  >
                    <h3 className="font-extrabold text-lg text-white mb-2 tracking-tight truncate">{tournament.tournamentName}</h3>
                    <div className="space-y-1 text-sm text-zinc-500 font-mono">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        DATE: <span className="text-zinc-300">{new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[#FF4500]" />
                        PRIZE: <span className='font-extrabold text-[#FF4500] tracking-wide'>{tournament.prizePool?.total ? `₹${tournament.prizePool.total.toLocaleString()}` : 'TBD'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        SLOTS: <span className="text-zinc-300">{tournament.slots?.total || 0} teams</span>
                      </p>
                    </div>
                    <button 
                       onClick={(e) => { e.stopPropagation(); /* Original registration logic here */ }}
                       className="w-full mt-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 py-2 rounded-lg text-sm font-bold transition-colors shadow-inner shadow-black/20 uppercase">
                      Register Now
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-8 text-zinc-600">
                    <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30 text-purple-600" />
                    <p className="text-base font-mono">NO UPCOMING EVENTS IN SECTOR.</p>
                  </div>
                )}
              </div>

              <div className="p-4 text-center border-t border-zinc-800 bg-zinc-900/50">
                <button 
                  onClick={() => navigate('/tournaments')}
                  className="text-purple-400 hover:text-purple-300 font-bold text-sm flex items-center mx-auto gap-2 group uppercase tracking-widest"
                >
                  VIEW ALL TOURNAMENTS <ArrowRight className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </CardWrapper>

            {/* Trending Players */}
            <CardWrapper>
              <div className="p-5 border-b border-zinc-800 bg-zinc-800/50">
                <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  TOP GAINING PLAYERS
                </h2>
              </div>

              <div className="p-4 space-y-3">
                {trendingPlayers.map((player, idx) => (
                  <div 
                    key={player.id} 
                    onClick={() => navigate(`/players/${player.id}`)}
                    className="flex items-center gap-4 bg-zinc-800/60 rounded-xl p-3 hover:bg-zinc-800/80 transition-colors cursor-pointer border-l-4 border-zinc-700/30 hover:border-l-green-400"
                  >
                    <div className="text-2xl font-black w-6 text-green-400">#{idx + 1}</div>
                    
                    <div className="w-10 h-10 rounded-full bg-[#FF4500]/20 border-2 border-[#FF4500]/50 flex items-center justify-center font-bold shrink-0 text-[#FF4500] ring-1 ring-zinc-800">
                      {player.username[0]}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate text-base tracking-wider">{player.username}</p>
                      <p className="text-xs text-zinc-500 font-mono">{player.primaryGame}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-extrabold text-lg text-cyan-400 tracking-tight">{player.aegisRating}</p>
                      <p className="text-xs text-green-400 flex items-center justify-end gap-1 font-semibold">
                        <TrendingUp className="w-3 h-3" /> {player.trend}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 text-center border-t border-zinc-800 bg-zinc-900/50">
                <button 
                  onClick={() => navigate('/players')}
                  className="text-green-400 hover:text-green-300 font-bold text-sm flex items-center mx-auto gap-2 group uppercase tracking-widest"
                >
                  VIEW GLOBAL RANKINGS <ArrowRight className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </CardWrapper>

            {/* Recent Matches - Technical Data Box */}
            {recentMatches.length > 0 && (
              <CardWrapper>
                <div className="p-5 border-b border-zinc-800 bg-zinc-800/50">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Activity className="w-5 h-5 text-[#FF4500]" />
                    MATCH HISTORY LOG
                  </h2>
                </div>

                <div className="p-4 space-y-3">
                  {recentMatches.map((match) => (
                    <div key={match._id} className="bg-zinc-800/60 rounded-lg p-4 hover:bg-zinc-800/80 transition-colors border-l-4 border-cyan-500/30 shadow-md shadow-black/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-zinc-500">{match.time || 'RECENTLY'}</span>
                        <span className="text-xs bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-2.5 py-0.5 rounded-full font-semibold font-mono">
                          {match.map || 'MAP'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-lg">
                        <span className="text-white truncate max-w-[35%] font-extrabold">{match.team1 || 'TEAM A'}</span>
                        <span className="text-[#FF4500] font-extrabold tracking-widest mx-2 text-xl font-mono">{match.score || 'VS'}</span>
                        <span className="text-white truncate max-w-[35%] font-extrabold">{match.team2 || 'TEAM B'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardWrapper>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoggedInHomepage;
