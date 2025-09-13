import React, { useState } from 'react';
import BGMSlogo from '../assets/TournamentLogos/BGMS.png'
import BGMScover from '../assets/TournamentLogos/BGMScover.avif'
import {
  Calendar, MapPin, Users, Trophy, Clock, Gamepad2, Target, 
  TrendingUp, Award, Eye, Share2, MessageCircle, Star,
  ChevronRight, ExternalLink, Copy, Play, Pause, Volume2,
  Medal, Crown, Shield, Zap, Activity, BarChart3, Globe,
  CheckCircle, XCircle, AlertCircle, ArrowRight, Download,
  Twitch, Youtube, Twitter, Instagram, Hash
} from 'lucide-react';

const DetailedTournamentInfo = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedGroup, setSelectedGroup] = useState('A');

  // Mock tournament data
  const tournamentData = {
    id: 'bgmi-masters-s4',
    name: 'BGMI Masters Series Season 4',
    fullName: 'Battlegrounds Mobile India Masters Series Season 4',
    game: 'BGMI',
    region: 'India',
    organizer: 'Krafton India',
    status: 'Live',
    prizePool: 2500000,
    currency: 'INR',
    startDate: '2025-08-20',
    endDate: '2025-09-15',
    teams: 32,
    registeredTeams: 32,
    currentPhase: 'Group Stage',
    logo: BGMSlogo,
    banner: BGMScover,
    description: 'The most prestigious BGMI tournament in India featuring the top 32 teams competing for glory and a massive prize pool. Teams will battle through group stages, playoffs, and grand finals in this month-long championship.',
    format: '32 Teams → Group Stage → Playoffs → Grand Finals',
    venue: 'Online + LAN Finals (Mumbai)',
    platforms: ['Mobile', 'Emulator'],
    viewerCount: 2547891,
    peakViewers: 3124567,
    socialMedia: {
      twitch: 'bgmi_esports',
      youtube: 'BGMIEsportsOfficial',
      twitter: 'BGMIEsports',
      instagram: 'bgmi.esports'
    }
  };

  // Mock schedule data
  const scheduleData = {
    'Group Stage': [
      { date: '2025-08-20', time: '19:00', match: 'Group A - Round 1', teams: 'All Group A Teams', status: 'completed' },
      { date: '2025-08-21', time: '19:00', match: 'Group B - Round 1', teams: 'All Group B Teams', status: 'completed' },
      { date: '2025-08-22', time: '19:00', match: 'Group A - Round 2', teams: 'All Group A Teams', status: 'live' },
      { date: '2025-08-23', time: '19:00', match: 'Group B - Round 2', teams: 'All Group B Teams', status: 'upcoming' },
      { date: '2025-08-24', time: '19:00', match: 'Group A - Final', teams: 'Top 8 Group A', status: 'upcoming' }
    ],
    'Playoffs': [
      { date: '2025-09-01', time: '15:00', match: 'Quarterfinals 1', teams: 'TBD vs TBD', status: 'upcoming' },
      { date: '2025-09-01', time: '18:00', match: 'Quarterfinals 2', teams: 'TBD vs TBD', status: 'upcoming' },
      { date: '2025-09-02', time: '15:00', match: 'Semifinals 1', teams: 'TBD vs TBD', status: 'upcoming' },
      { date: '2025-09-02', time: '18:00', match: 'Semifinals 2', teams: 'TBD vs TBD', status: 'upcoming' }
    ],
    'Grand Finals': [
      { date: '2025-09-15', time: '16:00', match: 'Grand Final', teams: 'TBD vs TBD', status: 'upcoming' }
    ]
  };

  // Mock teams data
  const teamsData = {
    'A': [
      { name: 'Soul', rank: 1, points: 156, kills: 89, placement: 3.2, logo: 'https://placehold.co/60x60/FF6B6B/FFFFFF?text=S' },
      { name: 'TSM', rank: 2, points: 142, kills: 76, placement: 4.1, logo: 'https://placehold.co/60x60/4ECDC4/FFFFFF?text=T' },
      { name: 'GodLike', rank: 3, points: 128, kills: 82, placement: 5.8, logo: 'https://placehold.co/60x60/45B7D1/FFFFFF?text=G' },
      { name: 'OR', rank: 4, points: 115, kills: 71, placement: 6.2, logo: 'https://placehold.co/60x60/F7DC6F/FFFFFF?text=OR' }
    ],
    'B': [
      { name: 'Revenant', rank: 1, points: 149, kills: 85, placement: 3.8, logo: 'https://placehold.co/60x60/BB8FCE/FFFFFF?text=R' },
      { name: 'Blind Esports', rank: 2, points: 138, kills: 79, placement: 4.3, logo: 'https://placehold.co/60x60/85C1E9/FFFFFF?text=BE' },
      { name: 'Velocity Gaming', rank: 3, points: 125, kills: 73, placement: 5.5, logo: 'https://placehold.co/60x60/82E0AA/FFFFFF?text=VG' },
      { name: 'Team XO', rank: 4, points: 112, kills: 68, placement: 6.7, logo: 'https://placehold.co/60x60/F1948A/FFFFFF?text=XO' }
    ]
  };

  // Mock prize distribution
  const prizeDistribution = [
    { position: '1st Place', amount: 1000000, percentage: 40 },
    { position: '2nd Place', amount: 600000, percentage: 24 },
    { position: '3rd Place', amount: 400000, percentage: 16 },
    { position: '4th Place', amount: 250000, percentage: 10 },
    { position: '5th-8th Place', amount: 62500, percentage: 2.5 },
    { position: '9th-16th Place', amount: 31250, percentage: 1.25 }
  ];

  // Mock statistics
  const tournamentStats = {
    totalMatches: 156,
    completedMatches: 78,
    totalKills: 12456,
    averageKills: 159.7,
    longestGame: '32:45',
    shortestGame: '18:23',
    mostKillsInMatch: 34,
    chickenDinners: 78
  };

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

  const StatCard = ({ icon: Icon, label, value, sublabel, color = "orange" }) => (
    <div className={`bg-zinc-800/50 border border-${color}-400/30 rounded-xl p-4 shadow-lg shadow-${color}-500/10 hover:scale-105 transition-transform`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <div className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</div>
      <div className="text-zinc-400 text-sm">{label}</div>
      {sublabel && <div className="text-zinc-500 text-xs mt-1">{sublabel}</div>}
    </div>
  );

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      live: { color: 'red', text: 'Live', icon: Activity, pulse: true },
      completed: { color: 'green', text: 'Completed', icon: CheckCircle, pulse: false },
      upcoming: { color: 'blue', text: 'Upcoming', icon: Clock, pulse: false }
    };
    
    const config = statusConfig[status] || statusConfig.upcoming;
    const Icon = config.icon;
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-500/20 border border-${config.color}-500/30 text-${config.color}-400`}>
        <Icon className={`w-4 h-4 ${config.pulse ? 'animate-pulse' : ''}`} />
        {config.text}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px]">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header Section with Banner */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <img 
            src={tournamentData.banner} 
            alt="Tournament Banner"
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-6">
                <img 
                  src={tournamentData.logo} 
                  alt="Tournament Logo"
                  className="w-24 h-24 rounded-xl border-2 border-orange-400 shadow-lg"
                />
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <StatusBadge status={tournamentData.status.toLowerCase()} />
                    <span className="text-orange-400 font-medium">{tournamentData.currentPhase}</span>
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-2">{tournamentData.name}</h1>
                  <div className="flex flex-wrap items-center gap-6 text-zinc-300">
                    <span className="flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-orange-400" />
                      {tournamentData.game}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-400" />
                      {tournamentData.region}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-400" />
                      {new Date(tournamentData.startDate).toLocaleDateString()} - {new Date(tournamentData.endDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-400" />
                      {tournamentData.teams} Teams
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="p-3 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-lg transition-colors group">
                  <Share2 className="w-5 h-5 text-zinc-300 group-hover:text-orange-400" />
                </button>
                <button className="p-3 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-lg transition-colors group">
                  <MessageCircle className="w-5 h-5 text-zinc-300 group-hover:text-orange-400" />
                </button>
                <button className="p-3 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-lg transition-colors group">
                  <Star className="w-5 h-5 text-zinc-300 group-hover:text-orange-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <StatCard 
            icon={Trophy} 
            label="Prize Pool" 
            value={`₹${(tournamentData.prizePool / 100000).toFixed(1)}L`}
            sublabel={`${tournamentData.currency}`}
            color="green" 
          />
          <StatCard 
            icon={Eye} 
            label="Viewers" 
            value={`${(tournamentData.viewerCount / 1000000).toFixed(2)}M`}
            sublabel={`Peak: ${(tournamentData.peakViewers / 1000000).toFixed(2)}M`}
            color="purple" 
          />
          <StatCard 
            icon={Gamepad2} 
            label="Matches" 
            value={`${tournamentStats.completedMatches}/${tournamentStats.totalMatches}`}
            sublabel="Completed"
            color="blue" 
          />
          <StatCard 
            icon={Target} 
            label="Total Kills" 
            value={tournamentStats.totalKills.toLocaleString()}
            sublabel={`Avg: ${tournamentStats.averageKills}/match`}
            color="red" 
          />
          <StatCard 
            icon={Crown} 
            label="Chicken Dinners" 
            value={tournamentStats.chickenDinners}
            sublabel="Won matches"
            color="amber" 
          />
          <StatCard 
            icon={Clock} 
            label="Avg Game Time" 
            value="24:32"
            sublabel={`Range: ${tournamentStats.shortestGame}-${tournamentStats.longestGame}`}
            color="cyan" 
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
          <TabButton id="schedule" label="Schedule" isActive={activeTab === 'schedule'} onClick={setActiveTab} />
          <TabButton id="teams" label="Teams & Groups" isActive={activeTab === 'teams'} onClick={setActiveTab} />
          <TabButton id="results" label="Results" isActive={activeTab === 'results'} onClick={setActiveTab} />
          <TabButton id="statistics" label="Statistics" isActive={activeTab === 'statistics'} onClick={setActiveTab} />
          <TabButton id="streams" label="Live Streams" isActive={activeTab === 'streams'} onClick={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Tournament Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Tournament Information</h2>
                  <p className="text-zinc-300 mb-6 leading-relaxed">{tournamentData.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Organizer</span>
                          <span className="text-white font-medium">{tournamentData.organizer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Format</span>
                          <span className="text-white font-medium">{tournamentData.format}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Venue</span>
                          <span className="text-white font-medium">{tournamentData.venue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Platforms</span>
                          <span className="text-white font-medium">{tournamentData.platforms.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Prize Distribution</h3>
                      <div className="space-y-2">
                        {prizeDistribution.slice(0, 4).map((prize, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-zinc-800/50 rounded-lg">
                            <span className="text-zinc-300 text-sm">{prize.position}</span>
                            <span className="text-green-400 font-medium">₹{prize.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Match Info */}
                <div className="bg-zinc-900/50 border border-orange-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Activity className="w-6 h-6 text-red-400 animate-pulse" />
                      Live Now
                    </h2>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <Play className="w-4 h-4" />
                      Watch Live
                    </button>
                  </div>
                  
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-orange-400 font-medium">Group A - Round 2</span>
                      <span className="text-zinc-300 text-sm">Match 3 of 6</span>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="bg-zinc-700/50 rounded-lg p-3">
                        <div className="text-white font-bold">Soul</div>
                        <div className="text-orange-400 text-sm">1st • 24 Kills</div>
                      </div>
                      <div className="bg-zinc-700/50 rounded-lg p-3">
                        <div className="text-white font-bold">TSM</div>
                        <div className="text-zinc-400 text-sm">2nd • 18 Kills</div>
                      </div>
                      <div className="bg-zinc-700/50 rounded-lg p-3">
                        <div className="text-white font-bold">GodLike</div>
                        <div className="text-zinc-400 text-sm">3rd • 15 Kills</div>
                      </div>
                      <div className="bg-zinc-700/50 rounded-lg p-3">
                        <div className="text-white font-bold">OR</div>
                        <div className="text-zinc-400 text-sm">4th • 12 Kills</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media & Quick Links */}
              <div className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-orange-400" />
                    Follow Tournament
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center gap-3 p-3 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-600/30 transition-colors">
                      <Twitch className="w-5 h-5" />
                      <span className="font-medium">Twitch</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-600/30 transition-colors">
                      <Youtube className="w-5 h-5" />
                      <span className="font-medium">YouTube</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-600/30 transition-colors">
                      <Twitter className="w-5 h-5" />
                      <span className="font-medium">Twitter</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 bg-pink-600/20 border border-pink-500/30 rounded-lg text-pink-400 hover:bg-pink-600/30 transition-colors">
                      <Instagram className="w-5 h-5" />
                      <span className="font-medium">Instagram</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium px-4 py-3 rounded-lg transition-all transform hover:scale-105">
                      Watch Live Stream
                    </button>
                    <button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Bracket
                    </button>
                    <button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Copy className="w-4 h-4" />
                      Copy Tournament URL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Teams & Groups</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedGroup('A')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedGroup === 'A' ? 'bg-orange-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      Group A
                    </button>
                    <button 
                      onClick={() => setSelectedGroup('B')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedGroup === 'B' ? 'bg-orange-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      Group B
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Rank</th>
                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Team</th>
                        <th className="text-center py-3 px-4 text-zinc-400 font-medium">Points</th>
                        <th className="text-center py-3 px-4 text-zinc-400 font-medium">Kills</th>
                        <th className="text-center py-3 px-4 text-zinc-400 font-medium">Avg Placement</th>
                        <th className="text-center py-3 px-4 text-zinc-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamsData[selectedGroup].map((team, index) => (
                        <tr key={team.name} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                          <td className="py-4 px-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-amber-500 text-white' :
                              index === 1 ? 'bg-zinc-400 text-white' :
                              index === 2 ? 'bg-amber-600 text-white' :
                              'bg-zinc-600 text-white'
                            }`}>
                              {team.rank}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-lg" />
                              <span className="text-white font-medium">{team.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-orange-400 font-bold">{team.points}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-red-400 font-medium">{team.kills}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-zinc-300">{team.placement}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              index < 2 ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'
                            }`}>
                              {index < 2 ? 'Qualified' : 'Eliminated'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {Object.entries(scheduleData).map(([phase, matches]) => (
                <div key={phase} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">{phase}</h3>
                  <div className="space-y-3">
                    {matches.map((match, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-orange-500/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <StatusBadge status={match.status} />
                          <div>
                            <div className="text-white font-medium">{match.match}</div>
                            <div className="text-zinc-400 text-sm">{match.teams}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{new Date(match.date).toLocaleDateString()}</div>
                          <div className="text-zinc-400 text-sm">{match.time} IST</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Match Results</h2>
                
                <div className="space-y-4">
                  {/* Match Result Card */}
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Group A - Round 1 - Match 3</h3>
                        <p className="text-zinc-400 text-sm">Erangel • August 21, 2025</p>
                      </div>
                      <div className="text-green-400 font-bold">COMPLETED</div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-lg p-4 relative">
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">#1</div>
                        <div className="flex items-center gap-3 mb-2">
                          <img src="https://placehold.co/40x40/FF6B6B/FFFFFF?text=S" alt="Soul" className="w-10 h-10 rounded-lg" />
                          <span className="text-white font-bold">Team Soul</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-zinc-400">Kills:</span> <span className="text-orange-400 font-bold">18</span></div>
                          <div><span className="text-zinc-400">Points:</span> <span className="text-amber-400 font-bold">28</span></div>
                        </div>
                      </div>

                      <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 relative">
                        <div className="absolute -top-2 -right-2 bg-zinc-500 text-white text-xs font-bold px-2 py-1 rounded-full">#2</div>
                        <div className="flex items-center gap-3 mb-2">
                          <img src="https://placehold.co/40x40/4ECDC4/FFFFFF?text=T" alt="TSM" className="w-10 h-10 rounded-lg" />
                          <span className="text-white font-bold">TSM</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-zinc-400">Kills:</span> <span className="text-orange-400 font-bold">14</span></div>
                          <div><span className="text-zinc-400">Points:</span> <span className="text-zinc-400 font-bold">20</span></div>
                        </div>
                      </div>

                      <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 relative">
                        <div className="absolute -top-2 -right-2 bg-zinc-600 text-white text-xs font-bold px-2 py-1 rounded-full">#3</div>
                        <div className="flex items-center gap-3 mb-2">
                          <img src="https://placehold.co/40x40/45B7D1/FFFFFF?text=G" alt="GodLike" className="w-10 h-10 rounded-lg" />
                          <span className="text-white font-bold">GodLike</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-zinc-400">Kills:</span> <span className="text-orange-400 font-bold">12</span></div>
                          <div><span className="text-zinc-400">Points:</span> <span className="text-zinc-400 font-bold">15</span></div>
                        </div>
                      </div>

                      <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 relative">
                        <div className="absolute -top-2 -right-2 bg-zinc-600 text-white text-xs font-bold px-2 py-1 rounded-full">#4</div>
                        <div className="flex items-center gap-3 mb-2">
                          <img src="https://placehold.co/40x40/F7DC6F/FFFFFF?text=OR" alt="OR" className="w-10 h-10 rounded-lg" />
                          <span className="text-white font-bold">OR Esports</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-zinc-400">Kills:</span> <span className="text-orange-400 font-bold">9</span></div>
                          <div><span className="text-zinc-400">Points:</span> <span className="text-zinc-400 font-bold">12</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional match results would go here */}
                  <div className="text-center py-8">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                      Load More Results
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Tournament Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">{tournamentStats.totalKills.toLocaleString()}</div>
                    <div className="text-zinc-400 text-sm">Total Eliminations</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{tournamentStats.averageKills}</div>
                    <div className="text-zinc-400 text-sm">Avg Kills/Match</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{tournamentStats.mostKillsInMatch}</div>
                    <div className="text-zinc-400 text-sm">Most Kills (Single Match)</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-amber-400 mb-2">{tournamentStats.chickenDinners}</div>
                    <div className="text-zinc-400 text-sm">Chicken Dinners</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Top Performers</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                        <span className="text-white font-medium">ScoutOP (Soul)</span>
                      </div>
                      <span className="text-orange-400 font-bold">247 Kills</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-400 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                        <span className="text-white font-medium">Jonathan (TSM)</span>
                      </div>
                      <span className="text-orange-400 font-bold">231 Kills</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                        <span className="text-white font-medium">Clutchgod (GodLike)</span>
                      </div>
                      <span className="text-orange-400 font-bold">218 Kills</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Map Statistics</h2>
                <div className="space-y-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Erangel</span>
                      <span className="text-orange-400 font-bold">34 matches</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div className="bg-orange-400 h-2 rounded-full w-[85%]"></div>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-400 mt-1">
                      <span>Avg Duration: 26:42</span>
                      <span>85% of total</span>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Miramar</span>
                      <span className="text-orange-400 font-bold">28 matches</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div className="bg-orange-400 h-2 rounded-full w-[70%]"></div>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-400 mt-1">
                      <span>Avg Duration: 28:15</span>
                      <span>70% of total</span>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Sanhok</span>
                      <span className="text-orange-400 font-bold">16 matches</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div className="bg-orange-400 h-2 rounded-full w-[40%]"></div>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-400 mt-1">
                      <span>Avg Duration: 22:18</span>
                      <span>40% of total</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Game Mode Distribution</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">TPP (Third Person)</span>
                      <span className="text-green-400 font-bold">95%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">FPP (First Person)</span>
                      <span className="text-blue-400 font-bold">5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'streams' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Activity className="w-6 h-6 text-red-400 animate-pulse" />
                      Main Stream - Live
                    </h2>
                    <div className="flex items-center gap-2 text-red-400">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">{tournamentData.viewerCount.toLocaleString()} viewers</span>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-800 rounded-xl aspect-video flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                      <p className="text-zinc-400">Live Stream Player</p>
                      <p className="text-zinc-500 text-sm">Click to watch the tournament live</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Play className="w-4 h-4" />
                        Watch on Twitch
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Youtube className="w-4 h-4" />
                        Watch on YouTube
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
                        <Volume2 className="w-5 h-5 text-zinc-300" />
                      </button>
                      <button className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors">
                        <ExternalLink className="w-5 h-5 text-zinc-300" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Alternative Streams</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white font-medium">Hindi Commentary</span>
                      </div>
                      <p className="text-zinc-400 text-sm mb-3">Official Hindi stream with expert commentary</p>
                      <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors">
                        Watch on Twitch
                      </button>
                    </div>

                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white font-medium">Tamil Commentary</span>
                      </div>
                      <p className="text-zinc-400 text-sm mb-3">Regional commentary in Tamil language</p>
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors">
                        Watch on YouTube
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Stream Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Current Viewers</span>
                      <span className="text-purple-400 font-bold">{tournamentData.viewerCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Peak Viewers</span>
                      <span className="text-green-400 font-bold">{tournamentData.peakViewers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Stream Quality</span>
                      <span className="text-orange-400 font-bold">1080p 60fps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Stream Uptime</span>
                      <span className="text-blue-400 font-bold">4h 23m</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
                  <div className="space-y-3">
                    <button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Hash className="w-4 h-4" />
                      Join Discord
                    </button>
                    <button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Live Chat
                    </button>
                    <button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Mobile App
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedTournamentInfo;