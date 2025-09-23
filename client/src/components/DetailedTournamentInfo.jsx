import React, { useState } from 'react';
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

  // Tournament data based on refined schema
  const tournamentData = {
    id: 'bgmi-masters-s4',
    name: 'BGMI Masters Series Season 4',
    shortName: 'BGMS S4',
    game: 'BGMI',
    tier: 'S-Tier',
    region: 'India',
    organizer: {
      name: 'Krafton India',
      website: 'https://krafton.com',
      logo: 'https://placehold.co/40x40/FF6B6B/FFFFFF?text=K'
    },
    status: 'live',
    currentPhase: 'Group Stage',
    prizePool: {
      total: 2500000,
      currency: 'INR',
      distribution: [
        { position: '1st Place', amount: 1000000 },
        { position: '2nd Place', amount: 600000 },
        { position: '3rd Place', amount: 400000 },
        { position: '4th Place', amount: 250000 },
        { position: '5th-8th Place', amount: 62500 },
        { position: '9th-16th Place', amount: 31250 }
      ],
      individualAwards: [
        { award: 'MVP of the Tournament', amount: 100000, description: 'Most Valuable Player' },
        { award: 'Best IGL', amount: 75000, description: 'Best In-Game Leader' },
        { award: 'Highest Kills', amount: 50000, description: 'Player with most eliminations' },
        { award: 'Best Sniper', amount: 50000, description: 'Most sniper kills' },
        { award: 'Best Support Player', amount: 50000, description: 'Best supportive gameplay' },
        { award: 'Rising Star', amount: 25000, description: 'Best newcomer performance' }
      ]
    },
    startDate: '2025-08-20',
    endDate: '2025-09-15',
    teams: 32,
    registeredTeams: 32,
    format: '32 Teams → Group Stage → Playoffs → Grand Finals',
    venue: 'Online + LAN Finals (Mumbai)',
    platforms: ['Mobile', 'Emulator'],
    media: {
      logo: 'https://placehold.co/100x100/FF6B6B/FFFFFF?text=BGMS',
      banner: 'https://placehold.co/1200x320/1a1a2e/FFFFFF?text=BGMI+Masters+Series+S4',
      thumbnail: 'https://placehold.co/400x300/FF6B6B/FFFFFF?text=BGMS'
    },
    description: 'The most prestigious BGMI tournament in India featuring the top 32 teams competing for glory and a massive prize pool. Teams will battle through group stages, playoffs, and grand finals in this month-long championship.',
    viewership: {
      currentViewers: 2547891,
      peakViewers: 3124567,
      totalViews: 15678432,
      averageViewers: 1892345
    },
    socialMedia: {
      twitch: 'bgmi_esports',
      youtube: 'BGMIEsportsOfficial',
      twitter: 'BGMIEsports',
      instagram: 'bgmi.esports',
      discord: 'bgmi-esports'
    },
    gameSettings: {
      mode: 'TPP Squad',
      maps: ['Erangel', 'Miramar', 'Sanhok'],
      serverRegion: 'Asia',
      pointsSystem: {
        killPoints: 1,
        placementPoints: {
          1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1
        }
      }
    },
    phases: [
      {
        name: 'Group Stage',
        type: 'group_stage',
        startDate: '2025-08-20',
        endDate: '2025-08-30',
        status: 'live',
        description: 'Round-robin format within groups'
      },
      {
        name: 'Playoffs',
        type: 'elimination_stage',
        startDate: '2025-09-01',
        endDate: '2025-09-10',
        status: 'upcoming',
        description: 'Top 16 teams compete in elimination matches'
      },
      {
        name: 'Grand Finals',
        type: 'grand_finals',
        startDate: '2025-09-15',
        endDate: '2025-09-15',
        status: 'upcoming',
        description: 'Final 8 teams battle for championship'
      }
    ]
  };

  // Schedule data matching schema structure
  const scheduleData = [
    { 
      date: '2025-08-20', 
      time: '19:00', 
      phase: 'Group Stage',
      match: 'Group A - Round 1', 
      teams: 'All Group A Teams', 
      status: 'completed',
      streamUrl: 'https://youtube.com/watch?v=bgms1'
    },
    { 
      date: '2025-08-21', 
      time: '19:00', 
      phase: 'Group Stage',
      match: 'Group B - Round 1', 
      teams: 'All Group B Teams', 
      status: 'completed',
      streamUrl: 'https://youtube.com/watch?v=bgms2'
    },
    { 
      date: '2025-08-22', 
      time: '19:00', 
      phase: 'Group Stage',
      match: 'Group A - Round 2', 
      teams: 'All Group A Teams', 
      status: 'live',
      streamUrl: 'https://youtube.com/watch?v=bgms3'
    },
    { 
      date: '2025-08-23', 
      time: '19:00', 
      phase: 'Group Stage',
      match: 'Group B - Round 2', 
      teams: 'All Group B Teams', 
      status: 'upcoming',
      streamUrl: 'https://youtube.com/watch?v=bgms4'
    },
    { 
      date: '2025-08-24', 
      time: '19:00', 
      phase: 'Group Stage',
      match: 'Group A - Final', 
      teams: 'Top 8 Group A', 
      status: 'upcoming',
      streamUrl: 'https://youtube.com/watch?v=bgms5'
    },
    { 
      date: '2025-09-01', 
      time: '15:00', 
      phase: 'Playoffs',
      match: 'Quarterfinals 1', 
      teams: 'TBD vs TBD', 
      status: 'upcoming',
      streamUrl: 'https://youtube.com/watch?v=bgms6'
    },
    { 
      date: '2025-09-01', 
      time: '18:00', 
      phase: 'Playoffs',
      match: 'Quarterfinals 2', 
      teams: 'TBD vs TBD', 
      status: 'upcoming',
      streamUrl: 'https://youtube.com/watch?v=bgms7'
    },
    { 
      date: '2025-09-02', 
      time: '15:00', 
      phase: 'Playoffs',
      match: 'Semifinals 1', 
      teams: 'TBD vs TBD', 
      status: 'upcoming',
      streamUrl: 'https://youtube.com/watch?v=bgms8'
    },
    { 
      date: '2025-09-02', 
      time: '18:00', 
      phase: 'Playoffs',
      match: 'Semifinals 2', 
      teams: 'TBD vs TBD', 
      status: 'upcoming',
      streamUrl: 'https://youtube.com/watch?v=bgms9'
    },
    { 
      date: '2025-09-15', 
      time: '16:00', 
      phase: 'Grand Finals',
      match: 'Grand Final', 
      teams: 'TBD vs TBD', 
      status: 'upcoming',
      streamUrl: 'https://youtube.com/watch?v=bgms10'
    }
  ];

  // Groups data matching schema structure
  const groupsData = {
    'A': {
      name: 'Group A',
      standings: [
        { 
          rank: 1,
          team: { name: 'Soul', logo: 'https://placehold.co/60x60/FF6B6B/FFFFFF?text=S' },
          points: 156, 
          kills: 89, 
          averagePlacement: 3.2, 
          matchesPlayed: 12,
          chickenDinners: 4,
          isQualified: true
        },
        { 
          rank: 2,
          team: { name: 'TSM', logo: 'https://placehold.co/60x60/4ECDC4/FFFFFF?text=T' },
          points: 142, 
          kills: 76, 
          averagePlacement: 4.1, 
          matchesPlayed: 12,
          chickenDinners: 3,
          isQualified: true
        },
        { 
          rank: 3,
          team: { name: 'GodLike', logo: 'https://placehold.co/60x60/45B7D1/FFFFFF?text=G' },
          points: 128, 
          kills: 82, 
          averagePlacement: 5.8, 
          matchesPlayed: 12,
          chickenDinners: 2,
          isQualified: false
        },
        { 
          rank: 4,
          team: { name: 'OR', logo: 'https://placehold.co/60x60/F7DC6F/FFFFFF?text=OR' },
          points: 115, 
          kills: 71, 
          averagePlacement: 6.2, 
          matchesPlayed: 12,
          chickenDinners: 2,
          isQualified: false
        }
      ]
    },
    'B': {
      name: 'Group B',
      standings: [
        { 
          rank: 1,
          team: { name: 'Revenant', logo: 'https://placehold.co/60x60/BB8FCE/FFFFFF?text=R' },
          points: 149, 
          kills: 85, 
          averagePlacement: 3.8, 
          matchesPlayed: 12,
          chickenDinners: 3,
          isQualified: true
        },
        { 
          rank: 2,
          team: { name: 'Blind Esports', logo: 'https://placehold.co/60x60/85C1E9/FFFFFF?text=BE' },
          points: 138, 
          kills: 79, 
          averagePlacement: 4.3, 
          matchesPlayed: 12,
          chickenDinners: 2,
          isQualified: true
        },
        { 
          rank: 3,
          team: { name: 'Velocity Gaming', logo: 'https://placehold.co/60x60/82E0AA/FFFFFF?text=VG' },
          points: 125, 
          kills: 73, 
          averagePlacement: 5.5, 
          matchesPlayed: 12,
          chickenDinners: 2,
          isQualified: false
        },
        { 
          rank: 4,
          team: { name: 'Team XO', logo: 'https://placehold.co/60x60/F1948A/FFFFFF?text=XO' },
          points: 112, 
          kills: 68, 
          averagePlacement: 6.7, 
          matchesPlayed: 12,
          chickenDinners: 1,
          isQualified: false
        }
      ]
    }
  };

  // Tournament statistics matching schema
  const tournamentStats = {
    totalMatches: 156,
    completedMatches: 78,
    totalKills: 12456,
    totalDamage: 45678234,
    averageKills: 159.7,
    longestMatch: 32.45,
    shortestMatch: 18.23,
    chickenDinners: 78,
    averageMatchDuration: 24.5,
    mostKillsInMatch: {
      count: 34,
      player: 'ScoutOP',
      team: 'Soul',
      match: 'Group A Round 3 Match 2'
    },
    highestDamageInMatch: {
      amount: 4567,
      player: 'Jonathan',
      team: 'TSM',
      match: 'Group A Round 2 Match 1'
    },
    mapStats: [
      {
        mapName: 'Erangel',
        timesPlayed: 34,
        averageDuration: 26.7,
        averageKills: 165
      },
      {
        mapName: 'Miramar',
        timesPlayed: 28,
        averageDuration: 28.2,
        averageKills: 142
      },
      {
        mapName: 'Sanhok',
        timesPlayed: 16,
        averageDuration: 22.3,
        averageKills: 178
      }
    ]
  };

  // Stream links matching schema
  const streamLinks = [
    {
      platform: 'YouTube',
      url: 'https://youtube.com/bgmi-esports',
      title: 'Official English Stream',
      language: 'English',
      commentaryType: 'Official',
      isMain: true,
      isLive: true,
      viewers: 1547832
    },
    {
      platform: 'Twitch',
      url: 'https://twitch.tv/bgmi-esports',
      title: 'Official Hindi Stream',
      language: 'Hindi',
      commentaryType: 'Official',
      isMain: false,
      isLive: true,
      viewers: 892456
    },
    {
      platform: 'Loco',
      url: 'https://loco.gg/bgmi-masters',
      title: 'Regional Tamil Commentary',
      language: 'Tamil',
      commentaryType: 'Regional',
      isMain: false,
      isLive: true,
      viewers: 234567
    },
    {
      platform: 'Rooter',
      url: 'https://rooter.io/bgmi-masters',
      title: 'Community Stream',
      language: 'English',
      commentaryType: 'Community',
      isMain: false,
      isLive: false,
      viewers: 0
    }
  ];

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
            src={tournamentData.media.banner} 
            alt="Tournament Banner"
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-6">
                <img 
                  src={tournamentData.media.logo} 
                  alt="Tournament Logo"
                  className="w-24 h-24 rounded-xl border-2 border-orange-400 shadow-lg"
                />
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <StatusBadge status={tournamentData.status} />
                    <span className="text-orange-400 font-medium">{tournamentData.currentPhase}</span>
                    <span className="text-zinc-300 text-sm">{tournamentData.tier}</span>
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
            value={`₹${(tournamentData.prizePool.total / 100000).toFixed(1)}L`}
            sublabel={tournamentData.prizePool.currency}
            color="green" 
          />
          <StatCard 
            icon={Eye} 
            label="Current Viewers" 
            value={`${(tournamentData.viewership.currentViewers / 1000000).toFixed(2)}M`}
            sublabel={`Peak: ${(tournamentData.viewership.peakViewers / 1000000).toFixed(2)}M`}
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
            value={`${tournamentStats.averageMatchDuration}min`}
            sublabel={`Range: ${tournamentStats.shortestMatch}-${tournamentStats.longestMatch}min`}
            color="cyan" 
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
          <TabButton id="schedule" label="Schedule" isActive={activeTab === 'schedule'} onClick={setActiveTab} />
          <TabButton id="teams" label="Teams & Groups" isActive={activeTab === 'teams'} onClick={setActiveTab} />
          <TabButton id="results" label="Match Results" isActive={activeTab === 'results'} onClick={setActiveTab} />
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
                          <span className="text-white font-medium">{tournamentData.organizer.name}</span>
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
                          <span className="text-zinc-400">Game Mode</span>
                          <span className="text-white font-medium">{tournamentData.gameSettings.mode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Maps</span>
                          <span className="text-white font-medium">{tournamentData.gameSettings.maps.join(', ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Server</span>
                          <span className="text-white font-medium">{tournamentData.gameSettings.serverRegion}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Prize Distribution</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-zinc-400 mb-2">Team Prizes</h4>
                          <div className="space-y-2">
                            {tournamentData.prizePool.distribution.slice(0, 3).map((prize, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-zinc-800/50 rounded-lg">
                                <span className="text-zinc-300 text-sm">{prize.position}</span>
                                <span className="text-green-400 font-medium">₹{prize.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-zinc-400 mb-2">Individual Awards</h4>
                          <div className="space-y-2">
                            {tournamentData.prizePool.individualAwards.slice(0, 3).map((award, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-zinc-800/50 rounded-lg">
                                <div className="flex-1">
                                  <div className="text-zinc-300 text-sm font-medium">{award.award}</div>
                                  <div className="text-zinc-500 text-xs">{award.description}</div>
                                </div>
                                <span className="text-amber-400 font-medium">₹{award.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button className="mt-3 text-orange-400 text-sm hover:text-orange-300 transition-colors">
                        View full prize breakdown →
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Tournament Phases</h3>
                    <div className="space-y-3">
                      {tournamentData.phases.map((phase, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{phase.name}</span>
                              <StatusBadge status={phase.status} />
                            </div>
                            <div className="text-zinc-400 text-sm">{phase.description}</div>
                          </div>
                          <div className="text-zinc-300 text-sm">
                            {new Date(phase.startDate).toLocaleDateString()}
                            {phase.endDate !== phase.startDate && ` - ${new Date(phase.endDate).toLocaleDateString()}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Match Info */}
                <div className="bg-zinc-900/50 border border-orange-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Activity className="w-6 h-6 text-red-400 animate-pulse" />
                      Live Now - {tournamentData.currentPhase}
                    </h2>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                      <Play className="w-4 h-4" />
                      Watch Live
                    </button>
                  </div>
                  
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-orange-400 font-medium">Group A - Round 2</span>
                      <span className="text-zinc-300 text-sm">Match 3 of 6 • Erangel</span>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="bg-zinc-700/50 rounded-lg p-3">
                        <div className="text-white font-bold">Soul</div>
                        <div className="text-orange-400 text-sm">1st • 24 Kills</div>
                        <div className="text-zinc-500 text-xs">Alive</div>
                      </div>
                      <div className="bg-zinc-700/50 rounded-lg p-3">
                        <div className="text-white font-bold">TSM</div>
                        <div className="text-zinc-400 text-sm">2nd • 18 Kills</div>
                        <div className="text-zinc-500 text-xs">Alive</div>
                      </div>
                      <div className="bg-zinc-700/50 rounded-lg p-3">
                        <div className="text-white font-bold">GodLike</div>
                        <div className="text-zinc-400 text-sm">3rd • 15 Kills</div>
                        <div className="text-red-400 text-xs">Eliminated</div>
                      </div>
                      <div className="bg-zinc-700/50 rounded-lg p-3">
                        <div className="text-white font-bold">OR</div>
                        <div className="text-zinc-400 text-sm">4th • 12 Kills</div>
                        <div className="text-red-400 text-xs">Eliminated</div>
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
                    <button className="w-full flex items-center gap-3 p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-400 hover:bg-indigo-600/30 transition-colors">
                      <Hash className="w-5 h-5" />
                      <span className="font-medium">Discord</span>
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

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Points System</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Kill Points</span>
                      <span className="text-orange-400 font-bold">{tournamentData.gameSettings.pointsSystem.killPoints} per kill</span>
                    </div>
                    <div>
                      <div className="text-zinc-400 mb-2">Placement Points</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">#1:</span>
                          <span className="text-amber-400">{tournamentData.gameSettings.pointsSystem.placementPoints[1]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">#2:</span>
                          <span className="text-zinc-400">{tournamentData.gameSettings.pointsSystem.placementPoints[2]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">#3:</span>
                          <span className="text-zinc-400">{tournamentData.gameSettings.pointsSystem.placementPoints[3]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">#4:</span>
                          <span className="text-zinc-400">{tournamentData.gameSettings.pointsSystem.placementPoints[4]}</span>
                        </div>
                      </div>
                    </div>
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
                        <th className="text-center py-3 px-4 text-zinc-400 font-medium">Matches</th>
                        <th className="text-center py-3 px-4 text-zinc-400 font-medium">WWCDs</th>
                        <th className="text-center py-3 px-4 text-zinc-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupsData[selectedGroup].standings.map((team, index) => (
                        <tr key={team.team.name} className="border-b border-zinc-800 hover:bg-zinc-800/30">
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
                              <img src={team.team.logo} alt={team.team.name} className="w-10 h-10 rounded-lg" />
                              <span className="text-white font-medium">{team.team.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-orange-400 font-bold">{team.points}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-red-400 font-medium">{team.kills}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-zinc-300">{team.averagePlacement}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-zinc-300">{team.matchesPlayed}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-amber-400 font-medium">{team.chickenDinners}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              team.isQualified ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'
                            }`}>
                              {team.isQualified ? 'Qualified' : 'Competing'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
                  <h3 className="text-lg font-bold text-white mb-2">Qualification Rules</h3>
                  <p className="text-zinc-400 text-sm">
                    Top 2 teams from each group advance to the Playoffs. Teams are ranked by total points, 
                    with kills as the tiebreaker. Group stage consists of 12 matches per group.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Tournament Schedule</h2>
                
                {/* Group schedule by phases */}
                {tournamentData.phases.map((phase, phaseIndex) => (
                  <div key={phaseIndex} className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-white">{phase.name}</h3>
                      <StatusBadge status={phase.status} />
                      <span className="text-zinc-400 text-sm">
                        {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {scheduleData.filter(match => match.phase === phase.name).map((match, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-orange-500/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <StatusBadge status={match.status} />
                            <div>
                              <div className="text-white font-medium">{match.match}</div>
                              <div className="text-zinc-400 text-sm">{match.teams}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-white font-medium">{new Date(match.date).toLocaleDateString()}</div>
                              <div className="text-zinc-400 text-sm">{match.time} IST</div>
                            </div>
                            {match.streamUrl && (
                              <button className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                                <Play className="w-4 h-4 text-white" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Recent Match Results</h2>
                
                <div className="space-y-6">
                  {/* Match Result Card 1 */}
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Group A - Round 1 - Match 3</h3>
                        <p className="text-zinc-400 text-sm">Erangel • August 21, 2025 • 24:32 duration</p>
                      </div>
                      <StatusBadge status="completed" />
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
                          <div><span className="text-zinc-400">Damage:</span> <span className="text-purple-400 font-bold">3,245</span></div>
                          <div><span className="text-zinc-400">Survival:</span> <span className="text-green-400 font-bold">24:32</span></div>
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
                          <div><span className="text-zinc-400">Damage:</span> <span className="text-purple-400 font-bold">2,890</span></div>
                          <div><span className="text-zinc-400">Survival:</span> <span className="text-green-400 font-bold">23:15</span></div>
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
                          <div><span className="text-zinc-400">Points:</span> <span className="text-zinc-400 font-bold">17</span></div>
                          <div><span className="text-zinc-400">Damage:</span> <span className="text-purple-400 font-bold">2,456</span></div>
                          <div><span className="text-zinc-400">Survival:</span> <span className="text-green-400 font-bold">21:45</span></div>
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
                          <div><span className="text-zinc-400">Points:</span> <span className="text-zinc-400 font-bold">13</span></div>
                          <div><span className="text-zinc-400">Damage:</span> <span className="text-purple-400 font-bold">1,987</span></div>
                          <div><span className="text-zinc-400">Survival:</span> <span className="text-green-400 font-bold">19:23</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
                      <span>Total Eliminations: 53 • Most Kills: ScoutOP (Soul) - 6 kills</span>
                      <button className="text-orange-400 hover:text-orange-300 transition-colors">
                        View Full Match Details →
                      </button>
                    </div>
                  </div>

                  {/* Match Result Card 2 */}
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Group B - Round 1 - Match 2</h3>
                        <p className="text-zinc-400 text-sm">Miramar • August 20, 2025 • 26:45 duration</p>
                      </div>
                      <StatusBadge status="completed" />
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-lg p-4 relative">
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">#1</div>
                        <div className="flex items-center gap-3 mb-2">
                          <img src="https://placehold.co/40x40/BB8FCE/FFFFFF?text=R" alt="Revenant" className="w-10 h-10 rounded-lg" />
                          <span className="text-white font-bold">Revenant</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-zinc-400">Kills:</span> <span className="text-orange-400 font-bold">16</span></div>
                          <div><span className="text-zinc-400">Points:</span> <span className="text-amber-400 font-bold">26</span></div>
                          <div><span className="text-zinc-400">Damage:</span> <span className="text-purple-400 font-bold">3,567</span></div>
                          <div><span className="text-zinc-400">Survival:</span> <span className="text-green-400 font-bold">26:45</span></div>
                        </div>
                      </div>

                      <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 relative">
                        <div className="absolute -top-2 -right-2 bg-zinc-500 text-white text-xs font-bold px-2 py-1 rounded-full">#2</div>
                        <div className="flex items-center gap-3 mb-2">
                          <img src="https://placehold.co/40x40/85C1E9/FFFFFF?text=BE" alt="Blind" className="w-10 h-10 rounded-lg" />
                          <span className="text-white font-bold">Blind Esports</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-zinc-400">Kills:</span> <span className="text-orange-400 font-bold">13</span></div>
                          <div><span className="text-zinc-400">Points:</span> <span className="text-zinc-400 font-bold">19</span></div>
                          <div><span className="text-zinc-400">Damage:</span> <span className="text-purple-400 font-bold">2,734</span></div>
                          <div><span className="text-zinc-400">Survival:</span> <span className="text-green-400 font-bold">25:12</span></div>
                        </div>
                      </div>

                      <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 relative">
                        <div className="absolute -top-2 -right-2 bg-zinc-600 text-white text-xs font-bold px-2 py-1 rounded-full">#3</div>
                        <div className="flex items-center gap-3 mb-2">
                          <img src="https://placehold.co/40x40/82E0AA/FFFFFF?text=VG" alt="Velocity" className="w-10 h-10 rounded-lg" />
                          <span className="text-white font-bold">Velocity Gaming</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-zinc-400">Kills:</span> <span className="text-orange-400 font-bold">11</span></div>
                          <div><span className="text-zinc-400">Points:</span> <span className="text-zinc-400 font-bold">16</span></div>
                          <div><span className="text-zinc-400">Damage:</span> <span className="text-purple-400 font-bold">2,123</span></div>
                          <div><span className="text-zinc-400">Survival:</span> <span className="text-green-400 font-bold">22:34</span></div>
                        </div>
                      </div>

                      <div className="bg-zinc-700/30 border border-zinc-600 rounded-lg p-4 relative">
                        <div className="absolute -top-2 -right-2 bg-zinc-600 text-white text-xs font-bold px-2 py-1 rounded-full">#4</div>
                        <div className="flex items-center gap-3 mb-2">
                          <img src="https://placehold.co/40x40/F1948A/FFFFFF?text=XO" alt="XO" className="w-10 h-10 rounded-lg" />
                          <span className="text-white font-bold">Team XO</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-zinc-400">Kills:</span> <span className="text-orange-400 font-bold">8</span></div>
                          <div><span className="text-zinc-400">Points:</span> <span className="text-zinc-400 font-bold">12</span></div>
                          <div><span className="text-zinc-400">Damage:</span> <span className="text-purple-400 font-bold">1,876</span></div>
                          <div><span className="text-zinc-400">Survival:</span> <span className="text-green-400 font-bold">20:45</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
                      <span>Total Eliminations: 48 • Most Kills: Owais (Revenant) - 7 kills</span>
                      <button className="text-orange-400 hover:text-orange-300 transition-colors">
                        View Full Match Details →
                      </button>
                    </div>
                  </div>

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
                    <div className="text-3xl font-bold text-purple-400 mb-2">{tournamentStats.averageMatchDuration}min</div>
                    <div className="text-zinc-400 text-sm">Avg Match Duration</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-amber-400 mb-2">{tournamentStats.chickenDinners}</div>
                    <div className="text-zinc-400 text-sm">Chicken Dinners</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-red-400 mb-2">{tournamentStats.mostKillsInMatch.count}</div>
                    <div className="text-zinc-400 text-sm">Most Kills (Single Match)</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-cyan-400 mb-2">{(tournamentStats.totalDamage / 1000000).toFixed(1)}M</div>
                    <div className="text-zinc-400 text-sm">Total Damage</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Tournament Records</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-orange-400" />
                        <div>
                          <div className="text-white font-medium">Most Kills (Single Match)</div>
                          <div className="text-zinc-400 text-sm">{tournamentStats.mostKillsInMatch.player} ({tournamentStats.mostKillsInMatch.team})</div>
                        </div>
                      </div>
                      <span className="text-orange-400 font-bold">{tournamentStats.mostKillsInMatch.count} kills</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="text-white font-medium">Highest Damage (Single Match)</div>
                          <div className="text-zinc-400 text-sm">{tournamentStats.highestDamageInMatch.player} ({tournamentStats.highestDamageInMatch.team})</div>
                        </div>
                      </div>
                      <span className="text-purple-400 font-bold">{tournamentStats.highestDamageInMatch.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-green-400" />
                        <div>
                          <div className="text-white font-medium">Longest Match</div>
                          <div className="text-zinc-400 text-sm">Group A Round 2 - Erangel</div>
                        </div>
                      </div>
                      <span className="text-green-400 font-bold">{tournamentStats.longestMatch} min</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Top Kill Leaders</h3>
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
                    <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                        <span className="text-white font-medium">Owais (Revenant)</span>
                      </div>
                      <span className="text-orange-400 font-bold">204 Kills</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Map Statistics</h2>
                <div className="space-y-4">
                  {tournamentStats.mapStats.map((map, index) => (
                    <div key={index} className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{map.mapName}</span>
                        <span className="text-orange-400 font-bold">{map.timesPlayed} matches</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div 
                          className="bg-orange-400 h-2 rounded-full" 
                          style={{ width: `${(map.timesPlayed / tournamentStats.mapStats.reduce((sum, m) => sum + m.timesPlayed, 0)) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-zinc-400 mt-1">
                        <span>Avg Duration: {map.averageDuration}min</span>
                        <span>Avg Kills: {map.averageKills}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Game Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Mode</span>
                      <span className="text-green-400 font-bold">{tournamentData.gameSettings.mode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Server Region</span>
                      <span className="text-blue-400 font-bold">{tournamentData.gameSettings.serverRegion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Total Maps in Pool</span>
                      <span className="text-purple-400 font-bold">{tournamentData.gameSettings.maps.length}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Phase Progress</h3>
                  <div className="space-y-2">
                    {tournamentData.phases.map((phase, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                        <span className="text-zinc-300 text-sm">{phase.name}</span>
                        <StatusBadge status={phase.status} />
                      </div>
                    ))}
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
                      <span className="font-medium">{streamLinks[0].viewers.toLocaleString()} viewers</span>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-800 rounded-xl aspect-video flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                      <p className="text-zinc-400 text-lg font-medium">Live Stream Player</p>
                      <p className="text-zinc-500 text-sm">{tournamentData.name} - {tournamentData.currentPhase}</p>
                      <p className="text-zinc-600 text-xs mt-1">Group A Round 2 • Erangel • Match 3/6</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Play className="w-4 h-4" />
                        Watch on YouTube
                      </button>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Twitch className="w-4 h-4" />
                        Watch on Twitch
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
                  <div className="space-y-4">
                    {streamLinks.slice(1).map((stream, index) => (
                      <div key={index} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {stream.isLive && <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>}
                            {!stream.isLive && <div className="w-3 h-3 bg-zinc-500 rounded-full"></div>}
                            <span className="text-white font-medium">{stream.title}</span>
                          </div>
                          <span className="text-zinc-400 text-sm">
                            {stream.isLive ? `${stream.viewers.toLocaleString()} viewers` : 'Offline'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-zinc-400 text-sm">{stream.language} • {stream.commentaryType}</p>
                          <span className="text-zinc-500 text-xs">{stream.platform}</span>
                        </div>
                        <button 
                          className={`w-full py-2 rounded-lg transition-colors font-medium ${
                            stream.isLive 
                              ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white' 
                              : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                          }`}
                          disabled={!stream.isLive}
                        >
                          {stream.isLive ? `Watch on ${stream.platform}` : 'Stream Offline'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Stream Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Current Viewers</span>
                      <span className="text-purple-400 font-bold">{tournamentData.viewership.currentViewers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Peak Viewers</span>
                      <span className="text-green-400 font-bold">{tournamentData.viewership.peakViewers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total Views</span>
                      <span className="text-blue-400 font-bold">{tournamentData.viewership.totalViews.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Avg Viewers</span>
                      <span className="text-cyan-400 font-bold">{tournamentData.viewership.averageViewers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Stream Quality</span>
                      <span className="text-orange-400 font-bold">1080p 60fps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total Streams</span>
                      <span className="text-amber-400 font-bold">{streamLinks.filter(s => s.isLive).length}/{streamLinks.length} Live</span>
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
                    <button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Tournament Stats
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Live Updates</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 animate-pulse"></div>
                      <div>
                        <span className="text-white font-medium">Live now:</span>
                        <span className="text-zinc-300"> Group A Round 2 Match 3 in progress</span>
                        <div className="text-zinc-500 text-xs">2 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <div>
                        <span className="text-white font-medium">Match completed:</span>
                        <span className="text-zinc-300"> Soul wins Group A Round 2 Match 2</span>
                        <div className="text-zinc-500 text-xs">45 minutes ago</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                      <div>
                        <span className="text-white font-medium">Record broken:</span>
                        <span className="text-zinc-300"> ScoutOP sets new kill record with 18 eliminations</span>
                        <div className="text-zinc-500 text-xs">1 hour ago</div>
                      </div>
                    </div>
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