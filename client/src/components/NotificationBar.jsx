import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
        // Fetch team invitations
        const teamInvitationsResponse = await fetch('http://localhost:5000/api/teams/invitations/received', {
          credentials: 'include',
        });
        let teamInvitations = [];
        if (teamInvitationsResponse.ok) {
          const data = await teamInvitationsResponse.json();
          teamInvitations = data.invitations || [];
        }

        // Fetch connection requests
        const connectionRequestsResponse = await fetch('http://localhost:5000/api/connections/requests', {
          credentials: 'include',
        });
        let connectionRequests = [];
        if (connectionRequestsResponse.ok) {
          const data = await connectionRequestsResponse.json();
          connectionRequests = (data.requests || []).map(req => ({
            ...req,
            type: 'connection_request',
            createdAt: req.createdAt || new Date()
          }));
        }

        // Combine and sort notifications
        const allNotifications = [
          ...teamInvitations.map(inv => ({ ...inv, type: 'team_invitation' })),
          ...connectionRequests
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setNotifications(allNotifications);
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
            notifications.map((notification) => (
              <div
                key={notification._id}
                className="p-3 border-b border-zinc-700 last:border-b-0 hover:bg-zinc-800 cursor-pointer flex items-center space-x-3"
                onClick={() => {
                  if (notification.type === 'team_invitation') {
                    navigate('/chat', { state: { selectedUserId: notification.fromPlayer._id } });
                  } else if (notification.type === 'connection_request') {
                    navigate('/connections');
                  }
                  setIsOpen(false);
                }}
              >
                {notification.type === 'team_invitation' ? (
                  <>
                    {notification.team.logo ? (
                      <img
                        src={notification.team.logo}
                        alt={`${notification.team.teamName} logo`}
                        className="w-10 h-10 rounded-lg object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 font-bold text-sm border border-zinc-600">
                        {notification.team.teamName ? notification.team.teamName.charAt(0).toUpperCase() : 'T'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-white">{notification.team.teamName}</div>
                      <div className="text-sm text-zinc-400">
                        Invited by {notification.fromPlayer.username}
                      </div>
                    </div>
                  </>
                ) : notification.type === 'connection_request' ? (
                  <>
                    {notification.fromPlayer?.profilePicture ? (
                      <img
                        src={notification.fromPlayer.profilePicture}
                        alt={`${notification.fromPlayer.username} profile`}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 font-bold text-sm border border-zinc-600">
                        {notification.fromPlayer?.username ? notification.fromPlayer.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-white">{notification.fromPlayer?.username}</div>
                      <div className="text-sm text-zinc-400">
                        Sent you a connection request
                      </div>
                    </div>
                  </>
                ) : null}
                <div className="text-xs text-zinc-500 whitespace-nowrap">
                  {timeAgo(notification.createdAt)}
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
