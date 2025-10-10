import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Mail, Building, User, MapPin, Globe, Phone, Calendar, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AegisOrgRejected = ({ organization, reason }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-red-950 relative overflow-hidden mt-[100px]">
      {/* Background Animations */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1.5 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-red-500/30 to-red-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-l from-red-600/25 to-red-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-40 left-1/4 w-72 h-72 bg-gradient-to-t from-red-500/20 to-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-2xl space-y-8 bg-black/20 backdrop-blur-md p-8 rounded-2xl border border-white/10">

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-b from-red-400 via-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                <XCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white">Registration Rejected</h1>
            <p className="text-gray-300 text-lg">
              Unfortunately, your organization registration has been rejected.
            </p>
          </div>

          {/* Rejection Reason */}
          <div className="p-6 bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/30">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-red-300 font-semibold mb-2">Reason for Rejection:</h3>
                <p className="text-red-200">{reason || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Organization Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Your Registration Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-600/50">
                <Building className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Organization Name</p>
                  <p className="text-white font-medium">{organization.orgName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-600/50">
                <Mail className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white font-medium">{organization.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-600/50">
                <User className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="text-gray-400 text-sm">Owner Name</p>
                  <p className="text-white font-medium">{organization.ownerName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-600/50">
                <MapPin className="w-6 h-6 text-red-400" />
                <div>
                  <p className="text-gray-400 text-sm">Country</p>
                  <p className="text-white font-medium">{organization.country}</p>
                </div>
              </div>

              {organization.headquarters && (
                <div className="flex items-center space-x-3 p-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-600/50 md:col-span-2">
                  <MapPin className="w-6 h-6 text-orange-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Headquarters</p>
                    <p className="text-white font-medium">{organization.headquarters}</p>
                  </div>
                </div>
              )}

              {organization.contactPhone && (
                <div className="flex items-center space-x-3 p-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-600/50">
                  <Phone className="w-6 h-6 text-cyan-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Contact Phone</p>
                    <p className="text-white font-medium">{organization.contactPhone}</p>
                  </div>
                </div>
              )}

              {organization.socials?.website && (
                <div className="flex items-center space-x-3 p-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-600/50">
                  <Globe className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Website</p>
                    <p className="text-white font-medium">{organization.socials.website}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 p-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-600/50 md:col-span-2">
                <Calendar className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-gray-400 text-sm">Established Date</p>
                  <p className="text-white font-medium">
                    {new Date(organization.establishedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {organization.description && (
              <div className="p-4 bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-600/50">
                <p className="text-gray-400 text-sm mb-2">Description</p>
                <p className="text-white">{organization.description}</p>
              </div>
            )}
          </div>

          {/* Message */}
          <div className="text-center space-y-4">
            <div className="p-6 bg-blue-500/10 backdrop-blur-sm rounded-xl border border-blue-500/30">
              <p className="text-blue-300 text-lg">
                If you believe this decision was made in error or if you have additional information to provide,
                please contact our support team at support@aegis.com
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <div className="text-center">
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white text-lg font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30"
            >
              <LogOut className="w-6 h-6" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AegisOrgRejected;
