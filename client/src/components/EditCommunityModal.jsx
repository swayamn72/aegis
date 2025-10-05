import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const EditCommunityModal = ({ community, onClose, onCommunityUpdated }) => {
  const [name, setName] = useState(community?.name || '');
  const [description, setDescription] = useState(community?.description || '');
  const [image, setImage] = useState(community?.image || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (community) {
      setName(community.name);
      setDescription(community.description);
      setImage(community.image);
    }
  }, [community]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Community name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.put(`/api/communities/${community._id}`, {
        name: name.trim(),
        description: description.trim(),
        image: image.trim(),
      });
      onCommunityUpdated(res.data.community);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-[#120E0E] p-6 rounded-lg w-full max-w-md mx-4 z-[10000]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Edit Community</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Community Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-[#FF4500] focus:outline-none"
              placeholder="Enter community name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-[#FF4500] focus:outline-none resize-none"
              placeholder="Describe your community"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Image URL (optional)
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-[#FF4500] focus:outline-none"
              placeholder="https://example.com/image.png"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#FF4500] text-white rounded hover:bg-[#e03e00] transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCommunityModal;
