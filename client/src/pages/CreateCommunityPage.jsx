import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const CreateCommunityPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Community name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/communities', {
        name: name.trim(),
        description: description.trim(),
        image: image.trim(),
      });
      // Navigate to the newly created community
      navigate(`/community/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-black min-h-screen text-white">
      <Sidebar />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-8">
        <div className="bg-[#120E0E] p-8 rounded-lg">
          <h1 className="text-3xl font-bold mb-6">Create a Community</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Community Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-[#FF4500] focus:outline-none"
                placeholder="Enter community name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-[#FF4500] focus:outline-none resize-none"
                placeholder="Describe your community"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-[#FF4500] focus:outline-none"
                placeholder="https://example.com/image.png"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-[#FF4500] text-white rounded hover:bg-[#e03e00] transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Community'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateCommunityPage;
