import React, { useState } from "react";
import { Hash, Users, Trophy, MessageSquare, TrendingUp, FileText, Plus, Settings, ChevronDown, ChevronRight, Activity } from "lucide-react";

export default function CommunitySidebar({ community, postsCount, onChannelChange, activeChannel = "General" }) {
  const [showAllChannels, setShowAllChannels] = useState(true);

  const channels = [
    { name: "General", icon: MessageSquare, count: postsCount || 0, active: activeChannel === "General" },
    { name: "News", icon: TrendingUp, count: 0, active: activeChannel === "News" },
    { name: "Memes", icon: Hash, count: 0, active: activeChannel === "Memes" },
    { name: "Tournaments", icon: Trophy, count: 0, active: activeChannel === "Tournaments" },
    { name: "All", icon: MessageSquare, count: postsCount || 0, active: activeChannel === "All" },
  ];

  const formatCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleChannelClick = (channelName) => {
    if (onChannelChange) {
      onChannelChange(channelName);
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-zinc-950 border-r border-zinc-800/50">
      {/* Community Header */}
      <div className="p-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-3 mb-4">
          {community?.image ? (
            <img
              src={community.image}
              alt={community.name}
              className="w-10 h-10 rounded-full object-cover border border-zinc-700"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {community?.name?.[0]?.toUpperCase() || 'C'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-sm truncate">{community?.name}</h1>
            <p className="text-zinc-400 text-xs">Community</p>
          </div>
        </div>
      </div>

      {/* Channels Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowAllChannels(!showAllChannels)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              {showAllChannels ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span className="text-sm font-semibold uppercase tracking-wider">Channels</span>
            </button>
            <button className="p-1 text-zinc-400 hover:text-zinc-300 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showAllChannels && (
            <div className="space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.name}
                  onClick={() => handleChannelClick(channel.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                    channel.active
                      ? "bg-[#FF4500]/10 text-[#FF4500] border-l-2 border-[#FF4500]"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300"
                  }`}
                >
                  <channel.icon className={`w-4 h-4 ${channel.active ? 'text-[#FF4500]' : ''}`} />
                  <span className="text-sm font-medium flex-1 text-left">{channel.name}</span>
                  {channel.count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      channel.active
                        ? 'bg-[#FF4500]/20 text-[#FF4500]'
                        : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700'
                    }`}>
                      {formatCount(channel.count)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Community Stats */}
        <div className="p-4 border-t border-zinc-800/50">
          <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Community Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">Members</span>
              </div>
              <span className="text-sm font-semibold text-white">{formatCount(community?.membersCount || 0)}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Posts</span>
              </div>
              <span className="text-sm font-semibold text-white">{formatCount(postsCount || 0)}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Active</span>
              </div>
              <span className="text-sm font-semibold text-green-400">Today</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="text-sm">Rank</span>
              </div>
              <span className="text-sm font-semibold text-yellow-400">#1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-zinc-800/50">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all text-sm">
            <Settings className="w-4 h-4" />
            Community Settings
          </button>
        </div>
      </div>
    </aside>
  );
}
