import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, MapPin, Gamepad2, Trophy, Award, Eye, Check, Target, Briefcase, UserPlus, User } from 'lucide-react';

// --- MOCK DATA ---
const mockOrganizations = [
  {
    id: 1,
    name: "Velocity Gaming",
    logo: "https://placehold.co/64x64/00D4AA/FFFFFF?text=VG",
    game: "CS2",
    region: "India",
    rolesNeeded: ["AWPer", "IGL"],
    minRating: 2800,
    teamSize: "5/5",
    budget: "Paid",
    requirements: "Professional experience required",
    postedDate: "2025-08-20",
    verified: true,
    priority: "High",
    description: "Looking for experienced players to complete our roster for upcoming international tournaments.",
    achievements: ["ESL Pro League", "IEM Katowice Qualifier"],
    contactInfo: "recruitment@velocitygaming.gg"
  },
  {
    id: 2,
    name: "Dragons Esports",
    logo: "https://placehold.co/64x64/DC2626/FFFFFF?text=DE",
    game: "Valorant",
    region: "Asia",
    rolesNeeded: ["Duelist", "Sentinel"],
    minRating: 2900,
    teamSize: "3/5",
    budget: "Salary + Benefits",
    requirements: "Radiant rank minimum",
    postedDate: "2025-08-22",
    verified: true,
    priority: "Urgent",
    description: "Premier organization seeking top-tier talent for VCT competition.",
    achievements: ["VCT Champions", "Masters Winner"],
    contactInfo: "tryouts@dragonsesports.com"
  },
  {
    id: 3,
    name: "Neon Esports",
    logo: "https://placehold.co/64x64/FF6B35/FFFFFF?text=NE",
    game: "Valorant",
    region: "India",
    rolesNeeded: ["Controller", "Initiator"],
    minRating: 2600,
    teamSize: "4/5",
    budget: "Competitive Salary",
    requirements: "Team player with good comms",
    postedDate: "2025-08-18",
    verified: true,
    priority: "Medium",
    description: "Building a strong roster for regional competitions and beyond.",
    achievements: ["Regional Champions", "Rising Stars"],
    contactInfo: "contact@neonesports.in"
  },
  {
    id: 4,
    name: "Eclipse Gaming",
    logo: "https://placehold.co/64x64/6366F1/FFFFFF?text=EG",
    game: "LoL",
    region: "Europe",
    rolesNeeded: ["Support", "Jungle"],
    minRating: 2750,
    teamSize: "3/5",
    budget: "Performance Based",
    requirements: "Challenger rank, flexible schedule",
    postedDate: "2025-08-21",
    verified: false,
    priority: "Medium",
    description: "European organization looking to expand into competitive League of Legends.",
    achievements: ["Regional Finalist", "Academy Champions"],
    contactInfo: "recruitment@eclipsegaming.eu"
  },
  {
    id: 5,
    name: "Phoenix Rising",
    logo: "https://placehold.co/64x64/F59E0B/FFFFFF?text=PR",
    game: "BGMI",
    region: "India",
    rolesNeeded: ["Fragger", "Support"],
    minRating: 2500,
    teamSize: "2/4",
    budget: "Stipend + Bonuses",
    requirements: "Conqueror rank, active player",
    postedDate: "2025-08-23",
    verified: true,
    priority: "High",
    description: "New organization with ambitious goals and strong backing.",
    achievements: ["Rising Org 2024"],
    contactInfo: "tryouts@phoenixrising.gg"
  }
];

const mockLFTPlayers = [
  {
    id: 1,
    realName: "Swayam Nakte",
    inGameName: "Zyaxxxx",
    game: "Valorant",
    region: "India",
    rank: "Immortal 3",
    aegisRating: 2847,
    winRate: 73.2,
    role: "Duelist",
    exTeam: "Neon Esports",
    teamLogo: "https://placehold.co/32x32/FF6B35/FFFFFF?text=NE",
    verified: true,
    availability: "Immediate",
    lookingFor: "Professional Team",
    avatar: "https://placehold.co/64x64/FF4554/FFFFFF?text=ZX",
    achievements: ["Champion - Winter Circuit 2024", "MVP - Regional Qualifier"],
    preferredBudget: "Salary",
    description: "Experienced duelist looking for a competitive team to compete in VCT.",
    contactInfo: "zyaxxxx@protonmail.com"
  },
  {
    id: 2,
    realName: "Kai Anderson",
    inGameName: "FrostBite",
    game: "LoL",
    region: "North America",
    rank: "Challenger",
    aegisRating: 2756,
    winRate: 69.3,
    role: "ADC",
    exTeam: "Cloud9 Academy",
    teamLogo: "https://placehold.co/32x32/0ea5e9/FFFFFF?text=C9",
    verified: false,
    availability: "2 weeks notice",
    lookingFor: "Academy/Pro Team",
    avatar: "https://placehold.co/64x64/005A82/FFFFFF?text=FB",
    achievements: ["Solo Queue Legend", "Rookie of the Year"],
    preferredBudget: "Negotiable",
    description: "Consistent ADC player with academy experience seeking next opportunity.",
    contactInfo: "frostbite.lol@gmail.com"
  },
   {
    id: 3,
    realName: "Yuki Tanaka",
    inGameName: "StormBreaker",
    game: "Valorant",
    region: "Asia",
    rank: "Immortal 2",
    aegisRating: 2678,
    winRate: 74.9,
    role: "Sentinel",
    exTeam: "ZETA DIVISION",
    teamLogo: "https://placehold.co/32x32/EF4444/FFFFFF?text=ZD",
    verified: false,
    availability: "Immediate",
    lookingFor: "International Team",
    avatar: "https://placehold.co/64x64/FF4554/FFFFFF?text=SB",
    achievements: ["Clutch Player Award", "Rising Talent"],
    preferredBudget: "Salary + Benefits",
    description: "Solid sentinel with international experience looking for new challenges.",
    contactInfo: "stormbreaker.val@outlook.com"
  },
  {
    id: 4,
    realName: "Marcus Johnson",
    inGameName: "BlitzKrieg",
    game: "CS2",
    region: "North America",
    rank: "Global Elite",
    aegisRating: 2743,
    winRate: 76.1,
    role: "Rifler",
    exTeam: "FaZe Clan",
    teamLogo: "https://placehold.co/32x32/DC2626/000000?text=FZ",
    verified: true,
    availability: "1 month notice",
    lookingFor: "Tier 1 Team",
    avatar: "https://placehold.co/64x64/007ACC/FFFFFF?text=BK",
    achievements: ["Major Qualifier", "Clutch King"],
    preferredBudget: "High Salary",
    description: "Former FaZe player seeking return to competitive CS2 scene.",
    contactInfo: "blitzkrieg.cs@promail.com"
  },
  {
    id: 5,
    realName: "Arya Sharma",
    inGameName: "ThunderBolt",
    game: "BGMI",
    region: "India",
    rank: "Conqueror",
    aegisRating: 2590,
    winRate: 71.8,
    role: "IGL",
    exTeam: "Team Soul",
    teamLogo: "https://placehold.co/32x32/7C3AED/FFFFFF?text=TS",
    verified: true,
    availability: "Immediate",
    lookingFor: "Competitive Team",
    avatar: "https://placehold.co/64x64/F2A900/FFFFFF?text=TB",
    achievements: ["PMIS Finalist", "Best IGL Award"],
    preferredBudget: "Competitive Package",
    description: "Experienced IGL with strong leadership and strategic skills.",
    contactInfo: "thunderbolt.bgmi@gmail.com"
  }
];

// --- SUB-COMPONENTS ---
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

