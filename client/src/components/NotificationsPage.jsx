import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/connections/requests", {
        credentials: "include", // sends JWT cookie
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  const handleAction = async (playerId, action) => {
    try {
      const res = await fetch(`http://localhost:5000/api/connections/${action}/${playerId}`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        // Remove the request from state after action
        setRequests((prev) => prev.filter((req) => req._id !== playerId));
      }
    } catch (err) {
      console.error(`Error ${action} request:`, err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      {requests.length === 0 ? (
        <p>No new connection requests</p>
      ) : (
        requests.map((req) => (
          <div
            key={req._id}
            className="flex justify-between items-center p-4 bg-zinc-800 rounded-lg mb-4"
          >
            <div className="flex items-center gap-3">
              {req.avatar && (
                <img
                  src={req.avatar}
                  alt={req.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <span className="font-medium">{req.username || req.name}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(req._id, "accept")}
                className="bg-green-500 px-3 py-1 rounded hover:bg-green-600 transition"
              >
                Accept
              </button>
              <button
                onClick={() => handleAction(req._id, "reject")}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
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
