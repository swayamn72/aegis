import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Trophy, Users, TrendingUp, Gamepad2, Swords } from 'lucide-react';

const AegisCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const autoPlayRef = useRef();

  const slides = [
    {
      id: 1,
      heading: "Welcome to the Heart of Gaming",
      content: "Aegis is the home for every gaming enthusiast. Whether you're a competitive player, a rising star, or a dedicated fan, this is where you connect with the community.",
      icon: <Gamepad2 className="w-16 h-16" />,
      gradient: "from-orange-500 to-red-600",
      mockupType: "welcome"
    },
    {
      id: 2,
      heading: "The Aegis Rating: Explained",
      content: "Our unique Aegis Rating analyzes in-game performance to create a single, reliable score of true skill. It's the ultimate benchmark to track, compare, and discover talent.",
      icon: <TrendingUp className="w-16 h-16" />,
      gradient: "from-red-500 to-orange-600",
      mockupType: "rating"
    },
    {
      id: 3,
      heading: "Showcase Your Gaming Legacy",
      content: "Build your professional player card. Link your accounts, highlight your achievements, and watch your Aegis Rating grow as you compete.",
      icon: <Trophy className="w-16 h-16" />,
      gradient: "from-orange-600 to-yellow-500",
      mockupType: "profile"
    },
    {
      id: 4,
      heading: "All Your Games, One Platform",
      content: "Track your performance across a wide range of popular esports titles, including Valorant, BGMI, CS2, League of Legends, Dota 2, and Call of Duty.",
      icon: <Swords className="w-16 h-16" />,
      gradient: "from-cyan-500 to-blue-600",
      mockupType: "gamesGrid"
    },
    {
      id: 5,
      heading: "Discover Tomorrow's Legends",
      content: "Surf a universe of player profiles. Use the Aegis Rating to scout for undiscovered talent, follow the progress of your favorite players, and see who's climbing the ranks.",
      icon: <Star className="w-16 h-16" />,
      gradient: "from-red-600 to-orange-500",
      mockupType: "discover"
    },
    {
      id: 6,
      heading: "Connect, Compete, Get Recognized",
      content: "Find your next teammate, recruit new talent, or simply follow the action. Your journey into the competitive scene starts now. What will your role be?",
      icon: <Users className="w-16 h-16" />,
      gradient: "from-orange-500 to-red-500",
      mockupType: "connect"
    }
  ];

  // Effect for mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };
    
    const node = containerRef.current;
    if (node) {
      node.addEventListener('mousemove', handleMouseMove);
      return () => {
        node.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []); // Dependency array is empty, which is correct.


  // Effect for autoplay
  useEffect(() => {
    autoPlayRef.current = nextSlide;
  });

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
        interval = setInterval(() => {
            if (autoPlayRef.current) {
                autoPlayRef.current();
            }
        }, 6000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextClick = () => {
    setIsAutoPlaying(false);
    nextSlide();
  };

  const handlePrevClick = () => {
    setIsAutoPlaying(false);
    prevSlide();
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
  };

  // --- MOCKUP COMPONENTS ---
  const MiniProfileCard = () => (
    <div className="w-80 bg-gray-900/60 backdrop-blur-lg rounded-2xl p-5 shadow-2xl border border-orange-500/20 transform rotate-6 transition-transform duration-500 hover:rotate-3 hover:scale-105">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
          {/* Mascot */}
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full"></div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-bold text-xl">Zyaxxxx</h3>
            {/* Verified Checkmark */}
            <div className="bg-gradient-to-r from-orange-400 to-red-500 p-1 rounded-full shadow-md shadow-orange-400/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
          </div>
          <p className="text-orange-400 text-sm">@Swayam Nakte</p>
        </div>
      </div>
  
      {/* Rating */}
      <div className="bg-gradient-to-r from-orange-600 to-yellow-500 rounded-lg p-3 mb-4 text-center shadow-md shadow-yellow-500/20">
        <div className="text-white font-bold text-2xl">2847</div>
        <div className="text-yellow-100 text-sm font-semibold">Aegis Rating</div>
      </div>
  
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 text-center mb-4">
          <div className="bg-black/30 rounded-lg p-2 border border-white/10">
              <div className="text-white font-bold text-lg">73.2%</div>
              <div className="text-gray-400 text-xs">Win Rate</div>
          </div>
          <div className="bg-black/30 rounded-lg p-2 border border-white/10">
              <div className="text-white font-bold text-lg">34</div>
              <div className="text-gray-400 text-xs">Tournaments</div>
          </div>
      </div>

      {/* Status Badge */}
      <div className="inline-flex items-center justify-center w-full px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
        <span className="text-green-400 text-sm font-medium">Looking for Team</span>
      </div>
    </div>
  );

  const RatingChart = () => (
    <div className="w-80 bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-orange-500/20 transform -rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-105">
      <h3 className="text-orange-400 font-bold mb-4">Performance Analytics</h3>
      <div className="space-y-3">
        {[["Skill Level", "w-5/6"], ["Consistency", "w-4/5"], ["Growth", "w-3/4"]].map(([label, width]) => (
          <div key={label} className="flex justify-between items-center"><span className="text-gray-300">{label}</span><div className="w-32 bg-black/30 rounded-full h-2 border border-white/10"><div className={`bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full ${width}`}></div></div></div>
        ))}
      </div>
    </div>
  );

  const DiscoverGrid = () => (
    <div className="w-72 bg-gray-900/50 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-orange-500/20 transform rotate-3 transition-transform duration-500 hover:rotate-1 hover:scale-105">
      <h3 className="text-orange-400 font-bold mb-3 text-center">Rising Stars</h3>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 bg-black/30 rounded-lg p-2 border border-white/10">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${i === 1 ? 'from-yellow-500 to-orange-500' : i === 2 ? 'from-orange-500 to-red-500' : 'from-red-500 to-pink-500'}`}></div>
            <div className="flex-1"><div className="text-white text-sm font-medium">Player {i}</div><div className="text-gray-400 text-xs">{2800 - i * 50} Rating</div></div>
            <div className="text-green-400 text-xs font-mono">↗+127</div>
          </div>
        ))}
      </div>
    </div>
  );

  const ConnectInterface = () => (
    <div className="w-80 bg-gray-900/50 backdrop-blur-lg rounded-2xl p-5 shadow-2xl border border-orange-500/20 transform -rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-105">
      <h3 className="text-orange-400 font-bold mb-4">Team Finder</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-white/10"><div><div className="text-white font-medium">Looking for Team</div><div className="text-gray-400 text-sm">Valorant • Immortal</div></div><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div></div>
        <div className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-white/10"><div><div className="text-white font-medium">Recruiting Players</div><div className="text-gray-400 text-sm">CS2 • Global Elite</div></div><div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div></div>
      </div>
    </div>
  );

  const WelcomeInterface = () => (
    <div className="w-80 bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-orange-500/20 transform rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-105">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl shadow-orange-500/40"><Gamepad2 className="w-8 h-8 text-white" /></div>
        <h3 className="text-white font-bold text-xl mb-2">Welcome to Aegis</h3>
        <p className="text-gray-400 text-sm mb-4">Your competitive journey starts here</p>
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );

  const GamesGrid = () => {
    const games = [
        { name: 'Valorant', logo: '/src/assets/gameLogos/valoLogo.svg' },
        { name: 'PUBGM', logo: '/src/assets/gameLogos/pubgm.png' },
        { name: 'CS2', logo: '/src/assets/gameLogos/cs2.webp' },
        { name: 'LoL', logo: '/src/assets/gameLogos/lol1.png' },
        { name: 'Dota 2', logo: '/src/assets/gameLogos/dota.png' },
        { name: 'CODM', logo: '/src/assets/gameLogos/codm.avif' }
    ];

    return (
        <div className="w-80 bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-cyan-500/20 transform rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-105">
            <h3 className="text-cyan-400 font-bold mb-4 text-center">Supported Titles</h3>
            <div className="grid grid-cols-3 gap-4">
                {games.map((game) => (
                    <div key={game.name} className="flex flex-col items-center justify-center bg-black/30 rounded-lg p-2 border border-white/10 aspect-square">
                        <img src={game.logo} alt={`${game.name} logo`} className="w-10 h-10 rounded-md mb-1" />
                        <div className="text-white font-semibold text-xs">{game.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const getReferenceImage = (type) => {
    switch (type) {
      case 'profile': return <MiniProfileCard />;
      case 'rating': return <RatingChart />;
      case 'discover': return <DiscoverGrid />;
      case 'connect': return <ConnectInterface />;
      case 'welcome': return <WelcomeInterface />;
      case 'gamesGrid': return <GamesGrid />;
      default: return <MiniProfileCard />;
    }
  };

  return (
    <div ref={containerRef} className="w-full bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 text-white overflow-hidden relative font-sans">
      {/* Dynamic background elements from FeaturesComponent */}
      <div className="absolute inset-0 opacity-30 z-0">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-amber-500 rounded-full animate-pulse" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 3}s` }} />
        ))}
      </div>
      <div className="absolute w-96 h-96 rounded-full opacity-20 pointer-events-none transition-all duration-300 ease-out z-0" style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.3) 0%, rgba(245,101,101,0.2) 35%, transparent 70%)', transform: `translate(${mousePosition.x - 192}px, ${mousePosition.y - 192}px)` }} />

      <div className="relative h-[650px] md:h-[700px] z-10">
        {/* Slides Container */}
        <div className="absolute inset-0 transition-all duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {slides.map((slide) => (
            <div key={slide.id} className="w-full h-full absolute top-0" style={{ left: `${(slide.id - 1) * 100}%` }}>
              {/* Per-slide Background Elements (toned down) */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-5`} />
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              <div className={`absolute -bottom-1/2 -left-1/4 w-full h-full rounded-full bg-gradient-radial ${slide.gradient} opacity-5 blur-3xl`} />
              <div className={`absolute -top-1/2 -right-1/4 w-full h-full rounded-full bg-gradient-radial ${slide.gradient} opacity-5 blur-3xl`} />

              {/* Content Layout */}
              <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-center md:justify-between max-w-7xl mx-auto px-6 md:px-12">
                <div className="w-full md:w-1/2 max-w-xl text-center md:text-left z-10">
                  <div className={`inline-flex items-center justify-center mb-6 p-4 rounded-full bg-gradient-to-br ${slide.gradient} shadow-lg shadow-orange-500/20`}><div className="text-white drop-shadow-lg">{slide.icon}</div></div>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">{slide.heading}</h2>
                  <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-medium">{slide.content}</p>
                </div>
                <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end z-10 mt-8 md:mt-0">{getReferenceImage(slide.mockupType)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <button onClick={handlePrevClick} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 backdrop-blur-sm"><ChevronLeft className="w-6 h-6" /></button>
        <button onClick={handleNextClick} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 backdrop-blur-sm"><ChevronRight className="w-6 h-6" /></button>

        {/* Bottom Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
          <div className="flex justify-center space-x-3">
            {slides.map((_, index) => {
              const indicatorClasses = `w-full h-full rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? `bg-gradient-to-r ${slides[currentSlide].gradient}`
                  : 'bg-white/20 group-hover:bg-white/40'
              }`;
              return (
                <button key={index} onClick={() => goToSlide(index)} className="group relative w-8 h-1">
                  <div className={indicatorClasses} />
                </button>
              );
            })}
          </div>
          <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} className={`px-4 py-1 rounded-full text-xs font-mono transition-all duration-300 border bg-black/30 backdrop-blur-sm ${isAutoPlaying ? 'text-orange-400 border-orange-500/30' : 'text-gray-400 border-gray-600/30'}`}>
            {isAutoPlaying ? 'PAUSE' : 'AUTO-PLAY'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AegisCarousel;
