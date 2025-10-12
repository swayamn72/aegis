import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import {
  User, MapPin, Trophy, Target, Sword, Medal, Gamepad2, Shield, Hash, Activity, Youtube, ExternalLink, Check
} from "lucide-react";

const ShareableStat = ({ icon: Icon, label, value }) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    className="flex flex-col items-center justify-center w-28 h-28 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-lg shadow-black/30"
  >
    <Icon className="text-cyan-400 mb-1 animate-pulse" size={28} />
    <span className="text-xs text-white/70">{label}</span>
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-lg font-bold text-white"
    >
      {value}
    </motion.span>
  </motion.div>
);

const SocialLinkDisplay = ({ platform, link }) => {
  if (!link) return null;
  const icons = {
    youtube: <Youtube size={22} className="text-red-400 animate-pulse" />,
    twitch: <Gamepad2 size={22} className="text-purple-400 animate-pulse" />,
    discord: <Shield size={22} className="text-cyan-400 animate-pulse" />,
  };
  return (
    <motion.a
      whileHover={{ scale: 1.1 }}
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-white/70 hover:text-white font-mono"
    >
      {icons[platform] || <ExternalLink size={22} />}
      <span>{link.replace(/^https?:\/\//, "")}</span>
    </motion.a>
  );
};

const ShareableProfileCard = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/players/username/${username}`);
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        setUserData(data.player);
        if (data.player.team) {
          const teamId =
            typeof data.player.team === "object"
              ? data.player.team._id
              : data.player.team;
          const teamRes = await fetch(`/api/teams/${teamId}`);
          if (teamRes.ok) {
            const teamData = await teamRes.json();
            setTeamData(teamData.team);
          }
        }
      } catch (err) {
        console.error(err);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white/70 bg-black/90">
        Loading...
      </div>
    );
  if (!userData)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 bg-black/90">
        User not found 😢
      </div>
    );

  const stats = userData.statistics || {};
  const { tournamentsPlayed = 0, matchesPlayed = 0, matchesWon = 0, totalKills = 0, winRate = 0 } = stats;

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black/95 overflow-hidden">
      {/* Neon particle background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fpsLimit: 60,
          particles: {
            number: { value: 50, density: { enable: true, area: 800 } },
            color: { value: ["#00ffff", "#ff00ff", "#ff0077"] },
            shape: { type: "circle" },
            opacity: { value: 0.3, random: true },
            size: { value: 3, random: true },
            links: { enable: true, distance: 120, color: "#00ffff", opacity: 0.2, width: 1 },
            move: { enable: true, speed: 1.5 },
          },
          detectRetina: true,
        }}
      />

      {/* Glass Card */}
      <Tilt
        glareEnable={true}
        glareMaxOpacity={0.15}
        glareColor="#00ffff"
        glarePosition="all"
        scale={1.03}
        transitionSpeed={2000}
        className="relative max-w-4xl w-full p-10 rounded-3xl shadow-2xl border border-white/20 bg-white/5 backdrop-blur-xl"
      >
        {/* Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center mb-6"
        >
          <motion.img
            whileHover={{ scale: 1.15, rotate: 10 }}
            src={userData.profilePicture || "https://i.ibb.co/2t7M5QX/default-avatar.png"}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-white/30 mb-3 shadow-lg shadow-cyan-500/50"
          />
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center gap-2">
            {userData.realName || "Unnamed Player"}
            {userData.verified && <Check className="text-white animate-pulse" />}
          </h1>
          <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
            <User size={14} /> @{userData.username}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6 justify-items-center">
          <ShareableStat icon={Trophy} label="Tournaments" value={tournamentsPlayed} />
          <ShareableStat icon={Activity} label="Matches" value={matchesPlayed} />
          <ShareableStat icon={Sword} label="Wins" value={matchesWon} />
          <ShareableStat icon={Target} label="Kills" value={totalKills} />
          <ShareableStat icon={Medal} label="Win %" value={`${winRate}%`} />
        </div>
        <div className="flex flex-col items-center mt-4 mb-6">
  {teamData ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-64 shadow-lg shadow-cyan-500/30"
    >
      <span className="text-white font-bold text-lg flex items-center gap-2">
        <Shield className="text-blue-400 animate-pulse" size={18} />
        Team: {teamData.teamName}
      </span>
      <p className="text-white/70 text-sm mt-1">
        Members: {teamData.members?.length || 0}
      </p>
      <p className="text-white/50 text-xs mt-1 italic">
        Role: {userData.teamRole || "Member"}
      </p>
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 w-48 flex justify-center items-center shadow-lg shadow-pink-500/30"
    >
      <span className="text-pink-400 font-bold animate-pulse">
        Looking for Team (LFT)
      </span>
    </motion.div>
  )}
</div>

        {/* Extra Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-3 mb-6 text-white/70">
          <div className="flex items-center gap-2">
            <Hash size={16} className="text-cyan-400 animate-pulse" />
            <span>Aegis Rating: <span className="font-bold text-white">{userData.aegisRating || 1200}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Gamepad2 size={16} className="text-green-400 animate-pulse" />
            <span>Primary Game: <span className="font-bold text-white">{userData.primaryGame || "N/A"}</span></span>
          </div>
          {userData.inGameRole?.length > 0 && (
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-purple-400 animate-pulse" />
              <span>Roles: <span className="font-bold text-white">{userData.inGameRole.join(", ")}</span></span>
            </div>
          )}
        </motion.div>

        {/* Socials */}
        <div className="border-t border-white/20 pt-4">
          <h2 className="text-lg font-bold text-cyan-400 mb-3">Socials</h2>
          <div className="flex flex-col gap-2">
            <SocialLinkDisplay platform="discord" link={userData.discordTag} />
            <SocialLinkDisplay platform="twitch" link={userData.twitch} />
            <SocialLinkDisplay platform="youtube" link={userData.youtube} />
          </div>
        </div>
      </Tilt>
    </div>
  );
};

export default ShareableProfileCard;
