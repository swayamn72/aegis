import React from 'react';

const PostItem = ({ post }) => {
  return (
    <div style={{ border: '1px solid #e0e0e0', padding: '15px', margin: '15px 0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ margin: 0, color: '#333' }}>
          {post.author?.inGameName || post.author?.username || 'Unknown Player'}
        </h4>
        <span style={{ fontSize: '0.8em', color: '#888', marginLeft: 'auto' }}>
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <p style={{ margin: '0 0 10px 0', color: '#555' }}>{post.caption}</p>
      
      <div style={{ marginBottom: '10px' }}>
        {post.media.map((item, index) => (
          <div key={index} style={{ marginBottom: '5px' }}>
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt="Post media" 
                style={{ width: '100%', maxWidth: '600px', height: 'auto', display: 'block', borderRadius: '4px' }} 
              />
            ) : (
              <video 
                controls 
                src={item.url} 
                style={{ width: '100%', maxWidth: '600px', height: 'auto', display: 'block', borderRadius: '4px' }} 
              />
            )}
          </div>
        ))}
      </div>
      
      <div style={{ fontStyle: 'italic', fontSize: '0.9em', color: '#aaa' }}>
        {post.tags.map((tag, index) => (
          <span key={index} style={{ marginRight: '5px', background: '#f0f0f0', padding: '3px 8px', borderRadius: '12px' }}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PostItem;