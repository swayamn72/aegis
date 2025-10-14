import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Trophy, Users, Calendar, Settings, Upload, Bell, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import ToastConfig from '../components/ToastConfig';

const OrgDashboard = () => {
  const [organization, setOrganization] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchOrganizationData();
    fetchTournaments();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/organizations/profile', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch organization profile');
      const data = await response.json();
      setOrganization(data.organization);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/org-tournaments/my-tournaments', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTournaments(data.tournaments || []);
      }
    } catch (err) {
      console.error('Error fetching tournaments:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleLogoChange = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('http://localhost:5000/api/organizations/upload-logo', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload logo');

      const data = await response.json();
      setOrganization((prev) => ({
        ...prev,
        logo: data.logoUrl,
      }));
    } catch (err) {
      console.error('Logo upload error:', err);
      alert('Error uploading logo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, text: 'Pending Approval' },
      approved: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, text: 'Rejected' }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const getTournamentStatusBadge = (status) => {
    const colors = {
      announced: 'bg-blue-500/20 text-blue-400',
      registration_open: 'bg-green-500/20 text-green-400',
      in_progress: 'bg-red-500/20 text-red-400',
      completed: 'bg-gray-500/20 text-gray-400'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[status] || colors.announced}`}>
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  if (!organization) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">No organization data available.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ToastConfig />
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{organization.orgName}</h1>
            {getStatusBadge(organization.approvalStatus)}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex gap-6">
            {(organization.approvalStatus === 'approved' ? ['overview', 'tournaments', 'teams', 'settings'] : ['overview']).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 transition ${activeTab === tab
                    ? 'border-orange-500 text-orange-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Organization Profile */}
            <div className="bg-gray-800 rounded-lg p-6 flex gap-6">
              <div
                className="w-48 h-48 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:bg-gray-600 transition"
                onClick={handleLogoChange}
                title="Click to upload logo"
              >
                {organization.logo ? (
                  <img
                    src={organization.logo}
                    alt={`${organization.orgName} logo`}
                    className="object-contain max-h-full"
                  />
                ) : (
                  <Upload className="w-12 h-12 text-gray-500" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">Uploading...</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-gray-300">{organization.description || 'No description provided.'}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-gray-400 text-sm">Owner</p>
                    <p className="font-semibold">{organization.ownerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Country</p>
                    <p className="font-semibold">{organization.country}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Headquarters</p>
                    <p className="font-semibold">{organization.headquarters || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Established</p>
                    <p className="font-semibold">
                      {new Date(organization.establishedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 flex items-center gap-4">
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <Trophy className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Tournaments</p>
                  <p className="text-2xl font-bold">{tournaments.length}</p>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 flex items-center gap-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Teams</p>
                  <p className="text-2xl font-bold">{organization.teams?.length || 0}</p>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 flex items-center gap-4">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <Calendar className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Active Tournaments</p>
                  <p className="text-2xl font-bold">
                    {tournaments.filter(t => t.status === 'in_progress' || t.status === 'registration_open').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Approval Status Message */}
            {organization.approvalStatus === 'pending' && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-yellow-400 font-semibold">⏳ Pending Admin Approval</p>
                <p className="text-gray-300 text-sm mt-1">
                  Your organization is awaiting approval from an administrator. You'll be able to access all features once approved.
                </p>
              </div>
            )}

            {organization.approvalStatus === 'rejected' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 font-semibold">❌ Registration Rejected</p>
                <p className="text-gray-300 text-sm mt-1">
                  <strong>Reason:</strong> {organization.rejectionReason || 'Not specified'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tournaments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Tournaments</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-4 py-2 rounded-lg flex items-center gap-2 transition"
                disabled={organization.approvalStatus !== 'approved'}
              >
                <Plus className="w-4 h-4" />
                Create Tournament
              </button>
            </div>

            {tournaments.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Tournaments Yet</h3>
                <p className="text-gray-400">Create your first tournament to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament) => {
                  const isPending = tournament._approvalStatus === 'pending';
                  const isRejected = tournament._approvalStatus === 'rejected';
                  const isApproved = tournament._approvalStatus === 'approved';
                  return (
                    <div key={tournament._id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition relative">
                      <div className="h-32 bg-gradient-to-br from-orange-500 to-red-500 relative">
                        {tournament.media?.banner && (
                          <img src={tournament.media.banner} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      {/* Status Box for Pending/Rejected */}
                      {(isPending || isRejected) && (
                        <div className={`absolute top-4 left-4 right-4 z-10 rounded-lg px-4 py-3 flex items-center gap-2 shadow-lg border ${isPending ? 'bg-yellow-900/80 border-yellow-500/40' : 'bg-red-900/80 border-red-500/40'}`}>
                          {isPending && (
                            <>
                              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                              </svg>
                              <span className="text-yellow-300 font-semibold">Pending Admin Approval</span>
                            </>
                          )}
                          {isRejected && (
                            <>
                              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span className="text-red-300 font-semibold">Rejected</span>
                              {tournament.rejectionReason && (
                                <span className="ml-2 text-xs text-red-200">Reason: {tournament.rejectionReason}</span>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg">{tournament.tournamentName}</h3>
                          {getTournamentStatusBadge(tournament.status)}
                        </div>
                        <p className="text-gray-400 text-sm mb-4">
                          {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">
                            {tournament.participatingTeams?.length || 0}/{tournament.slots?.total || 0} Teams
                          </span>
                          {isApproved && (
                            <button
                              onClick={() => navigate('/org/tournaments')}
                              className="text-orange-500 hover:text-orange-400"
                            >
                              Manage →
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
        )}

        {activeTab === 'teams' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Organization Teams</h2>
            {organization.teams && organization.teams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {organization.teams.map((team) => (
                  <div key={team._id} className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                      {team.logo ? (
                        <img src={team.logo} alt={team.teamName} className="object-contain max-h-full" />
                      ) : (
                        <Users className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{team.teamName}</h3>
                      <p className="text-gray-400 text-sm">{team.teamTag}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No teams available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-400">Settings and configuration options coming soon...</p>
            </div>
          </div>
        )}
      </main>

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <CreateTournamentModal
          organization={organization}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTournaments();
          }}
        />
      )}


    </div>
  );
};

const CreateTournamentModal = ({ organization, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    tournamentName: '',
    shortName: '',
    gameTitle: 'BGMI',
    tier: 'Community',
    region: 'India',
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    description: '',
    format: 'Battle Royale Points System',
    slots: { total: 16, invited: 0, fromQualifiers: 0, openRegistrations: 16 },
    prizePool: { total: 0, currency: 'INR', distribution: [] },
    phases: [],
    gameSettings: {
      serverRegion: 'India',
      gameMode: 'TPP Squad',
      maps: ['Erangel', 'Miramar'],
      pointsSystem: {
        killPoints: 1,
        placementPoints: { 1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1 }
      }
    }
  });
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState({ logo: null, banner: null, coverImage: null });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleFileChange = (field, file) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const addPhase = () => {
    const newPhase = {
      name: `Phase ${formData.phases.length + 1}`,
      type: 'qualifiers',
      startDate: '',
      endDate: '',
      status: 'upcoming',
      details: '',
      groups: []
    };
    setFormData(prev => ({
      ...prev,
      phases: [...prev.phases, newPhase]
    }));
  };

  const updatePhase = (index, field, value) => {
    const updatedPhases = [...formData.phases];
    updatedPhases[index] = { ...updatedPhases[index], [field]: value };
    setFormData(prev => ({ ...prev, phases: updatedPhases }));
  };

  const removePhase = (index) => {
    setFormData(prev => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      if (!formData.tournamentName || formData.tournamentName.trim() === '') {
        toast.error('Tournament Name is required.');
        setUploading(false);
        return;
      }
      const formDataToSend = new FormData();
      formDataToSend.append('tournamentData', JSON.stringify(formData));

      if (files.logo) formDataToSend.append('logo', files.logo);
      if (files.banner) formDataToSend.append('banner', files.banner);
      if (files.coverImage) formDataToSend.append('coverImage', files.coverImage);

      const response = await fetch('http://localhost:5000/api/org-tournaments/create-tournament', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to create tournament');

      toast.success('Tournament submitted for admin approval!');
      onSuccess();
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Error creating tournament: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
          <h2 className="text-2xl font-bold">Create Tournament</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= s ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-orange-500' : 'bg-gray-700'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Only one set of Tournament Name and Short Name inputs should be present */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tournament Name *</label>
                  <input
                    type="text"
                    value={formData.tournamentName}
                    onChange={(e) => handleInputChange('tournamentName', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="BGMI Winter Championship 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Short Name</label>
                  <input
                    type="text"
                    value={formData.shortName}
                    onChange={(e) => handleInputChange('shortName', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    placeholder="BWC 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Game *</label>
                  <select
                    value={formData.gameTitle}
                    onChange={(e) => handleInputChange('gameTitle', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="BGMI">BGMI</option>
                    <option value="Multi-Game">Multi-Game</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tier</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => handleInputChange('tier', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="Community">Community</option>
                    <option value="C">C-Tier</option>
                    <option value="B">B-Tier</option>
                    <option value="A">A-Tier</option>
                    <option value="S">S-Tier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Region *</label>
                  <select
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="India">India</option>
                    <option value="Asia">Asia</option>
                    <option value="South Asia">South Asia</option>
                    <option value="Global">Global</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Total Slots *</label>
                  <input
                    type="number"
                    value={formData.slots.total}
                    onChange={(e) => handleNestedChange('slots', 'total', parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    min="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>

              </div>

              {/* Open for All Checkbox */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isOpenForAll || false}
                  onChange={(e) => handleInputChange('isOpenForAll', e.target.checked)}
                  className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                />
                <label className="text-sm font-medium text-gray-300">
                  Is this tournament open for all?
                </label>
              </div>

              {/* Conditional Registration Dates */}
              {formData.isOpenForAll && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Registration Start Date</label>
                    <input
                      type="date"
                      value={formData.registrationStartDate}
                      onChange={(e) => handleInputChange('registrationStartDate', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Registration End Date</label>
                    <input
                      type="date"
                      value={formData.registrationEndDate}
                      onChange={(e) => handleInputChange('registrationEndDate', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white h-24"
                  placeholder="Describe your tournament..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prize Pool (INR)</label>
                <input
                  type="number"
                  value={formData.prizePool.total}
                  onChange={(e) => handleNestedChange('prizePool', 'total', parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Step 2: Phases */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Tournament Phases</h3>
                <button
                  onClick={addPhase}
                  className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Phase
                </button>
              </div>

              {formData.phases.length === 0 ? (
                <div className="bg-gray-700 rounded-lg p-8 text-center">
                  <p className="text-gray-400">No phases added yet. Click "Add Phase" to create tournament stages.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.phases.map((phase, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold">Phase {index + 1}</h4>
                        <button
                          onClick={() => removePhase(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm mb-1">Phase Name</label>
                          <input
                            type="text"
                            value={phase.name}
                            onChange={(e) => updatePhase(index, 'name', e.target.value)}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">Type</label>
                          <select
                            value={phase.type}
                            onChange={(e) => updatePhase(index, 'type', e.target.value)}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                          >
                            <option value="qualifiers">Qualifiers</option>
                            <option value="final_stage">Final Stage</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm mb-1">Start Date</label>
                          <input
                            type="date"
                            value={phase.startDate}
                            onChange={(e) => updatePhase(index, 'startDate', e.target.value)}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1">End Date</label>
                          <input
                            type="date"
                            value={phase.endDate}
                            onChange={(e) => updatePhase(index, 'endDate', e.target.value)}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm mb-1">Details (e.g., "Top 8 teams qualify")</label>
                          <input
                            type="text"
                            value={phase.details}
                            onChange={(e) => updatePhase(index, 'details', e.target.value)}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            placeholder="Top 8 teams advance to next round"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Media & Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Media & Final Review</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Tournament Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('logo', e.target.files[0])}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('banner', e.target.files[0])}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('coverImage', e.target.files[0])}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4 mt-6">
                <h4 className="font-semibold mb-3">Tournament Summary</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-400">Name:</span> {formData.tournamentName}</p>
                  <p><span className="text-gray-400">Game:</span> {formData.gameTitle}</p>
                  <p><span className="text-gray-400">Region:</span> {formData.region}</p>
                  <p><span className="text-gray-400">Slots:</span> {formData.slots.total} teams</p>
                  <p><span className="text-gray-400">Prize Pool:</span> ₹{formData.prizePool.total.toLocaleString()}</p>
                  <p><span className="text-gray-400">Phases:</span> {formData.phases.length}</p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                <p className="text-yellow-400 text-sm font-semibold">⚠️ Admin Approval Required</p>
                <p className="text-gray-300 text-sm mt-1">
                  Your tournament will be submitted for admin approval. Once approved, it will be visible to teams and you can start inviting participants.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-700">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-orange-500 rounded hover:bg-orange-600"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {uploading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgDashboard;