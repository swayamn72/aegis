import React from 'react';

function GlowingButton({ children }) {
  return (
    // The outer div creates the gradient border effect.
    <div className="rounded-full p-[2px] bg-gradient-to-r from-cyan-400 to-blue-500">
      
      {/* This inner div is the key.
        - bg-black/20: A very transparent black background (20% opacity).
        - backdrop-blur-sm: Blurs whatever is BEHIND the element.
      */}
      <div className="flex items-center justify-center rounded-full bg-black/20 px-8 py-3 backdrop-blur-sm">
        
        <span className="font-semibold text-white">
          {children}
        </span>
        
      </div>
    </div>
  );
}

export default GlowingButton;
