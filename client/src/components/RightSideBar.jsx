// src/components/RightSidebar.js
import React from "react";

export default function RightSidebar({ tournaments, news }) {
  return (
    <aside className="hidden lg:flex flex-col w-80 ml-6 mt-10 space-y-6 sticky top-24">
      
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

    </aside>
  );
}
