import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, X, ChevronDown, Grid3x3, List } from 'lucide-react';
import { toast } from 'react-toastify';
import TeamSelector from './TeamSelector';

const TeamManagement = ({ tournament, onUpdate }) => {
  const [selectedPhase, setSelectedPhase] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [isPhaseDropdownOpen, setIsPhaseDropdownOpen] = useState(false);

  const handleAddTeam = async (team) => {
    if (!selectedPhase) {
      toast.error('Please select a phase first');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/org-tournaments/${tournament._id}/phases/${selectedPhase}/teams`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ teamId: team._id })
        }
      );

      if (response.ok) {
        toast.success(`${team.teamName} added to ${selectedPhase}`);
        setShowTeamSelector(false);
        onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add team');
      }
    } catch (error) {
      console.error('Error adding team:', error);
      toast.error('Failed to add team');
    }
  };

  const handleRemoveTeam = async (team) => {
    if (!selectedPhase) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/org-tournaments/${tournament._id}/phases/${selectedPhase}/teams/${team._id}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (response.ok) {
        toast.success(`${team.teamName} removed from ${selectedPhase}`);
        onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to remove team');
      }
    } catch (error) {
      console.error('Error removing team:', error);
      toast.error('Failed to remove team');
    }
  };

  const availablePhases = tournament.phases?.map(p => p.name) || [];

  const filteredTeams = selectedPhase
    ? (tournament.participatingTeams || []).filter(pt => {
        const matchesPhase = pt.currentStage === selectedPhase;
        const matchesSearch = searchTerm === '' || 
          (pt.team?.teamName || pt.teamName || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesPhase && matchesSearch;
      })
    : (tournament.participatingTeams || []).filter(pt => {
        return searchTerm === '' || 
          (pt.team?.teamName || pt.teamName || '').toLowerCase().includes(searchTerm.toLowerCase());
      });

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Management</h2>
          <p className="text-gray-400 text-sm mt-1">
            {filteredTeams.length} {selectedPhase ? `in ${selectedPhase}` : 'total teams'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Phase Selector */}
        <div className="relative">
          <button
            onClick={() => setIsPhaseDropdownOpen(!isPhaseDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-all"
          >
            <span>{selectedPhase || 'All Phases'}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isPhaseDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPhaseDropdownOpen && (
            <div className="absolute top-full mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedPhase('');
                  setIsPhaseDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
              >
                All Phases
              </button>
              {availablePhases.map((phase, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedPhase(phase);
                    setIsPhaseDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors"
                >
                  {phase}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Team Button */}
      {selectedPhase && (
        <button
          onClick={() => setShowTeamSelector(true)}
          className="w-full mb-6 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Team to {selectedPhase}
        </button>
      )}

      {/* Teams Display */}
      {filteredTeams.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        }>
          {filteredTeams.map((participatingTeam, index) => {
            const team = participatingTeam.team || participatingTeam;
            const teamName = team.teamName || team.name || 'Unknown Team';
            const teamTag = team.teamTag || '';
            const teamLogo = team.logo || participatingTeam.logo;

            if (viewMode === 'grid') {
              return (
                <div
                  key={team._id || index}
                  className="bg-gray-700/50 rounded-xl p-4 border border-gray-600 hover:border-orange-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {teamLogo ? (
                      <img src={teamLogo} alt={teamName} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{teamName}</h4>
                      {teamTag && (
                        <p className="text-gray-400 text-xs truncate">{teamTag}</p>
                      )}
                    </div>
                  </div>
                  
                  {participatingTeam.currentStage && (
                    <div className="mb-3 px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 truncate">
                      {participatingTeam.currentStage}
                    </div>
                  )}

                  {selectedPhase && (
                    <button
                      onClick={() => handleRemoveTeam(team)}
                      className="w-full px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium"
                    >
                      Remove from {selectedPhase}
                    </button>
                  )}
                </div>
              );
            } else {
              return (
                <div
                  key={team._id || index}
                  className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-orange-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {teamLogo ? (
                        <img src={teamLogo} alt={teamName} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{teamName}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          {teamTag && <span>{teamTag}</span>}
                          {participatingTeam.currentStage && (
                            <>
                              <span>•</span>
                              <span>{participatingTeam.currentStage}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {selectedPhase && (
                      <button
                        onClick={() => handleRemoveTeam(team)}
                        className="ml-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium whitespace-nowrap"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            }
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Teams Found</h3>
          <p className="text-gray-400">
            {searchTerm 
              ? 'No teams match your search criteria' 
              : selectedPhase 
                ? `No teams in ${selectedPhase} yet` 
                : 'No teams participating yet'}
          </p>
          {selectedPhase && !searchTerm && (
            <button
              onClick={() => setShowTeamSelector(true)}
              className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
            >
              Add Teams
            </button>
          )}
        </div>
      )}

      {/* Team Selector Modal */}
      {showTeamSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Add Team to {selectedPhase}</h3>
              <button
                onClick={() => setShowTeamSelector(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <TeamSelector
                selectedPhase={selectedPhase}
                tournament={tournament}
                onSelect={handleAddTeam}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;