import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, MapPin, Gamepad2, Trophy, Calendar, Users, Star, TrendingUp, Award, Eye, Check } from 'lucide-react';
import AegisProfileCardBGMI from './AegisProfileCardBGMI';

// --- API CALL ---
const fetchPlayers = async () => {
  try {
    const response = await fetch('/api/players/all');
    const data = await response.json();
    return data.players || [];
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
};

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
        switch (player.teamStatus) {
            case 'in a team': return <div className="absolute top-4 right-4 flex items-center gap-2 text-green-400"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>In Team</div>;
            case 'looking for a team': return <div className="absolute top-4 right-4 text-cyan-400">LFT</div>;
            case 'open for offers': return <div className="absolute top-4 right-4 text-yellow-400">Open</div>;
            default: return null;
        }
    };

    const getGameColor = () => {
        switch (player.primaryGame) {
            case 'VALO': return 'text-red-400';
            case 'CS2': return 'text-blue-400';
            case 'BGMI': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    const getThemeColors = (theme) => {
        switch (theme) {
            case 'blue': return {
                border: 'hover:border-blue-500/50',
                shadow: 'hover:shadow-blue-500/10',
                ratingBg: 'from-blue-600/20 to-blue-500/20',
                ratingBorder: 'border-blue-400/30',
                ratingShadow: 'shadow-blue-500/10',
                trophyColor: 'text-blue-400',
                buttonBg: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                buttonShadow: 'shadow-blue-500/30',
                progressBar: 'from-blue-500 to-blue-600'
            };
            case 'purple': return {
                border: 'hover:border-purple-500/50',
                shadow: 'hover:shadow-purple-500/10',
                ratingBg: 'from-purple-600/20 to-purple-500/20',
                ratingBorder: 'border-purple-400/30',
                ratingShadow: 'shadow-purple-500/10',
                trophyColor: 'text-purple-400',
                buttonBg: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
                buttonShadow: 'shadow-purple-500/30',
                progressBar: 'from-purple-500 to-purple-600'
            };
            case 'red': return {
                border: 'hover:border-red-500/50',
                shadow: 'hover:shadow-red-500/10',
                ratingBg: 'from-red-600/20 to-red-500/20',
                ratingBorder: 'border-red-400/30',
                ratingShadow: 'shadow-red-500/10',
                trophyColor: 'text-red-400',
                buttonBg: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
                buttonShadow: 'shadow-red-500/30',
                progressBar: 'from-red-500 to-red-600'
            };
            case 'green': return {
                border: 'hover:border-green-500/50',
                shadow: 'hover:shadow-green-500/10',
                ratingBg: 'from-green-600/20 to-green-500/20',
                ratingBorder: 'border-green-400/30',
                ratingShadow: 'shadow-green-500/10',
                trophyColor: 'text-green-400',
                buttonBg: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
                buttonShadow: 'shadow-green-500/30',
                progressBar: 'from-green-500 to-green-600'
            };
            case 'pink': return {
                border: 'hover:border-pink-500/50',
                shadow: 'hover:shadow-pink-500/10',
                ratingBg: 'from-pink-600/20 to-pink-500/20',
                ratingBorder: 'border-pink-400/30',
                ratingShadow: 'shadow-pink-500/10',
                trophyColor: 'text-pink-400',
                buttonBg: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700',
                buttonShadow: 'shadow-pink-500/30',
                progressBar: 'from-pink-500 to-pink-600'
            };
            default: return {
                border: 'hover:border-orange-500/50',
                shadow: 'hover:shadow-orange-500/10',
                ratingBg: 'from-orange-600/20 to-yellow-500/20',
                ratingBorder: 'border-orange-400/30',
                ratingShadow: 'shadow-orange-500/10',
                trophyColor: 'text-amber-400',
                buttonBg: 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
                buttonShadow: 'shadow-orange-500/30',
                progressBar: 'from-orange-500 to-red-500'
            };
        }
    };

    const themeColors = getThemeColors(player.cardTheme);

    return (
        <div className={`bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${themeColors.border} ${themeColors.shadow}`}>
            <div className="relative p-6">
                {getStatusIndicator()}

                {/* Verified Badge */}
                {player.verified && (
                    <div className="absolute top-4 left-4 flex items-center gap-1 bg-orange-500/20 border border-orange-400/30 rounded-full px-2 py-1">
                        <Check className="w-3 h-3 text-orange-400" />
                        <span className="text-orange-400 text-xs font-semibold">Verified</span>
                    </div>
                )}

                {/* Player Header */}
                <div className="flex items-center gap-4 mb-4 mt-6">
                    <div className="relative">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}
                            alt={player.inGameName || player.username}
                            className="w-16 h-16 rounded-xl bg-zinc-700"
                        />
                        {player.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 p-1 rounded-full shadow-lg shadow-orange-400/50">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                                {player.inGameName || player.username}
                            </h3>
                        </div>
                        <p className="text-gray-300 text-sm">{player.realName || 'N/A'}</p>
                        <p className="text-zinc-400 text-sm">{player.primaryGame || 'N/A'} • {player.country || player.location || 'N/A'}</p>
                    </div>
                </div>

                {/* Aegis Rating - Prominent */}
                <div className={`bg-gradient-to-r ${themeColors.ratingBg} ${themeColors.ratingBorder} rounded-lg p-4 mb-4 text-center shadow-md ${themeColors.ratingShadow}`}>
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Trophy className={`w-5 h-5 ${themeColors.trophyColor}`} />
                        <span className={`${themeColors.trophyColor} text-sm font-semibold`}>Aegis Rating</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{player.aegisRating || 0}</div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center">
                        <p className="text-zinc-400 text-sm">Tournaments</p>
                        <p className="text-lg font-bold text-blue-400">{player.tournamentsPlayed || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-zinc-400 text-sm">Matches</p>
                        <p className="text-lg font-bold text-purple-400">{player.matchesPlayed || 0}</p>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                        <p className="text-zinc-400 text-sm">Earnings</p>
                        <p className="text-lg font-bold text-green-400">${player.earnings || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-zinc-400 text-sm">Game</p>
                        <p className={`text-lg font-semibold ${getGameColor()}`}>{player.primaryGame || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-zinc-400 text-sm">Age</p>
                        <p className="text-lg font-semibold text-white">{player.age || 'N/A'}</p>
                    </div>
                </div>

                {/* Team Status & Role */}
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-zinc-400 text-xs">Team Status</p>
                            <p className="text-white font-medium text-sm capitalize">
                                {player.teamStatus || 'N/A'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-zinc-400 text-xs">Role</p>
                            <p className="text-white font-medium text-sm">
                                {player.inGameRole?.join(', ') || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Show availability */}
                    {player.availability && (
                        <div className="pt-2 border-t border-zinc-600">
                            <p className="text-zinc-500 text-xs">
                                Available: {player.availability}
                            </p>
                        </div>
                    )}
                </div>

                {/* Bio */}
                {player.bio && (
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 mb-4">
                        <p className="text-zinc-400 text-sm">{player.bio}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button className={`flex-1 bg-gradient-to-r ${themeColors.buttonBg} text-white py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg ${themeColors.buttonShadow}`}>
                        View Profile
                    </button>
                    <button className="px-4 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className={`bg-gradient-to-r ${themeColors.progressBar} h-1 w-0 group-hover:w-full transition-all duration-500`}></div>
        </div>
    );
};

const AegisPlayers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ game: '', region: '', status: '', rank: '' });
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPlayers = async () => {
            setLoading(true);
            const fetchedPlayers = await fetchPlayers();
            setPlayers(fetchedPlayers);
            setLoading(false);
        };
        loadPlayers();
    }, []);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: prev[filterName] === value ? '' : value }));
    };

    const filteredPlayers = useMemo(() => {
        return players.filter(player => {
            const matchesSearch = player.inGameName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                player.realName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGame = filters.game ? player.game === filters.game : true;
            const matchesRegion = filters.region ? player.region === filters.region : true;
            const matchesStatus = filters.status ? player.status === filters.status : true;
            const matchesRank = filters.rank ? player.rank?.includes(filters.rank) : true;

            return matchesSearch && matchesGame && matchesRegion && matchesStatus && matchesRank;
        }).sort((a, b) => (b.aegisRating || 0) - (a.aegisRating || 0)); // Sort by rating descending
    }, [searchTerm, filters, players]);
    


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
                        filteredPlayers.map(player => <PlayerCard key={player._id} player={player} />)
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