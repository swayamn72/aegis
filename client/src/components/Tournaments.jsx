import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, MapPin, Gamepad2, Trophy, Calendar, Users } from 'lucide-react';

// --- MOCK DATA ---
// In a real app, this would come from an API
const mockTournaments = [
  { id: 1, name: "Aegis Valorant Championship: Series 1", game: "Valorant", region: "Asia", prize: 50000, startDate: "2025-08-25", status: "Live", teams: 32, registered: 32, logo: "https://placehold.co/64x64/FF4554/FFFFFF?text=VAL" },
  { id: 2, name: "BGMI Pro League - Summer Split", game: "BGMI", region: "India", prize: 75000, startDate: "2025-09-01", status: "Upcoming", teams: 64, registered: 48, logo: "https://placehold.co/64x64/F2A900/FFFFFF?text=BGMI" },
  { id: 3, name: "Counter-Strike 2: Global Offensive", game: "CS2", region: "Europe", prize: 100000, startDate: "2025-08-20", status: "Live", teams: 16, registered: 16, logo: "https://placehold.co/64x64/007ACC/FFFFFF?text=CS2" },
  { id: 4, name: "League of Legends - Rift Rivals", game: "LoL", region: "North America", prize: 120000, startDate: "2025-07-15", status: "Completed", teams: 8, registered: 8, logo: "https://placehold.co/64x64/005A82/FFFFFF?text=LoL" },
  { id: 5, name: "Dota 2 International Qualifiers", game: "Dota 2", region: "Asia", prize: 250000, startDate: "2025-09-10", status: "Upcoming", teams: 128, registered: 112, logo: "https://placehold.co/64x64/D9361A/FFFFFF?text=D2" },
  { id: 6, name: "Call of Duty Mobile Championship", game: "CoD", region: "Global", prize: 150000, startDate: "2025-08-01", status: "Completed", teams: 24, registered: 24, logo: "https://placehold.co/64x64/5C5C5C/FFFFFF?text=CoD" },
  { id: 7, name: "Valorant Conquerors Championship", game: "Valorant", region: "India", prize: 30000, startDate: "2025-09-05", status: "Upcoming", teams: 64, registered: 50, logo: "https://placehold.co/64x64/FF4554/FFFFFF?text=VAL" },
  { id: 8, name: "European CS2 Masters", game: "CS2", region: "Europe", prize: 80000, startDate: "2025-09-15", status: "Upcoming", teams: 32, registered: 15, logo: "https://placehold.co/64x64/007ACC/FFFFFF?text=CS2" },
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

const TournamentCard = ({ tournament }) => {
    const getStatusIndicator = () => {
        switch (tournament.status) {
            case 'Live': return <div className="absolute top-4 right-4 flex items-center gap-2 text-red-400"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>Live</div>;
            case 'Upcoming': return <div className="absolute top-4 right-4 text-cyan-400">Upcoming</div>;
            case 'Completed': return <div className="absolute top-4 right-4 text-gray-400">Completed</div>;
            default: return null;
        }
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10 group">
            <div className="relative p-6">
                {getStatusIndicator()}
                <div className="flex items-center gap-4 mb-4">
                    <img src={tournament.logo} alt={`${tournament.game} logo`} className="w-16 h-16 rounded-lg" />
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{tournament.name}</h3>
                        <p className="text-sm text-zinc-400">{tournament.game} • {tournament.region}</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-zinc-400 text-sm">Prize Pool</p>
                        <p className="text-xl font-bold text-green-400">${tournament.prize.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-zinc-400 text-sm">Start Date</p>
                        <p className="text-lg font-semibold text-white">{new Date(tournament.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div>
                        <p className="text-zinc-400 text-sm">Teams</p>
                        <p className="text-lg font-semibold text-white">{tournament.registered}/{tournament.teams}</p>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-1 w-0 group-hover:w-full transition-all duration-500"></div>
        </div>
    );
};


const TournamentsPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ game: '', region: '', status: '' });

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: prev[filterName] === value ? '' : value }));
    };

    const filteredTournaments = useMemo(() => {
        return mockTournaments.filter(t => {
            return (
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (filters.game ? t.game === filters.game : true) &&
                (filters.region ? t.region === filters.region : true) &&
                (filters.status ? t.status === filters.status : true)
            );
        });
    }, [searchTerm, filters]);
    
    const featuredTournament = mockTournaments.find(t => t.status === 'Live') || mockTournaments[0];

    return (
        <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-20">
            <div className="container mx-auto px-6 py-12">
                
                {/* --- HEADER --- */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-4">
                        Tournaments
                    </h1>
                    <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
                        Find your next challenge. Browse live, upcoming, and past tournaments from around the world.
                    </p>
                </div>

                {/* --- FEATURED TOURNAMENT --- */}
                <div className="mb-16 bg-zinc-900/30 border border-orange-500/30 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-orange-500/10">
                    <img src={featuredTournament.logo} alt={`${featuredTournament.game} logo`} className="w-32 h-32 rounded-xl flex-shrink-0" />
                    <div className="flex-grow text-center md:text-left">
                        <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-red-400 font-semibold text-lg">LIVE NOW</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">{featuredTournament.name}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-zinc-300">
                            <span className="flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-orange-400"/>{featuredTournament.game}</span>
                            <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-orange-400"/>{featuredTournament.region}</span>
                            <span className="flex items-center gap-2"><Trophy className="w-5 h-5 text-orange-400"/>${featuredTournament.prize.toLocaleString()}</span>
                            <span className="flex items-center gap-2"><Users className="w-5 h-5 text-orange-400"/>{featuredTournament.teams} Teams</span>
                        </div>
                    </div>
                    <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold px-8 py-4 rounded-lg transition-transform hover:scale-105 whitespace-nowrap">
                        View Details
                    </button>
                </div>

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
                        <FilterDropdown options={['Valorant', 'BGMI', 'CS2', 'LoL', 'Dota 2', 'CoD']} selected={filters.game} onSelect={(v) => handleFilterChange('game', v)} placeholder="All Games" icon={Gamepad2} />
                        <FilterDropdown options={['Asia', 'India', 'Europe', 'North America', 'Global']} selected={filters.region} onSelect={(v) => handleFilterChange('region', v)} placeholder="All Regions" icon={MapPin} />
                        <FilterDropdown options={['Live', 'Upcoming', 'Completed']} selected={filters.status} onSelect={(v) => handleFilterChange('status', v)} placeholder="All Statuses" icon={Calendar} />
                    </div>
                </div>

                {/* --- TOURNAMENTS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTournaments.length > 0 ? (
                        filteredTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)
                    ) : (
                        <p className="lg:col-span-3 text-center text-zinc-400 text-lg">No tournaments match your criteria.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TournamentsPage;
