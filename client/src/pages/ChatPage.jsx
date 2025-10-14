import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { useLocation } from 'react-router-dom';
import {
  Send, Search, MoreVertical, Phone, Video, Settings, Users, Hash, ChevronDown, Activity, Crown, Shield, Gamepad2, Bell, Check, X, Eye, UserPlus
} from 'lucide-react';
import { toast } from 'react-toastify';

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

export default function ChatPage() {
  const { user } = useAuth();
  const userId = user?._id;
  const [connections, setConnections] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatType, setChatType] = useState('direct'); // 'direct' or 'tryout'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [teamApplications, setTeamApplications] = useState([]);
  const [tryoutChats, setTryoutChats] = useState([]);
  const [showApplications, setShowApplications] = useState(false);
  const [tournamentDetails, setTournamentDetails] = useState({});
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const selectedUserId = location.state?.selectedUserId;

  // Fetch all users who have chat messages with the current user
  const fetchConnections = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/chat/users/with-chats', { credentials: 'include' });
      const data = await res.json();
      return data.users || [];
    } catch (error) {
      console.error('Error fetching chat users:', error);
      return [];
    }
  };

  // Combine confirmed connections and team application players into one list
  const combineConnections = (confirmedConns, teamApps) => {
    const combined = [...confirmedConns];

    // Add players from team applications if not already in connections
    teamApps.forEach(app => {
      const exists = combined.some(conn => conn._id === app.player._id);
      if (!exists) {
        combined.push(app.player);
      }
    });

    return combined;
  };

  // Fetch connections and team applications and update connections state
  const fetchAndSetConnections = async () => {
    const confirmedConns = await fetchConnections();
    const combined = combineConnections(confirmedConns, teamApplications);
    setConnections(combined);
  };

  // Fetch messages for direct chat
  const fetchMessages = async (receiverId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/${receiverId}`, { credentials: 'include' });
      const msgs = await res.json();
      setMessages(msgs);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch system messages
  const fetchSystemMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/system`, { credentials: 'include' });
      const msgs = await res.json();
      setMessages(msgs);
    } catch (error) {
      console.error('Error fetching system messages:', error);
    }
  };

  // Fetch messages for tryout chat
  const fetchTryoutMessages = async (chatId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tryout-chats/${chatId}`, { credentials: 'include' });
      const data = await res.json();
      setMessages(data.chat.messages || []);
      setSelectedChat(data.chat);
    } catch (error) {
      console.error('Error fetching tryout messages:', error);
    }
  };

  // Fetch team applications (for captains)
  const fetchTeamApplications = async () => {
    if (!user?.team) return;

    try {
      const res = await fetch(`http://localhost:5000/api/team-applications/team/${user.team._id}`, {
        credentials: 'include'
      });
      const data = await res.json();
      setTeamApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  // Fetch tryout chats
  const fetchTryoutChats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tryout-chats/my-chats', {
        credentials: 'include'
      });
      const data = await res.json();
      setTryoutChats(data.chats || []);
    } catch (error) {
      console.error('Error fetching tryout chats:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch team applications and then fetch messages for selected chat
  useEffect(() => {
    if (!userId) return;

    socket.emit("join", userId);

    const fetchData = async () => {
      await fetchTeamApplications();
      await fetchTryoutChats();
    };

    fetchData();
  }, [userId]);

  // Fetch messages when selectedChat changes
  useEffect(() => {
    if (selectedChat && chatType === 'direct') {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat, chatType]);

  // Fetch and set connections whenever teamApplications or userId changes
  useEffect(() => {
    if (!userId) return;
    fetchAndSetConnections();
  }, [teamApplications, userId]);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Function to show browser notification
  const showNotification = (title, body, icon, onClick) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon,
        tag: 'tournament-invite', // Prevents duplicate notifications
      });

      if (onClick) {
        notification.onclick = () => {
          onClick();
          notification.close();
        };
      }

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  };

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (chatType === 'direct' && selectedChat &&
        (msg.senderId.toString() === selectedChat._id.toString() || msg.receiverId.toString() === selectedChat._id.toString())
      ) {
        setMessages((prev) => [...prev, msg]);
      }

      // Show notification for tournament invites if not currently viewing the chat
      if (msg.messageType === 'tournament_invite' && msg.receiverId === userId) {
        const senderName = 'Tournament Organizer'; // Could be enhanced to get actual name
        showNotification(
          'Tournament Team Invite',
          `Your team has been invited to participate in a tournament`,
          '/favicon.ico', // Use appropriate icon
          () => {
            // Redirect to chat page with the sender
            window.location.href = `/chat?user=${msg.senderId}`;
          }
        );
      }
    });

    socket.on("tryoutMessage", (data) => {
      if (chatType === 'tryout' && selectedChat && data.chatId === selectedChat._id) {
        setMessages((prev) => [...prev, data.message]);
      }
    });

    setOnlineUsers(new Set(['user1', 'user2', 'user3']));

    return () => {
      socket.off("receiveMessage");
      socket.off("tryoutMessage");
    };
  }, [chatType, selectedChat?._id, userId]);

  useEffect(() => {
    const handleConnect = () => console.log('Socket connected');
    const handleDisconnect = () => console.log('Socket disconnected');
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  useEffect(scrollToBottom, [messages]);

  // Fetch tournament details when messages change
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.messageType === 'tournament_reference' && msg.tournamentId) {
        fetchTournamentDetails(msg.tournamentId);
      }
    });
  }, [messages]);

  useEffect(() => {
    if (connections.length > 0) {
      if (selectedUserId) {
        const user = connections.find(c => c._id === selectedUserId);
        if (user) {
          setSelectedChat(user);
          setChatType('direct');
          fetchMessages(user._id);
          return;
        }
      }
      // If no selectedUserId or user not found, select first connection by default
      const firstUser = connections[0];
      setSelectedChat(firstUser);
      setChatType('direct');
      fetchMessages(firstUser._id);
    }
  }, [connections, selectedUserId]);

  const sendMessage = () => {
    if (!input.trim() || !selectedChat || !userId) return;

    if (chatType === 'direct') {
      const msg = {
        senderId: userId,
        receiverId: selectedChat._id,
        message: input,
        timestamp: new Date(),
      };
      socket.emit("sendMessage", msg);
      setMessages((prev) => [...prev, msg]);
    } else if (chatType === 'tryout') {
      // Send tryout chat message
      fetch(`http://localhost:5000/api/tryout-chats/${selectedChat._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: input }),
      })
        .then(res => res.json())
        .then(data => {
          socket.emit("tryoutMessage", {
            chatId: selectedChat._id,
            message: data.chatMessage,
          });
          setMessages(prev => [...prev, data.chatMessage]);
        })
        .catch(error => console.error('Error sending tryout message:', error));
    }

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStartTryout = async (applicationId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/team-applications/${applicationId}/start-tryout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Tryout started!');
        fetchTeamApplications();
        fetchTryoutChats();

        // Switch to tryout chat
        setSelectedChat(data.tryoutChat);
        setChatType('tryout');
        setMessages(data.tryoutChat.messages || []);
        setShowApplications(false);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to start tryout');
      }
    } catch (error) {
      console.error('Error starting tryout:', error);
      toast.error('Failed to start tryout');
    }
  };

  const handleRejectApplication = async (applicationId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/team-applications/${applicationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: 'Not suitable at this time' }),
      });

      if (res.ok) {
        toast.success('Application rejected');
        fetchTeamApplications();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const handleAcceptPlayer = async (applicationId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/team-applications/${applicationId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes: 'Great performance during tryout' }),
      });

      if (res.ok) {
        toast.success('Player accepted to team!');
        fetchTeamApplications();
        fetchTryoutChats();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to accept player');
      }
    } catch (error) {
      console.error('Error accepting player:', error);
      toast.error('Failed to accept player');
    }
  };


  // Handler to accept tournament team invitation from chat message
  const handleAcceptTournamentInvite = async (msg) => {
    try {
      const res = await fetch(`http://localhost:5000/api/team-tournaments/accept-invitation/${msg.tournamentId}/${msg.invitationId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success('Tournament invite accepted');
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            m.invitationId === msg.invitationId ? { ...m, invitationStatus: 'accepted' } : m
          )
        );
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to accept tournament invite');
      }
    } catch (error) {
      console.error('Error accepting tournament invite:', error);
      toast.error('Failed to accept tournament invite');
    }
  };

  // Handler to decline tournament team invitation from chat message
  const handleDeclineTournamentInvite = async (msg) => {
    try {
      const res = await fetch(`http://localhost:5000/api/team-tournaments/decline-invitation/${msg.tournamentId}/${msg.invitationId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        toast.success('Tournament invite declined');
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            m.invitationId === msg.invitationId ? { ...m, invitationStatus: 'declined' } : m
          )
        );
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to decline tournament invite');
      }
    } catch (error) {
      console.error('Error declining tournament invite:', error);
      toast.error('Failed to decline tournament invite');
    }
  };

  // Handler to accept team invitation from chat message
  const handleAcceptInvitation = async (invitationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teams/invitations/${invitationId}/accept`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        toast.success('Invitation accepted successfully!');
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            m.invitationId === invitationId ? { ...m, invitationStatus: 'accepted' } : m
          )
        );
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to accept invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Network error accepting invitation');
    }
  };

  // Handler to decline team invitation from chat message
  const handleDeclineInvitation = async (invitationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teams/invitations/${invitationId}/decline`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        toast.success('Invitation declined');
        setMessages((prevMessages) =>
          prevMessages.map((m) =>
            m.invitationId === invitationId ? { ...m, invitationStatus: 'declined' } : m
          )
        );
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to decline invitation');
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error('Network error declining invitation');
    }
  };

  const filteredConnections = connections.filter(conn =>
    conn.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conn.realName && conn.realName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString();
  };

  const getUserStatus = (userId) => {
    if (onlineUsers.has(userId)) return 'online';
    return 'offline';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-zinc-500';
    }
  };

  const getRankIcon = (aegisRating) => {
    if (aegisRating >= 2000) return <Crown className="w-4 h-4 text-amber-400" />;
    if (aegisRating >= 1500) return <Shield className="w-4 h-4 text-purple-400" />;
    if (aegisRating >= 1000) return <Gamepad2 className="w-4 h-4 text-blue-400" />;
    return null;
  };

  // Fetch tournament details
  const fetchTournamentDetails = async (tournamentId) => {
    if (tournamentDetails[tournamentId]) return;

    try {
      const res = await fetch(`http://localhost:5000/api/tournaments/${tournamentId}`, { credentials: 'include' });
      const data = await res.json();
      setTournamentDetails(prev => ({ ...prev, [tournamentId]: data }));
    } catch (error) {
      console.error('Error fetching tournament details:', error);
    }
  };

  const ApplicationsPanel = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 p-4 md:items-center">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-orange-400" />
            Team Applications ({teamApplications.length})
          </h2>
          <button onClick={() => setShowApplications(false)} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {teamApplications.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <UserPlus className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
              <p>No pending applications</p>
            </div>
          ) : (
            teamApplications.map(app => (
              <div key={app._id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={app.player.profilePicture || `https://api.dicebear.com/7.x/avatars/svg?seed=${app.player.username}`}
                    alt={app.player.username}
                    className="w-16 h-16 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">{app.player.inGameName || app.player.username}</h3>
                      {getRankIcon(app.player.aegisRating)}
                      <span className="text-sm text-zinc-400">@{app.player.username}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-zinc-400 mb-2">
                      <span>{app.player.primaryGame}</span>
                      <span>•</span>
                      <span>Rating: {app.player.aegisRating}</span>
                      <span>•</span>
                      <span>Applied {formatTime(app.createdAt)}</span>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-zinc-400 mb-1">Applying for:</p>
                      <div className="flex flex-wrap gap-2">
                        {app.appliedRoles.map(role => (
                          <span key={role} className="px-2 py-1 bg-orange-500/20 border border-orange-400/30 rounded-md text-orange-400 text-xs">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    {app.message && (
                      <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 mb-3">
                        <p className="text-sm text-zinc-300">{app.message}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStartTryout(app._id)}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all text-sm"
                          >
                            Start Tryout
                          </button>
                          <button
                            onClick={() => handleRejectApplication(app._id)}
                            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {app.status === 'in_tryout' && (
                        <span className="px-4 py-2 bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-lg text-sm font-medium">
                          Tryout in Progress
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 text-white font-sans">
      {/* Left Sidebar */}
      <div className="w-80 bg-zinc-900/50 border-r border-zinc-800 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-orange-400" />
              Chats
            </h2>
            <div className="flex items-center gap-2">
              {user?.team && (
                <button
                  onClick={() => setShowApplications(true)}
                  className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <Bell className="w-4 h-4 text-zinc-400" />
                  {teamApplications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                      {teamApplications.length}
                    </span>
                  )}
                </button>
              )}
              <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-400 focus:outline-none focus:border-orange-500/50 focus:bg-zinc-800/70 transition-all"
            />
          </div>
        </div>

        {/* Tryout Chats Section */}
        {tryoutChats.length > 0 && (
          <div className="border-b border-zinc-800">
            <div className="p-3 bg-zinc-800/30">
              <h3 className="text-sm font-semibold text-orange-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Tryouts
              </h3>
            </div>
            <div className="p-2">
              {tryoutChats.map(chat => (
                <div
                  key={chat._id}
                  onClick={() => {
                    setSelectedChat(chat);
                    setChatType('tryout');
                    fetchTryoutMessages(chat._id);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all mb-2 ${selectedChat?._id === chat._id && chatType === 'tryout'
                      ? "bg-gradient-to-r from-orange-500/20 to-red-600/20 border border-orange-500/30"
                      : "hover:bg-zinc-800/30"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={chat.team.logo}
                        alt={chat.team.teamName}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-zinc-900" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate text-sm">
                        {chat.team.teamName} Tryout
                      </div>
                      <div className="text-xs text-zinc-400 truncate">
                        Tryout: {chat.applicant.username}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direct Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="px-3 py-2">
              <h3 className="text-sm font-semibold text-zinc-400">Direct Messages</h3>
            </div>
            {filteredConnections.length > 0 ? (
              filteredConnections.map((conn) => (
                <div
                  key={conn._id}
                  onClick={() => {
                    setSelectedChat(conn);
                    setChatType('direct');
                    if (conn._id === 'system') {
                      fetchSystemMessages();
                    } else {
                      fetchMessages(conn._id);
                    }
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2 group hover:bg-zinc-800/50 ${selectedChat?._id === conn._id && chatType === 'direct'
                      ? "bg-gradient-to-r from-orange-500/20 to-red-600/20 border border-orange-500/30"
                      : "hover:bg-zinc-800/30"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={conn.profilePicture || `https://api.dicebear.com/7.x/avatars/svg?seed=${conn.username}`}
                        alt={conn.username}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-zinc-700 group-hover:border-orange-400/50 transition-colors"
                      />
                      {conn._id !== 'system' && (
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(getUserStatus(conn._id))} rounded-full border-2 border-zinc-900`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">
                          {conn.realName || conn.username}
                        </span>
                        {conn._id !== 'system' && getRankIcon(conn.aegisRating)}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-400">@{conn.username}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
                <p className="text-zinc-400">No connections found</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Activity className="w-4 h-4 text-green-400" />
            <span>{onlineUsers.size} online</span>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-zinc-900/30">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-zinc-900/50 border-b border-zinc-800 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        chatType === 'tryout'
                          ? selectedChat.team?.logo
                          : (selectedChat.profilePicture || `https://api.dicebear.com/7.x/avatars/svg?seed=${selectedChat.username}`)
                      }
                      alt={chatType === 'tryout' ? selectedChat.team?.teamName : selectedChat.username}
                      className="w-10 h-10 rounded-lg object-cover border border-zinc-700"
                    />
                    {chatType === 'direct' && (
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(getUserStatus(selectedChat._id))} rounded-full border border-zinc-900`} />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {chatType === 'tryout'
                          ? `${selectedChat.team?.teamName} Tryout`
                          : (selectedChat.realName || selectedChat.username)
                        }
                      </span>
                      {chatType === 'tryout' && (
                        <span className="px-2 py-0.5 bg-orange-500/20 border border-orange-400/30 text-orange-400 rounded-md text-xs font-medium">
                          Tryout Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-zinc-400">
                      {chatType === 'tryout'
                        ? `Applicant: ${selectedChat.applicant?.username}`
                        : `@${selectedChat.username}`
                      }
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {chatType === 'tryout' && user?.team && (
                    <div className="flex gap-2 mr-4">
                      <button
                        onClick={() => {
                          const app = teamApplications.find(a => a.tryoutChatId?.toString() === selectedChat._id);
                          if (app) handleAcceptPlayer(app._id);
                        }}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Accept Player
                      </button>
                      <button
                        onClick={() => {
                          const app = teamApplications.find(a => a.tryoutChatId?.toString() === selectedChat._id);
                          if (app) handleRejectApplication(app._id);
                        }}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                  <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/20">
              {messages.length > 0 ? (
                messages.map((msg, idx) => {
                  const isMine = chatType === 'direct'
                    ? msg.senderId === userId
                    : msg.sender?._id === userId || msg.sender === userId;


                  if (msg.messageType === 'invitation') {
                    // Player invite message UI (unchanged)
                    return (
                      <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-xs lg:max-w-md xl:max-w-lg order-1 bg-yellow-100 rounded-2xl p-4 shadow-lg border border-yellow-400 text-yellow-900">
                          <p className="mb-3 font-semibold">Team Invitation</p>
                          <p className="mb-4">{msg.message}</p>
                          {(msg.invitationStatus === 'pending' || !msg.invitationStatus) && (
                            <div className="flex gap-3">
                              <button
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                                onClick={() => handleAcceptInvitation(msg.invitationId)}
                              >
                                Accept
                              </button>
                              <button
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                                onClick={() => handleDeclineInvitation(msg.invitationId)}
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {msg.invitationStatus === 'accepted' && (
                            <p className="text-green-700 font-semibold">Invitation Accepted</p>
                          )}
                          {msg.invitationStatus === 'declined' && (
                            <p className="text-red-700 font-semibold">Invitation Declined</p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (msg.messageType === 'tournament_invite') {
                    // Tournament team invite message UI
                    return (
                      <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-xs lg:max-w-md xl:max-w-lg order-1 bg-orange-100 rounded-2xl p-4 shadow-lg border border-orange-400 text-orange-900">
                          <p className="mb-3 font-semibold">Tournament Team Invite</p>
                          <p className="mb-2">Tournament: <span className="font-bold">{msg.tournamentName || 'Tournament'}</span></p>
                          <p className="mb-4">{msg.message}</p>
                          {(msg.invitationStatus === 'pending' || !msg.invitationStatus) && (
                            <div className="flex gap-3">
                              <button
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                                onClick={() => handleAcceptTournamentInvite(msg.invitationId)}
                              >
                                Accept
                              </button>
                              <button
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                                onClick={() => handleDeclineTournamentInvite(msg.invitationId)}
                              >
                                Decline
                              </button>
                            </div>
                          )}
                          {msg.invitationStatus === 'accepted' && (
                            <p className="text-green-700 font-semibold">Tournament Invite Accepted</p>
                          )}
                          {msg.invitationStatus === 'declined' && (
                            <p className="text-red-700 font-semibold">Tournament Invite Declined</p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (msg.messageType === 'tournament_reference') {
                    return (
                      <div key={msg._id || idx} className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-xs lg:max-w-md xl:max-w-lg order-1 bg-blue-100 rounded-2xl p-4 shadow-lg border border-blue-400 text-blue-900 cursor-pointer hover:bg-blue-200 transition-colors"
                          onClick={() => {
                            // Navigate to tournament page
                            window.location.href = `/tournament/${msg.tournamentId}`;
                          }}
                        >
                          <p className="mb-2 font-semibold">Tournament Reference</p>
                          <div className="flex items-center gap-4 mb-2">
                            {(tournamentDetails[msg.tournamentId]?.tournamentData?.media?.logo || tournamentDetails[msg.tournamentId]?.tournamentData?.organizer?.logo) ? (
                              <img
                                src={tournamentDetails[msg.tournamentId]?.tournamentData?.media?.logo || tournamentDetails[msg.tournamentId]?.tournamentData?.organizer?.logo}
                                alt={tournamentDetails[msg.tournamentId]?.tournamentData?.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-zinc-300 rounded-lg flex items-center justify-center text-zinc-600 text-xs">
                                No Logo
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-blue-900">{tournamentDetails[msg.tournamentId]?.tournamentData?.name || 'Loading...'}</p>
                              <p className="text-sm text-blue-800">Prize Pool: {tournamentDetails[msg.tournamentId]?.tournamentData?.prizePool?.total || 'N/A'}</p>
                              <p className="text-sm text-blue-800">Slots Remaining: {tournamentDetails[msg.tournamentId]?.tournamentData?.totalSlots ?? 'N/A'}</p>
                            </div>
                          </div>
                          <p className="mb-2">{msg.message}</p>
                        </div>
                      </div>
                    );
                  }

                  if (msg.messageType === 'system') {
                    return (
                      <div key={msg._id || idx} className="flex justify-center">
                        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-300">
                          {msg.message}
                        </div>
                      </div>
                    );
                  }

                  if (msg.messageType === 'match_scheduled') {
                    return (
                      <div key={msg._id || idx} className="flex justify-center">
                        <div className="bg-blue-900/50 border border-blue-700 rounded-lg px-4 py-3 text-sm text-blue-300 max-w-md">
                          <div className="flex items-center gap-2 mb-1">
                            <Bell className="w-4 h-4 text-blue-400" />
                            <span className="font-semibold">Match Scheduled</span>
                          </div>
                          <p>{msg.message}</p>
                        </div>
                      </div>
                    );
                  }

                  // Normal message UI
                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isMine ? 'order-2' : 'order-1'}`}>
                        {chatType === 'tryout' && !isMine && (
                          <div className="text-xs text-zinc-400 mb-1 ml-2">
                            {msg.sender?.username || 'Unknown'}
                          </div>
                        )}
                        <div className={`p-3 rounded-2xl shadow-lg ${isMine
                            ? "bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-br-md"
                            : "bg-zinc-800/80 text-white border border-zinc-700 rounded-bl-md"
                          }`}>
                          <p className="break-words">{msg.message}</p>
                          <div className={`text-xs mt-1 ${isMine ? 'text-orange-100' : 'text-zinc-400'}`}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>

                      {chatType === 'tryout' && !isMine && (
                        <div className="order-0 mr-2">
                          <img
                            src={msg.sender?.profilePicture || `https://api.dicebear.com/7.x/avatars/svg?seed=${msg.sender?.username}`}
                            alt={msg.sender?.username}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Hash className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">
                      {chatType === 'tryout'
                        ? 'Start the tryout conversation'
                        : `Start chatting with ${selectedChat.username}`
                      }
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-zinc-900/50 border-t border-zinc-800 backdrop-blur-sm p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 focus-within:border-orange-500/50 transition-colors">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${chatType === 'tryout' ? 'the tryout chat' : `@${selectedChat.username}`}...`}
                    className="w-full bg-transparent text-white placeholder-zinc-400 resize-none outline-none min-h-[20px] max-h-32"
                    rows={1}
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-zinc-700 disabled:to-zinc-600 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-zinc-950/20">
            <div className="text-center">
              <Hash className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
              <p className="text-zinc-400">Choose a connection or tryout chat to start</p>
            </div>
          </div>
        )}
      </div>

      {showApplications && <ApplicationsPanel />}
    </div>
  );
}