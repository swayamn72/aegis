import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import AdminLayout from '../components/AdminLayout';
import TournamentEntryModal from '../components/TournamentEntryModal';
import TournamentForm from '../components/TournamentForm';
import TournamentWindow from '../components/TournamentWindow';
import { toast } from 'react-toastify';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Trophy,
  UserPlus,
  Bell,
  CheckCircle,
  XCircle
} from 'lucide-react';

const fetchTournaments = async (params = {}, token) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`/api/admin/tournaments?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch tournaments');
    }
    const data = await response.json();
    
    // Filter out pending org tournaments (they're shown separately)
    const filteredTournaments = data.tournaments.filter(
      t => t._approvalStatus !== 'pending'
    );
    
    return { ...data, tournaments: filteredTournaments };
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    throw error;
  }
};

const deleteTournament = async (tournamentId, token) => {
  try {
    const response = await fetch(`/api/admin/tournaments/${tournamentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
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

const enterTournament = async (tournamentId, entryData) => {
  try {
    const response = await fetch(`/api/admin/tournaments/${tournamentId}/enter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entryData)
    });
    if (!response.ok) {
      throw new Error('Failed to enter tournament');
    }
    return await response.json();
  } catch (error) {
    console.error('Error entering tournament:', error);
    throw error;
  }
};

const createTournament = async (tournamentData, token) => {
  try {
    const response = await fetch('/api/admin/tournaments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
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

const editTournament = async (tournamentData, tournamentId, token) => {
  try {
    const response = await fetch(`/api/admin/tournaments/${tournamentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: tournamentData
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update tournament');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating tournament:', error);
    throw error;
  }
};

const TournamentTable = ({ tournaments, onEdit, onDelete, onView, onEnter }) => {
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
              There are currently no tournaments available. Create your first tournament to get started.
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
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(tournament.status)}`}>
                    {tournament.status.replace('_', ' ')}
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
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEnter(tournament)}
                      className="text-zinc-400 hover:text-green-400 p-1"
                      title="Enter Tournament"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(tournament)}
                      className="text-zinc-400 hover:text-blue-400 p-1"
                      title="Edit Tournament"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(tournament)}
                      className="text-zinc-400 hover:text-red-400 p-1"
                      title="Delete Tournament"
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

const AdminTournaments = () => {
  const { admin, token } = useAdmin();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEnterModal, setShowEnterModal] = useState(false);
  const [showTournamentWindow, setShowTournamentWindow] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [pendingOrgTournaments, setPendingOrgTournaments] = useState([]);
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

  const fetchPendingOrgTournaments = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/admin/org-tournaments/pending-org-tournaments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingOrgTournaments(data.tournaments || []);
      }
    } catch (error) {
      console.error('Error fetching pending org tournaments:', error);
    }
  };

  const handleApproveOrgTournament = async (tournamentId) => {
    try {
      const response = await fetch(`/api/admin/org-tournaments/approve-org-tournament/${tournamentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featured: false, verified: true })
      });
      if (response.ok) {
        toast.success('Tournament approved successfully!');
        fetchPendingOrgTournaments();
        // Refresh main tournament list
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (statusFilter) params.status = statusFilter;
        if (gameFilter) params.gameTitle = gameFilter;
        const data = await fetchTournaments(params, token);
        setTournaments(data.tournaments || []);
      } else {
        toast.error('Failed to approve tournament');
      }
    } catch (error) {
      console.error('Error approving tournament:', error);
      toast.error('Error approving tournament');
    }
  };

  const handleRejectOrgTournament = async (tournamentId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      const response = await fetch(`/api/admin/org-tournaments/reject-org-tournament/${tournamentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        toast.success('Tournament rejected');
        fetchPendingOrgTournaments();
      } else {
        toast.error('Failed to reject tournament');
      }
    } catch (error) {
      console.error('Error rejecting tournament:', error);
      toast.error('Error rejecting tournament');
    }
  };

  const handleDeleteClick = (tournament) => {
    setTournamentToDelete(tournament);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!tournamentToDelete) return;
    setShowConfirmModal(false);
    try {
      await deleteTournament(tournamentToDelete._id, token);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (gameFilter) params.gameTitle = gameFilter;
      const data = await fetchTournaments(params, token);
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
      if (!token) return;
      setLoading(true);
      try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (statusFilter) params.status = statusFilter;
        if (gameFilter) params.gameTitle = gameFilter;
        const data = await fetchTournaments(params, token);
        setTournaments(data.tournaments || []);
      } catch (error) {
        console.error('Error loading tournaments:', error);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };

    loadTournaments();
    fetchPendingOrgTournaments();
  }, [searchTerm, statusFilter, gameFilter, token]);

  const handleEdit = (tournament) => {
    setSelectedTournament(tournament);
    setShowEditModal(true);
  };

  const handleView = (tournament) => {
    setSelectedTournament(tournament);
    setShowTournamentWindow(true);
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (tournamentData) => {
    try {
      await createTournament(tournamentData, token);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (gameFilter) params.gameTitle = gameFilter;
      const data = await fetchTournaments(params, token);
      setTournaments(data.tournaments || []);
      setShowCreateModal(false);
      toast.success('Tournament created successfully!');
    } catch (error) {
      console.error('Error creating tournament:', error);
      setShowCreateModal(false);
      toast.error('Error creating tournament');
    }
  };

  const handleEditSubmit = async (tournamentData) => {
    if (!selectedTournament) return;
    try {
      await editTournament(tournamentData, selectedTournament._id, token);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (gameFilter) params.gameTitle = gameFilter;
      const data = await fetchTournaments(params, token);
      setTournaments(data.tournaments || []);
      setShowEditModal(false);
      setSelectedTournament(null);
      toast.success('Tournament updated successfully!');
    } catch (error) {
      console.error('Error updating tournament:', error);
      setShowEditModal(false);
      setSelectedTournament(null);
      toast.error('Error updating tournament');
    }
  };

  const handleEnter = (tournament) => {
    setSelectedTournament(tournament);
    setShowEnterModal(true);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Tournament Management</h1>
            <p className="text-zinc-400">Manage tournaments and competitions</p>
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

        {/* PENDING ORG TOURNAMENTS SECTION */}
        {pendingOrgTournaments.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <Bell className="w-5 h-5 text-yellow-400" />
              Pending Organization Tournaments ({pendingOrgTournaments.length})
            </h3>
            <div className="space-y-3">
              {pendingOrgTournaments.map((tournament) => (
                <div key={tournament._id} className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-700 rounded flex-shrink-0">
                      {tournament.media?.logo ? (
                        <img src={tournament.media.logo} alt="" className="w-full h-full object-cover rounded" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-zinc-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{tournament.tournamentName}</h4>
                      <p className="text-sm text-zinc-400">
                        By {tournament.organizer?.organizationRef?.orgName || 'Unknown'} • {tournament.gameTitle} • {tournament.region}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Submitted {new Date(tournament._submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleView(tournament)}
                      className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-sm text-white transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleApproveOrgTournament(tournament._id)}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-sm text-white transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectOrgTournament(tournament._id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm text-white transition flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <TournamentTable
          tournaments={tournaments}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onView={handleView}
          onEnter={handleEnter}
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
      </div>

      <TournamentEntryModal
        tournament={selectedTournament}
        isOpen={showEnterModal}
        onClose={() => {
          setShowEnterModal(false);
          setSelectedTournament(null);
        }}
        onSubmit={enterTournament}
      />

      {showCreateModal && (
        <TournamentForm
          tournament={null}
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
          isEditing={false}
        />
      )}

      {showEditModal && selectedTournament && (
        <TournamentForm
          tournament={selectedTournament}
          onSubmit={handleEditSubmit}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedTournament(null);
          }}
          isEditing={true}
        />
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirm Delete"
        message={tournamentToDelete ? `Are you sure you want to delete "${tournamentToDelete.tournamentName}"?` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {showTournamentWindow && selectedTournament && (
        <TournamentWindow
          tournament={selectedTournament}
          isOpen={showTournamentWindow}
          onClose={() => {
            setShowTournamentWindow(false);
            setSelectedTournament(null);
          }}
          onSave={async (updatedTournament) => {
            console.log('Saving tournament:', updatedTournament);
            setShowTournamentWindow(false);
            setSelectedTournament(null);
          }}
          isAdmin={true}
        />
      )}
    </AdminLayout>
  );
};

export default AdminTournaments;