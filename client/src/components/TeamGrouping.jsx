import React, { useState, useEffect } from 'react';
import { Users, Shuffle, Save, AlertCircle, Grid3x3, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';

const TeamGrouping = ({ tournament, onUpdate }) => {
  const [selectedPhase, setSelectedPhase] = useState('');
  const [groups, setGroups] = useState([]);
  const [teamsPerGroup, setTeamsPerGroup] = useState(16);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedPhase) {
      const phase = tournament.phases?.find(p => p.name === selectedPhase);
      if (phase && phase.groups) {
        setGroups(phase.groups.map(g => ({
          ...g,
          teams: g.teams?.map(t => t._id || t) || []
        })));
      } else {
        setGroups([]);
      }
    }
  }, [selectedPhase, tournament]);

  const getPhaseTeams = () => {
    return tournament.participatingTeams
      ?.filter(pt => pt.currentStage === selectedPhase)
      .map(pt => ({
        _id: pt.team?._id || pt.team,
        teamName: pt.team?.teamName || pt.teamName || 'Unknown Team',
        logo: pt.team?.logo || pt.logo
      })) || [];
  };

  const handleAutoAllocate = () => {
    const phaseTeams = getPhaseTeams();
    if (phaseTeams.length === 0) {
      toast.error('No teams available in this phase');
      return;
    }

    const numGroups = Math.ceil(phaseTeams.length / teamsPerGroup);
    const shuffled = [...phaseTeams].sort(() => Math.random() - 0.5);
    
    const newGroups = [];
    for (let i = 0; i < numGroups; i++) {
      const start = i * teamsPerGroup;
      const end = start + teamsPerGroup;
      const groupTeams = shuffled.slice(start, end).map(t => t._id);
      
      newGroups.push({
        name: `Group ${String.fromCharCode(65 + i)}`,
        teams: groupTeams,
        standings: []
      });
    }

    setGroups(newGroups);
    toast.success(`Created ${numGroups} groups`);
  };

  const handleShuffle = () => {
    if (groups.length === 0) {
      toast.error('Please allocate groups first');
      return;
    }

    const phaseTeams = getPhaseTeams();
    const shuffled = [...phaseTeams].sort(() => Math.random() - 0.5);
    const teamsPerGroupCalc = Math.ceil(shuffled.length / groups.length);

    const newGroups = groups.map((group, i) => {
      const start = i * teamsPerGroupCalc;
      const end = start + teamsPerGroupCalc;
      return {
        ...group,
        teams: shuffled.slice(start, end).map(t => t._id)
      };
    });

    setGroups(newGroups);
    toast.success('Teams shuffled');
  };

  const handleSave = async () => {
    if (!selectedPhase) {
      toast.error('Please select a phase');
      return;
    }

    setLoading(true);
    try {
      const phase = tournament.phases?.find(p => p.name === selectedPhase);
      const response = await fetch(
        `http://localhost:5000/api/tournaments/${tournament._id}/groups`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groups: groups,
            phaseId: phase._id
          })
        }
      );

      if (response.ok) {
        toast.success('Groups saved successfully');
        onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save groups');
      }
    } catch (error) {
      console.error('Error saving groups:', error);
      toast.error('Failed to save groups');
    } finally {
      setLoading(false);
    }
  };

  const removeTeamFromGroup = (groupIndex, teamId) => {
    const newGroups = [...groups];
    newGroups[groupIndex].teams = newGroups[groupIndex].teams.filter(t => t !== teamId);
    setGroups(newGroups);
  };

  const phaseTeams = selectedPhase ? getPhaseTeams() : [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Grouping</h2>
          <p className="text-gray-400 text-sm mt-1">Organize teams into groups for round-robin matches</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading || !selectedPhase || groups.length === 0}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Groups'}
        </button>
      </div>

      {/* Phase Selector */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-5 mb-6">
        <label className="block text-sm text-gray-400 mb-2">Select Phase</label>
        <select
          value={selectedPhase}
          onChange={(e) => setSelectedPhase(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Choose a phase...</option>
          {tournament.phases?.map((phase, idx) => (
            <option key={idx} value={phase.name}>
              {phase.name} ({phase.teams?.length || 0} teams)
            </option>
          ))}
        </select>
      </div>

      {selectedPhase && (
        <>
          {/* Group Controls */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-5 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-400">Teams per group:</label>
                <input
                  type="number"
                  min="1"
                  max={phaseTeams.length}
                  value={teamsPerGroup}
                  onChange={(e) => setTeamsPerGroup(parseInt(e.target.value) || 16)}
                  className="w-20 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                onClick={handleAutoAllocate}
                disabled={phaseTeams.length === 0}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Grid3x3 className="w-4 h-4" />
                Auto Allocate
              </button>

              <button
                onClick={handleShuffle}
                disabled={groups.length === 0}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Shuffle
              </button>

              <div className="ml-auto text-sm text-gray-400">
                {phaseTeams.length} teams available
              </div>
            </div>
          </div>

          {/* Groups Display */}
          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group, groupIndex) => (
                <div key={groupIndex} className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-orange-400 font-bold text-sm">
                          {String.fromCharCode(65 + groupIndex)}
                        </span>
                      </div>
                      {group.name}
                    </h3>
                    <span className="text-gray-400 text-sm">{group.teams.length} teams</span>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {group.teams.map((teamId, teamIndex) => {
                      const team = phaseTeams.find(t => t._id === teamId);
                      if (!team) return null;

                      return (
                        <div
                          key={teamIndex}
                          className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-all"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {team.logo ? (
                              <img src={team.logo} alt={team.teamName} className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            <span className="text-white text-sm truncate">{team.teamName}</span>
                          </div>
                          <button
                            onClick={() => removeTeamFromGroup(groupIndex, teamId)}
                            className="text-red-400 hover:text-red-300 transition-colors ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                    {group.teams.length === 0 && (
                      <p className="text-gray-400 text-sm text-center py-4">No teams in this group</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-800/30 rounded-xl border border-gray-700">
              <Grid3x3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Groups Created</h3>
              <p className="text-gray-400 mb-6">Use "Auto Allocate" to create groups automatically</p>
              <button
                onClick={handleAutoAllocate}
                disabled={phaseTeams.length === 0}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
              >
                Create Groups
              </button>
            </div>
          )}
        </>
      )}

      {!selectedPhase && (
        <div className="text-center py-16 bg-gray-800/30 rounded-xl border border-gray-700">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Select a Phase</h3>
          <p className="text-gray-400">Choose a phase to manage team groups</p>
        </div>
      )}
    </div>
  );
};

export default TeamGrouping;