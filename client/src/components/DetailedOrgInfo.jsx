import React, { useState } from 'react';
import {
  ArrowLeft, Users, Trophy, Calendar, MapPin, Globe, Shield,
  Award, Star, Crown, Target, TrendingUp, Eye, Share2, MessageCircle,
  UserPlus, ExternalLink, Check, Activity, Gamepad2, Hash,
  Briefcase, Clock, Zap, Medal, ChevronRight, Copy, Settings
} from 'lucide-react';

const DetailedOrgInfo = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Organization data
  const organizationData = {
    name: "Team Liquid",
    shortName: "TL",
    logo: "https://placehold.co/120x120/1E3A8A/FFFFFF?text=TL",
    game: "Multiple Games",
    region: "North America",
    founded: "2000",
    headquarters: "Los Angeles, California",
    website: "teamliquid.com",
    verified: true,
    status: "Actively Recruiting",
    tier: "Tier 1",
    description: "One of the most prestigious esports organizations in the world, competing across multiple titles including CS2, Valorant, League of Legends, and Dota 2. We provide world-class facilities, coaching staff, and competitive compensation packages.",
    
    // Social media
    socials: {
      twitter: "@VelocityGaming",
      instagram: "@velocitygaming",
      youtube: "VelocityGamingOfficial",
      twitch: "velocitygaming"
    },

    // Achievements
    achievements: [
      {
        title: "The International 2017",
        placement: "Champions",
        date: "2017-08-12",
        prize: "$10,862,683",
        type: "major"
      },
      {
        title: "IEM Grand Slam",
        placement: "Champions",
        date: "2019-07-28",
        prize: "$1,000,000",
        type: "major"
      },
      {
        title: "LCS Spring Championship",
        placement: "1st Place",
        date: "2024-04-14",
        prize: "$100,000",
        type: "regional"
      },
      {
        title: "VCT Americas League",
        placement: "3rd Place",
        date: "2024-06-09",
        prize: "$75,000",
        type: "regional"
      },
      {
        title: "BLAST Premier Spring Finals",
        placement: "2nd Place",
        date: "2024-06-16",
        prize: "$200,000",
        type: "tournament"
      }
    ],

    // Multiple rosters
    rosters: {
      CS2: [
        {
          id: 'tl-twistzz',
          handle: 'Twistzz',
          realName: 'Russel Van Dulken',
          role: 'Rifler',
          countryFlag: '🇨🇦',
          countryName: 'Canada',
          profilePic: 'https://placehold.co/64x64/1E40AF/FFFFFF?text=TW',
          joinDate: '2022-11-01',
          aegisRating: 2934,
          achievements: ['HLTV Top 20 2023', 'BLAST MVP']
        },
        {
          id: 'tl-yekindar',
          handle: 'YEKINDAR',
          realName: 'Mareks Gaļinskis',
          role: 'Entry Fragger',
          countryFlag: '🇱🇻',
          countryName: 'Latvia',
          profilePic: 'https://placehold.co/64x64/DC2626/FFFFFF?text=YK',
          joinDate: '2022-06-01',
          aegisRating: 2887,
          achievements: ['PGL Major Star Player', 'Fragster Award']
        },
        {
          id: 'tl-ultimate',
          handle: 'ultimate',
          realName: 'Casper Møller',
          role: 'AWPer',
          countryFlag: '🇩🇰',
          countryName: 'Denmark',
          profilePic: 'https://placehold.co/64x64/059669/FFFFFF?text=UL',
          joinDate: '2024-01-15',
          aegisRating: 2743,
          achievements: ['Rising Star 2024', 'Best AWP Rounds']
        },
        {
          id: 'tl-jks',
          handle: 'jks',
          realName: 'Justin Savage',
          role: 'Support',
          countryFlag: '🇦🇺',
          countryName: 'Australia',
          profilePic: 'https://placehold.co/64x64/7C3AED/FFFFFF?text=JK',
          joinDate: '2023-03-10',
          aegisRating: 2681,
          achievements: ['Clutch Master', 'Consistent Performer']
        },
        {
          id: 'tl-naf',
          handle: 'NAF',
          realName: 'Keith Markovic',
          role: 'IGL',
          countryFlag: '🇨🇦',
          countryName: 'Canada',
          profilePic: 'https://placehold.co/64x64/F59E0B/FFFFFF?text=NF',
          joinDate: '2021-08-20',
          aegisRating: 2756,
          achievements: ['Best IGL Americas', 'Strategic Mind']
        }
      ],
      Valorant: [
        {
          id: 'tl-scream',
          handle: 'ScreaM',
          realName: 'Adil Benrlitom',
          role: 'Duelist',
          countryFlag: '🇧🇪',
          countryName: 'Belgium',
          profilePic: 'https://placehold.co/64x64/EF4444/FFFFFF?text=SC',
          joinDate: '2021-02-01',
          aegisRating: 2876,
          achievements: ['VCT Champions MVP', 'Headshot Machine']
        },
        {
          id: 'tl-nivera',
          handle: 'Nivera',
          realName: 'Nabil Benrlitom',
          role: 'Sentinel',
          countryFlag: '🇫🇷',
          countryName: 'France',
          profilePic: 'https://placehold.co/64x64/3B82F6/FFFFFF?text=NV',
          joinDate: '2021-05-15',
          aegisRating: 2743,
          achievements: ['Clutch King VCT', 'Rising Talent']
        },
        {
          id: 'tl-soulcas',
          handle: 'soulcas',
          realName: 'Dom Sulcas',
          role: 'Initiator',
          countryFlag: '🇱🇹',
          countryName: 'Lithuania',
          profilePic: 'https://placehold.co/64x64/10B981/FFFFFF?text=SL',
          joinDate: '2021-01-20',
          aegisRating: 2698,
          achievements: ['Team Player Award', 'Utility Master']
        },
        {
          id: 'tl-jamppi',
          handle: 'Jamppi',
          realName: 'Elias Olkkonen',
          role: 'Flex',
          countryFlag: '🇫🇮',
          countryName: 'Finland',
          profilePic: 'https://placehold.co/64x64/8B5CF6/FFFFFF?text=JP',
          joinDate: '2021-01-20',
          aegisRating: 2721,
          achievements: ['Versatile Player', 'EMEA All-Star']
        },
        {
          id: 'tl-enzo',
          handle: 'Enzo',
          realName: 'Enzo Mestari',
          role: 'Controller',
          countryFlag: '🇫🇷',
          countryName: 'France',
          profilePic: 'https://placehold.co/64x64/F97316/FFFFFF?text=EN',
          joinDate: '2022-11-01',
          aegisRating: 2654,
          achievements: ['IGL of the Year', 'Strategic Genius']
        }
      ],
      LoL: [
        {
          id: 'tl-impact',
          handle: 'Impact',
          realName: 'Jung Eon-yeong',
          role: 'Top',
          countryFlag: '🇰🇷',
          countryName: 'South Korea',
          profilePic: 'https://placehold.co/64x64/DC2626/FFFFFF?text=IM',
          joinDate: '2023-11-20',
          aegisRating: 2834,
          achievements: ['World Champion S3', 'LCS Champion']
        },
        {
          id: 'tl-umti',
          handle: 'UmTi',
          realName: 'Um Seong-min',
          role: 'Jungle',
          countryFlag: '🇰🇷',
          countryName: 'South Korea',
          profilePic: 'https://placehold.co/64x64/059669/FFFFFF?text=UM',
          joinDate: '2023-11-20',
          aegisRating: 2776,
          achievements: ['LCK MVP', 'Rookie Phenom']
        },
        {
          id: 'tl-apa',
          handle: 'APA',
          realName: 'Aaron Paul',
          role: 'Mid',
          countryFlag: '🇺🇸',
          countryName: 'United States',
          profilePic: 'https://placehold.co/64x64/3B82F6/FFFFFF?text=AP',
          joinDate: '2024-01-10',
          aegisRating: 2823,
          achievements: ['Rising Star NA', 'Pentakill Legend']
        },
        {
          id: 'tl-yeon',
          handle: 'Yeon',
          realName: 'Kim Yeon-jun',
          role: 'ADC',
          countryFlag: '🇰🇷',
          countryName: 'South Korea',
          profilePic: 'https://placehold.co/64x64/8B5CF6/FFFFFF?text=YE',
          joinDate: '2023-11-20',
          aegisRating: 2789,
          achievements: ['ADC of the Split', 'Mechanics Master']
        },
        {
          id: 'tl-corejj',
          handle: 'CoreJJ',
          realName: 'Jo Yong-in',
          role: 'Support',
          countryFlag: '🇰🇷',
          countryName: 'South Korea',
          profilePic: 'https://placehold.co/64x64/F59E0B/FFFFFF?text=CJ',
          joinDate: '2019-01-01',
          aegisRating: 2856,
          achievements: ['World Champion S7', 'All-Pro First Team']
        }
      ],
      Dota2: [
        {
          id: 'tl-micke',
          handle: 'miCKe',
          realName: 'Michael Vu',
          role: 'Carry',
          countryFlag: '🇸🇪',
          countryName: 'Sweden',
          profilePic: 'https://placehold.co/64x64/EF4444/FFFFFF?text=MC',
          joinDate: '2023-10-15',
          aegisRating: 2912,
          achievements: ['Major Winner', 'Farming God']
        },
        {
          id: 'tl-boxi',
          handle: 'Boxi',
          realName: 'Samuel Svahn',
          role: 'Offlane',
          countryFlag: '🇫🇮',
          countryName: 'Finland',
          profilePic: 'https://placehold.co/64x64/10B981/FFFFFF?text=BX',
          joinDate: '2023-10-15',
          aegisRating: 2743,
          achievements: ['TI Finalist', 'Initiator King']
        },
        {
          id: 'tl-nisha',
          handle: 'Nisha',
          realName: 'Michał Jankowski',
          role: 'Mid',
          countryFlag: '🇵🇱',
          countryName: 'Poland',
          profilePic: 'https://placehold.co/64x64/3B82F6/FFFFFF?text=NS',
          joinDate: '2022-09-01',
          aegisRating: 2876,
          achievements: ['TI Champion', 'Mid Lane Prodigy']
        },
        {
          id: 'tl-zai',
          handle: 'zai',
          realName: 'Ludwig Wåhlberg',
          role: 'Support',
          countryFlag: '🇸🇪',
          countryName: 'Sweden',
          profilePic: 'https://placehold.co/64x64/8B5CF6/FFFFFF?text=ZI',
          joinDate: '2022-09-01',
          aegisRating: 2687,
          achievements: ['Support Maestro', 'Vision King']
        },
        {
          id: 'tl-insania',
          handle: 'iNSaNiA',
          realName: 'Aydin Sarkohi',
          role: 'Captain',
          countryFlag: '🇸🇪',
          countryName: 'Sweden',
          profilePic: 'https://placehold.co/64x64/F97316/FFFFFF?text=IN',
          joinDate: '2022-09-01',
          aegisRating: 2698,
          achievements: ['Captain of the Year', 'Draft Master']
        }
      ]
    },

    // Staff
    staff: [
      {
        name: 'Rajesh Mehta',
        role: 'Head Coach',
        experience: '8 years',
        achievements: ['Coach of the Year 2023']
      },
      {
        name: 'Priya Sharma',
        role: 'Team Manager',
        experience: '5 years',
        achievements: ['Management Excellence Award']
      },
      {
        name: 'Dr. Amit Verma',
        role: 'Sports Psychologist',
        experience: '12 years',
        achievements: ['Mental Performance Specialist']
      }
    ],

    // Stats
    stats: {
      totalPrizeMoney: '$485,000',
      tournamentsWon: 12,
      worldRanking: 8,
      avgTeamRating: 2754,
      winRate: 74.3,
      currentStreak: 7,
      playersDiscovered: 23,
      yearsActive: 5
    },

    // Recent matches
    recentMatches: [
      {
        opponent: 'Team Liquid',
        result: 'Win',
        score: '16-12',
        date: '2025-08-24',
        tournament: 'ESL Pro League'
      },
      {
        opponent: 'FaZe Clan',
        result: 'Win',
        score: '16-9',
        date: '2025-08-22',
        tournament: 'ESL Pro League'
      },
      {
        opponent: 'Astralis',
        result: 'Loss',
        score: '14-16',
        date: '2025-08-20',
        tournament: 'IEM Cologne'
      }
    ]
  };

  // FIX: add missing selectedRoster state with a safe default
  const [selectedRoster, setSelectedRoster] = useState(Object.keys(organizationData.rosters)[0]);

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30'
          : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  const StatCard = ({ icon: Icon, label, value, change, color = "orange" }) => (
    <div className={`bg-zinc-800/50 border border-${color}-400/30 rounded-xl p-4 shadow-lg shadow-${color}-500/10`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-6 h-6 text-${color}-400`} />
        {change && (
          <div className={`flex items-center gap-1 text-sm ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className="w-3 h-3" />
            {Math.abs(change)}
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold text-${color}-400 mb-1`}>{value}</div>
      <div className="text-zinc-400 text-sm">{label}</div>
    </div>
  );

  const PlayerCard = ({ player }) => (
    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-orange-500/40 transition-colors group">
      <div className="flex items-center gap-4 mb-3">
        <img
          src={player.profilePic}
          alt={player.handle}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-zinc-700 group-hover:ring-orange-500/50 transition-colors"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-semibold">{player.handle}</span>
            <span className="text-lg">{player.countryFlag}</span>
          </div>
          <div className="text-zinc-400 text-sm">{player.realName}</div>
        </div>
        <div className="text-right">
          <div className="text-orange-400 font-semibold text-sm">{player.role}</div>
          <div className="text-zinc-500 text-xs">{player.aegisRating}</div>
        </div>
      </div>
      
      <div className="space-y-1">
        {player.achievements.slice(0, 2).map((achievement, index) => (
          <div key={index} className="text-xs text-zinc-400 flex items-center gap-1">
            <Medal className="w-3 h-3 text-amber-400" />
            {achievement}
          </div>
        ))}
      </div>
    </div>
  );

  const AchievementCard = ({ achievement }) => {
    const getTypeColor = () => {
      switch (achievement.type) {
        case 'major': return 'border-amber-500/30 bg-amber-500/10';
        case 'regional': return 'border-orange-500/30 bg-orange-500/10';
        case 'qualifier': return 'border-blue-500/30 bg-blue-500/10';
        default: return 'border-zinc-600/30 bg-zinc-600/10';
      }
    };

    const getTypeIcon = () => {
      switch (achievement.type) {
        case 'major': return <Crown className="w-6 h-6 text-amber-400" />;
        case 'regional': return <Trophy className="w-6 h-6 text-orange-400" />;
        case 'qualifier': return <Target className="w-6 h-6 text-blue-400" />;
        default: return <Award className="w-6 h-6 text-zinc-400" />;
      }
    };

    return (
      <div className={`border rounded-lg p-4 ${getTypeColor()} transition-all hover:scale-105`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getTypeIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">{achievement.title}</h3>
            <div className="text-sm text-zinc-300 mb-2">{achievement.placement}</div>
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>{achievement.date}</span>
              <span className="text-green-400 font-semibold">{achievement.prize}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950 min-h-screen text-white font-sans mt-[100px]">
      <div className="container mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button className="p-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Organization Profile</h1>
            <p className="text-zinc-400">Professional Esports Organization</p>
          </div>
        </div>

        {/* Organization Header */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left Side - Organization Info */}
            <div className="flex-1">
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  <img
                    src={organizationData.logo}
                    alt={organizationData.name}
                    className="w-24 h-24 rounded-xl object-contain bg-zinc-800/50 p-2"
                  />
                  {organizationData.verified && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 p-2 rounded-full shadow-lg shadow-orange-400/50">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold text-white">{organizationData.name}</h1>
                    <div className="flex gap-2">
                      <button className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group">
                        <Share2 className="w-5 h-5 text-zinc-300 group-hover:text-orange-400" />
                      </button>
                      <button className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group">
                        <MessageCircle className="w-5 h-5 text-zinc-300 group-hover:text-orange-400" />
                      </button>
                      <button className="p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg transition-colors group">
                        <UserPlus className="w-5 h-5 text-zinc-300 group-hover:text-orange-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-zinc-400 mb-4">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {organizationData.headquarters}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Founded {organizationData.founded}
                    </span>
                    <span className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4" />
                      {organizationData.game}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm font-medium">{organizationData.status}</span>
                    </div>
                    <div className="bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1">
                      <span className="text-amber-400 text-sm font-medium">{organizationData.tier}</span>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1">
                      <span className="text-blue-400 text-sm font-medium">Rank #{organizationData.stats.worldRanking}</span>
                    </div>
                  </div>

                  <p className="text-zinc-300 text-sm mb-6 max-w-2xl">{organizationData.description}</p>

                  {/* Social Links */}
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-lg px-3 py-2 text-blue-400 hover:bg-blue-600/30 transition-colors">
                      <Hash className="w-4 h-4" />
                      Twitter
                    </button>
                    <button className="flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 rounded-lg px-3 py-2 text-purple-400 hover:bg-purple-600/30 transition-colors">
                      <Activity className="w-4 h-4" />
                      Twitch
                    </button>
                    <button className="flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 hover:bg-red-600/30 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      Website
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Quick Stats */}
            <div className="lg:w-80">
              <div className="bg-gradient-to-r from-orange-600/20 to-red-500/20 border border-orange-400/30 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <span className="text-amber-400 font-semibold text-lg">Total Prize Money</span>
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">{organizationData.stats.totalPrizeMoney}</div>
                  <div className="text-amber-400 text-sm">{organizationData.stats.tournamentsWon} Tournaments Won</div>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>World Rank #{organizationData.stats.worldRanking}</span>
                </div>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-400" />
                  Organization Overview
                </h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-400">{organizationData.stats.winRate}%</div>
                    <div className="text-xs text-zinc-400">Overall Win Rate</div>
                  </div>
                  <div>
                    {/* FIX: derive active teams from rosters keys */}
                    <div className="text-lg font-bold text-orange-400">{Object.keys(organizationData.rosters).length}</div>
                    <div className="text-xs text-zinc-400">Active Teams</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6 mt-6">
            <StatCard icon={Trophy} label="Tournaments Won" value={organizationData.stats.tournamentsWon} change={2} color="amber" />
            <StatCard icon={Target} label="Win Rate" value={`${organizationData.stats.winRate}%`} change={3.2} color="green" />
            {/* FIX: sum active players across all rosters */}
            <StatCard
              icon={Users}
              label="Active Players"
              value={Object.values(organizationData.rosters).reduce((sum, roster) => sum + roster.length, 0)}
              color="blue"
            />
            <StatCard icon={Star} label="Years Active" value={organizationData.stats.yearsActive} color="purple" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton id="overview" label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} />
          <TabButton id="roster" label="Current Roster" isActive={activeTab === 'roster'} onClick={setActiveTab} />
          <TabButton id="achievements" label="Achievements" isActive={activeTab === 'achievements'} onClick={setActiveTab} />
          <TabButton id="matches" label="Recent Matches" isActive={activeTab === 'matches'} onClick={setActiveTab} />
          <TabButton id="staff" label="Staff & Management" isActive={activeTab === 'staff'} onClick={setActiveTab} />
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Organization Stats */}
              <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                  Organization Statistics
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-2">{organizationData.stats.totalPrizeMoney}</div>
                    <div className="text-zinc-400 text-sm">Total Winnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{organizationData.stats.winRate}%</div>
                    <div className="text-zinc-400 text-sm">Win Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">#{organizationData.stats.worldRanking}</div>
                    <div className="text-zinc-400 text-sm">World Rank</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{organizationData.stats.playersDiscovered}</div>
                    <div className="text-zinc-400 text-sm">Players Developed</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  Recent Matches
                </h3>
                <div className="space-y-4">
                  {organizationData.recentMatches.map((match, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                      <div>
                        <div className={`font-medium text-sm ${match.result === 'Win' ? 'text-green-400' : 'text-red-400'}`}>
                          {match.result} vs {match.opponent}
                        </div>
                        <div className="text-zinc-400 text-xs">{match.tournament} • {match.date}</div>
                      </div>
                      <div className="text-white font-mono text-sm">{match.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roster' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Active Rosters</h2>
                <div className="flex gap-2">
                  {Object.keys(organizationData.rosters).map(game => (
                    <button
                      key={game}
                      onClick={() => setSelectedRoster(game)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedRoster === game 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      }`}
                    >
                      {game}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-orange-400" />
                  {selectedRoster} Team
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {organizationData.rosters[selectedRoster].map(player => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-orange-600/10 to-red-500/10 border border-orange-400/30 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">{selectedRoster} Team Statistics</h3>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-orange-400 mb-1">
                      {Math.round(organizationData.rosters[selectedRoster].reduce((acc, p) => acc + p.aegisRating, 0) / organizationData.rosters[selectedRoster].length)}
                    </div>
                    <div className="text-zinc-400 text-sm">Avg Team Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400 mb-1">{organizationData.stats.currentStreak}</div>
                    <div className="text-zinc-400 text-sm">Current Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400 mb-1">{organizationData.rosters[selectedRoster].length}/5</div>
                    <div className="text-zinc-400 text-sm">Roster Status</div>
                  </div>
                </div>
              </div>

              {/* All Rosters Overview */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4">All Teams Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(organizationData.rosters).map(([game, roster]) => (
                    <div key={game} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-orange-400 mb-1">{game}</div>
                      <div className="text-sm text-zinc-400 mb-2">{roster.length} Players</div>
                      <div className="text-xs text-zinc-500">
                        Avg: {Math.round(roster.reduce((acc, p) => acc + p.aegisRating, 0) / roster.length)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Achievements & Trophies</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizationData.achievements.map((achievement, index) => (
                  <AchievementCard key={index} achievement={achievement} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Match History</h2>
              <div className="space-y-4">
                {organizationData.recentMatches.map((match, index) => (
                  <div key={index} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-orange-500/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${match.result === 'Win' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="text-white font-medium">{match.opponent}</div>
                          <div className="text-zinc-400 text-sm">{match.date} • {match.tournament}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${match.result === 'Win' ? 'text-green-400' : 'text-red-400'}`}>
                          {match.score}
                        </div>
                        <div className="text-zinc-400 text-sm">{match.result}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Staff & Management</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizationData.staff.map((member, index) => (
                  <div key={index} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{member.name}</h3>
                        <p className="text-orange-400 text-sm">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-zinc-400 text-sm mb-2">
                      Experience: {member.experience}
                    </div>
                    <div className="space-y-1">
                      {member.achievements.map((achievement, idx) => (
                        <div key={idx} className="text-xs text-zinc-400 flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-400" />
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg shadow-orange-500/30">
            Contact Organization
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-8 py-3 rounded-lg transition-colors border border-orange-400/30">
            Send Application
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-6 py-3 rounded-lg transition-colors border border-zinc-600 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Profile
          </button>
          <button className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium px-6 py-3 rounded-lg transition-colors border border-zinc-600 flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Copy Profile URL
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailedOrgInfo