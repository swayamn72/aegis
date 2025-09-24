import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Download, AlertCircle, ChevronDown } from 'lucide-react';

const PointsTable = ({ tournament, onUpdate }) => {
  const [pointsTable, setPointsTable] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [isPhaseDropdownOpen, setIsPhaseDropdownOpen] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch matches for the tournament
  useEffect(() => {
    fetchMatches();
  }, [tournament._id]);

  // Recalculate points table when matches or phase changes
  useEffect(() => {
    if (matches.length > 0) {
      calculatePointsTable();
    } else {
      setPointsTable([]);
    }
  }, [matches, selectedPhase, tournament.participatingTeams]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/matches/tournament/${tournament._id}`);
      if (response.ok) {
        const matchesData = await response.json();
        console.log('Fetched matches:', matchesData);
        setMatches(matchesData);
      } else {
        const errorText = await response.text();
        console.error('Error fetching matches:', errorText);
        setError('Failed to fetch matches');
      }
    } catch (err) {
      console.error('Error connecting to server:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const calculatePointsTable = () => {
    const teamPoints = {};

    // Initialize teams from tournament.participatingTeams
    tournament.participatingTeams?.forEach(participatingTeam => {
      // Handle both populated and non-populated team references
      const team = participatingTeam.team || participatingTeam;
      const teamId = team._id || team.id || participatingTeam._id;
      const teamName = team.teamName || team.name || participatingTeam.teamName || 'Unknown Team';

      if (teamId) {
        teamPoints[teamId.toString()] = {
          teamId: teamId.toString(),
          teamName: teamName,
          totalPositionPoints: 0,
          totalKillPoints: 0,
          totalPoints: 0,
          totalKills: 0,
          matchesPlayed: 0,
          chickenDinnerCount: 0,
          averagePlacement: 0,
          placements: [],
          matchHistory: [] // Track recent match points for tiebreaker
        };
      }
    });

    console.log('Initialized team points:', teamPoints);
    console.log('Selected phase:', selectedPhase);
    console.log('Available matches:', matches);

    // Filter matches by selected phase
    const filteredMatches = selectedPhase === 'all'
      ? matches
      : matches.filter(match => {
          console.log('Checking match phase:', match.tournamentPhase, 'against selected:', selectedPhase);
          return match.tournamentPhase === selectedPhase;
        });

    console.log('Filtered matches for phase calculation:', filteredMatches);

    // Calculate points from matches with BGMI rules
    filteredMatches?.forEach(match => {
      console.log('Processing match:', match.matchNumber, 'Phase:', match.tournamentPhase);
      
      match.participatingTeams?.forEach(teamResult => {
        // Handle both populated and non-populated team references
        const teamId = teamResult.team?._id || teamResult.team?.toString() || teamResult.team;
        const teamIdStr = teamId ? teamId.toString() : null;

        console.log('Processing team result:', {
          teamId: teamIdStr,
          teamName: teamResult.teamName,
          finalPosition: teamResult.finalPosition,
          kills: teamResult.kills?.total,
          points: teamResult.points
        });

        if (teamIdStr && teamPoints[teamIdStr]) {
          // Only process teams that actually played (have a position or kills)
          if (teamResult.finalPosition || (teamResult.kills?.total > 0)) {
            // BGMI Points System: Placement points + Kill points
            const placementPoints = teamResult.points?.placementPoints || getPlacementPoints(teamResult.finalPosition);
            const killPoints = teamResult.points?.killPoints || (teamResult.kills?.total || 0);
            const totalMatchPoints = placementPoints + killPoints;

            teamPoints[teamIdStr].totalPositionPoints += placementPoints;
            teamPoints[teamIdStr].totalKillPoints += killPoints;
            teamPoints[teamIdStr].totalPoints += totalMatchPoints;
            teamPoints[teamIdStr].totalKills += (teamResult.kills?.total || 0);
            teamPoints[teamIdStr].matchesPlayed += 1;
            
            // Only add placement if team actually finished the match
            if (teamResult.finalPosition) {
              teamPoints[teamIdStr].placements.push(teamResult.finalPosition);
            }

            // Track chicken dinner
            if (teamResult.chickenDinner) {
              teamPoints[teamIdStr].chickenDinnerCount += 1;
            }

            // Track match history for tiebreaker (most recent match points)
            teamPoints[teamIdStr].matchHistory.push({
              matchNumber: match.matchNumber,
              points: totalMatchPoints,
              timestamp: match.actualEndTime || match.scheduledStartTime
            });

            console.log(`Updated points for ${teamPoints[teamIdStr].teamName}:`, {
              placementPoints,
              killPoints,
              totalMatchPoints,
              totalPoints: teamPoints[teamIdStr].totalPoints
            });
          }
        } else if (teamIdStr) {
          console.warn('Team not found in participating teams:', teamIdStr);
        }
      });
    });

    // Calculate average placement
    Object.values(teamPoints).forEach(team => {
      if (team.placements.length > 0) {
        team.averagePlacement = team.placements.reduce((sum, p) => sum + p, 0) / team.placements.length;
      } else {
        team.averagePlacement = 0; // No matches played yet
      }
    });

    // Sort with BGMI tiebreaker logic: total points > position points > kill points > chicken dinners > most recent match points
    const sortedTable = Object.values(teamPoints).sort((a, b) => {
      // Primary: Total points
      if (a.totalPoints !== b.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }

      // Secondary: Total position points (placement points)
      if (a.totalPositionPoints !== b.totalPositionPoints) {
        return b.totalPositionPoints - a.totalPositionPoints;
      }

      // Tertiary: Total kill points
      if (a.totalKillPoints !== b.totalKillPoints) {
        return b.totalKillPoints - a.totalKillPoints;
      }

      // Quaternary: Number of chicken dinners
      if (a.chickenDinnerCount !== b.chickenDinnerCount) {
        return b.chickenDinnerCount - a.chickenDinnerCount;
      }

      // Quinary: Most recent match points (if available)
      const aLatestMatch = a.matchHistory.sort((x, y) => new Date(y.timestamp) - new Date(x.timestamp))[0];
      const bLatestMatch = b.matchHistory.sort((x, y) => new Date(y.timestamp) - new Date(x.timestamp))[0];

      if (aLatestMatch && bLatestMatch) {
        if (aLatestMatch.points !== bLatestMatch.points) {
          return bLatestMatch.points - aLatestMatch.points;
        }
      }

      // Final fallback: average placement (lower is better)
      if (a.averagePlacement > 0 && b.averagePlacement > 0) {
        return a.averagePlacement - b.averagePlacement;
      }

      // If one team has played and other hasn't, prioritize the one that played
      if (a.matchesPlayed !== b.matchesPlayed) {
        return b.matchesPlayed - a.matchesPlayed;
      }

      return 0; // Equal ranking
    });

    console.log('Final sorted points table:', sortedTable);
    setPointsTable(sortedTable);
  };

  // BGMI Placement Points System (updated to match your match model)
  const getPlacementPoints = (position) => {
    switch (position) {
      case 1: return 10;
      case 2: return 6;
      case 3: return 5;
      case 4: return 4;
      case 5: return 3;
      case 6: return 2;
      case 7: return 1;
      case 8: return 1;
      default: return 0; // 9th-16th positions get 0 points
    }
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-zinc-400 text-sm font-bold">{position}</span>;
    }
  };

  const exportToCSV = () => {
    const phaseSuffix = selectedPhase === 'all' ? '' : `_${selectedPhase.replace(/\s+/g, '_')}`;
    const csvContent = [
      ['Position', 'Team Name', 'Position Points', 'Kill Points', 'Total Points', 'Chicken Dinners', 'Total Kills', 'Matches Played', 'Average Placement'],
      ...pointsTable.map((team, index) => [
        index + 1,
        team.teamName,
        team.totalPositionPoints,
        team.totalKillPoints,
        team.totalPoints,
        team.chickenDinnerCount,
        team.totalKills,
        team.matchesPlayed,
        team.averagePlacement > 0 ? team.averagePlacement.toFixed(2) : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournament.tournamentName}_points_table${phaseSuffix}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get unique phases from matches
  const availablePhases = [...new Set(matches.map(match => match.tournamentPhase))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading points table...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Points Table</h3>
        <button
          onClick={exportToCSV}
          disabled={pointsTable.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Phase Selector */}
      {availablePhases.length > 0 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-zinc-300">Phase:</label>
          <div className="relative">
            <button
              onClick={() => setIsPhaseDropdownOpen(!isPhaseDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors min-w-[160px] justify-between"
            >
              <span className="truncate">
                {selectedPhase === 'all' ? 'All Phases' : selectedPhase}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isPhaseDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPhaseDropdownOpen && (
              <div className="absolute top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    setSelectedPhase('all');
                    setIsPhaseDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-zinc-700 transition-colors first:rounded-t-lg"
                >
                  All Phases
                </button>
                {availablePhases.map((phase, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedPhase(phase);
                      setIsPhaseDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-zinc-700 transition-colors last:rounded-b-lg"
                  >
                    {phase}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="text-sm text-zinc-400">
            {selectedPhase === 'all' ? `All ${matches.length} matches` : 
             `${matches.filter(m => m.tournamentPhase === selectedPhase).length} matches in ${selectedPhase}`}
          </div>
        </div>
      )}

      <div className="bg-zinc-800/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Position Pts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Kill Pts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Total Pts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  🏆 WD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Kills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Matches
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Avg Place
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {pointsTable.map((team, index) => (
                <tr key={team.teamId} className="hover:bg-zinc-800/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getPositionIcon(index + 1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {team.teamName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-400 font-bold">
                      {team.totalPositionPoints}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-blue-400 font-bold">
                      {team.totalKillPoints}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white font-bold">
                      {team.totalPoints}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-amber-400 font-bold">
                      {team.chickenDinnerCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-red-400">
                      {team.totalKills}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {team.matchesPlayed}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {team.averagePlacement > 0 ? team.averagePlacement.toFixed(1) : 'N/A'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pointsTable.length === 0 && !loading && (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">
            {matches.length === 0 
              ? "No match results yet. Points table will be generated automatically as matches are completed."
              : "No results found for the selected phase."
            }
          </p>
          {selectedPhase !== 'all' && matches.length > 0 && (
            <button
              onClick={() => setSelectedPhase('all')}
              className="mt-2 text-orange-400 hover:text-orange-300"
            >
              View all phases
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PointsTable;