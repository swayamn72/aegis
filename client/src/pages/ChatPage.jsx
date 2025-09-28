import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

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
  const messagesEndRef = useRef(null);

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

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left sidebar: Connections */}
      <div className="w-1/4 border-r border-gray-700 p-4">
        <h2 className="text-lg font-bold mb-4">Chats</h2>
        {connections.map((conn) => (
          <div
            key={conn._id}
            onClick={() => {
              setSelectedChat(conn);
              fetchMessages(conn._id);
            }}
            className={`p-2 rounded cursor-pointer hover:bg-zinc-800 ${
              selectedChat?._id === conn._id ? "bg-zinc-700" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <img src={conn.avatar} alt="" className="w-8 h-8 rounded-full" />
              <span>{conn.username}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="border-b border-gray-700 p-4">
              <h2 className="font-bold">{selectedChat.username}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  className={`p-2 rounded max-w-xs ${
                    msg.senderId === userId
                      ? "bg-blue-600 ml-auto"
                      : "bg-zinc-700"
                  }`}
                >
                  {msg.message}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-700 flex">
              <input
                className="flex-1 p-2 bg-zinc-800 rounded-l outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 px-4 rounded-r"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
