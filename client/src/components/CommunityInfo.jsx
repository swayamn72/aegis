import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import EditCommunityModal from "./EditCommunityModal";
import axios from "axios";

export default function CommunityInfo({ community }) {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = user && community?.admin?._id === user._id;

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleCommunityUpdated = (updatedCommunity) => {
    setShowEditModal(false);
    // You might want to refresh the page or update the community state
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this community? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`/api/communities/${community._id}`);
      // Redirect to communities page
      window.location.href = "/communities";
    } catch (error) {
      console.error("Error deleting community:", error);
      alert("Failed to delete community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col w-72 bg-[#120E0E] border-l border-zinc-800/50 p-6">
        <h2 className="text-xl font-bold mb-4">About</h2>
        <p className="text-gray-400 text-sm mb-4">
          {community?.description || "No description available."}
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Members</h3>
          <p className="text-gray-300">{community?.membersCount || 0}</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Created</h3>
          <p className="text-gray-300 text-sm">
            {community?.createdAt ? new Date(community.createdAt).toLocaleDateString() : "Unknown"}
          </p>
        </div>

        {isAdmin && (
          <div className="space-y-2">
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Edit Community
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Delete Community"}
            </button>
          </div>
        )}
      </aside>

      {showEditModal && (
        <EditCommunityModal
          community={community}
          onClose={() => setShowEditModal(false)}
          onCommunityUpdated={handleCommunityUpdated}
        />
      )}
    </>
  );
}
