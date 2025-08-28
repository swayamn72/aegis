import React, { useState } from 'react';
import {
  ArrowLeft, Clock, MapPin, Trophy, Target, Shield,
  TrendingUp, Star, Crown, Calendar, Globe, Hash,
  ExternalLink, Users, Award, Flag, Activity
} from 'lucide-react';

/**
 * DetailedMatchInfo (JavaScript version)
 * VALORANT Champions 2023 Grand Final – Evil Geniuses vs Paper Rex (Bo5)
 * Date: 2023-08-26 | Result: EG 3–1 PRX
 */

const DetailedMatchInfo = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Match data
  const series = {
    id: "CHAMPIONS-2023-GF",
    seriesType: "Bo5",
    date: "2023-08-26",
    time: "Los Angeles (PDT)",
    duration: "Approx. 3h",
    event: "VALORANT Champions 2023",
    stage: "Grand Final",
    server: "LAN • Los Angeles",
    gameVersion: "7.x",
    result: "Evil Geniuses win 3–1",
    winner: "EG",
    venue: "KIA Forum, Los Angeles",
    maps: [
      { 
        map: "Split", 
        score: "13–10", 
        winner: "EG",
        scoreboard: {
          EG: [
            { player: "Boostio", agent: "Omen", kills: 19, deaths: 14, assists: 8, acs: 241, adr: 142 },
            { player: "Ethan", agent: "Breach", kills: 17, deaths: 16, assists: 12, acs: 223, adr: 138 },
            { player: "Demon1", agent: "Jett", kills: 24, deaths: 13, assists: 4, acs: 287, adr: 168 },
            { player: "jawgemo", agent: "Raze", kills: 21, deaths: 15, assists: 7, acs: 264, adr: 159 },
            { player: "C0M", agent: "Killjoy", kills: 11, deaths: 17, assists: 9, acs: 178, adr: 112 }
          ],
          PRX: [
            { player: "d4v41", agent: "Omen", kills: 16, deaths: 19, assists: 10, acs: 201, adr: 128 },
            { player: "f0rsakeN", agent: "Breach", kills: 18, deaths: 18, assists: 8, acs: 214, adr: 134 },
            { player: "Jinggg", agent: "Raze", kills: 15, deaths: 19, assists: 6, acs: 195, adr: 121 },
            { player: "mindfreak", agent: "Killjoy", kills: 12, deaths: 18, assists: 11, acs: 172, adr: 109 },
            { player: "something", agent: "Jett", kills: 14, deaths: 18, assists: 5, acs: 183, adr: 115 }
          ]
        }
      },
      { 
        map: "Ascent", 
        score: "11–13", 
        winner: "PRX",
        scoreboard: {
          EG: [
            { player: "Boostio", agent: "Omen", kills: 17, deaths: 19, assists: 6, acs: 218, adr: 142 },
            { player: "Ethan", agent: "KAY/O", kills: 14, deaths: 18, assists: 9, acs: 189, adr: 124 },
            { player: "Demon1", agent: "Jett", kills: 19, deaths: 16, assists: 3, acs: 246, adr: 151 },
            { player: "jawgemo", agent: "Sage", kills: 13, deaths: 18, assists: 12, acs: 185, adr: 119 },
            { player: "C0M", agent: "Killjoy", kills: 15, deaths: 16, assists: 8, acs: 202, adr: 131 }
          ],
          PRX: [
            { player: "d4v41", agent: "Omen", kills: 18, deaths: 16, assists: 8, acs: 234, adr: 148 },
            { player: "f0rsakeN", agent: "KAY/O", kills: 21, deaths: 15, assists: 6, acs: 267, adr: 162 },
            { player: "Jinggg", agent: "Raze", kills: 19, deaths: 16, assists: 4, acs: 251, adr: 157 },
            { player: "mindfreak", agent: "Killjoy", kills: 16, deaths: 16, assists: 10, acs: 208, adr: 135 },
            { player: "something", agent: "Jett", kills: 13, deaths: 15, assists: 7, acs: 194, adr: 126 }
          ]
        }
      },
      { 
        map: "Bind", 
        score: "13–5", 
        winner: "EG",
        scoreboard: {
          EG: [
            { player: "Boostio", agent: "Omen", kills: 16, deaths: 9, assists: 7, acs: 278, adr: 165 },
            { player: "Ethan", agent: "Breach", kills: 14, deaths: 8, assists: 11, acs: 245, adr: 142 },
            { player: "Demon1", agent: "Jett", kills: 22, deaths: 6, assists: 2, acs: 351, adr: 201 },
            { player: "jawgemo", agent: "Raze", kills: 18, deaths: 7, assists: 5, acs: 312, adr: 178 },
            { player: "C0M", agent: "Brimstone", kills: 8, deaths: 10, assists: 8, acs: 186, adr: 119 }
          ],
          PRX: [
            { player: "d4v41", agent: "Omen", kills: 9, deaths: 16, assists: 4, acs: 151, adr: 98 },
            { player: "f0rsakeN", agent: "Breach", kills: 11, deaths: 15, assists: 6, acs: 178, adr: 112 },
            { player: "Jinggg", agent: "Raze", kills: 8, deaths: 16, assists: 3, acs: 142, adr: 89 },
            { player: "mindfreak", agent: "Brimstone", kills: 6, deaths: 15, assists: 7, acs: 128, adr: 84 },
            { player: "something", agent: "Jett", kills: 6, deaths: 16, assists: 2, acs: 135, adr: 87 }
          ]
        }
      },
      { 
        map: "Lotus", 
        score: "13–10", 
        winner: "EG",
        scoreboard: {
          EG: [
            { player: "Boostio", agent: "Omen", kills: 20, deaths: 15, assists: 9, acs: 256, adr: 152 },
            { player: "Ethan", agent: "Skye", kills: 18, deaths: 17, assists: 14, acs: 241, adr: 145 },
            { player: "Demon1", agent: "Jett", kills: 25, deaths: 14, assists: 3, acs: 298, adr: 173 },
            { player: "jawgemo", agent: "Neon", kills: 19, deaths: 16, assists: 6, acs: 267, adr: 161 },
            { player: "C0M", agent: "Harbor", kills: 14, deaths: 18, assists: 11, acs: 209, adr: 128 }
          ],
          PRX: [
            { player: "d4v41", agent: "Omen", kills: 17, deaths: 19, assists: 7, acs: 213, adr: 136 },
            { player: "f0rsakeN", agent: "Skye", kills: 19, deaths: 19, assists: 9, acs: 234, adr: 148 },
            { player: "Jinggg", agent: "Reyna", kills: 16, deaths: 19, assists: 4, acs: 201, adr: 129 },
            { player: "mindfreak", agent: "Harbor", kills: 15, deaths: 19, assists: 8, acs: 192, adr: 124 },
            { player: "something", agent: "Jett", kills: 13, deaths: 20, assists: 6, acs: 178, adr: 115 }
          ]
        }
      }
    ]
  };

  const teams = {
    EG: {
      name: "Evil Geniuses",
      tag: "EG",
      logo: "/src/assets/TeamLogos/eg.png",
      color: "from-sky-500 to-blue-600",
      total: 3
    },
    PRX: {
      name: "Paper Rex",
      tag: "PRX",
      logo: "/src/assets/TeamLogos/prx.png",
      color: "from-rose-500 to-red-600",
      total: 1
    }
  };

  const players = [
    // Evil Geniuses
    { id: 'eg-boostio', team: 'EG', handle: 'Boostio', realName: 'Kelden Pupello', countryFlag: '🇺🇸', countryName: 'United States', profilePic: '/PlayerPfp/boostio.avif' },
    { id: 'eg-ethan', team: 'EG', handle: 'Ethan', realName: 'Ethan Arnold', countryFlag: '🇺🇸', countryName: 'United States', profilePic: '/PlayerPfp/ethan.avif' },
    { id: 'eg-demon1', team: 'EG', handle: 'Demon1', realName: 'Max Mazanov', countryFlag: '🇺🇸', countryName: 'United States', profilePic: '/PlayerPfp/demon1.avif' },
    { id: 'eg-jawgemo', team: 'EG', handle: 'jawgemo', realName: 'Alexander Mor', countryFlag: '🇺🇸', countryName: 'United States', profilePic: '/PlayerPfp/jawgemo.avif' },
    { id: 'eg-c0m', team: 'EG', handle: 'C0M', realName: 'Corbin Lee', countryFlag: '🇺🇸', countryName: 'United States', profilePic: '/PlayerPfp/c0m.avif' },

    // Paper Rex
    { id: 'prx-d4v41', team: 'PRX', handle: 'd4v41', realName: 'Khalish Rusyaidee', countryFlag: '🇲🇾', countryName: 'Malaysia', profilePic: '/PlayerPfp/d4v412.avif' },
    { id: 'prx-f0rsaken', team: 'PRX', handle: 'f0rsakeN', realName: 'Jason Susanto', countryFlag: '🇮🇩', countryName: 'Indonesia', profilePic: '/PlayerPfp/f0rsaken.avif' },
    { id: 'prx-jinggg', team: 'PRX', handle: 'Jinggg', realName: 'Wang Jing Jie', countryFlag: '🇸🇬', countryName: 'Singapore', profilePic: '/PlayerPfp/jinggg.avif' },
    { id: 'prx-mindfreak', team: 'PRX', handle: 'mindfreak', realName: 'Aaron Leonhart', countryFlag: '🇮🇩', countryName: 'Indonesia', profilePic: '/PlayerPfp/mindfreak.avif' },
    { id: 'prx-something', team: 'PRX', handle: 'something', realName: 'Ilya Petrov', countryFlag: '🇷🇺', countryName: 'Russia', profilePic: '/PlayerPfp/something.avif' },
  ];

  // Computed data
  const teamPlayers = {
    EG: players.filter(p => p.team === 'EG'),
    PRX: players.filter(p => p.team === 'PRX'),
  };

  // Components
  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30'
          : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  const StatPill = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-2 bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2">
      <Icon className="w-4 h-4 text-sky-400" />
      <span className="text-zinc-400 text-xs">{label}</span>
      <span className="text-white font-semibold text-sm">{value}</span>
    </div>
  );

  const PlayerRow = ({ player }) => (
    <div className="flex items-center justify-between p-3 bg-zinc-800/40 border border-zinc-700 rounded-lg hover:border-sky-500/40 transition-colors">
      <div className="flex items-center gap-3">
        <img
          src={player.profilePic}
          alt={player.handle}
          className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-700"
          onError={(e) => { e.currentTarget.src = 'https://unavatar.io/fallback.png'; }}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{player.handle}</span>
            <span title={player.countryName} className="text-lg leading-none">{player.countryFlag}</span>
          </div>
          <div className="text-xs text-zinc-400">{player.realName}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Users className="w-4 h-4" />
        {player.team}
      </div>
    </div>
  );

  const TeamRoster = ({ teamKey, teamData, players }) => (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Users className={`w-5 h-5 ${teamKey === 'EG' ? 'text-sky-400' : 'text-rose-400'}`} />
        {teamData.name}
      </h3>
      <div className="space-y-2">
        {players.map(player => <PlayerRow key={player.id} player={player} />)}
      </div>
    </div>
  );

  const ScoreboardTable = ({ mapData, mapName }) => (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-amber-400" />
        {mapName} Scoreboard
      </h2>
      
      {Object.entries(mapData.scoreboard).map(([teamKey, teamPlayers]) => (
        <div key={teamKey} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={teams[teamKey].logo} 
              alt={teams[teamKey].name}
              className="w-8 h-8 rounded-lg object-contain"
              onError={(e) => { e.currentTarget.src = 'https://unavatar.io/fallback.png'; }}
            />
            <h3 className="text-xl font-semibold text-white">{teams[teamKey].name}</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4 text-zinc-300 font-medium">Player</th>
                  <th className="text-center py-3 px-2 text-zinc-300 font-medium">Agent</th>
                  <th className="text-center py-3 px-2 text-zinc-300 font-medium">K</th>
                  <th className="text-center py-3 px-2 text-zinc-300 font-medium">D</th>
                  <th className="text-center py-3 px-2 text-zinc-300 font-medium">A</th>
                  <th className="text-center py-3 px-2 text-zinc-300 font-medium">ACS</th>
                  <th className="text-center py-3 px-2 text-zinc-300 font-medium">ADR</th>
                </tr>
              </thead>
              <tbody>
                {teamPlayers.map((playerStat, index) => {
                  const playerInfo = players.find(p => p.handle === playerStat.player);
                  return (
                    <tr key={index} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={playerInfo?.profilePic || 'https://unavatar.io/fallback.png'}
                            alt={playerStat.player}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-700"
                            onError={(e) => { e.currentTarget.src = 'https://unavatar.io/fallback.png'; }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{playerStat.player}</span>
                              <span className="text-sm">{playerInfo?.countryFlag}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2 text-zinc-300 text-sm">{playerStat.agent}</td>
                      <td className="text-center py-3 px-2 text-white font-semibold">{playerStat.kills}</td>
                      <td className="text-center py-3 px-2 text-red-400 font-semibold">{playerStat.deaths}</td>
                      <td className="text-center py-3 px-2 text-green-400 font-semibold">{playerStat.assists}</td>
                      <td className="text-center py-3 px-2 text-orange-400 font-semibold">{playerStat.acs}</td>
                      <td className="text-center py-3 px-2 text-blue-400 font-semibold">{playerStat.adr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );

  // Render overview tab content
  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Rosters */}
      <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Team Rosters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TeamRoster teamKey="EG" teamData={teams.EG} players={teamPlayers.EG} />
          <TeamRoster teamKey="PRX" teamData={teams.PRX} players={teamPlayers.PRX} />
        </div>
      </div>

      {/* Event Info */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-sky-400" />
          {series.venue}
        </h3>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Match Format</h4>
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex justify-between">
                <span>Series Type:</span>
                <span className="text-white font-semibold">{series.seriesType}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-white font-semibold">{series.duration}</span>
              </div>
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="text-white font-semibold">First to 3 maps</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Tournament Details</h4>
            <div className="space-y-2 text-sm text-zinc-300">
              <div className="flex justify-between">
                <span>Event:</span>
                <span className="text-white font-semibold">{series.event}</span>
              </div>
              <div className="flex justify-between">
                <span>Stage:</span>
                <span className="text-white font-semibold">{series.stage}</span>
              </div>
              <div className="flex justify-between">
                <span>Server:</span>
                <span className="text-white font-semibold">{series.server}</span>
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
            <p className="text-zinc-400">{series.event} • {series.stage}</p>
          </div>
        </div>

        {/* Match Header */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left: Result & Series */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {series.result}
                  </div>
                  <div className="text-zinc-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {series.date} • {series.time}
                  </div>
                </div>
              </div>

              {/* Teams + Series Score */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  {/* EG */}
                  <div className="flex items-center gap-4">
                    <img 
                      src={teams.EG.logo} 
                      alt={teams.EG.name}
                      className="w-12 h-12 rounded-lg object-contain"
                      onError={(e) => { e.currentTarget.src = 'https://unavatar.io/fallback.png'; }}
                    />
                    <div>
                      <div className="text-xl font-bold text-white">{teams.EG.name}</div>
                      <div className="text-zinc-400 text-sm">{teams.EG.tag}</div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <div className="text-sm text-zinc-400 mb-1 flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4 text-sky-400" />
                      <span>{series.seriesType}</span>
                    </div>
                    <div className="flex items-center gap-4 text-4xl font-bold">
                      <span className="text-emerald-400">{teams.EG.total}</span>
                      <span className="text-zinc-500">:</span>
                      <span className="text-white">{teams.PRX.total}</span>
                    </div>
                  </div>

                  {/* PRX */}
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-xl font-bold text-white text-right">{teams.PRX.name}</div>
                      <div className="text-zinc-400 text-sm text-right">{teams.PRX.tag}</div>
                    </div>
                    <img 
                      src={teams.PRX.logo} 
                      alt={teams.PRX.name}
                      className="w-12 h-12 rounded-lg object-contain"
                      onError={(e) => { e.currentTarget.src = 'https://unavatar.io/fallback.png'; }}
                    />
                  </div>
                </div>
              </div>

              {/* Info pills */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatPill label="Event" value="Champions" icon={Award} />
                <StatPill label="Stage" value={series.stage} icon={Star} />
                <StatPill label="Server" value="LAN" icon={Globe} />
                <StatPill label="Version" value={series.gameVersion} icon={Hash} />
              </div>
            </div>

            {/* Right: Series Map Results */}
            <div className="lg:w-96">
              <div className="bg-gradient-to-r from-sky-600/20 to-blue-500/20 border border-sky-400/30 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Crown className="w-6 h-6 text-amber-400" />
                    <span className="text-amber-400 font-semibold text-lg">Series Result</span>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{series.seriesType}</div>
                  <div className="text-sky-300 text-sm">{teams.EG.name} win {teams.EG.total}–{teams.PRX.total}</div>
                </div>

                <div className="space-y-3">
                  {series.maps.map((map, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/40 border border-zinc-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                          map.winner === 'EG' ? 'bg-sky-500 text-white' : 'bg-rose-500 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium">{map.map}</div>
                          <div className="text-xs text-zinc-400">Winner: {map.winner}</div>
                        </div>
                      </div>
                      <div className="text-white font-mono">{map.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
          {series.maps.map((map, index) => (
            <TabButton 
              key={index} 
              id={`map-${index}`} 
              label={`Map ${index + 1}: ${map.map}`} 
              isActive={activeTab === `map-${index}`} 
              onClick={setActiveTab} 
            />
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[420px]">
          {activeTab === 'overview' && renderOverviewTab()}
          {series.maps.map((map, index) => 
            activeTab === `map-${index}` && (
              <ScoreboardTable key={index} mapData={map} mapName={map.map} />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedMatchInfo;