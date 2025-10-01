import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Home, Users, Trophy, Calendar, Plus } from 'lucide-react'; // icons for nav items
import axios from 'axios';
const Sidebar = () => {
  const location = useLocation();
  const [communities, setCommunities] = useState([]);

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

  const navLinks = [
    { to: "/myfeed", text: "My Feed", icon: <Home size={20} /> },
    { to: "/my-profile", text: "My Profile", icon: <Users size={20} /> },
    { to: "/players", text: "Players", icon: <Users size={20} /> },
    { to: "/tournaments", text: "Tournaments", icon: <Trophy size={20} /> },
    { to: "/scrims", text: "Scrims", icon: <Calendar size={20} /> },
  ];

  const CustomNavLink = ({ to, text, icon }) => {
    const isActive = location.pathname === to;
    return (
      <NavLink
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors 
        ${isActive ? "bg-[#FF4500] text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
      >
        {icon}
        {text}
      </NavLink>
    );
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#120E0E] border-r border-zinc-800/50 flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center h-24 border-b border-zinc-800/50">
        <NavLink to="/">
          <img src={logo} alt="Logo" className="h-16" />
        </NavLink>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col mt-6 px-3 space-y-2">
        {navLinks.map(link => (
          <CustomNavLink key={link.text} {...link} />
        ))}
      </nav>


<div className="mt-8 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-400 font-semibold text-sm">
            Your Communities
          </h2>
          <NavLink
            to="/create-community"
            className="text-gray-400 hover:text-white p-1 rounded"
            title="Create Community"
          >
            <Plus size={16} />
          </NavLink>
        </div>
        <ul className="space-y-2">
          {communities.map((com) => (
            <NavLink
              key={com._id}
              to={`/community/${com._id}`}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 cursor-pointer"
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
