import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Users, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/team-applications/my-applications', {
        credentials: 'include',
      });
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/team-applications/${applicationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Application withdrawn');
        fetchApplications();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to withdraw application');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast.error('Failed to withdraw application');
    }
  };

  const handleOpenTryoutChat = (application) => {
    if (application.tryoutChatId) {
      navigate('/chat', { state: { tryoutChatId: application.tryoutChatId } });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        text: 'Pending Review',
        icon: Clock,
        className: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400',
      },
      in_tryout: {
        text: 'In Tryout',
        icon: Users,
        className: 'bg-blue-500/20 border-blue-400/30 text-blue-400',
      },
      accepted: {
        text: 'Accepted',
        icon: CheckCircle,
        className: 'bg-green-500/20 border-green-400/30 text-green-400',
      },
      rejected: {
        text: 'Rejected',
        icon: XCircle,
        className: 'bg-red-500/20 border-red-400/30 text-red-400',
      },
      withdrawn: {
        text: 'Withdrawn',
        icon: XCircle,
        className: 'bg-zinc-500/20 border-zinc-400/30 text-zinc-400',
      },
    };

    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen pt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans pt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-2">
            My Applications
          </h1>
          <p className="text-zinc-400">Track your team applications and tryout status</p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Applications Yet</h3>
            <p className="text-zinc-400 mb-6">Start applying to teams to see your applications here</p>
            <button
              onClick={() => navigate('/opportunities')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-medium transition-all"
            >
              Browse Teams
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => {
              const statusBadge = getStatusBadge(app.status);
              const StatusIcon = statusBadge.icon;

              return (
                <div key={app._id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={app.team.logo}
                        alt={app.team.teamName}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{app.team.teamName}</h3>
                        <p className="text-zinc-400 text-sm">{app.team.teamTag}</p>
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-2 ${statusBadge.className}`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusBadge.text}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-zinc-400 mb-2">Applying for roles:</p>
                    <div className="flex flex-wrap gap-2">
                      {app.appliedRoles.map(role => (
                        <span key={role} className="px-3 py-1 bg-orange-500/20 border border-orange-400/30 rounded-md text-orange-400 text-sm">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {app.message && (
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-4">
                      <p className="text-sm text-zinc-300">{app.message}</p>
                    </div>
                  )}

                  {app.status === 'rejected' && app.rejectionReason && (
                    <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-300">
                        <strong>Rejection reason:</strong> {app.rejectionReason}
                      </p>
                    </div>
                  )}

                  {app.status === 'accepted' && (
                    <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-3 mb-4">
                      <p className="text-sm text-green-300">
                        Congratulations! You have been accepted to {app.team.teamName}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                    
                    <div className="flex gap-2">
                      {app.status === 'in_tryout' && app.tryoutChatId && (
                        <button
                          onClick={() => handleOpenTryoutChat(app)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Users className="w-4 h-4" />
                          Join Tryout Chat
                        </button>
                      )}
                      
                      {app.status === 'pending' && (
                        <button
                          onClick={() => handleWithdraw(app._id)}
                          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;