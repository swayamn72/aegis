import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Edit, Trash2 } from 'lucide-react';

const PostItem = ({ post, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user && post.author && user._id === post.author._id;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {(post.author?.inGameName || post.author?.username || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="text-white font-medium">
              {post.author?.inGameName || post.author?.username || 'Unknown Player'}
            </h4>
            <span className="text-zinc-400 text-sm">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(post)}
              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded-lg transition-colors"
              title="Edit post"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(post._id)}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
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
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <span key={index} className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostItem;
