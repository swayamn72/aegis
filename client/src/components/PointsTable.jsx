import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Download, AlertCircle, ChevronDown, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

const PointsTable = ({ tournament, onUpdate }) => {
  const [pointsTable, setPointsTable] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('overall');
  const [isPhaseDropdownOpen, setIsPhaseDropdownOpen] = useState(false);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch matches for the tournament
  useEffect(() => {
    if (tournament?._id) {
      fetchMatches();
    }
  }, [tournament?._id]);

  // Recalculate points table when phase, group, or data changes
  useEffect(() => {
    calculatePointsTable();
  }, [selectedPhase, selectedGroup, tournament, matches]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/matches/tournament/${tournament._id}`);
      if (response.ok) {
        const matchesData = await response.json();
        // Ensure matches is always an array
        if (Array.isArray(matchesData)) {
          setMatches(matchesData);
        } else if (Array.isArray(matchesData.matches)) {
          setMatches(matchesData.matches);
        } else {
          setMatches([]);
        }
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
    if (!tournament) {
      setPointsTable([]);
      return;
    }

    let standingsData = [];

    const useStandings = () => {
      if (!selectedPhase) {
        // Overall from finalStandings
        if (tournament.finalStandings && tournament.finalStandings.length > 0) {
          return tournament.finalStandings.map(standing => ({
            teamId: standing.team._id,
            teamName: standing.team.teamName,
            teamLogo: standing.team.logo,
            position: standing.position,
            points: standing.tournamentPointsAwarded || 0,
            kills: 0,
            matchesPlayed: 0,
            chickenDinners: 0,
            totalPositionPoints: 0,
            totalKillPoints: 0,
            totalPoints: standing.tournamentPointsAwarded || 0,
            source: 'final'
          }));
        }
        return [];
      }

      const phase = tournament.phases?.find(p => p.name === selectedPhase);
      if (!phase) return [];

      if (phase.groups && phase.groups.length > 0) {
        if (selectedGroup === 'overall') {
          const aggregated = [];
          phase.groups.forEach(group => {
            group.standings?.forEach(standing => {
              if (standing.team) {
                aggregated.push({
                  teamId: standing.team._id,
                  teamName: standing.team.teamName,
                  teamLogo: standing.team.logo,
                  position: 0,
                  points: standing.points,
                  kills: standing.kills,
                  matchesPlayed: standing.matchesPlayed,
                  chickenDinners: standing.chickenDinners || 0,
                  totalPositionPoints: 0,
                  totalKillPoints: standing.kills,
                  totalPoints: standing.points,
                  source: 'standings'
                });
              }
            });
          });
          // Dedupe by highest points
          const unique = {};
          aggregated.forEach(s => {
            const id = s.teamId;
            if (!unique[id] || unique[id].totalPoints < s.totalPoints) {
              unique[id] = s;
            }
          });
          return Object.values(unique);
        } else {
          const group = phase.groups.find(g => g.name === selectedGroup);
          if (group && group.standings && group.standings.length > 0) {
            return group.standings.map(standing => ({
              teamId: standing.team._id,
              teamName: standing.team.teamName,
              teamLogo: standing.team.logo,
              position: standing.position,
              points: standing.points,
              kills: standing.kills,
              matchesPlayed: standing.matchesPlayed,
              chickenDinners: standing.chickenDinners || 0,
              totalPositionPoints: 0,
              totalKillPoints: standing.kills,
              totalPoints: standing.points,
              source: 'standings'
            }));
          }
        }
      } else {
        // No groups, check if phase has some standings (though model doesn't have phase-level standings)
        return phase.teams?.map(team => ({
          teamId: team._id,
          teamName: team.teamName,
          teamLogo: team.logo,
          position: 0,
          points: 0,
          kills: 0,
          matchesPlayed: 0,
          chickenDinners: 0,
          totalPositionPoints: 0,
          totalKillPoints: 0,
          totalPoints: 0,
          source: 'teams'
        })) || [];
      }
      return [];
    };

    standingsData = useStandings();

    // If no standings data, fallback to match calculation
    if (standingsData.length === 0 && matches.length > 0) {
      console.log('No standings found, calculating from matches');
      standingsData = calculateFromMatches();
    }

    // Sort and assign positions
    const sortedStandings = standingsData.sort((a, b) => {
      if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints;
      if (a.kills !== b.kills) return b.kills - a.kills;
      if (a.chickenDinners !== b.chickenDinners) return b.chickenDinners - a.chickenDinners;
      if (a.matchesPlayed !== b.matchesPlayed) return b.matchesPlayed - a.matchesPlayed;
      return 0;
    });

    sortedStandings.forEach((team, index) => {
      team.position = index + 1;
    });

    // Estimate average placement
    sortedStandings.forEach(team => {
      team.averagePlacement = team.matchesPlayed > 0 ? (team.position / team.matchesPlayed) : 0;
    });

    setPointsTable(sortedStandings);
  };

  const calculateFromMatches = () => {
    const teamPoints = {};

    // Initialize relevant teams
    let relevantTeams = tournament.participatingTeams || [];
    if (selectedGroup !== 'overall' && selectedPhase) {
      const phase = tournament.phases?.find(p => p.name === selectedPhase);
      const groupTeams = phase?.groups?.find(g => g.name === selectedGroup)?.teams || [];
      relevantTeams = relevantTeams.filter(pt => {
        const ptTeamId = pt.team?._id || pt.team || pt._id;
        return groupTeams.some(gt => {
          const gtTeamId = gt?._id || gt;
          return ptTeamId?.toString() === gtTeamId?.toString();
        });
      });
    }

    relevantTeams.forEach(participatingTeam => {
      const team = participatingTeam.team || participatingTeam;
      const teamId = team._id || participatingTeam._id;
      const teamName = team.teamName || team.name || participatingTeam.teamName || 'Unknown Team';

      if (teamId) {
        // Find logo from tournament participating teams
        const participatingTeamData = tournament.participatingTeams?.find(pt => {
          const ptTeamId = pt.team?._id || pt.team || pt._id;
          return ptTeamId?.toString() === teamId.toString();
        });
        const teamLogo = team.logo || participatingTeamData?.team?.logo || participatingTeamData?.logo;

        teamPoints[teamId.toString()] = {
          teamId: teamId.toString(),
          teamName: teamName,
          teamLogo: teamLogo,
          totalPositionPoints: 0,
          totalKillPoints: 0,
          totalPoints: 0,
          kills: 0,
          matchesPlayed: 0,
          chickenDinners: 0,
          averagePlacement: 0,
          placements: [],
          matchHistory: [],
          source: 'matches'
        };
      }
    });

    // Filter matches
    let filteredMatches = matches;
    if (selectedPhase) {
      filteredMatches = matches.filter(match => match.tournamentPhase === selectedPhase);
    }

    // Process matches
    filteredMatches.forEach(match => {
      match.participatingTeams?.forEach(teamResult => {
        // Handle both populated and non-populated team data
        const teamId = teamResult.team?._id || teamResult.team || teamResult._id;
        const teamIdStr = teamId ? teamId.toString() : null;

        if (teamIdStr && teamPoints[teamIdStr]) {
          const position = teamResult.finalPosition;
          const kills = teamResult.kills?.total || 0;

          if (position || kills > 0) {
            const placementPoints = getPlacementPoints(position);
            const killPoints = kills;
            const totalMatchPoints = placementPoints + killPoints;

            teamPoints[teamIdStr].totalPositionPoints += placementPoints;
            teamPoints[teamIdStr].totalKillPoints += killPoints;
            teamPoints[teamIdStr].totalPoints += totalMatchPoints;
            teamPoints[teamIdStr].kills += kills;
            teamPoints[teamIdStr].matchesPlayed += 1;

            if (position) {
              teamPoints[teamIdStr].placements.push(position);
            }

            if (teamResult.chickenDinner) {
              teamPoints[teamIdStr].chickenDinners += 1;
            }

            teamPoints[teamIdStr].matchHistory.push({
              matchNumber: match.matchNumber,
              points: totalMatchPoints,
              timestamp: match.scheduledStartTime
            });
          }
        }
      });
    });

    // Calculate average placement
    Object.values(teamPoints).forEach(team => {
      if (team.placements.length > 0) {
        team.averagePlacement = team.placements.reduce((sum, p) => sum + p, 0) / team.placements.length;
      }
    });

    return Object.values(teamPoints);
  };

  // BGMI Placement Points System
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
    const phaseSuffix = selectedPhase ? `_${selectedPhase.replace(/\s+/g, '_')}` : '';
    const groupSuffix = selectedGroup !== 'overall' ? `_${selectedGroup.replace(/\s+/g, '_')}` : '';
    const csvContent = [
      ['Position', 'Team Name', 'Matches', 'WD', 'Position Points', 'Kill Points', 'Total Points'],
      ...pointsTable.map((team, index) => [
        team.position || index + 1,
        team.teamName,
        team.matchesPlayed || 0,
        team.chickenDinners || 0,
        team.totalPositionPoints || 0,
        team.totalKillPoints || 0,
        team.totalPoints
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournament.tournamentName}_points_table${phaseSuffix}${groupSuffix}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadImage = async () => {
    try {
      // Helper function to load image and return img element
      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = document.createElement('img');
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      // Create a new container with inline styles that html2canvas can handle
      const container = document.createElement('div');
      container.style.cssText = `
        background-color: #1f2937;
        padding: 16px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #ffffff;
        width: fit-content;
        min-width: 800px;
      `;

      // Create header with tournament title and phase
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #374151;
      `;

      // Add tournament logo if available
      if (tournament.media?.logo) {
        console.log('Tournament logo:', tournament.media.logo);
        try {
          const logoSrc = tournament.media.logo.startsWith('/') ? `http://localhost:5000${tournament.media.logo}` : tournament.media.logo;
          console.log('Logo src:', logoSrc);
          const logoImg = await loadImage(logoSrc);
          logoImg.alt = tournament.tournamentName;
          logoImg.style.cssText = 'width: 48px; height: 48px; border-radius: 8px; object-fit: cover; flex-shrink: 0;';
          header.appendChild(logoImg);
          console.log('Logo loaded successfully');
        } catch (error) {
          console.warn('Failed to load tournament logo:', error);
          // Continue without logo
        }
      } else {
        console.log('No tournament logo available');
      }

      const textDiv = document.createElement('div');
      textDiv.style.cssText = 'text-align: center;';

      const title = document.createElement('h1');
      title.style.cssText = `
        font-size: 24px;
        font-weight: bold;
        color: #ffffff;
        margin: 0 0 8px 0;
      `;
      title.textContent = tournament.tournamentName;

      const phaseInfo = document.createElement('p');
      phaseInfo.style.cssText = `
        font-size: 16px;
        color: #a1a1aa;
        margin: 0;
      `;
      phaseInfo.textContent = selectedPhase ? `Phase: ${selectedPhase}${selectedGroup !== 'overall' ? ` - Group: ${selectedGroup}` : ''}` : 'All Phases';

      textDiv.appendChild(title);
      textDiv.appendChild(phaseInfo);
      header.appendChild(textDiv);
      container.appendChild(header);

      // Create table
      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        background-color: #1f2937;
        color: #ffffff;
      `;

      // Create thead
      const thead = document.createElement('thead');
      thead.style.cssText = 'background-color: #27272a;';

      const headerRow = document.createElement('tr');
      const headers = ['Position', 'Team', 'Matches', '🏆 WD', 'Position Pts', 'Kill Pts', 'Total Pts'];

      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.style.cssText = `
          padding: 12px 24px;
          text-align: left;
          font-size: 12px;
          font-weight: 500;
          color: #a1a1aa;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #374151;
        `;
        th.textContent = headerText;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Create tbody
      const tbody = document.createElement('tbody');

      pointsTable.forEach((team, index) => {
        const row = document.createElement('tr');
        row.style.cssText = 'border-bottom: 1px solid #374151; height: 56px;';

        // Position
        const posCell = document.createElement('td');
        posCell.style.cssText = 'padding: 16px 24px; white-space: nowrap; display: table-cell; vertical-align: middle;';
        const posDiv = document.createElement('div');
        posDiv.style.cssText = 'display: flex; align-items: center; justify-content: center; gap: 8px; height: 24px;';
        const posText = document.createElement('span');
        posText.style.cssText = 'display: inline-block; width: 20px; height: 20px; line-height: 20px; text-align: center; color: #a1a1aa; font-size: 14px; font-weight: bold; vertical-align: middle;';
        posText.textContent = team.position || index + 1;
        posDiv.appendChild(posText);
        posCell.appendChild(posDiv);
        row.appendChild(posCell);

        // Team Name
        const teamCell = document.createElement('td');
        teamCell.style.cssText = 'padding: 16px 24px; white-space: nowrap; display: table-cell; vertical-align: middle;';
        const teamDiv = document.createElement('div');
        teamDiv.style.cssText = 'display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; color: #ffffff; height: 24px;';

        // Add logo if available
        if (team.teamLogo) {
          const logoImg = document.createElement('img');
          logoImg.src = team.teamLogo;
          logoImg.alt = team.teamName;
          logoImg.style.cssText = 'width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex-shrink: 0; margin-top: 2px;';
          teamDiv.appendChild(logoImg);
        } else {
          // Fallback to initial
          const logoDiv = document.createElement('div');
          logoDiv.style.cssText = 'width: 24px; height: 24px; border-radius: 50%; background-color: #52525b; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: #d4d4d8; flex-shrink: 0;';
          logoDiv.textContent = team.teamName.charAt(0).toUpperCase();
          teamDiv.appendChild(logoDiv);
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = team.teamName;
        teamDiv.appendChild(nameSpan);

        teamCell.appendChild(teamDiv);
        row.appendChild(teamCell);

        // Matches
        const matchesCell = document.createElement('td');
        matchesCell.style.cssText = 'padding: 16px 24px; white-space: nowrap; display: table-cell; vertical-align: middle;';
        const matchesDiv = document.createElement('div');
        matchesDiv.style.cssText = 'font-size: 14px; color: #ffffff; display: flex; align-items: center; height: 24px;';
        matchesDiv.textContent = team.matchesPlayed;
        matchesCell.appendChild(matchesDiv);
        row.appendChild(matchesCell);

        // Chicken Dinners
        const wdCell = document.createElement('td');
        wdCell.style.cssText = 'padding: 16px 24px; white-space: nowrap; display: table-cell; vertical-align: middle;';
        const wdDiv = document.createElement('div');
        wdDiv.style.cssText = 'font-size: 14px; color: #fbbf24; font-weight: bold; display: flex; align-items: center; height: 24px;';
        wdDiv.textContent = team.chickenDinners;
        wdCell.appendChild(wdDiv);
        row.appendChild(wdCell);

        // Position Points
        const posPtsCell = document.createElement('td');
        posPtsCell.style.cssText = 'padding: 16px 24px; white-space: nowrap; display: table-cell; vertical-align: middle;';
        const posPtsDiv = document.createElement('div');
        posPtsDiv.style.cssText = 'font-size: 14px; color: #22c55e; font-weight: bold; display: flex; align-items: center; height: 24px;';
        posPtsDiv.textContent = team.totalPositionPoints || 0;
        posPtsCell.appendChild(posPtsDiv);
        row.appendChild(posPtsCell);

        // Kill Points
        const killPtsCell = document.createElement('td');
        killPtsCell.style.cssText = 'padding: 16px 24px; white-space: nowrap; display: table-cell; vertical-align: middle;';
        const killPtsDiv = document.createElement('div');
        killPtsDiv.style.cssText = 'font-size: 14px; color: #3b82f6; font-weight: bold; display: flex; align-items: center; height: 24px;';
        killPtsDiv.textContent = team.totalKillPoints || 0;
        killPtsCell.appendChild(killPtsDiv);
        row.appendChild(killPtsCell);

        // Total Points
        const totalPtsCell = document.createElement('td');
        totalPtsCell.style.cssText = 'padding: 16px 24px; white-space: nowrap; display: table-cell; vertical-align: middle;';
        const totalPtsDiv = document.createElement('div');
        totalPtsDiv.style.cssText = 'font-size: 14px; color: #ffffff; font-weight: bold; display: flex; align-items: center; height: 24px;';
        totalPtsDiv.textContent = team.totalPoints;
        totalPtsCell.appendChild(totalPtsDiv);
        row.appendChild(totalPtsCell);

        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      container.appendChild(table);

      // Temporarily add to DOM
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        backgroundColor: '#1f2937',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false
      });

      // Remove from DOM
      document.body.removeChild(container);

      const link = document.createElement('a');
      link.download = `${tournament.tournamentName}_points_table${selectedPhase ? `_${selectedPhase.replace(/\s+/g, '_')}` : ''}${selectedGroup !== 'overall' ? `_${selectedGroup.replace(/\s+/g, '_')}` : ''}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      setError('Failed to generate image. Please try again.');
    }
  };

  // Get available phases
  const availablePhases = tournament.phases ? tournament.phases.map(phase => phase.name) : [];

  // Get available groups for selected phase
  const selectedPhaseObj = tournament.phases?.find(p => p.name === selectedPhase);
  const availableGroups = selectedPhaseObj?.groups && selectedPhaseObj.groups.length > 0
    ? ['overall', ...selectedPhaseObj.groups.map(g => g.name)]
    : [];

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
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMatches}
            disabled={loading}
            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
          >
            <span>↻</span>
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            disabled={pointsTable.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={downloadImage}
            disabled={pointsTable.length === 0}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Download Image
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Phase Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-zinc-300">Phase:</label>
        <div className="relative">
          <button
            onClick={() => setIsPhaseDropdownOpen(!isPhaseDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors min-w-[160px] justify-between"
          >
            <span className="truncate">
              {selectedPhase || 'All Phases'}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isPhaseDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPhaseDropdownOpen && (
            <div className="absolute top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setSelectedPhase('');
                  setSelectedGroup('overall');
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
                    setSelectedGroup('overall');
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
      </div>

      {/* Group Selector - only show if phase has groups */}
      {selectedPhase && availableGroups.length > 1 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-zinc-300">Group:</label>
          <div className="relative">
            <button
              onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors min-w-[160px] justify-between"
            >
              <span className="truncate">{selectedGroup}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isGroupDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isGroupDropdownOpen && (
              <div className="absolute top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10">
                {availableGroups.map((group, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsGroupDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-zinc-700 transition-colors"
                  >
                    {group}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="text-sm text-zinc-400">
            Showing {selectedGroup} standings for {selectedPhase}
          </div>
        </div>
      )}

      <div className="bg-zinc-800/50 rounded-lg overflow-hidden points-table-container">
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
                  Matches
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  🏆 WD
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
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {pointsTable.map((team, index) => (
                <tr key={team.teamId} className="hover:bg-zinc-800/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getPositionIcon(team.position || index + 1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {team.teamLogo ? (
                        <img
                          src={team.teamLogo.startsWith('/') ? `http://localhost:5000${team.teamLogo}` : team.teamLogo}
                          alt={team.teamName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-zinc-600 rounded-full flex items-center justify-center">
                          <span className="text-xs text-zinc-300 font-bold">
                            {team.teamName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="text-sm font-medium text-white">
                        {team.teamName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {team.matchesPlayed}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-amber-400 font-bold">
                      {team.chickenDinners}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-400 font-bold">
                      {team.totalPositionPoints || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-blue-400 font-bold">
                      {team.totalKillPoints || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white font-bold">
                      {team.totalPoints}
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
              : selectedPhase
                ? `No results found for ${selectedPhase} ${selectedGroup}.`
                : "No standings available yet."
            }
          </p>
          {selectedPhase && (
            <button
              onClick={() => {
                setSelectedPhase('');
                setSelectedGroup('overall');
              }}
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
