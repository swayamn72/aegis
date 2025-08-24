import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, MapPin, Gamepad2, Trophy, Calendar, Users, Star, TrendingUp, Award, Eye, Check } from 'lucide-react';

// --- MOCK DATA ---
const mockPlayers = [
  { 
    id: 1, 
    realName: "Swayam Nakte", 
    inGameName: "Zyaxxxx", 
    game: "Valorant", 
    region: "India", 
    rank: "Immortal 3", 
    aegisRating: 2847, 
    winRate: 73.2, 
    tournamentsPlayed: 34, 
    currentTeam: null,
    exTeam: "Neon Esports",
    teamLogo: "https://placehold.co/32x32/FF6B35/FFFFFF?text=NE",
    role: "Duelist", 
    status: "Looking for Team", 
    verified: true,
    trending: true,
    avatar: "https://placehold.co/64x64/FF4554/FFFFFF?text=ZX",
    achievements: ["Champion - Winter Circuit 2024", "MVP - Regional Qualifier"]
  },
  { 
    id: 2, 
    realName: "Arjun Sharma", 
    inGameName: "PhantomStrike", 
    game: "CS2", 
    region: "India", 
    rank: "Global Elite", 
    aegisRating: 2934, 
    winRate: 78.5, 
    tournamentsPlayed: 42, 
    currentTeam: "Velocity Gaming",
    exTeam: null,
    teamLogo: "https://placehold.co/32x32/00D4AA/FFFFFF?text=VG",
    role: "AWPer", 
    status: "In Roster", 
    verified: true,
    trending: false,
    avatar: "https://placehold.co/64x64/007ACC/FFFFFF?text=PS",
    achievements: ["Tournament MVP x3", "Rising Star Award"]
  },
  { 
    id: 3, 
    realName: "Sarah Chen", 
    inGameName: "NeonQueen", 
    game: "Valorant", 
    region: "Asia", 
    rank: "Radiant", 
    aegisRating: 3124, 
    winRate: 81.7, 
    tournamentsPlayed: 28, 
    currentTeam: "Dragons Esports",
    exTeam: null,
    teamLogo: "https://placehold.co/32x32/DC2626/FFFFFF?text=DE",
    role: "Controller", 
    status: "In Roster", 
    verified: true,
    trending: true,
    avatar: "https://placehold.co/64x64/FF4554/FFFFFF?text=NQ",
    achievements: ["World Championship Finalist", "Best Controller 2024"]
  },
  { 
    id: 4, 
    realName: "Kai Anderson", 
    inGameName: "FrostBite", 
    game: "LoL", 
    region: "North America", 
    rank: "Challenger", 
    aegisRating: 2756, 
    winRate: 69.3, 
    tournamentsPlayed: 31, 
    currentTeam: null,
    exTeam: "Cloud9 Academy",
    teamLogo: "https://placehold.co/32x32/0ea5e9/FFFFFF?text=C9",
    role: "ADC", 
    status: "Looking for Team", 
    verified: false,
    trending: false,
    avatar: "https://placehold.co/64x64/005A82/FFFFFF?text=FB",
    achievements: ["Solo Queue Legend", "Rookie of the Year"]
  },
  { 
    id: 5, 
    realName: "Rajesh Kumar", 
    inGameName: "BattleKing", 
    game: "BGMI", 
    region: "India", 
    rank: "Conqueror", 
    aegisRating: 2689, 
    winRate: 75.8, 
    tournamentsPlayed: 45, 
    currentTeam: "Soul Esports",
    exTeam: null,
    teamLogo: "https://placehold.co/32x32/7C3AED/FFFFFF?text=SE",
    role: "IGL", 
    status: "In Roster", 
    verified: true,
    trending: true,
    avatar: "https://placehold.co/64x64/F2A900/FFFFFF?text=BK",
    achievements: ["PMIS Champion", "Best IGL Award"]
  },
  { 
    id: 6, 
    realName: "Emma Rodriguez", 
    inGameName: "ShadowDancer", 
    game: "CS2", 
    region: "Europe", 
    rank: "Global Elite", 
    aegisRating: 2812, 
    winRate: 77.2, 
    tournamentsPlayed: 38, 
    currentTeam: "Eclipse Gaming",
    exTeam: null,
    teamLogo: "https://placehold.co/32x32/6366F1/FFFFFF?text=EG",
    role: "Entry Fragger", 
    status: "In Roster", 
    verified: true,
    trending: false,
    avatar: "https://placehold.co/64x64/007ACC/FFFFFF?text=SD",
    achievements: ["European Champion", "Clutch Master"]
  },
  { 
    id: 7, 
    realName: "Alex Thompson", 
    inGameName: "VoidWalker", 
    game: "Dota 2", 
    region: "Europe", 
    rank: "Immortal", 
    aegisRating: 2945, 
    winRate: 72.4, 
    tournamentsPlayed: 29, 
    currentTeam: "Team Liquid",
    exTeam: null,
    teamLogo: "https://placehold.co/32x32/1E40AF/FFFFFF?text=TL",
    role: "Mid", 
    status: "In Roster", 
    verified: true,
    trending: true,
    avatar: "https://placehold.co/64x64/D9361A/FFFFFF?text=VW",
    achievements: ["TI Qualifier Winner", "Best Mid Player"]
  },
  { 
    id: 8, 
    realName: "Yuki Tanaka", 
    inGameName: "StormBreaker", 
    game: "Valorant", 
    region: "Asia", 
    rank: "Immortal 2", 
    aegisRating: 2678, 
    winRate: 74.9, 
    tournamentsPlayed: 26, 
    currentTeam: null,
    exTeam: "ZETA DIVISION",
    teamLogo: "https://placehold.co/32x32/EF4444/FFFFFF?text=ZD",
    role: "Sentinel", 
    status: "Looking for Team", 
    verified: false,
    trending: false,
    avatar: "https://placehold.co/64x64/FF4554/FFFFFF?text=SB",
    achievements: ["Clutch Player Award", "Rising Talent"]
  },
  { 
    id: 9, 
    realName: "Marcus Johnson", 
    inGameName: "BlitzKrieg", 
    game: "CS2", 
    region: "North America", 
    rank: "Global Elite", 
    aegisRating: 2743, 
    winRate: 76.1, 
    tournamentsPlayed: 37, 
    currentTeam: null,
    exTeam: "FaZe Clan",
    teamLogo: "https://placehold.co/32x32/DC2626/000000?text=FZ",
    role: "Rifler", 
    status: "Looking for Team", 
    verified: true,
    trending: false,
    avatar: "https://placehold.co/64x64/007ACC/FFFFFF?text=BK",
    achievements: ["Major Qualifier", "Clutch King"]
  },
  { 
    id: 10, 
    realName: "Priya Patel", 
    inGameName: "MysticRose", 
    game: "Valorant", 
    region: "India", 
    rank: "Immortal 1", 
    aegisRating: 2534, 
    winRate: 68.9, 
    tournamentsPlayed: 22, 
    currentTeam: "Galaxy Racer",
    exTeam: null,
    teamLogo: "https://placehold.co/32x32/8B5CF6/FFFFFF?text=GR",
    role: "Initiator", 
    status: "In Roster", 
    verified: true,
    trending: true,
    avatar: "https://placehold.co/64x64/FF4554/FFFFFF?text=MR",
    achievements: ["Best Female Player 2024", "Rising Star"]
  }
];

