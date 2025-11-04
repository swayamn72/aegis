import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Search, Users, Plus, MessageSquare } from 'lucide-react';

const CommunitiesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCommunities, setFilteredCommunities] = useState([]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await axios.get('/api/communities');
        setCommunities(res.data);
        setFilteredCommunities(res.data);
      } catch (error) {
        console.error('Error fetching communities:', error);
      }
    };
    fetchCommunities();
  }, []);

  useEffect(() => {
    const filtered = communities.filter((community) =>
      community.name && community.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCommunities(filtered);
  }, [searchTerm, communities]);

  const handleJoin = async (communityId) => {
    if (!isAuthenticated) {
      alert('Please login to join a community.');
      return;
    }
    try {
      await axios.put(`/api/communities/${communityId}/join`);
      // Update local state to reflect new member count
      setCommunities((prev) =>
        prev.map((com) =>
          com._id === communityId
            ? { ...com, membersCount: com.membersCount + 1 }
            : com
        )
      );
    } catch (error) {
      console.error('Error joining community:', error);
      alert('Failed to join community.');
    }
  };

  const formatMemberCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-black text-white font-[Inter] relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-[0.15]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none"></div>

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <main className="flex-1 max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-2">
              <span className="text-zinc-500">ALL</span>{" "}
              <span className="text-[#FF4500]">COMMUNITIES</span>
            </h1>
            <p className="text-zinc-600 text-sm uppercase tracking-[0.3em] font-medium">
              DISCOVER • CONNECT • ENGAGE
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent text-white placeholder-zinc-400"
              />
            </div>
          </div>

          {/* Communities Grid */}
          {filteredCommunities.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-zinc-400 text-lg mb-2">No communities found</p>
              <p className="text-zinc-600 text-sm">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <div
                  key={community._id}
                  className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 hover:border-zinc-800 transition-all group"
                >
                  {/* Community Header */}
                  <div className="flex items-center gap-4 mb-4">
                    {community.image ? (
                      <img
                        src={community.image}
                        alt={community.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-zinc-700"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {community.name?.[0]?.toUpperCase() || 'C'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <NavLink
                        to={`/community/${community._id}`}
                        className="text-lg font-bold text-white hover:text-[#FF4500] transition-colors block truncate"
                      >
                        {community.name}
                      </NavLink>
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{formatMemberCount(community.membersCount || 0)} members</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-zinc-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                    {community.description || 'No description provided.'}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <NavLink
                      to={`/community/${community._id}`}
                      className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-all text-center"
                    >
                      View
                    </NavLink>
                    <button
                      onClick={() => handleJoin(community._id)}
                      className="flex-1 px-4 py-2 bg-[#FF4500] hover:bg-[#FF4500]/90 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CommunitiesPage;
