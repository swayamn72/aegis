import React, { useState, useEffect } from 'react';
import { X, Edit, Save, Users, Trophy, Calendar, Settings, Target, BarChart3, Check, X as XIcon } from 'lucide-react';
import TournamentForm from './TournamentForm';
import PhaseManager from './PhaseManager';
import MatchManagement from './MatchManagement';
import PointsTable from './PointsTable';
import TeamGrouping from './TeamGrouping';
import Seeding from './Seeding';

const TournamentWindow = ({ tournament, isOpen, onClose, onSave, isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTournament, setEditedTournament] = useState(tournament);
  const [isPhaseManagerOpen, setIsPhaseManagerOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('');

  useEffect(() => {
    setEditedTournament(tournament);
  }, [tournament]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'edit', name: 'Edit', icon: Edit },
    { id: 'phases', name: 'Phases', icon: Target },
    { id: 'matches', name: 'Matches', icon: Calendar },
    { id: 'teams', name: 'Teams', icon: Users },
    { id: 'points', name: 'Points Table', icon: Trophy },
    { id: 'groups', name: 'Groups', icon: Users },
    { id: 'seeding', name: 'Seeding', icon: Settings }
  ];

  const handleSave = async (updatedTournament) => {
    await onSave(updatedTournament);
    setIsEditing(false);
    setEditedTournament(updatedTournament);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Add handlers for admin and organizer actions
  const handleAdminAddTeamToPhase = async (team, phase) => {
    // Backend call to add team to phase
  };
  const handleAdminRemoveTeamFromPhase = async (team, phase) => {
    // Backend call to remove team from phase
  };
  const handleSendInvite = async (team, phase) => {
    // Backend call to send invite for phase
  };

  if (!isOpen || !tournament) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{tournament.tournamentName}</h2>
              <p className="text-zinc-400">{tournament.gameTitle} • {tournament.region}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                <span>{isEditing ? 'Save' : 'Edit'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-orange-400 border-b-2 border-orange-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Tournament Info</h3>
                  <div className="space-y-2">
                    <p className="text-zinc-400">Game: <span className="text-white">{tournament.gameTitle}</span></p>
                    <p className="text-zinc-400">Region: <span className="text-white">{tournament.region}</span></p>
                    <p className="text-zinc-400">Tier: <span className="text-white">{tournament.tier}-Tier</span></p>
                    <p className="text-zinc-400">Status: <span className="text-white">{tournament.status}</span></p>
                    <p className="text-zinc-400">Start Date: <span className="text-white">{new Date(tournament.startDate).toLocaleDateString()}</span></p>
                    <p className="text-zinc-400">End Date: <span className="text-white">{new Date(tournament.endDate).toLocaleDateString()}</span></p>
                  </div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Prize Pool</h3>
                  <div className="space-y-2">
                    <p className="text-zinc-400">Total: <span className="text-white">₹{tournament.prizePool?.total?.toLocaleString() || '0'}</span></p>
                    <p className="text-zinc-400">Teams: <span className="text-white">{tournament.participatingTeams?.length || 0}/{tournament.slots?.total || 0}</span></p>
                  </div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Phases</h3>
                  <div className="space-y-2">
                    {tournament.phases?.length > 0 ? (
                      tournament.phases.map((phase, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-zinc-400">{phase.name}</span>
                          <span className="text-white">{phase.status}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-400">No phases configured yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'edit' && isAdmin && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Edit Tournament</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors flex items-center gap-2"
                  >
                    <XIcon className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave(editedTournament)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
              <TournamentForm
                tournament={editedTournament}
                onSubmit={handleSave}
                onCancel={() => setIsEditing(false)}
                isEditing={true}
              />
            </div>
          )}

          {activeTab === 'phases' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Tournament Phases</h3>
                {isAdmin && (
                  <button
                    onClick={() => {
                      // Open PhaseManager modal for editing
                      setActiveTab('phases-edit');
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Phases
                  </button>
                )}
              </div>

              {tournament.phases?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tournament.phases.map((phase, index) => (
                    <div key={index} className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{phase.name}</h4>
                            <p className="text-zinc-400 text-sm">{phase.type}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          phase.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                          phase.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                          phase.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {phase.status}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-zinc-400 text-sm">Format</p>
                          <p className="text-white">{phase.format || 'Not specified'}</p>
                        </div>

                        <div>
                          <p className="text-zinc-400 text-sm">Duration</p>
                          <p className="text-white">
                            {phase.startDate ? new Date(phase.startDate).toLocaleDateString() : 'TBD'} - {' '}
                            {phase.endDate ? new Date(phase.endDate).toLocaleDateString() : 'TBD'}
                          </p>
                        </div>

                        {phase.description && (
                          <div>
                            <p className="text-zinc-400 text-sm">Description</p>
                            <p className="text-white text-sm">{phase.description}</p>
                          </div>
                        )}

                        {phase.matches && phase.matches.length > 0 && (
                          <div>
                            <p className="text-zinc-400 text-sm">Matches</p>
                            <p className="text-white">{phase.matches.length} matches</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Phases Configured</h3>
                  <p className="text-zinc-400 mb-4">This tournament doesn't have any phases set up yet.</p>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        // Open PhaseManager modal for editing
                        setActiveTab('phases-edit');
                      }}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Create First Phase
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'phases-edit' && isAdmin && (
            <PhaseManager
              initialPhases={tournament.phases || []}
              onSave={(phases) => {
                const updated = { ...editedTournament, phases };
                setEditedTournament(updated);
                onSave(updated);
                setActiveTab('phases'); // Go back to phases view
              }}
              onClose={() => setActiveTab('phases')}
            />
          )}

          {activeTab === 'matches' && (
            <MatchManagement
              tournament={tournament}
              onUpdate={(updatedTournament) => {
                setEditedTournament(updatedTournament);
                if (isAdmin) onSave(updatedTournament);
              }}
            />
          )}

          {activeTab === 'teams' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Participating Teams</h3>
              {/* Phase selection for invite/admin controls */}
              {tournament.phases?.length > 0 && (
                <div className="mb-4 flex gap-2 items-center">
                  <span className="text-zinc-400">Select Phase:</span>
                  <select
                    value={selectedPhase || ''}
                    onChange={e => setSelectedPhase(e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white"
                  >
                    <option value="">All Phases</option>
                    {tournament.phases.map((phase, idx) => (
                      <option key={idx} value={phase.name}>{phase.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {tournament.participatingTeams?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tournament.participatingTeams.map((participatingTeam, index) => {
                    // Handle both populated and unpopulated team references
                    const team = participatingTeam.team || participatingTeam;
                    const teamName = team.teamName || team.name || participatingTeam.teamName || 'Unknown Team';
                    const teamLogo = team.logo || participatingTeam.logo;
                    const qualifiedThrough = participatingTeam.qualifiedThrough || 'Not specified';
                    // Phase-specific invite status
                    const phaseInvite = participatingTeam.invites?.find(inv => inv.phase === selectedPhase) || {};
                    const inviteStatus = phaseInvite.status || 'none';
                    const inviteExpiry = new Date(tournament.startDate).getTime() - 2 * 60 * 60 * 1000;
                    const now = Date.now();
                    return (
                      <div key={participatingTeam._id || index} className="bg-zinc-800/50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          {teamLogo && (
                            <img 
                              src={teamLogo} 
                              alt={teamName} 
                              className="w-10 h-10 rounded object-cover" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{teamName}</h4>
                            <div className="flex flex-col gap-1">
                              <p className="text-zinc-400 text-sm">Qualified through: {qualifiedThrough}</p>
                              {participatingTeam.group && (
                                <p className="text-zinc-500 text-xs">Group: {participatingTeam.group}</p>
                              )}
                              {participatingTeam.seed && (
                                <p className="text-zinc-500 text-xs">Seed: #{participatingTeam.seed}</p>
                              )}
                            </div>
                          </div>
                          {/* Admin controls: add/remove team to phase */}
                          {isAdmin && selectedPhase && (
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                onClick={() => handleAdminAddTeamToPhase(participatingTeam, selectedPhase)}
                              >
                                Add to {selectedPhase}
                              </button>
                              <button
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                onClick={() => handleAdminRemoveTeamFromPhase(participatingTeam, selectedPhase)}
                              >
                                Remove from {selectedPhase}
                              </button>
                            </div>
                          )}
                          {/* Organizer invite button for phase */}
                          {!isAdmin && selectedPhase && inviteStatus === 'none' && now < inviteExpiry && (
                            <button
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                              onClick={() => handleSendInvite(team, selectedPhase)}
                            >
                              Invite to {selectedPhase}
                            </button>
                          )}
                          {/* Show invite status for phase */}
                          {!isAdmin && selectedPhase && inviteStatus === 'pending' && now < inviteExpiry && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Invite Pending</span>
                          )}
                          {!isAdmin && selectedPhase && inviteStatus === 'expired' && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">Invite Expired</span>
                          )}
                          {!isAdmin && selectedPhase && inviteStatus === 'accepted' && (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Accepted</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-zinc-400">No teams participating yet.</p>
                  <p className="text-zinc-500 text-sm mt-1">Teams will appear here once they register for the tournament.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'points' && (
            <PointsTable
              tournament={tournament}
              onUpdate={(updatedTournament) => {
                setEditedTournament(updatedTournament);
                if (isAdmin) onSave(updatedTournament);
              }}
            />
          )}

          {activeTab === 'groups' && (
            <TeamGrouping
              tournament={tournament}
              onUpdate={(updatedTournament) => {
                setEditedTournament(updatedTournament);
                if (isAdmin) onSave(updatedTournament);
              }}
            />
          )}

          {activeTab === 'seeding' && (
            <Seeding
              tournament={tournament}
              onUpdate={(updatedTournament) => {
                setEditedTournament(updatedTournament);
                if (isAdmin) onSave(updatedTournament);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentWindow;