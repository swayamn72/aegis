import React, { useState, useEffect } from 'react';
import { X, Edit, Save, Users, Trophy, Calendar, Settings, Target, BarChart3, Check, X as XIcon, DollarSign, Grid3x3, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import TournamentForm from './TournamentForm';
import PhaseManager from './PhaseManager';
import MatchManagement from './MatchManagement';
import PointsTable from './PointsTable';
import TeamGrouping from './TeamGrouping';
import TeamSelector from './TeamSelector';

const TournamentWindow = ({ tournament, isOpen, onClose, onSave, isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editedTournament, setEditedTournament] = useState(tournament);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [isEditingPrizePool, setIsEditingPrizePool] = useState(false);
  const [overviewData, setOverviewData] = useState({
    tournamentName: tournament.tournamentName || '',
    shortName: tournament.shortName || '',
    logo: tournament.media?.logo || '',
    coverImage: tournament.media?.coverImage || '',
    visibility: tournament.visibility || 'public'
  });
  const [prizePoolData, setPrizePoolData] = useState({
    total: tournament.prizePool?.total || 0,
    currency: tournament.prizePool?.currency || 'INR',
    distribution: tournament.prizePool?.distribution || []
  });
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    setEditedTournament(tournament);
    setOverviewData({
      tournamentName: tournament.tournamentName || '',
      shortName: tournament.shortName || '',
      logo: tournament.media?.logo || '',
      coverImage: tournament.media?.coverImage || '',
      visibility: tournament.visibility || 'public'
    });
    setPrizePoolData({
      total: tournament.prizePool?.total || 0,
      currency: tournament.prizePool?.currency || 'INR',
      distribution: tournament.prizePool?.distribution || []
    });
  }, [tournament]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'edit', name: 'Edit Details', icon: Edit },
    { id: 'phases', name: 'Phases', icon: Target },
    { id: 'matches', name: 'Matches', icon: Calendar },
    { id: 'teams', name: 'Teams', icon: Users },
    { id: 'prizepool', name: 'Prize Pool', icon: DollarSign },
    { id: 'groups', name: 'Groups', icon: Grid3x3 },
    { id: 'points', name: 'Points Table', icon: Trophy }
  ];

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

  const handleSavePrizePool = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournament._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ prizePool: prizePoolData })
      });

      if (res.ok) {
        const updatedTournament = await res.json();
        setEditedTournament(updatedTournament);
        onSave(updatedTournament);
        setIsEditingPrizePool(false);
        toast.success('Prize pool updated successfully');
      } else {
        toast.error('Failed to update prize pool');
      }
    } catch (err) {
      console.error('Error updating prize pool:', err);
      toast.error('Failed to update prize pool');
    }
  };

  const addPrizeDistribution = () => {
    setPrizePoolData(prev => ({
      ...prev,
      distribution: [...prev.distribution, { position: prev.distribution.length + 1, amount: 0 }]
    }));
  };

  const removePrizeDistribution = (index) => {
    setPrizePoolData(prev => ({
      ...prev,
      distribution: prev.distribution.filter((_, i) => i !== index)
    }));
  };

  const updatePrizeDistribution = (index, field, value) => {
    setPrizePoolData(prev => ({
      ...prev,
      distribution: prev.distribution.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

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

  if (!isOpen || !tournament) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-4">
            {tournament.media?.logo ? (
              <img src={tournament.media.logo} alt="Logo" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{tournament.tournamentName}</h2>
              <p className="text-zinc-400">{tournament.gameTitle} • {tournament.region}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Cover Image */}
              {tournament.media?.coverImage && (
                <div className="w-full h-48 rounded-lg overflow-hidden">
                  <img src={tournament.media.coverImage} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm">Teams</p>
                      <p className="text-white text-xl font-bold">{tournament.participatingTeams?.length || 0}</p>
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
                      <p className="text-white text-xl font-bold">{tournament.phases?.length || 0}</p>
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
                        {tournament.phases?.reduce((acc, phase) => acc + (phase.matches?.length || 0), 0) || 0}
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
                      <p className="text-white text-xl font-bold">₹{tournament.prizePool?.total?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tournament Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Tournament Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Game</span>
                      <span className="text-white font-medium">{tournament.gameTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Region</span>
                      <span className="text-white font-medium">{tournament.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Tier</span>
                      <span className="text-white font-medium">{tournament.tier}-Tier</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tournament.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                        tournament.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {tournament.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Visibility</span>
                      <span className="text-white font-medium capitalize">{tournament.visibility || 'Public'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Schedule</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-zinc-400 text-sm">Start Date</p>
                      <p className="text-white font-medium">{new Date(tournament.startDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm">End Date</p>
                      <p className="text-white font-medium">{new Date(tournament.endDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm">Duration</p>
                      <p className="text-white font-medium">
                        {Math.ceil((new Date(tournament.endDate) - new Date(tournament.startDate)) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Phases */}
              {tournament.phases?.length > 0 && (
                <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Current Phases</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tournament.phases.slice(0, 3).map((phase, index) => (
                      <div key={index} className="bg-zinc-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{phase.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            phase.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                            phase.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {phase.status}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm">{phase.type}</p>
                        <p className="text-zinc-500 text-xs mt-2">{phase.matches?.length || 0} matches</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EDIT DETAILS TAB */}
          {activeTab === 'edit' && isAdmin && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                  {!isEditingOverview && (
                    <button
                      onClick={() => setIsEditingOverview(true)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
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
                          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Short Name/Tag</label>
                        <input
                          type="text"
                          value={overviewData.shortName}
                          onChange={(e) => setOverviewData(prev => ({ ...prev, shortName: e.target.value }))}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white text-sm file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                        />
                        {(overviewData.logo || logoFile) && (
                          <img 
                            src={logoFile ? URL.createObjectURL(logoFile) : overviewData.logo} 
                            alt="Logo Preview" 
                            className="w-20 h-20 object-cover rounded-lg mt-2 border border-zinc-600" 
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Cover Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCoverFile(e.target.files[0])}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white text-sm file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                        />
                        {(overviewData.coverImage || coverFile) && (
                          <img 
                            src={coverFile ? URL.createObjectURL(coverFile) : overviewData.coverImage} 
                            alt="Cover Preview" 
                            className="w-32 h-16 object-cover rounded-lg mt-2 border border-zinc-600" 
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Visibility</label>
                        <select
                          value={overviewData.visibility}
                          onChange={(e) => setOverviewData(prev => ({ ...prev, visibility: e.target.value }))}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSaveOverview}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingOverview(false);
                          setOverviewData({
                            tournamentName: tournament.tournamentName || '',
                            shortName: tournament.shortName || '',
                            logo: tournament.media?.logo || '',
                            coverImage: tournament.media?.coverImage || '',
                            visibility: tournament.visibility || 'public'
                          });
                          setLogoFile(null);
                          setCoverFile(null);
                        }}
                        className="px-6 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
                      >
                        <XIcon className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Tournament Name</p>
                      <p className="text-white font-medium">{tournament.tournamentName}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Short Name</p>
                      <p className="text-white font-medium">{tournament.shortName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm mb-1">Visibility</p>
                      <p className="text-white font-medium capitalize">{tournament.visibility || 'Public'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Full Tournament Form */}
              <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                <h3 className="text-lg font-semibold text-white mb-4">Tournament Settings</h3>
                <TournamentForm
                  tournament={editedTournament}
                  onSubmit={handleSave}
                  isEditing={true}
                />
              </div>
            </div>
          )}

          {/* PHASES TAB */}
          {activeTab === 'phases' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Tournament Phases</h3>
                {isAdmin && (
                  <button 
                    onClick={() => setActiveTab('phases-edit')}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Phases
                  </button>
                )}
              </div>

              {tournament.phases?.length > 0 ? (
                <div className="space-y-4">
                  {tournament.phases.map((phase, index) => (
                    <div key={index} className="bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                              <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white text-lg font-semibold">{phase.name}</h4>
                              <p className="text-zinc-400 text-sm">{phase.type} • {phase.format || 'Format not specified'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              phase.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                              phase.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                              phase.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {phase.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-zinc-400 text-sm">Duration</p>
                            <p className="text-white">
                              {phase.startDate ? new Date(phase.startDate).toLocaleDateString() : 'TBD'} - {' '}
                              {phase.endDate ? new Date(phase.endDate).toLocaleDateString() : 'TBD'}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-400 text-sm">Teams</p>
                            <p className="text-white">{phase.teams?.length || 0} teams</p>
                          </div>
                          <div>
                            <p className="text-zinc-400 text-sm">Matches</p>
                            <p className="text-white">{phase.matches?.length || 0} matches</p>
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
                  <h3 className="text-lg font-semibold text-white mb-2">No Phases Configured</h3>
                  <p className="text-zinc-400 mb-6">Create phases to organize your tournament structure</p>
                  {isAdmin && (
                    <button 
                      onClick={() => setActiveTab('phases-edit')}
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
              isOpen={true}
              initialPhases={tournament.phases || []}
              onSave={(phases) => {
                const updated = { ...editedTournament, phases };
                setEditedTournament(updated);
                onSave(updated);
                setActiveTab('phases');
              }}
              onClose={() => setActiveTab('phases')}
            />
          )}

          {/* MATCHES TAB */}
          {activeTab === 'matches' && (
            <MatchManagement
              tournament={tournament}
              onUpdate={(updatedTournament) => {
                setEditedTournament(updatedTournament);
                if (isAdmin) onSave(updatedTournament);
              }}
            />
          )}

          {/* TEAMS TAB */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Teams</h3>
                <div className="flex items-center gap-3">
                  {tournament.phases?.length > 0 && (
                    <select
                      value={selectedPhase}
                      onChange={(e) => setSelectedPhase(e.target.value)}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">All Phases</option>
                      {tournament.phases.map((phase, idx) => (
                        <option key={idx} value={phase.name}>{phase.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Team invitation section */}
              {selectedPhase && (
                <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
                  <h4 className="text-white font-semibold mb-4">
                    {isAdmin ? `Add Teams to ${selectedPhase}` : `Invite Teams to ${selectedPhase}`}
                  </h4>
                  <TeamSelector
                    selectedPhase={selectedPhase}
                    tournament={tournament}
                    onSelect={(team) => isAdmin ? handleAdminAddTeamToPhase(team, selectedPhase) : handleSendInvite(team, selectedPhase)}
                  />
                </div>
              )}

              {/* Teams list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const filteredTeams = selectedPhase 
                    ? (tournament.participatingTeams || []).filter(pt => pt.currentStage === selectedPhase)
                    : (tournament.participatingTeams || []);
                  
                  if (filteredTeams.length > 0) {
                    return filteredTeams.map((participatingTeam, index) => {
                      const team = participatingTeam.team || participatingTeam;
                      const teamName = team.teamName || team.name || 'Unknown Team';
                      const teamLogo = team.logo || participatingTeam.logo;

                      return (
                        <div key={team._id || index} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            {teamLogo ? (
                              <img src={teamLogo} alt={teamName} className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                              <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-zinc-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="text-white font-medium">{teamName}</h4>
                              {participatingTeam.currentStage && (
                                <p className="text-zinc-400 text-xs">{participatingTeam.currentStage}</p>
                              )}
                            </div>
                          </div>
                          {isAdmin && selectedPhase && (
                            <button 
                              onClick={() => handleAdminRemoveTeamFromPhase(team, selectedPhase)}
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
                          {isAdmin 
                            ? selectedPhase 
                              ? `Add teams to ${selectedPhase} using the controls above` 
                              : "Select a phase to add teams"
                            : selectedPhase 
                              ? `Invite teams to ${selectedPhase} using the selector above` 
                              : "Select a phase to invite teams"
                          }
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {/* PRIZE POOL TAB */}
          {activeTab === 'prizepool' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Prize Pool</h3>
                {isAdmin && !isEditingPrizePool && (
                  <button
                    onClick={() => setIsEditingPrizePool(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Prize Pool
                  </button>
                )}
              </div>

              {isEditingPrizePool ? (
                <div className="space-y-6">
                  <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                    <h4 className="text-white font-semibold mb-4">Total Prize Pool</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Amount</label>
                        <input
                          type="number"
                          value={prizePoolData.total}
                          onChange={(e) => setPrizePoolData(prev => ({ ...prev, total: parseFloat(e.target.value) || 0 }))}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Currency</label>
                        <select
                          value={prizePoolData.currency}
                          onChange={(e) => setPrizePoolData(prev => ({ ...prev, currency: e.target.value }))}
                          className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 rounded-lg p-6 border border-zinc-700">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold">Prize Distribution</h4>
                      <button
                        onClick={addPrizeDistribution}
                        className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Position
                      </button>
                    </div>

                    <div className="space-y-3">
                      {prizePoolData.distribution.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="number"
                            value={item.position}
                            onChange={(e) => updatePrizeDistribution(index, 'position', parseInt(e.target.value) || 1)}
                            className="w-20 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="#"
                          />
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => updatePrizeDistribution(index, 'amount', parseFloat(e.target.value) || 0)}
                            className="flex-1 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Amount"
                          />
                          <button
                            onClick={() => removePrizeDistribution(index)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSavePrizePool}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Save Prize Pool
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPrizePool(false);
                        setPrizePoolData({
                          total: tournament.prizePool?.total || 0,
                          currency: tournament.prizePool?.currency || 'INR',
                          distribution: tournament.prizePool?.distribution || []
                        });
                      }}
                      className="px-6 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2"
                    >
                      <XIcon className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg p-8 border border-orange-500/30">
                    <div className="text-center">
                      <p className="text-zinc-400 text-sm mb-2">Total Prize Pool</p>
                      <p className="text-5xl font-bold text-white mb-2">
                        ₹{tournament.prizePool?.total?.toLocaleString() || '0'}
                      </p>
                      <p className="text-zinc-400 text-sm">{tournament.prizePool?.currency || 'INR'}</p>
                    </div>
                  </div>

                  {tournament.prizePool?.distribution?.length > 0 && (
                    <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden">
                      <div className="p-6">
                        <h4 className="text-white font-semibold mb-4">Prize Distribution</h4>
                        <div className="space-y-2">
                          {tournament.prizePool.distribution
                            .sort((a, b) => a.position - b.position)
                            .map((item, index) => (
                              <div key={index} className="flex items-center justify-between py-3 px-4 bg-zinc-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    item.position === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                    item.position === 2 ? 'bg-gray-400/20 text-gray-400' :
                                    item.position === 3 ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-zinc-600/50 text-zinc-400'
                                  }`}>
                                    {item.position}
                                  </div>
                                  <span className="text-white font-medium">
                                    {item.position === 1 ? '1st Place' :
                                     item.position === 2 ? '2nd Place' :
                                     item.position === 3 ? '3rd Place' :
                                     `${item.position}th Place`}
                                  </span>
                                </div>
                                <span className="text-white text-lg font-bold">₹{item.amount?.toLocaleString()}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GROUPS TAB */}
          {activeTab === 'groups' && (
            <TeamGrouping
              tournament={tournament}
              onUpdate={(updatedTournament) => {
                setEditedTournament(updatedTournament);
                if (isAdmin) onSave(updatedTournament);
              }}
            />
          )}

          {/* POINTS TABLE TAB */}
          {activeTab === 'points' && (
            <PointsTable
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