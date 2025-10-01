
import React, { useState, useEffect } from "react";
import {Link} from "react-router-dom";
import axios from "axios";


export default function RightSidebar({ tournaments, news, communities }) {
  const [realCommunities, setRealCommunities] = useState([]);

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await axios.get("/api/communities");
        setRealCommunities(res.data.slice(0, 3)); // Show first 3 communities
      } catch (error) {
        console.error("Error fetching communities:", error);
        // Fallback to mock data if API fails
        setRealCommunities(communities);
      }
    }

    fetchCommunities();
  }, [communities]);
  return (
    <aside className="hidden lg:flex flex-col w-80 ml-6 mt-5 space-y-6 sticky top-10">

            {/* Trending Gaming News */}
      <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl p-4 border border-orange-500/30 shadow-md">
        <h2 className="text-white font-bold text-lg mb-3">📰 Trending News</h2>
        <ul className="space-y-2">
          {news.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            >
              <div className="flex-1">
                <p className="text-gray-200 font-medium">{item.title}</p>
                <p className="text-gray-400 text-xs mt-1">{item.source}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Trending Tournaments */}
      <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl p-4 border border-amber-500/30 shadow-md">
        <h2 className="text-white font-bold text-lg mb-3">🏆 Trending Tournaments</h2>
        <ul className="space-y-2">
          {tournaments.map((tour, i) => (
            <li
              key={i}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            >
              <img
                src={tour.image}
                alt=""
                className="w-10 h-10 rounded-lg border border-amber-400/50"
              />
              <div>
                <p className="text-gray-200 font-medium">{tour.name}</p>
                <p className="text-gray-400 text-sm">{tour.date}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>


{/* Trending Communities */}
<div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/30 shadow-md">
  <h2 className="text-white font-bold text-lg mb-3">🌐 Trending Communities</h2>
  <ul className="space-y-3">
    {realCommunities.map((com, i) => (
      <li
        key={com._id || i}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
      >

         <Link to={`/community/${com._id}`} className="flex items-center gap-3 flex-1">
        <img
          src={com.image}
          alt={com.name}
          className="w-10 h-10 rounded-lg border border-cyan-400/50"
        />
        <div className="flex-1">
          <p className="text-gray-200 font-medium">{com.name}</p>
          <p className="text-gray-400 text-xs">{com.membersCount} members</p>
        </div>
          </Link>
        <button className="text-xs px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full">
          Join
        </button>
      </li>
    ))}
  </ul>
</div>


    </aside>
  );
}
