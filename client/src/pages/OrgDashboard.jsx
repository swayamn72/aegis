import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OrgDashboard = () => {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchOrganizationProfile = async () => {
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

    fetchOrganizationProfile();
  }, []);

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Failed to upload logo: ${response.status} ${errorText}`);
      }

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

  if (loading) {
    return <div className="p-8 text-white">Loading organization data...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (!organization) {
    return <div className="p-8 text-white">No organization data available.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">{organization.orgName}</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
        >
          Logout
        </button>
      </header>

      <section className="mb-8 flex space-x-8">
        <div
          className="w-48 h-48 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative cursor-pointer"
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
            <span className="text-gray-500">No Logo</span>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold">
              Uploading...
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
        <div className="flex-1">
          <p className="mb-2">{organization.description || 'No description provided.'}</p>
          <p>
            <strong>Owner:</strong> {organization.ownerName}
          </p>
          <p>
            <strong>Country:</strong> {organization.country}
          </p>
          <p>
            <strong>Headquarters:</strong> {organization.headquarters || 'N/A'}
          </p>
          <p>
            <strong>Contact Phone:</strong> {organization.contactPhone || 'N/A'}
          </p>
          <p>
            <strong>Established:</strong>{' '}
            {new Date(organization.establishedDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Approval Status:</strong>{' '}
            <span
              className={`font-semibold ${
                organization.approvalStatus === 'approved'
                  ? 'text-green-400'
                  : organization.approvalStatus === 'pending'
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}
            >
              {organization.approvalStatus}
            </span>
          </p>
          {organization.approvalStatus === 'rejected' && (
            <p>
              <strong>Rejection Reason:</strong> {organization.rejectionReason || 'Not specified'}
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Teams</h2>
        {organization.teams && organization.teams.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {organization.teams.map((team) => (
              <li
                key={team._id}
                className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4"
              >
                <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden flex items-center justify-center">
                  {team.logo ? (
                    <img
                      src={team.logo}
                      alt={team.teamName}
                      className="object-contain max-h-full"
                    />
                  ) : (
                    <span className="text-gray-500">No Logo</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{team.teamName}</h3>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No teams available.</p>
        )}
      </section>
    </div>
  );
};

export default OrgDashboard;
