import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Calendar, Users, Trophy, Target, AlertCircle } from 'lucide-react';

const MatchManagement = ({ tournament, onUpdate }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMatch, setNewMatch] = useState({
    matchNumber: '',
    tournamentPhase: '',
    map: 'Erangel',
    scheduledStartTime: '',
    status: 'scheduled',
    participatingGroups: [],
    participatingTeams: []
  });
  const [pendingChanges, setPendingChanges] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const phases = tournament.phases || [];
  // Get all groups from all phases
  const allGroups = phases.flatMap(phase => phase.groups || []);
  // Filter groups by selected phase
  const groups = newMatch.tournamentPhase
    ? allGroups.filter(group => {
        // Find which phase this group belongs to
        const phaseWithGroup = phases.find(phase =>
          phase.groups?.some(g => g.id === group.id || g.name === group.name)
        );
        return phaseWithGroup?.name === newMatch.tournamentPhase;
      })
    : [];
  const teams = tournament.participatingTeams || [];

  // Available maps
  const maps = ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik', 'Nusa', 'Rondo'];

  // Fetch existing matches
  useEffect(() => {
    fetchMatches();
  }, [tournament._id]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/matches/tournament/${tournament._id}`);
      if (response.ok) {
        const matchesData = await response.json();
        setMatches(matchesData);
      } else {
        setError('Failed to fetch matches');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatch = async () => {
    if (!newMatch.matchNumber || !newMatch.tournamentPhase || !newMatch.scheduledStartTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      // Get teams from selected groups
      const selectedGroups = groups.filter(group => newMatch.participatingGroups.includes(group.id));
      const participatingTeamIds = selectedGroups.flatMap(group => group.teams);

      // Debug logging
      console.log('Tournament ID:', tournament._id);
      console.log('Participating Team IDs:', participatingTeamIds);
      console.log('Teams data:', teams);

      const matchData = {
        ...newMatch,
        tournament: tournament._id,
        matchType: 'group_stage', // Default to group stage
        participatingTeams: participatingTeamIds.map(teamId => {
          // Find the team data to get team name and tag
          // The teams array contains objects with { team: { _id, teamName, teamTag, ... } }
          const participatingTeamData = teams.find(t => t.team._id.toString() === teamId);
          console.log('Team ID:', teamId, 'Participating Team Data:', participatingTeamData);

          if (participatingTeamData) {
            return {
              team: teamId,
              teamName: participatingTeamData.team.teamName || 'Unknown Team',
              teamTag: participatingTeamData.team.teamTag || '',
              players: [], // Empty players array for now - can be populated later
              finalPosition: null, // Set to null initially, will be updated when results are entered
              points: { placementPoints: 0, killPoints: 0, totalPoints: 0 },
              kills: { total: 0 },
              survivalTime: 0,
              totalDamage: 0,
              chickenDinner: false
            };
          } else {
            // Fallback if team data not found
            return {
              team: teamId,
              teamName: 'Unknown Team',
              teamTag: '',
              players: [],
              finalPosition: null,
              points: { placementPoints: 0, killPoints: 0, totalPoints: 0 },
              kills: { total: 0 },
              survivalTime: 0,
              totalDamage: 0,
              chickenDinner: false
            };
          }
        })
      };

      console.log('Match data being sent:', JSON.stringify(matchData, null, 2));

      const response = await fetch('http://localhost:5000/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const savedMatch = await response.json();
        console.log('Saved match:', savedMatch);
        setMatches([...matches, savedMatch]);
        setNewMatch({
          matchNumber: '',
          tournamentPhase: '',
          map: 'Erangel',
          scheduledStartTime: '',
          status: 'scheduled',
          participatingGroups: []
        });
        setError(null);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.error || 'Failed to create match');
        } catch {
          setError(`Server error: ${response.status} - ${errorText}`);
        }
      }
    } catch (err) {
      setError('Error creating match');
      console.error('Error creating match:', err);
    }
  };

  const handleResultUpdate = async (matchId, teamId, kills, position) => {
    try {
      console.log('handleResultUpdate called with:', { matchId, teamId, kills, position });

      const match = matches.find(m => m._id === matchId);
      if (!match) {
        console.error('Match not found:', matchId);
        return;
      }

      // Calculate points based on position and kills
      const placementPoints = getPlacementPoints(position);
      const totalPoints = placementPoints + kills;

      // Create the results array in the format expected by the server
      // Only include teams that have valid positions (not 0)
      const results = match.participatingTeams
        .filter(team => {
          // Include the team being updated or teams that already have positions
          const actualTeamId = team.team._id ? team.team._id.toString() : team.team.toString();
          return actualTeamId === teamId || (team.finalPosition && team.finalPosition > 0);
        })
        .map(team => {
          // Get the actual team ID - handle both populated and non-populated team data
          const actualTeamId = team.team._id ? team.team._id.toString() : team.team.toString();

          if (actualTeamId === teamId) {
            return {
              teamId: teamId,
              position: position,
              kills: kills
            };
          }
          return {
            teamId: actualTeamId,
            position: team.finalPosition,
            kills: team.kills?.total || 0
          };
        });

      console.log('Sending results to server:', results);
      console.log('Match data before update:', match);

      const response = await fetch(`http://localhost:5000/api/matches/${matchId}/results`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ results }),
      });

      console.log('Server response status:', response.status);

      if (response.ok) {
        const updatedMatch = await response.json();
        console.log('Updated match received:', updatedMatch);

        // Ensure the updated match has the populated team data
        const matchWithPopulatedTeams = {
          ...updatedMatch,
          participatingTeams: updatedMatch.participatingTeams.map(team => ({
            ...team,
            team: team.team || team // Handle both populated and non-populated team data
          }))
        };

        setMatches(matches.map(m => m._id === matchId ? matchWithPopulatedTeams : m));
        setError(null);
        console.log('Match updated successfully - UI should reflect changes');
      } else {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.error || 'Failed to update match results');
        } catch {
          setError(`Server error: ${response.status} - ${errorText}`);
        }
      }
    } catch (err) {
      setError('Error updating match results');
      console.error('Error updating match results:', err);
    }
  };

  const getPlacementPoints = (position) => {
    const pointsMap = {
      1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1
    };
    return pointsMap[position] || 0;
  };

  const handleGroupToggle = (groupId) => {
    setNewMatch(prev => ({
      ...prev,
      participatingGroups: prev.participatingGroups.includes(groupId)
        ? prev.participatingGroups.filter(id => id !== groupId)
        : [...prev.participatingGroups, groupId]
    }));
  };

  const handleTeamToggle = (teamId) => {
    setNewMatch(prev => ({
      ...prev,
      participatingTeams: prev.participatingTeams.includes(teamId)
        ? prev.participatingTeams.filter(id => id !== teamId)
        : [...prev.participatingTeams, teamId]
    }));
  };

  const handleInputChange = (matchId, teamId, field, value) => {
    const key = `${matchId}-${teamId}-${field}`;
    setPendingChanges(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      setError(null);
      const updates = [];

      // Group changes by match
      Object.keys(pendingChanges).forEach(key => {
        const [matchId, teamId, field] = key.split('-');
        if (!updates.find(u => u.matchId === matchId)) {
          updates.push({ matchId, teamId, kills: null, position: null });
        }
        const update = updates.find(u => u.matchId === matchId);
        if (field === 'kills') update.kills = parseInt(pendingChanges[key]) || 0;
        if (field === 'position') update.position = parseInt(pendingChanges[key]) || 0;
      });

      // Process each update
      for (const update of updates) {
        const { matchId, teamId, kills, position } = update;
        await handleResultUpdate(matchId, teamId, kills, position);
      }

      // Clear pending changes
      setPendingChanges({});
      setHasUnsavedChanges(false);
      console.log('All changes saved successfully');
    } catch (err) {
      setError('Error saving changes');
      console.error('Error saving changes:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Match Management</h3>
        <div className="text-sm text-zinc-400">
          {matches.length} match{matches.length !== 1 ? 'es' : ''} configured
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Add New Match */}
      <div className="bg-zinc-800/50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">Create New Match</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Match Number *</label>
            <input
              type="number"
              min="1"
              value={newMatch.matchNumber}
              onChange={(e) => setNewMatch({ ...newMatch, matchNumber: e.target.value })}
              className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Phase *</label>
            <select
              value={newMatch.tournamentPhase}
              onChange={(e) => setNewMatch({ ...newMatch, tournamentPhase: e.target.value })}
              className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
            >
              <option value="">Select Phase</option>
              {phases.map(phase => (
                <option key={phase._id || phase.id} value={phase.name}>{phase.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Map</label>
            <select
              value={newMatch.map}
              onChange={(e) => setNewMatch({ ...newMatch, map: e.target.value })}
              className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
            >
              {maps.map(map => (
                <option key={map} value={map}>{map}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Start Time *</label>
            <input
              type="datetime-local"
              value={newMatch.scheduledStartTime}
              onChange={(e) => setNewMatch({ ...newMatch, scheduledStartTime: e.target.value })}
              className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
            />
          </div>
        </div>

        {/* Group Selection */}
        <div className="mt-4">
          <label className="block text-sm text-zinc-400 mb-2">Participating Groups</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {groups.map((group) => {
              const isSelected = newMatch.participatingGroups.includes(group.id);

              return (
                <button
                  key={group.id}
                  onClick={() => handleGroupToggle(group.id)}
                  className={`p-2 rounded text-sm transition-colors ${
                    isSelected
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  {group.name}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Selected: {newMatch.participatingGroups.length} groups
          </p>
        </div>

        <button
          onClick={handleAddMatch}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Match
        </button>
      </div>

      {/* Save Button */}
      {hasUnsavedChanges && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400">You have unsaved changes</span>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      )}

      {/* Existing Matches */}
      <div className="space-y-4">
        {matches.map(match => (
          <div key={match._id} className="bg-zinc-800/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-medium text-white">
                  Match #{match.matchNumber} - {match.tournamentPhase}
                </h4>
                <p className="text-zinc-400 text-sm">{match.map} • {new Date(match.scheduledStartTime).toLocaleString()}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                match.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                match.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                match.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {match.status}
              </span>
            </div>

            {/* Match Results Input */}
            <div className="space-y-3">
              {match.participatingTeams.map(team => {
                const teamData = team.team || team;
                const teamName = teamData.teamName || teamData.name || 'Unknown Team';
                const currentKills = team.kills?.total || 0;
                const currentPosition = team.finalPosition || 0;
                const currentPoints = team.points?.totalPoints || 0;

                return (
                  <div key={teamData._id} className="flex items-center gap-4 p-3 bg-zinc-700/50 rounded">
                    <div className="flex-1">
                      <span className="text-white font-medium">{teamName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-zinc-400 text-sm">Kills:</label>
                      <input
                        type="number"
                        value={pendingChanges[`${match._id}-${teamData._id}-kills`] ?? currentKills}
                        onChange={(e) => {
                          const newKills = parseInt(e.target.value) || 0;
                          handleInputChange(match._id, teamData._id, 'kills', newKills);
                        }}
                        className="w-16 bg-zinc-600 border border-zinc-500 rounded px-2 py-1 text-white text-center"
                        min="0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-zinc-400 text-sm">Position:</label>
                      <input
                        type="number"
                        value={pendingChanges[`${match._id}-${teamData._id}-position`] ?? (currentPosition || '')}
                        onChange={(e) => {
                          const newPosition = parseInt(e.target.value) || 0;
                          if (newPosition > 0) {
                            handleInputChange(match._id, teamData._id, 'position', newPosition);
                          }
                        }}
                        className="w-16 bg-zinc-600 border border-zinc-500 rounded px-2 py-1 text-white text-center"
                        min="1"
                        max="16"
                        placeholder="1-16"
                      />
                    </div>
                    <div className="w-20 text-center">
                      <span className="text-orange-400 font-medium">{currentPoints} pts</span>
                    </div>
                    {team.chickenDinner && (
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Trophy className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Match Leaderboard */}
            {match.participatingTeams.some(team => team.finalPosition > 0) && (
              <div className="mt-6">
                <h5 className="text-white font-medium mb-3">Match Leaderboard</h5>
                <div className="bg-zinc-700/30 rounded-lg p-4">
                  <div className="space-y-2">
                    {[...match.participatingTeams]
                      .filter(team => team.finalPosition > 0)
                      .sort((a, b) => {
                        // Sort by position first, then by kills if positions are equal
                        if (a.finalPosition !== b.finalPosition) {
                          return a.finalPosition - b.finalPosition;
                        }
                        return (b.kills?.total || 0) - (a.kills?.total || 0);
                      })
                      .map((team, index) => {
                        const teamData = team.team || team;
                        const teamName = teamData.teamName || teamData.name || 'Unknown Team';
                        const position = team.finalPosition;
                        const kills = team.kills?.total || 0;
                        const points = team.points?.totalPoints || 0;

                        return (
                          <div key={teamData._id} className={`flex items-center gap-4 p-2 rounded ${
                            position === 1 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                            position === 2 ? 'bg-gray-400/20 border border-gray-400/30' :
                            position === 3 ? 'bg-orange-500/20 border border-orange-500/30' :
                            'bg-zinc-600/30'
                          }`}>
                            <div className="w-8 text-center">
                              <span className={`font-bold ${
                                position === 1 ? 'text-yellow-400' :
                                position === 2 ? 'text-gray-300' :
                                position === 3 ? 'text-orange-400' :
                                'text-zinc-400'
                              }`}>
                                #{position}
                              </span>
                            </div>
                            <div className="flex-1">
                              <span className="text-white font-medium">{teamName}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-zinc-400">Kills: <span className="text-white">{kills}</span></span>
                              <span className="text-zinc-400">Points: <span className="text-orange-400 font-medium">{points}</span></span>
                            </div>
                            {team.chickenDinner && (
                              <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                <Trophy className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Matches Created</h3>
          <p className="text-zinc-400">Create your first match to start tracking tournament progress.</p>
        </div>
      )}
    </div>
  );
};

export default MatchManagement;
