import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, MapPin, Trophy, Target, Shield,
  TrendingUp, Star, Crown, Calendar, Globe, Hash,
  ExternalLink, Users, Award, Flag, Activity, Zap,
  Timer, Gamepad2, Medal,
  BarChart3, Eye, Share2, Download, AlertCircle
} from 'lucide-react';

import ErangelMap from '../assets/mapImages/erangel.jpg';
import MiramarMap from '../assets/mapImages/miramar.webp';
import SanhokMap from '../assets/mapImages/sanhok.webp';
import VikendiMap from '../assets/mapImages/vikendi.jpg';

const mapImages = {
  'Erangel': ErangelMap,
  'Miramar': MiramarMap,
  'Sanhok': SanhokMap,
  'Vikendi': VikendiMap,
  'Livik': ErangelMap,
  'Nusa': ErangelMap,
  'Rondo': ErangelMap
};

const DetailedMatchInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [matchData, setMatchData] = useState(null);
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/matches/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch match data: ${response.status}`);
        }

        const data = await response.json();
        
        // Format match data
        const formattedMatchData = {
          id: data._id,
          matchNumber: data.matchNumber,
          matchType: 'Tournament Match',
          date: new Date(data.scheduledStartTime).toLocaleDateString(),
          time: new Date(data.scheduledStartTime).toLocaleTimeString(),
          duration: 'N/A',
          tournament: data.tournament?.tournamentName || 'Tournament',
          stage: data.tournamentPhase || 'Match',
          server: 'Asia',
          gameVersion: '3.4.0',
          map: data.map,
          venue: 'Online',
          totalKills: data.matchStats?.totalKills || 0,
          chickenDinnerTeam: data.participatingTeams?.find(t => t.chickenDinner)?.team?.teamName || 'TBD',
          status: data.status
        };

        // Format teams data
        const formattedTeamsData = data.participatingTeams?.map((pt, index) => ({
          position: pt.finalPosition || (index + 1),
          team: pt.team?.teamName || pt.teamName || 'Unknown Team',
          tag: pt.team?.teamTag || pt.teamTag || 'UNK',
          logo: pt.team?.logo || 'https://placehold.co/60x60/1a1a1a/ffffff?text=' + (pt.team?.teamTag || 'T'),
          kills: pt.kills?.total || 0,
          placementPoints: pt.points?.placementPoints || 0,
          killPoints: pt.points?.killPoints || pt.kills?.total || 0,
          totalPoints: pt.points?.totalPoints || 0,
          chickenDinner: pt.chickenDinner || false
        })) || [];

        // Sort teams by position
        formattedTeamsData.sort((a, b) => a.position - b.position);

        setMatchData(formattedMatchData);
        setTeamsData(formattedTeamsData);

      } catch (err) {
        console.error('Error fetching match data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMatchData();
    }
  }, [id]);

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

  const StatPill = ({ label, value, icon: Icon, color = "orange" }) => (
    <div className={`flex items-center gap-2 bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2`}>
      <Icon className={`w-4 h-4 text-${color}-400`} />
      <span className="text-zinc-400 text-xs">{label}</span>
      <span className="text-white font-semibold text-sm">{value}</span>
    </div>
  );

  const PositionBadge = ({ position, isHighlighted = false }) => {
    const getPositionStyle = (pos) => {
      if (pos === 1) return "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/50";
      if (pos === 2) return "bg-gradient-to-r from-zinc-400 to-zinc-500 text-white shadow-lg shadow-zinc-400/50";
      if (pos === 3) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/50";
      return "bg-zinc-600 text-white";
    };
    
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getPositionStyle(position)} ${isHighlighted ? 'ring-2 ring-white/30' : ''}`}>
        {position}
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
      if (status === 'in_progress') {
        return { color: 'red', text: 'Live', icon: Activity, pulse: true };
      } else if (status === 'completed') {
        return { color: 'green', text: 'Completed', icon: Trophy, pulse: false };
      } else if (status === 'scheduled') {
        return { color: 'blue', text: 'Scheduled', icon: Clock, pulse: false };
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

  const LeaderboardTable = () => (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          Match {matchData?.matchNumber} Final Standings - {matchData?.map}
        </h2>
        
        {/* Map Image */}
        <div className="w-24 h-16 rounded-lg overflow-hidden bg-zinc-700">
          <img
            src={mapImages[matchData?.map] || ErangelMap}
            alt={matchData?.map}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/384x216/1a1a1a/ffffff?text=Map';
            }}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="text-left py-3 px-4 text-zinc-300 font-medium">Rank</th>
              <th className="text-left py-3 px-4 text-zinc-300 font-medium">Team</th>
              <th className="text-center py-3 px-2 text-zinc-300 font-medium">Kills</th>
              <th className="text-center py-3 px-2 text-zinc-300 font-medium">Placement</th>
              <th className="text-center py-3 px-2 text-zinc-300 font-medium">Kill Pts</th>
              <th className="text-center py-3 px-2 text-zinc-300 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {teamsData.map((team, index) => {
              const isTop3 = team.position <= 3;

              return (
                <tr key={index} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${
                  team.chickenDinner ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10' :
                  isTop3 ? 'bg-zinc-800/20' : ''
                }`}>
                  <td className="py-4 px-4">
                    <PositionBadge position={team.position} isHighlighted={isTop3} />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={team.logo}
                        alt={team.team}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/40x40/1a1a1a/ffffff?text=' + team.tag;
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{team.team}</span>
                          {team.chickenDinner && <Crown className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div className="text-zinc-400 text-xs">{team.tag}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-4 px-2">
                    <span className="text-red-400 font-bold">{team.kills}</span>
                  </td>
                  <td className="text-center py-4 px-2">
                    <span className="text-green-400 font-bold">{team.placementPoints}</span>
                  </td>
                  <td className="text-center py-4 px-2">
                    <span className="text-blue-400 font-bold">{team.killPoints}</span>
                  </td>
                  <td className="text-center py-4 px-2">
                    <span className={`font-bold text-lg ${isTop3 ? 'text-orange-400' : 'text-zinc-300'}`}>
                      {team.totalPoints}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Match Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-lg p-4 text-center">
              <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-400 mb-1">{matchData?.chickenDinnerTeam || 'TBD'}</div>
              <div className="text-zinc-300 text-sm font-medium">Chicken Dinner Winner</div>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
              <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-400 mb-1">{matchData?.totalKills || 0}</div>
              <div className="text-zinc-400 text-sm">Total Eliminations</div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Match Highlights</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">First Blood</span>
                <span className="text-orange-400 font-medium">{matchData?.firstBloodPlayer} ({matchData?.firstBloodTime})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Match Duration</span>
                <span className="text-green-400 font-medium">{matchData?.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Most Kills (Team)</span>
                <span className="text-red-400 font-medium">{teamsData[0]?.team} ({teamsData[0]?.kills} kills)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-400" />
          Match Details
        </h3>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="w-full h-24 rounded-lg overflow-hidden bg-zinc-700 mb-3">
              <img
                src={mapImages[matchData?.map] || ErangelMap}
                alt={matchData?.map}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=Map';
                }}
              />
            </div>
            <h4 className="text-white font-medium mb-3">Match Information</h4>
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex justify-between">
                <span>Match Type:</span>
                <span className="text-white font-semibold">{matchData?.matchType}</span>
              </div>
              <div className="flex justify-between">
                <span>Map:</span>
                <span className="text-white font-semibold">{matchData?.map}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-white font-semibold">{matchData?.duration}</span>
              </div>
              <div className="flex justify-between">
                <span>Teams:</span>
                <span className="text-white font-semibold">{teamsData.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Tournament Info</h4>
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex justify-between">
                <span>Tournament:</span>
                <span className="text-white font-semibold">{matchData?.tournament}</span>
              </div>
              <div className="flex justify-between">
                <span>Stage:</span>
                <span className="text-white font-semibold">{matchData?.stage}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <StatusBadge status={matchData?.status} />
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="text-white font-semibold">{matchData?.date}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-600/20 to-red-500/20 border border-orange-400/30 rounded-lg p-4">
            <h4 className="text-orange-400 font-medium mb-3">Points System</h4>
            <div className="space-y-2 text-sm">
              <div className="text-zinc-300 mb-2">Placement Points:</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">#1:</span>
                  <span className="text-amber-400 font-bold">10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">#2:</span>
                  <span className="text-zinc-300">6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">#3:</span>
                  <span className="text-zinc-300">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">#4:</span>
                  <span className="text-zinc-300">4</span>
                </div>
              </div>
              <div className="border-t border-zinc-600 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-zinc-300">Kill Points:</span>
                  <span className="text-orange-400 font-bold">1 per kill</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const StatsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Match Statistics</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">{matchData?.totalKills || 0}</div>
            <div className="text-zinc-400 text-sm">Total Kills</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{teamsData.length}</div>
            <div className="text-zinc-400 text-sm">Teams Participated</div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">{matchData?.duration}</div>
            <div className="text-zinc-400 text-sm">Match Duration</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Top Performers</h3>
          {teamsData.slice(0, 3).map((team, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <PositionBadge position={team.position} />
                <img src={team.logo} alt={team.team} className="w-8 h-8 rounded" />
                <span className="text-white font-medium">{team.team}</span>
              </div>
              <div className="text-right">
                <div className="text-orange-400 font-bold">{team.totalPoints} pts</div>
                <div className="text-zinc-400 text-sm">{team.kills} kills</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Performance Breakdown</h2>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-medium mb-3">Kill Distribution</h4>
            <div className="space-y-2">
              {teamsData.slice(0, 5).map((team, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-zinc-400 text-sm">{team.team.substring(0, 8)}</div>
                  <div className="flex-1 bg-zinc-700 rounded-full h-2">
                    <div
                      className="bg-red-400 h-2 rounded-full"
                      style={{ width: `${(team.kills / Math.max(...teamsData.map(t => t.kills))) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-red-400 font-bold text-sm">{team.kills}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-zinc-400 text-lg">Loading match data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">Error loading match data</div>
          <p className="text-zinc-400 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">Match not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px]">
      <div className="container mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Match Details</h1>
            <p className="text-zinc-400">{matchData.tournament} • {matchData.stage}</p>
          </div>
        </div>

        {/* Match Header */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">
                    {matchData.chickenDinnerTeam} Victory
                  </div>
                  <div className="text-zinc-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {matchData.date} • {matchData.time}
                  </div>
                </div>
              </div>

              {/* Winner Showcase */}
              {teamsData.length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={teamsData[0].logo} 
                        alt={teamsData[0].team}
                        className="w-16 h-16 rounded-lg object-contain"
                      />
                      <div>
                        <div className="text-2xl font-bold text-white">{teamsData[0].team}</div>
                        <div className="text-amber-400 text-sm font-medium">🏆 CHICKEN DINNER WINNER</div>
                        <div className="text-zinc-400 text-sm">{teamsData[0].tag}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-amber-400">{teamsData[0].totalPoints}</div>
                      <div className="text-zinc-400 text-sm">Total Points</div>
                      <div className="text-orange-400 text-sm">{teamsData[0].kills} Kills</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Info pills */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatPill label="Map" value={matchData.map} icon={MapPin} color="green" />
                <StatPill label="Teams" value={teamsData.length} icon={Users} color="blue" />
                <StatPill label="Duration" value={matchData.duration} icon={Clock} color="purple" />
                <StatPill label="Kills" value={matchData.totalKills} icon={Target} color="red" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton id="leaderboard" label="Full Leaderboard" isActive={activeTab === 'leaderboard'} onClick={setActiveTab} />
          <TabButton id="overview" label="Match Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
          <TabButton id="statistics" label="Statistics" isActive={activeTab === 'statistics'} onClick={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'leaderboard' && <LeaderboardTable />}
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'statistics' && <StatsTab />}
        </div>
      </div>
    </div>
  );
};

export default DetailedMatchInfo;