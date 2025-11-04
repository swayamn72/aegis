import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, MapPin, Gamepad2, Trophy, Award, Eye, Check, Target, Briefcase, UserPlus, User, Send, MessageCircle, Users, X } from 'lucide-react';
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

const LFTPostForm = ({ onSubmit, onClose }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        description: '',
        roles: [],
        requirements: ''
    });

    const roles = ['IGL', 'assaulter', 'support', 'sniper', 'fragger'];

    const handleRoleToggle = (role) => {
        setFormData(prev => ({
            ...prev,
            roles: prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.description || formData.roles.length === 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Include game and region from user profile
        const postData = {
            ...formData,
            game: user?.primaryGame || '',
            region: user?.country || 'Global'
        };

        onSubmit(postData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Post Looking for Team</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-zinc-300 mb-2 font-medium">Roles *</label>
                        <div className="flex flex-wrap gap-2">
                            {roles.map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => handleRoleToggle(role)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${formData.roles.includes(role)
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
                        <label className="block text-zinc-300 mb-2 font-medium">Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe yourself and what you're looking for in a team..."
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-orange-500 resize-none"
                            rows="4"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-300 mb-2 font-medium">Additional Requirements</label>
                        <textarea
                            value={formData.requirements}
                            onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                            placeholder="Any specific requirements from the team (e.g., rank, communication, etc.)"
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-orange-500 resize-none"
                            rows="3"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 rounded-lg font-medium transition-all"
                        >
                            Post LFT
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

const LFTPostCard = ({ post, onApproach }) => {
    const getRankColor = () => {
        switch (post.game) {
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
                                src={post.player.profilePicture || `https://api.dicebear.com/7.x/avatars/svg?seed=${post.player.username}`}
                                alt={post.player.inGameName}
                                className="w-16 h-16 rounded-xl object-cover"
                            />
                            {post.player.verified && (
                                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 p-1 rounded-full">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{post.player.inGameName || post.player.username}</h3>
                            <p className="text-gray-300 text-sm">{post.player.realName || `@${post.player.username}`}</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-semibold border border-green-400/30 bg-green-400/10 text-green-400">
                        Looking for Team
                    </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-600/20 to-blue-500/20 border border-cyan-400/30 rounded-lg p-3 mb-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400 text-sm font-semibold">Aegis Rating</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{post.player.aegisRating}</div>
                </div>

                <div className="mb-4">
                    <p className="text-zinc-400 text-sm mb-2">Looking for roles:</p>
                    <div className="flex flex-wrap gap-2">
                        {post.roles && post.roles.map(role => (
                            <span key={role} className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-cyan-400 text-sm font-medium">
                                {role}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-center">
                        <p className="text-zinc-400 text-xs">Game</p>
                        <p className={`font-semibold ${getRankColor()}`}>{post.game}</p>
                    </div>
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-center">
                        <p className="text-zinc-400 text-xs">Region</p>
                        <p className="text-white font-semibold">{post.region || 'Global'}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-zinc-400 text-sm mb-2">Description:</p>
                    <p className="text-zinc-300 text-sm line-clamp-3">{post.description}</p>
                </div>

                {post.requirements && (
                    <div className="mb-4">
                        <p className="text-zinc-400 text-sm mb-2">Requirements:</p>
                        <p className="text-zinc-300 text-sm line-clamp-2">{post.requirements}</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={() => onApproach(post)}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Approach Player
                    </button>
                </div>
            </div>
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 w-0 group-hover:w-full transition-all duration-500"></div>
        </div>
    );
};

const OrganizationCard = ({ org, onApproach }) => {
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
                        onClick={() => onApproach(org)}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Start Tryout
                    </button>
                </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-1 w-0 group-hover:w-full transition-all duration-500"></div>
        </div>
    );
};

const RecruitmentPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('find-players');
    const [orgSearchTerm, setOrgSearchTerm] = useState('');
    const [playerSearchTerm, setPlayerSearchTerm] = useState('');
    const [orgFilters, setOrgFilters] = useState({ game: '', region: '', role: '' });
    const [playerFilters, setPlayerFilters] = useState({ game: '', region: '', role: '' });

    const [teams, setTeams] = useState([]);
    const [lftPosts, setLftPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showLFTForm, setShowLFTForm] = useState(false);
    const [showApproachDialog, setShowApproachDialog] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        if (activeTab === 'find-players') {
            fetchLFTPosts();
        } else {
            fetchRecruitingTeams();
        }
    }, [activeTab, orgFilters, playerFilters]);

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

    const fetchLFTPosts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (playerFilters.game) params.append('game', playerFilters.game);
            if (playerFilters.region) params.append('region', playerFilters.region);
            if (playerFilters.role) params.append('role', playerFilters.role);

            const response = await fetch(`http://localhost:5000/api/recruitment/lft-posts?${params}`, {
                credentials: 'include',
            });
            const data = await response.json();
            setLftPosts(data.posts || []);
        } catch (error) {
            console.error('Error fetching LFT posts:', error);
            toast.error('Failed to load LFT posts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLFTPost = async (postData) => {
        try {
            const response = await fetch('http://localhost:5000/api/recruitment/lft-posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(postData),
            });

            if (response.ok) {
                toast.success('LFT post created successfully!');
                setShowLFTForm(false);
                fetchLFTPosts();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to create LFT post');
            }
        } catch (error) {
            console.error('Error creating LFT post:', error);
            toast.error('Failed to create LFT post');
        }
    };

    const handleApproachPlayer = (post) => {
        if (!user) {
            toast.error('Please login to approach players');
            return;
        }

        if (!user.team) {
            toast.error('You must be in a team to approach players');
            return;
        }

        setSelectedPost(post);
        setShowApproachDialog(true);
    };

    const confirmApproachPlayer = async () => {
        if (!selectedPost) return;

        try {
            const response = await fetch(`http://localhost:5000/api/recruitment/approach-player/${selectedPost.player._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    message: `Hi! We're interested in discussing recruitment opportunities with you.`
                })
            });

            if (response.ok) {
                toast.success('Approach request sent! Player will be notified.');
                setShowApproachDialog(false);
                setSelectedPost(null);
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to send approach');
            }
        } catch (error) {
            console.error('Error sending approach:', error);
            toast.error('Failed to send approach');
        }
    };

    const handleApproachTeam = async (team) => {
        // Navigate to chat with team captain or start tryout
        // This would need backend support to initiate tryout chat
        toast.info('Tryout initiation feature coming soon');
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

    const filteredLFTPosts = useMemo(() => {
        return lftPosts.filter(post =>
            post.player.username.toLowerCase().includes(playerSearchTerm.toLowerCase()) ||
            (post.player.inGameName && post.player.inGameName.toLowerCase().includes(playerSearchTerm.toLowerCase())) ||
            (post.player.realName && post.player.realName.toLowerCase().includes(playerSearchTerm.toLowerCase()))
        );
    }, [lftPosts, playerSearchTerm]);

    return (
        <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-20">
            <div className="container mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-4">
                        Recruitment Hub
                    </h1>
                    <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
                        Connect players with teams. Find your perfect match in the esports community.
                    </p>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-2 flex">
                        <button
                            onClick={() => setActiveTab('find-players')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'find-players'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            <UserPlus className="w-5 h-5" />
                            Find Players
                        </button>
                        <button
                            onClick={() => setActiveTab('post-lft')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'post-lft'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            <Briefcase className="w-5 h-5" />
                            Post LFT
                        </button>
                        <button
                            onClick={() => setActiveTab('find-teams')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'find-teams'
                                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            <Users className="w-5 h-5" />
                            Find Teams
                        </button>
                    </div>
                </div>

                {activeTab === 'find-players' && (
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
                                {filteredLFTPosts.map(post => (
                                    <LFTPostCard
                                        key={post._id}
                                        post={post}
                                        onApproach={handleApproachPlayer}
                                    />
                                ))}
                            </div>
                        )}

                        {!loading && filteredLFTPosts.length === 0 && (
                            <div className="text-center py-12 text-zinc-400">
                                <p className="text-lg">No players match your filters.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'post-lft' && (
                    <div className="text-center py-12">
                        <div className="max-w-2xl mx-auto">
                            <Briefcase className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h2 className="text-3xl font-bold text-white mb-4">Looking for a Team?</h2>
                            <p className="text-zinc-400 mb-8">
                                Create a post to let teams know you're available. Be specific about your requirements and what you bring to the table.
                            </p>
                            <button
                                onClick={() => setShowLFTForm(true)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-lg font-medium transition-all"
                            >
                                Create LFT Post
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'find-teams' && (
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
                                        onApproach={handleApproachTeam}
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
                )}
            </div>

            {showLFTForm && (
                <LFTPostForm
                    onSubmit={handleCreateLFTPost}
                    onClose={() => setShowLFTForm(false)}
                />
            )}

            {showApproachDialog && selectedPost && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <MessageCircle className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">Approach Player</h2>
                            <p className="text-zinc-300">
                                Are you sure you want to approach <span className="text-cyan-400 font-semibold">{selectedPost.player.inGameName || selectedPost.player.username}</span>?
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmApproachPlayer}
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all"
                            >
                                Yes, Approach
                            </button>
                            <button
                                onClick={() => {
                                    setShowApproachDialog(false);
                                    setSelectedPost(null);
                                }}
                                className="px-6 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruitmentPage;
