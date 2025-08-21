import React, { useState, useEffect } from 'react';

const HeroComponent = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    setIsLoaded(true);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Your actual background image
  const BackgroundImage = () => (
    <img 
      className="h-full w-full object-cover opacity-20" 
      src="/src/assets/esports_stage.png" 
      alt="Esports Arena Background" 
    />
  );

  return (
    <div className="relative h-screen overflow-hidden mt-20">
      {/* Background Image */}
      <BackgroundImage />
      
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      
      {/* Dynamic gradient overlay following mouse */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%, 
            rgba(251,146,60,0.1) 0%, 
            rgba(245,101,101,0.05) 40%, 
            transparent 70%)`
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full animate-pulse opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Geometric elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-10 w-32 h-32 border border-amber-500/30 rounded transform rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-1/4 right-16 w-24 h-24 border border-orange-500/20 rounded-full animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-gradient-to-br from-amber-500/20 to-red-500/20 rounded-lg transform -rotate-12" />
        
        {/* Circuit-like patterns */}
        <svg className="absolute top-10 right-10 w-40 h-40 text-amber-500/10" viewBox="0 0 100 100">
          <path d="M20 20 L80 20 L80 80 M40 40 L60 40 M40 60 L60 60" stroke="currentColor" strokeWidth="1" fill="none"/>
          <circle cx="80" cy="20" r="2" fill="currentColor"/>
          <circle cx="40" cy="40" r="1.5" fill="currentColor"/>
          <circle cx="60" cy="60" r="1.5" fill="currentColor"/>
        </svg>
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
        
        {/* Main Heading */}
        <div className={`transition-all duration-1000 ${isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'}`}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-wider leading-tight">
            <span className="block text-white drop-shadow-2xl">
              ESPORTS ARENA IS CALLING
            </span>
            <span className="block bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent mt-2 relative">
              STEP IN AND RISE
              {/* Underline effect */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse" />
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className={`mt-8 transition-all duration-1000 delay-300 ${isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'}`}>
          <p className="max-w-3xl text-lg md:text-xl text-zinc-200 leading-relaxed font-medium">
            The ultimate platform to showcase <span className="text-amber-400 font-semibold">verified skills</span>, find teams, and build a <span className="text-orange-400 font-semibold">pro career</span>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className={`mt-12 flex flex-col sm:flex-row justify-center gap-6 transition-all duration-1000 delay-500 ${isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'}`}>
          
          {/* Create Profile Button */}
          <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg rounded-full overflow-hidden transition-all duration-300 hover:from-blue-700 hover:to-cyan-600 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-blue-500/30">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>Create Profile</span>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </span>
          </button>

          {/* Explore Aegis Button */}
          <button 
            onClick={scrollToFeatures}
            className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold text-lg rounded-full overflow-hidden transition-all duration-300 hover:from-green-700 hover:to-emerald-600 hover:scale-105 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] border border-green-500/30"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative z-10 flex items-center justify-center space-x-2">
              <span>Explore Aegis</span>
              <div className="transform group-hover:translate-x-1 transition-transform duration-300">→</div>
            </span>
          </button>
        </div>

        {/* Bottom indicator */}
        <div className={`mt-16 transition-all duration-1000 delay-700 ${isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'}`}>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <p className="text-zinc-400 text-sm font-medium">Scroll to explore features</p>
          </div>
        </div>
      </div>

      {/* Bottom fade gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
    </div>
  );
};

export default HeroComponent;