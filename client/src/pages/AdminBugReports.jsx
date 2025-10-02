import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import AdminLayout from '../components/AdminLayout';
import {
  Bug,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// API functions
const fetchBugReports = async (token, page = 1, limit = 10, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await fetch(`/api/admin/bug-reports?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bug reports');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    throw error;
  }
};

const updateBugReportStatus = async (token, id, status) => {
  try {
    const response = await fetch(`/api/admin/bug-reports/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update bug report status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating bug report status:', error);
    throw error;
  }
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'open': {
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: AlertTriangle,
      label: 'Open'
    },
    'in progress': {
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      icon: Clock,
      label: 'In Progress'
    },
    'closed': {
      color: 'bg-green-500/20 text-green-400 border-green-500/30',
      icon: CheckCircle,
      label: 'Closed'
    }
  };

  const config = statusConfig[status] || statusConfig['open'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    'Low': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'Medium': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Critical': 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${priorityConfig[priority] || priorityConfig['Low']}`}>
      {priority}
    </span>
  );
};

const AdminBugReports = () => {
  const { admin, token } = useAdmin();
  const [bugReports, setBugReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalRecords: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    userId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const loadBugReports = async (page = 1) => {
    if (!token) return;

    setLoading(true);
    try {
      const data = await fetchBugReports(token, page, 10, filters);
      setBugReports(data.bugReports || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Error loading bug reports:', error);
      setBugReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBugReports();
  }, [token, filters]);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(id);
    try {
      await updateBugReportStatus(token, id, newStatus);
      // Reload the current page
      await loadBugReports(pagination.current);
    } catch (error) {
      console.error('Error updating status:', error);
      // You might want to show a toast notification here
    } finally {
      setUpdating(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      userId: ''
    });
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

  if (loading && bugReports.length === 0) {
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
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Bug Reports Management</h1>
              <p className="text-zinc-300">
                Review and manage user-submitted bug reports
              </p>
            </div>
            <Bug className="w-12 h-12 text-orange-400" />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              >
                <option value="">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              <input
                type="text"
                placeholder="User ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:border-orange-500"
              />

              <button
                onClick={clearFilters}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Bug Reports List */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
          {bugReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bug className="w-16 h-16 text-zinc-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Bug Reports Found</h3>
              <p className="text-zinc-400 text-center">
                {Object.values(filters).some(v => v) ?
                  'Try adjusting your filters to see more results.' :
                  'No bug reports have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {bugReports.map((report) => (
                      <tr key={report._id} className="hover:bg-zinc-800/30">
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-white truncate">
                              {report.title}
                            </div>
                            <div className="text-xs text-zinc-400 truncate">
                              {report.stepsToReproduce}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">
                            {report.userId?.username || 'Unknown'}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {report.userId?.email || report.userId?._id}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={report.priority} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={report.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-300">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={report.status}
                              onChange={(e) => handleStatusUpdate(report._id, e.target.value)}
                              disabled={updating === report._id}
                              className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-orange-500 disabled:opacity-50"
                            >
                              <option value="open">Open</option>
                              <option value="in progress">In Progress</option>
                              <option value="closed">Closed</option>
                            </select>
                            {updating === report._id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-zinc-800/50 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-zinc-400">
                  Showing {((pagination.current - 1) * 10) + 1} to {Math.min(pagination.current * 10, pagination.totalRecords)} of {pagination.totalRecords} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadBugReports(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="text-sm text-zinc-400">
                    Page {pagination.current} of {pagination.total}
                  </span>
                  <button
                    onClick={() => loadBugReports(pagination.current + 1)}
                    disabled={pagination.current === pagination.total}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBugReports;
