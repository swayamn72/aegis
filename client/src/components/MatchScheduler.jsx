import React, { useState, useEffect } from 'react';
import { Plus, Clock, MessageSquare, Users, X, Check, AlertCircle, Calendar, Target } from 'lucide-react';
import { toast } from 'react-toastify';

const MatchScheduler = ({ tournament, onUpdate }) => {
  const [scheduledMatches, setScheduledMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [totalTeams, setTotalTeams] = useState(0);
  const [formData, setFormData] = useState({
    matchName: '',
    tournamentPhase: '',
    scheduledDate: '',
    scheduledTime: '',
    map: 'Erangel'
  });

  const phases = tournament.phases || [];
  const allGroups = phases.flatMap(phase => phase.groups || []);
  const maps = ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik', 'Nusa', 'Rondo'];

  useEffect(() => {
    fetchScheduledMatches();
  }, [tournament._id]);

  // Calculate total teams when selected groups change
  useEffect(() => {
    const teams = selectedGroups.reduce((total, groupId) => {
      const group = allGroups.find(g =>
        (g._id?.toString?.() === groupId) || (g.id === groupId) || (g.name === groupId)
      );
      return total + (group?.teams?.length || 0);
    }, 0);
    setTotalTeams(teams);
  }, [selectedGroups, allGroups]);

  const fetchScheduledMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/matches/scheduled/${tournament._id}`);
      if (response.ok) {
        const data = await response.json();
        setScheduledMatches(data.matches || []);
      } else {
        console.error('Failed to fetch scheduled matches');
      }
    } catch (error) {
      console.error('Error fetching scheduled matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.matchName.trim()) {
      toast.error('Match name is required');
      return false;
    }
    if (!formData.tournamentPhase) {
      toast.error('Please select a phase');
      return false;
    }
    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Please select date and time');
      return false;
    }
    if (selectedGroups.length === 0) {
      toast.error('Please select at least one group');
      return false;
    }
    if (totalTeams > 24) {
      toast.error('Total teams cannot exceed 24');
      return false;
    }

    const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      toast.error('Scheduled time must be in the future');
      return false;
    }

    return true;
  };

  const sendChatNotifications = async (matchData) => {
    try {
      // Get all team IDs from selected groups (match by _id | id | name)
      const teamIds = selectedGroups.flatMap(groupId => {
        const group = allGroups.find(g =>
          (g._id?.toString?.() === groupId) || (g.id === groupId) || (g.name === groupId)
        );
        return group?.teams || [];
      });

      // Get unique team IDs
      const uniqueTeamIds = [...new Set(teamIds)];

      // Send notification to each team's chat
      const notificationPromises = uniqueTeamIds.map(async (teamId) => {
        const team = tournament.participatingTeams?.find(pt =>
          (pt.team?._id || pt.team?.id || pt._id) === teamId
        );

        if (team) {
          const message = {
            messageType: 'tournament_match_schedule',
            message: `Your team has been scheduled for "${matchData.matchName}" on ${new Date(matchData.scheduledStartTime).toLocaleString()}. Map: ${matchData.map}`,
            tournamentId: tournament._id,
            matchId: matchData._id,
            senderId: 'system', // System message
            receiverId: team.team?.captain?._id || team.team?.captain, // Send to team captain
            timestamp: new Date()
          };

          return fetch('http://localhost:5000/api/chat/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(message)
          });
        }
      });

      await Promise.all(notificationPromises.filter(Boolean));
      toast.success('Notifications sent to participating teams');
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.warning('Match scheduled but failed to send some notifications');
    }
  };

  const handleScheduleMatch = async () => {
    if (!validateForm()) return;

    try {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);

      const matchData = {
        matchName: formData.matchName,
        tournament: tournament._id,
        tournamentPhase: formData.tournamentPhase,
        map: formData.map,
        scheduledStartTime: scheduledDateTime.toISOString(),
        status: 'scheduled',
        participatingGroups: selectedGroups.map(String),
        matchType: 'scheduled' // restored
      };

      const response = await fetch('http://localhost:5000/api/matches/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(matchData)
      });

      if (response.ok) {
        const savedMatch = await response.json();
        setScheduledMatches(prev => [...prev, savedMatch]);

        // Send chat notifications
        await sendChatNotifications(savedMatch);

        // Refresh tournament data to show updated phases
        if (onUpdate) {
          onUpdate();
        }

        // Reset form
        setFormData({
          matchName: '',
          tournamentPhase: '',
          scheduledDate: '',
          scheduledTime: '',
          map: 'Erangel'
        });
        setSelectedGroups([]);
        setShowScheduleForm(false);

        toast.success('Match scheduled successfully');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to schedule match');
      }
    } catch (error) {
      console.error('Error scheduling match:', error);
      toast.error('Failed to schedule match');
    }
  };

  const handleDeleteScheduledMatch = async (matchId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/matches/scheduled/${matchId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setScheduledMatches(prev => prev.filter(match => match._id !== matchId));
        toast.success('Scheduled match deleted');
      } else {
        toast.error('Failed to delete scheduled match');
      }
    } catch (error) {
      console.error('Error deleting scheduled match:', error);
      toast.error('Failed to delete scheduled match');
    }
  };

  const getGroupsForPhase = () => {
    if (!formData.tournamentPhase) return [];
    const phase = phases.find(p => p.name === formData.tournamentPhase);
    return phase?.groups || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading scheduled matches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Match Scheduling</h3>
        <button
          onClick={() => setShowScheduleForm(true)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Schedule Match
        </button>
      </div>

      {/* Scheduled Matches List */}
      <div className="space-y-4">
        {scheduledMatches.length > 0 ? (
          scheduledMatches.map(match => (
            <div key={match._id} className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">{match.matchName}</h4>
                    <p className="text-zinc-400 text-sm">{match.tournamentPhase} • {match.map}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                    Scheduled
                  </span>
                  <button
                    onClick={() => handleDeleteScheduledMatch(match._id)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete scheduled match"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-zinc-400 text-sm">Scheduled Time</p>
                  <p className="text-white font-medium">
                    {new Date(match.scheduledStartTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Participating Groups</p>
                  <p className="text-white font-medium">{match.participatingGroups?.length || 0} groups</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Total Teams</p>
                  <p className="text-white font-medium">
                    {
                      // prefer server-side participatingTeams length if > 0, otherwise derive from groups
                      (match.participatingTeams && match.participatingTeams.length > 0)
                        ? match.participatingTeams.length
                        : (match.participatingGroups?.reduce((total, groupId) => {
                          const group = allGroups.find(g =>
                            (g._id?.toString?.() === groupId) ||
                            (g.id === groupId) ||
                            (g.name === groupId)
                          );
                          return total + (group?.teams?.length || 0);
                        }, 0) || 0)
                    } teams
                  </p>
                </div>
              </div>

              {match.participatingGroups?.length > 0 && (
                <div className="bg-zinc-700/30 rounded-lg p-3">
                  <p className="text-zinc-400 text-sm mb-2">Participating Groups:</p>
                  <div className="flex flex-wrap gap-2">
                    {match.participatingGroups.map(groupId => {
                      const group = allGroups.find(g =>
                        (g._id?.toString?.() === groupId) ||
                        (g.id === groupId) ||
                        (g.name === groupId)
                      );
                      return group ? (
                        <span key={groupId} className="px-2 py-1 bg-orange-500/20 border border-orange-400/30 text-orange-400 rounded-md text-xs">
                          {group.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Matches Scheduled</h3>
            <p className="text-zinc-400">Schedule your first match to get started.</p>
          </div>
        )}
      </div>

      {/* Schedule Match Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                Schedule New Match
              </h2>
              <button
                onClick={() => setShowScheduleForm(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Match Name *</label>
                  <input
                    type="text"
                    value={formData.matchName}
                    onChange={(e) => handleInputChange('matchName', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    placeholder="e.g., Match 1"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Phase *</label>
                  <select
                    value={formData.tournamentPhase}
                    onChange={(e) => handleInputChange('tournamentPhase', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select Phase</option>
                    {phases.map(phase => (
                      <option key={phase._id || phase.id} value={phase.name}>{phase.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Time *</label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Map</label>
                  <select
                    value={formData.map}
                    onChange={(e) => handleInputChange('map', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    {maps.map(map => (
                      <option key={map} value={map}>{map}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Group Selection */}
              {formData.tournamentPhase && (
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Participating Groups *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {getGroupsForPhase().map((group) => {
                      const groupKey = group._id?.toString() || group.id || group.name;
                      const isSelected = selectedGroups.includes(groupKey);
                      const groupTeamCount = group.teams?.length || 0;

                      return (
                        <button
                          key={groupKey}
                          onClick={() => handleGroupToggle(groupKey)}
                          className={`p-3 rounded-lg text-sm transition-colors border ${isSelected
                            ? 'bg-orange-500/20 border-orange-400/50 text-orange-400'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                            }`}
                        >
                          <div className="font-medium">{group.name}</div>
                          <div className="text-xs opacity-75">{groupTeamCount} teams</div>
                        </button>
                      );
                    })}
                  </div>

                  {getGroupsForPhase().length === 0 && (
                    <p className="text-zinc-500 text-sm mt-2">No groups available for this phase</p>
                  )}
                </div>
              )}

              {/* Team Count Summary */}
              {selectedGroups.length > 0 && (
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-400 text-sm">Selected Groups:</span>
                      <span className="text-white font-medium">{selectedGroups.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-400 text-sm">Total Teams:</span>
                      <span className={`font-medium ${totalTeams > 24 ? 'text-red-400' : 'text-green-400'}`}>
                        {totalTeams}/24
                      </span>
                    </div>
                  </div>

                  {totalTeams > 24 && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Team limit exceeded. Maximum 24 teams allowed.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setShowScheduleForm(false)}
                className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleMatch}
                disabled={totalTeams > 24 || selectedGroups.length === 0}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Schedule & Notify Teams
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchScheduler;
