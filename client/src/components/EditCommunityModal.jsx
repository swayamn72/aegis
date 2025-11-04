import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

const EditCommunityModal = ({ community, onClose, onCommunityUpdated }) => {
  const [name, setName] = useState(community?.name || '');
  const [description, setDescription] = useState(community?.description || '');
  const [image, setImage] = useState(community?.image || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(community?.image || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (community) {
      setName(community.name);
      setDescription(community.description);
      setImage(community.image);
    }
  }, [community]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setImage(''); // Clear URL if file is selected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Community name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let finalImageUrl = image;

      // If a file is selected, upload it first
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalImageUrl = uploadRes.data.url;
      }

      const res = await axios.put(`/api/communities/${community._id}`, {
        name: name.trim(),
        description: description.trim(),
        image: finalImageUrl.trim(),
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
              Community Profile Picture
            </label>
            <div className="space-y-3">
              {/* Current/Preview Image */}
              {previewUrl && (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Community preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-zinc-600"
                  />
                </div>
              )}

              {/* File Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="community-image-upload"
                />
                <label
                  htmlFor="community-image-upload"
                  className="flex items-center justify-center w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                  <Upload className="w-5 h-5 text-zinc-400 mr-2" />
                  <span className="text-zinc-300">Upload Image</span>
                </label>
              </div>

              {/* URL Input */}
              <div className="text-center text-zinc-500 text-sm">or</div>
              <input
                type="url"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  setSelectedFile(null);
                  setPreviewUrl(e.target.value);
                }}
                className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-[#FF4500] focus:outline-none"
                placeholder="Enter image URL"
              />
            </div>
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
