import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, MapPin, Gamepad2, Trophy, Calendar, Users } from 'lucide-react';

// --- API CALLS ---
const fetchTournaments = async () => {
  try {
    const response = await fetch('/api/tournaments/all');
    const data = await response.json();
    return data.tournaments || [];
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
};

const fetchLiveTournaments = async () => {
  try {
    const response = await fetch('/api/tournaments/live');
    const data = await response.json();
    return data.tournaments || [];
  } catch (error) {
    console.error('Error fetching live tournaments:', error);
    return [];
  }
};

const fetchUpcomingTournaments = async () => {
  try {
    const response = await fetch('/api/tournaments/upcoming');
    const data = await response.json();
    return data.tournaments || [];
  } catch (error) {
    console.error('Error fetching upcoming tournaments:', error);
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

const TournamentCard = ({ tournament, onClick }) => {
    const getStatusIndicator = () => {
        switch (tournament.status) {
            case 'in_progress':
            case 'qualifiers_in_progress':
            case 'group_stage':
            case 'playoffs':
            case 'finals':
                return <div className="absolute top-4 right-4 flex items-center gap-2 text-red-400"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>Live</div>;
            case 'upcoming':
            case 'announced':
            case 'registration_open':
                return <div className="absolute top-4 right-4 text-cyan-400">Upcoming</div>;
            case 'completed':
                return <div className="absolute top-4 right-4 text-gray-400">Completed</div>;
            default:
                return null;
        }
    };

    const getGameColor = () => {
        switch (tournament.gameTitle) {
            case 'BGMI': return 'text-yellow-400';
            case 'Valorant': return 'text-red-400';
            case 'CS2': return 'text-blue-400';
            case 'LoL': return 'text-purple-400';
            case 'Dota 2': return 'text-orange-400';
            default: return 'text-gray-400';
        }
    };

    const formatPrizePool = (prizePool) => {
        if (!prizePool || !prizePool.total) return 'TBD';
        const amount = prizePool.total;
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return `₹${amount}`;
    };

    const getTierColor = () => {
        switch (tournament.tier) {
            case 'S': return 'text-yellow-400';
            case 'A': return 'text-blue-400';
            case 'B': return 'text-green-400';
            case 'C': return 'text-gray-400';
            default: return 'text-orange-400';
        }
    };

    return (
        <div 
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10 group cursor-pointer"
            onClick={onClick}
        >
            <div className="relative p-6">
                {getStatusIndicator()}
                <div className="flex items-center gap-4 mb-4">
                    {tournament.media?.logo ? (
                        <img src={tournament.media.logo} alt={`${tournament.gameTitle} logo`} className="w-16 h-16 rounded-lg" />
                    ) : (
                        <div className="w-16 h-16 bg-zinc-700 rounded-lg flex items-center justify-center">
                            <Gamepad2 className="w-8 h-8 text-zinc-400" />
                        </div>
                    )}
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{tournament.tournamentName}</h3>
                        <p className="text-sm text-zinc-400">{tournament.gameTitle} • {tournament.region}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full bg-zinc-800 ${getTierColor()}`}>
                                {tournament.tier}-Tier
                            </span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-zinc-400 text-sm">Prize Pool</p>
                        <p className="text-xl font-bold text-green-400">{formatPrizePool(tournament.prizePool)}</p>
                    </div>
                    <div>
                        <p className="text-zinc-400 text-sm">Start Date</p>
                        <p className="text-lg font-semibold text-white">
                            {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                        </p>
                    </div>
                    <div>
                        <p className="text-zinc-400 text-sm">Teams</p>
                        <p className="text-lg font-semibold text-white">
                            {tournament.participatingTeams ? tournament.participatingTeams.length : 'TBD'}/{tournament.slots?.total || 'TBD'}
                        </p>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-1 w-0 group-hover:w-full transition-all duration-500"></div>
        </div>
    );
};

const Tournaments2 = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ game: '', region: '', status: '' });
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liveTournaments, setLiveTournaments] = useState([]);
    const [upcomingTournaments, setUpcomingTournaments] = useState([]);

    const formatPrizePool = (prizePool) => {
        if (!prizePool || !prizePool.total) return 'TBD';
        const amount = prizePool.total;
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return `₹${amount}`;
    };

    useEffect(() => {
        const loadTournaments = async () => {
            setLoading(true);
            const [fetchedTournaments, live, upcoming] = await Promise.all([
                fetchTournaments(),
                fetchLiveTournaments(),
                fetchUpcomingTournaments()
            ]);
            setTournaments(fetchedTournaments);
            setLiveTournaments(live);
            setUpcomingTournaments(upcoming);
            setLoading(false);
        };
        loadTournaments();
    }, []);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: prev[filterName] === value ? '' : value }));
    };

    const filteredTournaments = useMemo(() => {
        return tournaments.filter(t => {
            return (
                t.tournamentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (filters.game ? t.gameTitle === filters.game : true) &&
                (filters.region ? t.region === filters.region : true) &&
                (filters.status ? t.status === filters.status : true)
            );
        });
    }, [searchTerm, filters, tournaments]);

    const featuredTournament = liveTournaments.length > 0 ? liveTournaments[0] : upcomingTournaments[0];

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-20">
                <div className="container mx-auto px-6 py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-zinc-400">Loading tournaments...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-20">
            <div className="container mx-auto px-6 py-12">

                {/* --- HEADER --- */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-4">
                        Tournaments
                    </h1>
                    <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
                        Discover competitive tournaments from our database. Browse live, upcoming, and past events.
                    </p>
                </div>

                {/* --- FEATURED TOURNAMENT --- */}
                {featuredTournament && (
                    <div className="mb-16 bg-zinc-900/30 border border-orange-500/30 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-orange-500/10">
                        {featuredTournament.media?.logo ? (
                            <img src={featuredTournament.media.logo} alt={`${featuredTournament.gameTitle} logo`} className="w-32 h-32 rounded-xl flex-shrink-0" />
                        ) : (
                            <div className="w-32 h-32 bg-zinc-700 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Gamepad2 className="w-16 h-16 text-zinc-400" />
                            </div>
                        )}
                        <div className="flex-grow text-center md:text-left">
                            <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-red-400 font-semibold text-lg">
                                    {liveTournaments.includes(featuredTournament) ? 'LIVE NOW' : 'UPCOMING'}
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">{featuredTournament.tournamentName}</h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-zinc-300">
                                <span className="flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-orange-400"/>{featuredTournament.gameTitle}</span>
                                <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-orange-400"/>{featuredTournament.region}</span>
                                <span className="flex items-center gap-2"><Trophy className="w-5 h-5 text-orange-400"/>{formatPrizePool(featuredTournament.prizePool)}</span>
                                <span className="flex items-center gap-2"><Users className="w-5 h-5 text-orange-400"/>{featuredTournament.participatingTeams?.length || 0} Teams</span>
                            </div>
                        </div>
                        <button 
                            className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold px-8 py-4 rounded-lg transition-transform hover:scale-105 whitespace-nowrap cursor-pointer"
                            onClick={() => navigate(`/tournament/${featuredTournament._id}`)}
                        >
                            View Details
                        </button>
                    </div>
                )}

                {/* --- FILTERS & SEARCH --- */}
                <div className="mb-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative lg:col-span-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search tournaments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <FilterDropdown
                            options={['BGMI', 'Valorant', 'CS2', 'LoL', 'Dota 2']}
                            selected={filters.game}
                            onSelect={(v) => handleFilterChange('game', v)}
                            placeholder="All Games"
                            icon={Gamepad2}
                        />
                        <FilterDropdown
                            options={['Global', 'Asia', 'India', 'South Asia', 'Europe', 'North America']}
                            selected={filters.region}
                            onSelect={(v) => handleFilterChange('region', v)}
                            placeholder="All Regions"
                            icon={MapPin}
                        />
                        <FilterDropdown
                            options={['announced', 'registration_open', 'in_progress', 'completed']}
                            selected={filters.status}
                            onSelect={(v) => handleFilterChange('status', v)}
                            placeholder="All Statuses"
                            icon={Calendar}
                        />
                    </div>
                </div>

                {/* --- TOURNAMENTS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTournaments.length > 0 ? (
                        filteredTournaments.map(t => <TournamentCard key={t._id} tournament={t} onClick={() => navigate(`/tournament/${t._id}`)} />)
                    ) : (
                        <p className="lg:col-span-3 text-center text-zinc-400 text-lg">No tournaments match your criteria.</p>
                    )}
                </div>

                {/* --- LOAD MORE SECTION --- */}
                {filteredTournaments.length > 0 && (
                    <div className="text-center mt-12">
                        <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105">
                            Load More Tournaments
                        </button>
                        <p className="text-zinc-400 text-sm mt-4">Showing {filteredTournaments.length} of {tournaments.length} tournaments</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tournaments2;
