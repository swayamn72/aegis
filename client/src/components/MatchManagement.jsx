import React, { useState, useEffect } from 'react';
import { Calendar, Save, AlertCircle, Trash2, ChevronDown, ChevronUp, Share2, Key, Trophy } from 'lucide-react';
import { toast } from 'react-toastify';

const MatchManagement = ({ tournament, onUpdate }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedMatches, setExpandedMatches] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [credentialsForm, setCredentialsForm] = useState({ roomId: '', roomPassword: '' });

  useEffect(() => {
    fetchMatches();
  }, [tournament._id]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/matches/tournament/${tournament._id}`);
      if (response.ok) {
        const matchesData = await response.json();
        setMatches(Array.isArray(matchesData) ? matchesData : (matchesData.matches || []));
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

  const handleInputChange = (matchId, teamId, field, value) => {
    const safeTeamId = teamId || 'unknown';
    const key = `${matchId}-${safeTeamId}-${field}`;

    setPendingChanges(prev => ({
      ...prev,
      [key]: value
    }));

    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setError(null);

      const updatesByMatch = {};

      Object.keys(pendingChanges).forEach(key => {
        const parts = key.split('-');
        if (parts.length !== 3) return;

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

      const updatePromises = Object.keys(updatesByMatch).map(async (matchId) => {
        const match = matches.find(m => m._id === matchId);
        if (!match) return null;

        const results = match.participatingTeams.map(team => {
          const actualTeamId = team.team?._id ? team.team._id.toString() : team.team?.toString() || team._id?.toString();
          const teamUpdates = updatesByMatch[matchId][actualTeamId];

          const currentKills = team.kills?.total || 0;
          const currentPosition = team.finalPosition || null;

          const kills = teamUpdates?.kills !== null && teamUpdates?.kills !== undefined ? teamUpdates.kills : currentKills;
          const position = teamUpdates?.position !== null && teamUpdates?.position !== undefined ? teamUpdates.position : currentPosition;

          return {
            teamId: actualTeamId,
            position: position,
            kills: kills
          };
        });

        const response = await fetch(`http://localhost:5000/api/matches/${matchId}/results`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ results }),
        });

        if (response.ok) {
          const updatedMatch = await response.json();
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
          throw new Error(`Failed to update match ${matchId}`);
        }
      });

      const results = await Promise.all(updatePromises);

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
      setPendingChanges({});
      setHasUnsavedChanges(false);
      toast.success('Match results saved successfully');
      
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(`Error saving changes: ${err.message}`);
      toast.error('Failed to save changes');
      console.error('Error saving changes:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleShareCredentials = async () => {
    if (!selectedMatch || !credentialsForm.roomId.trim() || !credentialsForm.roomPassword.trim()) {
      toast.error('Please fill in both room ID and password');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/matches/${selectedMatch._id}/share-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          roomId: credentialsForm.roomId,
          password: credentialsForm.roomPassword
        })
      });

      if (response.ok) {
        const updatedMatch = await response.json();
        setMatches(matches.map(match =>
          match._id === selectedMatch._id ? updatedMatch : match
        ));
        toast.success('Room credentials shared successfully');
        setShowCredentialsModal(false);
        setSelectedMatch(null);
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
    if (!window.confirm('Are you sure you want to delete this match?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/matches/${matchId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMatches(matches.filter(match => match._id !== matchId));
        toast.success('Match deleted successfully');
      } else {
        toast.error('Failed to delete match');
      }
    } catch (err) {
      toast.error('Error deleting match');
      console.error('Error deleting match:', err);
    }
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

  const getPlacementPoints = (position) => {
    const pointsMap = { 1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1 };
    return pointsMap[position] || 0;
  };

  const availablePhases = tournament.phases?.map(p => p.name) || [];
  const filteredMatches = selectedPhase 
    ? matches.filter(m => m.tournamentPhase === selectedPhase)
    : matches;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading matches...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Match Results</h3>
          <p className="text-gray-400 text-sm mt-1">Enter kills and positions for each team</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Phases</option>
            {availablePhases.map((phase, idx) => (
              <option key={idx} value={phase}>{phase}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400">You have unsaved changes</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save All Changes
              </>
            )}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filteredMatches.length > 0 ? (
          filteredMatches.map(match => (
            <div key={match._id} className="bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleMatchExpansion(match._id)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    {expandedMatches.has(match._id) ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-white font-medium">Match #{match.matchNumber}</h4>
                      <span className="text-gray-400 text-sm">•</span>
                      <span className="text-gray-400 text-sm">{match.tournamentPhase}</span>
                      <span className="text-gray-400 text-sm">•</span>
                      <span className="text-gray-400 text-sm">{match.map}</span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {new Date(match.scheduledStartTime).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    match.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                    match.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                    match.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {match.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedMatch(match);
                      setShowCredentialsModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    title="Share room credentials"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMatch(match._id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete match"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {match.roomCredentials && (
                <div className="px-4 pb-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 font-medium text-sm">Room Credentials</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-400">ID:</span>
                        <span className="text-white ml-2 font-mono">{match.roomCredentials.roomId}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Password:</span>
                        <span className="text-white ml-2 font-mono">{match.roomCredentials.password}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {expandedMatches.has(match._id) && (
                <div className="border-t border-gray-700 p-4">
                  <div className="space-y-2">
                    {match.participatingTeams?.map((team, index) => {
                      const teamData = team.team || team;
                      const teamId = teamData._id || teamData.id;
                      const teamName = teamData.teamName || teamData.name || 'Unknown Team';

                      const killsKey = `${match._id}-${teamId}-kills`;
                      const positionKey = `${match._id}-${teamId}-position`;

                      const currentKills = pendingChanges[killsKey] !== undefined ? pendingChanges[killsKey] : (team.kills?.total || 0);
                      const currentPosition = pendingChanges[positionKey] !== undefined ? pendingChanges[positionKey] : (team.finalPosition || '');
                      const currentPoints = team.points?.totalPoints || 0;

                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <span className="text-white font-medium truncate block">{teamName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-gray-400 text-sm">Kills:</label>
                            <input
                              type="number"
                              value={currentKills}
                              onChange={(e) => handleInputChange(match._id, teamId, 'kills', parseInt(e.target.value) || 0)}
                              className="w-16 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                              min="0"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-gray-400 text-sm">Position:</label>
                            <input
                              type="number"
                              value={currentPosition}
                              onChange={(e) => handleInputChange(match._id, teamId, 'position', parseInt(e.target.value) || '')}
                              className="w-16 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                              min="1"
                              max="16"
                              placeholder="1-16"
                            />
                          </div>
                          <div className="w-20 text-center">
                            <span className="text-orange-400 font-medium text-sm">{currentPoints} pts</span>
                          </div>
                          {team.chickenDinner && (
                            <Trophy className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No matches found</p>
          </div>
        )}
      </div>

      {/* Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Share Room Credentials</h3>
            <p className="text-gray-400 mb-4 text-sm">
              Share credentials for Match #{selectedMatch?.matchNumber}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Room ID</label>
                <input
                  type="text"
                  value={credentialsForm.roomId}
                  onChange={(e) => setCredentialsForm({ ...credentialsForm, roomId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter room ID"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Room Password</label>
                <input
                  type="text"
                  value={credentialsForm.roomPassword}
                  onChange={(e) => setCredentialsForm({ ...credentialsForm, roomPassword: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter room password"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCredentialsModal(false);
                  setSelectedMatch(null);
                  setCredentialsForm({ roomId: '', roomPassword: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShareCredentials}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchManagement;