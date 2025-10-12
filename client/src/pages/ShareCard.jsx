import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Trophy,
  Target,
  Sword,
  Medal,
  Gamepad2,
  Shield,
  Hash,
  Activity,
  Youtube,
  ExternalLink,
  Check,
} from 'lucide-react';

// --- Helper Components ---
const ShareableStat = ({ icon: Icon, label, value }) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    className="flex flex-col items-center bg-white/5 backdrop-blur-xl rounded-xl p-3 w-24 h-20 justify-center shadow-lg border border-white/10"
  >
    <Icon className="text-cyan-400 mb-1" size={20} />
    <span className="text-xs text-zinc-400">{label}</span>
    <span className="text-sm font-semibold text-white">{value}</span>
  </motion.div>
);

const SocialLinkDisplay = ({ platform, link }) => {
  if (!link) return null;
  const icons = {
    youtube: <Youtube size={18} className="text-red-500" />,
    twitch: <Gamepad2 size={18} className="text-purple-400" />,
    discord: <Shield size={18} className="text-indigo-400" />,
  };
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
    >
      {icons[platform] || <ExternalLink size={18} />}
      <span className="text-sm">{link.replace(/^https?:\/\//, '')}</span>
    </a>
  );
};

// --- Main Component ---
const ShareableProfileCard = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/players/username/${username}`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        setUserData(data.player);

        if (data.player.team) {
          const teamId =
            typeof data.player.team === 'object'
              ? data.player.team._id
              : data.player.team;
          const teamRes = await fetch(`/api/teams/${teamId}`);
          if (teamRes.ok) {
            const teamData = await teamRes.json();
            setTeamData(teamData.team);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        Loading shareable profile...
      </div>
    );

  if (!userData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-red-400">
        User not found 😢
      </div>
    );

  const stats = userData.statistics || {};
  const {
    tournamentsPlayed = 0,
    matchesPlayed = 0,
    matchesWon = 0,
    totalKills = 0,
    winRate = 0,
  } = stats;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-4">
      <Tilt
        tiltMaxAngleX={15}
        tiltMaxAngleY={15}
        glareEnable={true}
        glareMaxOpacity={0.3}
        glareColor="#00FFFF"
        glarePosition="all"
        className="w-[360px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* Header */}
          <img
            src={userData.profilePicture || 'https://i.ibb.co/2t7M5QX/default-avatar.png'}
            alt="Profile"
            className="w-28 h-28 rounded-full border-2 border-cyan-400 object-cover mb-2"
          />
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {userData.realName || 'Unnamed Player'}
            {userData.verified && <Check className="text-cyan-400" size={20} />}
          </h1>
          <p className="text-zinc-400 text-sm mb-2">@{userData.username}</p>

          {/* Team / LFT */}
          {teamData ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 w-64 text-center shadow-lg shadow-cyan-500/30 mb-4"
            >
              <span className="text-white font-bold text-lg flex justify-center items-center gap-2">
                <Shield className="text-cyan-400 animate-pulse" size={18} /> Team: {teamData.teamName}
              </span>
              <p className="text-white/70 mt-1 text-sm">Members: {teamData.members?.length || 0}</p>
              <p className="text-white/50 mt-1 text-xs italic">Role: {userData.teamRole || 'Member'}</p>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 w-48 text-center shadow-lg shadow-pink-500/30 mb-4"
            >
              <span className="text-pink-400 font-bold animate-pulse">Looking for Team (LFT)</span>
            </motion.div>
          )}

          {/* Bio */}
          <p className="text-zinc-300 text-center mb-6 px-2">
            {userData.bio || 'This player has not added a bio yet.'}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 w-full mb-6 justify-items-center">
            <ShareableStat icon={Trophy} label="Tournaments" value={tournamentsPlayed} />
            <ShareableStat icon={Activity} label="Matches" value={matchesPlayed} />
            <ShareableStat icon={Sword} label="Wins" value={matchesWon} />
            <ShareableStat icon={Target} label="Kills" value={totalKills} />
            <ShareableStat icon={Medal} label="Win %" value={`${winRate}%`} />
          </div>

          {/* Extra Info */}
          <div className="w-full flex flex-col gap-2 mb-6 text-zinc-300 text-sm">
            <div className="flex justify-between">
              <span>Primary Game:</span>
              <span className="font-semibold text-white">{userData.primaryGame || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Roles:</span>
              <span className="font-semibold text-white">{userData.inGameRole?.join(', ') || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span>Aegis Rating:</span>
              <span className="font-semibold text-white">{userData.aegisRating || 1200}</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="w-full border-t border-white/20 pt-4 flex flex-col gap-2">
            <SocialLinkDisplay platform="discord" link={userData.discordTag} />
            <SocialLinkDisplay platform="twitch" link={userData.twitch} />
            <SocialLinkDisplay platform="youtube" link={userData.youtube} />
          </div>
        </motion.div>
      </Tilt>
    </div>
  );
};

export default ShareableProfileCard;
