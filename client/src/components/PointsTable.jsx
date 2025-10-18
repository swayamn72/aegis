import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Trophy, Medal, Award, Download, AlertCircle, ChevronDown, Image as ImageIcon, CheckCircle, ArrowRight, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';

const PointsTable = ({ tournament, onUpdate }) => {
  const [pointsTable, setPointsTable] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('overall');
  const [isPhaseDropdownOpen, setIsPhaseDropdownOpen] = useState(false);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advancingPhase, setAdvancingPhase] = useState(false);
  const [advancePreview, setAdvancePreview] = useState(null);

  const calculationTimeoutRef = useRef(null);
  const lastCalculationKeyRef = useRef('');

  useEffect(() => {
    if (tournament?._id) {
      fetchMatches();
    }
  }, [tournament?._id]);

  const calculatePointsTable = useCallback(() => {
    if (!tournament) {
      setPointsTable([]);
      return;
    }

    const calculationKey = `${selectedPhase}-${selectedGroup}-${tournament._id}-${matches.length}`;
    if (lastCalculationKeyRef.current === calculationKey) return;
    lastCalculationKeyRef.current = calculationKey;

    if (calculationTimeoutRef.current) clearTimeout(calculationTimeoutRef.current);

    calculationTimeoutRef.current = setTimeout(() => {
      let standingsData = [];

      if (!selectedPhase) {
        // Show overall final standings
        if (tournament.finalStandings && tournament.finalStandings.length > 0) {
          standingsData = tournament.finalStandings.map(standing => ({
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
      } else {
        const phase = tournament.phases?.find(p => p.name === selectedPhase);
        if (phase) {
          if (phase.groups && phase.groups.length > 0) {
            if (selectedGroup === 'overall') {
              const overallGroup = phase.groups.find(g => g.name === 'overall');
              if (overallGroup && overallGroup.standings) {
                standingsData = overallGroup.standings.map(s => ({
                  teamId: s.team._id,
                  teamName: s.team.teamName,
                  teamLogo: s.team.logo,
                  position: s.position,
                  points: s.points,
                  kills: s.kills,
                  matchesPlayed: s.matchesPlayed,
                  chickenDinners: s.chickenDinners || 0,
                  totalPositionPoints: 0,
                  totalKillPoints: s.kills,
                  totalPoints: s.points,
                  source: 'standings'
                }));
              }
            } else {
              const group = phase.groups.find(g => g.name === selectedGroup);
              if (group && group.standings) {
                standingsData = group.standings.map(s => ({
                  teamId: s.team._id,
                  teamName: s.team.teamName,
                  teamLogo: s.team.logo,
                  position: s.position,
                  points: s.points,
                  kills: s.kills,
                  matchesPlayed: s.matchesPlayed,
                  chickenDinners: s.chickenDinners || 0,
                  totalPositionPoints: 0,
                  totalKillPoints: s.kills,
                  totalPoints: s.points,
                  source: 'standings'
                }));
              }
            }
          }
        }
      }

      // Fallback to match calculation if no standings
      if (standingsData.length === 0 && matches.length > 0) {
        standingsData = calculateFromMatches();
      }

      const sortedStandings = standingsData.sort((a, b) => {
        if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints;
        if (a.kills !== b.kills) return b.kills - a.kills;
        if (a.chickenDinners !== b.chickenDinners) return b.chickenDinners - a.chickenDinners;
        return b.matchesPlayed - a.matchesPlayed;
      });

      sortedStandings.forEach((team, index) => {
        team.position = index + 1;
        team.averagePlacement = team.matchesPlayed > 0 ? (team.position / team.matchesPlayed) : 0;
      });

      setPointsTable(sortedStandings);
    }, 100);
  }, [selectedPhase, selectedGroup, tournament, matches]);

  useEffect(() => {
    calculatePointsTable();
  }, [calculatePointsTable]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/matches/tournament/${tournament._id}`);
      if (response.ok) {
        const matchesData = await response.json();
        setMatches(Array.isArray(matchesData) ? matchesData : (matchesData.matches || []));
      } else {
        setError('Failed to fetch matches');
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const calculateFromMatches = () => {
    const teamPoints = {};
    let relevantTeams = tournament.participatingTeams || [];

    // Filter teams based on phase selection
    if (selectedPhase) {
      const phase = tournament.phases?.find(p => p.name === selectedPhase);
      
      if (selectedGroup !== 'overall') {
        // Show only teams from specific group
        const groupTeams = phase?.groups?.find(g => g.name === selectedGroup)?.teams || [];
        relevantTeams = relevantTeams.filter(pt => {
          const ptTeamId = pt.team?._id || pt.team || pt._id;
          return groupTeams.some(gt => {
            const gtTeamId = gt?._id || gt;
            return ptTeamId?.toString() === gtTeamId?.toString();
          });
        });
      } else {
        // Show only teams that are part of this phase (from phase.teams or any group in this phase)
        const phaseTeamIds = new Set();
        
        // Add teams directly assigned to phase
        if (phase?.teams) {
          phase.teams.forEach(t => {
            const teamId = t?._id || t;
            if (teamId) phaseTeamIds.add(teamId.toString());
          });
        }
        
        // Add teams from all groups in this phase
        if (phase?.groups) {
          phase.groups.forEach(group => {
            if (group.teams) {
              group.teams.forEach(t => {
                const teamId = t?._id || t;
                if (teamId) phaseTeamIds.add(teamId.toString());
              });
            }
          });
        }
        
        // Filter to only teams in this phase
        if (phaseTeamIds.size > 0) {
          relevantTeams = relevantTeams.filter(pt => {
            const ptTeamId = pt.team?._id || pt.team || pt._id;
            return ptTeamId && phaseTeamIds.has(ptTeamId.toString());
          });
        }
      }
    }

    relevantTeams.forEach(participatingTeam => {
      const team = participatingTeam.team || participatingTeam;
      const teamId = team._id || participatingTeam._id;
      const teamName = team.teamName || team.name || participatingTeam.teamName || 'Unknown Team';

      if (teamId) {
        const participatingTeamData = tournament.participatingTeams?.find(pt => {
          const ptTeamId = pt.team?._id || pt.team || pt._id;
          return ptTeamId?.toString() === teamId.toString();
        });
        const teamLogo = team.logo || participatingTeamData?.team?.logo || participatingTeamData?.logo;

        teamPoints[teamId.toString()] = {
          teamId: teamId.toString(),
          teamName,
          teamLogo,
          totalPositionPoints: 0,
          totalKillPoints: 0,
          totalPoints: 0,
          kills: 0,
          matchesPlayed: 0,
          chickenDinners: 0,
          averagePlacement: 0,
          placements: [],
          source: 'matches'
        };
      }
    });

    let filteredMatches = matches;
    if (selectedPhase) {
      filteredMatches = matches.filter(match => match.tournamentPhase === selectedPhase);
    }

    filteredMatches.forEach(match => {
      match.participatingTeams?.forEach(teamResult => {
        const teamId = teamResult.team?._id || teamResult.team || teamResult._id;
        const teamIdStr = teamId ? teamId.toString() : null;

        if (teamIdStr && teamPoints[teamIdStr]) {
          const position = teamResult.finalPosition;
          const kills = teamResult.kills?.total || 0;

          if (position || kills > 0) {
            const placementPoints = getPlacementPoints(position);
            const totalMatchPoints = placementPoints + kills;

            teamPoints[teamIdStr].totalPositionPoints += placementPoints;
            teamPoints[teamIdStr].totalKillPoints += kills;
            teamPoints[teamIdStr].totalPoints += totalMatchPoints;
            teamPoints[teamIdStr].kills += kills;
            teamPoints[teamIdStr].matchesPlayed += 1;

            if (position) teamPoints[teamIdStr].placements.push(position);
            if (teamResult.chickenDinner) teamPoints[teamIdStr].chickenDinners += 1;
          }
        }
      });
    });

    Object.values(teamPoints).forEach(team => {
      if (team.placements.length > 0) {
        team.averagePlacement = team.placements.reduce((sum, p) => sum + p, 0) / team.placements.length;
      }
    });

    return Object.values(teamPoints);
  };

  const getPlacementPoints = (position) => {
    const pointsMap = { 1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1 };
    return pointsMap[position] || 0;
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-zinc-400 text-sm font-bold">{position}</span>;
    }
  };

  const generateAdvancePreview = () => {
    if (!selectedPhase) return null;

    const phase = tournament.phases?.find(p => p.name === selectedPhase);
    if (!phase || !phase.qualificationRules || phase.qualificationRules.length === 0) {
      return null;
    }

    const preview = { teamsToAdvance: [], rules: [] };

    phase.qualificationRules.forEach(rule => {
      const numberOfTeams = rule.numberOfTeams || 0;
      const source = rule.source || 'overall';
      const nextPhaseName = tournament.phases?.find(p => 
        p._id?.toString() === rule.nextPhase?.toString() || p.name === rule.nextPhase
      )?.name || 'Next Phase';

      let selectedTeams = [];

      if (source === 'overall') {
        selectedTeams = pointsTable.slice(0, numberOfTeams);
      } else if (source === 'from_each_group') {
        if (phase.groups && phase.groups.length > 0) {
          phase.groups.forEach(group => {
            if (group.name === 'overall') return;
            const groupStandings = pointsTable.filter(team => {
              const groupTeamIds = group.teams?.map(t => t._id?.toString() || t.toString()) || [];
              return groupTeamIds.includes(team.teamId);
            }).slice(0, numberOfTeams);
            selectedTeams.push(...groupStandings);
          });
        }
      }

      preview.rules.push({
        numberOfTeams,
        source,
        nextPhase: nextPhaseName,
        teams: selectedTeams
      });

      preview.teamsToAdvance.push(...selectedTeams);
    });

    preview.teamsToAdvance = Array.from(
      new Map(preview.teamsToAdvance.map(t => [t.teamId, t])).values()
    );

    return preview;
  };

  const handleAdvancePhaseClick = () => {
    if (!selectedPhase) {
      toast.error('Please select a phase to advance');
      return;
    }

    const preview = generateAdvancePreview();
    setAdvancePreview(preview);
    setShowAdvanceModal(true);
  };

  const handleAdvancePhase = async () => {
    if (!selectedPhase) {
      toast.error('Please select a phase to advance');
      return;
    }

    setAdvancingPhase(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/org-tournaments/${tournament._id}/advance-phase`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phaseName: selectedPhase })
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success(`Successfully advanced ${result.teamsAdvanced} teams from ${selectedPhase}`);
        setShowAdvanceModal(false);
        setAdvancePreview(null);
        
        if (onUpdate) await onUpdate();
        await fetchMatches();
        calculatePointsTable();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to advance phase');
        setError(error.error || 'Failed to advance phase');
      }
    } catch (err) {
      console.error('Error advancing phase:', err);
      toast.error('Failed to advance phase');
      setError('Failed to advance phase');
    } finally {
      setAdvancingPhase(false);
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
    toast.success('CSV exported successfully');
  };

  const downloadImage = async () => {
    try {
      const container = document.createElement('div');
      container.style.cssText = `
        background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
        padding: 32px;
        border-radius: 16px;
        font-family: system-ui, -apple-system, sans-serif;
        width: 900px;
      `;

      const header = document.createElement('div');
      header.style.cssText = `
        text-align: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 2px solid #374151;
      `;

      const title = document.createElement('h1');
      title.style.cssText = `
        font-size: 28px;
        font-weight: bold;
        color: #ffffff;
        margin: 0 0 8px 0;
      `;
      title.textContent = tournament.tournamentName;

      const subtitle = document.createElement('p');
      subtitle.style.cssText = `
        font-size: 16px;
        color: #9ca3af;
        margin: 0;
      `;
      subtitle.textContent = selectedPhase 
        ? `${selectedPhase}${selectedGroup !== 'overall' ? ` - ${selectedGroup}` : ''}` 
        : 'Overall Standings';

      header.appendChild(title);
      header.appendChild(subtitle);
      container.appendChild(header);

      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        background-color: #1f2937;
      `;

      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['#', 'Team', 'Matches', '🏆', 'Pos Pts', 'Kill Pts', 'Total'].forEach(text => {
        const th = document.createElement('th');
        th.style.cssText = `
          padding: 12px 16px;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background-color: #374151;
        `;
        th.textContent = text;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      pointsTable.forEach((team, index) => {
        const row = document.createElement('tr');
        row.style.cssText = `
          border-bottom: 1px solid #374151;
          ${index < 3 ? 'background-color: rgba(251, 146, 60, 0.1);' : ''}
        `;

        // Position
        const posCell = document.createElement('td');
        posCell.style.cssText = 'padding: 16px; font-weight: bold; color: #f59e0b;';
        posCell.textContent = team.position || index + 1;
        row.appendChild(posCell);

        // Team
        const teamCell = document.createElement('td');
        teamCell.style.cssText = 'padding: 16px; color: #ffffff; font-weight: 500;';
        teamCell.textContent = team.teamName;
        row.appendChild(teamCell);

        // Matches
        const matchesCell = document.createElement('td');
        matchesCell.style.cssText = 'padding: 16px; color: #d1d5db;';
        matchesCell.textContent = team.matchesPlayed;
        row.appendChild(matchesCell);

        // WD
        const wdCell = document.createElement('td');
        wdCell.style.cssText = 'padding: 16px; color: #fbbf24; font-weight: bold;';
        wdCell.textContent = team.chickenDinners;
        row.appendChild(wdCell);

        // Position Points
        const posPtsCell = document.createElement('td');
        posPtsCell.style.cssText = 'padding: 16px; color: #22c55e; font-weight: 600;';
        posPtsCell.textContent = team.totalPositionPoints || 0;
        row.appendChild(posPtsCell);

        // Kill Points
        const killPtsCell = document.createElement('td');
        killPtsCell.style.cssText = 'padding: 16px; color: #3b82f6; font-weight: 600;';
        killPtsCell.textContent = team.totalKillPoints || 0;
        row.appendChild(killPtsCell);

        // Total
        const totalCell = document.createElement('td');
        totalCell.style.cssText = 'padding: 16px; color: #ffffff; font-weight: bold; font-size: 16px;';
        totalCell.textContent = team.totalPoints;
        row.appendChild(totalCell);

        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      container.appendChild(table);

      document.body.appendChild(container);
      container.style.position = 'absolute';
      container.style.left = '-9999px';

      const canvas = await html2canvas(container, {
        backgroundColor: '#1f2937',
        scale: 2,
        logging: false
      });

      document.body.removeChild(container);

      const link = document.createElement('a');
      link.download = `${tournament.tournamentName}_standings.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    }
  };

  const availablePhases = tournament.phases ? tournament.phases.map(p => p.name) : [];
  const selectedPhaseObj = tournament.phases?.find(p => p.name === selectedPhase);
  const availableGroups = selectedPhaseObj?.groups && selectedPhaseObj.groups.length > 0
    ? ['overall', ...selectedPhaseObj.groups.filter(g => g.name !== 'overall').map(g => g.name)]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-semibold text-white">Points Table</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchMatches}
            disabled={loading}
            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
          >
            ↻ Refresh
          </button>
          <button
            onClick={exportToCSV}
            disabled={pointsTable.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={downloadImage}
            disabled={pointsTable.length === 0}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            Image
          </button>
          {selectedPhase && (
            <button
              onClick={handleAdvancePhaseClick}
              disabled={advancingPhase}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Advance Phase
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Phase Selector */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-zinc-300">Phase:</label>
        <div className="relative">
          <button
            onClick={() => setIsPhaseDropdownOpen(!isPhaseDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors min-w-[160px] justify-between"
          >
            <span className="truncate">{selectedPhase || 'All Phases'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isPhaseDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPhaseDropdownOpen && (
            <div className="absolute top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedPhase('');
                  setSelectedGroup('overall');
                  setIsPhaseDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-zinc-700 transition-colors"
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
                  className="w-full px-4 py-2 text-left text-white hover:bg-zinc-700 transition-colors"
                >
                  {phase}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Group Selector */}
        {selectedPhase && availableGroups.length > 1 && (
          <>
            <label className="text-sm font-medium text-zinc-300">Group:</label>
            <div className="relative">
              <button
                onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors min-w-[160px] justify-between"
              >
                <span className="truncate capitalize">{selectedGroup}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isGroupDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isGroupDropdownOpen && (
                <div className="absolute top-full mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {availableGroups.map((group, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedGroup(group);
                        setIsGroupDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-zinc-700 transition-colors capitalize"
                    >
                      {group}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Points Table */}
      <div className="bg-zinc-800/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Matches</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">🏆 WD</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Pos Pts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Kill Pts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Total</th>
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
                          src={team.teamLogo}
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
                      <span className="text-sm font-medium text-white">{team.teamName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{team.matchesPlayed}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-400 font-bold">{team.chickenDinners}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">{team.totalPositionPoints || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 font-bold">{team.totalKillPoints || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">{team.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pointsTable.length === 0 && !loading && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">
            {matches.length === 0
              ? "No match results yet"
              : `No standings available for ${selectedPhase || 'this tournament'}`}
          </p>
        </div>
      )}

      {/* Advance Phase Modal */}
      {showAdvanceModal && advancePreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Advance Phase: {selectedPhase}</h3>
              <button
                onClick={() => {
                  setShowAdvanceModal(false);
                  setAdvancePreview(null);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  <strong>{advancePreview.teamsToAdvance.length}</strong> teams will advance to the next phase
                </p>
              </div>

              {advancePreview.rules.map((rule, index) => (
                <div key={index} className="bg-zinc-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowRight className="w-4 h-4 text-orange-400" />
                    <span className="text-white font-medium">
                      Top {rule.numberOfTeams} from {rule.source === 'overall' ? 'Overall' : 'Each Group'}
                    </span>
                    <span className="text-zinc-400">→</span>
                    <span className="text-orange-400">{rule.nextPhase}</span>
                  </div>

                  <div className="space-y-2">
                    {rule.teams.map((team, tIndex) => (
                      <div key={tIndex} className="flex items-center gap-3 p-2 bg-zinc-800 rounded">
                        {team.teamLogo ? (
                          <img src={team.teamLogo} alt={team.teamName} className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 bg-zinc-600 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">{team.teamName[0]}</span>
                          </div>
                        )}
                        <span className="text-white text-sm">{team.teamName}</span>
                        <span className="ml-auto text-orange-400 text-sm font-bold">{team.totalPoints} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ This action will mark the current phase as completed and move qualified teams to the next phase.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-zinc-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAdvanceModal(false);
                  setAdvancePreview(null);
                }}
                className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdvancePhase}
                disabled={advancingPhase}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {advancingPhase ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Advancing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm Advance
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsTable;