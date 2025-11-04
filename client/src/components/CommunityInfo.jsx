import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import EditCommunityModal from "./EditCommunityModal";
import axios from "axios";

export default function CommunityInfo({ community, isMember, onLeaveCommunity, onJoinCommunity }) {
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
      <aside className="hidden lg:flex flex-col w-72 bg-zinc-950 border-l border-zinc-800/50 p-6">
        {/* Community Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            {community?.image ? (
              <img
                src={community.image}
                alt={community.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {community?.name?.[0]?.toUpperCase() || 'C'}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{community?.name}</h2>
              <p className="text-zinc-400 text-sm">Community</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">About</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {community?.description || "No description available."}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Members</span>
            <span className="text-white font-semibold">{community?.membersCount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Created</span>
            <span className="text-white text-sm">
              {community?.createdAt ? new Date(community.createdAt).toLocaleDateString() : "Unknown"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Admin</span>
            <span className="text-white text-sm">{community?.admin?.username || "Unknown"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isAdmin && (
            <>
              <button
                onClick={handleEdit}
                className="w-full px-4 py-3 bg-[#FF4500] hover:bg-[#FF4500]/90 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                Edit Community
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Deleting..." : "Delete Community"}
              </button>
            </>
          )}

          {isMember && !isAdmin && (
            <button
              onClick={onLeaveCommunity}
              className="w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-all"
            >
              Leave Community
            </button>
          )}

          {!isMember && user && (
            <button
              onClick={onJoinCommunity}
              className="w-full px-4 py-3 bg-[#FF4500] hover:bg-[#FF4500]/90 text-white rounded-lg font-semibold transition-all"
            >
              Join Community
            </button>
          )}
        </div>
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
