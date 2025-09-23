import React, { useState, useEffect } from 'react';
import { X, Search, Users, MapPin, Crown, Plus } from 'lucide-react';

const TeamSearchModal = ({ isOpen, onClose, onSelectTeam, gameTitle, selectedTeams = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchTeams = async (query) => {
    if (!query || query.length < 2) {
      setTeams([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        query,
        gameTitle: gameTitle || '',
        limit: 20
      });

      const response = await fetch(`/api/admin/teams/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search teams');
      }

      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error searching teams:', error);
      setError('Failed to search teams. Please try again.');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchTeams(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, gameTitle]);

  const handleTeamSelect = (team) => {
    // Check if team is already selected
    if (selectedTeams.some(selected => selected._id === team._id)) {
      setError('Team is already selected');
      return;
    }

    onSelectTeam(team);
    onClose();
  };

  const isTeamSelected = (teamId) => {
    return selectedTeams.some(team => team._id === teamId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Search Teams</h2>
              <p className="text-zinc-400 text-sm">Find and invite teams to your tournament</p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams by name or tag..."
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              autoFocus
            />
          </div>
          {gameTitle && (
            <div className="mt-2 text-sm text-zinc-400">
              Filtering by game: <span className="text-orange-400">{gameTitle}</span>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && teams.length === 0 && searchQuery.length >= 2 && (
            <div className="p-6 text-center">
              <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No teams found matching "{searchQuery}"</p>
              <p className="text-zinc-500 text-sm mt-1">Try a different search term</p>
            </div>
          )}

          {!loading && !error && teams.length > 0 && (
            <div className="p-4 space-y-3">
              {teams.map((team) => (
                <div
                  key={team._id}
                  className={`bg-zinc-800/50 border rounded-lg p-4 hover:bg-zinc-800/70 transition-colors ${
                    isTeamSelected(team._id) ? 'border-orange-500/50 bg-orange-500/10' : 'border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Team Logo */}
                      <div className="flex-shrink-0">
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.teamName}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-zinc-400" />
                          </div>
                        )}
                      </div>

                      {/* Team Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-white font-medium">{team.teamName}</h3>
                          {team.tag && (
                            <span className="bg-zinc-700 text-zinc-300 px-2 py-1 rounded text-xs font-mono">
                              {team.tag}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-zinc-400 mt-1">
                          <div className="flex items-center space-x-1">
                            <Crown className="w-4 h-4" />
                            <span>{team.captain?.username || 'Unknown'}</span>
                          </div>
                          {team.region && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{team.region}</span>
                            </div>
                          )}
                          <span className="text-orange-400">{team.primaryGame}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleTeamSelect(team)}
                      disabled={isTeamSelected(team._id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        isTeamSelected(team._id)
                          ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isTeamSelected(team._id) ? 'Selected' : 'Select'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && searchQuery.length < 2 && (
            <div className="p-6 text-center">
              <Search className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">Enter at least 2 characters to search teams</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800">
          <div className="flex justify-between items-center">
            <div className="text-sm text-zinc-400">
              {selectedTeams.length > 0 && (
                <span>{selectedTeams.length} team{selectedTeams.length !== 1 ? 's' : ''} selected</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSearchModal;
