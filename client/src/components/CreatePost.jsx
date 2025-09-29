import React, { useState } from 'react';
import { X, Image, Video, FileText, Send } from 'lucide-react';

const CreatePost = ({ onClose }) => {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      // Prepare form data for file uploads
      const formData = new FormData();
      formData.append('caption', content.trim());

      // Add files to form data
      selectedFiles.forEach((file) => {
        formData.append('media', file);
      });

      // Add tags (extract hashtags from content)
      const hashtags = content.match(/#\w+/g) || [];
      formData.append('tags', JSON.stringify(hashtags));

      const response = await fetch('/api/posts/', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const result = await response.json();
      console.log('Post created:', result);

      // Reset form and close modal
      setContent('');
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      // TODO: Show error message to user
      alert(`Error creating post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Text Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-white placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            rows={4}
          />

          {/* File Attachments */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">Attachments:</p>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 bg-zinc-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      {file.type.startsWith('image/') && <Image className="w-4 h-4 text-cyan-400" />}
                      {file.type.startsWith('video/') && <Video className="w-4 h-4 text-purple-400" />}
                      {file.type === 'application/pdf' && <FileText className="w-4 h-4 text-red-400" />}
                      <span className="text-sm text-zinc-300 truncate max-w-48">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-zinc-700 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-zinc-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div className="flex gap-2">
              <label className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors">
                <Image className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-zinc-300">Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />
              </label>
              <label className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors">
                <Video className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-zinc-300">Video</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />
              </label>
              <label className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors">
                <FileText className="w-4 h-4 text-red-400" />
                <span className="text-sm text-zinc-300">Document</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={(!content.trim() && selectedFiles.length === 0) || isSubmitting}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
