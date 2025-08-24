import React, { useState, useEffect } from 'react';
import { Trophy, Users, MapPin, ExternalLink, Star, Zap, Target, Shield, Sword, Crown } from 'lucide-react';

const GamerProfile = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedGame, setSelectedGame] = useState('League of Legends');

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

  // Mock user data
  const userData = {
    name: "ProGamer_Alex",
    realName: "Alex Chen",
    description: "Professional ADC player with 5+ years of competitive experience. Currently looking for opportunities in Tier 1 teams. Specializing in late-game carries and team fight positioning.",
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=faces",
    location: "Seoul, South Korea",
    followers: 15420,
    connections: 892,
    team: "Team Aegis",
    teamStatus: "active", // or "open"
    // Key profile stats
    currentRank: "Grandmaster 245 LP",
    mostPlayedGame: "League of Legends",
    highestRankAchieved: "Challenger 1247 LP",
    totalHours: 5357,
    topGames: [
      { name: "League of Legends", rank: "Grandmaster", hours: 2847, icon: "🎮" },
      { name: "Valorant", rank: "Radiant", hours: 1523, icon: "🎯" },
      { name: "CS2", rank: "Global Elite", hours: 987, icon: "⚡" }
    ],
    socials: [
      { platform: "Twitch", url: "#", username: "@ProGamer_Alex", icon: "📺", followers: "24.5K followers" },
      { platform: "Twitter", url: "#", username: "@AlexGaming", icon: "🐦", followers: "18.2K followers" },
      { platform: "Discord", url: "#", username: "Alex#1337", icon: "💬", followers: "Join Server" }
    ],
    lolStats: {
      mainLane: "ADC",
      secondaryLane: "Mid",
      kda: "2.8/1.2/8.4",
      winRate: "73%",
      rank: "Grandmaster 245 LP",
      topChampions: [
        { name: "Jinx", mastery: 7, games: 89, winRate: "76%" },
        { name: "Kai'Sa", mastery: 7, games: 72, winRate: "71%" },
        { name: "Ezreal", mastery: 6, games: 64, winRate: "69%" }
      ]
    },
    recentMatches: [
      { champion: "Jinx", result: "Victory", kda: "12/2/8", duration: "28:42", gameMode: "Ranked Solo" },
      { champion: "Kai'Sa", result: "Victory", kda: "8/1/12", duration: "31:15", gameMode: "Ranked Solo" },
      { champion: "Ezreal", result: "Defeat", kda: "6/4/9", duration: "42:18", gameMode: "Ranked Solo" },
      { champion: "Jinx", result: "Victory", kda: "15/3/6", duration: "25:33", gameMode: "Ranked Solo" }
    ]
  };

  const StatCard = ({ icon, label, value, gradient, delay = 0 }) => (
    <div 
      className={`bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-amber-500/50 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(251,146,60,0.3)] transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-white text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );

  const ChampionCard = ({ champion, delay = 0 }) => (
    <div 
      className={`bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
          {champion.name[0]}
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold">{champion.name}</h4>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            <span className="text-amber-400 text-sm">M{champion.mastery}</span>
            <span className="text-gray-400 text-sm">{champion.games} games</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-green-400 font-semibold">{champion.winRate}</p>
          <p className="text-gray-400 text-xs">Win Rate</p>
        </div>
      </div>
    </div>
  );

  const MatchCard = ({ match, delay = 0 }) => (
    <div 
      className={`bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {match.champion[0]}
          </div>
          <div>
            <h5 className="text-white font-medium">{match.champion}</h5>
            <p className="text-gray-400 text-sm">{match.gameMode}</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold">{match.kda}</p>
          <p className="text-gray-400 text-xs">KDA</p>
        </div>
        <div className="text-center">
          <p className="text-gray-300">{match.duration}</p>
          <p className="text-gray-400 text-xs">Duration</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          match.result === 'Victory' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {match.result}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      
      {/* Dynamic gradient overlay following mouse */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-500 ease-out"
        style={{
          background: `radial-gradient(800px circle at ${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%, 
            rgba(251,146,60,0.05) 0%, 
            rgba(59,130,246,0.03) 40%, 
            transparent 70%)`
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400 rounded-full animate-pulse opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        
        {/* Main Profile Card */}
        <div className={`max-w-6xl mx-auto mb-16 transition-all duration-1000 ${isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'}`}>
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-[0_0_50px_rgba(0,0,0,0.8)] hover:border-amber-500/30 transition-all duration-500 overflow-hidden">
            
            {/* Profile Header Section */}
            <div className="p-8 border-b border-gray-700/50">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                
                {/* Avatar & Basic Info */}
                <div className="text-center md:text-left">
                  <div className="relative inline-block mb-4">
                    <img 
                      src={userData.profileImage} 
                      alt={userData.name}
                      className="w-32 h-32 rounded-full border-4 border-amber-500/50 shadow-[0_0_30px_rgba(251,146,60,0.3)]"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-black flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-1">{userData.name}</h1>
                  <p className="text-lg text-gray-300 mb-3">{userData.realName}</p>
                  
                  {/* Location */}
                  <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 font-medium">{userData.location}</span>
                  </div>
                </div>

                {/* Key Stats Grid */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  {/* Current Rank */}
                  <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-4 border border-purple-500/30 text-center">
                    <Crown className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-gray-300 text-xs mb-1">Current Rank</p>
                    <p className="text-white text-sm font-bold">{userData.currentRank}</p>
                  </div>
                  
                  {/* Highest Rank */}
                  <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl p-4 border border-amber-500/30 text-center">
                    <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <p className="text-gray-300 text-xs mb-1">Peak Rank</p>
                    <p className="text-white text-sm font-bold">{userData.highestRankAchieved.split(' ')[0]}</p>
                  </div>
                  
                  {/* Team Status */}
                  <div className={`bg-gradient-to-br rounded-xl p-4 border text-center ${userData.teamStatus === 'active' 
                    ? 'from-green-600/20 to-emerald-600/20 border-green-500/30' 
                    : 'from-gray-600/20 to-gray-700/20 border-gray-500/30'}`}>
                    <Shield className={`w-6 h-6 mx-auto mb-2 ${userData.teamStatus === 'active' ? 'text-green-400' : 'text-gray-400'}`} />
                    <p className="text-gray-300 text-xs mb-1">Team</p>
                    <p className="text-white text-sm font-bold">{userData.teamStatus === 'active' ? userData.team : 'Open'}</p>
                  </div>
                  
                  {/* Followers */}
                  <div className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-xl p-4 border border-pink-500/30 text-center">
                    <Users className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                    <p className="text-gray-300 text-xs mb-1">Followers</p>
                    <p className="text-white text-sm font-bold">{(userData.followers/1000).toFixed(1)}K</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <p className="text-gray-400 leading-relaxed max-w-4xl">{userData.description}</p>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="p-6">
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {userData.socials.map((social, index) => (
                  <a 
                    key={social.platform}
                    href={social.url}
                    className="group flex items-center space-x-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg px-4 py-3 border border-gray-600/30 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <span className="text-xl transform group-hover:scale-110 transition-transform duration-300">
                      {social.icon}
                    </span>
                    <div>
                      <p className="text-white font-medium text-sm">{social.platform}</p>
                      <p className="text-gray-400 text-xs">{social.followers}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-all duration-300 transform group-hover:translate-x-1" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Games Section */}
        <div className={`mb-16 transition-all duration-1000 delay-200 ${isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Gaming Portfolio</h2>
            <p className="text-gray-400">Click on a game to view detailed stats</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {userData.topGames.map((game, index) => (
              <div 
                key={game.name}
                onClick={() => setSelectedGame(game.name)}
                className={`relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 cursor-pointer hover:scale-105 ${
                  selectedGame === game.name 
                    ? 'border-amber-500 shadow-[0_0_40px_rgba(251,146,60,0.4)] bg-gradient-to-br from-amber-500/10 to-orange-500/10' 
                    : 'border-gray-700/50 hover:border-gray-600/50'
                }`}
              >
                {selectedGame === game.name && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-4xl mb-4 transform transition-transform duration-300 hover:scale-110">{game.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{game.name}</h3>
                  
                  <div className="space-y-2">
                    <div className={`inline-block px-4 py-2 rounded-full font-semibold text-sm ${
                      selectedGame === game.name ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700/50 text-gray-300'
                    }`}>
                      {game.rank}
                    </div>
                    <p className="text-gray-400 text-sm">{game.hours.toLocaleString()} hours played</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className={`mb-12 transition-all duration-1000 delay-400 ${isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'}`}>
          <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Connect & Follow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {userData.socials.map((social, index) => (
              <a 
                key={social.platform}
                href={social.url}
                className="group bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] block"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
                      {social.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{social.platform}</h3>
                      <p className="text-gray-400">{social.username}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{social.followers}</span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full font-medium">
                    Follow
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Profile Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <StatCard 
            icon={<Users className="w-6 h-6 text-white" />}
            label="Followers"
            value={userData.followers.toLocaleString()}
            gradient="from-purple-500 to-pink-500"
            delay={500}
          />
          <StatCard 
            icon={<Trophy className="w-6 h-6 text-white" />}
            label="Team Status"
            value={userData.teamStatus === 'active' ? userData.team : 'Open to Join'}
            gradient={userData.teamStatus === 'active' ? "from-amber-500 to-orange-500" : "from-gray-500 to-gray-600"}
            delay={600}
          />
        </div>

        {/* League of Legends Stats */}
        {selectedGame === 'League of Legends' && (
          <div className="space-y-12">
            
            {/* LoL Overview Stats */}
            <div className={`transition-all duration-1000 delay-800 ${isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'}`}>
              <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                League of Legends Stats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard 
                  icon={<Crown className="w-6 h-6 text-white" />}
                  label="Current Rank"
                  value={userData.lolStats.rank}
                  gradient="from-yellow-500 to-amber-500"
                />
                <StatCard 
                  icon={<Target className="w-6 h-6 text-white" />}
                  label="Main Lane"
                  value={userData.lolStats.mainLane}
                  gradient="from-red-500 to-pink-500"
                />
                <StatCard 
                  icon={<Sword className="w-6 h-6 text-white" />}
                  label="KDA Ratio"
                  value={userData.lolStats.kda}
                  gradient="from-green-500 to-teal-500"
                />
                <StatCard 
                  icon={<Shield className="w-6 h-6 text-white" />}
                  label="Win Rate"
                  value={userData.lolStats.winRate}
                  gradient="from-purple-500 to-indigo-500"
                />
              </div>
            </div>

            {/* Top Champions */}
            <div className={`transition-all duration-1000 delay-900 ${isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'}`}>
              <h3 className="text-xl font-bold text-center mb-6 text-white">Top Champions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userData.lolStats.topChampions.map((champion, index) => (
                  <ChampionCard key={champion.name} champion={champion} delay={1000 + index * 100} />
                ))}
              </div>
            </div>

            {/* Recent Matches */}
            <div className={`transition-all duration-1000 delay-1200 ${isLoaded ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'}`}>
              <h3 className="text-xl font-bold text-center mb-6 text-white">Recent Matches</h3>
              <div className="space-y-4">
                {userData.recentMatches.map((match, index) => (
                  <MatchCard key={index} match={match} delay={1300 + index * 100} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamerProfile;