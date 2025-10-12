import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Save, Shuffle, AlertCircle } from 'lucide-react';

const TeamGrouping = ({ tournament, onUpdate }) => {
  const [phaseGroups, setPhaseGroups] = useState({});
  const [teamsPerGroup, setTeamsPerGroup] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get teams from participatingTeams array
  const participatingTeams = tournament.participatingTeams || [];

  const getPhaseTeams = (phaseName) => {
    // Use participatingTeams with matching currentStage (always populated with teamName)
    return participatingTeams
      .filter(pt => pt.currentStage === phaseName)
      .map(pt => {
        const teamData = pt.team || pt;
        return {
          _id: teamData._id,
          teamName: teamData.teamName || teamData.name || 'Unknown Team',
          logo: teamData.logo || null
        };
      });
  };

  // Load groups and initialize teamsPerGroup for all phases
  useEffect(() => {
    const initialTeamsPerGroup = {};
    const initialPhaseGroups = {};
    tournament.phases?.forEach(phase => {
      initialTeamsPerGroup[phase.name] = 16; // default
      initialPhaseGroups[phase.name] = phase.groups || [];
    });
    setTeamsPerGroup(initialTeamsPerGroup);
    setPhaseGroups(initialPhaseGroups);
  }, [tournament.phases]);

  const updatePhaseGroups = (phaseName, updatedGroups) => {
    setPhaseGroups(prev => ({
      ...prev,
      [phaseName]: updatedGroups
    }));
  };

  const updateTeamsPerGroup = (phaseName, value) => {
    setTeamsPerGroup(prev => ({
      ...prev,
      [phaseName]: parseInt(value) || 16
    }));
  };

  const handleAllocateGroups = (phaseName) => {
    const phaseTeams = getPhaseTeams(phaseName);
    if (phaseTeams.length === 0) {
      setError(`No teams available for phase: ${phaseName}`);
      return;
    }

    const groupSize = teamsPerGroup[phaseName] || 16;
    if (groupSize <= 0) {
      setError('Number of teams per group must be greater than 0');
      return;
    }

    const numGroups = Math.ceil(phaseTeams.length / groupSize);
    const shuffledTeams = [...phaseTeams].sort(() => Math.random() - 0.5);

    const newGroups = [];
    for (let i = 0; i < numGroups; i++) {
      const start = i * groupSize;
      const end = start + groupSize;
      const groupTeams = shuffledTeams.slice(start, end).map(t => t._id);
      const groupName = `Group ${String.fromCharCode(65 + i)}`; // A, B, C...
      newGroups.push({
        id: `${phaseName}-group-${i}`,
        name: groupName,
        teams: groupTeams
      });
    }

    updatePhaseGroups(phaseName, newGroups);
    setError(null);
    setSuccess(`Groups allocated for ${phaseName}`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleShuffle = (phaseName) => {
    const currentGroups = phaseGroups[phaseName] || [];
    if (currentGroups.length === 0) {
      setError('No groups to shuffle. Please allocate groups first.');
      return;
    }

    const phaseTeams = getPhaseTeams(phaseName);
    const shuffledTeams = [...phaseTeams].sort(() => Math.random() - 0.5);

    // Distribute evenly to existing groups
    const newGroups = currentGroups.map((group, i) => {
      const start = i * (shuffledTeams.length / currentGroups.length);
      const end = (i + 1) * (shuffledTeams.length / currentGroups.length);
      const groupTeams = shuffledTeams.slice(Math.floor(start), Math.ceil(end)).map(t => t._id);
      return { ...group, teams: groupTeams };
    });

    updatePhaseGroups(phaseName, newGroups);
    setError(null);
    setSuccess(`Groups shuffled for ${phaseName}`);
    setTimeout(() => setSuccess(null), 3000);
  };

  const getAvailableTeams = (phaseName, groupId) => {
    const phaseTeams = getPhaseTeams(phaseName);
    const currentGroups = phaseGroups[phaseName] || [];
    const group = currentGroups.find(g => g.id === groupId);
    const usedTeamIds = currentGroups
      .filter(g => g.id !== groupId)
      .flatMap(g => g.teams);
    return phaseTeams.filter(team => 
      !usedTeamIds.includes(team._id) || (group && group.teams.includes(team._id))
    );
  };

  const handleAddTeamToGroup = (phaseName, groupId, teamId) => {
    if (!teamId) return;

    const currentGroups = phaseGroups[phaseName] || [];
    const updatedGroups = currentGroups.map(group => {
      if (group.id === groupId) {
        if (!group.teams.includes(teamId)) {
          return { ...group, teams: [...group.teams, teamId] };
        }
      }
      return group;
    });
    updatePhaseGroups(phaseName, updatedGroups);
  };

  const handleRemoveTeamFromGroup = (phaseName, groupId, teamId) => {
    const currentGroups = phaseGroups[phaseName] || [];
    const updatedGroups = currentGroups.map(group => {
      if (group.id === groupId) {
        return { ...group, teams: group.teams.filter(t => t !== teamId) };
      }
      return group;
    });
    updatePhaseGroups(phaseName, updatedGroups);
  };

  const handleRemoveGroup = (phaseName, groupId) => {
    const currentGroups = phaseGroups[phaseName] || [];
    const updatedGroups = currentGroups.filter(g => g.id !== groupId);
    updatePhaseGroups(phaseName, updatedGroups);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      for (const phase of tournament.phases || []) {
        const phaseName = phase.name;
        const groupsToSave = phaseGroups[phaseName] || [];
        if (groupsToSave.length === 0) continue;

        const response = await fetch(`http://localhost:5000/api/tournaments/${tournament._id}/groups`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groups: groupsToSave,
            phaseId: phase._id
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to save groups for ${phaseName}: ${errorData.error || 'Unknown error'}`);
        }
      }

      const updatedTournament = await fetch(`http://localhost:5000/api/tournaments/${tournament._id}`).then(res => res.json());
      onUpdate(updatedTournament);
      setSuccess('All groups saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Error saving groups');
      console.error('Error saving groups:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!tournament.phases || tournament.phases.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400">No phases configured. Create phases first to manage groups.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Team Grouping</h3>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Groups
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400">{success}</span>
        </div>
      )}

      {tournament.phases.map(phase => {
        const phaseName = phase.name;
        const phaseTeams = getPhaseTeams(phaseName);
        const currentGroups = phaseGroups[phaseName] || [];

        return (
          <div key={phase._id || phaseName} className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
            <h4 className="text-lg font-semibold text-white mb-4">Phase: {phaseName}</h4>
            <p className="text-zinc-400 mb-4">Available teams: {phaseTeams.length}</p>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-zinc-400">Teams per group:</label>
                <input
                  type="number"
                  min="1"
                  value={teamsPerGroup[phaseName] || 16}
                  onChange={(e) => updateTeamsPerGroup(phaseName, e.target.value)}
                  className="w-20 bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white text-center"
                />
              </div>
              <button
                onClick={() => handleAllocateGroups(phaseName)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Allocate Groups
              </button>
              <button
                onClick={() => handleShuffle(phaseName)}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Shuffle
              </button>
            </div>

            {currentGroups.length === 0 ? (
              <p className="text-zinc-400 text-sm">No groups created yet. Use "Allocate Groups" to create groups automatically.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentGroups.map(group => (
                  <div key={group.id} className="bg-zinc-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-white font-medium">{group.name}</h5>
                      <button
                        onClick={() => handleRemoveGroup(phaseName, group.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Add Team to Group */}
                    <select
                      onChange={(e) => handleAddTeamToGroup(phaseName, group.id, e.target.value)}
                      className="w-full bg-zinc-600 border border-zinc-500 rounded px-3 py-2 text-white mb-3 text-sm"
                      value=""
                    >
                      <option value="">Add Team to {group.name}</option>
                      {getAvailableTeams(phaseName, group.id).map((team, index) => (
                        <option key={team._id || index} value={team._id}>{team.teamName}</option>
                      ))}
                    </select>

                    {/* Teams in Group */}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {group.teams.map((teamId, index) => {
                        const team = phaseTeams.find(t => t._id === teamId);
                        if (!team) return null;
                        return (
                          <div key={teamId || index} className="flex items-center justify-between p-2 bg-zinc-600/50 rounded">
                            <div className="flex items-center gap-2">
                              {team.logo && (
                                <img src={team.logo} alt={team.teamName} className="w-6 h-6 rounded" />
                              )}
                              <span className="text-white text-sm">{team.teamName}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveTeamFromGroup(phaseName, group.id, teamId)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                      {group.teams.length === 0 && (
                        <p className="text-zinc-400 text-xs italic">No teams in this group</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {tournament.phases.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No phases configured. Create phases first to manage groups.</p>
        </div>
      )}
    </div>
  );
};

export default TeamGrouping;