const FilterDropdown = ({ options, selected, onSelect, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white transition-colors hover:bg-zinc-700">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-orange-400" />
          <span>{selected || placeholder}</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-lg z-10 shadow-lg">
          {options.map(option => (
            <a href="#" key={option} onClick={(e) => { e.preventDefault(); onSelect(option); setIsOpen(false); }} className="block px-4 py-2 hover:bg-orange-500/10">{option}</a>
          ))}
        </div>
      )}
    </div>
  );
};

const PlayerCard = ({ player }) => {
    const getStatusIndicator = () => {
        switch (player.status) {
            case 'In Roster': return <div className="absolute top-4 right-4 flex items-center gap-2 text-green-400"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>In Roster</div>;
            case 'Looking for Team': return <div className="absolute top-4 right-4 text-cyan-400">LFT</div>;
            default: return null;
        }
    };

    const getRankColor = () => {
        switch (player.game) {
            case 'Valorant': return 'text-red-400';
            case 'CS2': return 'text-blue-400';
            case 'LoL': return 'text-purple-400';
            case 'BGMI': return 'text-yellow-400';
            case 'Dota 2': return 'text-orange-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10 group">
            <div className="relative p-6">
                {getStatusIndicator()}
                
                {/* Trending Badge */}
                {player.trending && (
                    <div className="absolute top-4 left-4 flex items-center gap-1 bg-orange-500/20 border border-orange-400/30 rounded-full px-2 py-1">
                        <TrendingUp className="w-3 h-3 text-orange-400" />
                        <span className="text-orange-400 text-xs font-semibold">Trending</span>
                    </div>
                )}

                {/* Player Header */}
                <div className="flex items-center gap-4 mb-4 mt-6">
                    <div className="relative">
                        <img src={player.avatar} alt={player.inGameName} className="w-16 h-16 rounded-xl" />
                        {player.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 p-1 rounded-full shadow-lg shadow-orange-400/50">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{player.inGameName}</h3>
                        </div>
                        <p className="text-gray-300 text-sm">{player.realName}</p>
                        <p className="text-zinc-400 text-sm">{player.game} • {player.region}</p>
                    </div>
                </div>

                {/* Aegis Rating - Prominent */}
                <div className="bg-gradient-to-r from-orange-600/20 to-yellow-500/20 border border-orange-400/30 rounded-lg p-4 mb-4 text-center shadow-md shadow-orange-500/10">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <span className="text-amber-400 text-sm font-semibold">Aegis Rating</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{player.aegisRating}</div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                        <p className="text-zinc-400 text-sm">Win Rate</p>
                        <p className="text-lg font-bold text-green-400">{player.winRate}%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-zinc-400 text-sm">Rank</p>
                        <p className={`text-lg font-semibold ${getRankColor()}`}>{player.rank}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-zinc-400 text-sm">Tournaments</p>
                        <p className="text-lg font-semibold text-white">{player.tournamentsPlayed}</p>
                    </div>
                </div>

                {/* Team & Role - Enhanced with logos and ex-team info */}
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <img 
                                src={player.teamLogo} 
                                alt="Team Logo" 
                                className="w-6 h-6 rounded" 
                            />
                            <div>
                                <p className="text-zinc-400 text-xs">
                                    {player.status === 'In Roster' ? 'Current Team' : 'Previous Team'}
                                </p>
                                <p className="text-white font-medium text-sm">
                                    {player.currentTeam || player.exTeam || 'Free Agent'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-zinc-400 text-xs">Role</p>
                            <p className="text-white font-medium text-sm">{player.role}</p>
                        </div>
                    </div>
                    
                    {/* Show additional info for LFT players */}
                    {player.status === 'Looking for Team' && player.exTeam && (
                        <div className="pt-2 border-t border-zinc-600">
                            <p className="text-zinc-500 text-xs">
                                Former {player.exTeam} player seeking new opportunities
                            </p>
                        </div>
                    )}
                    
                    {/* Show roster status for current team players */}
                    {player.status === 'In Roster' && (
                        <div className="pt-2 border-t border-zinc-600">
                            <p className="text-green-400 text-xs">
                                ✓ Active roster member
                            </p>
                        </div>
                    )}
                </div>

                {/* Recent Achievement */}
                {player.achievements.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Award className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400 text-sm font-semibold">Latest Achievement</span>
                        </div>
                        <p className="text-white text-sm">{player.achievements[0]}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                        View Profile
                    </button>
                    <button className="px-4 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-1 w-0 group-hover:w-full transition-all duration-500"></div>
        </div>
    );
};

const AegisPlayers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ game: '', region: '', status: '', rank: '' });

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: prev[filterName] === value ? '' : value }));
    };

    const filteredPlayers = useMemo(() => {
        return mockPlayers.filter(player => {
            const matchesSearch = player.inGameName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                player.realName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGame = filters.game ? player.game === filters.game : true;
            const matchesRegion = filters.region ? player.region === filters.region : true;
            const matchesStatus = filters.status ? player.status === filters.status : true;
            const matchesRank = filters.rank ? player.rank.includes(filters.rank) : true;
            
            return matchesSearch && matchesGame && matchesRegion && matchesStatus && matchesRank;
        }).sort((a, b) => b.aegisRating - a.aegisRating); // Sort by rating descending
    }, [searchTerm, filters]);
    


    return (
        <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-20">
            <div className="container mx-auto px-6 py-12">
                
                {/* --- HEADER --- */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-4">
                        Players
                    </h1>
                    <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
                        Discover the best talent in esports. Browse profiles, ratings, and achievements of competitive players worldwide.
                    </p>
                </div>

                {/* --- FILTERS & SEARCH --- */}
                <div className="mb-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="relative lg:col-span-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search players..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <FilterDropdown options={['Valorant', 'CS2', 'LoL', 'BGMI', 'Dota 2']} selected={filters.game} onSelect={(v) => handleFilterChange('game', v)} placeholder="All Games" icon={Gamepad2} />
                        <FilterDropdown options={['India', 'Asia', 'Europe', 'North America']} selected={filters.region} onSelect={(v) => handleFilterChange('region', v)} placeholder="All Regions" icon={MapPin} />
                        <FilterDropdown options={['In Roster', 'Looking for Team']} selected={filters.status} onSelect={(v) => handleFilterChange('status', v)} placeholder="All Status" icon={Users} />
                        <FilterDropdown options={['Radiant', 'Immortal', 'Global Elite', 'Challenger', 'Conqueror']} selected={filters.rank} onSelect={(v) => handleFilterChange('rank', v)} placeholder="All Ranks" icon={Trophy} />
                    </div>
                </div>

                {/* --- PLAYERS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPlayers.length > 0 ? (
                        filteredPlayers.map(player => <PlayerCard key={player.id} player={player} />)
                    ) : (
                        <p className="lg:col-span-3 text-center text-zinc-400 text-lg">No players match your criteria.</p>
                    )}
                </div>

                {/* --- LOAD MORE SECTION --- */}
                {filteredPlayers.length > 0 && (
                    <div className="text-center mt-12">
                        <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105">
                            Load More Players
                        </button>
                        <p className="text-zinc-400 text-sm mt-4">Showing {filteredPlayers.length} of 1,247 players</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AegisPlayers;