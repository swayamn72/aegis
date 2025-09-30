// src/components/FeedCard.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function FeedCard({ post }) {
  const { user, isAuthenticated } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const userHasLiked = likes.some(likeUser => likeUser._id === user?._id);

  const toggleLike = async () => {
    if (!isAuthenticated) {
      alert("Please login to like posts.");
      return;
    }
    if (isLiking) return; // prevent multiple clicks
    setIsLiking(true);
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${post._id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to toggle like");
      }
    } catch (error) {
      alert("Network error while toggling like");
    } finally {
      setIsLiking(false);
    }
  };

  const addComment = async () => {
    if (!isAuthenticated) {
      alert("Please login to comment.");
      return;
    }
    if (commentInput.trim().length === 0) {
      alert("Comment cannot be empty.");
      return;
    }
    if (isCommenting) return;
    setIsCommenting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${post._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: commentInput.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setCommentInput("");
        setShowComments(true);
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to add comment");
      }
    } catch (error) {
      alert("Network error while adding comment");
    } finally {
      setIsCommenting(false);
    }
  };

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
        <button
          onClick={toggleLike}
          disabled={isLiking}
          className={`flex items-center gap-1 transition ${
            userHasLiked ? "text-amber-400" : "hover:text-amber-400"
          }`}
          aria-label={userHasLiked ? "Unlike post" : "Like post"}
        >
          👍 {likes.length}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:text-orange-400 flex items-center gap-1 transition"
          aria-expanded={showComments}
          aria-controls={`comments-section-${post._id}`}
        >
          💬 {comments.length}
        </button>
        <button className="hover:text-red-400 flex items-center gap-1 transition">
          ↗️ Share
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div
          id={`comments-section-${post._id}`}
          className="mt-4 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-600 scrollbar-track-zinc-900"
        >
          {comments.length === 0 && (
            <p className="text-gray-400 text-sm italic">No comments yet.</p>
          )}
          {comments.map((comment, idx) => (
            <div key={idx} className="flex items-start gap-3 mb-3">
              <img
                src={comment.player?.profilePic || "/default-avatar.png"}
                alt="commenter avatar"
                className="w-8 h-8 rounded-full border border-amber-400/50"
              />
              <div>
                <p className="text-sm text-white">
                  <span className="font-semibold">{comment.player?.username}</span>{" "}
                  {comment.content}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 rounded-md bg-zinc-800 text-white px-3 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addComment();
                }
              }}
              aria-label="Add a comment"
            />
            <button
              onClick={addComment}
              disabled={isCommenting}
              className="bg-amber-400 text-black px-3 rounded-md hover:bg-amber-500 transition"
              aria-label="Post comment"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
