import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, Users, Calendar, MapPin, AlertCircle, CheckCircle,
  Clock, Target, Shield, Gamepad2, ChevronRight, X, Info,
  Award, TrendingUp, Filter, Search
} from 'lucide-react';

const TournamentRegistration = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [filters, setFilters] = useState({
    game: '',
    region: '',
    search: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's team
      const teamResponse = await fetch('/api/teams/user/my-teams', {
        credentials: 'include'
      });

      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        const captainTeam = teamData.teams.find(t => 
          t.captain._id === teamData.teams[0]?.captain._id
        );
        setMyTeam(captainTeam);
      }

      // Fetch open tournaments
      const tournamentsResponse = await fetch('/api/team-tournaments/open-tournaments', {
        credentials: 'include'
      });

      if (tournamentsResponse.ok) {
        const data = await tournamentsResponse.json();
        setTournaments(data.tournaments || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load tournament data');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!selectedTournament || !myTeam) return;

    try {
      setRegistering(true);
      const response = await fetch(`/api/team-tournaments/register/${selectedTournament._id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Award tournament join bonus
        try {
          await fetch('/api/reward/tournament-join', {
            method: 'POST',
            credentials: 'include'
          });
        } catch (rewardError) {
          console.error('Failed to award tournament join bonus:', rewardError);
        }

        alert('Successfully registered for tournament!');
        setShowConfirmModal(false);
        fetchData(); // Refresh data
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Failed to register for tournament');
    } finally {
      setRegistering(false);
    }
  };

  const canRegister = () => {
    if (!myTeam) return { can: false, reason: 'You must be in a team to register' };
    if (myTeam.players.length < 4) return { can: false, reason: 'Team must have at least 4 players' };
    return { can: true, reason: '' };
  };

  const filteredTournaments = tournaments.filter(tournament => {
    if (filters.game && tournament.gameTitle !== filters.game) return false;
    if (filters.region && tournament.region !== filters.region) return false;
    if (filters.search && !tournament.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrizePool = (prizePool) => {
    if (!prizePool || !prizePool.total) return 'TBD';
    const amount = prizePool.total;
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  const registrationStatus = canRegister();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 text-white">
      <div className="container mx-auto px-6 py-8 mt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tournament Registration</h1>
          <p className="text-zinc-400">Register your team for upcoming tournaments</p>
        </div>

        {/* Team Status Card */}
        <div className={`mb-8 p-6 rounded-xl border ${
          registrationStatus.can 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-start gap-4">
            {registrationStatus.can ? (
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">
                {registrationStatus.can ? 'Team Eligible for Registration' : 'Team Not Eligible'}
              </h3>
              {myTeam ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-300">Your Team:</span>
                    <span className="text-white font-medium">{myTeam.teamName}</span>
                    <span className="text-zinc-400">({myTeam.teamTag})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-400" />
                    <span className={myTeam.players.length >= 4 ? 'text-green-400' : 'text-red-400'}>
                      {myTeam.players.length} / 4 players minimum
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-300">Primary Game: {myTeam.primaryGame}</span>
                  </div>
                  {!registrationStatus.can && (
                    <p className="text-red-400 text-sm mt-2">{registrationStatus.reason}</p>
                  )}
                </div>
              ) : (
                <p className="text-red-400">You are not a team captain. Only team captains can register for tournaments.</p>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <select
            value={filters.game}
            onChange={(e) => setFilters({ ...filters, game: e.target.value })}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Games</option>
            <option value="BGMI">BGMI</option>
            <option value="VALO">VALORANT</option>
            <option value="CS2">CS2</option>
          </select>
          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Regions</option>
            <option value="India">India</option>
            <option value="Asia">Asia</option>
            <option value="South Asia">South Asia</option>
            <option value="Global">Global</option>
          </select>
        </div>

        {/* Tournaments Grid */}
        {filteredTournaments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament._id}
                tournament={tournament}
                onRegister={() => {
                  setSelectedTournament(tournament);
                  setShowConfirmModal(true);
                }}
                canRegister={registrationStatus.can}
                myTeam={myTeam}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Tournaments Available</h3>
            <p className="text-zinc-400">Check back later for new tournament opportunities</p>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && selectedTournament && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full">
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Confirm Registration</h2>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-zinc-400" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-3">{selectedTournament.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Game:</span>
                      <span className="text-white">{selectedTournament.gameTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Region:</span>
                      <span className="text-white">{selectedTournament.region}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Starts:</span>
                      <span className="text-white">{formatDate(selectedTournament.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Prize Pool:</span>
                      <span className="text-green-400 font-bold">{formatPrizePool(selectedTournament.prizePool)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Available Slots:</span>
                      <span className="text-orange-400">{selectedTournament.slots.available} remaining</span>
                    </div>
                  </div>
                </div>

                {myTeam && (
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">Registering Team:</h4>
                    <div className="flex items-center gap-3">
                      <img 
                        src={myTeam.logo} 
                        alt={myTeam.teamName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="text-white font-medium">{myTeam.teamName}</div>
                        <div className="text-zinc-400 text-sm">{myTeam.players.length} players</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-300 text-sm">
                    By registering, you confirm that your team meets all tournament requirements and agrees to follow the tournament rules.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-zinc-800 flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium px-6 py-3 rounded-lg transition-all disabled:opacity-50"
                >
                  {registering ? 'Registering...' : 'Confirm Registration'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TournamentCard = ({ tournament, onRegister, canRegister, myTeam }) => {
  const navigate = useNavigate();
  const isGameCompatible = myTeam?.primaryGame === tournament.gameTitle;
  const isAlreadyRegistered = tournament.isTeamRegistered;
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrizePool = (prizePool) => {
    if (!prizePool || !prizePool.total) return 'TBD';
    const amount = prizePool.total;
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount}`;
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all">
      {/* Tournament Banner */}
      <div className="relative h-40">
        <img
          src={tournament.media?.banner || tournament.media?.coverImage || 'https://placehold.co/600x200/1a1a1a/ffffff?text=Tournament'}
          alt={tournament.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://placehold.co/600x200/1a1a1a/ffffff?text=Tournament';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
        <div className="absolute top-3 right-3">
          <span className="bg-orange-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
            {tournament.tier ? `Tier ${tournament.tier}` : 'Open'}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Tournament Info */}
        <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
        <p className="text-zinc-400 text-sm mb-4">{tournament.shortName}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-orange-400" />
            <span className="text-zinc-300 text-sm">{tournament.gameTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            <span className="text-zinc-300 text-sm">{tournament.region}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-400" />
            <span className="text-zinc-300 text-sm">{formatDate(tournament.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-400" />
            <span className="text-green-400 text-sm font-bold">{formatPrizePool(tournament.prizePool)}</span>
          </div>
        </div>

        {/* Slots Info */}
        <div className="mb-4 bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-zinc-400 text-sm">Available Slots</span>
            <span className="text-white font-medium">
              {tournament.slots.available} / {tournament.slots.total}
            </span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div 
              className="bg-orange-400 h-2 rounded-full transition-all"
              style={{ width: `${((tournament.slots.total - tournament.slots.available) / tournament.slots.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Registration Deadline */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-zinc-400">Registration ends:</span>
          <span className="text-yellow-400">{formatDate(tournament.registrationEndDate)}</span>
        </div>

        {/* Status Messages */}
        {isAlreadyRegistered && (
          <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Already Registered</span>
          </div>
        )}

        {!isGameCompatible && myTeam && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">
              Game mismatch: Tournament requires {tournament.gameTitle}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/tournaments/${tournament._id}`)}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </button>
          
          {!isAlreadyRegistered && (
            <button
              onClick={onRegister}
              disabled={!canRegister || !isGameCompatible || tournament.slots.available <= 0}
              className={`flex-1 font-medium px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                canRegister && isGameCompatible && tournament.slots.available > 0
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white'
                  : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
              }`}
            >
              <Target className="w-4 h-4" />
              Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentRegistration;