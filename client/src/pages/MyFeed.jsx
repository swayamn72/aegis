import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import FeedCard from "../components/FeedCard";
import { mockPosts } from "../data/mockPosts";
import { mockTournaments, mockNews } from "../data/mockData";
import RightSideBar from "../components/RightSideBar";

export default function MyFeedPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadMorePosts = () => {
    setLoading(true);
    setTimeout(() => {
      const start = (page - 1) * 2;
      const end = page * 2;
      const newPosts = mockPosts.slice(start, end);
      setPosts((prev) => [...prev, ...newPosts]);
      setPage((prev) => prev + 1);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadMorePosts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 50 >=
        document.documentElement.offsetHeight
      ) {
        if (!loading) loadMorePosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, page]);

  return (
    <div className="flex bg-black">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main + Right Sidebar Wrapper */}
      <main className="ml-64 w-full min-h-screen bg-gradient-to-b from-black via-zinc-900/80 to-black px-6 py-10">
        <div className="flex gap-6">
          
          {/* Feed (center column) */}
          <div className="flex-1 max-w-2xl mx-auto">
            {posts.map((post) => (
              <FeedCard key={post.id} post={post} />
            ))}

            {loading && (
              <div className="flex justify-center py-6">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

        
          <RightSideBar tournaments={mockTournaments} news={mockNews} />
        </div>
      </main>
    </div>
  );
}
