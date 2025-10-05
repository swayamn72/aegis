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
    async function fetchCommunityData() {
      try {
        setLoading(true);
        const communityRes = await axios.get(`/api/communities/${communityId}`);
        setCommunity(communityRes.data);

        const postsRes = await axios.get(`/api/community-posts/community/${communityId}`);
        setPosts(postsRes.data);
      } catch (error) {
        console.error("Error fetching community data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (communityId) {
      fetchCommunityData();
    }
  }, [communityId]);

  const isMember = user && community?.members?.some(member => member._id === user._id);

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  if (loading) {
    return <div className="text-white p-6">Loading community...</div>;
  }

  if (!community) {
    return <div className="text-white p-6">Community not found.</div>;
  }

  return (
    <div className="flex bg-black min-h-screen text-white">
      {/* Left Sidebar - Channels */}
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
            posts.map((post) => (
              <CommunityPost key={post._id} post={post} />
            ))
          )}
        </div>
      </main>

      {/* Right Sidebar - Community Info */}
      <CommunityInfo community={community} />

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
