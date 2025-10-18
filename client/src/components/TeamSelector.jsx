import React, { useState, useEffect } from 'react';
import { Search, Users, Loader, Plus } from 'lucide-react';

const TeamSelector = ({ onSelect, selectedPhase, tournament }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedPhase) {
      fetchTeams();
    }
  }, [selectedPhase, tournament?._id]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/teams/available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tournamentId: tournament?._id,
          phase: selectedPhase
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.teamTag?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {filteredTeams.length > 0 ? (
          filteredTeams.map(team => (
            <button
              key={team._id}
              onClick={() => onSelect(team)}
              className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-orange-500 hover:bg-gray-700 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                {team.logo ? (
                  <img
                    src={team.logo}
                    alt={team.teamName}
                    className="w-12 h-12 rounded-lg object-cover ring-2 ring-gray-600 group-hover:ring-orange-500 transition-all"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center ring-2 ring-gray-600 group-hover:ring-orange-500 transition-all">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate group-hover:text-orange-400 transition-colors">
                    {team.teamName}
                  </h4>
                  {team.teamTag && (
                    <p className="text-gray-400 text-sm truncate">{team.teamTag}</p>
                  )}
                </div>
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" />
              </div>
            </button>
          ))
        ) : (
          <div className="col-span-2 text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">
              {searchTerm ? 'No teams found' : 'No teams available'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-orange-400 hover:text-orange-300 text-sm mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSelector;