import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { Plus, Flame, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [communities, setCommunities] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const res = await axios.get('/api/communities');
        setCommunities(res.data);
      } catch (error) {
        console.error('Error fetching communities:', error);
      }
    };
    fetchCommunities();
  }, []);

  // Sort communities by member count or activity
  const sortedCommunities = [...communities].sort((a, b) => b.membersCount - a.membersCount);
  const trending = sortedCommunities.slice(0, 3);
  const joinedCommunities = communities.filter(com => com.members && com.members.includes(user?._id));
  const others = sortedCommunities.slice(3).filter(com => !joinedCommunities.some(jc => jc._id === com._id));

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#120E0E] border-r border-zinc-800/50 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/50">
        <h2 className="text-gray-300 font-semibold text-lg">Communities</h2>
        <NavLink
          to="/create-community"
          className="text-gray-400 hover:text-white p-1 rounded"
          title="Create Community"
        >
          <Plus size={18} />
        </NavLink>
      </div>

      {/* Trending Section */}
      <div className="px-4 mt-10">
        <h3 className="text-gray-400 font-semibold text-sm mb-2 flex items-center gap-1">
          <Flame size={16} className="text-orange-500" /> Trending
        </h3>
        <ul className="space-y-2">
          {trending.map((com, i) => (
            <NavLink
              key={com._id || com.id}
              to={`/community/${com._id || com.id}`}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 cursor-pointer transition"
            >
              <img
                src={com.image || "https://via.placeholder.com/32"}
                alt={com.name}
                className="w-8 h-8 rounded-full border border-zinc-700"
              />
              <div>
                <p className="text-gray-200 font-medium text-sm">{com.name}</p>
                <p className="text-gray-500 text-xs">{com.membersCount} members</p>
              </div>
            </NavLink>
          ))}
        </ul>
      </div>

      {/* My Communities Section */}
      {joinedCommunities.length > 0 && (
        <div className="px-4 mt-6">
          <h3 className="text-gray-400 font-semibold text-sm mb-2 flex items-center gap-1">
            <Users size={16} className="text-blue-500" /> My Communities
          </h3>
          <ul className="space-y-2">
            {joinedCommunities.map((com) => (
              <NavLink
                key={com._id || com.id}
                to={`/community/${com._id || com.id}`}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 cursor-pointer transition"
              >
                <img
                  src={com.image || "https://via.placeholder.com/32"}
                  alt={com.name}
                  className="w-8 h-8 rounded-full border border-zinc-700"
                />
                <div>
                  <p className="text-gray-200 font-medium text-sm">{com.name}</p>
                  <p className="text-gray-500 text-xs">{com.membersCount} members</p>
                </div>
              </NavLink>
            ))}
          </ul>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-zinc-700 my-4 mx-4"></div>

      {/* Other Communities */}
      <div className="px-4 mb-6">
        <h3 className="text-gray-400 font-semibold text-sm mb-2">All Communities</h3>
        <ul className="space-y-2">
          {others.map((com) => (
            <NavLink
              key={com._id || com.id}
              to={`/community/${com._id || com.id}`}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 cursor-pointer transition"
            >
              <img
                src={com.image || "https://via.placeholder.com/32"}
                alt={com.name}
                className="w-8 h-8 rounded-full border border-zinc-700"
              />
              <div>
                <p className="text-gray-200 font-medium text-sm">{com.name}</p>
                <p className="text-gray-500 text-xs">{com.membersCount} members</p>
              </div>
            </NavLink>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
