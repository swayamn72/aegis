import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

export default function ChatPage({ userId }) {
  const [connections, setConnections] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Fetch all connections for the player
    fetch("http://localhost:5000/api/connections", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setConnections(data.connections || []));

    // Join user's own socket room
    if (userId) {
      socket.emit("join", userId);
    }

    // Listen for incoming messages
    socket.on("receiveMessage", (msg) => {
      // Only add to state if it's relevant to the current chat
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

  useEffect(scrollToBottom, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !selectedChat) return;

    const msg = {
      senderId: userId,
      receiverId: selectedChat._id,
      message: input,
      timestamp: new Date(),
    };

    // Emit message to server
    socket.emit("sendMessage", msg);

    // Optimistically update UI
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
              setMessages([]); // TODO: fetch previous chat history from DB here
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
                  key={idx}
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