const OrganizationCard = ({ org }) => {
    const getPriorityColor = () => {
        switch (org.priority) {
            case 'Urgent': return 'text-red-400 border-red-400/30 bg-red-400/10';
            case 'High': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
            case 'Medium': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
            default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
        }
    };
    const getBudgetColor = () => {
        if (org.budget.includes('Salary')) return 'text-green-400';
        if (org.budget.includes('Paid')) return 'text-blue-400';
        return 'text-yellow-400';
    };
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:scale-[1.03] hover:shadow-2xl hover:shadow-orange-500/10 group">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={org.logo} alt={org.name} className="w-16 h-16 rounded-xl" />
                            {org.verified && (
                                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 p-1 rounded-full shadow-lg shadow-orange-400/50">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{org.name}</h3>
                            <p className="text-gray-300 text-sm">{org.game} • {org.region}</p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor()}`}>
                        {org.priority} Priority
                    </div>
                </div>
                <div className="mb-4">
                    <p className="text-zinc-400 text-sm mb-2">Roles Needed:</p>
                    <div className="flex flex-wrap gap-2">
                        {org.rolesNeeded.map(role => (
                            <span key={role} className="px-3 py-1 bg-orange-500/20 border border-orange-400/30 rounded-full text-orange-400 text-sm font-medium">
                                {role}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                        <p className="text-zinc-400 text-xs">Min Rating</p>
                        <p className="text-white font-semibold">{org.minRating}+</p>
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                        <p className="text-zinc-400 text-xs">Team Size</p>
                        <p className="text-white font-semibold">{org.teamSize}</p>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                        Apply Now
                    </button>
                    <button className="px-4 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-1 w-0 group-hover:w-full transition-all duration-500"></div>
        </div>
    );
};

const LFTPlayerCard = ({ player }) => {
    const getAvailabilityColor = () => {
        if (player.availability === 'Immediate') return 'text-green-400 border-green-400/30 bg-green-400/10';
        return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
    };
    const getRankColor = () => {
        switch (player.game) {
            case 'Valorant': return 'text-red-400';
            case 'CS2': return 'text-blue-400';
            case 'LoL': return 'text-purple-400';
            case 'BGMI': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:scale-[1.03] hover:shadow-2xl hover:shadow-cyan-500/10 group">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={player.avatar} alt={player.inGameName} className="w-16 h-16 rounded-xl" />
                            {player.verified && (
                                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 p-1 rounded-full shadow-lg shadow-orange-400/50">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{player.inGameName}</h3>
                            <p className="text-gray-300 text-sm">{player.realName}</p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getAvailabilityColor()}`}>
                        {player.availability}
                    </div>
                </div>
                <div className="bg-gradient-to-r from-cyan-600/20 to-blue-500/20 border border-cyan-400/30 rounded-lg p-3 mb-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400 text-sm font-semibold">Aegis Rating</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{player.aegisRating}</div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-center">
                        <p className="text-zinc-400 text-xs">Win Rate</p>
                        <p className="text-green-400 font-semibold">{player.winRate}%</p>
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-center">
                        <p className="text-zinc-400 text-xs">Rank</p>
                        <p className={`font-semibold ${getRankColor()}`}>{player.rank}</p>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
                        Contact Player
                    </button>
                    <button className="px-4 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 w-0 group-hover:w-full transition-all duration-500"></div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
const AegisOpportunities = () => {
    const [activeTab, setActiveTab] = useState('organizations');
    const [orgSearchTerm, setOrgSearchTerm] = useState('');
    const [playerSearchTerm, setPlayerSearchTerm] = useState('');
    const [orgFilters, setOrgFilters] = useState({ game: '', region: '', priority: '' });
    const [playerFilters, setPlayerFilters] = useState({ game: '', region: '', role: '' });

    const handleOrgFilterChange = (filterName, value) => {
        setOrgFilters(prev => ({ ...prev, [filterName]: prev[filterName] === value ? '' : value }));
    };

    const handlePlayerFilterChange = (filterName, value) => {
        setPlayerFilters(prev => ({ ...prev, [filterName]: prev[filterName] === value ? '' : value }));
    };

    const filteredOrganizations = useMemo(() => {
        return mockOrganizations.filter(org => {
            const matchesSearch = org.name.toLowerCase().includes(orgSearchTerm.toLowerCase());
            const matchesGame = orgFilters.game ? org.game === orgFilters.game : true;
            const matchesRegion = orgFilters.region ? org.region === orgFilters.region : true;
            const matchesPriority = orgFilters.priority ? org.priority === orgFilters.priority : true;
            return matchesSearch && matchesGame && matchesRegion && matchesPriority;
        });
    }, [orgSearchTerm, orgFilters]);

    const filteredLFTPlayers = useMemo(() => {
        return mockLFTPlayers.filter(player => {
            const matchesSearch = player.inGameName.toLowerCase().includes(playerSearchTerm.toLowerCase()) || 
                                  player.realName.toLowerCase().includes(playerSearchTerm.toLowerCase());
            const matchesGame = playerFilters.game ? player.game === playerFilters.game : true;
            const matchesRegion = playerFilters.region ? player.region === playerFilters.region : true;
            const matchesRole = playerFilters.role ? player.role === playerFilters.role : true;
            return matchesSearch && matchesGame && matchesRegion && matchesRole;
        }).sort((a, b) => b.aegisRating - a.aegisRating);
    }, [playerSearchTerm, playerFilters]);

    return (
        <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-20">
            <div className="container mx-auto px-6 py-12">
                
                {/* --- HEADER --- */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-4">
                        Opportunities
                    </h1>
                    <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
                        Connect talent with opportunity. Browse recruiting organizations and discover available players looking for their next team.
                    </p>
                </div>

                {/* --- TABS --- */}
                <div className="flex justify-center mb-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-2 flex">
                        <button 
                            onClick={() => setActiveTab('organizations')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                                activeTab === 'organizations' 
                                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            <Briefcase className="w-5 h-5" />
                            Organizations Recruiting
                        </button>
                        <button 
                            onClick={() => setActiveTab('players')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                                activeTab === 'players' 
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            <UserPlus className="w-5 h-5" />
                            Players Looking for Team
                        </button>
                    </div>
                </div>

                {/* --- CONDITIONAL CONTENT RENDER --- */}
                {activeTab === 'organizations' ? (
                    <div>
                        {/* Filters */}
                        <div className="mb-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Search organizations..."
                                        value={orgSearchTerm}
                                        onChange={(e) => setOrgSearchTerm(e.target.value)}
                                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <FilterDropdown options={['Valorant', 'CS2', 'LoL', 'BGMI']} selected={orgFilters.game} onSelect={(v) => handleOrgFilterChange('game', v)} placeholder="All Games" icon={Gamepad2} />
                                <FilterDropdown options={['India', 'Asia', 'Europe', 'North America']} selected={orgFilters.region} onSelect={(v) => handleOrgFilterChange('region', v)} placeholder="All Regions" icon={MapPin} />
                                <FilterDropdown options={['Urgent', 'High', 'Medium']} selected={orgFilters.priority} onSelect={(v) => handleOrgFilterChange('priority', v)} placeholder="All Priorities" icon={Target} />
                            </div>
                        </div>

                        {/* Organizations Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                            {filteredOrganizations.map(org => <OrganizationCard key={org.id} org={org} />)}
                        </div>
                         {filteredOrganizations.length === 0 && (
                            <div className="text-center py-12 text-zinc-400">
                                <p className="text-lg">No organizations match your filters.</p>
                                <p className="text-sm">Try adjusting your search criteria.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                         {/* Player Filters */}
                         <div className="mb-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Search players..."
                                        value={playerSearchTerm}
                                        onChange={(e) => setPlayerSearchTerm(e.target.value)}
                                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <FilterDropdown options={['Valorant', 'CS2', 'LoL', 'BGMI']} selected={playerFilters.game} onSelect={(v) => handlePlayerFilterChange('game', v)} placeholder="All Games" icon={Gamepad2} />
                                <FilterDropdown options={['India', 'Asia', 'Europe', 'North America']} selected={playerFilters.region} onSelect={(v) => handlePlayerFilterChange('region', v)} placeholder="All Regions" icon={MapPin} />
                                <FilterDropdown options={['Duelist', 'Sentinel', 'Controller', 'Initiator', 'IGL', 'AWPer', 'Rifler', 'ADC', 'Support', 'Fragger']} selected={playerFilters.role} onSelect={(v) => handlePlayerFilterChange('role', v)} placeholder="All Roles" icon={User} />
                            </div>
                        </div>

                        {/* Players Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                             {filteredLFTPlayers.map(player => <LFTPlayerCard key={player.id} player={player} />)}
                        </div>
                         {filteredLFTPlayers.length === 0 && (
                            <div className="text-center py-12 text-zinc-400">
                                <p className="text-lg">No players match your filters.</p>
                                <p className="text-sm">Try adjusting your search criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AegisOpportunities;