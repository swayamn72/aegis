import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import AdminLayout from '../components/AdminLayout';
import {
  Trophy, Users, Calendar, DollarSign, Settings, Target,
  BarChart3, Grid3x3, ArrowLeft, Save, Edit, Eye, Award, Star, Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import TournamentForm from '../components/TournamentForm';
import PhaseManager from '../components/PhaseManager';
import MatchManagement from '../components/MatchManagement';
import MatchScheduler from '../components/MatchScheduler';
import PointsTable from '../components/PointsTable';
import TeamGrouping from '../components/TeamGrouping';
import TeamSelector from '../components/TeamSelector';
import PrizeDistributionForm from '../components/PrizeDistributionForm';

const TournamentManagementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAdmin();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingOverview, setEditingOverview] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [isPrizeFormOpen, setIsPrizeFormOpen] = useState(false);
  const [isPhaseManagerOpen, setIsPhaseManagerOpen] = useState(false);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'edit', name: 'Edit Details', icon: Edit },
    { id: 'phases', name: 'Phases', icon: Target },
    { id: 'matches', name: 'Matches', icon: Calendar },
    { id: 'schedule', name: 'Schedule Matches', icon: Clock },
    { id: 'teams', name: 'Teams', icon: Users },
    { id: 'prizepool', name: 'Prize Pool', icon: DollarSign },
    { id: 'groups', name: 'Groups', icon: Grid3x3 },
    { id: 'points', name: 'Points Table', icon: Trophy }
  ];

  useEffect(() => {
    if (id && token) {
      fetchTournament();
    }
  }, [id, token]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/tournaments/${id}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTournament(data.tournamentData || data);
      } else {
        toast.error('Failed to fetch tournament');
        navigate('/admin/tournaments');
      }
    } catch (error) {
      console.error('Error fetching tournament:', error);
      toast.error('Error loading tournament');
      navigate('/admin/tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tournaments/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const updatedData = await response.json();
        setTournament(updatedData.tournament || updatedData);
        toast.success('Tournament updated successfully');
        fetchTournament(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update tournament');
      }
    } catch (error) {
      console.error('Error updating tournament:', error);
      toast.error('Error updating tournament');
    }
  };

  const handleAdminAddTeamToPhase = async (team, phase) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tournaments/${id}/phases/${phase}/teams`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({ teamId: team._id })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTournament(data);
        toast.success(`Team added to ${phase}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add team');
      }
    } catch (error) {
      console.error('Error adding team:', error);
      toast.error('Failed to add team');
    }
  };

  const handleAdminRemoveTeamFromPhase = async (team, phase) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/tournaments/${id}/phases/${phase}/teams/${team._id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTournament(data);
        toast.success(`Team removed from ${phase}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to remove team');
      }
    } catch (error) {
      console.error('Error removing team:', error);
      toast.error('Failed to remove team');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!tournament) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">Tournament not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/tournaments')}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="flex items-center gap-4">
              {tournament.media?.logo ? (
                <img
                  src={tournament.media.logo}
                  alt="Logo"
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {tournament.tournamentName}
                </h1>
                <p className="text-zinc-400">
                  {tournament.gameTitle} • {tournament.region}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.open(`/tournament/${id}`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Public Page
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex overflow-x-auto border-b border-zinc-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-orange-400 border-b-2 border-orange-400 bg-zinc-800/50'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Teams</p>
                        <p className="text-white text-xl font-bold">
                          {tournament.participatingTeams?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Phases</p>
                        <p className="text-white text-xl font-bold">
                          {tournament.phases?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Matches</p>
                        <p className="text-white text-xl font-bold">
                          {tournament.phases?.reduce(
                            (acc, phase) => acc + (phase.matches?.length || 0),
                            0
                          ) || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Prize Pool</p>
                        <p className="text-white text-xl font-bold">
                          ₹{tournament.prizePool?.total?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tournament Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Tournament Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Game</span>
                        <span className="text-white font-medium">
                          {tournament.gameTitle}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Region</span>
                        <span className="text-white font-medium">
                          {tournament.region}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Tier</span>
                        <span className="text-white font-medium">
                          {tournament.tier}-Tier
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Status</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            tournament.status === 'upcoming'
                              ? 'bg-blue-500/20 text-blue-400'
                              : tournament.status === 'in_progress'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {tournament.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Visibility</span>
                        <span className="text-white font-medium capitalize">
                          {tournament.visibility || 'Public'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Schedule</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-zinc-400 text-sm">Start Date</p>
                        <p className="text-white font-medium">
                          {new Date(tournament.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">End Date</p>
                        <p className="text-white font-medium">
                          {new Date(tournament.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Duration</p>
                        <p className="text-white font-medium">
                          {Math.ceil(
                            (new Date(tournament.endDate) -
                              new Date(tournament.startDate)) /
                              (1000 * 60 * 60 * 24)
                          )}{' '}
                          days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Phases */}
                {tournament.phases?.length > 0 && (
                  <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Current Phases
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {tournament.phases.slice(0, 3).map((phase, index) => (
                        <div key={index} className="bg-zinc-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">{phase.name}</h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                phase.status === 'upcoming'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : phase.status === 'in_progress'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {phase.status}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-sm">{phase.type}</p>
                          <p className="text-zinc-500 text-xs mt-2">
                            {phase.matches?.length || 0} matches
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'edit' && (
              <div className="space-y-6">
                <TournamentForm
                  tournament={tournament}
                  onSubmit={handleSave}
                  isEditing={true}
                />
              </div>
            )}

            {activeTab === 'phases' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Tournament Phases</h3>
                  <button
                    onClick={() => setIsPhaseManagerOpen(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Phases
                  </button>
                </div>

                {tournament.phases?.length > 0 ? (
                  <div className="space-y-4">
                    {tournament.phases.map((phase, index) => (
                      <div
                        key={index}
                        className="bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="text-white text-lg font-semibold">
                                  {phase.name}
                                </h4>
                                <p className="text-zinc-400 text-sm">
                                  {phase.type} • {phase.format || 'Format not specified'}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                phase.status === 'upcoming'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : phase.status === 'in_progress'
                                  ? 'bg-green-500/20 text-green-400'
                                  : phase.status === 'completed'
                                  ? 'bg-gray-500/20 text-gray-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {phase.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-zinc-400 text-sm">Duration</p>
                              <p className="text-white">
                                {phase.startDate
                                  ? new Date(phase.startDate).toLocaleDateString()
                                  : 'TBD'}{' '}
                                -{' '}
                                {phase.endDate
                                  ? new Date(phase.endDate).toLocaleDateString()
                                  : 'TBD'}
                              </p>
                            </div>
                            <div>
                              <p className="text-zinc-400 text-sm">Teams</p>
                              <p className="text-white">{phase.teams?.length || 0} teams</p>
                            </div>
                            <div>
                              <p className="text-zinc-400 text-sm">Matches</p>
                              <p className="text-white">
                                {phase.matches?.length || 0} matches
                              </p>
                            </div>
                          </div>

                          {phase.description && (
                            <div className="bg-zinc-700/30 rounded-lg p-3">
                              <p className="text-zinc-300 text-sm">{phase.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      No Phases Configured
                    </h3>
                    <p className="text-zinc-400 mb-6">
                      Create phases to organize your tournament structure
                    </p>
                    <button
                      onClick={() => setIsPhaseManagerOpen(true)}
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Create First Phase
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'matches' && (
              <MatchManagement
                tournament={tournament}
                onUpdate={(updatedTournament) => {
                  setTournament(updatedTournament);
                  fetchTournament();
                }}
              />
            )}

            {activeTab === 'schedule' && (
              <MatchScheduler
                tournament={tournament}
                onUpdate={(updatedTournament) => {
                  setTournament(updatedTournament);
                  fetchTournament();
                }}
              />
            )}

            {activeTab === 'teams' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Teams</h3>
                  {tournament.phases?.length > 0 && (
                    <select
                      value={selectedPhase}
                      onChange={(e) => setSelectedPhase(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">All Phases</option>
                      {tournament.phases.map((phase, idx) => (
                        <option key={idx} value={phase.name}>
                          {phase.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedPhase && (
                  <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
                    <h4 className="text-white font-semibold mb-4">
                      Add Teams to {selectedPhase}
                    </h4>
                    <TeamSelector
                      selectedPhase={selectedPhase}
                      tournament={tournament}
                      onSelect={(team) =>
                        handleAdminAddTeamToPhase(team, selectedPhase)
                      }
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(() => {
                    const filteredTeams = selectedPhase
                      ? (tournament.participatingTeams || []).filter(
                          (pt) => pt.currentStage === selectedPhase
                        )
                      : tournament.participatingTeams || [];

                    if (filteredTeams.length > 0) {
                      return filteredTeams.map((participatingTeam, index) => {
                        const team = participatingTeam.team || participatingTeam;
                        const teamName =
                          team.teamName || team.name || 'Unknown Team';
                        const teamLogo = team.logo || participatingTeam.logo;

                        return (
                          <div
                            key={team._id || index}
                            className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-colors"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              {teamLogo ? (
                                <img
                                  src={teamLogo}
                                  alt={teamName}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center">
                                  <Users className="w-6 h-6 text-zinc-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="text-white font-medium">{teamName}</h4>
                                {participatingTeam.currentStage && (
                                  <p className="text-zinc-400 text-xs">
                                    {participatingTeam.currentStage}
                                  </p>
                                )}
                              </div>
                            </div>
                            {selectedPhase && (
                              <button
                                onClick={() =>
                                  handleAdminRemoveTeamFromPhase(team, selectedPhase)
                                }
                                className="w-full px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                              >
                                Remove from Phase
                              </button>
                            )}
                          </div>
                        );
                      });
                    } else {
                      return (
                        <div className="col-span-full text-center py-16">
                          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-zinc-400" />
                          </div>
                          <p className="text-zinc-400">
                            {selectedPhase
                              ? `No teams in ${selectedPhase} yet`
                              : 'No teams participating yet'}
                          </p>
                          <p className="text-zinc-500 text-sm mt-1">
                            {selectedPhase
                              ? `Add teams to ${selectedPhase} using the controls above`
                              : 'Select a phase to add teams'}
                          </p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'prizepool' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">
                    Prize Pool Management
                  </h3>
                  <button
                    onClick={() => setIsPrizeFormOpen(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Advanced Distribution
                  </button>
                </div>

                {/* Prize Pool Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Total Prize Pool</p>
                        <p className="text-2xl font-bold text-white">
                          ₹{tournament.prizePool?.total?.toLocaleString() || '0'}
                        </p>
                        <p className="text-zinc-500 text-xs">
                          {tournament.prizePool?.currency || 'INR'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Prize Positions</p>
                        <p className="text-2xl font-bold text-white">
                          {tournament.prizePool?.distribution?.length || 0}
                        </p>
                        <p className="text-zinc-500 text-xs">Distributed positions</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm">Individual Awards</p>
                        <p className="text-2xl font-bold text-white">
                          {tournament.prizePool?.individualAwards?.length || 0}
                        </p>
                        <p className="text-zinc-500 text-xs">Special awards</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prize Distribution */}
                {tournament.prizePool?.distribution && tournament.prizePool.distribution.length > 0 && (
                  <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden">
                    <div className="p-6 border-b border-zinc-700">
                      <h4 className="text-lg font-semibold text-white">Prize Distribution</h4>
                      <p className="text-zinc-400 text-sm">Distribution of prize pool across positions</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-zinc-700/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                              Position
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                              Percentage
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-700">
                          {tournament.prizePool.distribution.map((prize, index) => {
                            const percentage = tournament.prizePool.total
                              ? ((prize.amount / tournament.prizePool.total) * 100).toFixed(1)
                              : 0;
                            return (
                              <tr key={index} className="hover:bg-zinc-700/30">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                                      <span className="text-orange-400 font-bold text-sm">
                                        {prize.position}
                                      </span>
                                    </div>
                                    <span className="text-white font-medium">
                                      {prize.position === 1 ? '1st Place' :
                                       prize.position === 2 ? '2nd Place' :
                                       prize.position === 3 ? '3rd Place' :
                                       `${prize.position}th Place`}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                  ₹{prize.amount?.toLocaleString() || '0'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-zinc-700 rounded-full h-2">
                                      <div
                                        className="bg-orange-500 h-2 rounded-full"
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-zinc-400 text-sm">{percentage}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Individual Awards */}
                {tournament.prizePool?.individualAwards && tournament.prizePool.individualAwards.length > 0 && (
                  <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden">
                    <div className="p-6 border-b border-zinc-700">
                      <h4 className="text-lg font-semibold text-white">Individual Awards</h4>
                      <p className="text-zinc-400 text-sm">Special awards and bonuses</p>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tournament.prizePool.individualAwards.map((award, index) => (
                          <div key={index} className="bg-zinc-700/50 rounded-lg p-4 border border-zinc-600">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <Star className="w-5 h-5 text-green-400" />
                              </div>
                              <div>
                                <h5 className="text-white font-medium">{award.title}</h5>
                                <p className="text-zinc-400 text-sm">{award.recipient}</p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-400 text-sm">Amount</span>
                              <span className="text-green-400 font-medium">
                                ₹{award.amount?.toLocaleString() || '0'}
                              </span>
                            </div>
                            {award.description && (
                              <p className="text-zinc-500 text-xs mt-2">{award.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {(!tournament.prizePool?.distribution || tournament.prizePool.distribution.length === 0) &&
                 (!tournament.prizePool?.individualAwards || tournament.prizePool.individualAwards.length === 0) && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Prize Distribution Set</h3>
                    <p className="text-zinc-400 mb-6">
                      Configure prize distribution to show how the prize pool will be allocated
                    </p>
                    <button
                      onClick={() => setIsPrizeFormOpen(true)}
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Set Up Prize Distribution
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'groups' && (
              <TeamGrouping
                tournament={tournament}
                onUpdate={(updatedTournament) => {
                  setTournament(updatedTournament);
                  fetchTournament();
                }}
              />
            )}

            {activeTab === 'points' && (
              <PointsTable
                tournament={tournament}
                onUpdate={(updatedTournament) => {
                  setTournament(updatedTournament);
                  fetchTournament();
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isPrizeFormOpen && (
        <PrizeDistributionForm
          isOpen={isPrizeFormOpen}
          onClose={() => setIsPrizeFormOpen(false)}
          onSave={async (distribution, individualAwards) => {
            const updatedPrizePool = {
              ...tournament.prizePool,
              distribution,
              individualAwards
            };

            const response = await fetch(
              `http://localhost:5000/api/tournaments/${id}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({ prizePool: updatedPrizePool })
              }
            );

            if (response.ok) {
              toast.success('Prize distribution updated successfully');
              fetchTournament();
              setIsPrizeFormOpen(false);
            } else {
              toast.error('Failed to update prize distribution');
            }
          }}
          initialDistribution={tournament.prizePool?.distribution || []}
          initialIndividualAwards={tournament.prizePool?.individualAwards || []}
          totalPrizePool={tournament.prizePool?.total || 0}
        />
      )}

      {isPhaseManagerOpen && (
        <PhaseManager
          isOpen={isPhaseManagerOpen}
          onClose={() => setIsPhaseManagerOpen(false)}
          onSave={async (phases) => {
            const formData = new FormData();
            formData.append('phases', JSON.stringify(phases));

            const response = await fetch(
              `http://localhost:5000/api/tournaments/${id}`,
              {
                method: 'PUT',
                headers: {
                  Authorization: `Bearer ${token}`
                },
                credentials: 'include',
                body: formData
              }
            );

            if (response.ok) {
              toast.success('Phases updated successfully');
              fetchTournament();
              setIsPhaseManagerOpen(false);
            } else {
              toast.error('Failed to update phases');
            }
          }}
          initialPhases={tournament.phases || []}
        />
      )}
    </AdminLayout>
  );
};

export default TournamentManagementPage;