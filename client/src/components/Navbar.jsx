import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle, Coins } from 'lucide-react'; // 👈 Import Coins icon
import logo from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';
import NotificationBar from './NotificationBar';
import axios from "axios";

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const coins = user?.coins || 0;

  const navLinks = [
    { to: "/myfeed", text: "MyFeed" },
    { to: "/players", text: "Players" },
    { to: "/opportunities", text: "Opportunities" },
    { to: "/tournaments", text: "Tournaments" },
    { to: "/communities", text: "Communities" },
  ];

  const CustomNavLink = ({ to, text }) => {
    const isActive = location.pathname !== '/' && location.pathname === to;
    return (
      <NavLink
        to={to}
        className="relative text-gray-300 hover:text-white transition-colors duration-300 text-lg font-bold group"
      >
        {text}
        <span
          className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF4500] to-orange-500 transition-transform duration-300 ease-out transform scale-x-0 group-hover:scale-x-100 ${isActive ? 'scale-x-100' : ''}`}
        ></span>
      </NavLink>
    );
  };

  const MobileNavLink = ({ to, text }) => (
    <NavLink
      to={to}
      onClick={() => setIsOpen(false)}
      className="block text-gray-300 hover:text-white transition-colors duration-300 text-xl font-bold py-3 text-center"
    >
      {text}
    </NavLink>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#120E0E] border-b border-zinc-800/50">
      <div className="container mx-auto flex items-center justify-between h-24 px-6">

        {/* Logo */}
        <NavLink to="/">
          <img src={logo} alt="Aegis Logo" className="h-[150px] mt-[5px] mr-[15px]" />
        </NavLink>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-12">
          {navLinks.map(link => <CustomNavLink key={link.text} {...link} />)}
        </nav>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-5">

          <div className="hidden md:flex items-center gap-4">
          <NotificationBar />
          {isAuthenticated && (
            <button
              onClick={() => navigate('/chat')}
              className="text-gray-300 hover:text-white transition-colors duration-300"
              aria-label="Chat"
              title="Chat"
            >
              <MessageCircle size={24} />
            </button>
          )}
          
        </div>

          {/* 💰 Coin Display */}
          {isAuthenticated && (
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-400/30 text-yellow-300 font-semibold text-sm"
              title="Your Coins"
            >
              <Coins size={18} className="text-yellow-400" />
              <span>{coins}</span>
            </div>
          )}

          {/* Auth Buttons or Profile */}
          {!isAuthenticated ? (
            <>
              <NavLink
                to="/login"
                className="font-bold text-white text-lg px-6 py-2 rounded-lg border-2 border-[#FF4500] hover:bg-[#FF4500]/20 transition-colors duration-300"
              >
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className="font-bold text-white text-lg px-6 py-2 rounded-lg bg-[#FF4500] hover:bg-orange-600 transition-colors duration-300"
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <ProfileDropdown user={user} logout={logout} />
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#120E0E] absolute top-24 left-0 w-full border-t border-zinc-800/50">
          <nav className="flex flex-col items-center gap-4 py-6">
            {navLinks.map(link => <MobileNavLink key={link.text} {...link} />)}
            <div className="flex flex-col items-center gap-4 mt-4 w-full px-6">
              {!isAuthenticated ? (
                <>
                  <NavLink
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full font-bold text-white text-lg px-6 py-3 rounded-lg border-2 border-[#FF4500] hover:bg-[#FF4500]/20 transition-colors duration-300"
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full font-bold text-white text-lg px-6 py-3 rounded-lg bg-[#FF4500] hover:bg-orange-600 transition-colors duration-300"
                  >
                    Sign Up
                  </NavLink>
                </>
              ) : (
                <>
                  {/* Mobile coin display */}
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-400/30 text-yellow-300 font-semibold text-sm">
                    <Coins size={18} className="text-yellow-400" />
                    <span>{coins}</span>
                  </div>

                  <div className="w-full flex justify-center">
                    <ProfileDropdown
                      user={user}
                      logout={() => {
                        logout();
                        setIsOpen(false);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
