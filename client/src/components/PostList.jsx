import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostItem from './PostItem';

const PostList = ({ playerId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      let response;
      if (playerId) {
        // Fetch posts for a specific player
        response = await axios.get(`/api/posts/player/${playerId}`);
      } else {
        // Fetch all posts
        response = await axios.get('/api/posts');
      }
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [playerId]);

  const handleEdit = (post) => {
    // For simplicity, prompt for new caption
    const newCaption = prompt('Edit your post caption:', post.caption);
    if (newCaption !== null) {
      // Update post via API
      axios.put(`/api/posts/${post._id}`, { caption: newCaption })
        .then(response => {
          // Update local state
          setPosts(posts.map(p => p._id === post._id ? response.data.post : p));
        })
        .catch(error => {
          console.error('Error updating post:', error);
          alert('Failed to update post.');
        });
    }
  };

  const handleDelete = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      axios.delete(`/api/posts/${postId}`)
        .then(() => {
          setPosts(posts.filter(p => p._id !== postId));
        })
        .catch(error => {
          console.error('Error deleting post:', error);
          alert('Failed to delete post.');
        });
    }
  };

  if (loading) return <div className="text-center py-8 text-zinc-400">Loading posts...</div>;
  if (posts.length === 0) return <div className="text-center py-8 text-zinc-400">No posts to display.</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {posts.map(post => (
        <PostItem key={post._id} post={post} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default PostList;
