import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  ArrowLeft, Users, Trophy, Calendar, MapPin, Shield,
  Award, Star, Target, TrendingUp, Share2, MessageCircle,
  Check, Gamepad2, Briefcase, Copy, Twitter, Youtube,
  Twitch, Lock, Eye, EyeOff, Edit, UserPlus, Upload,
  Search, X, Send
} from 'lucide-react';
import { FaDiscord } from "react-icons/fa"

const DetailedTeamInfo = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);

  // Captain functionality states
  const [showEditLogoModal, setShowEditLogoModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(false);

  // Check if current user is the captain
  const isCaptain = user && teamData && teamData.captain && user._id === teamData.captain._id;

  // Handle logo upload
  const handleLogoUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', selectedFile);

      const response = await fetch(`/api/teams/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setTeamData(prev => ({ ...prev, logo: data.team.logo }));
        setShowEditLogoModal(false);
        setSelectedFile(null);
        toast.success('Team logo updated successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update team logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  // Handle player search
  const handlePlayerSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/teams/search/${encodeURIComponent(query)}?searchType=players`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.players || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching players:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Handle sending invitation
  const handleSendInvitation = async () => {
    if (!selectedPlayer) {
      toast.error('Please select a player to invite');
      return;
    }

    setInviting(true);
    try {
      const response = await fetch(`/api/teams/${id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          playerId: selectedPlayer._id,
          message: inviteMessage || `Join ${teamData.teamName}!`,
        }),
      });

      if (response.ok) {
        toast.success('Invitation sent successfully!');
        setShowInviteModal(false);
        setSelectedPlayer(null);
        setInviteMessage('');
        setSearchQuery('');
        setSearchResults([]);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  // Fetch team data from API
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsPrivate(false);

        const response = await fetch(`/api/teams/${id}`, {
          credentials: 'include',
        });

        if (response.status === 403) {
          // Handle private team specifically
          const errorData = await response.json();
          setIsPrivate(true);
          setError(errorData.message || 'This team profile is private');
        } else if (!response.ok) {
          throw new Error('Failed to fetch team data');
        } else {
          const data = await response.json();
          setTeamData(data.team);
        }
      } catch (err) {
        setError(err.message);
        setIsPrivate(false);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeamData();
    }
  }, [id]);

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${isActive
        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30'
        : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white'
        }`}
    >
      {label}
    </button>
  );

  const StatCard = ({ icon: Icon, label, value, sublabel, color = "orange" }) => (
    <div className={`bg-zinc-800/50 border border-${color}-400/30 rounded-xl p-4 shadow-lg shadow-${color}-500/10`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <div className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</div>
      <div className="text-zinc-400 text-sm">{label}</div>
      {sublabel && <div className="text-zinc-500 text-xs mt-1">{sublabel}</div>}
    </div>
  );

  const PlayerCard = ({ player }) => (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-orange-500/40 transition-colors group">
      <div className="flex items-center gap-4 mb-3">
        <img
          src={player.profilePicture || `https://placehold.co/64x64/4A5568/FFFFFF?text=${player.username?.charAt(0) || 'P'}`}
          alt={player.username}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-700 group-hover:ring-orange-500/50 transition-colors"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-semibold">{player.inGameName || player.username}</span>
            {player.verified && (
              <Shield className="w-4 h-4 text-amber-400" title="Verified Player" />
            )}
          </div>
          <div className="text-zinc-400 text-sm">{player.realName}</div>
        </div>
        <div className="text-right">
          <div className="text-orange-400 font-semibold text-sm">
            {player.inGameRole?.join(', ') || 'Player'}
          </div>
          <div className="text-zinc-500 text-xs">{player.aegisRating || 0}</div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-zinc-400 flex items-center gap-1">
          <Trophy className="w-3 h-3 text-amber-400" />
          {player.tournamentsPlayed || 0} Tournaments
        </div>
        <div className="text-xs text-zinc-400 flex items-center gap-1">
          <Target className="w-3 h-3 text-green-400" />
          {player.matchesPlayed || 0} Matches
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-zinc-400 text-lg">Loading team information...</p>
        </div>
      </div>
    );
  }

  if (isPrivate) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-full flex items-center justify-center border border-zinc-700/50 backdrop-blur-sm">
              <Lock size={48} className="text-zinc-500" />
            </div>
            <div className="absolute inset-0 bg-zinc-500/20 blur-xl rounded-full"></div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Private Team Profile</h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              This team profile is set to private and can only be viewed by team members.
            </p>

            <div className="flex flex-col gap-4 pt-6">
              <button
                onClick={() => window.history.back()}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">Error loading team data</div>
          <p className="text-zinc-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">Team not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans">
      <div className="container mx-auto px-6 py-8 pt-20">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => window.history.back()}
            className="p-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Team Profile</h1>
            <p className="text-zinc-400">Professional Esports Team</p>
          </div>
        </div>

        {/* Team Header */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left Side - Team Info */}
            <div className="flex-1">
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <img
                    src={teamData.logo || `https://placehold.co/120x120/4A5568/FFFFFF?text=${teamData.teamTag || teamData.teamName?.charAt(0) || 'T'}`}
                    alt={teamData.teamName}
                    className="w-24 h-24 rounded-xl object-contain bg-zinc-800/50 p-2"
                  />
                  {teamData.verified && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 p-2 rounded-full shadow-lg shadow-orange-400/50">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-white">{teamData.teamName}</h1>
                    {teamData.teamTag && (
                      <span className="bg-orange-500/20 border border-orange-500/30 rounded-lg px-3 py-1 text-orange-400 font-bold">
                        {teamData.teamTag}
                      </span>
                    )}
                    <div className="flex gap-2">
                      <button className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group">
                        <Share2 className="w-5 h-5 text-zinc-300 group-hover:text-orange-400" />
                      </button>
                      <button className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group">
                        <MessageCircle className="w-5 h-5 text-zinc-300 group-hover:text-orange-400" />
                      </button>
                      {isCaptain && (
                        <>
                          <button
                            onClick={() => setShowEditLogoModal(true)}
                            className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group"
                            title="Edit Team Logo"
                          >
                            <Edit className="w-5 h-5 text-zinc-300 group-hover:text-orange-400" />
                          </button>
                          <button
                            onClick={() => setShowInviteModal(true)}
                            className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group"
                            title="Invite Players"
                          >
                            <UserPlus className="w-5 h-5 text-zinc-300 group-hover:text-orange-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-zinc-400 mb-4">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {teamData.region || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Est. {new Date(teamData.establishedDate).getFullYear()}
                    </span>
                    <span className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4" />
                      {teamData.primaryGame}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {teamData.players?.length || 0} Players
                    </span>
                  </div>

                  <p className="text-zinc-300 text-sm mb-6 max-w-2xl">{teamData.bio || 'Professional esports team competing at the highest level.'}</p>

                  {/* Social Links */}
                  <div className="flex gap-3">
                    {teamData.socials?.discord && (
                      <button className="flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg px-3 py-2 text-indigo-400 hover:bg-indigo-600/30 transition-colors">
                        <FaDiscord className="w-4 h-4" />
                        Discord
                      </button>
                    )}
                    {teamData.socials?.twitter && (
                      <button className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-400 hover:bg-blue-600/30 transition-colors">
                        <Twitter className="w-4 h-4" />
                        Twitter
                      </button>
                    )}
                    {teamData.socials?.youtube && (
                      <button className="flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 hover:bg-red-600/30 transition-colors">
                        <Youtube className="w-4 h-4" />
                        YouTube
                      </button>
                    )}
                    {teamData.socials?.twitch && (
                      <button className="flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-400 hover:bg-purple-600/30 transition-colors">
                        <Twitch className="w-4 h-4" />
                        Twitch
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Quick Stats */}
            <div className="lg:w-80">
              <div className="bg-gradient-to-r from-orange-600/20 to-red-500/20 border border-orange-400/30 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <span className="text-amber-400 font-semibold text-lg">Total Earnings</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">
                    ₹{((teamData.totalEarnings || 0) / 100000).toFixed(1)}L
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Aegis Rating: {teamData.aegisRating || 0}</span>
                </div>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-400" />
                  Team Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Captain</span>
                    <span className="text-white font-medium text-sm">
                      {teamData.captain?.inGameName || teamData.captain?.username || 'TBA'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Roster Size</span>
                    <span className="text-orange-400 font-medium text-sm">
                      {teamData.players?.length || 0}/5
                    </span>
                  </div>
                  {teamData.organization && (
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 text-sm">Organization</span>
                      <span className="text-blue-400 font-medium text-sm">
                        {teamData.organization.orgName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6 mt-6">
            <StatCard
              icon={Trophy}
              label="Total Earnings"
              value={`₹${((teamData.totalEarnings || 0) / 100000).toFixed(1)}L`}
              color="green"
            />
            <StatCard
              icon={Target}
              label="Aegis Rating"
              value={teamData.aegisRating || 0}
              color="orange"
            />
            <StatCard
              icon={Users}
              label="Active Players"
              value={teamData.players?.length || 0}
              color="blue"
            />
            <StatCard
              icon={Star}
              label="Qualified Events"
              value={teamData.qualifiedEvents?.length || 0}
              color="purple"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
          <TabButton id="roster" label="Current Roster" isActive={activeTab === 'roster'} onClick={setActiveTab} />
          <TabButton id="achievements" label="Achievements" isActive={activeTab === 'achievements'} onClick={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Team Stats */}
              <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                  Team Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">
                      ₹{((teamData.totalEarnings || 0) / 100000).toFixed(1)}L
                    </div>
                    <div className="text-zinc-400 text-sm">Total Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{teamData.aegisRating || 0}</div>
                    <div className="text-zinc-400 text-sm">Aegis Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{teamData.players?.length || 0}</div>
                    <div className="text-zinc-400 text-sm">Active Players</div>
                  </div>
                </div>
              </div>

              {/* Organization Info */}
              {teamData.organization && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-orange-400" />
                    Organization
                  </h3>
                  <div className="text-center">
                    <img
                      src={teamData.organization.logo || `https://placehold.co/80x80/4A5568/FFFFFF?text=${teamData.organization.orgName?.charAt(0) || 'O'}`}
                      alt={teamData.organization.orgName}
                      className="w-16 h-16 rounded-xl mx-auto mb-4"
                    />
                    <h4 className="text-lg font-bold text-white mb-2">{teamData.organization.orgName}</h4>
                    <p className="text-zinc-400 text-sm mb-4">
                      {teamData.organization.description || 'Professional Esports Organization'}
                    </p>
                    <div className="text-sm text-zinc-500">
                      Est. {new Date(teamData.organization.establishedDate).getFullYear()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'roster' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Current Roster</h2>

              {(!teamData.players || teamData.players.length === 0) ? (
                <div className="text-center py-16">
                  <Users className="w-24 h-24 text-zinc-600 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-2">No roster information available</h3>
                  <p className="text-zinc-400">Team roster will be displayed here once available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamData.players.map(player => (
                    <PlayerCard key={player._id} player={player} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Achievements & Awards</h2>

              {(!teamData.qualifiedEvents || teamData.qualifiedEvents.length === 0) ? (
                <div className="text-center py-16">
                  <Award className="w-24 h-24 text-zinc-600 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-2">No achievements yet</h3>
                  <p className="text-zinc-400">Team achievements and awards will be displayed here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamData.qualifiedEvents.map((event, index) => (
                    <div key={index} className="bg-zinc-800/50 border border-amber-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-6 h-6 text-amber-400" />
                        <span className="text-white font-semibold">{event}</span>
                      </div>
                      <p className="text-zinc-400 text-sm">Qualified Event</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/30">
            Contact Team
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-8 py-3 rounded-lg transition-colors border border-orange-400/30">
            Follow Team
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-6 py-3 rounded-lg transition-colors border border-zinc-600 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Team
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-6 py-3 rounded-lg transition-colors border border-zinc-600 flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Copy Team URL
          </button>
        </div>

        {/* Edit Logo Modal */}
        {showEditLogoModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Edit Team Logo</h3>
                <button
                  onClick={() => setShowEditLogoModal(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-zinc-800/50 rounded-xl flex items-center justify-center">
                    {selectedFile ? (
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      <Upload className="w-8 h-8 text-zinc-400" />
                    )}
                  </div>
                  <p className="text-zinc-400 text-sm mb-4">
                    Upload a new logo for your team (PNG, JPG, max 5MB)
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditLogoModal(false)}
                    className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogoUpload}
                    disabled={!selectedFile || uploading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invite Players Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Invite Players</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search players by username or name..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handlePlayerSearch(e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:border-orange-500 focus:outline-none"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-400"></div>
                    </div>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {searchResults.map(player => (
                    <div
                      key={player._id}
                      onClick={() => setSelectedPlayer(player)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedPlayer?._id === player._id
                        ? 'bg-orange-500/20 border border-orange-500/30'
                        : 'bg-zinc-800/50 hover:bg-zinc-700/50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={player.profilePicture || `https://placehold.co/40x40/4A5568/FFFFFF?text=${player.username?.charAt(0) || 'P'}`}
                          alt={player.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="text-white font-medium">{player.inGameName || player.username}</div>
                          <div className="text-zinc-400 text-sm">{player.realName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-orange-400 text-sm font-medium">
                            Rating: {player.aegisRating || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchQuery && searchResults.length === 0 && !searching && (
                    <div className="text-center py-8 text-zinc-400">
                      No players found matching "{searchQuery}"
                    </div>
                  )}
                </div>

                {selectedPlayer && (
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Invitation Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-zinc-400 text-sm mb-1">Inviting:</label>
                        <div className="text-white font-medium">{selectedPlayer.inGameName || selectedPlayer.username}</div>
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-sm mb-1">Custom Message (Optional):</label>
                        <textarea
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          placeholder={`Join ${teamData.teamName}!`}
                          className="w-full p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:border-orange-500 focus:outline-none resize-none"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendInvitation}
                    disabled={!selectedPlayer || inviting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {inviting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailedTeamInfo;