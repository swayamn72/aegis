import React from "react";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";


const PlayerPosts = ({playerId}) => {

const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);


useEffect(() => {
const fetchPosts = async () => {
    try {
        const res = await axios.get(`http://localhost:5000/api/posts/player/${playerId}`);
        setPosts(res.data);
    } catch (error) {
        console.error("Error fetching player posts",error);
        
    }finally{
        setLoading(false);
    }
};

if(playerId) fetchPosts();

},[playerId]);


  if (loading) return <p className="text-gray-400">Loading posts...</p>;

  if (posts.length === 0) return <p className="text-gray-400">No posts yet.</p>;



 return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post._id} className="bg-gray-800 p-4 rounded-xl text-white">
          <p className="text-lg">{post.caption}</p>
          {post.media.length > 0 && (
            <img
              src={post.media[0]}
              alt="media"
              className="rounded mt-2 max-h-64 object-cover"
            />
          )}
          <p className="text-sm text-gray-400 mt-2">
            Tags: {post.tags.join(", ")}
          </p>
          <p className="text-xs text-gray-500">Posted on {new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );





};

export default PlayerPosts;