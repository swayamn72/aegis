import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar, MapPin, Trophy, Users, DollarSign, Settings, UserPlus, Target, ChevronDown, ChevronUp } from 'lucide-react';
import TeamSearchModal from './TeamSearchModal';
import PrizeDistributionForm from './PrizeDistributionForm';
import PhaseManager from './PhaseManager';

const TournamentForm = ({ tournament, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    tournamentName: '',
    shortName: '',
    gameTitle: '',
    description: '',
    region: '',
    tier: 'Community',
    status: 'announced',
    visibility: 'public',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: '',
    slots: {
      total: 16,
      registered: 0
    },
    prizePool: {
      total: 0,
      currency: 'INR',
      distribution: [],
      individualAwards: []
    },
    rules: '',
    requirements: '',
    contactInfo: {
      email: '',
      phone: '',
      discord: ''
    },
    media: {
      logo: '',
      banner: '',
      screenshots: []
    },
    organizer: {
      name: 'Aegis Esports',
      organizationRef: null,
      contactPerson: '',
      contactEmail: ''
    },
    format: 'Battle Royale Points System',
    participatingTeams: [],
    tags: [],
    featured: false,
    isOfficial: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showTeamSearchModal, setShowTeamSearchModal] = useState(false);
  const [showPrizeDistributionModal, setShowPrizeDistributionModal] = useState(false);
  const [showPhaseManagerModal, setShowPhaseManagerModal] = useState(false);

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    slots: false,
    teams: false,
    prizes: false,
    phases: false
  });

  useEffect(() => {
    if (tournament) {
      setFormData({
        ...tournament,
        startDate: tournament.startDate ? tournament.startDate.split('T')[0] : '',
        endDate: tournament.endDate ? tournament.endDate.split('T')[0] : '',
        registrationDeadline: tournament.registrationDeadline ? tournament.registrationDeadline.split('T')[0] : ''
      });
    } else {
      // Initialize with default values if no tournament provided
      setFormData({
        tournamentName: '',
        shortName: '',
        gameTitle: 'BGMI',
        description: '',
        region: 'India',
        tier: 'Community',
        status: 'announced',
        visibility: 'public',
        startDate: '',
        endDate: '',
        registrationDeadline: '',
        maxParticipants: '5',
        slots: {
          total: 16,
          registered: 0
        },
        prizePool: {
          total: 0,
          currency: 'INR',
          distribution: [],
          individualAwards: []
        },
        rules: '',
        requirements: '',
        contactInfo: {
          email: '',
          phone: '',
          discord: ''
        },
        media: {
          logo: '',
          banner: '',
          screenshots: []
        },
        organizer: {
          name: 'Aegis Esports',
          organizationRef: null,
          contactPerson: '',
          contactEmail: ''
        },
        format: 'Battle Royale Points System',
        participatingTeams: [],
        tags: [],
        featured: false,
        isOfficial: true
      });
    }
  }, [tournament]);

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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      const newErrors = {};

      if (!formData.tournamentName.trim()) {
        newErrors.tournamentName = 'Tournament name is required';
      }

      if (!formData.gameTitle) {
        newErrors.gameTitle = 'Game title is required';
      }

      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }

      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      }

      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      // Filter out empty participating teams and clean up the data
      const cleanedFormData = {
        ...formData,
        participatingTeams: formData.participatingTeams?.filter(team => team && team.teamName && team.teamName.trim() !== '').map(team => ({
          team: team._id || team.id, // Use the team ID if available
          qualifiedThrough: 'open_registration', // Default qualification method
          seed: null, // Will be set later if needed
          group: null,
          currentStage: null,
          totalTournamentPoints: 0,
          totalTournamentKills: 0
        })) || [],
        // Ensure individual awards have proper structure
        prizePool: {
          ...formData.prizePool,
          individualAwards: formData.prizePool?.individualAwards?.filter(award =>
            award && award.name && award.name.trim() !== ''
          ) || []
        }
      };

      await onSubmit(cleanedFormData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const gameOptions = [
    'BGMI',
    'Valorant',
    'CS2',
    'LoL',
    'Dota 2',
    'COD Mobile',
    'Free Fire'
  ];

  const regionOptions = [
    'Global',
    'Asia',
    'India',
    'South Asia',
    'Europe',
    'North America',
    'South America'
  ];

  const tierOptions = [
    'S',
    'A',
    'B',
    'C',
    'Community'
  ];

  const statusOptions = [
    'announced',
    'registration_open',
    'registration_closed',
    'in_progress',
    'completed',
    'cancelled'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {isEditing ? 'Edit Tournament' : 'Create New Tournament'}
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tournament Name *
              </label>
              <input
                type="text"
                name="tournamentName"
                value={formData.tournamentName}
                onChange={handleChange}
                className={`w-full bg-zinc-800/50 border rounded-lg px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.tournamentName ? 'border-red-500' : 'border-zinc-700'
                }`}
                placeholder="Enter tournament name"
              />
              {errors.tournamentName && (
                <p className="text-red-400 text-sm mt-1">{errors.tournamentName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Short Name
              </label>
              <input
                type="text"
                name="shortName"
                value={formData.shortName}
                onChange={handleChange}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Short name or acronym"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Game Title *
              </label>
              <select
                name="gameTitle"
                value={formData.gameTitle}
                onChange={handleChange}
                className={`w-full bg-zinc-800/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.gameTitle ? 'border-red-500' : 'border-zinc-700'
                }`}
              >
                <option value="">Select Game</option>
                {gameOptions.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
              {errors.gameTitle && (
                <p className="text-red-400 text-sm mt-1">{errors.gameTitle}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Region
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Region</option>
                {regionOptions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tier
              </label>
              <select
                name="tier"
                value={formData.tier}
                onChange={handleChange}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {tierOptions.map(tier => (
                  <option key={tier} value={tier}>{tier}-Tier</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full bg-zinc-800/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.startDate ? 'border-red-500' : 'border-zinc-700'
                }`}
              />
              {errors.startDate && (
                <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full bg-zinc-800/50 border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.endDate ? 'border-red-500' : 'border-zinc-700'
                }`}
              />
              {errors.endDate && (
                <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Registration Deadline
              </label>
              <input
                type="date"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleChange}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Prize Pool */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Prize Pool (INR)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="number"
                name="prizePool.total"
                value={formData.prizePool.total}
                onChange={handleChange}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Total prize pool amount"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Tournament description..."
            />
          </div>

          {/* Status and Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Visibility
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {/* Advanced Settings - Collapsible Sections */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">Advanced Settings</h3>

            {/* Slots Management Section */}
            <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <button
                type="button"
                onClick={() => setExpandedSections(prev => ({ ...prev, slots: !prev.slots }))}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-medium">Slots Management</span>
                </div>
                {expandedSections.slots ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
              </button>

              {expandedSections.slots && (
                <div className="p-4 pt-0 border-t border-zinc-700 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Total Slots
                      </label>
                      <input
                        type="number"
                        name="slots.total"
                        value={formData.slots.total}
                        onChange={handleChange}
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="16"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Max Participants per Team
                      </label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="5"
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-sm text-zinc-400">
                      <span className="text-white font-medium">{formData.slots.registered || 0}</span> of{' '}
                      <span className="text-white font-medium">{formData.slots.total || 16}</span> slots filled
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Invited Teams Section */}
            <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <button
                type="button"
                onClick={() => setExpandedSections(prev => ({ ...prev, teams: !prev.teams }))}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <UserPlus className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Invited Teams</span>
                  {formData.participatingTeams && formData.participatingTeams.length > 0 && (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                      {formData.participatingTeams.length}
                    </span>
                  )}
                </div>
                {expandedSections.teams ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
              </button>

              {expandedSections.teams && (
                <div className="p-4 pt-0 border-t border-zinc-700 max-h-64 overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-zinc-400">
                      {formData.participatingTeams && formData.participatingTeams.length > 0
                        ? `${formData.participatingTeams.length} team${formData.participatingTeams.length !== 1 ? 's' : ''} invited`
                        : 'No teams invited yet'
                      }
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowTeamSearchModal(true)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Teams</span>
                    </button>
                  </div>

                  {formData.participatingTeams && formData.participatingTeams.length > 0 && (
                    <div className="space-y-2">
                      {formData.participatingTeams.map((team, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {team.logo && (
                              <img src={team.logo} alt={team.teamName} className="w-8 h-8 rounded object-cover" />
                            )}
                            <div>
                              <p className="text-white font-medium">{team.teamName}</p>
                              {team.tag && <p className="text-zinc-400 text-sm">@{team.tag}</p>}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newTeams = formData.participatingTeams.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, participatingTeams: newTeams }));
                            }}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Prize Distribution Section */}
            <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <button
                type="button"
                onClick={() => setExpandedSections(prev => ({ ...prev, prizes: !prev.prizes }))}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-medium">Prize Distribution</span>
                  {formData.prizePool.distribution && formData.prizePool.distribution.length > 0 && (
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                      {formData.prizePool.distribution.length} positions
                    </span>
                  )}
                </div>
                {expandedSections.prizes ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
              </button>

              {expandedSections.prizes && (
                <div className="p-4 pt-0 border-t border-zinc-700 max-h-64 overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-zinc-400">Total Prize Pool</p>
                      <p className="text-lg font-bold text-white">₹{formData.prizePool.total?.toLocaleString() || '0'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPrizeDistributionModal(true)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Manage Distribution</span>
                    </button>
                  </div>

                  {formData.prizePool.distribution && formData.prizePool.distribution.length > 0 ? (
                    <div className="space-y-2">
                      {formData.prizePool.distribution.map((prize, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{prize.position}</p>
                            <p className="text-zinc-400 text-sm">₹{prize.amount?.toLocaleString() || '0'} ({prize.percentage || 0}%)</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-400">No prize distribution set up yet</p>
                      <p className="text-zinc-500 text-sm">Click "Manage Distribution" to set up prizes</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tournament Phases Section */}
            <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg">
              <button
                type="button"
                onClick={() => setExpandedSections(prev => ({ ...prev, phases: !prev.phases }))}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Tournament Phases</span>
                  {formData.phases && formData.phases.length > 0 && (
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                      {formData.phases.length} phases
                    </span>
                  )}
                </div>
                {expandedSections.phases ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
              </button>

              {expandedSections.phases && (
                <div className="p-4 pt-0 border-t border-zinc-700 max-h-64 overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-zinc-400">
                      {formData.phases && formData.phases.length > 0
                        ? `${formData.phases.length} phase${formData.phases.length !== 1 ? 's' : ''} configured`
                        : 'No phases configured yet'
                      }
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPhaseManagerModal(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                    >
                      <Target className="w-4 h-4" />
                      <span>Manage Phases</span>
                    </button>
                  </div>

                  {formData.phases && formData.phases.length > 0 ? (
                    <div className="space-y-2">
                      {formData.phases.map((phase, index) => (
                        <div key={index} className="p-3 bg-zinc-800/50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{phase.name}</p>
                              <p className="text-zinc-400 text-sm">{phase.type} • {phase.format}</p>
                              <p className="text-zinc-500 text-xs">
                                {phase.startDate && new Date(phase.startDate).toLocaleDateString()} - {phase.endDate && new Date(phase.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              phase.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                              phase.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {phase.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-400">No phases configured yet</p>
                      <p className="text-zinc-500 text-sm">Click "Manage Phases" to set up tournament structure</p>
                    </div>
                  )}
                </div>
              )}
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
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update Tournament' : 'Create Tournament'
              )}
            </button>
          </div>
        </form>

        {/* Modals */}
        <TeamSearchModal
          isOpen={showTeamSearchModal}
          onClose={() => setShowTeamSearchModal(false)}
          onSelectTeam={(team) => {
            setFormData(prev => ({
              ...prev,
              participatingTeams: [...(prev.participatingTeams || []), team]
            }));
            setShowTeamSearchModal(false);
          }}
          gameTitle={formData.gameTitle}
          selectedTeams={formData.participatingTeams || []}
        />

        <PrizeDistributionForm
          isOpen={showPrizeDistributionModal}
          onClose={() => setShowPrizeDistributionModal(false)}
          onSave={(distribution, individualAwards) => {
            setFormData(prev => ({
              ...prev,
              prizePool: {
                ...prev.prizePool,
                distribution: distribution,
                individualAwards: individualAwards
              }
            }));
            setShowPrizeDistributionModal(false);
          }}
          initialDistribution={formData.prizePool?.distribution || []}
          initialIndividualAwards={formData.prizePool?.individualAwards || []}
          totalPrizePool={formData.prizePool?.total || 0}
          currency={formData.prizePool?.currency || 'INR'}
        />

        <PhaseManager
          isOpen={showPhaseManagerModal}
          onClose={() => setShowPhaseManagerModal(false)}
          onSave={(phases) => {
            setFormData(prev => ({
              ...prev,
              phases: phases
            }));
            setShowPhaseManagerModal(false);
          }}
          initialPhases={formData.phases || []}
          tournamentStartDate={formData.startDate}
          tournamentEndDate={formData.endDate}
        />
      </div>
    </div>
  );
};

export default TournamentForm;
