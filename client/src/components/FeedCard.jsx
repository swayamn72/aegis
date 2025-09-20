// src/components/FeedCard.js
import React from "react";

export default function FeedCard({ post }) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-lg border border-amber-500/30 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(251,146,60,0.3)] transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center mb-4">
        <img
          src={post.avatar}
          alt="avatar"
          className="w-14 h-14 rounded-full border-2 border-amber-400/50"
        />
        <div className="ml-4">
          <p className="font-bold text-white text-lg">{post.username}</p>
          <p className="text-sm bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent font-semibold">
            {post.game}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-200 text-md mb-4">{post.content}</p>
      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="rounded-2xl mb-4 w-full object-cover shadow-md hover:scale-105 transition-transform duration-500"
        />
      )}

      {/* Actions */}
      <div className="flex justify-between text-gray-400 text-sm pt-3 border-t border-zinc-700">
        <button className="hover:text-amber-400 flex items-center gap-1 transition">
          👍 {post.likes}
        </button>
        <button className="hover:text-orange-400 flex items-center gap-1 transition">
          💬 {post.comments}
        </button>
        <button className="hover:text-red-400 flex items-center gap-1 transition">
          ↗️ Share
        </button>
      </div>
    </div>
  );
}
