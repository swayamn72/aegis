import React, { useState, useEffect } from 'react';
import { X, Edit, Save, Users, Trophy, Calendar, Settings, Target, BarChart3, Check, X as XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import TournamentForm from './TournamentForm';
import PhaseManager from './PhaseManager';
import MatchManagement from './MatchManagement';
import PointsTable from './PointsTable';
import TeamGrouping from './TeamGrouping';

import TeamSelector from './TeamSelector';

const TournamentWindow = ({ tournament, isOpen, onClose, onSave, isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTournament, setEditedTournament] = useState(tournament);
  const [isPhaseManagerOpen, setIsPhaseManagerOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [overviewData, setOverviewData] = useState({
    tournamentName: tournament.tournamentName || '',
    shortName: tournament.shortName || '',
    logo: tournament.media?.logo || '',
    coverImage: tournament.media?.coverImage || '',
    visibility: tournament.visibility || 'public'
  });
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

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
    { id: 'groups', name: 'Groups', icon: Users }
  ];

  const handleSave = async (formData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament._id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });

      if (res.ok) {
        const updatedTournament = await res.json();
        setEditedTournament(updatedTournament.tournament || updatedTournament);
        onSave(updatedTournament.tournament || updatedTournament);
        setIsEditing(false);
        toast.success('Tournament updated successfully');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to update tournament');
      }
    } catch (err) {
      console.error('Error updating tournament:', err);
      toast.error('Failed to update tournament');
    }
  };

  const handleSaveOverview = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('tournamentName', overviewData.tournamentName);
      formDataToSend.append('shortName', overviewData.shortName);
      formDataToSend.append('visibility', overviewData.visibility);
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      if (coverFile) {
        formDataToSend.append('coverImage', coverFile);
      }

      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament._id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formDataToSend
      });

      if (res.ok) {
        const updatedTournament = await res.json();
        setEditedTournament(updatedTournament);
        onSave(updatedTournament);
        setIsEditingOverview(false);
        setLogoFile(null);
        setCoverFile(null);
        toast.success('Overview details updated successfully');
      } else {
        toast.error('Failed to update overview details');
      }
    } catch (err) {
      console.error('Error updating overview:', err);
      toast.error('Failed to update overview details');
    }
  };

  const handleCancelOverview = () => {
    setOverviewData({
      tournamentName: tournament.tournamentName || '',
      shortName: tournament.shortName || '',
      logo: tournament.media?.logo || '',
      coverImage: tournament.media?.coverImage || '',
      visibility: tournament.visibility || 'public'
    });
    setIsEditingOverview(false);
    setLogoFile(null);
    setCoverFile(null);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Add handlers for admin and organizer actions
  const handleAdminAddTeamToPhase = async (team, phase) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament._id}/phases/${phase}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ teamId: team._id })
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Received non-JSON response:', text);
        throw new Error('Invalid response format from server');
      }

      if (res.ok) {
        toast.success(`Team added to ${phase}`);
        setEditedTournament(data);
        onSave(data);
      } else {
        toast.error(data.message || 'Failed to add team');
      }
    } catch (err) {
      console.error('Error adding team:', err);
      toast.error(err.message || 'Failed to add team');
    }
  };

  const handleAdminRemoveTeamFromPhase = async (team, phase) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament._id}/phases/${phase}/teams/${team._id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Received non-JSON response:', text);
        throw new Error('Invalid response format from server');
      }

      if (res.ok) {
        toast.success(`Team removed from ${phase}`);
        setEditedTournament(data);
        onSave(data);
      } else {
        toast.error(data.message || 'Failed to remove team');
      }
    } catch (err) {
      console.error('Error removing team:', err);
      toast.error(err.message || 'Failed to remove team');
    }
  };

  const handleSendInvite = async (team, phase) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament._id}/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          teamId: team._id,
          phase: phase
        })
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Received non-JSON response:', text);
        throw new Error('Invalid response format from server');
      }

      if (res.ok) {
        toast.success(`Invite sent to ${team.teamName || 'team'} for ${phase}`);
        if (data.tournament) {
          setEditedTournament(data.tournament);
          onSave(data.tournament);
        }
      } else {
        toast.error(data.message || 'Failed to send invite');
      }
    } catch (err) {
      console.error('Error sending invite:', err);
      toast.error(err.message || 'Failed to send invite');
    }
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
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
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

              {/* Tournament Details Section */}
              <div className="bg-zinc-800/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Tournament Details</h3>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditingOverview(!isEditingOverview)}
                      className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {isEditingOverview ? 'Cancel' : 'Edit Details'}
                    </button>
                  )}
                </div>

                {isEditingOverview ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Tournament Name</label>
                        <input
                          type="text"
                          value={overviewData.tournamentName}
                          onChange={(e) => setOverviewData(prev => ({ ...prev, tournamentName: e.target.value }))}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Short Name/Tag</label>
                        <input
                          type="text"
                          value={overviewData.shortName}
                          onChange={(e) => setOverviewData(prev => ({ ...prev, shortName: e.target.value }))}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Logo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setLogoFile(e.target.files[0])}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white text-sm"
                        />
                        {overviewData.logo && !logoFile && (
                          <img src={overviewData.logo} alt="Current Logo" className="w-16 h-16 object-cover rounded mt-2" />
                        )}
                        {logoFile && (
                          <img src={URL.createObjectURL(logoFile)} alt="New Logo" className="w-16 h-16 object-cover rounded mt-2" />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Banner/Cover</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCoverFile(e.target.files[0])}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white text-sm"
                        />
                        {overviewData.coverImage && !coverFile && (
                          <img src={overviewData.coverImage} alt="Current Banner" className="w-24 h-12 object-cover rounded mt-2" />
                        )}
                        {coverFile && (
                          <img src={URL.createObjectURL(coverFile)} alt="New Banner" className="w-24 h-12 object-cover rounded mt-2" />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Visibility</label>
                        <select
                          value={overviewData.visibility}
                          onChange={(e) => setOverviewData(prev => ({ ...prev, visibility: e.target.value }))}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={handleSaveOverview}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelOverview}
                        className="px-4 py-2 bg-zinc-600 text-white rounded hover:bg-zinc-700 flex items-center gap-2"
                      >
                        <XIcon className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-zinc-400 text-sm">Name</p>
                      <p className="text-white">{tournament.tournamentName}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm">Tag</p>
                      <p className="text-white">{tournament.shortName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm">Visibility</p>
                      <p className="text-white capitalize">{tournament.visibility || 'public'}</p>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <p className="text-zinc-400 text-sm mb-2">Media</p>
                      <div className="flex gap-4">
                        {tournament.media?.logo && (
                          <div>
                            <p className="text-zinc-400 text-xs mb-1">Logo</p>
                            <img src={tournament.media.logo} alt="Logo" className="w-16 h-16 object-cover rounded" />
                          </div>
                        )}
                        {tournament.media?.coverImage && (
                          <div>
                            <p className="text-zinc-400 text-xs mb-1">Banner</p>
                            <img src={tournament.media.coverImage} alt="Banner" className="w-24 h-12 object-cover rounded" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'edit' && isAdmin && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Edit Tournament</h3>
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${phase.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Participating Teams</h3>

                {/* Phase selection for invite/admin controls */}
                {tournament.phases?.length > 0 && (
                  <div className="flex gap-2 items-center">
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
              </div>

              {/* Team Selector for both admins and organizers */}
              {selectedPhase && (
                <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-4 mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    {isAdmin ? `Add Teams to ${selectedPhase}` : `Invite Teams to ${selectedPhase}`}
                  </h4>
                  <TeamSelector
                    selectedPhase={selectedPhase}
                    tournament={tournament}
                    onSelect={(team) => isAdmin ? handleAdminAddTeamToPhase(team, selectedPhase) : handleSendInvite(team, selectedPhase)}
                  />
                </div>
              )}

              {/* Participating Teams List */}
              <div className="space-y-4">
                {tournament.participatingTeams?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tournament.participatingTeams.map((participatingTeam, index) => {
                      const team = participatingTeam.team || participatingTeam;
                      const teamName = team.teamName || team.name || 'Unknown Team';
                      const teamLogo = team.logo || participatingTeam.logo;
                      const phaseInvite = participatingTeam.invites?.find(inv => inv.phase === selectedPhase) || {};
                      const inviteStatus = phaseInvite.status || 'none';

                      return (
                        <div key={team._id || index} className="bg-zinc-800/50 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            {teamLogo && (
                              <img
                                src={teamLogo}
                                alt={teamName}
                                className="w-10 h-10 rounded-lg object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{teamName}</h4>
                              {selectedPhase && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-0.5 rounded text-xs ${inviteStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                    inviteStatus === 'accepted' ? 'bg-green-500/20 text-green-400' :
                                      inviteStatus === 'declined' ? 'bg-red-500/20 text-red-400' :
                                        'bg-zinc-500/20 text-zinc-400'
                                    }`}>
                                    {inviteStatus === 'none' ? 'Not Invited' :
                                      inviteStatus.charAt(0).toUpperCase() + inviteStatus.slice(1)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Admin Controls */}
                            {isAdmin && selectedPhase && (
                              <div className="flex gap-2">
                                <button
                                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                  onClick={() => handleAdminAddTeamToPhase(team, selectedPhase)}
                                >
                                  Add to {selectedPhase}
                                </button>
                                <button
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                  onClick={() => handleAdminRemoveTeamFromPhase(team, selectedPhase)}
                                >
                                  Remove
                                </button>
                              </div>
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
                    <p className="text-zinc-500 text-sm mt-1">
                      {isAdmin ? "Add teams using the controls above" : "Invite teams using the selector above"}
                    </p>
                  </div>
                )}
              </div>
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


        </div>
      </div>
    </div>
  );
};

export default TournamentWindow;