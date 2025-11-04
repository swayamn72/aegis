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
  const [activeChannel, setActiveChannel] = useState('General');
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        setLoading(true);
        const [communityRes, postsRes] = await Promise.all([
          axios.get(`/api/communities/${communityId}`),
          axios.get(`/api/community-posts/community/${communityId}?channel=${activeChannel}`)
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
  }, [communityId, activeChannel]);

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
    <div className="min-h-screen bg-black text-white font-[Inter] relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-[0.15]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none"></div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Sidebar */}
        <CommunitySidebar
          community={community}
          postsCount={posts.length}
          onChannelChange={setActiveChannel}
          activeChannel={activeChannel}
        />

        {/* Main Feed */}
        <main className="flex-1 max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-zinc-500"></span>{" "}
                <span className="text-[#FF4500]">{community.name}</span>
              </h1>
              <p className="text-zinc-600 text-sm uppercase tracking-[0.3em] font-medium">
                CONNECT • SHARE • DOMINATE
              </p>
            </div>
            {isMember && (
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FF4500] hover:bg-[#FF4500]/90 rounded-lg transition-all font-semibold"
              >
                <Plus className="w-4 h-4" />
                Create Post
              </button>
            )}
          </div>

          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-12 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-zinc-400" />
                </div>
                <p className="text-zinc-400 text-lg mb-2">No posts yet</p>
                <p className="text-zinc-600 text-sm">Be the first to share something in this community!</p>
              </div>
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
    </div>
  );
}
