import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Users, UserPlus, UserCheck, UserX, Search, Filter, MessageCircle,
  Star, Trophy, MapPin, Calendar, Eye, Share2, CheckCircle, XCircle,
  Clock, Mail, Globe, Activity, Award, Target, Gamepad2, Send,
  ArrowRight, UserMinus, MoreHorizontal, Bell, Shield
} from 'lucide-react';

const Connections = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/connections", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
        setPendingRequests(data.pendingRequests || []);
      }
    } catch (err) {
      console.error("Error fetching connections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (playerId, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/connections/${action}/${playerId}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setPendingRequests((prev) => prev.filter((req) => req._id !== playerId));
        if (action === "accept") {
          const acceptedUser = pendingRequests.find((req) => req._id === playerId);
          setConnections((prev) => [...prev, acceptedUser]);
        }
      }
    } catch (err) {
      console.error(`Error ${action} request:`, err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const TabButton = ({ id, label, count, isActive, onClick, icon: Icon }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-3 px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30'
          : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
      {count > 0 && (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          isActive ? 'bg-white/20' : 'bg-orange-500/20 text-orange-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const ConnectionCard = ({ connection, type = 'connection' }) => (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 hover:border-orange-500/40 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={connection.avatar || `https://placehold.co/80x80/4A5568/FFFFFF?text=${connection.username?.charAt(0) || 'U'}`}
              alt={connection.username}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-zinc-700 group-hover:ring-orange-500/50 transition-colors"
            />
            {connection.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-zinc-800 rounded-full animate-pulse" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">{connection.name || connection.username}</h3>
              {connection.verified && (
                <Shield className="w-4 h-4 text-amber-400" title="Verified Player" />
              )}
            </div>
            <p className="text-orange-400 font-medium text-sm mb-1">{connection.role || 'Player'}</p>
            <div className="flex items-center gap-4 text-zinc-400 text-sm">
              {connection.team && (
                <span className="flex items-center gap-1">
                  <Gamepad2 className="w-4 h-4" />
                  {connection.team}
                </span>
              )}
              {connection.region && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {connection.region}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group">
            <MoreHorizontal className="w-4 h-4 text-zinc-300 group-hover:text-orange-400" />
          </button>
        </div>
      </div>

      {(connection.aegisRating || connection.stats) && (
        <div className="flex items-center gap-6 mb-4">
          {connection.aegisRating && (
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">{connection.aegisRating}</div>
              <div className="text-zinc-500 text-xs">Rating</div>
            </div>
          )}
          {connection.mutualConnections && (
            <div className="text-center">
              <div className="text-lg font-bold text-blue-400">{connection.mutualConnections}</div>
              <div className="text-zinc-500 text-xs">Mutual</div>
            </div>
          )}
          {connection.achievements?.length && (
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400">{connection.achievements.length}</div>
              <div className="text-zinc-500 text-xs">Awards</div>
            </div>
          )}
        </div>
      )}

      {connection.achievements?.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {connection.achievements.slice(0, 2).map((achievement, index) => (
              <span key={index} className="bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded-full border border-amber-500/30">
                {achievement}
              </span>
            ))}
            {connection.achievements.length > 2 && (
              <span className="text-zinc-500 text-xs px-2 py-1">+{connection.achievements.length - 2} more</span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <Activity className="w-4 h-4" />
          {connection.lastActive || connection.requestDate || 'Recently active'}
        </div>

        {type === 'pending' ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(connection._id, "accept")}
              className="bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => handleAction(connection._id, "reject")}
              className="bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button className="bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 hover:text-orange-400 p-2 rounded-lg transition-colors">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button className="bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300 hover:text-orange-400 p-2 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/chat', { state: { selectedUserId: connection._id } })}
              className="bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
            >
              <Send className="w-4 h-4" />
              Message
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const filteredConnections = connections.filter(conn => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      (conn.name?.toLowerCase().includes(searchTerm)) ||
      (conn.username?.toLowerCase().includes(searchTerm)) ||
      (conn.team?.toLowerCase().includes(searchTerm))
    );
  });

  const onlineConnections = connections.filter(conn => conn.isOnline);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-zinc-400 text-lg">Loading your connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px]">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Your Network</h1>
              <p className="text-zinc-400">Manage your professional esports connections</p>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-zinc-900/50 border border-orange-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">{connections.length}</div>
              <div className="text-zinc-400 text-sm">Total Connections</div>
            </div>
            <div className="bg-zinc-900/50 border border-green-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{onlineConnections.length}</div>
              <div className="text-zinc-400 text-sm">Online Now</div>
            </div>
            <div className="bg-zinc-900/50 border border-blue-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{pendingRequests.length}</div>
              <div className="text-zinc-400 text-sm">Pending Requests</div>
            </div>
            <div className="bg-zinc-900/50 border border-purple-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {connections.reduce((sum, c) => sum + (c.mutualConnections || 0), 0)}
              </div>
              <div className="text-zinc-400 text-sm">Mutual Connections</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-400 focus:border-orange-500/50 focus:outline-none"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:outline-none"
            >
              <option value="all">All Connections</option>
              <option value="online">Online Only</option>
              <option value="teammates">Teammates</option>
              <option value="recent">Recently Active</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton 
            id="connections" 
            label="Connections" 
            count={connections.length}
            isActive={activeTab === 'connections'} 
            onClick={setActiveTab}
            icon={Users}
          />
          <TabButton 
            id="pending" 
            label="Pending Requests" 
            count={pendingRequests.length}
            isActive={activeTab === 'pending'} 
            onClick={setActiveTab}
            icon={Clock}
          />
          <TabButton 
            id="sent" 
            label="Sent Requests" 
            count={0}
            isActive={activeTab === 'sent'} 
            onClick={setActiveTab}
            icon={Send}
          />
          <TabButton 
            id="suggestions" 
            label="Suggested" 
            count={0}
            isActive={activeTab === 'suggestions'} 
            onClick={setActiveTab}
            icon={UserPlus}
          />
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'connections' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Your Connections ({filteredConnections.length})</h2>
                <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium px-6 py-3 rounded-lg transition-all flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Find New Connections
                </button>
              </div>
              
              {filteredConnections.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-24 h-24 text-zinc-600 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-2">No connections found</h3>
                  <p className="text-zinc-400 mb-6">Start building your professional network by connecting with other players</p>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                    Explore Players
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredConnections.map((connection) => (
                    <ConnectionCard key={connection._id} connection={connection} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Pending Connection Requests ({pendingRequests.length})</h2>
              </div>
              
              {pendingRequests.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="w-24 h-24 text-zinc-600 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-2">No pending requests</h3>
                  <p className="text-zinc-400">New connection requests will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingRequests.map((request) => (
                    <ConnectionCard key={request._id} connection={request} type="pending" />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="text-center py-16">
              <Send className="w-24 h-24 text-zinc-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">No sent requests</h3>
              <p className="text-zinc-400">Connection requests you send will appear here</p>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="text-center py-16">
              <UserPlus className="w-24 h-24 text-zinc-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">No suggestions available</h3>
              <p className="text-zinc-400">We'll suggest new connections based on your activity</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/30">
            Discover New Players
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-8 py-3 rounded-lg transition-colors border border-orange-400/30">
            Import Contacts
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-6 py-3 rounded-lg transition-colors border border-zinc-600 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Connections;