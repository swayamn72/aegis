import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Home, Users, Trophy, Calendar } from 'lucide-react'; // icons for nav items

const Sidebar = () => {
  const location = useLocation();

  const navLinks = [
    { to: "/myfeed", text: "My Feed", icon: <Home size={20} /> },
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
    </aside>
  );
};

export default Sidebar;
