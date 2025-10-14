import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Trophy,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const fetchTournaments = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`/api/org-tournaments/my-tournaments?${queryString}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch tournaments');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    throw error;
  }
};

const deleteTournament = async (tournamentId) => {
  try {
    const response = await fetch(`/api/org-tournaments/${tournamentId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete tournament');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting tournament:', error);
    throw error;
  }
};

const createTournament = async (tournamentData) => {
  try {
    const response = await fetch('/api/org-tournaments/create-tournament', {
      method: 'POST',
      credentials: 'include',
      body: tournamentData
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create tournament');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
};

const TournamentTable = ({ tournaments, onEdit, onDelete, onView }) => {
  const getStatusColor = (status, approvalStatus) => {
    if (approvalStatus === 'pending') {
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
    if (approvalStatus === 'rejected') {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    }

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

  const getStatusText = (status, approvalStatus) => {
    if (approvalStatus === 'pending') return 'Pending Approval';
    if (approvalStatus === 'rejected') return 'Rejected';
    return status.replace('_', ' ');
  };

  if (tournaments.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center">
            <Trophy className="h-8 w-8 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">No Tournaments Found</h3>
            <p className="text-zinc-400 text-sm">
              You haven't created any tournaments yet. Create your first tournament to get started.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Tournament
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Game
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Prize Pool
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Teams
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {tournaments.map((tournament) => (
              <tr key={tournament._id} className="hover:bg-zinc-800/30">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {tournament.media?.logo ? (
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={tournament.media.logo}
                          alt={tournament.tournamentName}
                        />
                      ) : (
                        <div className="h-10 w-10 bg-zinc-700 rounded-lg flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-zinc-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {tournament.tournamentName}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {tournament.region} • <span className={getTierColor(tournament.tier)}>{tournament.tier}-Tier</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-white">{tournament.gameTitle}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(tournament.status, tournament._approvalStatus)}`}>
                    {tournament._approvalStatus === 'pending' && <Clock className="w-3 h-3" />}
                    {tournament._approvalStatus === 'rejected' && <XCircle className="w-3 h-3" />}
                    {tournament._approvalStatus === 'approved' && <CheckCircle className="w-3 h-3" />}
                    {getStatusText(tournament.status, tournament._approvalStatus)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {formatPrizePool(tournament.prizePool)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {tournament.participatingTeams?.length || 0}/{tournament.slots?.total || 'TBD'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                  {formatDate(tournament.startDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(tournament)}
                      className="text-zinc-400 hover:text-white p-1"
                      title="View & Manage"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(tournament)}
                      className="text-zinc-400 hover:text-blue-400 p-1"
                      title="Quick Edit"
                      disabled={tournament._approvalStatus === 'pending'}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(tournament)}
                      className="text-zinc-400 hover:text-red-400 p-1"
                      title="Delete Tournament"
                      disabled={tournament._approvalStatus === 'pending'}
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

const OrgTournaments = ({ onCreateTournament, onManageTournament }) => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState(null);

  const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
        <div className="bg-zinc-900 rounded-lg p-6 max-w-sm w-full text-white shadow-lg">
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          <p className="mb-6">{message}</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleDeleteClick = (tournament) => {
    setTournamentToDelete(tournament);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!tournamentToDelete) return;
    setShowConfirmModal(false);
    try {
      await deleteTournament(tournamentToDelete._id);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (gameFilter) params.gameTitle = gameFilter;
      const data = await fetchTournaments(params);
      setTournaments(data.tournaments || []);
      toast.success('Tournament deleted successfully');
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast.error('Failed to delete tournament');
    } finally {
      setTournamentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setTournamentToDelete(null);
  };

  useEffect(() => {
    const loadTournaments = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (statusFilter) params.status = statusFilter;
        if (gameFilter) params.gameTitle = gameFilter;
        const data = await fetchTournaments(params);
        setTournaments(data.tournaments || []);
      } catch (error) {
        console.error('Error loading tournaments:', error);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };

    loadTournaments();
  }, [searchTerm, statusFilter, gameFilter]);

  const handleEdit = (tournament) => {
    setSelectedTournament(tournament);
    setShowEditModal(true);
  };

  const navigate = useNavigate();

  const handleView = (tournament) => {
    if (onManageTournament) {
      onManageTournament(tournament);
    } else {
      navigate(`/org/tournaments/${tournament._id}`);
    }
  };

  const handleCreate = () => {
    if (onCreateTournament) {
      onCreateTournament();
    } else {
      setShowCreateModal(true);
    }
  };

  const handleCreateSubmit = async (tournamentData) => {
    try {
      const result = await createTournament(tournamentData);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (gameFilter) params.gameTitle = gameFilter;
      const data = await fetchTournaments(params);
      setTournaments(data.tournaments || []);
      setShowCreateModal(false);
      toast.success('Tournament submitted for admin approval!');
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Error creating tournament');
    }
  };

  const handleEditSubmit = async (tournamentData) => {
    if (!selectedTournament) return;
    try {
      const response = await fetch(`/api/org-tournaments/${selectedTournament._id}`, {
        method: 'PUT',
        credentials: 'include',
        body: tournamentData
      });

      if (response.ok) {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (statusFilter) params.status = statusFilter;
        if (gameFilter) params.gameTitle = gameFilter;
        const data = await fetchTournaments(params);
        setTournaments(data.tournaments || []);
        setShowEditModal(false);
        setSelectedTournament(null);
        toast.success('Tournament updated successfully!');
      } else {
        toast.error('Failed to update tournament');
      }
    } catch (error) {
      console.error('Error updating tournament:', error);
      toast.error('Error updating tournament');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tournament Management</h1>
          <p className="text-zinc-400">Manage your organization's tournaments</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Tournament
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tournaments..."
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
              <option value="announced">Announced</option>
              <option value="registration_open">Registration Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending Approval</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Games</option>
              <option value="BGMI">BGMI</option>
              <option value="Valorant">Valorant</option>
              <option value="CS2">CS2</option>
              <option value="LoL">LoL</option>
            </select>
          </div>
        </div>
      </div>

      <TournamentTable
        tournaments={tournaments}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onView={handleView}
      />

      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">
          Showing {tournaments.length} tournaments
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

      {showCreateModal && (
        <div> {/* Placeholder for CreateTournamentModal */} </div>
      )}

      {showEditModal && selectedTournament && (
        <div> {/* Placeholder for EditTournamentModal */} </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Delete"
        message={tournamentToDelete ? `Are you sure you want to delete "${tournamentToDelete.tournamentName}"?` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default OrgTournaments;
