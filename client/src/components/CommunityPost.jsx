import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';

const CommunityPost = ({ post }) => {
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

      <div className="flex items-center gap-4 text-zinc-400">
        <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
          <Heart className="w-5 h-5" />
          <span>{post.likes?.length || 0}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments?.length || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default CommunityPost;
