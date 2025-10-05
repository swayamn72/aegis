import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

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

  return (
    <div className="flex bg-black min-h-screen text-white">
      <Sidebar />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8 relative z-10">
        <h1 className="text-3xl font-bold mb-6">All Communities</h1>
        <input
          type="text"
          placeholder="Search communities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:border-[#FF4500] text-white"
        />
        {filteredCommunities.length === 0 ? (
          <p className="text-gray-400">No communities found.</p>
        ) : (
          <ul className="space-y-4">
            {filteredCommunities.map((community) => (
              <li key={community._id} className="bg-[#120E0E] p-4 rounded-lg flex items-center gap-4 hover:bg-gray-800 transition-colors">
                <img
                  src={community.image || 'https://via.placeholder.com/48'}
                  alt={community.name}
                  className="w-12 h-12 rounded-full border border-zinc-700"
                />
                <div className="flex-1">
                  <NavLink to={`/community/${community._id}`} className="text-lg font-semibold hover:underline">
                    {community.name}
                  </NavLink>
                  <p className="text-gray-400 text-sm">{community.description || 'No description provided.'}</p>
                  <p className="text-gray-500 text-xs mt-1">{community.membersCount} members</p>
                </div>
                <div className="flex gap-2">
                  <NavLink
                    to={`/community/${community._id}`}
                    className="px-4 py-2 bg-[#FF4500] rounded hover:bg-[#e03e00] transition-colors text-sm font-semibold"
                  >
                    View
                  </NavLink>
                  <button
                    onClick={() => handleJoin(community._id)}
                    className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors text-sm font-semibold"
                  >
                    Join
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default CommunitiesPage;
