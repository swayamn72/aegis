import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostItem from './PostItem';

const PostList = ({ playerId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchPosts();
  }, [playerId]);

  if (loading) return <div>Loading posts...</div>;
  if (posts.length === 0) return <div>No posts to display.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {posts.map(post => (
        <PostItem key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostList;