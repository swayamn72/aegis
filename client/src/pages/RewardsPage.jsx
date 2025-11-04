import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { Coins, Trophy, Sparkles, Gift } from "lucide-react";

export default function RewardsPage() {
  const [loading, setLoading] = useState(false);
  const [rewardData, setRewardData] = useState(null);
  const [coins, setCoins] = useState(0);
  const [redeemed, setRedeemed] = useState([]);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("You must be logged in to view rewards");
          return;
        }

        const res = await axios.get(`http://localhost:5000/api/reward/coins`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setCoins(res.data.coins);
      } catch (err) {
        toast.error("Error fetching coin balance");
      }
    };
    fetchCoins();
  }, []);

  const handleDailyCheckIn = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/reward/daily-checkin",
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      );

      setRewardData(res.data);
      setCoins(res.data.newCoinBalance);
      // toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error claiming reward");
    } finally {
      setLoading(false);
    }
  };

  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`http://localhost:5000/api/reward/rewards`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setRewards(res.data.rewards);
      } catch (err) {
        console.error("Error fetching rewards:", err);
      }
    };
    fetchRewards();
  }, []);

  const handleRedeem = (reward) => {
    if (coins < reward.points) {
      toast.error("Not enough coins 💸");
      return;
    }
    setCoins((prev) => prev - reward.points);
    setRedeemed((prev) => [...prev, reward._id]);
    toast.success(`Redeemed ${reward.name}! 🎉`);
  };

  return (
    <div className="min-h-screen bg-black text-white font-[Inter] relative overflow-hidden">
      <Navbar />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 z-0 opacity-[0.15]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none"></div>

      <div className="relative z-10 pt-[120px] pb-16">
        <div className="max-w-7xl mx-auto px-6">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-2">
              <span className="text-zinc-500">REWARDS</span>{" "}
              <span className="text-[#FF4500]">CENTER</span>
            </h1>
            <p className="text-zinc-600 text-sm uppercase tracking-[0.3em] font-medium">
              EARN • REDEEM • DOMINATE
            </p>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column - Balance & Daily Check-In */}
            <div className="lg:col-span-1 space-y-6">

              {/* Coin Balance Card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 hover:border-zinc-800 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <Coins className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-zinc-600 text-xs uppercase tracking-[0.2em] font-medium">
                        YOUR BALANCE
                      </p>
                      <p className="text-3xl font-bold text-yellow-400">{coins}</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-semibold rounded-full">
                    <Coins className="w-4 h-4" />
                    COINS
                  </span>
                </div>
              </div>

              {/* Daily Check-In Card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 hover:border-zinc-800 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-cyan-400">DAILY CHECK-IN</h2>
                    <p className="text-zinc-600 text-xs uppercase tracking-[0.2em] font-medium">
                      BUILD YOUR STREAK
                    </p>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm mb-6">
                  Claim your daily reward and maintain your winning momentum.
                </p>
                <button
                  onClick={handleDailyCheckIn}
                  disabled={loading}
                  className="w-full bg-[#FF4500] hover:bg-[#FF4500]/90 px-4 py-3 rounded-md font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      CLAIMING...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4" />
                      CLAIM REWARD
                    </>
                  )}
                </button>
              </div>

              {/* Reward Result */}
              {rewardData && (
                <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Gift className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-green-400">REWARD CLAIMED</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-zinc-300">{rewardData.message}</p>
                    <p className="text-yellow-400 font-semibold">
                      New Balance: {rewardData.newCoinBalance} coins
                    </p>
                    {rewardData.streak && (
                      <p className="text-[#FF4500] font-semibold">
                        🔥 Streak: {rewardData.streak} days
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Redeemable Rewards */}
            <div className="lg:col-span-2">
              <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
                <div className="border-b border-zinc-900 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <Gift className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-purple-400">REDEEMABLE REWARDS</h2>
                      <p className="text-zinc-600 text-xs uppercase tracking-[0.2em] font-medium">
                        TURN COINS INTO POWER-UPS
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewards.map((reward) => (
                      <div
                        key={reward._id}
                        className="bg-zinc-900/50 border border-zinc-900 rounded-lg p-5 hover:border-zinc-800 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-lg mb-2">{reward.name}</h3>
                            <div className="flex items-center gap-2">
                              <Coins className="w-4 h-4 text-yellow-400" />
                              <span className="text-zinc-400 text-sm">{reward.points} coins</span>
                            </div>
                          </div>
                          <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors">
                            <Gift className="w-5 h-5 text-zinc-400" />
                          </div>
                        </div>
                        <button
                          onClick={() => handleRedeem(reward)}
                          disabled={redeemed.includes(reward._id)}
                          className={`w-full py-3 rounded-md font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                            redeemed.includes(reward._id)
                              ? "bg-green-500/10 border border-green-500/20 text-green-400"
                              : coins >= reward.points
                              ? "bg-[#FF4500] hover:bg-[#FF4500]/90 text-white"
                              : "bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed"
                          }`}
                        >
                          {redeemed.includes(reward._id) ? (
                            <>
                              <Trophy className="w-4 h-4" />
                              CLAIMED
                            </>
                          ) : (
                            <>
                              <Gift className="w-4 h-4" />
                              REDEEM
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
