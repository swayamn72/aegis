import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Send, Search, MoreVertical, Phone, Video, Settings, Users, Hash, ChevronDown, Activity, Crown, Shield, Gamepad2, Bell, Check, X, Eye, UserPlus,
  AlertCircle, Ban, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import ChatMessage from '../components/ChatMessage';

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
  const [recruitmentApproaches, setRecruitmentApproaches] = useState([]);
  const [showEndTryoutModal, setShowEndTryoutModal] = useState(false);
  const [endReason, setEndReason] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerMessage, setOfferMessage] = useState('');
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
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

    // Add system user for notifications
    const systemUser = { _id: 'system', username: 'System', realName: 'System Notifications', profilePicture: null };
    combined.unshift(systemUser);

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

  // Fetch recruitment approaches
  const fetchRecruitmentApproaches = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/recruitment/my-approaches', {
        credentials: 'include'
      });
      const data = await res.json();
      setRecruitmentApproaches(data.approaches || []);
    } catch (error) {
      console.error('Error fetching recruitment approaches:', error);
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
      await fetchRecruitmentApproaches();
    };

    fetchData();
  }, [userId]);

  // Fetch messages when selectedChat changes
  useEffect(() => {
    if (selectedChat && chatType === 'direct') {
      fetchMessages(selectedChat._id);
    } else if (selectedChat && chatType === 'tryout') {
      // JOIN the tryout chat room via socket
      socket.emit('joinTryoutChat', selectedChat._id);
      console.log('Joined tryout chat room:', selectedChat._id);

      // Cleanup: leave room when switching chats
      return () => {
        socket.emit('leaveTryoutChat', selectedChat._id);
        console.log('Left tryout chat room:', selectedChat._id);
      };
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
        (msg.senderId.toString() === selectedChat._id.toString() || msg.receiverId.toString() === selectedChat._id.toString() ||
          (selectedChat._id === 'system' && msg.messageType === 'system'))
      ) {
        setMessages((prev) => [...prev, msg]);
      }

      // Show notification for tournament invites if not currently viewing the chat
      if (msg.messageType === 'tournament_invite' && msg.receiverId === userId) {
        const senderName = 'Tournament Organizer';
        showNotification(
          'Tournament Invitation',
          `Your team has been invited to participate in a tournament`,
          '/favicon.ico',
          () => {
            window.location.href = `/chat?user=${msg.senderId}`;
          }
        );
      }


    });

    socket.on("tryoutMessage", (data) => {
      if (chatType === 'tryout' && selectedChat && data.chatId === selectedChat._id) {
        // REMOVE DUPLICATES: Check if message already exists before adding
        setMessages((prev) => {
          // Check if this message already exists by temporary ID or real ID
          const messageExists = prev.some(m =>
            m._id === data.message._id ||
            (m._id.toString().startsWith('temp_') && m.message === data.message.message && m.sender === data.message.sender)
          );

          if (messageExists) {
            // Replace temporary message with real one if IDs differ
            return prev.map(m =>
              (m._id.toString().startsWith('temp_') && m.message === data.message.message && m.sender === data.message.sender)
                ? data.message
                : m
            );
          }

          // Add new message if it doesn't exist
          return [...prev, data.message];
        });
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

    // NEW: Prevent sending if tryout is ended or offer in progress
    if (chatType === 'tryout') {
      const restrictedStatuses = ['ended_by_team', 'ended_by_player', 'offer_sent', 'offer_accepted', 'offer_rejected'];
      if (restrictedStatuses.includes(selectedChat.tryoutStatus)) {
        toast.error('This tryout has ended. No new messages can be sent.');
        return;
      }
    }

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
      // Generate unique temporary ID
      const tempId = `temp_${Date.now()}_${Math.random()}`;

      // Optimistically add message to UI with temporary ID
      const optimisticMessage = {
        _id: tempId,
        sender: userId,
        message: input,
        messageType: 'text',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, optimisticMessage]);

      // EMIT GROUP MESSAGE via socket
      socket.emit('tryoutMessage', {
        chatId: selectedChat._id,
        senderId: userId,
        message: input
      });
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
        // Close the tryout chat after acceptance
        if (selectedChat && chatType === 'tryout') {
          setSelectedChat(null);
          setChatType('direct');
          setMessages([]);
        }
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
            m.invitationId === invitationId || m.invitationId?._id === invitationId ? { ...m, invitationStatus: 'accepted' } : m
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

  // Handle accept approach
  const handleAcceptApproach = async (approachId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/recruitment/approach/${approachId}/accept`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Approach accepted! Tryout chat created.');

        // Refresh data
        await fetchRecruitmentApproaches();
        await fetchTryoutChats();

        // Switch to new tryout chat
        setSelectedChat(data.tryoutChat);
        setChatType('tryout');
        setMessages(data.tryoutChat.messages || []);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to accept approach');
      }
    } catch (error) {
      console.error('Error accepting approach:', error);
      toast.error('Failed to accept approach');
    }
  };

  // Handle reject approach
  const handleRejectApproach = async (approachId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/recruitment/approach/${approachId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: 'Not interested at this time' })
      });

      if (res.ok) {
        toast.success('Approach rejected');
        await fetchRecruitmentApproaches();
      } else {
        toast.error('Failed to reject approach');
      }
    } catch (error) {
      console.error('Error rejecting approach:', error);
      toast.error('Failed to reject approach');
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
                    src={app.player.profilePicture || `https://api.dicebear.com/7.x/avatars/svg?seed=${app.player.username || 'unknown'}`}
                    alt={app.player.username || 'Unknown'}
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

  // Simple debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Debounced typing indicator (prevents spam)
  const emitTyping = useCallback(
    debounce(() => {
      if (selectedChat?._id) {
        socket.emit('typing', { receiverId: selectedChat._id });
      }
    }, 300),
    [selectedChat]
  );

  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping();
  };

  // NEW: End tryout handler
  const handleEndTryout = async () => {
    if (!selectedChat || !endReason.trim()) {
      toast.error('Please provide a reason for ending the tryout');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/tryout-chats/${selectedChat._id}/end-tryout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: endReason })
      });

      if (res.ok) {
        toast.success('Tryout ended successfully');
        setShowEndTryoutModal(false);
        setEndReason('');
        await fetchTryoutMessages(selectedChat._id);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to end tryout');
      }
    } catch (error) {
      console.error('Error ending tryout:', error);
      toast.error('Failed to end tryout');
    }
  };

  // NEW: Send team offer handler
  const handleSendOffer = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/tryout-chats/${selectedChat._id}/send-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: offerMessage })
      });

      if (res.ok) {
        toast.success('Team offer sent!');
        setShowOfferModal(false);
        setOfferMessage('');
        await fetchTryoutMessages(selectedChat._id);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to send offer');
      }
    } catch (error) {
      console.error('Error sending offer:', error);
      toast.error('Failed to send offer');
    }
  };

  // NEW: Accept offer handler
  const handleAcceptOffer = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/tryout-chats/${selectedChat._id}/accept-offer`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('You joined the team!');
        await fetchTryoutMessages(selectedChat._id);
        // Optionally redirect to team page
        setTimeout(() => {
          navigate(`/team/${data.team._id}`);
        }, 2000);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to accept offer');
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast.error('Failed to accept offer');
    }
  };

  // NEW: Reject offer handler
  const handleRejectOffer = async () => {
    const reason = prompt('Reason for declining (optional):');

    try {
      const res = await fetch(`http://localhost:5000/api/tryout-chats/${selectedChat._id}/reject-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      if (res.ok) {
        toast.info('Team offer declined');
        await fetchTryoutMessages(selectedChat._id);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to reject offer');
      }
    } catch (error) {
      console.error('Error rejecting offer:', error);
      toast.error('Failed to reject offer');
    }
  };

  // NEW: Listen for tryout status updates
  useEffect(() => {
    socket.on('tryoutEnded', (data) => {
      if (chatType === 'tryout' && selectedChat && data.chatId === selectedChat._id) {
        // Update selected chat status
        setSelectedChat(prev => ({
          ...prev,
          tryoutStatus: data.tryoutStatus,
          endedBy: data.endedBy,
          endReason: data.reason
        }));

        // Add system message to UI
        if (data.message) {
          setMessages(prev => [...prev, data.message]);
        }

        toast.info('Tryout has been ended');
      }
    });

    socket.on('teamOfferSent', (data) => {
      if (chatType === 'tryout' && selectedChat && data.chatId === selectedChat._id) {
        setSelectedChat(prev => ({
          ...prev,
          tryoutStatus: 'offer_sent',
          teamOffer: data.offer
        }));

        if (data.message) {
          setMessages(prev => [...prev, data.message]);
        }

        toast.success('Team offer received!');
      }
    });

    socket.on('teamOfferAccepted', (data) => {
      if (chatType === 'tryout' && selectedChat && data.chatId === selectedChat._id) {
        setSelectedChat(prev => ({
          ...prev,
          tryoutStatus: 'offer_accepted'
        }));

        if (data.message) {
          setMessages(prev => [...prev, data.message]);
        }

        toast.success('Player joined the team!');
      }
    });

    socket.on('teamOfferRejected', (data) => {
      if (chatType === 'tryout' && selectedChat && data.chatId === selectedChat._id) {
        setSelectedChat(prev => ({
          ...prev,
          tryoutStatus: 'offer_rejected'
        }));

        if (data.message) {
          setMessages(prev => [...prev, data.message]);
        }

        toast.info('Player declined the team offer');
      }
    });

    return () => {
      socket.off('tryoutEnded');
      socket.off('teamOfferSent');
      socket.off('teamOfferAccepted');
      socket.off('teamOfferRejected');
    };
  }, [chatType, selectedChat?._id]);

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
                      {chatType === 'tryout' && selectedChat.tryoutStatus === 'active' && (
                        <span className="px-2 py-0.5 bg-orange-500/20 border border-orange-400/30 text-orange-400 rounded-md text-xs font-medium">
                          Tryout Active
                        </span>
                      )}
                      {chatType === 'tryout' && selectedChat.tryoutStatus === 'offer_sent' && (
                        <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-md text-xs font-medium">
                          Offer Pending
                        </span>
                      )}
                      {chatType === 'tryout' && ['ended_by_team', 'ended_by_player'].includes(selectedChat.tryoutStatus) && (
                        <span className="px-2 py-0.5 bg-red-500/20 border border-red-400/30 text-red-400 rounded-md text-xs font-medium">
                          Tryout Ended
                        </span>
                      )}
                      {chatType === 'tryout' && selectedChat.tryoutStatus === 'offer_accepted' && (
                        <span className="px-2 py-0.5 bg-green-500/20 border border-green-400/30 text-green-400 rounded-md text-xs font-medium">
                          Player Joined
                        </span>
                      )}
                      {chatType === 'tryout' && selectedChat.tryoutStatus === 'offer_rejected' && (
                        <span className="px-2 py-0.5 bg-gray-500/20 border border-gray-400/30 text-gray-400 rounded-md text-xs font-medium">
                          Offer Declined
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
                  {/* Team Captain Actions - Active Tryout */}
                  {(() => {
                    console.log('Debug captain check:', {
                      chatType,
                      tryoutStatus: selectedChat.tryoutStatus,
                      userTeamCaptain: user?.team?.captain,
                      userId,
                      captainId: user?.team?.captain?._id,
                      captainString: user?.team?.captain?.toString(),
                      isCaptain: user?.team?.captain?._id === userId
                    });
                    return chatType === 'tryout' && selectedChat.tryoutStatus === 'active' && user?.team?.captain?._id === userId;
                  })() && (
                      <>
                        <button
                          onClick={() => setShowOfferModal(true)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all text-sm flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Send Team Offer
                        </button>
                        <button
                          onClick={() => setShowEndTryoutModal(true)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all text-sm flex items-center gap-2"
                        >
                          <Ban className="w-4 h-4" />
                          End Tryout
                        </button>
                      </>
                    )}

                  {/* Applicant Actions - Active Tryout */}
                  {chatType === 'tryout' && selectedChat.tryoutStatus === 'active' && selectedChat.applicant?._id === userId && (
                    <button
                      onClick={() => setShowEndTryoutModal(true)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all text-sm flex items-center gap-2"
                    >
                      <Ban className="w-4 h-4" />
                      End Tryout
                    </button>
                  )}

                  {/* Applicant Actions - Pending Offer */}
                  {chatType === 'tryout' && selectedChat.tryoutStatus === 'offer_sent' && selectedChat.applicant?._id === userId && (
                    <>
                      <button
                        onClick={handleAcceptOffer}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all text-sm flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept Offer
                      </button>
                      <button
                        onClick={handleRejectOffer}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all text-sm flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Decline Offer
                      </button>
                    </>
                  )}

                  <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Messages - SIMPLE SCROLLING */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col w-full">
              {messages.map((msg, index) => {
                // Determine if message is from current user (same logic as ChatMessage)
                const isMine = chatType === 'direct'
                  ? msg.senderId === userId
                  : msg.sender?._id === userId || msg.sender === userId;

                // System messages - recruitment approach
                if (msg.messageType === 'system' && msg.metadata?.type === 'recruitment_approach') {
                  return (
                    <div key={msg._id || index} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-md w-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          {msg.metadata?.teamLogo ? (
                            <img
                              src={msg.metadata.teamLogo}
                              alt={msg.metadata.teamName}
                              className="w-12 h-12 rounded-lg object-cover border-2 border-purple-400/50"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-purple-700 rounded-lg flex items-center justify-center text-white font-bold text-lg border-2 border-purple-400/50">
                              {msg.metadata?.teamName?.charAt(0) || 'T'}
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-lg">{msg.metadata?.teamName}</h4>
                            <p className="text-purple-200 text-sm">Recruitment Approach</p>
                          </div>
                        </div>

                        <p className="text-purple-100 mb-4">{msg.metadata?.message}</p>

                        {(!msg.metadata?.approachStatus || msg.metadata.approachStatus === 'pending') && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAcceptApproach(msg.metadata?.approachId)}
                              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Accept & Start Chat
                            </button>
                            <button
                              onClick={() => handleRejectApproach(msg.metadata?.approachId)}
                              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Decline
                            </button>
                          </div>
                        )}

                        {msg.metadata?.approachStatus === 'accepted' && (
                          <div className="bg-green-500/20 border border-green-400/30 rounded-lg px-4 py-2 text-green-300 font-medium text-center">
                            ✓ Approach Accepted - Tryout Chat Created
                          </div>
                        )}

                        {msg.metadata?.approachStatus === 'rejected' && (
                          <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-4 py-2 text-red-300 font-medium text-center">
                            ✗ Approach Declined
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // Team invitation messages
                if (msg.messageType === 'invitation') {
                  return (
                    <div key={msg._id || index} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-md w-full bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-blue-500/30 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          {msg.team?.logo ? (
                            <img
                              src={msg.team.logo}
                              alt={msg.team.teamName}
                              className="w-12 h-12 rounded-lg object-cover border-2 border-blue-400/50"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg border-2 border-blue-400/50">
                              {msg.team?.teamName?.charAt(0) || 'T'}
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="text-white font-bold text-lg">{msg.team?.teamName}</h4>
                            <p className="text-blue-200 text-sm">Team Invitation</p>
                          </div>
                        </div>

                        <p className="text-blue-100 mb-4">{msg.message}</p>

                        {msg.invitationStatus !== 'accepted' && msg.invitationStatus !== 'declined' && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAcceptInvitation(msg.invitationId._id)}
                              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Accept Invitation
                            </button>
                            <button
                              onClick={() => handleDeclineInvitation(msg.invitationId._id)}
                              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Decline
                            </button>
                          </div>
                        )}

                        {msg.invitationStatus === 'accepted' && (
                          <div className="bg-green-500/20 border border-green-400/30 rounded-lg px-4 py-2 text-green-300 font-medium text-center">
                            ✓ Invitation Accepted - You joined the team!
                          </div>
                        )}

                        {msg.invitationStatus === 'declined' && (
                          <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-4 py-2 text-red-300 font-medium text-center">
                            ✗ Invitation Declined
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // Normal messages - WhatsApp style
                return (
                  <ChatMessage
                    key={msg._id || index}
                    msg={msg}
                    userId={userId}
                    chatType={chatType}
                    selectedChat={selectedChat}
                    index={index}
                    messages={messages}
                  />
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-zinc-800">
              {chatType === 'tryout' && ['ended_by_team', 'ended_by_player', 'offer_sent', 'offer_accepted', 'offer_rejected'].includes(selectedChat.tryoutStatus) ? (
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-zinc-400 text-sm">
                    This tryout has ended. No new messages can be sent.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-lg pl-4 pr-10 py-2 text-white placeholder-zinc-400 focus:outline-none focus:border-orange-500/50 focus:bg-zinc-800/70 transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-medium transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-zinc-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>

      {/* End Tryout Modal */}
      {showEndTryoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl max-w-md w-full p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">End Tryout</h3>
            <p className="text-zinc-400 mb-4 text-sm">
              Are you sure you want to end this tryout? No further messages can be sent after ending.
            </p>
            <textarea
              value={endReason}
              onChange={(e) => setEndReason(e.target.value)}
              placeholder="Reason for ending (required)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 mb-4"
              rows="3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEndTryoutModal(false);
                  setEndReason('');
                }}
                className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEndTryout}
                disabled={!endReason.trim()}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                End Tryout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl max-w-md w-full p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">Send Team Join Offer</h3>
            <p className="text-zinc-400 mb-4 text-sm">
              Invite {selectedChat?.applicant?.username} to join your team.
            </p>
            <textarea
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              placeholder="Custom message (optional)"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 mb-4"
              rows="3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOfferModal(false);
                  setOfferMessage('');
                }}
                className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOffer}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {showApplications && <ApplicationsPanel />}
    </div>
  );
}


