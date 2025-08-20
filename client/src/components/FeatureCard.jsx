import React from 'react';
import cardBackground from '../assets/card_bg.png';

function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex flex-col relative p-3 h-[271px] w-[242px] items-center overflow-hidden">
      {/* Background image with 20% opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${cardBackground})`,
          opacity: 0.2 
        }}
      />
      
      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center">
        <img src={icon} alt={title} className="w-[62px]" />
        <h2 className="text-[24px] text-white font-kufam">{title}</h2>
        <p className="text-gray-300 text-[16px] justify-center items-center">{description}</p>
      </div>
    </div>
  );
}

export default FeatureCard;
