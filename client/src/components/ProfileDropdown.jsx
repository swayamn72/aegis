import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, Settings, LogOut, Trophy, Star, Bell, ChevronDown } from 'lucide-react';

const ProfileDropdown = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    { icon: User, label: 'My Profile', href: '#' },
    { icon: Users, label: 'My Teams', href: '#' },
    { icon: Trophy, label: 'Achievements', href: '#' },
    { icon: Star, label: 'Favorites', href: '#' },
    { icon: Bell, label: 'Notifications', href: '#' },
    { icon: Settings, label: 'Settings', href: '#' },
    { icon: LogOut, label: 'Logout', href: '#', isLogout: true }
  ];

  // Get initials from username or fallback to 'US'
  const getInitials = (name) => {
    if (!name) return 'US';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Icon and Dropdown Button */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full text-white font-bold text-lg transition-all duration-200 transform hover:scale-105">
          {getInitials(user?.username)}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-all duration-200 transform hover:scale-105"
          title="Profile Menu"
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-14 w-64 bg-[#120E0E] border border-zinc-800/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info Header */}
          <div className="p-4 border-b border-zinc-800/50 bg-gradient-to-r from-[#120E0E] to-[#1a1414]">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {getInitials(user?.username)}
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">{user?.username || 'User Name'}</h3>
                <p className="text-gray-400 text-sm">Pro Player</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    if (item.isLogout) {
                      logout();
                    } else if (item.label === 'My Profile') {
                      navigate('/my-profile');
                    } else {
                      // Handle other navigation here
                      console.log(`Navigating to ${item.label}`);
                    }
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 transition-all duration-200 ${
                    item.isLogout 
                      ? 'hover:text-red-400 border-t border-gray-700 mt-2' 
                      : 'hover:text-orange-400'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
