import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function timeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + " year" + (interval > 1 ? "s" : "") + " ago";

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + " month" + (interval > 1 ? "s" : "") + " ago";

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + " day" + (interval > 1 ? "s" : "") + " ago";

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + " hour" + (interval > 1 ? "s" : "") + " ago";

  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + " minute" + (interval > 1 ? "s" : "") + " ago";

  return "Just now";
}

const NotificationBar = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/teams/invitations/received', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.invitations || []);
        } else {
          toast.error('Failed to fetch notifications');
        }
      } catch (error) {
        toast.error('Network error fetching notifications');
      }
    };

    fetchNotifications();

    // Optionally, refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-300 hover:text-white transition-colors duration-300"
        aria-label="Notifications"
      >
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-50">
          <div className="p-4 text-white font-bold border-b border-zinc-700">
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-zinc-400">No new notifications</div>
          ) : (
            notifications.map((invitation) => (
              <div key={invitation._id} className="p-3 border-b border-zinc-700 last:border-b-0 hover:bg-zinc-800 cursor-pointer flex items-center space-x-3">
                {invitation.team.logo ? (
                  <img
                    src={invitation.team.logo}
                    alt={`${invitation.team.teamName} logo`}
                    className="w-10 h-10 rounded-lg object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 font-bold text-sm border border-zinc-600">
                    {invitation.team.teamName ? invitation.team.teamName.charAt(0).toUpperCase() : 'T'}
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-white">{invitation.team.teamName}</div>
                  <div className="text-sm text-zinc-400">
                    Invited by {invitation.fromPlayer.username}
                  </div>
                </div>
                <div className="text-xs text-zinc-500 whitespace-nowrap">
                  {timeAgo(invitation.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBar;
