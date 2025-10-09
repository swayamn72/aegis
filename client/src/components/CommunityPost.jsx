import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CommunityPost = ({ post }) => {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(user ? post.likes?.some(likeId => likeId === user._id) : false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);

  const handleLikeToggle = async () => {
    if (!user) {
      alert('Please login to like posts.');
      return;
    }
    const originalLiked = liked;
    const originalLikesCount = likesCount;
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    setLoadingLike(true);
    try {
      const res = await axios.put(`/api/community-posts/${post._id}/like`);
      setLikesCount(res.data.likes);
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like. Please try again.');
      setLiked(originalLiked);
      setLikesCount(originalLikesCount);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      alert('Please login to comment.');
      return;
    }
    if (commentInput.trim() === '') {
      alert('Comment cannot be empty.');
      return;
    }
    const newComment = {
      player: { username: user.username, profilePic: user.profilePic },
      content: commentInput.trim(),
    };
    const originalComments = [...comments];
    setComments(prev => [...prev, newComment]);
    setCommentInput('');
    setShowComments(true);
    setLoadingComment(true);
    try {
      const res = await axios.post(`/api/community-posts/${post._id}/comment`, { content: commentInput.trim() });
      setComments(prev => prev.map(c => c === newComment ? res.data.comment : c));
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
      setComments(originalComments);
      setCommentInput(commentInput.trim());
    } finally {
      setLoadingComment(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {(post.author?.username || 'U')[0].toUpperCase()}
          </span>
        </div>
        <div>
          <h4 className="text-white font-medium">
            {post.author?.username || 'Unknown Player'}
          </h4>
          <span className="text-zinc-400 text-sm">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <p className="text-zinc-300 mb-4 leading-relaxed">{post.caption}</p>

      {post.media && post.media.length > 0 && (
        <div className="mb-4 space-y-3">
          {post.media.map((item, index) => (
            <div key={index}>
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt="Post media"
                  className="w-full max-w-md rounded-lg border border-zinc-700"
                />
              ) : (
                <video
                  controls
                  src={item.url}
                  className="w-full max-w-md rounded-lg border border-zinc-700"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span key={index} className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-zinc-400 mb-4">
        <button
          onClick={handleLikeToggle}
          disabled={loadingLike}
          className={`flex items-center gap-2 transition-colors ${liked ? 'text-red-400' : 'hover:text-red-400'}`}
        >
          <ChevronUp className="w-5 h-5" />
          <span>{likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 hover:text-blue-400 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4">
          <div className="mb-2">
            {comments.length === 0 ? (
              <p className="text-gray-400 text-sm">No comments yet.</p>
            ) : (
              comments.map((comment, idx) => (
                <div key={idx} className="mb-2 border-b border-zinc-700 pb-2">
                  <p className="text-sm text-white font-semibold">{comment.player?.username || 'Unknown'}</p>
                  <p className="text-gray-300 text-sm">{comment.content}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-600"
            />
            <button
              onClick={handleAddComment}
              disabled={loadingComment}
              className="px-4 py-2 bg-cyan-600 rounded hover:bg-cyan-700 transition-colors disabled:opacity-50"
            >
              {loadingComment ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPost;
