import React, { useState } from 'react';
import axios from 'axios';

const CreatePost = ({ authToken }) => {
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState([{ type: 'image', url: '' }]);
  const [tags, setTags] = useState('');

  const handleMediaChange = (index, event) => {
    const newMedia = [...media];
    newMedia[index][event.target.name] = event.target.value;
    setMedia(newMedia);
  };

  const addMediaField = () => {
    setMedia([...media, { type: 'image', url: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!authToken) {
        alert("You must be logged in to create a post.");
        return;
      }
      
      // Filter out empty media URLs before sending
      const validMedia = media.filter(m => m.url);

      await axios.post('/api/posts', {
        caption,
        media: validMedia,
        tags: tags.split(',').map(tag => tag.trim())
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      alert('Post created successfully!');
      setCaption('');
      setMedia([{ type: 'image', url: '' }]);
      setTags('');
    } catch (error) {
      console.error('Error creating post:', error.response?.data || error.message);
      alert('Failed to create post.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Create a New Post</h2>
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="What's on your mind?"
        required
        style={{ width: '100%', minHeight: '100px', marginBottom: '10px', padding: '10px' }}
      ></textarea>
      
      {media.map((item, index) => (
        <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
          <select 
            name="type" 
            value={item.type} 
            onChange={e => handleMediaChange(index, e)}
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <input 
            type="text" 
            name="url" 
            value={item.url} 
            onChange={e => handleMediaChange(index, e)} 
            placeholder="Media URL" 
            style={{ flexGrow: 1, padding: '10px' }}
          />
        </div>
      ))}
      <button type="button" onClick={addMediaField} style={{ marginBottom: '10px' }}>Add another media</button>

      <input
        type="text"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma-separated)"
        style={{ width: '100%', margin: '10px 0', padding: '10px' }}
      />
      
      <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' }}>Create Post</button>
    </form>
  );
};

export default CreatePost;