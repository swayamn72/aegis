import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import AdminLayout from '../components/AdminLayout';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Users,
  Clock,
  MoreHorizontal
} from 'lucide-react';

// API functions
const fetchMatches = async (params = {}, token) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`/api/admin/matches?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch matches');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};

const deleteMatch = async (matchId, token) => {
  try {
    const response = await fetch(`/api/admin/matches/${matchId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete match');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting match:', error);
    throw error;
  }
};

const MatchTable = ({ matches, onEdit, onDelete, onView }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getMatchTypeColor = (matchType) => {
    switch (matchType) {
      case 'final':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'semifinal':
        return 'text-orange-400 bg-orange-500/20';
      case 'playoff':
        return 'text-purple-400 bg-purple-500/20';
      case 'group_stage':
        return 'text-blue-400 bg-blue-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'TBD';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Match
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Tournament
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Map
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Teams
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {matches.map((match) => (
              <tr key={match._id} className="hover:bg-zinc-800/30">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          #{match.matchNumber}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        Match #{match.matchNumber}
                      </div>
                      <div className="text-sm text-zinc-400">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMatchTypeColor(match.matchType)}`}>
                          {match.matchType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{match.tournament?.tournamentName || 'N/A'}</div>
                  <div className="text-sm text-zinc-400">{match.tournamentPhase}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(match.status)}`}>
                    {match.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{match.map}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {match.participatingTeams?.length || 0} teams
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                  {formatDate(match.scheduledStartTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                  {formatDuration(match.matchDuration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(match)}
                      className="text-zinc-400 hover:text-white p-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(match)}
                      className="text-zinc-400 hover:text-blue-400 p-1"
                      title="Edit Match"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(match)}
                      className="text-zinc-400 hover:text-red-400 p-1"
                      title="Delete Match"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminMatches = () => {
  const { admin, token } = useAdmin();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data for demonstration
  const mockMatches = [
    {
      _id: '1',
      matchNumber: 1245,
      matchType: 'group_stage',
      tournament: {
        tournamentName: 'BGMI Championship 2024',
        shortName: 'BGMI Champs'
      },
      tournamentPhase: 'Group Stage Day 1',
      status: 'in_progress',
      map: 'Erangel',
      scheduledStartTime: '2024-01-15T14:00:00Z',
      matchDuration: 35,
      participatingTeams: Array(16).fill({})
    },
    {
      _id: '2',
      matchNumber: 1246,
      matchType: 'final',
      tournament: {
        tournamentName: 'Valorant Champions League',
        shortName: 'VCL'
      },
      tournamentPhase: 'Grand Finals',
      status: 'scheduled',
      map: 'Miramar',
      scheduledStartTime: '2024-01-16T16:00:00Z',
      matchDuration: null,
      participatingTeams: Array(2).fill({})
    }
  ];

  useEffect(() => {
    const loadMatches = async () => {
      if (!token) return; // Don't make API calls if no token

      setLoading(true);
      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (statusFilter) params.status = statusFilter;
        if (tournamentFilter) params.tournament = tournamentFilter;

        const data = await fetchMatches(params, token);
        setMatches(data.matches || []);
      } catch (error) {
        console.error('Error loading matches:', error);
        // Fallback to mock data if API fails
        setMatches(mockMatches);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [searchTerm, statusFilter, tournamentFilter, token]);

  const handleEdit = (match) => {
    console.log('Edit match:', match);
    // TODO: Open edit modal
  };

  const handleDelete = async (match) => {
    if (window.confirm(`Are you sure you want to delete Match #${match.matchNumber}?`)) {
      try {
        await deleteMatch(match._id, token);
        // Refresh the matches list after successful deletion
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (statusFilter) params.status = statusFilter;
        if (tournamentFilter) params.tournament = tournamentFilter;

        const data = await fetchMatches(params, token);
        setMatches(data.matches || []);
      } catch (error) {
        console.error('Error deleting match:', error);
        alert('Failed to delete match. Please try again.');
      }
    }
  };

  const handleView = (match) => {
    console.log('View match:', match);
    // TODO: Open view modal or navigate to detail page
  };

  const handleCreate = () => {
    setShowCreateModal(true);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Match Management</h1>
            <p className="text-zinc-400">Manage matches and competitions</p>
          </div>
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Match
          </button>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search matches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={tournamentFilter}
                onChange={(e) => setTournamentFilter(e.target.value)}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">All Tournaments</option>
                <option value="bgmi-championship">BGMI Championship</option>
                <option value="valorant-champions">Valorant Champions League</option>
              </select>
            </div>
          </div>
        </div>

        {/* Match Table */}
        <MatchTable
          matches={matches}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            Showing {matches.length} matches
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 bg-orange-500 text-white rounded">
              1
            </button>
            <button className="px-3 py-1 bg-zinc-800 text-white rounded hover:bg-zinc-700">
              2
            </button>
            <button className="px-3 py-1 bg-zinc-800 text-white rounded hover:bg-zinc-700">
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMatches;
