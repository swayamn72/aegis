import React, { useState, useEffect } from 'react';
import { Search, Users, Loader } from 'lucide-react';

const TeamSelector = ({ onSelect, selectedPhase, tournament }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredTeams, setFilteredTeams] = useState([]);

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            setFilteredTeams(teams.filter(team =>
                team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                team.teamTag?.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        } else {
            setFilteredTeams(teams);
        }
    }, [searchTerm, teams]);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/teams/available', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    tournamentId: tournament?._id,
                    phase: selectedPhase
                })
            });
            if (res.ok) {
                const data = await res.json();
                setTeams(data.teams || []);
                setFilteredTeams(data.teams || []);
            }
        } catch (err) {
            console.error('Error fetching teams:', err);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when phase changes
    useEffect(() => {
        if (selectedPhase) {
            fetchTeams();
        }
    }, [selectedPhase]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-400"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {filteredTeams.length > 0 ? (
                    filteredTeams.map(team => (
                        <div
                            key={team._id}
                            className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-orange-500/50 transition-colors cursor-pointer"
                            onClick={() => onSelect(team)}
                        >
                            <div className="flex items-center gap-3">
                                {team.logo && (
                                    <img
                                        src={team.logo}
                                        alt={team.teamName}
                                        className="w-10 h-10 rounded-lg object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                )}
                                <div>
                                    <h4 className="text-white font-medium">{team.teamName}</h4>
                                    {team.teamTag && (
                                        <p className="text-zinc-400 text-sm">{team.teamTag}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-8">
                        <Users className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                        <p className="text-zinc-400">No teams found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamSelector;