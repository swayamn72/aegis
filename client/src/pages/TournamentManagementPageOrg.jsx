import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Trophy, Users, Calendar, ArrowLeft, Eye, Settings, 
  Target, Play, CheckCircle, Clock, Award, BarChart3, Grid3x3, Edit
} from 'lucide-react';
import { toast } from 'react-toastify';
import PhaseManager from '../components/PhaseManager';
import MatchScheduler from '../components/MatchScheduler';
import PointsTable from '../components/PointsTable';
import TeamGrouping from '../components/TeamGrouping';
import MatchManagement from '../components/MatchManagement';
import TeamSelector from '../components/TeamSelector';
import PrizeDistributionForm from '../components/PrizeDistributionForm';
import TournamentForm from '../components/TournamentForm';

const TournamentManagementPageOrg = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [isPhaseManagerOpen, setIsPhaseManagerOpen] = useState(false);
  const [isPrizeFormOpen, setIsPrizeFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('');

  useEffect(() => {
    if (id && user && userType === 'organization') {
      fetchTournament();
    }
  }, [id, user, userType]);

  const fetchTournament = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/org-tournaments/${id}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTournament(data.tournament);
      } else {
        toast.error('Failed to fetch tournament');
        navigate('/org/dashboard');
      }
    } catch (error) {
      console.error('Error fetching tournament:', error);
      toast.error('Error loading tournament');
      navigate('/org/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/org-tournaments/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        toast.success('Tournament updated successfully');
        fetchTournament();
        setIsEditFormOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update tournament');
      }
    } catch (error) {
      console.error('Error updating tournament:', error);
      toast.error('Error updating tournament');
    }
  };

  const handleOrgAddTeamToPhase = async (team, phase) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/org-tournaments/${id}/phases/${phase}/teams`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ teamId: team._id })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTournament(data.tournament);
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

  const handleOrgRemoveTeamFromPhase = async (team, phase) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/org-tournaments/${id}/phases/${phase}/teams/${team._id}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTournament(data.tournament);
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

  const getCurrentPhase = () => {
    return tournament?.phases?.find(p => p.status === 'in_progress') || 
           tournament?.phases?.find(p => p.status === 'upcoming') ||
           tournament?.phases?.[0];
  };

  const getPhaseProgress = (phase) => {
    if (!phase) return 0;
    const total = phase.matches?.length || 0;
    const completed = phase.matches?.filter(m => m.status === 'completed').length || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Tournament not found</p>
        </div>
      </div>
    );
  }

  const currentPhase = getCurrentPhase();
  const navigation = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'phases', name: 'Phases', icon: Target },
    { id: 'schedule', name: 'Schedule', icon: Clock },
    { id: 'matches', name: 'Matches', icon: Calendar },
    { id: 'teams', name: 'Teams', icon: Users },
    { id: 'groups', name: 'Groups', icon: Grid3x3 },
    { id: 'standings', name: 'Standings', icon: Trophy },
    { id: 'prizes', name: 'Prizes', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/org/dashboard')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="flex items-center gap-3">
                {tournament.media?.logo ? (
                  <img
                    src={tournament.media.logo}
                    alt="Logo"
                    className="w-10 h-10 rounded-lg object-cover ring-2 ring-gray-700"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center ring-2 ring-gray-700">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-bold text-white">{tournament.tournamentName}</h1>
                  <p className="text-sm text-gray-400">{tournament.gameTitle} • {tournament.region}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all text-sm"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={() => window.open(`/tournament/${id}`, '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all text-sm"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">View Public</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:border-orange-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 text-orange-400" />
              <span className="text-2xl font-bold text-white">
                {tournament.participatingTeams?.length || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Teams</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {tournament.phases?.length || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Phases</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {tournament.phases?.reduce((acc, p) => acc + (p.matches?.length || 0), 0) || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Matches</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:border-yellow-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-white">
                ₹{((tournament.prizePool?.total || 0) / 1000).toFixed(0)}K
              </span>
            </div>
            <p className="text-gray-400 text-sm">Prize Pool</p>
          </div>
        </div>

        {/* Current Phase Card */}
        {currentPhase && (
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <Play className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{currentPhase.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {currentPhase.teams?.length || 0} teams • {currentPhase.matches?.length || 0} matches
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentPhase.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                currentPhase.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {currentPhase.status.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${getPhaseProgress(currentPhase)}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-400 min-w-[3rem] text-right">
                {getPhaseProgress(currentPhase)}%
              </span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl mb-6 overflow-x-auto">
          <div className="flex">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                    activeSection === item.id
                      ? 'text-orange-400 border-orange-400 bg-orange-500/5'
                      : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
          {activeSection === 'overview' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Tournament Overview</h2>
              
              {/* Timeline */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Tournament Timeline</h3>
                <div className="space-y-3">
                  {tournament.phases?.map((phase, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        phase.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        phase.status === 'in_progress' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {phase.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : index + 1}
                      </div>
                      <div className="flex-1 bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <h4 className="text-white font-medium">{phase.name}</h4>
                            <p className="text-sm text-gray-400">
                              {phase.startDate ? new Date(phase.startDate).toLocaleDateString() : 'TBD'}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            phase.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            phase.status === 'in_progress' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-600/20 text-gray-400'
                          }`}>
                            {phase.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveSection('phases')}
                  className="p-5 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl text-left hover:border-orange-500 transition-all group"
                >
                  <Settings className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-white font-semibold mb-1">Manage Phases</h4>
                  <p className="text-sm text-gray-400">Setup tournament structure and advancement rules</p>
                </button>

                <button
                  onClick={() => setActiveSection('schedule')}
                  className="p-5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl text-left hover:border-blue-500 transition-all group"
                >
                  <Clock className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-white font-semibold mb-1">Schedule Matches</h4>
                  <p className="text-sm text-gray-400">Create and manage match schedules</p>
                </button>
              </div>
            </div>
          )}

          {activeSection === 'phases' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Tournament Phases</h2>
                <button
                  onClick={() => setIsPhaseManagerOpen(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Manage Phases
                </button>
              </div>

              {tournament.phases?.length > 0 ? (
                <div className="space-y-4">
                  {tournament.phases.map((phase, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white text-lg font-semibold">{phase.name}</h3>
                            <p className="text-gray-400 text-sm">{phase.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          phase.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                          phase.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {phase.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Teams</p>
                          <p className="text-white font-medium">{phase.teams?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Matches</p>
                          <p className="text-white font-medium">{phase.matches?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Duration</p>
                          <p className="text-white font-medium text-sm">
                            {phase.startDate ? new Date(phase.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Phases Configured</h3>
                  <p className="text-gray-400 mb-6">Create phases to organize your tournament</p>
                  <button
                    onClick={() => setIsPhaseManagerOpen(true)}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
                  >
                    Create First Phase
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === 'schedule' && (
            <MatchScheduler tournament={tournament} onUpdate={fetchTournament} />
          )}

          {activeSection === 'matches' && (
            <MatchManagement tournament={tournament} onUpdate={fetchTournament} />
          )}

          {activeSection === 'teams' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Teams Management</h2>
                {tournament.phases?.length > 0 && (
                  <select
                    value={selectedPhase}
                    onChange={(e) => setSelectedPhase(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Phases</option>
                    {tournament.phases.map((phase, idx) => (
                      <option key={idx} value={phase.name}>{phase.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {selectedPhase && (
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 mb-6">
                  <h3 className="text-white font-semibold mb-4">Add Teams to {selectedPhase}</h3>
                  <TeamSelector
                    selectedPhase={selectedPhase}
                    tournament={tournament}
                    onSelect={(team) => handleOrgAddTeamToPhase(team, selectedPhase)}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const filteredTeams = selectedPhase
                    ? (tournament.participatingTeams || []).filter(pt => pt.currentStage === selectedPhase)
                    : tournament.participatingTeams || [];

                  if (filteredTeams.length > 0) {
                    return filteredTeams.map((participatingTeam, index) => {
                      const team = participatingTeam.team || participatingTeam;
                      const teamName = team.teamName || team.name || 'Unknown Team';
                      const teamLogo = team.logo || participatingTeam.logo;

                      return (
                        <div
                          key={team._id || index}
                          className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-orange-500/50 transition-all"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            {teamLogo ? (
                              <img src={teamLogo} alt={teamName} className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-medium truncate">{teamName}</h4>
                              {participatingTeam.currentStage && (
                                <p className="text-gray-400 text-xs truncate">{participatingTeam.currentStage}</p>
                              )}
                            </div>
                          </div>
                          {selectedPhase && (
                            <button
                              onClick={() => handleOrgRemoveTeamFromPhase(team, selectedPhase)}
                              className="w-full px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      );
                    });
                  } else {
                    return (
                      <div className="col-span-full text-center py-16">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">
                          {selectedPhase ? `No teams in ${selectedPhase} yet` : 'No teams participating yet'}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          {selectedPhase ? 'Add teams using the selector above' : 'Select a phase to add teams'}
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {activeSection === 'groups' && (
            <TeamGrouping tournament={tournament} onUpdate={fetchTournament} />
          )}

          {activeSection === 'standings' && (
            <PointsTable tournament={tournament} onUpdate={fetchTournament} />
          )}

          {activeSection === 'prizes' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Prize Pool</h2>
                <button
                  onClick={() => setIsPrizeFormOpen(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Configure
                </button>
              </div>

              {tournament.prizePool?.distribution && tournament.prizePool.distribution.length > 0 ? (
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Position</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">%</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {tournament.prizePool.distribution.map((prize, index) => {
                          const percentage = tournament.prizePool.total
                            ? ((prize.amount / tournament.prizePool.total) * 100).toFixed(1)
                            : 0;
                          return (
                            <tr key={index} className="hover:bg-gray-700/30">
                              <td className="px-6 py-4">
                                <span className="text-white font-medium">
                                  {prize.position === 1 ? '🥇 1st' :
                                    prize.position === 2 ? '🥈 2nd' :
                                    prize.position === 3 ? '🥉 3rd' :
                                    `${prize.position}th`}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-white font-medium">
                                ₹{prize.amount?.toLocaleString() || '0'}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[100px]">
                                    <div
                                      className="bg-orange-500 h-2 rounded-full"
                                      style={{ width: `${Math.min(percentage, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-gray-400 text-sm">{percentage}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Prize Distribution Set</h3>
                  <p className="text-gray-400 mb-6">Configure prize distribution for your tournament</p>
                  <button
                    onClick={() => setIsPrizeFormOpen(true)}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
                  >
                    Set Up Prizes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isPhaseManagerOpen && (
        <PhaseManager
          isOpen={isPhaseManagerOpen}
          onClose={() => setIsPhaseManagerOpen(false)}
          onSave={async (phases) => {
            const formData = new FormData();
            formData.append('tournamentData', JSON.stringify({ phases }));

            const response = await fetch(
              `http://localhost:5000/api/org-tournaments/${id}`,
              {
                method: 'PUT',
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
              `http://localhost:5000/api/org-tournaments/${id}`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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

      {isEditFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Tournament</h2>
              <button
                onClick={() => setIsEditFormOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <TournamentForm
                tournament={tournament}
                onSubmit={handleSave}
                isEditing={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentManagementPageOrg;