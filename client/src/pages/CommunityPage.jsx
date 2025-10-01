import React, { useEffect, useState } from "react";
import CommunitySidebar from "../components/CommunitySidebar";
import CommunityInfo from "../components/CommunityInfo";
import CommunityPost from "../components/CommunityPost";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function CommunityPage() {
  const { communityId } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-3xl font-bold mb-6">{community.name}</h1>

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
    </div>
  );
}
