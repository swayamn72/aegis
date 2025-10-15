import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Calendar, Users, Trophy, Target, AlertCircle, Trash2, MoreVertical, Edit, Eye, Settings, ChevronDown, ChevronUp, Share2, Key, Send } from 'lucide-react';
import { toast } from 'react-toastify';

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
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, matchId: null, matchNumber: null });
  const [deletingMatch, setDeletingMatch] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [matchesPerPage, setMatchesPerPage] = useState(5);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [expandedMatches, setExpandedMatches] = useState(new Set());
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedMatchForCredentials, setSelectedMatchForCredentials] = useState(null);
  const [credentialsForm, setCredentialsForm] = useState({
    roomId: '',
    roomPassword: ''
  });
  const [isCreateSectionExpanded, setIsCreateSectionExpanded] = useState(false);

  const phases = tournament.phases || [];
  const allGroups = phases.flatMap(phase => phase.groups || []);
  const groups = newMatch.tournamentPhase
    ? allGroups.filter(group => {
      const phaseWithGroup = phases.find(phase =>
        phase.groups?.some(g => g.id === group.id || g.name === group.name)
      );
      return phaseWithGroup?.name === newMatch.tournamentPhase;
    })
    : [];
  const teams = tournament.participatingTeams || [];

  const maps = ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik', 'Nusa', 'Rondo'];

  // Pagination calculations
  const totalPages = Math.ceil(matches.length / matchesPerPage);
  const startIndex = (currentPage - 1) * matchesPerPage;
  const endIndex = startIndex + matchesPerPage;
  const currentMatches = matches.slice(startIndex, endIndex);

  useEffect(() => {
    fetchMatches();
  }, [tournament._id]);

  // Reset to first page when matches change
  useEffect(() => {
    setCurrentPage(1);
  }, [matches.length]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
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
      const selectedGroups = groups.filter(group => newMatch.participatingGroups.includes(group.id));
      const groupTeamIds = selectedGroups.flatMap(group => group.teams);
      const allParticipatingTeamIds = [...new Set([...groupTeamIds, ...newMatch.participatingTeams])];

      console.log('Tournament ID:', tournament._id);
      console.log('Group Team IDs:', groupTeamIds);
      console.log('Manually Selected Team IDs:', newMatch.participatingTeams);
      console.log('All Participating Team IDs:', allParticipatingTeamIds);
      console.log('Teams data:', teams);

      const matchData = {
        ...newMatch,
        tournament: tournament._id,
        matchType: 'group_stage', // restored
        participatingTeams: allParticipatingTeamIds.map(teamId => {
          const participatingTeamData = teams.find(t => t.team._id.toString() === teamId);
          console.log('Team ID:', teamId, 'Participating Team Data:', participatingTeamData);

          if (participatingTeamData) {
            return {
              team: teamId,
              teamName: participatingTeamData.team.teamName || 'Unknown Team',
              teamTag: participatingTeamData.team.teamTag || '',
              players: [],
              finalPosition: null,
              points: { placementPoints: 0, killPoints: 0, totalPoints: 0 },
              kills: { total: 0 },
              survivalTime: 0,
              totalDamage: 0,
              chickenDinner: false
            };
          } else {
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
          participatingGroups: [],
          participatingTeams: []
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

  const handleStatusChange = async (matchId, newStatus) => {
    try {
      setError(null);

      const response = await fetch(`http://localhost:5000/api/matches/${matchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedMatch = await response.json();
        setMatches(matches.map(match =>
          match._id === matchId ? { ...match, status: newStatus } : match
        ));
        console.log('Match status updated successfully');
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.error || 'Failed to update match status');
        } catch {
          setError(`Server error: ${response.status} - ${errorText}`);
        }
      }
    } catch (err) {
      setError('Error updating match status');
      console.error('Error updating match status:', err);
    }
  };

  const handleInputChange = (matchId, teamId, field, value) => {
    // Create a more robust key that handles undefined teamIds
    const safeTeamId = teamId || 'unknown';
    const key = `${matchId}-${safeTeamId}-${field}`;

    console.log(`Setting pending change: ${key} = ${value}`);

    setPendingChanges(prev => {
      const newChanges = {
        ...prev,
        [key]: value
      };
      console.log('Updated pending changes:', newChanges);
      return newChanges;
    });

    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (saving) return; // Prevent multiple concurrent saves

    try {
      setSaving(true);
      setError(null);

      console.log('Starting save process with pending changes:', pendingChanges);

      // Group changes by match and team
      const updatesByMatch = {};

      Object.keys(pendingChanges).forEach(key => {
        const parts = key.split('-');
        if (parts.length !== 3) {
          console.warn('Invalid key format:', key);
          return;
        }

        const [matchId, teamId, field] = parts;

        if (!updatesByMatch[matchId]) {
          updatesByMatch[matchId] = {};
        }
        if (!updatesByMatch[matchId][teamId]) {
          updatesByMatch[matchId][teamId] = { kills: null, position: null };
        }

        if (field === 'kills') {
          updatesByMatch[matchId][teamId].kills = parseInt(pendingChanges[key]) || 0;
        }
        if (field === 'position') {
          updatesByMatch[matchId][teamId].position = parseInt(pendingChanges[key]) || null;
        }
      });

      console.log('Updates grouped by match:', updatesByMatch);

      // Process each match
      const updatePromises = Object.keys(updatesByMatch).map(async (matchId) => {
        const match = matches.find(m => m._id === matchId);
        if (!match) {
          console.warn('Match not found:', matchId);
          return null;
        }

        // Create results array with ALL teams
        const results = match.participatingTeams.map(team => {
          // Handle both populated and non-populated team data
          const actualTeamId = team.team?._id ? team.team._id.toString() : team.team?.toString() || team._id?.toString();
          const teamUpdates = updatesByMatch[matchId][actualTeamId];

          // Use pending changes if available, otherwise use current values
          const currentKills = team.kills?.total || 0;
          const currentPosition = team.finalPosition || null;

          const kills = teamUpdates?.kills !== null && teamUpdates?.kills !== undefined ? teamUpdates.kills : currentKills;
          const position = teamUpdates?.position !== null && teamUpdates?.position !== undefined ? teamUpdates.position : currentPosition;

          console.log(`Team ${actualTeamId}: kills=${kills}, position=${position}`);

          return {
            teamId: actualTeamId,
            position: position,
            kills: kills
          };
        });

        console.log(`Sending results for match ${matchId}:`, results);

        const response = await fetch(`http://localhost:5000/api/matches/${matchId}/results`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ results }),
        });

        if (response.ok) {
          const updatedMatch = await response.json();
          console.log(`Match ${matchId} updated successfully`);
          return {
            matchId,
            updatedMatch: {
              ...updatedMatch,
              participatingTeams: updatedMatch.participatingTeams.map(team => ({
                ...team,
                team: team.team || team
              }))
            }
          };
        } else {
          const errorText = await response.text();
          console.error(`Error updating match ${matchId}:`, errorText);
          throw new Error(`Failed to update match ${matchId}: ${errorText}`);
        }
      });

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);

      // Update local state with all successful updates
      const updatedMatches = [...matches];
      results.forEach(result => {
        if (result) {
          const index = updatedMatches.findIndex(m => m._id === result.matchId);
          if (index !== -1) {
            updatedMatches[index] = result.updatedMatch;
          }
        }
      });

      setMatches(updatedMatches);

      // Clear pending changes only after successful save
      setPendingChanges({});
      setHasUnsavedChanges(false);

      console.log('All changes saved successfully');
    } catch (err) {
      setError(`Error saving changes: ${err.message}`);
      console.error('Error saving changes:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleShareCredentials = async () => {
    if (!selectedMatchForCredentials || !selectedMatchForCredentials._id) {
      toast.error('Invalid match selected');
      return;
    }

    if (!credentialsForm.roomId.trim() || !credentialsForm.roomPassword.trim()) {
      toast.error('Please fill in both room ID and password');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/matches/${selectedMatchForCredentials._id}/share-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          roomId: credentialsForm.roomId,
          password: credentialsForm.roomPassword
        })
      });

      if (response.ok) {
        const updatedMatch = await response.json();
        setMatches(matches.map(match =>
          match._id === selectedMatchForCredentials._id ? updatedMatch : match
        ));
        toast.success('Room credentials shared successfully');
        setShowCredentialsModal(false);
        setSelectedMatchForCredentials(null);
        setCredentialsForm({ roomId: '', roomPassword: '' });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to share credentials');
      }
    } catch (error) {
      console.error('Error sharing credentials:', error);
      toast.error('Failed to share credentials');
    }
  };

  const handleDeleteMatch = async (matchId) => {
    try {
      setDeletingMatch(matchId);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/matches/${matchId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // fixed syntax
        setMatches(matches.filter(match => match._id !== matchId));
        setDeleteConfirm({ show: false, matchId: null, matchNumber: null });
        console.log('Match deleted successfully');
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.error || 'Failed to delete match');
        } catch {
          setError(`Server error: ${response.status} - ${errorText}`);
        }
      }
    } catch (err) {
      setError('Error deleting match');
      console.error('Error deleting match:', err);
    } finally {
      setDeletingMatch(null);
    }
  };

  const confirmDelete = (matchId, matchNumber) => {
    setDeleteConfirm({ show: true, matchId, matchNumber });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, matchId: null, matchNumber: null });
  };

  const toggleDropdown = (matchId) => {
    setDropdownOpen(dropdownOpen === matchId ? null : matchId);
  };

  const toggleMatchExpansion = (matchId) => {
    setExpandedMatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(matchId)) {
        newSet.delete(matchId);
      } else {
        newSet.add(matchId);
      }
      return newSet;
    });
  };

  const handleDropdownAction = (action, match) => {
    setDropdownOpen(null);
    if (action === 'share-credentials') {
      if (!match || !match._id) {
        toast.error('Invalid match selected');
        return;
      }
      setSelectedMatchForCredentials(match);
      setCredentialsForm({ roomId: '', roomPassword: '' });
      setShowCredentialsModal(true);
    } else if (action === 'edit') {
      // Handle edit action
      console.log('Edit match:', match._id);
    } else if (action === 'view') {
      // Handle view action
      console.log('View match:', match._id);
    } else if (action === 'settings') {
      // Handle settings action
      console.log('Settings for match:', match._id);
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

      {/* Save Button */}
      {hasUnsavedChanges && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400">You have unsaved changes</span>
            <span className="text-zinc-400 text-sm">({Object.keys(pendingChanges).length} changes)</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}

      {/* Existing Matches */}
      <div className="space-y-4">
        {currentMatches.map(match => (
          <div key={`match-${match._id}`} className="bg-zinc-800/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleMatchExpansion(match._id)}
                  className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                  title={expandedMatches.has(match._id) ? "Collapse match details" : "Expand match details"}
                >
                  {expandedMatches.has(match._id) ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                <div>
                  <h4 className="text-lg font-medium text-white">
                    Match #{match.matchNumber} - {match.tournamentPhase}
                  </h4>
                  <p className="text-zinc-400 text-sm">{match.map} • {new Date(match.scheduledStartTime).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={match.status}
                  onChange={(e) => handleStatusChange(match._id, e.target.value)}
                  className={`px-2 py-1 rounded text-xs font-medium border-0 ${match.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                    match.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                      match.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-red-500/20 text-red-400'
                    }`}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(match._id)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                    title="More options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {dropdownOpen === match._id && (
                    <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10 min-w-32">
                      <button
                        onClick={() => handleDropdownAction('share-credentials', match)}
                        className="w-full px-3 py-2 text-left text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2 rounded-t-lg"
                      >
                        <Share2 className="w-4 h-4" />
                        Share Room Credentials
                      </button>
                      <button
                        onClick={() => handleDropdownAction('edit', match)}
                        className="w-full px-3 py-2 text-left text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Match
                      </button>
                      <button
                        onClick={() => handleDropdownAction('view', match)}
                        className="w-full px-3 py-2 text-left text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleDropdownAction('settings', match)}
                        className="w-full px-3 py-2 text-left text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2 rounded-b-lg"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => confirmDelete(match._id, match.matchNumber)}
                  disabled={deletingMatch === match._id}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Match"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Room Credentials Display */}
            {match.roomCredentials && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-medium">Room Credentials</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-400">Room ID:</span>
                    <span className="text-white ml-2 font-mono">{match.roomCredentials.roomId}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Password:</span>
                    <span className="text-white ml-2 font-mono">{match.roomCredentials.password}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Match Details - Only show when expanded */}
            {expandedMatches.has(match._id) && (
              <>
                {/* Match Results Input */}
                <div className="space-y-3">
                  {match.participatingTeams?.map((team, index) => {
                    const teamData = team.team || team;
                    const teamId = teamData._id || teamData.id;
                    const teamName = teamData.teamName || teamData.name || 'Unknown Team';

                    // Get current values, checking pending changes first
                    const killsKey = `${match._id}-${teamId}-kills`;
                    const positionKey = `${match._id}-${teamId}-position`;

                    const currentKills = pendingChanges[killsKey] !== undefined ? pendingChanges[killsKey] : (team.kills?.total || 0);
                    const currentPosition = pendingChanges[positionKey] !== undefined ? pendingChanges[positionKey] : (team.finalPosition || '');
                    const currentPoints = team.points?.totalPoints || 0;

                    return (
                      <div key={`${match._id}-team-${index}`} className="flex items-center gap-4 p-3 bg-zinc-700/50 rounded">
                        <div className="flex-1">
                          <span className="text-white font-medium">{teamName}</span>
                          <span className="text-zinc-400 text-sm ml-2">({teamId})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-zinc-400 text-sm">Kills:</label>
                          <input
                            type="number"
                            value={currentKills}
                            onChange={(e) => {
                              const newKills = parseInt(e.target.value) || 0;
                              handleInputChange(match._id, teamId, 'kills', newKills);
                            }}
                            className="w-16 bg-zinc-600 border border-zinc-500 rounded px-2 py-1 text-white text-center"
                            min="0"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-zinc-400 text-sm">Position:</label>
                          <input
                            type="number"
                            value={currentPosition}
                            onChange={(e) => {
                              const newPosition = parseInt(e.target.value) || '';
                              handleInputChange(match._id, teamId, 'position', newPosition);
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
                {match.participatingTeams?.some(team => team.finalPosition > 0) && (
                  <div className="mt-6">
                    <h5 className="text-white font-medium mb-3">Match Leaderboard</h5>
                    <div className="bg-zinc-700/30 rounded-lg p-4">
                      <div className="space-y-2">
                        {[...match.participatingTeams]
                          .filter(team => team.finalPosition > 0)
                          .sort((a, b) => {
                            const pointsA = a.points?.totalPoints || 0;
                            const pointsB = b.points?.totalPoints || 0;
                            if (pointsA !== pointsB) {
                              return pointsB - pointsA; // Sort by points descending
                            }
                            return (b.kills?.total || 0) - (a.kills?.total || 0); // Tiebreaker by kills
                          })
                          .map((team, index) => {
                            const teamData = team.team || team;
                            const teamName = teamData.teamName || teamData.name || 'Unknown Team';
                            const position = team.finalPosition;
                            const kills = team.kills?.total || 0;
                            const points = team.points?.totalPoints || 0;

                            return (
                              <div key={`${match._id}-leaderboard-${index}`} className={`flex items-center gap-4 p-2 rounded ${position === 1 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                                position === 2 ? 'bg-gray-400/20 border border-gray-400/30' :
                                  position === 3 ? 'bg-orange-500/20 border border-orange-500/30' :
                                    'bg-zinc-600/30'
                                }`}>
                                <div className="w-8 text-center">
                                  <span className={`font-bold ${position === 1 ? 'text-yellow-400' :
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
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add New Match */}
      <div className="bg-zinc-800/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setIsCreateSectionExpanded(!isCreateSectionExpanded)}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
            title={isCreateSectionExpanded ? "Collapse create section" : "Expand create section"}
          >
            {isCreateSectionExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <h4 className="text-lg font-medium text-white">Create New Match</h4>
        </div>

        {isCreateSectionExpanded && (
        <div>
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
                    className={`p-2 rounded text-sm transition-colors ${isSelected
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

          {/* Team Selection */}
          <div className="mt-4">
            <label className="block text-sm text-zinc-400 mb-2">Participating Teams</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
              {teams.map((teamData) => {
                const team = teamData.team || teamData;
                const teamId = team._id || team.id;
                const teamName = team.teamName || team.name || 'Unknown Team';
                const isSelected = newMatch.participatingTeams.includes(teamId);

                return (
                  <button
                    key={teamId}
                    onClick={() => handleTeamToggle(teamId)}
                    className={`p-2 rounded text-sm transition-colors ${isSelected
                      ? 'bg-green-500 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                  >
                    {teamName}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Selected: {newMatch.participatingTeams.length} teams
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
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages >= 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-400">Matches per page:</label>
            <select
              value={matchesPerPage}
              onChange={(e) => {
                setMatchesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-zinc-700 text-white rounded hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>
            <span className="text-zinc-400 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-zinc-700 text-white rounded hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Confirm Delete</h3>
            <p className="text-zinc-400 mb-6">
              Are you sure you want to delete Match #{deleteConfirm.matchNumber}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMatch(deleteConfirm.matchId)}
                disabled={deletingMatch === deleteConfirm.matchId}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingMatch === deleteConfirm.matchId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">Share Room Credentials</h3>
            <p className="text-zinc-400 mb-4">
              Enter the room credentials for Match #{selectedMatchForCredentials?.matchNumber}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Room ID</label>
                <input
                  type="text"
                  value={credentialsForm.roomId}
                  onChange={(e) => setCredentialsForm({ ...credentialsForm, roomId: e.target.value })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
                  placeholder="Enter room ID"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Room Password</label>
                <input
                  type="text"
                  value={credentialsForm.roomPassword}
                  onChange={(e) => setCredentialsForm({ ...credentialsForm, roomPassword: e.target.value })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
                  placeholder="Enter room password"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCredentialsModal(false);
                  setSelectedMatchForCredentials(null);
                  setCredentialsForm({ roomId: '', roomPassword: '' });
                }}
                className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShareCredentials}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Share Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchManagement;
