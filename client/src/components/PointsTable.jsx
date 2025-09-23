import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Download, Edit, Save, Check, X as XIcon } from 'lucide-react';

const PointsTable = ({ tournament, onUpdate }) => {
  const [pointsTable, setPointsTable] = useState([]);

  useEffect(() => {
    calculatePointsTable();
  }, [tournament.matches]);

  const calculatePointsTable = () => {
    const teamPoints = {};

    // Initialize teams
    tournament.participatingTeams?.forEach(team => {
      teamPoints[team._id] = {
        teamId: team._id,
        teamName: team.teamName,
        totalPoints: 0,
        totalKills: 0,
        matchesPlayed: 0,
        averagePlacement: 0,
        placements: []
      };
    });

    // Calculate points from matches with BGMI rules
    tournament.matches?.forEach(match => {
      match.results?.forEach(result => {
        if (teamPoints[result.teamId]) {
          // BGMI Points System: Placement points + Kill points
          const placementPoints = getPlacementPoints(result.position);
          const killPoints = result.kills * 1; // 1 point per kill
          const totalMatchPoints = placementPoints + killPoints;

          teamPoints[result.teamId].totalPoints += totalMatchPoints;
          teamPoints[result.teamId].totalKills += result.kills;
          teamPoints[result.teamId].matchesPlayed += 1;
          teamPoints[result.teamId].placements.push(result.position);
        }
      });
    });

    // Calculate average placement
    Object.values(teamPoints).forEach(team => {
      if (team.placements.length > 0) {
        team.averagePlacement = team.placements.reduce((sum, p) => sum + p, 0) / team.placements.length;
      }
    });

    const sortedTable = Object.values(teamPoints).sort((a, b) => {
      if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints;
      if (a.totalKills !== b.totalKills) return b.totalKills - a.totalKills;
      return a.averagePlacement - b.averagePlacement;
    });

    setPointsTable(sortedTable);
  };

  // BGMI Placement Points System
  const getPlacementPoints = (position) => {
    switch (position) {
      case 1: return 15;
      case 2: return 12;
      case 3: return 10;
      case 4: return 8;
      case 5: return 6;
      case 6: return 4;
      case 7: return 2;
      case 8: return 1;
      case 9: return 1;
      case 10: return 1;
      case 11: return 1;
      case 12: return 1;
      case 13: return 1;
      case 14: return 1;
      case 15: return 1;
      case 16: return 0;
      default: return 0;
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
    const csvContent = [
      ['Position', 'Team Name', 'Total Points', 'Total Kills', 'Matches Played', 'Average Placement'],
      ...pointsTable.map((team, index) => [
        index + 1,
        team.teamName,
        team.totalPoints,
        team.totalKills,
        team.matchesPlayed,
        team.averagePlacement.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournament.tournamentName}_points_table.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Points Table</h3>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

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
                  Points
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
                    <div className="text-sm text-white font-bold">
                      {team.totalPoints}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
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
                      {team.averagePlacement.toFixed(1)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pointsTable.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No match results yet. Points table will be generated automatically as matches are completed.</p>
        </div>
      )}
    </div>
  );
};

export default PointsTable;
