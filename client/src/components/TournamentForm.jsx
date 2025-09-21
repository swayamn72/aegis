import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar, MapPin, Trophy, Users, DollarSign } from 'lucide-react';

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
      distribution: []
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

  useEffect(() => {
    if (tournament) {
      setFormData({
        ...tournament,
        startDate: tournament.startDate ? tournament.startDate.split('T')[0] : '',
        endDate: tournament.endDate ? tournament.endDate.split('T')[0] : '',
        registrationDeadline: tournament.registrationDeadline ? tournament.registrationDeadline.split('T')[0] : ''
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

      await onSubmit(formData);
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
      </div>
    </div>
  );
};

export default TournamentForm;
