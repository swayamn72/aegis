import React, { useState } from 'react';
import { Shuffle, Save, ArrowUp, ArrowDown } from 'lucide-react';

const Seeding = ({ tournament, onUpdate }) => {
  const [seededTeams, setSeededTeams] = useState(
    tournament.participatingTeams?.map((team, index) => ({
      ...team,
      seed: team.seed || index + 1
    })) || []
  );

  const handleSeedChange = (teamId, newSeed) => {
    const updatedTeams = seededTeams.map(team => {
      if (team._id === teamId) {
        return { ...team, seed: newSeed };
      }
      return team;
    });
    setSeededTeams(updatedTeams);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newTeams = [...seededTeams];
    [newTeams[index - 1], newTeams[index]] = [newTeams[index], newTeams[index - 1]];
    // Update seeds
    newTeams.forEach((team, i) => {
      team.seed = i + 1;
    });
    setSeededTeams(newTeams);
  };

  const handleMoveDown = (index) => {
    if (index === seededTeams.length - 1) return;
    const newTeams = [...seededTeams];
    [newTeams[index], newTeams[index + 1]] = [newTeams[index + 1], newTeams[index]];
    // Update seeds
    newTeams.forEach((team, i) => {
      team.seed = i + 1;
    });
    setSeededTeams(newTeams);
  };

  const handleRandomizeSeeding = () => {
    const shuffled = [...seededTeams].sort(() => Math.random() - 0.5);
    shuffled.forEach((team, index) => {
      team.seed = index + 1;
    });
    setSeededTeams(shuffled);
  };

  const handleSave = () => {
    const updatedTournament = {
      ...tournament,
      participatingTeams: seededTeams.map(({ seed, ...team }) => ({
        ...team,
        seed
      }))
    };
    onUpdate(updatedTournament);
  };

  const sortedTeams = [...seededTeams].sort((a, b) => a.seed - b.seed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Team Seeding</h3>
        <div className="flex gap-2">
          <button
            onClick={handleRandomizeSeeding}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Randomize
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Seeding
          </button>
        </div>
      </div>

      <div className="bg-zinc-800/50 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Seed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Region
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {sortedTeams.map((team, index) => (
                <tr key={team._id} className="hover:bg-zinc-800/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">#{team.seed}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {team.logo && (
                        <img src={team.logo} alt={team.teamName} className="w-8 h-8 rounded" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">
                          {team.teamName}
                        </div>
                        {team.tag && (
                          <div className="text-sm text-zinc-400">
                            [{team.tag}]
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {team.region}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === sortedTeams.length - 1}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedTeams.length === 0 && (
        <div className="text-center py-8">
          <Shuffle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No teams to seed. Add teams to the tournament first.</p>
        </div>
      )}
    </div>
  );
};

export default Seeding;
