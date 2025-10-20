import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, MapPin, Gamepad2, Trophy, Calendar, Users, Star, TrendingUp, Award, Eye, Check } from 'lucide-react';
import AegisProfileCardBGMI from './AegisProfileCardBGMI';

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
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-zinc-950 border border-zinc-900 rounded-lg px-4 py-2.5 text-sm text-white transition-all hover:border-zinc-800 hover:bg-zinc-900/50"
            >
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#FF4500]" />
                    <span className="text-zinc-300">{selected || placeholder}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-zinc-950 border border-zinc-900 rounded-lg z-10 shadow-2xl shadow-black/50 overflow-hidden">
                    {options.map(option => (
                        <button
                            key={option}
                            onClick={() => { onSelect(option); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const PlayerCard = ({ player }) => {
    const navigate = useNavigate();

    const getStatusIndicator = () => {
        switch (player.teamStatus) {
            case 'in a team':
                return (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-md px-2 py-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-xs font-semibold">In Team</span>
                    </div>
                );
            case 'looking for a team':
                return (
                    <div className="absolute top-3 right-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold rounded-md px-2 py-1">
                        LFT
                    </div>
                );
            case 'open for offers':
                return (
                    <div className="absolute top-3 right-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold rounded-md px-2 py-1">
                        Open
                    </div>
                );
            default: return null;
        }
    };

    const getGameColor = () => {
        switch (player.primaryGame) {
            case 'VALO': return 'text-red-400';
            case 'CS2': return 'text-blue-400';
            case 'BGMI': return 'text-yellow-400';
            default: return 'text-zinc-400';
        }
    };

    return (
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden transition-all duration-300 hover:border-zinc-800 hover:shadow-2xl hover:shadow-black/50 group">
            <div className="relative p-5">
                {getStatusIndicator()}

                {/* Verified Badge */}
                {player.verified && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#FF4500]/10 border border-[#FF4500]/30 rounded-md px-2 py-1">
                        <Check className="w-3 h-3 text-[#FF4500]" />
                        <span className="text-[#FF4500] text-xs font-semibold">Verified</span>
                    </div>
                )}

                {/* Player Header */}
                <div className="flex items-center gap-3 mb-4 mt-8">
                    <div className="relative">
                        <img
                            src={player.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}
                            alt={player.inGameName || player.username}
                            className="w-14 h-14 rounded-lg bg-zinc-900 border border-zinc-800"
                        />
                        {player.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-[#FF4500] p-0.5 rounded-full">
                                <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white group-hover:text-[#FF4500] transition-colors truncate">
                            {player.inGameName || player.username}
                        </h3>
                        <p className="text-zinc-400 text-xs truncate">{player.realName || 'N/A'}</p>
                        <p className="text-zinc-600 text-xs">{player.primaryGame || 'N/A'} • {player.country || player.location || 'N/A'}</p>
                    </div>
                </div>

                {/* Aegis Rating */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 mb-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Trophy className="w-4 h-4 text-[#FF4500]" />
                        <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Aegis Rating</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{player.aegisRating || 0}</div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-center">
                        <p className="text-zinc-500 text-xs mb-0.5">Tournaments</p>
                        <p className="text-base font-bold text-cyan-400">{player.tournamentsPlayed || 0}</p>
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 text-center">
                        <p className="text-zinc-500 text-xs mb-0.5">Matches</p>
                        <p className="text-base font-bold text-purple-400">{player.matchesPlayed || 0}</p>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                        <p className="text-zinc-500 text-xs">Earnings</p>
                        <p className="text-sm font-bold text-green-400">${player.earnings || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-zinc-500 text-xs">Game</p>
                        <p className={`text-sm font-semibold ${getGameColor()}`}>{player.primaryGame || 'N/A'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-zinc-500 text-xs">Age</p>
                        <p className="text-sm font-semibold text-white">{player.age || 'N/A'}</p>
                    </div>
                </div>

                {/* Team Status & Role */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-zinc-500 text-xs mb-0.5">Team Status</p>
                            <p className="text-white font-medium text-xs capitalize">
                                {player.teamStatus || 'N/A'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-zinc-500 text-xs mb-0.5">Role</p>
                            <p className="text-white font-medium text-xs">
                                {player.inGameRole?.join(', ') || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Show availability */}
                    {player.availability && (
                        <div className="pt-2 mt-2 border-t border-zinc-800">
                            <p className="text-zinc-600 text-xs">
                                Available: {player.availability}
                            </p>
                        </div>
                    )}
                </div>

                {/* Bio */}
                {player.bio && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 mb-3">
                        <p className="text-zinc-400 text-xs line-clamp-2">{player.bio}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => { if (player._id) navigate(`/detailed/${player._id}`); else console.error('Player _id is undefined'); }}
                        className="flex-1 bg-[#FF4500] hover:bg-[#FF4500]/90 text-white text-sm font-semibold py-2 rounded-lg transition-all"
                    >
                        View Profile
                    </button>
                    <button className="px-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white py-2 rounded-lg transition-all">
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="bg-gradient-to-r from-[#FF4500] to-orange-500 h-0.5 w-0 group-hover:w-full transition-all duration-500"></div>
        </div>
    );
};

const AegisPlayers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ game: '', availability: '', status: '' });
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
        const gameMap = { 'Valorant': 'VALO', 'CS2': 'CS2', 'BGMI': 'BGMI' };
        return players.filter(player => {
            const matchesSearch = player.inGameName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                player.realName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGame = filters.game && filters.game !== 'All Games' ? player.primaryGame === gameMap[filters.game] : true;
            const matchesAvailability = filters.availability ? player.availability === filters.availability : true;
            const matchesStatus = filters.status ? player.teamStatus === filters.status : true;

            return matchesSearch && matchesGame && matchesAvailability && matchesStatus;
        }).sort((a, b) => (b.aegisRating || 0) - (a.aegisRating || 0));
    }, [searchTerm, filters, players]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-[#FF4500]/30 border-t-[#FF4500] rounded-full mx-auto mb-4"></div>
                    <p className="text-zinc-400 text-lg font-mono tracking-widest">LOADING PLAYERS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-[Inter] pt-[100px] pb-16 relative overflow-hidden">

            {/* Grid Pattern Background */}
            <div className="absolute inset-0 z-0 opacity-[0.25]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3f3f46" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none"></div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-[#FF4500]">Players</span>
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Discover the best talent in esports. Browse profiles, ratings, and achievements of competitive players worldwide.
                    </p>
                </div>

                {/* Filters & Search */}
                <div className="mb-8 p-5 bg-zinc-950 border border-zinc-900 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search players..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent"
                            />
                        </div>
                        <FilterDropdown
                            options={['All Games', 'Valorant', 'CS2', 'BGMI']}
                            selected={filters.game}
                            onSelect={(v) => handleFilterChange('game', v)}
                            placeholder="All Games"
                            icon={Gamepad2}
                        />
                        <FilterDropdown
                            options={['weekends only', 'evenings', 'flexible', 'full time']}
                            selected={filters.availability}
                            onSelect={(v) => handleFilterChange('availability', v)}
                            placeholder="All Availability"
                            icon={Calendar}
                        />
                        <FilterDropdown
                            options={['looking for a team', 'in a team', 'open for offers']}
                            selected={filters.status}
                            onSelect={(v) => handleFilterChange('status', v)}
                            placeholder="All Status"
                            icon={Users}
                        />
                    </div>
                </div>

                {/* Players Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPlayers.length > 0 ? (
                        filteredPlayers.map(player => <PlayerCard key={player._id} player={player} />)
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <Users className="w-16 h-16 mx-auto mb-4 text-zinc-800" />
                            <p className="text-zinc-500 text-lg">No players match your criteria.</p>
                        </div>
                    )}
                </div>

                {/* Load More Section */}
                {filteredPlayers.length > 0 && (
                    <div className="text-center mt-12">
                        <button className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white font-semibold px-8 py-3 rounded-lg transition-all">
                            Load More Players
                        </button>
                        <p className="text-zinc-600 text-sm mt-4">Showing {filteredPlayers.length} players</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AegisPlayers;