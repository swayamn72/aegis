import React, { useState } from 'react';
import {
  ArrowLeft, Clock, MapPin, Trophy, Target, Shield,
  TrendingUp, Star, Crown, Calendar, Globe, Hash,
  ExternalLink, Users, Award, Flag, Activity, Zap,
  ChevronDown, ChevronUp
} from 'lucide-react';

/**
 * DetailedMatchInfo for BGMI
 * BGMS Season 4 Grand Finals - Match 3
 * Date: 2024-09-15 | Map: Erangel
 */

const DetailedMatchInfo = () => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [expandedTeam, setExpandedTeam] = useState(null);
  
  // BGMI Match data
  const matchData = {
    id: "BGMS-S4-GF-M3",
    matchNumber: 3,
    matchType: "Grand Finals",
    date: "2024-09-15",
    time: "Mumbai (IST)",
    duration: "24:32",
    event: "BGMI Masters Series Season 4",
    stage: "Grand Finals",
    server: "Asia",
    gameVersion: "3.4.0",
    map: "Erangel",
    venue: "Offline LAN • Mumbai",
    totalKills: 67,
    totalDamage: 89245,
    chickenDinnerTeam: "Soul",
    firstBloodPlayer: "ScoutOP",
    firstBloodTime: "0:45"
  };

  // 16 Teams with their performance data
  const teamsData = [
    { 
      position: 1, 
      team: "Team Soul", 
      tag: "SOUL", 
      logo: "https://placehold.co/60x60/FF6B6B/FFFFFF?text=S",
      kills: 12, 
      placementPoints: 10, 
      killPoints: 12, 
      totalPoints: 22,
      survivalTime: "24:32",
      damage: 8234,
      chickenDinner: true,
      players: [
        { name: "ScoutOP", kills: 4, assists: 2, damage: 2145, survivalTime: "24:32", role: "IGL" },
        { name: "Clutchgod", kills: 3, assists: 1, damage: 2034, survivalTime: "24:32", role: "Assaulter" },
        { name: "Regaltos", kills: 3, assists: 3, damage: 1987, survivalTime: "24:32", role: "Support" },
        { name: "Mavi", kills: 2, assists: 2, damage: 2068, survivalTime: "24:32", role: "Fragger" }
      ]
    },
    { 
      position: 2, 
      team: "GodLike Esports", 
      tag: "GLE", 
      logo: "https://placehold.co/60x60/4ECDC4/FFFFFF?text=G",
      kills: 8, 
      placementPoints: 6, 
      killPoints: 8, 
      totalPoints: 14,
      survivalTime: "23:45",
      damage: 6789,
      chickenDinner: false,
      players: [
        { name: "Zgod", kills: 3, assists: 1, damage: 1876, survivalTime: "23:45", role: "IGL" },
        { name: "Jonathan", kills: 2, assists: 2, damage: 1734, survivalTime: "23:45", role: "Assaulter" },
        { name: "Admino", kills: 2, assists: 1, damage: 1612, survivalTime: "23:45", role: "Support" },
        { name: "Destro", kills: 1, assists: 3, damage: 1567, survivalTime: "23:45", role: "Fragger" }
      ]
    },
    { 
      position: 3, 
      team: "TSM", 
      tag: "TSM", 
      logo: "https://placehold.co/60x60/45B7D1/FFFFFF?text=T",
      kills: 9, 
      placementPoints: 5, 
      killPoints: 9, 
      totalPoints: 14,
      survivalTime: "22:18",
      damage: 7123,
      chickenDinner: false,
      players: [
        { name: "Ghatak", kills: 3, assists: 2, damage: 1923, survivalTime: "22:18", role: "IGL" },
        { name: "Jash", kills: 2, assists: 1, damage: 1789, survivalTime: "22:18", role: "Assaulter" },
        { name: "Neyoo", kills: 2, assists: 2, damage: 1678, survivalTime: "22:18", role: "Support" },
        { name: "Akshat", kills: 2, assists: 0, damage: 1733, survivalTime: "22:18", role: "Fragger" }
      ]
    },
    { 
      position: 4, 
      team: "OR Esports", 
      tag: "OR", 
      logo: "https://placehold.co/60x60/F7DC6F/FFFFFF?text=OR",
      kills: 6, 
      placementPoints: 4, 
      killPoints: 6, 
      totalPoints: 10,
      survivalTime: "21:34",
      damage: 5456,
      chickenDinner: false,
      players: [
        { name: "Rebel", kills: 2, assists: 1, damage: 1456, survivalTime: "21:34", role: "IGL" },
        { name: "Pahadi", kills: 2, assists: 2, damage: 1389, survivalTime: "21:34", role: "Assaulter" },
        { name: "Alpha", kills: 1, assists: 1, damage: 1234, survivalTime: "21:34", role: "Support" },
        { name: "Fierce", kills: 1, assists: 0, damage: 1377, survivalTime: "21:34", role: "Fragger" }
      ]
    },
    { 
      position: 5, 
      team: "Revenant Esports", 
      tag: "REV", 
      logo: "https://placehold.co/60x60/BB8FCE/FFFFFF?text=R",
      kills: 7, 
      placementPoints: 3, 
      killPoints: 7, 
      totalPoints: 10,
      survivalTime: "20:12",
      damage: 6234,
      chickenDinner: false,
      players: [
        { name: "Owais", kills: 3, assists: 1, damage: 1734, survivalTime: "20:12", role: "IGL" },
        { name: "Sensei", kills: 2, assists: 2, damage: 1567, survivalTime: "20:12", role: "Assaulter" },
        { name: "Tofu", kills: 1, assists: 1, damage: 1456, survivalTime: "20:12", role: "Support" },
        { name: "Daljitsk", kills: 1, assists: 0, damage: 1477, survivalTime: "20:12", role: "Fragger" }
      ]
    },
    { 
      position: 6, 
      team: "Blind Esports", 
      tag: "BE", 
      logo: "https://placehold.co/60x60/85C1E9/FFFFFF?text=BE",
      kills: 5, 
      placementPoints: 2, 
      killPoints: 5, 
      totalPoints: 7,
      survivalTime: "19:45",
      damage: 4789,
      chickenDinner: false,
      players: [
        { name: "Mamba", kills: 2, assists: 1, damage: 1289, survivalTime: "19:45", role: "IGL" },
        { name: "Viper", kills: 1, assists: 2, damage: 1156, survivalTime: "19:45", role: "Assaulter" },
        { name: "Badman", kills: 1, assists: 1, damage: 1123, survivalTime: "19:45", role: "Support" },
        { name: "Psycho", kills: 1, assists: 0, damage: 1221, survivalTime: "19:45", role: "Fragger" }
      ]
    },
    { 
      position: 7, 
      team: "Velocity Gaming", 
      tag: "VLT", 
      logo: "https://placehold.co/60x60/82E0AA/FFFFFF?text=VG",
      kills: 4, 
      placementPoints: 1, 
      killPoints: 4, 
      totalPoints: 5,
      survivalTime: "18:23",
      damage: 3987,
      chickenDinner: false,
      players: [
        { name: "Smokie", kills: 2, assists: 0, damage: 1123, survivalTime: "18:23", role: "IGL" },
        { name: "Paradox", kills: 1, assists: 1, damage: 987, survivalTime: "18:23", role: "Assaulter" },
        { name: "Nakul", kills: 1, assists: 1, damage: 934, survivalTime: "18:23", role: "Support" },
        { name: "Textures", kills: 0, assists: 2, damage: 943, survivalTime: "18:23", role: "Fragger" }
      ]
    },
    { 
      position: 8, 
      team: "Team XO", 
      tag: "XO", 
      logo: "https://placehold.co/60x60/F1948A/FFFFFF?text=XO",
      kills: 3, 
      placementPoints: 1, 
      killPoints: 3, 
      totalPoints: 4,
      survivalTime: "17:56",
      damage: 3456,
      chickenDinner: false,
      players: [
        { name: "Raven", kills: 1, assists: 1, damage: 934, survivalTime: "17:56", role: "IGL" },
        { name: "Iconic", kills: 1, assists: 0, damage: 876, survivalTime: "17:56", role: "Assaulter" },
        { name: "Shiba", kills: 1, assists: 1, damage: 823, survivalTime: "17:56", role: "Support" },
        { name: "Fierce", kills: 0, assists: 1, damage: 823, survivalTime: "17:56", role: "Fragger" }
      ]
    },
    { 
      position: 9, 
      team: "8Bit", 
      tag: "8BIT", 
      logo: "https://placehold.co/60x60/D2B4DE/FFFFFF?text=8B",
      kills: 2, 
      placementPoints: 0, 
      killPoints: 2, 
      totalPoints: 2,
      survivalTime: "16:34",
      damage: 2789,
      chickenDinner: false,
      players: [
        { name: "Goldy", kills: 1, assists: 0, damage: 734, survivalTime: "16:34", role: "IGL" },
        { name: "Aditya", kills: 1, assists: 1, damage: 689, survivalTime: "16:34", role: "Assaulter" },
        { name: "Thug", kills: 0, assists: 1, damage: 678, survivalTime: "16:34", role: "Support" },
        { name: "Ultron", kills: 0, assists: 0, damage: 688, survivalTime: "16:34", role: "Fragger" }
      ]
    },
    { 
      position: 10, 
      team: "Team Tamilas", 
      tag: "TT", 
      logo: "https://placehold.co/60x60/AED6F1/FFFFFF?text=TT",
      kills: 3, 
      placementPoints: 0, 
      killPoints: 3, 
      totalPoints: 3,
      survivalTime: "15:12",
      damage: 3123,
      chickenDinner: false,
      players: [
        { name: "Alpha7", kills: 2, assists: 0, damage: 834, survivalTime: "15:12", role: "IGL" },
        { name: "Beast", kills: 1, assists: 1, damage: 789, survivalTime: "15:12", role: "Assaulter" },
        { name: "Zaber", kills: 0, assists: 1, damage: 756, survivalTime: "15:12", role: "Support" },
        { name: "Hunter", kills: 0, assists: 0, damage: 744, survivalTime: "15:12", role: "Fragger" }
      ]
    },
    { 
      position: 11, 
      team: "Marcos Gaming", 
      tag: "MG", 
      logo: "https://placehold.co/60x60/F8C471/FFFFFF?text=MG",
      kills: 4, 
      placementPoints: 0, 
      killPoints: 4, 
      totalPoints: 4,
      survivalTime: "14:45",
      damage: 3678,
      chickenDinner: false,
      players: [
        { name: "Scout", kills: 2, assists: 1, damage: 987, survivalTime: "14:45", role: "IGL" },
        { name: "Snax", kills: 1, assists: 0, damage: 876, survivalTime: "14:45", role: "Assaulter" },
        { name: "Viper", kills: 1, assists: 1, damage: 834, survivalTime: "14:45", role: "Support" },
        { name: "Aaru", kills: 0, assists: 2, damage: 981, survivalTime: "14:45", role: "Fragger" }
      ]
    },
    { 
      position: 12, 
      team: "Team Forever", 
      tag: "FOR", 
      logo: "https://placehold.co/60x60/85929E/FFFFFF?text=TF",
      kills: 1, 
      placementPoints: 0, 
      killPoints: 1, 
      totalPoints: 1,
      survivalTime: "13:23",
      damage: 2345,
      chickenDinner: false,
      players: [
        { name: "Crown", kills: 1, assists: 0, damage: 634, survivalTime: "13:23", role: "IGL" },
        { name: "Phoenix", kills: 0, assists: 1, damage: 567, survivalTime: "13:23", role: "Assaulter" },
        { name: "Shadow", kills: 0, assists: 0, damage: 589, survivalTime: "13:23", role: "Support" },
        { name: "Matrix", kills: 0, assists: 0, damage: 555, survivalTime: "13:23", role: "Fragger" }
      ]
    },
    { 
      position: 13, 
      team: "Team IND", 
      tag: "IND", 
      logo: "https://placehold.co/60x60/F39C12/FFFFFF?text=IN",
      kills: 2, 
      placementPoints: 0, 
      killPoints: 2, 
      totalPoints: 2,
      survivalTime: "12:56",
      damage: 2678,
      chickenDinner: false,
      players: [
        { name: "Savage", kills: 1, assists: 0, damage: 678, survivalTime: "12:56", role: "IGL" },
        { name: "Dynamo", kills: 1, assists: 1, damage: 634, survivalTime: "12:56", role: "Assaulter" },
        { name: "Carry", kills: 0, assists: 1, damage: 678, survivalTime: "12:56", role: "Support" },
        { name: "Mortal", kills: 0, assists: 0, damage: 688, survivalTime: "12:56", role: "Fragger" }
      ]
    },
    { 
      position: 14, 
      team: "Chemin Esports", 
      tag: "CE", 
      logo: "https://placehold.co/60x60/52C4C4/FFFFFF?text=CE",
      kills: 3, 
      placementPoints: 0, 
      killPoints: 3, 
      totalPoints: 3,
      survivalTime: "11:34",
      damage: 2987,
      chickenDinner: false,
      players: [
        { name: "Eminem", kills: 2, assists: 0, damage: 789, survivalTime: "11:34", role: "IGL" },
        { name: "Desi", kills: 1, assists: 1, damage: 734, survivalTime: "11:34", role: "Assaulter" },
        { name: "Prince", kills: 0, assists: 1, damage: 723, survivalTime: "11:34", role: "Support" },
        { name: "Alpha", kills: 0, assists: 0, damage: 741, survivalTime: "11:34", role: "Fragger" }
      ]
    },
    { 
      position: 15, 
      team: "Big Brother Esports", 
      tag: "BBE", 
      logo: "https://placehold.co/60x60/E74C3C/FFFFFF?text=BB",
      kills: 1, 
      placementPoints: 0, 
      killPoints: 1, 
      totalPoints: 1,
      survivalTime: "10:12",
      damage: 1987,
      chickenDinner: false,
      players: [
        { name: "Binks", kills: 1, assists: 0, damage: 534, survivalTime: "10:12", role: "IGL" },
        { name: "Knight", kills: 0, assists: 0, damage: 467, survivalTime: "10:12", role: "Assaulter" },
        { name: "Saber", kills: 0, assists: 1, damage: 498, survivalTime: "10:12", role: "Support" },
        { name: "Demon", kills: 0, assists: 0, damage: 488, survivalTime: "10:12", role: "Fragger" }
      ]
    },
    { 
      position: 16, 
      team: "Entity Gaming", 
      tag: "ENT", 
      logo: "https://placehold.co/60x60/9B59B6/FFFFFF?text=EN",
      kills: 2, 
      placementPoints: 0, 
      killPoints: 2, 
      totalPoints: 2,
      survivalTime: "8:45",
      damage: 2234,
      chickenDinner: false,
      players: [
        { name: "Spike", kills: 1, assists: 0, damage: 578, survivalTime: "8:45", role: "IGL" },
        { name: "Venom", kills: 1, assists: 1, damage: 567, survivalTime: "8:45", role: "Assaulter" },
        { name: "Toxic", kills: 0, assists: 1, damage: 545, survivalTime: "8:45", role: "Support" },
        { name: "Blade", kills: 0, assists: 0, damage: 544, survivalTime: "8:45", role: "Fragger" }
      ]
    }
  ];

  // Components
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
    <div className={`flex items-center gap-2 bg-zinc-800/60 border border-${color}-400/30 rounded-lg px-3 py-2`}>
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

  const LeaderboardTable = () => (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-amber-400" />
        Match 3 Final Standings - {matchData.map}
      </h2>
      
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
              <th className="text-center py-3 px-2 text-zinc-300 font-medium">Survival</th>
              <th className="text-center py-3 px-2 text-zinc-300 font-medium">Damage</th>
              <th className="text-center py-3 px-2 text-zinc-300 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {teamsData.map((team, index) => {
              const isTop3 = team.position <= 3;
              const isExpanded = expandedTeam === index;
              
              return (
                <React.Fragment key={index}>
                  <tr className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors cursor-pointer ${
                    team.chickenDinner ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10' : 
                    isTop3 ? 'bg-zinc-800/20' : ''
                  }`}>
                    <td className="py-4 px-4">
                      <PositionBadge position={team.position} isHighlighted={isTop3} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img src={team.logo} alt={team.team} className="w-10 h-10 rounded-lg" />
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
                    <td className="text-center py-4 px-2">
                      <span className="text-purple-400 font-medium">{team.survivalTime}</span>
                    </td>
                    <td className="text-center py-4 px-2">
                      <span className="text-cyan-400 font-medium">{team.damage.toLocaleString()}</span>
                    </td>
                    <td className="text-center py-4 px-2">
                      <button 
                        onClick={() => setExpandedTeam(isExpanded ? null : index)}
                        className="p-2 hover:bg-zinc-700/50 rounded-lg transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                      </button>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr>
                      <td colSpan="9" className="px-4 py-0">
                        <div className="bg-zinc-800/30 rounded-lg p-4 mb-2">
                          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {team.team} Player Statistics
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {team.players.map((player, playerIndex) => (
                              <div key={playerIndex} className="bg-zinc-700/40 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 bg-zinc-600 rounded-full flex items-center justify-center text-xs text-white font-medium">
                                    {player.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="text-white font-medium text-sm">{player.name}</div>
                                    <div className="text-zinc-400 text-xs">{player.role}</div>
                                  </div>
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-zinc-400">Kills:</span>
                                    <span className="text-red-400 font-bold">{player.kills}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-400">Assists:</span>
                                    <span className="text-green-400 font-bold">{player.assists}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-400">Damage:</span>
                                    <span className="text-purple-400 font-bold">{player.damage.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-400">Survival:</span>
                                    <span className="text-cyan-400 font-medium">{player.survivalTime}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-lg p-4 text-center">
              <Crown className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-400 mb-1">Team Soul</div>
              <div className="text-zinc-300 text-sm font-medium">Chicken Dinner Winner</div>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
              <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-400 mb-1">{matchData.totalKills}</div>
              <div className="text-zinc-400 text-sm">Total Eliminations</div>
            </div>
            
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
              <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-400 mb-1">{matchData.totalDamage.toLocaleString()}</div>
              <div className="text-zinc-400 text-sm">Total Damage</div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Match Highlights</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">First Blood</span>
                <span className="text-orange-400 font-medium">{matchData.firstBloodPlayer} ({matchData.firstBloodTime})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Match Duration</span>
                <span className="text-green-400 font-medium">{matchData.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Most Kills (Team)</span>
                <span className="text-red-400 font-medium">Team Soul (12 kills)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Highest Damage (Team)</span>
                <span className="text-purple-400 font-medium">Team Soul (8,234)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-400" />
          {matchData.venue}
        </h3>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Match Details</h4>
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex justify-between">
                <span>Match Type:</span>
                <span className="text-white font-semibold">{matchData.matchType}</span>
              </div>
              <div className="flex justify-between">
                <span>Map:</span>
                <span className="text-white font-semibold">{matchData.map}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-white font-semibold">{matchData.duration}</span>
              </div>
              <div className="flex justify-between">
                <span>Teams:</span>
                <span className="text-white font-semibold">16 Teams</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Tournament Info</h4>
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex justify-between">
                <span>Event:</span>
                <span className="text-white font-semibold">{matchData.event}</span>
              </div>
              <div className="flex justify-between">
                <span>Stage:</span>
                <span className="text-white font-semibold">{matchData.stage}</span>
              </div>
              <div className="flex justify-between">
                <span>Server:</span>
                <span className="text-white font-semibold">{matchData.server}</span>
              </div>
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="text-white font-semibold">{matchData.gameVersion}</span>
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

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px]">
      <div className="container mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button className="p-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Match Details</h1>
            <p className="text-zinc-400">{matchData.event} • {matchData.stage}</p>
          </div>
        </div>

        {/* Match Header */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left: Match Result */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">
                    Team Soul Victory
                  </div>
                  <div className="text-zinc-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {matchData.date} • {matchData.time}
                  </div>
                </div>
              </div>

              {/* Winner Showcase */}
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
                    <div className="text-orange-400 text-sm">{teamsData[0].kills} Kills • {teamsData[0].survivalTime}</div>
                  </div>
                </div>
              </div>

              {/* Info pills */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatPill label="Map" value={matchData.map} icon={MapPin} color="green" />
                <StatPill label="Teams" value="16" icon={Users} color="blue" />
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
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'leaderboard' && <LeaderboardTable />}
          {activeTab === 'overview' && <OverviewTab />}
        </div>
      </div>
    </div>
  );
};

export default DetailedMatchInfo;