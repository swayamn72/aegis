import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, MapPin, Gamepad2, Trophy, Award, Eye, Check, Target, Briefcase, UserPlus, User, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

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
        <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-lg z-10 shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <button key={option} onClick={() => { onSelect(option); setIsOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-orange-500/10 transition-colors">{option}</button>
          ))}
        </div>
      )}
    </div>
  );
};

const ApplicationModal = ({ team, onClose, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const toggleRole = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRoles.length === 0) {
      toast.error('Please select at least one role');
      return;
    }
    onSubmit({ message, appliedRoles: selectedRoles });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Apply to {team.teamName}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-300 mb-2 font-medium">Select Roles You're Applying For</label>
            <div className="flex flex-wrap gap-2">
              {team.openRoles && team.openRoles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedRoles.includes(role)
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 mb-2 font-medium">Message to Team Captain</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the team why you'd be a great fit..."
              className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-orange-500 resize-none"
              rows="4"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 rounded-lg font-medium transition-all"
            >
              Submit Application
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrganizationCard = ({ org, onApply, hasApplied }) => {
  const getBudgetColor = () => {
    if (org.totalEarnings > 50000) return 'text-green-400';
    if (org.totalEarnings > 10000) return 'text-blue-400';
    return 'text-yellow-400';
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/10 group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <img src={org.logo} alt={org.teamName} className="w-16 h-16 rounded-xl object-cover" />
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{org.teamName}</h3>
              <p className="text-gray-300 text-sm">{org.teamTag} • {org.primaryGame} • {org.region}</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-semibold border border-green-400/30 bg-green-400/10 text-green-400">
            Recruiting
          </div>
        </div>

        {org.bio && (
          <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{org.bio}</p>
        )}

        <div className="mb-4">
          <p className="text-zinc-400 text-sm mb-2">Roles Needed:</p>
          <div className="flex flex-wrap gap-2">
            {org.openRoles && org.openRoles.map(role => (
              <span key={role} className="px-3 py-1 bg-orange-500/20 border border-orange-400/30 rounded-full text-orange-400 text-sm font-medium">
                {role}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
            <p className="text-zinc-400 text-xs">Aegis Rating</p>
            <p className="text-white font-semibold">{org.aegisRating}</p>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
            <p className="text-zinc-400 text-xs">Team Size</p>
            <p className="text-white font-semibold">{org.players?.length || 0}/5</p>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
            <p className="text-zinc-400 text-xs">Earnings</p>
            <p className={`font-semibold ${getBudgetColor()}`}>${org.totalEarnings?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => onApply(org)}
            disabled={hasApplied}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              hasApplied 
                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white'
            }`}
          >
            {hasApplied ? 'Applied' : 'Apply Now'}
          </button>
        </div>
      </div>
      <div className="bg-gradient-to-r from-orange-500 to-red-500 h-1 w-0 group-hover:w-full transition-all duration-500"></div>
    </div>
  );
};

const LFTPlayerCard = ({ player }) => {
  const getRankColor = () => {
    switch (player.primaryGame) {
      case 'VALO': return 'text-red-400';
      case 'CS2': return 'text-blue-400';
      case 'BGMI': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10 group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={player.profilePicture || `https://api.dicebear.com/7.x/avatars/svg?seed=${player.username}`} 
                alt={player.inGameName} 
                className="w-16 h-16 rounded-xl object-cover" 
              />
              {player.verified && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 p-1 rounded-full">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{player.inGameName || player.username}</h3>
              <p className="text-gray-300 text-sm">{player.realName || `@${player.username}`}</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-semibold border border-green-400/30 bg-green-400/10 text-green-400">
            Available
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-600/20 to-blue-500/20 border border-cyan-400/30 rounded-lg p-3 mb-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-semibold">Aegis Rating</span>
          </div>
          <div className="text-2xl font-bold text-white">{player.aegisRating}</div>
        </div>

        <div className="mb-4">
          <p className="text-zinc-400 text-sm mb-2">Roles:</p>
          <div className="flex flex-wrap gap-2">
            {player.inGameRole && player.inGameRole.map(role => (
              <span key={role} className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-cyan-400 text-sm font-medium">
                {role}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-center">
            <p className="text-zinc-400 text-xs">Win Rate</p>
            <p className="text-green-400 font-semibold">{player.statistics?.winRate || 0}%</p>
          </div>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-center">
            <p className="text-zinc-400 text-xs">Game</p>
            <p className={`font-semibold ${getRankColor()}`}>{player.primaryGame}</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 w-0 group-hover:w-full transition-all duration-500"></div>
    </div>
  );
};

const AegisOpportunities = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('organizations');
  const [orgSearchTerm, setOrgSearchTerm] = useState('');
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  const [orgFilters, setOrgFilters] = useState({ game: '', region: '', role: '' });
  const [playerFilters, setPlayerFilters] = useState({ game: '', region: '', role: '' });
  
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [myApplications, setMyApplications] = useState([]);

  useEffect(() => {
    fetchRecruitingTeams();
    if (user) {
      fetchMyApplications();
    }
  }, [orgFilters]);

  useEffect(() => {
    fetchLFTPlayers();
  }, [playerFilters]);

  const fetchRecruitingTeams = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (orgFilters.game) params.append('game', orgFilters.game);
      if (orgFilters.region) params.append('region', orgFilters.region);
      if (orgFilters.role) params.append('role', orgFilters.role);

      const response = await fetch(`http://localhost:5000/api/team-applications/recruiting-teams?${params}`, {
        credentials: 'include',
      });
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchLFTPlayers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (playerFilters.game) params.append('game', playerFilters.game);
      if (playerFilters.region) params.append('region', playerFilters.region);
      if (playerFilters.role) params.append('role', playerFilters.role);

      const response = await fetch(`http://localhost:5000/api/team-applications/looking-for-team?${params}`, {
        credentials: 'include',
      });
      const data = await response.json();
      setPlayers(data.players || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/team-applications/my-applications', {
        credentials: 'include',
      });
      const data = await response.json();
      setMyApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApply = (team) => {
    if (!user) {
      toast.error('Please login to apply');
      return;
    }
    setSelectedTeam(team);
  };

  const handleSubmitApplication = async (applicationData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/team-applications/apply/${selectedTeam._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        toast.success('Application submitted successfully!');
        setSelectedTeam(null);
        fetchMyApplications();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    }
  };

  const handleOrgFilterChange = (filterName, value) => {
    setOrgFilters(prev => ({ ...prev, [filterName]: prev[filterName] === value ? '' : value }));
  };

  const handlePlayerFilterChange = (filterName, value) => {
    setPlayerFilters(prev => ({ ...prev, [filterName]: prev[filterName] === value ? '' : value }));
  };

  const filteredTeams = useMemo(() => {
    return teams.filter(team => 
      team.teamName.toLowerCase().includes(orgSearchTerm.toLowerCase()) ||
      (team.teamTag && team.teamTag.toLowerCase().includes(orgSearchTerm.toLowerCase()))
    );
  }, [teams, orgSearchTerm]);

  const filteredPlayers = useMemo(() => {
    return players.filter(player => 
      player.username.toLowerCase().includes(playerSearchTerm.toLowerCase()) ||
      (player.inGameName && player.inGameName.toLowerCase().includes(playerSearchTerm.toLowerCase())) ||
      (player.realName && player.realName.toLowerCase().includes(playerSearchTerm.toLowerCase()))
    );
  }, [players, playerSearchTerm]);

  const hasApplied = (teamId) => {
    return myApplications.some(app => 
      app.team._id === teamId && ['pending', 'in_tryout'].includes(app.status)
    );
  };

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-4">
            Opportunities
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
            Connect talent with opportunity. Browse recruiting teams and discover available players.
          </p>
        </div>

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
              Teams Recruiting
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

        {activeTab === 'organizations' ? (
          <div>
            <div className="mb-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search teams..."
                    value={orgSearchTerm}
                    onChange={(e) => setOrgSearchTerm(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <FilterDropdown options={['VALO', 'CS2', 'BGMI']} selected={orgFilters.game} onSelect={(v) => handleOrgFilterChange('game', v)} placeholder="All Games" icon={Gamepad2} />
                <FilterDropdown options={['India', 'Asia', 'Europe', 'North America', 'Global']} selected={orgFilters.region} onSelect={(v) => handleOrgFilterChange('region', v)} placeholder="All Regions" icon={MapPin} />
                <FilterDropdown options={['IGL', 'assaulter', 'support', 'sniper', 'fragger']} selected={orgFilters.role} onSelect={(v) => handleOrgFilterChange('role', v)} placeholder="All Roles" icon={Target} />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {filteredTeams.map(team => (
                  <OrganizationCard 
                    key={team._id} 
                    org={team} 
                    onApply={handleApply}
                    hasApplied={hasApplied(team._id)}
                  />
                ))}
              </div>
            )}

            {!loading && filteredTeams.length === 0 && (
              <div className="text-center py-12 text-zinc-400">
                <p className="text-lg">No teams recruiting match your filters.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
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
                <FilterDropdown options={['VALO', 'CS2', 'BGMI']} selected={playerFilters.game} onSelect={(v) => handlePlayerFilterChange('game', v)} placeholder="All Games" icon={Gamepad2} />
                <FilterDropdown options={['India', 'Asia', 'Europe', 'North America']} selected={playerFilters.region} onSelect={(v) => handlePlayerFilterChange('region', v)} placeholder="All Regions" icon={MapPin} />
                <FilterDropdown options={['IGL', 'assaulter', 'support', 'sniper', 'fragger']} selected={playerFilters.role} onSelect={(v) => handlePlayerFilterChange('role', v)} placeholder="All Roles" icon={User} />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {filteredPlayers.map(player => (
                  <LFTPlayerCard key={player._id} player={player} />
                ))}
              </div>
            )}

            {!loading && filteredPlayers.length === 0 && (
              <div className="text-center py-12 text-zinc-400">
                <p className="text-lg">No players match your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedTeam && (
        <ApplicationModal
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
          onSubmit={handleSubmitApplication}
        />
      )}
    </div>
  );
};

export default AegisOpportunities;