import React, { useState, useEffect } from 'react';

const FeaturesComponent = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      id: 1,
      title: "Verified Profiles",
      description: "Build your ultimate esports resume with API-verified stats pulled directly from game servers. Create a trusted professional profile that showcases your competitive abilities.",
      icon: "👤",
      image: "🎯",
      bgPattern: "radial-gradient(circle at 20% 80%, rgba(251,146,60,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245,101,101,0.08) 0%, transparent 50%), linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 100%)"
    },
    {
      id: 2,
      title: "Aegis Rating",
      description: "Our proprietary Elo-based rating system calculated purely from official tournament performances. The most accurate measure of your competitive skill.",
      icon: "⭐",
      image: "🏆",
      bgPattern: "radial-gradient(circle at 70% 30%, rgba(251,146,60,0.12) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(245,101,101,0.1) 0%, transparent 50%), linear-gradient(45deg, rgba(10,10,10,0.9) 0%, rgba(30,20,15,0.9) 100%)"
    },
    {
      id: 3,
      title: "Recruitment Hub",
      description: "Apply directly to esports organizations with your data-rich profile. Professional opportunities from verified teams based on objective performance metrics.",
      icon: "🎯",
      image: "🤝",
      bgPattern: "radial-gradient(circle at 40% 20%, rgba(251,146,60,0.08) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(245,101,101,0.12) 0%, transparent 50%), linear-gradient(225deg, rgba(15,10,10,0.9) 0%, rgba(25,25,25,0.9) 100%)"
    },
    {
      id: 4,
      title: "Esports Insights",
      description: "Tournament tracking, prize pool analysis, live match results, and scrim finder. Comprehensive analytics for the competitive scene.",
      icon: "📊",
      image: "📈",
      bgPattern: "radial-gradient(circle at 80% 70%, rgba(251,146,60,0.1) 0%, transparent 50%), radial-gradient(circle at 20% 30%, rgba(245,101,101,0.09) 0%, transparent 50%), linear-gradient(315deg, rgba(20,15,10,0.9) 0%, rgba(15,15,15,0.9) 100%)"
    }
  ];

  return (
    <div id="features-section" className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-500 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Dynamic gradient orb following mouse */}
      <div 
        className="fixed w-96 h-96 rounded-full opacity-20 pointer-events-none transition-all duration-300 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(251,146,60,0.3) 0%, rgba(245,101,101,0.2) 35%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          transform: 'translate(-50%, -50%)'
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block relative">
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-4 tracking-wider">
              OUR FEATURES
            </h2>
            <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse" />
          </div>
          <div className="mt-8 flex justify-center space-x-2">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className="group relative"
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card */}
              <div className={`
                relative h-80 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm
                transition-all duration-500 ease-out cursor-pointer overflow-hidden
                ${hoveredCard === feature.id ? 'transform -translate-y-4 scale-105' : ''}
              `}
              style={{
                background: feature.bgPattern
              }}>
                {/* Gaming-themed background elements */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-16 h-16 border border-amber-500/20 rounded transform rotate-45" />
                  <div className="absolute bottom-8 left-4 w-12 h-12 border border-orange-500/15 rounded-full" />
                  <div className="absolute top-1/2 left-1/4 w-2 h-8 bg-amber-500/10 transform -rotate-12" />
                  <div className="absolute bottom-1/4 right-1/3 w-6 h-2 bg-orange-500/15 rounded-full" />
                  
                  {/* Circuit-like patterns */}
                  <svg className="absolute bottom-0 right-0 w-20 h-20 text-amber-500/10" viewBox="0 0 100 100">
                    <path d="M20 20 L80 20 L80 80 M40 40 L60 40 M40 60 L60 60" stroke="currentColor" strokeWidth="1" fill="none"/>
                    <circle cx="80" cy="20" r="2" fill="currentColor"/>
                    <circle cx="40" cy="40" r="1.5" fill="currentColor"/>
                    <circle cx="60" cy="60" r="1.5" fill="currentColor"/>
                  </svg>
                </div>

                {/* Animated hex pattern overlay */}
                <div className="absolute inset-0 opacity-5">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-4 h-4 border border-amber-400 transform rotate-45"
                      style={{
                        left: `${10 + (i % 4) * 25}%`,
                        top: `${10 + Math.floor(i / 4) * 25}%`,
                        animation: `pulse ${2 + (i % 3)}s infinite ${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>

                {/* Neon border on hover */}
                <div className={`
                  absolute inset-0 rounded-2xl transition-all duration-500 z-10
                  ${hoveredCard === feature.id ? 'shadow-[0_0_30px_rgba(251,146,60,0.3)] border border-amber-500/50' : ''}
                `} />

                {/* Icon section with floating animation */}
                <div className="relative mb-6 z-20">
                  <div className={`
                    w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-red-500/20
                    border border-amber-500/30 flex items-center justify-center text-2xl
                    transition-all duration-500 relative overflow-hidden
                    ${hoveredCard === feature.id ? 'animate-pulse' : ''}
                  `}>
                    {/* Rotating border effect */}
                    <div className={`
                      absolute inset-0 rounded-full border-2 border-transparent 
                      ${hoveredCard === feature.id ? 'border-t-amber-500 border-r-orange-500 animate-spin' : ''}
                    `} />
                    
                    <span className="relative z-10">{feature.image}</span>
                  </div>
                  
                  {/* Floating particles around icon */}
                  {hoveredCard === feature.id && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-amber-400 rounded-full animate-ping"
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                            animationDelay: `${Math.random() * 1}s`
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="text-center space-y-4 relative z-20">
                  <h3 className="text-xl font-bold text-amber-400 tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div className={`
                  absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent
                  transition-all duration-500 transform scale-x-0 group-hover:scale-x-100
                `} />

                {/* Hover glow effect */}
                <div className={`
                  absolute inset-0 rounded-2xl transition-opacity duration-500 pointer-events-none
                  ${hoveredCard === feature.id ? 'opacity-100' : 'opacity-0'}
                  bg-gradient-to-t from-amber-500/5 to-transparent
                `} />
              </div>

              {/* Floating number indicator */}
              <div className={`
                absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-red-500
                flex items-center justify-center text-sm font-bold text-white shadow-lg
                transition-all duration-500 border-2 border-zinc-900
                ${hoveredCard === feature.id ? 'scale-125 shadow-amber-500/50' : ''}
              `}>
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom section with animated elements */}
        <div className="mt-20 text-center">
          <div className="flex justify-center space-x-8 opacity-60">
            {['🎮', '⚡', '🚀', '🏅', '🎯'].map((emoji, i) => (
              <div
                key={i}
                className="text-3xl transform transition-all duration-300 hover:scale-125 hover:rotate-12 cursor-pointer"
                style={{
                  animation: `bounce 2s infinite ${i * 0.5}s`
                }}
              >
                {emoji}
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-400 text-sm font-medium">Powered by competitive data</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default FeaturesComponent;