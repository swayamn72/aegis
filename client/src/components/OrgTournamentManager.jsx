import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, Trophy, Calendar, Edit, Trash2, CheckCircle, XCircle, Send } from 'lucide-react';

const OrgTournamentManager = ({ tournament, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tournament) {
      fetchTournamentData();
    }
  }, [tournament]);

  const fetchTournamentData = async () => {
    try {
      // Fetch invitations
      const invResponse = await fetch(
        `http://localhost:5000/api/org-tournaments/${tournament._id}/invitations`,
        { credentials: 'include' }
      );
      if (invResponse.ok) {
        const data = await invResponse.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error fetching tournament data:', error);
    }
  };

  const searchTeams = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/org-tournaments/search-teams?query=${searchQuery}&game=${tournament.gameTitle}&region=${tournament.region}`,
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.teams || []);
      }
    } catch (error) {
      console.error('Error searching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const inviteTeam = async (teamId, phaseName) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/org-tournaments/${tournament._id}/invite-team`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId,
            phaseName: phaseName || tournament.phases[0]?.name || 'Main Event',
            message: `You're invited to participate in ${tournament.tournamentName}!`
          })
        }
      );

      if (response.ok) {
        alert('Team invited successfully!');
        fetchTournamentData();
        setSearchResults([]);
        setSearchQuery('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to invite team');
      }
    } catch (error) {
      console.error('Error inviting team:', error);
      alert('Failed to invite team');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', text: 'Pending' },
      accepted: { color: 'bg-green-500/20 text-green-400', text: 'Accepted' },
      declined: { color: 'bg-red-500/20 text-red-400', text: 'Declined' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">{tournament.tournamentName}</h2>
            <p className="text-gray-400 text-sm mt-1">
              {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 px-6">
          <nav className="flex gap-6">
            {['overview', 'teams', 'invitations', 'schedule'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-2 border-b-2 transition ${
                  activeTab === tab
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-orange-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Prize Pool</p>
                      <p className="text-xl font-bold">₹{tournament.prizePool?.total?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Teams</p>
                      <p className="text-xl font-bold">
                        {tournament.participatingTeams?.length || 0}/{tournament.slots?.total || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Send className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Invitations</p>
                      <p className="text-xl font-bold">
                        {invitations.filter(i => i.status === 'pending').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="text-gray-400 text-sm">Phases</p>
                      <p className="text-xl font-bold">{tournament.phases?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tournament Details */}
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Tournament Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Game</p>
                    <p className="font-semibold">{tournament.gameTitle}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Region</p>
                    <p className="font-semibold">{tournament.region}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Format</p>
                    <p className="font-semibold">{tournament.format}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <p className="font-semibold">{tournament.status}</p>
                  </div>
                </div>
                {tournament.description && (
                  <div className="mt-4">
                    <p className="text-gray-400 text-sm">Description</p>
                    <p className="text-gray-300 mt-1">{tournament.description}</p>
                  </div>
                )}
              </div>

              {/* Phases */}
              {tournament.phases && tournament.phases.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Phases</h3>
                  <div className="space-y-3">
                    {tournament.phases.map((phase, index) => (
                      <div key={index} className="bg-gray-800 rounded p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{phase.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">{phase.type}</p>
                            {phase.details && (
                              <p className="text-sm text-gray-300 mt-2">{phase.details}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            phase.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            phase.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-600 text-gray-300'
                          }`}>
                            {phase.status}
                          </span>
                        </div>
                        {phase.startDate && (
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="space-y-6">
              {/* Invite Team Section */}
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Invite Teams</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchTeams()}
                    placeholder="Search teams by name or tag..."
                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
                  />
                  <button
                    onClick={searchTeams}
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {searchResults.map((team) => (
                      <div key={team._id} className="bg-gray-800 rounded p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={team.logo || 'https://placehold.co/50x50/1a1a1a/ffffff?text=TEAM'}
                            alt={team.teamName}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <h4 className="font-semibold">{team.teamName}</h4>
                            <p className="text-sm text-gray-400">{team.teamTag} • {team.primaryGame}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => inviteTeam(team._id)}
                          className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <UserPlus className="w-4 h-4" />
                          Invite
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Registered Teams */}
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Registered Teams ({tournament.participatingTeams?.length || 0})
                </h3>
                {tournament.participatingTeams && tournament.participatingTeams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tournament.participatingTeams.map((pt, index) => (
                      <div key={index} className="bg-gray-800 rounded p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Team {index + 1}</h4>
                          <p className="text-sm text-gray-400">
                            {pt.qualifiedThrough} • {pt.currentStage}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No teams registered yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'invitations' && (
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Sent Invitations</h3>
                {invitations.length > 0 ? (
                  <div className="space-y-3">
                    {invitations.map((invitation) => (
                      <div key={invitation._id} className="bg-gray-800 rounded p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={invitation.team?.logo || 'https://placehold.co/50x50/1a1a1a/ffffff?text=TEAM'}
                            alt={invitation.team?.teamName}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <h4 className="font-semibold">{invitation.team?.teamName}</h4>
                            <p className="text-sm text-gray-400">
                              Phase: {invitation.phase} • Invited {new Date(invitation.invitedAt).toLocaleDateString()}
                            </p>
                            {invitation.message && (
                              <p className="text-xs text-gray-400 mt-1">{invitation.message}</p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(invitation.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No invitations sent yet</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    {invitations.filter(i => i.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-400">Pending</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {invitations.filter(i => i.status === 'accepted').length}
                  </p>
                  <p className="text-sm text-gray-400">Accepted</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-400">
                    {invitations.filter(i => i.status === 'declined').length}
                  </p>
                  <p className="text-sm text-gray-400">Declined</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Tournament Schedule</h3>
                <p className="text-gray-400 text-center py-8">
                  Schedule management coming soon. Matches will be created and managed here.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-600 transition flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Tournament
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrgTournamentManager;