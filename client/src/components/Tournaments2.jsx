import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, MapPin, Gamepad2, Trophy, Calendar, Users, Clock, Star } from 'lucide-react';

// --- API CALLS ---
const fetchTournaments = async () => {
  try {
    const response = await fetch('/api/tournaments/all');
    if (!response.ok) throw new Error('Failed to fetch tournaments');
    const data = await response.json();
    return {
      tournaments: data.tournaments || [],
      liveTournaments: data.liveTournaments || [],
      upcomingTournaments: data.upcomingTournaments || []
    };
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return {
      tournaments: [],
      liveTournaments: [],
      upcomingTournaments: []
    };
  }
};

const FilterDropdown = ({ options, selected, onSelect, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white transition-colors hover:bg-zinc-700/50 hover:border-orange-500/50"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-orange-400" />
          <span className="truncate">{selected || placeholder}</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-lg z-20 shadow-xl max-h-60 overflow-y-auto">
          <button
            onClick={() => { onSelect(''); setIsOpen(false); }}
            className="w-full text-left px-4 py-2 hover:bg-orange-500/10 text-zinc-300 hover:text-white transition-colors"
          >
            All {placeholder.split(' ')[1]}
          </button>
          {options.map(option => (
            <button
              key={option}
              onClick={() => { onSelect(option); setIsOpen(false); }}
              className={`w-full text-left px-4 py-2 hover:bg-orange-500/10 transition-colors ${selected === option ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-300 hover:text-white'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TournamentCard = ({ tournament, onClick }) => {
  const getStatusIndicator = () => {
    const liveStatuses = ['in_progress', 'qualifiers_in_progress', 'group_stage', 'playoffs', 'finals'];
    const upcomingStatuses = ['announced', 'registration_open', 'registration_closed'];

    if (liveStatuses.includes(tournament.status)) {
      return (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/30">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium">LIVE</span>
        </div>
      );
    }

    if (upcomingStatuses.includes(tournament.status)) {
      return (
        <div className="absolute top-4 right-4 text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full border border-cyan-500/30">
          <span className="text-xs font-medium">UPCOMING</span>
        </div>
      );
    }

    if (tournament.status === 'completed') {
      return (
        <div className="absolute top-4 right-4 text-gray-400 bg-gray-500/10 px-2 py-1 rounded-full border border-gray-500/30">
          <span className="text-xs font-medium">COMPLETED</span>
        </div>
      );
    }

    return null;
  };

  const formatPrizePool = (prizePool) => {
    if (!prizePool || !prizePool.total || prizePool.total === 0) return 'TBD';

    const amount = prizePool.total;
    const currency = prizePool.currency || 'INR';
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;

    if (amount >= 10000000) { // 1 crore
      return `${symbol}${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) { // 1 lakh
      return `${symbol}${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`;
    }
    return `${symbol}${amount}`;
  };

  const getTierColor = () => {
    switch (tournament.tier) {
      case 'S': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'A': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'B': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'C': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      default: return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'TBD';
    }
  };

  const getParticipatingTeamsCount = () => {
    if (tournament.participatingTeams && Array.isArray(tournament.participatingTeams)) {
      return tournament.participatingTeams.length;
    }
    return tournament.statistics?.totalParticipatingTeams || 0;
  };

  const getTotalSlots = () => {
    return tournament.slots?.total || 'TBD';
  };

  return (
    <div
      className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10 group cursor-pointer backdrop-blur-sm"
      onClick={onClick}
    >
      <div className="relative p-6">
        {getStatusIndicator()}

        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            {tournament.media?.logo ? (
              <img
                src={tournament.media.logo}
                alt={`${tournament.tournamentName} logo`}
                className="w-16 h-16 rounded-lg object-cover border border-zinc-700"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/64x64/1a1a1a/ffffff?text=' + (tournament.gameTitle || 'T');
                }}
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-lg flex items-center justify-center border border-zinc-600">
                <Gamepad2 className="w-8 h-8 text-zinc-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-2 mb-2">
              {tournament.tournamentName || tournament.shortName || 'Unnamed Tournament'}
            </h3>

            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
              <span className="flex items-center gap-1">
                <Gamepad2 className="w-4 h-4" />
                {tournament.gameTitle || 'Unknown Game'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {tournament.region || 'Unknown Region'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full border ${getTierColor()}`}>
                {tournament.tier || 'Community'}-Tier
              </span>
              {tournament.featured && (
                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <Star className="w-3 h-3 inline mr-1" />
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center border-t border-zinc-800 pt-4">
          <div className="group/stat hover:bg-zinc-800/30 rounded-lg p-2 transition-colors">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="w-4 h-4 text-green-400 mr-1" />
              <p className="text-zinc-400 text-xs">Prize Pool</p>
            </div>
            <p className="text-lg font-bold text-green-400">
              {formatPrizePool(tournament.prizePool)}
            </p>
          </div>

          <div className="group/stat hover:bg-zinc-800/30 rounded-lg p-2 transition-colors">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="w-4 h-4 text-blue-400 mr-1" />
              <p className="text-zinc-400 text-xs">Start Date</p>
            </div>
            <p className="text-sm font-semibold text-white">
              {formatDate(tournament.startDate)}
            </p>
          </div>

          <div className="group/stat hover:bg-zinc-800/30 rounded-lg p-2 transition-colors">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-purple-400 mr-1" />
              <p className="text-zinc-400 text-xs">Teams</p>
            </div>
            <p className="text-sm font-semibold text-white">
              {getParticipatingTeamsCount()}/{getTotalSlots()}
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
  const [filters, setFilters] = useState({ game: '', region: '', status: '', tier: '' });
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveTournaments, setLiveTournaments] = useState([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);

  // Load tournaments on component mount
  useEffect(() => {
    const loadTournaments = async () => {
      try {
        setLoading(true);
        setError(null);

        const { tournaments: fetchedTournaments, liveTournaments: live, upcomingTournaments: upcoming } = await fetchTournaments();

        setTournaments(fetchedTournaments);
        setLiveTournaments(live);
        setUpcomingTournaments(upcoming);
      } catch (err) {
        console.error('Error loading tournaments:', err);
        setError('Failed to load tournaments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadTournaments();
  }, []);

  // Extract unique filter options from loaded tournaments
  const filterOptions = useMemo(() => {
    const games = [...new Set(tournaments.map(t => t.gameTitle).filter(Boolean))];
    const regions = [...new Set(tournaments.map(t => t.region).filter(Boolean))];
    const statuses = [...new Set(tournaments.map(t => t.status).filter(Boolean))];
    const tiers = [...new Set(tournaments.map(t => t.tier).filter(Boolean))];

    return { games, regions, statuses, tiers };
  }, [tournaments]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: prev[filterName] === value ? '' : value
    }));
  };

  // Filter tournaments based on search and filters
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(tournament => {
      const matchesSearch = !searchTerm ||
        tournament.tournamentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.organizer?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGame = !filters.game || tournament.gameTitle === filters.game;
      const matchesRegion = !filters.region || tournament.region === filters.region;
      const matchesStatus = !filters.status || tournament.status === filters.status;
      const matchesTier = !filters.tier || tournament.tier === filters.tier;

      return matchesSearch && matchesGame && matchesRegion && matchesStatus && matchesTier;
    });
  }, [searchTerm, filters, tournaments]);

  // Get featured tournament (prefer live, then upcoming)
  const featuredTournament = useMemo(() => {
    if (liveTournaments.length > 0) return liveTournaments[0];
    if (upcomingTournaments.length > 0) return upcomingTournaments[0];
    if (tournaments.length > 0) return tournaments[0];
    return null;
  }, [liveTournaments, upcomingTournaments, tournaments]);

  // Format prize pool helper
  const formatPrizePool = (prizePool) => {
    if (!prizePool || !prizePool.total || prizePool.total === 0) return 'TBD';

    const amount = prizePool.total;
    const currency = prizePool.currency || 'INR';
    const symbol = currency === 'INR' ? '₹' : "$";

    if (amount >= 10000000) {
      return `${symbol}${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `${symbol}${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`;
    }
    return `${symbol}${amount}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-zinc-400 text-lg">Loading tournaments...</p>
            <p className="text-zinc-600 text-sm mt-2">Fetching latest tournament data</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
            <p className="text-zinc-400 text-lg mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-6 py-3 rounded-lg transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-20">
      <div className="container mx-auto px-6 py-12">

        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-4">
            Tournaments
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-6">
            Discover competitive tournaments from our database. Browse live, upcoming, and past events.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 text-sm text-zinc-400">
            <span>
              <span className="text-red-400 font-semibold">{liveTournaments.length}</span> Live
            </span>
            <span>
              <span className="text-cyan-400 font-semibold">{upcomingTournaments.length}</span> Upcoming
            </span>
            <span>
              <span className="text-white font-semibold">{tournaments.length}</span> Total
            </span>
          </div>
        </div>

        {/* FEATURED TOURNAMENT */}
        {featuredTournament && (
          <div className="mb-16 bg-zinc-900/30 border border-orange-500/30 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-orange-500/10 backdrop-blur-sm">
            <div className="flex-shrink-0">
              {featuredTournament.media?.logo ? (
                <img
                  src={featuredTournament.media.logo}
                  alt={`${featuredTournament.tournamentName} logo`}
                  className="w-32 h-32 rounded-xl object-cover border border-zinc-700"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/128x128/1a1a1a/ffffff?text=' + (featuredTournament.gameTitle || 'T');
                  }}
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-xl flex items-center justify-center border border-zinc-600">
                  <Gamepad2 className="w-16 h-16 text-zinc-400" />
                </div>
              )}
            </div>

            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-400 font-semibold text-lg">
                  {liveTournaments.includes(featuredTournament) ? 'LIVE NOW' : 'FEATURED'}
                </span>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">
                {featuredTournament.tournamentName}
              </h2>

              <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-zinc-300">
                <span className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-orange-400" />
                  {featuredTournament.gameTitle}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  {featuredTournament.region}
                </span>
                <span className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-orange-400" />
                  {formatPrizePool(featuredTournament.prizePool)}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-400" />
                  {featuredTournament.participatingTeams?.length || featuredTournament.statistics?.totalParticipatingTeams || 0} Teams
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  {featuredTournament.startDate ? new Date(featuredTournament.startDate).toLocaleDateString() : 'TBD'}
                </span>
              </div>
            </div>

            <button
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 whitespace-nowrap shadow-lg"
              onClick={() => navigate(`/tournament/${featuredTournament._id}`)}
            >
              View Details
            </button>
          </div>
        )}

        {/* FILTERS & SEARCH */}
        <div className="mb-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            <FilterDropdown
              options={filterOptions.games}
              selected={filters.game}
              onSelect={(v) => handleFilterChange('game', v)}
              placeholder="All Games"
              icon={Gamepad2}
            />

            <FilterDropdown
              options={filterOptions.regions}
              selected={filters.region}
              onSelect={(v) => handleFilterChange('region', v)}
              placeholder="All Regions"
              icon={MapPin}
            />

            <FilterDropdown
              options={filterOptions.statuses}
              selected={filters.status}
              onSelect={(v) => handleFilterChange('status', v)}
              placeholder="All Statuses"
              icon={Calendar}
            />

            <FilterDropdown
              options={filterOptions.tiers}
              selected={filters.tier}
              onSelect={(v) => handleFilterChange('tier', v)}
              placeholder="All Tiers"
              icon={Trophy}
            />
          </div>

          {/* Active filters display */}
          {(filters.game || filters.region || filters.status || filters.tier || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-zinc-400">Active filters:</span>
              {searchTerm && (
                <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs border border-orange-500/30">
                  Search: "{searchTerm}"
                </span>
              )}
              {filters.game && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs border border-blue-500/30">
                  {filters.game}
                </span>
              )}
              {filters.region && (
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs border border-green-500/30">
                  {filters.region}
                </span>
              )}
              {filters.status && (
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs border border-purple-500/30">
                  {filters.status}
                </span>
              )}
              {filters.tier && (
                <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs border border-yellow-500/30">
                  {filters.tier}-Tier
                </span>
              )}
              <button
                onClick={() => {
                  setFilters({ game: '', region: '', status: '', tier: '' });
                  setSearchTerm('');
                }}
                className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* TOURNAMENTS GRID */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">
              {filteredTournaments.length > 0 ? `${filteredTournaments.length} Tournaments Found` : 'No Tournaments Found'}
            </h3>

            {filteredTournaments.length > 0 && (
              <div className="text-sm text-zinc-400">
                Showing {Math.min(filteredTournaments.length, 50)} of {filteredTournaments.length} results
              </div>
            )}
          </div>

          {filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTournaments.slice(0, 50).map(tournament => (
                <TournamentCard
                  key={tournament._id}
                  tournament={tournament}
                  onClick={() => navigate(`/tournament/${tournament._id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-zinc-600 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-zinc-300 mb-2">No tournaments found</h3>
              <p className="text-zinc-500 mb-6">
                {searchTerm || Object.values(filters).some(f => f) ?
                  'Try adjusting your search criteria or filters.' :
                  'No tournaments are currently available in our database.'
                }
              </p>
              {(searchTerm || Object.values(filters).some(f => f)) && (
                <button
                  onClick={() => {
                    setFilters({ game: '', region: '', status: '', tier: '' });
                    setSearchTerm('');
                  }}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* PAGINATION/LOAD MORE */}
        {filteredTournaments.length > 50 && (
          <div className="text-center">
            <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
              Load More Tournaments
            </button>
            <p className="text-zinc-400 text-sm mt-4">
              Showing 50 of {filteredTournaments.length} tournaments
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments2;