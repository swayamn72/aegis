import React, { useEffect, useState } from "react";
import CommunitySidebar from "../components/CommunitySidebar";
import CommunityInfo from "../components/CommunityInfo";
import CommunityPost from "../components/CommunityPost";
import CreateCommunityPost from "../components/CreateCommunityPost";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Plus } from "lucide-react";

export default function CommunityPage() {
  const { communityId } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setLoading(true);
        const [communityRes, postsRes] = await Promise.all([
          axios.get(`/api/communities/${communityId}`),
          axios.get(`/api/community-posts/community/${communityId}`)
        ]);
        setCommunity(communityRes.data);
        setPosts(postsRes.data);
      } catch (error) {
        console.error("Error fetching community data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (communityId) fetchCommunityData();
  }, [communityId]);

  // Check membership safely
  const isMember =
    user &&
    Array.isArray(community?.members) &&
    community.members.some((member) => member._id === user._id);

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handleLeaveCommunity = async () => {
    try {
      await axios.put(`/api/communities/${communityId}/leave`);
      // Safely update members locally
      setCommunity((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members?.filter(
                (member) => member._id !== user._id
              ),
              membersCount: Math.max((prev.membersCount || 1) - 1, 0),
            }
          : prev
      );
    } catch (error) {
      console.error("Error leaving community:", error);
      alert("Failed to leave community. Please try again.");
    }
  };

  const handleJoinCommunity = async () => {
    try {
      const res = await axios.put(`/api/communities/${communityId}/join`);
      // Update community state
      setCommunity((prev) =>
        prev
          ? {
              ...prev,
              members: [...(prev.members || []), { _id: user._id, username: user.username, profilePic: user.profilePic }],
              membersCount: (prev.membersCount || 0) + 1,
            }
          : prev
      );
    } catch (error) {
      console.error("Error joining community:", error);
      alert("Failed to join community. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="text-gray-400 p-6 text-center">Loading community...</div>
    );

  if (!community)
    return <div className="text-white p-6">Community not found.</div>;

  return (
    <div className="flex bg-black min-h-screen text-white">
      {/* Left Sidebar */}
      <CommunitySidebar />

      {/* Main Feed */}
      <main className="flex-1 max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{community.name}</h1>
          {isMember && (
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </button>
          )}
        </div>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <p className="text-gray-300">No posts yet in this community.</p>
          ) : (
            posts.map((post) => <CommunityPost key={post._id} post={post} />)
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <CommunityInfo
        community={community}
        isMember={isMember}
        onLeaveCommunity={handleLeaveCommunity}
        onJoinCommunity={handleJoinCommunity}
      />

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreateCommunityPost
          communityId={communityId}
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
}
