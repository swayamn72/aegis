import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { useLocation } from 'react-router-dom';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Settings,
  Users,
  Hash,
  ChevronDown,
  Circle,
  Gamepad2,
  Crown,
  Shield,
  Activity
} from 'lucide-react';

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

export default function ChatPage() {
  const { user } = useAuth();
  const userId = user?._id;
  const [connections, setConnections] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const selectedUserId = location.state?.selectedUserId;

  const fetchMessages = async (receiverId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/${receiverId}`, { credentials: 'include' });
      const msgs = await res.json();
      setMessages(msgs);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/connections", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setConnections(data.connections || []));

    if (userId) {
      socket.emit("join", userId);
    }

    socket.on("receiveMessage", (msg) => {
      console.log('received message', msg);
      if (
        selectedChat &&
        (msg.senderId === selectedChat._id || msg.receiverId === selectedChat._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    // Mock online users - in real app, this would come from socket events
    setOnlineUsers(new Set(['user1', 'user2', 'user3']));

    return () => {
      socket.off("receiveMessage");
    };
  }, [userId, selectedChat?._id]);

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

  useEffect(() => {
    if (connections.length > 0 && selectedUserId) {
      const user = connections.find(c => c._id === selectedUserId);
      if (user) {
        setSelectedChat(user);
        fetchMessages(user._id);
      }
    }
  }, [connections, selectedUserId]);

  const sendMessage = () => {
    if (!input.trim() || !selectedChat || !userId) {
      console.error('Cannot send message: Missing userId or selectedChat');
      return;
    }

    const msg = {
      senderId: userId,
      receiverId: selectedChat._id,
      message: input,
      timestamp: new Date(),
    };

    console.log('sending message', msg);
    socket.emit("sendMessage", msg);

    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 text-white font-sans">
      {/* Left Sidebar: Connections */}
      <div className="w-80 bg-zinc-900/50 border-r border-zinc-800 backdrop-blur-sm flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-orange-400" />
              Chats
            </h2>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-zinc-400" />
              </button>
              <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
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

        {/* Connections List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {filteredConnections.length > 0 ? (
              filteredConnections.map((conn) => (
                <div
                  key={conn._id}
                  onClick={() => {
                    setSelectedChat(conn);
                    fetchMessages(conn._id);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 mb-2 group hover:bg-zinc-800/50 ${
                    selectedChat?._id === conn._id 
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
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(getUserStatus(conn._id))} rounded-full border-2 border-zinc-900`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white truncate">
                          {conn.realName || conn.username}
                        </span>
                        {getRankIcon(conn.aegisRating)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-400">@{conn.username}</span>
                        {conn.primaryGame && (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-md text-xs font-medium">
                            {conn.primaryGame}
                          </span>
                        )}
                      </div>
                      
                      {conn.teamStatus && (
                        <div className="text-xs text-zinc-500 mt-1 truncate">
                          {conn.teamStatus}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-zinc-400">
                        {getUserStatus(conn._id) === 'online' ? (
                          <span className="text-green-400 font-medium">Online</span>
                        ) : (
                          'Offline'
                        )}
                      </div>
                      {conn.aegisRating && (
                        <div className="text-xs text-orange-400 font-medium">
                          {conn.aegisRating}
                        </div>
                      )}
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

        {/* Online Users Count */}
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
                      src={selectedChat.profilePicture || `https://api.dicebear.com/7.x/avatars/svg?seed=${selectedChat.username}`}
                      alt={selectedChat.username} 
                      className="w-10 h-10 rounded-lg object-cover border border-zinc-700"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(getUserStatus(selectedChat._id))} rounded-full border border-zinc-900`} />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {selectedChat.realName || selectedChat.username}
                      </span>
                      {getRankIcon(selectedChat.aegisRating)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-zinc-400">@{selectedChat.username}</span>
                      {getUserStatus(selectedChat._id) === 'online' && (
                        <span className="text-green-400 text-xs">• Online</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-zinc-400" />
                  </button>
                  <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                    <Video className="w-5 h-5 text-zinc-400" />
                  </button>
                  <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/20">
              {messages.length > 0 ? (
                messages.map((msg, idx) => (
                  <div
                    key={msg._id || idx}
                    className={`flex ${
                      msg.senderId === userId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                      msg.senderId === userId 
                        ? 'order-2' 
                        : 'order-1'
                    }`}>
                      <div className={`p-3 rounded-2xl shadow-lg ${
                        msg.senderId === userId
                          ? "bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-br-md"
                          : "bg-zinc-800/80 text-white border border-zinc-700 rounded-bl-md"
                      }`}>
                        <p className="break-words">{msg.message}</p>
                        <div className={`text-xs mt-1 ${
                          msg.senderId === userId 
                            ? 'text-orange-100' 
                            : 'text-zinc-400'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    {msg.senderId !== userId && (
                      <div className="order-0 mr-2">
                        <img
                          src={selectedChat.profilePicture || `https://api.dicebear.com/7.x/avatars/svg?seed=${selectedChat.username}`}
                          alt={selectedChat.username} 
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Hash className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-400">Start a conversation with {selectedChat.username}</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-zinc-900/50 border-t border-zinc-800 backdrop-blur-sm p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 focus-within:border-orange-500/50 transition-colors">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message @${selectedChat.username}...`}
                    className="w-full bg-transparent text-white placeholder-zinc-400 resize-none outline-none min-h-[20px] max-h-32"
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '20px',
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-zinc-700 disabled:to-zinc-600 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                <span>Press Enter to send, Shift + Enter for new line</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-zinc-950/20">
            <div className="text-center">
              <div className="w-24 h-24 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Hash className="w-12 h-12 text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Select a conversation</h3>
              <p className="text-zinc-400 max-w-sm">
                Choose a connection from the sidebar to start chatting with fellow gamers
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}