import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import FeedCard from "../components/FeedCard";
import RightSideBar from "../components/RightSideBar";
import { mockTournaments, mockNews } from "../data/mockData";
import { mockCommunities } from "../data/mockCommunities";

export default function MyFeedPage() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadMorePosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/feed/myfeed?page=${page}&limit=2`,
        {
          method: "GET",
          credentials: "include", // important!
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to fetch feed");
      }

      const data = await res.json();

      // Filter out duplicates by _id before appending
      setPosts((prev) => {
        const existingIds = new Set(prev.map((post) => post._id));
        const filteredNewPosts = data.filter((post) => !existingIds.has(post._id));
        return [...prev, ...filteredNewPosts];
      });

      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Error fetching feed:", err.message);
    } finally {
      setLoading(false);
    }
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
      <Sidebar />

      <main className="ml-64 w-full min-h-screen bg-gradient-to-b from-black via-zinc-900/80 to-black px-6 py-10">
        <div className="flex gap-6">
          <div className="flex-1 max-w-2xl mx-auto">
            {posts.map((post) => (
              <FeedCard key={post._id} post={post} />
            ))}

            {loading && (
              <div className="flex justify-center py-6">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <RightSideBar
            tournaments={mockTournaments}
            news={mockNews}
            communities={mockCommunities}
          />
        </div>
      </main>
    </div>
  );
}
