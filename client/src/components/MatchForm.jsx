import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, Clock, Trophy } from 'lucide-react';

const MatchForm = ({ match, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    matchNumber: '',
    matchType: 'group_stage',
    tournament: '',
    tournamentPhase: '',
    scheduledStartTime: '',
    map: 'Erangel',
    status: 'scheduled',
    participatingTeams: [],
    pointsSystem: {
      placementPoints: {
        1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1
      },
      killPoints: 1
    },
    streamUrls: [],
    tags: [],
    isOfficial: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [availableTournaments, setAvailableTournaments] = useState([]);

  useEffect(() => {
    if (match) {
      setFormData({
        ...match,
        scheduledStartTime: match.scheduledStartTime ? match.scheduledStartTime.slice(0, 16) : ''
      });
    }
  }, [match]);

  // Mock data for teams and tournaments
  useEffect(() => {
    setAvailableTeams([
      { _id: '1', teamName: 'Team Alpha', teamTag: 'ALP' },
      { _id: '2', teamName: 'Team Beta', teamTag: 'BETA' },
      { _id: '3', teamName: 'Team Gamma', teamTag: 'GAM' },
      { _id: '4', teamName: 'Team Delta', teamTag: 'DEL' }
    ]);

    setAvailableTournaments([
      { _id: '1', tournamentName: 'BGMI Championship 2024' },
      { _id: '2', tournamentName: 'Valorant Champions League' }
    ]);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTeamAdd = (teamId) => {
    const team = availableTeams.find(t => t._id === teamId);
    if (team && !formData.participatingTeams.find(t => t.team === teamId)) {
      setFormData(prev => ({
        ...prev,
        participatingTeams: [
          ...prev.participatingTeams,
          {
            team: teamId,
            teamName: team.teamName,
            teamTag: team.teamTag,
            players: [],
            finalPosition: null,
            points: { placementPoints: 0, killPoints: 0, totalPoints: 0 },
            kills: { total: 0 },
            survivalTime: 0,
            totalDamage: 0,
            chickenDinner: false
          }
        ]
      }));
    }
  };

  const handleTeamRemove = (teamIndex) => {
    setFormData(prev => ({
      ...prev,
      participatingTeams: prev.participatingTeams.filter((_, index) => index !== teamIndex)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newErrors = {};

      if (!formData.matchNumber) {
        newErrors.matchNumber = 'Match number is required';
      }

      if (!formData.tournament) {
        newErrors.tournament = 'Tournament is required';
      }

      if (!formData.scheduledStartTime) {
        newErrors.scheduledStartTime = 'Start time is required';
      }

      if (!formData.map) {
        newErrors.map = 'Map is required';
      }

      if (formData.participatingTeams.length === 0) {
        newErrors.participatingTeams = 'At least one team is required';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapOptions = [
    'Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik', 'Nusa', 'Rondo'
  ];

  const matchTypeOptions = [
    'group_stage', 'qualifier', 'playoff', 'semifinal', 'final'
  ];

  const statusOptions = [
    'scheduled', 'in_progress', 'completed', 'cancelled', 'abandoned'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {isEditing ? 'Edit Match' : 'Schedule New Match'}
            </h2>
            <button
              onClick={onCancel}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Match Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Match Number *
              </label>
              <input
                type="number"
                name="matchNumber"
                value={formData.matchNumber}
                onChange={handleChange}
                className={`w-full bg-zinc-800/50 border rounded-lg px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.matchNumber ? 'border-red-500' : 'border-zinc-700'
                }`}
                placeholder="Enter match number"
                min="1"
              />
              {errors.matchNumber && (
                <p className="text-red-400 text-sm mt-1">{errors.matchNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Match Type
              </label>
              <select
                name="matchType"
                value={formData.matchType}
                onChange={handleChange}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {matchTypeOptions.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tournament *
              </label>
              <select
                name="tournament"
                value={formData.tournament}
                onChange={handleChange}
                className={`w-full bg-zinc-800/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.tournament ? 'border-red-500' : 'border-zinc-700'
                }`}
              >
                <option value="">Select Tournament</option>
                {availableTournaments.map(tournament => (
                  <option key={tournament._id} value={tournament._id}>
                    {tournament.tournamentName}
                  </option>
                ))}
              </select>
              {errors.tournament && (
                <p className="text-red-400 text-sm mt-1">{errors.tournament}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tournament Phase
              </label>
              <input
                type="text"
                name="tournamentPhase"
                value={formData.tournamentPhase}
                onChange={handleChange}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., Group Stage Day 1"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Scheduled Start Time *
              </label>
              <input
                type="datetime-local"
                name="scheduledStartTime"
                value={formData.scheduledStartTime}
                onChange={handleChange}
                className={`w-full bg-zinc-800/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.scheduledStartTime ? 'border-red-500' : 'border-zinc-700'
                }`}
              />
              {errors.scheduledStartTime && (
                <p className="text-red-400 text-sm mt-1">{errors.scheduledStartTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Map *
              </label>
              <select
                name="map"
                value={formData.map}
                onChange={handleChange}
                className={`w-full bg-zinc-800/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.map ? 'border-red-500' : 'border-zinc-700'
                }`}
              >
                {mapOptions.map(map => (
                  <option key={map} value={map}>{map}</option>
                ))}
              </select>
              {errors.map && (
                <p className="text-red-400 text-sm mt-1">{errors.map}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Teams */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Participating Teams *
            </label>

            {/* Add Teams */}
            <div className="mb-4">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleTeamAdd(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                defaultValue=""
              >
                <option value="">Add Team...</option>
                {availableTeams
                  .filter(team => !formData.participatingTeams.find(t => t.team === team._id))
                  .map(team => (
                    <option key={team._id} value={team._id}>
                      {team.teamName} ({team.teamTag})
                    </option>
                  ))}
              </select>
              {errors.participatingTeams && (
                <p className="text-red-400 text-sm mt-1">{errors.participatingTeams}</p>
              )}
            </div>

            {/* Team List */}
            <div className="space-y-2">
              {formData.participatingTeams.map((team, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-700 rounded flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{team.teamName}</p>
                      <p className="text-zinc-400 text-sm">{team.teamTag}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTeamRemove(index)}
                    className="text-zinc-400 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-zinc-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditing ? 'Updating...' : 'Scheduling...'}
                </div>
              ) : (
                isEditing ? 'Update Match' : 'Schedule Match'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchForm;
