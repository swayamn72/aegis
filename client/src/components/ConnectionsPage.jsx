import { useEffect, useState } from "react";

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  const fetchConnections = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/connections", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
        setPendingRequests(data.pendingRequests || []);
      }
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  const handleAction = async (playerId, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/connections/${action}/${playerId}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setPendingRequests((prev) => prev.filter((req) => req._id !== playerId));
        if (action === "accept") {
          // Move to connections list
          const acceptedUser = pendingRequests.find((req) => req._id === playerId);
          setConnections((prev) => [...prev, acceptedUser]);
        }
      }
    } catch (err) {
      console.error(`Error ${action} request:`, err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Your Connections</h1>

      <h2 className="text-xl font-semibold mb-4">Confirmed Connections</h2>
      {connections.length === 0 ? (
        <p>You have no connections yet.</p>
      ) : (
        connections.map((conn) => (
          <div key={conn._id} className="flex items-center gap-4 p-3 bg-zinc-800 rounded mb-2">
            {conn.avatar && <img src={conn.avatar} alt={conn.username} className="w-10 h-10 rounded-full" />}
            <span>{conn.name || conn.username}</span>
          </div>
        ))
      )}

      <h2 className="text-xl font-semibold mt-8 mb-4">Pending Requests</h2>
      {pendingRequests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        pendingRequests.map((req) => (
          <div key={req._id} className="flex justify-between items-center p-3 bg-zinc-800 rounded mb-2">
            <div className="flex items-center gap-4">
              {req.avatar && <img src={req.avatar} alt={req.username} className="w-10 h-10 rounded-full" />}
              <span>{req.name || req.username}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(req._id, "accept")}
                className="bg-green-500 px-3 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => handleAction(req._id, "reject")}
                className="bg-red-500 px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
