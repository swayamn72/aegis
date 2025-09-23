import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Save, Shuffle, AlertCircle } from 'lucide-react';

const TeamGrouping = ({ tournament, onUpdate }) => {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get teams from participatingTeams array
  const participatingTeams = tournament.participatingTeams || [];

  // Extract team objects properly
  const getTeams = () => {
    return participatingTeams.map((team, index) => {
      // Handle both direct team objects and nested team objects
      const teamData = team.team || team;

      // Debug logging to understand the team structure
      console.log('Team data:', teamData);

      return {
        _id: teamData._id || team._id || `team_${index}`,
        teamName: teamData.teamName || teamData.name || teamData.team_name || 'Unknown Team',
        logo: teamData.logo || teamData.team_logo || null
      };
    });
  };

  const teams = getTeams();

  // Load groups from the selected phase when component mounts or phase changes
  useEffect(() => {
    if (selectedPhase) {
      const phase = tournament.phases?.find(p => p.name === selectedPhase);
      if (phase && phase.groups) {
        setGroups(phase.groups);
      } else {
        setGroups([]);
      }
    } else {
      // If no phase selected, load from tournament-level groups for backward compatibility
      setGroups(tournament.groups || []);
    }
  }, [selectedPhase, tournament.phases, tournament.groups]);

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      teams: []
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
  };

  const handleRemoveGroup = (groupId) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };

  const handleAddTeamToGroup = (groupId, teamId) => {
    if (!teamId) return;

    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        if (!group.teams.includes(teamId)) {
          return { ...group, teams: [...group.teams, teamId] };
        }
      }
      return group;
    });
    setGroups(updatedGroups);
  };

  const handleRemoveTeamFromGroup = (groupId, teamId) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        return { ...group, teams: group.teams.filter(t => t !== teamId) };
      }
      return group;
    });
    setGroups(updatedGroups);
  };

  const handleRandomizeGroups = () => {
    if (teams.length === 0) return;

    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const teamsPerGroup = Math.ceil(shuffledTeams.length / groups.length);
    const newGroups = groups.map((group, index) => ({
      ...group,
      teams: shuffledTeams.slice(index * teamsPerGroup, (index + 1) * teamsPerGroup).map(t => t._id)
    }));
    setGroups(newGroups);
  };

  const handleSave = async () => {
    if (groups.length === 0) {
      setError('Please create at least one group before saving');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find the phase by name to get its ID
      const phase = tournament.phases?.find(p => p.name === selectedPhase);
      const phaseId = phase?._id || phase?.id;

      const response = await fetch(`http://localhost:5000/api/tournaments/${tournament._id}/groups`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groups,
          phaseId: phaseId || null
        }),
      });

      if (response.ok) {
        const updatedTournament = await response.json();
        onUpdate(updatedTournament.tournament);
        setError(null);
        setSuccess('Groups saved successfully!');
        setTimeout(() => setSuccess(null), 3000); // Clear success message after 3 seconds
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save groups');
      }
    } catch (err) {
      setError('Error saving groups. Please check your connection and try again.');
      console.error('Error saving groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTeams = (groupId) => {
    const usedTeamIds = groups.flatMap(g => g.teams);
    return teams.filter(team => !usedTeamIds.includes(team._id) || groups.find(g => g.id === groupId)?.teams.includes(team._id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Team Grouping</h3>
        <div className="flex gap-2">
          <button
            onClick={handleRandomizeGroups}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Randomize
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Groups
          </button>
        </div>
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

      {/* Add New Group */}
      <div className="bg-zinc-800/50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-white mb-4">Add New Group</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Group Name (e.g., Group A)"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
          />
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
          >
            <option value="">Select Phase (Optional)</option>
            {tournament.phases?.map(phase => (
              <option key={phase._id || phase.id} value={phase.name}>{phase.name}</option>
            ))}
          </select>
          <button
            onClick={handleAddGroup}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Group
          </button>
        </div>
        <p className="text-xs text-zinc-400">
          Note: Groups can be associated with phases to organize them better. If no phase is selected, the group will be available for all phases.
        </p>
      </div>

      {/* Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <div key={group.id} className="bg-zinc-800/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-white">{group.name}</h4>
              <button
                onClick={() => handleRemoveGroup(group.id)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add Team to Group */}
            <div className="mb-4">
              <select
                onChange={(e) => handleAddTeamToGroup(group.id, e.target.value)}
                className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
                value=""
              >
                <option value="">Add Team to Group</option>
                {getAvailableTeams(group.id).map(team => (
                  <option key={team._id} value={team._id}>{team.teamName}</option>
                ))}
              </select>
            </div>

            {/* Teams in Group */}
            <div className="space-y-2">
              {group.teams.map(teamId => {
                // Try to find the team in participatingTeams with different possible structures
                const team = participatingTeams.find(t => {
                  const teamData = t.team || t;
                  return (teamData._id === teamId) || (t._id === teamId);
                });

                // Also try to find in the processed teams array
                const processedTeam = teams.find(t => t._id === teamId);

                console.log('Looking for team:', teamId, 'Found team:', team, 'Processed team:', processedTeam);

                return (
                  <div key={teamId} className="flex items-center justify-between p-2 bg-zinc-700/50 rounded">
                    <div className="flex items-center gap-2">
                      {(team?.logo || processedTeam?.logo) && (
                        <img src={team?.logo || processedTeam?.logo} alt={team?.teamName || processedTeam?.teamName} className="w-6 h-6 rounded" />
                      )}
                      <span className="text-white text-sm">
                        {team?.teamName || processedTeam?.teamName || `Team ${teamId}`}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveTeamFromGroup(group.id, teamId)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            {group.teams.length === 0 && (
              <p className="text-zinc-400 text-sm">No teams in this group yet.</p>
            )}
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No groups created yet. Add groups to organize teams.</p>
        </div>
      )}
    </div>
  );
};

export default TeamGrouping;
