import React, { useState } from 'react';
import { X, Users, Trophy, Calendar, MapPin } from 'lucide-react';

const TournamentEntryModal = ({ tournament, isOpen, onClose, onSubmit }) => {
  const [entryData, setEntryData] = useState({
    teamName: '',
    captainName: '',
    captainEmail: '',
    captainPhone: '',
    teamMembers: '',
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(tournament._id, entryData);
      onClose();
      // Reset form
      setEntryData({
        teamName: '',
        captainName: '',
        captainEmail: '',
        captainPhone: '',
        teamMembers: '',
        additionalInfo: ''
      });
    } catch (error) {
      console.error('Error entering tournament:', error);
      alert('Failed to enter tournament. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEntryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen || !tournament) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrizePool = (prizePool) => {
    if (!prizePool || !prizePool.total) return 'TBD';
    const amount = prizePool.total;
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
      case 'qualifiers_in_progress':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'upcoming':
      case 'announced':
      case 'registration_open':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'S': return 'text-yellow-400';
      case 'A': return 'text-blue-400';
      case 'B': return 'text-green-400';
      case 'C': return 'text-gray-400';
      default: return 'text-orange-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-white">Enter Tournament</h2>
            <p className="text-zinc-400">Register your team for this tournament</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tournament Info */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-16 w-16">
              {tournament.media?.logo ? (
                <img
                  className="h-16 w-16 rounded-lg object-cover"
                  src={tournament.media.logo}
                  alt={tournament.tournamentName}
                />
              ) : (
                <div className="h-16 w-16 bg-zinc-700 rounded-lg flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-zinc-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{tournament.tournamentName}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {tournament.region}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(tournament.startDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {tournament.participatingTeams?.length || 0}/{tournament.slots?.total || 'TBD'} teams
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(tournament.status)}`}>
                  {tournament.status.replace('_', ' ')}
                </span>
                <span className={`text-sm ${getTierColor(tournament.tier)}`}>
                  {tournament.tier}-Tier
                </span>
                <span className="text-sm text-white">
                  Prize Pool: {formatPrizePool(tournament.prizePool)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Entry Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Team Name *
              </label>
              <input
                type="text"
                name="teamName"
                value={entryData.teamName}
                onChange={handleInputChange}
                required
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your team name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Captain Name *
              </label>
              <input
                type="text"
                name="captainName"
                value={entryData.captainName}
                onChange={handleInputChange}
                required
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter captain's full name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Captain Email *
              </label>
              <input
                type="email"
                name="captainEmail"
                value={entryData.captainEmail}
                onChange={handleInputChange}
                required
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="captain@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Captain Phone *
              </label>
              <input
                type="tel"
                name="captainPhone"
                value={entryData.captainPhone}
                onChange={handleInputChange}
                required
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Team Members
            </label>
            <textarea
              name="teamMembers"
              value={entryData.teamMembers}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="List team members (one per line) - Player1, Player2, Player3, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Additional Information
            </label>
            <textarea
              name="additionalInfo"
              value={entryData.additionalInfo}
              onChange={handleInputChange}
              rows={2}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Any additional information you'd like to provide..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Entering...
                </>
              ) : (
                'Enter Tournament'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentEntryModal;
