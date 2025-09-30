import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import AdminLayout from '../components/AdminLayout';
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Globe
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminOrganizations = () => {
  const { token } = useAdmin();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all

  useEffect(() => {
    fetchOrganizations();
  }, [filter]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'pending' 
        ? 'http://localhost:5000/api/organizations/pending'
        : `http://localhost:5000/api/organizations?status=${filter}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data = await response.json();
      setOrganizations(data.organizations || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orgId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/organizations/${orgId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to approve organization');
      }

      toast.success('Organization approved successfully!');
      fetchOrganizations();
      setShowModal(false);
      setSelectedOrg(null);
    } catch (error) {
      console.error('Error approving organization:', error);
      toast.error('Failed to approve organization');
    }
  };

  const handleReject = async (orgId) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/organizations/${orgId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (!response.ok) {
        throw new Error('Failed to reject organization');
      }

      toast.success('Organization rejected');
      fetchOrganizations();
      setShowModal(false);
      setSelectedOrg(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting organization:', error);
      toast.error('Failed to reject organization');
    }
  };

  const openModal = (org) => {
    setSelectedOrg(org);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrg(null);
    setRejectionReason('');
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
            <h1 className="text-2xl font-bold text-white">Organization Management</h1>
            <p className="text-zinc-400 mt-1">Review and manage organization registrations</p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm">Pending Review</p>
                <p className="text-2xl font-bold text-white">
                  {organizations.filter(o => o.approvalStatus === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm">Approved</p>
                <p className="text-2xl font-bold text-white">
                  {organizations.filter(o => o.approvalStatus === 'approved').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-white">
                  {organizations.filter(o => o.approvalStatus === 'rejected').length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Organizations List */}
        {organizations.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
            <Building2 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Organizations Found</h3>
            <p className="text-zinc-400">
              {filter === 'pending' 
                ? 'There are no pending organization registrations.'
                : `No ${filter} organizations found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {organizations.map((org) => (
              <div
                key={org._id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Logo Placeholder */}
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>

                    {/* Organization Info */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{org.orgName}</h3>
                          {getStatusBadge(org.approvalStatus)}
                        </div>
                        {org.description && (
                          <p className="text-zinc-400 text-sm">{org.description}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-zinc-500" />
                          <span className="text-zinc-300">{org.email}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-zinc-500" />
                          <span className="text-zinc-300">{org.country}</span>
                        </div>

                        {org.contactPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-zinc-500" />
                            <span className="text-zinc-300">{org.contactPhone}</span>
                          </div>
                        )}

                        {org.headquarters && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="w-4 h-4 text-zinc-500" />
                            <span className="text-zinc-300">{org.headquarters}</span>
                          </div>
                        )}

                        {org.socials?.website && (
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4 text-zinc-500" />
                            <a 
                              href={org.socials.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-orange-400 hover:text-orange-300"
                            >
                              Website
                            </a>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-zinc-500" />
                          <span className="text-zinc-300">
                            Registered: {new Date(org.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {org.approvalStatus === 'rejected' && org.rejectionReason && (
                        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-3">
                          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-red-300 font-medium mb-1">Rejection Reason:</p>
                            <p className="text-sm text-red-400">{org.rejectionReason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {org.approvalStatus === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(org)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {showModal && selectedOrg && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Review Organization</h2>
                    <p className="text-zinc-400">Review the details and approve or reject</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Organization Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{selectedOrg.orgName}</h3>
                      {getStatusBadge(selectedOrg.approvalStatus)}
                    </div>
                  </div>

                  {selectedOrg.description && (
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                      <p className="text-zinc-300">{selectedOrg.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-800/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-zinc-500" />
                        <span className="text-xs text-zinc-500 uppercase font-semibold">Email</span>
                      </div>
                      <p className="text-white">{selectedOrg.email}</p>
                    </div>

                    <div className="bg-zinc-800/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-zinc-500" />
                        <span className="text-xs text-zinc-500 uppercase font-semibold">Country</span>
                      </div>
                      <p className="text-white">{selectedOrg.country}</p>
                    </div>

                    {selectedOrg.headquarters && (
                      <div className="bg-zinc-800/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-zinc-500" />
                          <span className="text-xs text-zinc-500 uppercase font-semibold">Headquarters</span>
                        </div>
                        <p className="text-white">{selectedOrg.headquarters}</p>
                      </div>
                    )}

                    {selectedOrg.contactPhone && (
                      <div className="bg-zinc-800/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-zinc-500" />
                          <span className="text-xs text-zinc-500 uppercase font-semibold">Phone</span>
                        </div>
                        <p className="text-white">{selectedOrg.contactPhone}</p>
                      </div>
                    )}

                    {selectedOrg.socials?.website && (
                      <div className="bg-zinc-800/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4 text-zinc-500" />
                          <span className="text-xs text-zinc-500 uppercase font-semibold">Website</span>
                        </div>
                        <a 
                          href={selectedOrg.socials.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-400 hover:text-orange-300 break-all"
                        >
                          {selectedOrg.socials.website}
                        </a>
                      </div>
                    )}

                    <div className="bg-zinc-800/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-zinc-500" />
                        <span className="text-xs text-zinc-500 uppercase font-semibold">Registration Date</span>
                      </div>
                      <p className="text-white">
                        {new Date(selectedOrg.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rejection Reason Input (only show when rejecting) */}
                {selectedOrg.approvalStatus === 'pending' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Rejection Reason (optional)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide a reason if rejecting this organization..."
                        rows="4"
                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer - Actions */}
              {selectedOrg.approvalStatus === 'pending' && (
                <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 p-6">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedOrg._id)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Organization
                    </button>
                    <button
                      onClick={() => handleReject(selectedOrg._id)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Organization
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrganizations;