// src/components/FeedCard.js
import React from "react";

export default function FeedCard({ post }) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-lg border border-amber-500/30 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(251,146,60,0.3)] transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center mb-4">
        <img
          src={post.author?.profilePic || "/default-avatar.png"}
          alt="avatar"
          className="w-14 h-14 rounded-full border-2 border-amber-400/50"
        />
        <div className="ml-4">
          <p className="font-bold text-white text-lg">{post.author?.username}</p>
          <p className="text-sm text-gray-400">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Caption */}
      <p className="text-gray-200 text-md mb-4">{post.caption}</p>

      {/* Media (image or video) */}
      {post.media?.map((m, i) =>
        m.type === "image" ? (
          <img
            key={i}
            src={m.url}
            alt="post"
            className="rounded-2xl mb-4 w-full object-cover shadow-md hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <video
            key={i}
            src={m.url}
            controls
            className="rounded-2xl mb-4 w-full shadow-md"
          />
        )
      )}

      {/* Actions */}
      <div className="flex justify-between text-gray-400 text-sm pt-3 border-t border-zinc-700">
        <button className="hover:text-amber-400 flex items-center gap-1 transition">
          👍 {post.likes?.length || 0}
        </button>
        <button className="hover:text-orange-400 flex items-center gap-1 transition">
          💬 {post.comments?.length || 0}
        </button>
        <button className="hover:text-red-400 flex items-center gap-1 transition">
          ↗️ Share
        </button>
      </div>
    </div>
  );
}
