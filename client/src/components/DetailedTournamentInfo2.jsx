import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Users, Trophy, Clock, Gamepad2, Target,
  TrendingUp, Award, Eye, Share2, MessageCircle, Star,
  ChevronRight, ExternalLink, Copy, Play, Pause, Volume2,
  Medal, Crown, Shield, Zap, Activity, BarChart3, Globe,
  CheckCircle, XCircle, AlertCircle, ArrowRight, Download,
  Twitch, Youtube, Twitter, Instagram, Hash, X, ChevronDown,
  ChevronUp
} from 'lucide-react';

const DetailedTournamentInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [selectedPhase, setSelectedPhase] = useState('');
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [tournamentData, setTournamentData] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [groupsData, setGroupsData] = useState({});
  const [tournamentStats, setTournamentStats] = useState(null);
  const [streamLinks, setStreamLinks] = useState([]);
  const [matchesData, setMatchesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Map images - you can update these paths later
  const mapImages = {
    'Erangel': '../assets/mapImages/erangel.jpg',
    'Miramar': '/assets/mapImages/erangel.jpg',
    'Sanhok': '/assets/mapImages/erangel.jpg',
    'Vikendi': '/assets/mapImages/erangel.jpg',
    'Livik': '/assets/mapImages/erangel.jpg',
    'Nusa': '/assets/mapImages/erangel.jpg',
    'Rondo': '/assets/mapImages/erangel.jpg',
  };

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/tournaments/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch tournament data: ${response.status}`);
        }
        
        const data = await response.json();
        
        setTournamentData(data.tournamentData);
        setScheduleData(data.scheduleData || []);
        setGroupsData(data.groupsData || {});
        setTournamentStats(data.tournamentStats);
        setStreamLinks(data.streamLinks || []);
        
        // Set default phase
        if (data.tournamentData?.phases?.length > 0) {
          const currentPhase = data.tournamentData.phases.find(p => p.status === 'in_progress') || 
                               data.tournamentData.phases[0];
          setSelectedPhase(currentPhase.name);
        }

        // Fetch matches data
        const matchesResponse = await fetch(`/api/matches/tournament/${id}`);
        if (matchesResponse.ok) {
          const matchesResult = await matchesResponse.json();
          setMatchesData(matchesResult.matches || []);
        }
        
      } catch (err) {
        console.error('Error fetching tournament data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTournamentData();
    }
  }, [id]);

  // Update selectedGroup when selectedPhase changes
  useEffect(() => {
    if (groupsData[selectedPhase]) {
      const availableGroups = Object.keys(groupsData[selectedPhase]);
      if (availableGroups.length > 0 && !availableGroups.includes(selectedGroup)) {
        setSelectedGroup(availableGroups[0]);
      }
    }
  }, [selectedPhase, groupsData, selectedGroup]);

  // Organize matches by phase
  const matchesByPhase = useMemo(() => {
    const organized = {};
    matchesData.forEach(match => {
      const phase = match.phase || 'General';
      if (!organized[phase]) {
        organized[phase] = [];
      }
      organized[phase].push(match);
    });
    
    // Sort matches within each phase by match number
    Object.keys(organized).forEach(phase => {
      organized[phase].sort((a, b) => a.matchNumber - b.matchNumber);
    });
    
    return organized;
  }, [matchesData]);

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
    <div className={`bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 shadow-lg hover:scale-105 transition-transform`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <div className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</div>
      <div className="text-zinc-400 text-sm">{label}</div>
      {sublabel && <div className="text-zinc-500 text-xs mt-1">{sublabel}</div>}
    </div>
  );

  const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
      const liveStatuses = ['in_progress', 'qualifiers_in_progress', 'group_stage', 'playoffs', 'finals'];
      const completedStatuses = ['completed'];
      const upcomingStatuses = ['announced', 'registration_open', 'registration_closed', 'scheduled'];
      
      if (liveStatuses.includes(status)) {
        return { color: 'red', text: 'Live', icon: Activity, pulse: true };
      } else if (completedStatuses.includes(status)) {
        return { color: 'green', text: 'Completed', icon: CheckCircle, pulse: false };
      } else if (upcomingStatuses.includes(status)) {
        return { color: 'blue', text: 'Upcoming', icon: Clock, pulse: false };
      } else {
        return { color: 'gray', text: 'Unknown', icon: AlertCircle, pulse: false };
      }
    };
    
    const config = getStatusConfig(status);
    const Icon = config.icon;
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-${config.color}-500/20 border border-${config.color}-500/30 text-${config.color}-400`}>
        <Icon className={`w-4 h-4 ${config.pulse ? 'animate-pulse' : ''}`} />
        {config.text}
      </div>
    );
  };

  const MatchCard = ({ match }) => {
    const mapImage = mapImages[match.map] || '/assets/maps/default.jpg';
    const winnerTeam = match.teams?.find(team => team.chickenDinner);
    
    const handleMatchClick = () => {
      navigate(`/matches/${match._id}`);
    };

    return (
      <div 
        onClick={handleMatchClick}
        className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 hover:bg-zinc-800/70 transition-all cursor-pointer hover:border-orange-500/50 group"
      >
        {/* Match Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {match.matchNumber}
            </div>
            <div>
              <div className="text-white font-medium">{match.phase}</div>
              <div className="text-zinc-400 text-sm">Match {match.matchNumber}</div>
            </div>
          </div>
          <StatusBadge status={match.status} />
        </div>

        {/* Map Image and Info */}
        <div className="flex gap-4 mb-3">
          <div className="relative">
            <img 
              src={mapImage}
              alt={match.map}
              className="w-20 h-16 rounded-lg object-cover"
              onError={(e) => {
                e.target.src = 'https://placehold.co/80x64/1a1a1a/ffffff?text=' + (match.map || 'MAP');
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
            <div className="absolute bottom-1 left-1 text-white text-xs font-medium">
              {match.map}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Teams:</span>
                <span className="text-white font-medium">{match.teams?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Kills:</span>
                <span className="text-red-400 font-medium">{match.stats?.totalKills || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Duration:</span>
                <span className="text-purple-400 font-medium">{match.duration || '--'}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Damage:</span>
                <span className="text-cyan-400 font-medium">
                  {match.stats?.totalDamage ? `${(match.stats.totalDamage / 1000).toFixed(1)}K` : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Winner Info */}
        {match.status === 'completed' && winnerTeam && (
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-medium text-sm">Chicken Dinner Winner</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {winnerTeam.logo && (
                <img 
                  src={winnerTeam.logo} 
                  alt={winnerTeam.name}
                  className="w-6 h-6 rounded object-cover"
                />
              )}
              <span className="text-white font-medium">{winnerTeam.name}</span>
              <span className="text-amber-400 text-sm">({winnerTeam.kills} kills)</span>
            </div>
          </div>
        )}

        {/* Top Teams Preview */}
        <div className="space-y-1">
          <div className="text-zinc-400 text-xs mb-2">Top Performers:</div>
          {match.teams?.slice(0, 3).map((team, index) => (
            <div key={team._id || index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-amber-500 text-white' :
                  index === 1 ? 'bg-zinc-400 text-white' :
                  'bg-amber-600 text-white'
                }`}>
                  {index + 1}
                </div>
                <span className="text-zinc-300">{team.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 font-medium">{team.kills}</span>
                <span className="text-orange-400 font-medium">{team.points}pts</span>
              </div>
            </div>
          ))}
        </div>

        {/* View Details Arrow */}
        <div className="flex justify-end mt-3 pt-2 border-t border-zinc-700">
          <div className="flex items-center gap-1 text-orange-400 text-sm group-hover:text-orange-300 transition-colors">
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  };

  const formatPrizePool = (prizePool) => {
    if (!prizePool || !prizePool.total || prizePool.total === 0) {
      return 'TBD';
    }
    
    const amount = prizePool.total;
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'TBD';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-zinc-400 text-lg">Loading tournament data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">Error loading tournament data</div>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!tournamentData) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">Tournament not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px]">
      <div className="container mx-auto px-6 py-8">

        {/* Header Section with Banner */}
        <div className="relative mb-8 rounded-2xl overflow-hidden">
          <img
            src={tournamentData?.media?.coverImage || tournamentData?.media?.banner || 'https://placehold.co/1200x400/1a1a1a/ffffff?text=Tournament+Banner'}
            alt="Tournament Banner"
            className="w-full h-80 object-cover"
            onError={(e) => {
              e.target.src = 'https://placehold.co/1200x400/1a1a1a/ffffff?text=Tournament+Banner';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />

          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-6">
                <img
                  src={tournamentData?.media?.logo || 'https://placehold.co/96x96/1a1a1a/ffffff?text=LOGO'}
                  alt="Tournament Logo"
                  className="w-24 h-24 rounded-xl border-2 border-orange-400 shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/96x96/1a1a1a/ffffff?text=LOGO';
                  }}
                />
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <StatusBadge status={tournamentData?.status} />
                    <span className="text-orange-400 font-medium">{tournamentData?.currentPhase || 'Tournament'}</span>
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-700/50 border border-zinc-500/30 rounded-md text-sm font-medium text-zinc-300">
                      {tournamentData?.tier ? `Tier ${tournamentData.tier}` : 'Tournament'}
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-2">{tournamentData?.name || 'Tournament Name'}</h1>
                  <div className="flex flex-wrap items-center gap-6 text-zinc-300">
                    <span className="flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-orange-400" />
                      {tournamentData?.game || 'Game'}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-400" />
                      {tournamentData?.region || 'Region'}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-400" />
                      {formatDate(tournamentData?.startDate)} - {formatDate(tournamentData?.endDate)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-400" />
                      {tournamentData?.teams || 0} Teams
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
            value={formatPrizePool(tournamentData?.prizePool)}
            sublabel={tournamentData?.prizePool?.currency || 'INR'}
            color="green"
          />
          <StatCard
            icon={Eye}
            label="Current Viewers"
            value={formatNumber(tournamentData?.statistics?.viewership?.currentViewers)}
            sublabel={`Peak: ${formatNumber(tournamentData?.statistics?.viewership?.peakViewers)}`}
            color="purple"
          />
          <StatCard
            icon={Gamepad2}
            label="Matches"
            value={`${tournamentStats?.completedMatches || 0}/${tournamentStats?.totalMatches || 0}`}
            sublabel="Completed"
            color="blue"
          />
          <StatCard
            icon={Target}
            label="Total Kills"
            value={formatNumber(tournamentStats?.totalKills)}
            sublabel={`Avg: ${tournamentStats?.averageKills || 0}/match`}
            color="red"
          />
          <StatCard
            icon={Crown}
            label="Chicken Dinners"
            value={tournamentStats?.chickenDinners || 0}
            sublabel="Won matches"
            color="amber"
          />
          <StatCard
            icon={Clock}
            label="Avg Game Time"
            value={`${tournamentStats?.averageMatchDuration || 0}min`}
            sublabel={`Range: ${tournamentStats?.shortestMatch || 0}-${tournamentStats?.longestMatch || 0}min`}
            color="cyan"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
          <TabButton id="schedule" label="Schedule" isActive={activeTab === 'schedule'} onClick={setActiveTab} />
          <TabButton id="teams" label="Groups" isActive={activeTab === 'teams'} onClick={setActiveTab} />
          <TabButton id="matches" label="All Matches" isActive={activeTab === 'matches'} onClick={setActiveTab} />
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
                  <p className="text-zinc-300 mb-6 leading-relaxed">
                    {tournamentData.description || `${tournamentData.name} is a competitive ${tournamentData.game} tournament featuring top teams from ${tournamentData.region}.`}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Organizer</span>
                          <span className="text-white font-medium">{tournamentData?.organizer?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Format</span>
                          <span className="text-white font-medium">{tournamentData?.format || 'Battle Royale'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Game Mode</span>
                          <span className="text-white font-medium">{tournamentData?.gameSettings?.gameMode || 'TPP Squad'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Maps</span>
                          <span className="text-white font-medium">{tournamentData?.gameSettings?.maps?.join(', ') || 'Erangel, Miramar'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Server</span>
                          <span className="text-white font-medium">{tournamentData?.gameSettings?.serverRegion || 'Asia'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Prize Distribution</h3>
                      <div className="space-y-3">
                        {tournamentData?.prizePool?.distribution && tournamentData.prizePool.distribution.length > 0 ? (
                          <div>
                            <h4 className="text-sm font-medium text-zinc-400 mb-2">Team Prizes</h4>
                            <div className="space-y-2">
                              {tournamentData.prizePool.distribution.slice(0, 3).map((prize, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-zinc-800/50 rounded-lg">
                                  <span className="text-zinc-300 text-sm">{prize.position}</span>
                                  <span className="text-green-400 font-medium">₹{prize.amount?.toLocaleString() || '0'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-zinc-400 text-sm">Prize distribution TBD</div>
                        )}

                        {tournamentData?.prizePool?.individualAwards && tournamentData.prizePool.individualAwards.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-zinc-400 mb-2">Individual Awards</h4>
                            <div className="space-y-2">
                              {tournamentData.prizePool.individualAwards.slice(0, 3).map((award, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-zinc-800/50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="text-zinc-300 text-sm font-medium">{award.name}</div>
                                    <div className="text-zinc-500 text-xs">{award.description}</div>
                                  </div>
                                  <span className="text-amber-400 font-medium">₹{award.amount?.toLocaleString() || '0'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {tournamentData?.prizePool?.distribution && tournamentData.prizePool.distribution.length > 0 && (
                        <button
                          onClick={() => setShowPrizeModal(true)}
                          className="mt-3 text-orange-400 text-sm hover:text-orange-300 transition-colors"
                        >
                          View full prize breakdown →
                        </button>
                      )}
                    </div>
                  </div>

                  {tournamentData.phases && tournamentData.phases.length > 0 && (
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
                              {formatDate(phase.startDate)}
                              {phase.endDate !== phase.startDate && ` - ${formatDate(phase.endDate)}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Live or Next Match Info */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Current Status</h2>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <StatusBadge status={tournamentData.status} />
                      <span className="text-zinc-300 text-sm">{tournamentData.currentPhase || 'Not Started'}</span>
                    </div>
                    
                    {scheduleData.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium">Recent Updates</h4>
                        <p className="text-zinc-400">
                          Tournament is currently in {tournamentData.currentPhase || 'preparation phase'}. 
                          Check the matches tab for detailed match information.
                        </p>
                      </div>
                    ) : (
                      <p className="text-zinc-400">Tournament information will be updated as it progresses</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Social Media Links */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-orange-400" />
                    Follow Tournament
                  </h3>
                  <div className="space-y-3">
                    {tournamentData?.socialMedia?.youtube && (
                      <a
                        href={tournamentData.socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 p-3 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-600/30 transition-colors"
                      >
                        <Youtube className="w-5 h-5" />
                        <span className="font-medium">YouTube</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                    {tournamentData?.socialMedia?.twitter && (
                      <a
                        href={tournamentData.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-600/30 transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                        <span className="font-medium">Twitter</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                    {tournamentData?.socialMedia?.instagram && (
                      <a
                        href={tournamentData.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 p-3 bg-pink-600/20 border border-pink-500/30 rounded-lg text-pink-400 hover:bg-pink-600/30 transition-colors"
                      >
                        <Instagram className="w-5 h-5" />
                        <span className="font-medium">Instagram</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                    {tournamentData?.socialMedia?.discord && (
                      <a
                        href={tournamentData.socialMedia.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center gap-3 p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-400 hover:bg-indigo-600/30 transition-colors"
                      >
                        <Hash className="w-5 h-5" />
                        <span className="font-medium">Discord</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {streamLinks.length > 0 && (
                      <a
                        href={streamLinks[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium px-4 py-3 rounded-lg transition-all transform hover:scale-105 text-center block"
                      >
                        Watch Live Stream
                      </a>
                    )}
                    <button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Copy className="w-4 h-4" />
                      Copy Tournament URL
                    </button>
                  </div>
                </div>

                {/* Points System */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Points System</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Kill Points</span>
                      <span className="text-orange-400 font-bold">
                        {tournamentData?.gameSettings?.pointsSystem?.killPoints || 1} per kill
                      </span>
                    </div>
                    <div>
                      <div className="text-zinc-400 mb-2">Placement Points</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {[1, 2, 3, 4].map(position => (
                          <div key={position} className="flex justify-between">
                            <span className="text-zinc-500">#{position}:</span>
                            <span className={position === 1 ? "text-amber-400" : "text-zinc-400"}>
                              {tournamentData?.gameSettings?.pointsSystem?.placementPoints?.[position] || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Tournament Schedule</h2>
                
                {tournamentData.phases && tournamentData.phases.length > 0 ? (
                  tournamentData.phases.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-white">{phase.name}</h3>
                        <StatusBadge status={phase.status} />
                        <span className="text-zinc-400 text-sm">
                          {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                        </span>
                      </div>
                      
                      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                        <p className="text-zinc-400 text-center">
                          Phase schedule and timing information. Detailed match schedules are available in the "All Matches" section.
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-400">Schedule will be updated soon</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Groups</h2>
                  <div className="flex gap-2">
                    {tournamentData?.phases?.map((phase) => (
                      <button
                        key={phase.name}
                        onClick={() => setSelectedPhase(phase.name)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedPhase === phase.name ? 'bg-orange-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                        }`}
                      >
                        {phase.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-2">
                    {groupsData[selectedPhase] && Object.keys(groupsData[selectedPhase]).map((groupKey) => (
                      <button
                        key={groupKey}
                        onClick={() => setSelectedGroup(groupKey)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedGroup === groupKey ? 'bg-orange-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                        }`}
                      >
                        Group {groupKey}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupsData[selectedPhase] && groupsData[selectedPhase][selectedGroup] && groupsData[selectedPhase][selectedGroup].teams ? (
                    groupsData[selectedPhase][selectedGroup].teams.map((team, index) => (
                      <div key={team._id || index} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <img 
                            src={team.logo || 'https://placehold.co/48x48/1a1a1a/ffffff?text=' + (team.tag || '?')} 
                            alt={team.name} 
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/48x48/1a1a1a/ffffff?text=' + (team.tag || '?');
                            }}
                          />
                          <div>
                            <span className="text-white font-medium">{team.name}</span>
                            {team.tag && <div className="text-zinc-400 text-sm">{team.tag}</div>}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-zinc-400">No teams available for {selectedPhase} - Group {selectedGroup}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
                  <h3 className="text-lg font-bold text-white mb-2">Qualification Rules</h3>
                  <p className="text-zinc-400 text-sm">
                    Teams compete based on the tournament format. Check the tournament details for specific qualification criteria and advancement rules.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">All Tournament Matches</h2>
                  <div className="text-zinc-400 text-sm">
                    {matchesData.length} matches total
                  </div>
                </div>

                {Object.keys(matchesByPhase).length > 0 ? (
                  Object.entries(matchesByPhase).map(([phaseName, matches]) => (
                    <div key={phaseName} className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-white">{phaseName}</h3>
                        <span className="bg-orange-500/20 border border-orange-400/30 text-orange-400 px-2 py-1 rounded text-sm font-medium">
                          {matches.length} matches
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {matches.map((match) => (
                          <MatchCard key={match._id} match={match} />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Gamepad2 className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Matches Available</h3>
                    <p className="text-zinc-400">Matches will appear here once the tournament begins</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Tournament Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">
                      {formatNumber(tournamentStats?.totalKills)}
                    </div>
                    <div className="text-zinc-400 text-sm">Total Eliminations</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {tournamentStats?.averageKills || 0}
                    </div>
                    <div className="text-zinc-400 text-sm">Avg Kills/Match</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {tournamentStats?.averageMatchDuration || 0}min
                    </div>
                    <div className="text-zinc-400 text-sm">Avg Match Duration</div>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-amber-400 mb-2">
                      {tournamentStats?.chickenDinners || 0}
                    </div>
                    <div className="text-zinc-400 text-sm">Chicken Dinners</div>
                  </div>
                </div>

                {tournamentStats?.mostKillsInMatch && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-white mb-4">Tournament Records</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Target className="w-5 h-5 text-orange-400" />
                          <div>
                            <div className="text-white font-medium">Most Kills (Single Match)</div>
                            <div className="text-zinc-400 text-sm">
                              {tournamentStats.mostKillsInMatch.player || 'TBD'} ({tournamentStats.mostKillsInMatch.team || 'TBD'})
                            </div>
                          </div>
                        </div>
                        <span className="text-orange-400 font-bold">{tournamentStats.mostKillsInMatch.count || 0} kills</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Map Statistics</h2>
                {tournamentStats?.mapStats && tournamentStats.mapStats.length > 0 ? (
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
                            style={{ width: `${(map.timesPlayed / Math.max(1, tournamentStats.mapStats.reduce((sum, m) => sum + m.timesPlayed, 0))) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-zinc-400 mt-1">
                          <span>Avg Duration: {map.averageDuration || 0}min</span>
                          <span>Avg Kills: {map.averageKills || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-400">
                    <p>Map statistics will be available after matches begin</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'streams' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {streamLinks.length > 0 ? (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-red-400 animate-pulse" />
                        Live Stream
                      </h2>
                    </div>
                    
                    <div className="bg-zinc-800 rounded-xl aspect-video flex items-center justify-center mb-4">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                        <p className="text-zinc-400 text-lg font-medium">Live Stream Available</p>
                        <p className="text-zinc-500 text-sm">{tournamentData.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 flex-wrap">
                      {streamLinks.slice(0, 3).map((stream, index) => (
                        <a
                          key={index}
                          href={stream.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Watch on {stream.platform}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
                    <div className="text-center py-8">
                      <Play className="w-16 h-16 text-zinc-500 mx-auto mb-4" />
                      <h2 className="text-xl font-bold text-white mb-2">No Live Streams</h2>
                      <p className="text-zinc-400">Streams will be available during tournament matches</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Stream Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Current Viewers</span>
                      <span className="text-purple-400 font-bold">
                        {formatNumber(tournamentData?.statistics?.viewership?.currentViewers)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Peak Viewers</span>
                      <span className="text-green-400 font-bold">
                        {formatNumber(tournamentData?.statistics?.viewership?.peakViewers)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Total Views</span>
                      <span className="text-blue-400 font-bold">
                        {formatNumber(tournamentData?.statistics?.viewership?.totalViews)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
                  <div className="space-y-3">
                    {tournamentData?.socialMedia?.discord && (
                      <a
                        href={tournamentData.socialMedia.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Hash className="w-4 h-4" />
                        Join Discord
                      </a>
                    )}
                    <button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Copy className="w-4 h-4" />
                      Share Tournament
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prize Breakdown Modal */}
      {showPrizeModal && tournamentData?.prizePool?.distribution && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Full Prize Breakdown</h2>
                <button
                  onClick={() => setShowPrizeModal(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Total Prize Pool */}
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {formatPrizePool(tournamentData.prizePool)}
                </div>
                <div className="text-zinc-400">Total Prize Pool</div>
              </div>

              {/* Team Prizes */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Team Prizes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournamentData.prizePool.distribution.map((prize, index) => (
                    <div key={index} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-zinc-400 text-sm">{prize.position}</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-amber-500 text-white' :
                          index === 1 ? 'bg-zinc-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-zinc-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        ₹{prize.amount?.toLocaleString() || '0'}
                      </div>
                      <div className="text-zinc-400 text-sm">
                        {prize.percentage || 0}% of total pool
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Awards */}
              {tournamentData.prizePool.individualAwards && tournamentData.prizePool.individualAwards.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Individual Awards</h3>
                  <div className="space-y-4">
                    {tournamentData.prizePool.individualAwards.map((award, index) => (
                      <div key={index} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-white font-medium text-lg mb-1">{award.name}</div>
                            <div className="text-zinc-400 text-sm">{award.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-amber-400">
                              ₹{award.amount?.toLocaleString() || '0'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedTournamentInfo;