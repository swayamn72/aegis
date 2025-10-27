import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { Users, Target, MapPin } from 'lucide-react';

const OpportunitiesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lftPosts, setLftPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLFTPosts();
  }, []);

  const fetchLFTPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/recruitment/lft-posts', {
        credentials: 'include'
      });
      const data = await res.json();
      setLftPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching LFT posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproachPlayer = async (playerId) => {
    if (!user) {
      toast.error('Please login to approach players');
      navigate('/login');
      return;
    }

    if (!user.team) {
      toast.error('You must be in a team to approach players');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/recruitment/approach-player/${playerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: `Hi! We're interested in discussing recruitment opportunities with you.`
        })
      });

      if (response.ok) {
        toast.success('Approach request sent! Player will be notified.');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send approach');
      }
    } catch (error) {
      console.error('Error sending approach:', error);
      toast.error('Failed to send approach');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Player Recruitment</h1>
          <p className="text-zinc-400">Find talented players looking for teams</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lftPosts.map((post) => (
              <div key={post._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={post.player.profilePicture || `https://api.dicebear.com/7.x/avatars/svg?seed=${post.player.username}`}
                    alt={post.player.username}
                    className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                  />
                  <div>
                    <h3 className="text-white font-bold text-lg">{post.player.username}</h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Target className="w-3 h-3" />
                      <span>Rating: {post.player.aegisRating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <span className="text-xs text-zinc-500 uppercase">Roles</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {post.roles?.map((role, idx) => (
                        <span key={idx} className="px-2 py-1 bg-orange-500/20 border border-orange-400/30 text-orange-400 rounded text-xs">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-zinc-500 uppercase">Region</span>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      <span className="text-white text-sm">{post.region}</span>
                    </div>
                  </div>

                  {post.description && (
                    <p className="text-zinc-300 text-sm line-clamp-3">{post.description}</p>
                  )}
                </div>

                <button
                  onClick={() => handleApproachPlayer(post.player._id)}
                  className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all font-medium"
                >
                  Approach Player
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && lftPosts.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No players looking for teams at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunitiesPage;
