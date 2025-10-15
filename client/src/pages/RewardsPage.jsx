import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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

  const rewards = [
    { id: 1, name: "Exclusive Avatar", cost: 50 },
    { id: 2, name: "1-Day Premium Access", cost: 100 },
    { id: 3, name: "Mystery Box", cost: 75 },
    { id: 4, name: "Golden Frame Badge", cost: 150 },
  ];

  const handleRedeem = (reward) => {
    if (coins < reward.cost) {
      toast.error("Not enough coins 💸");
      return;
    }
    setCoins((prev) => prev - reward.cost);
    setRedeemed((prev) => [...prev, reward.id]);
    toast.success(`Redeemed ${reward.name}! 🎉`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#111111] text-white font-mono">
      <header className="text-center py-10">
        <h1 className="text-5xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(255,255,0,0.9)]">
          🎁 Rewards Center
        </h1>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-12 gap-8 px-8">
        {/* Left Column: Balance & Daily Check-In */}
        <div className="col-span-12 md:col-span-5 flex flex-col gap-6">
          {/* Coin Balance */}
          <div className="p-6 bg-gray-900/80 border border-yellow-500 rounded-2xl flex flex-col items-center shadow-lg shadow-yellow-500/50">
            <p className="text-lg font-semibold text-yellow-300">💰 Your Balance</p>
            <span className="text-4xl font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(255,255,0,0.9)] animate-pulse">
              {coins} 🪙
            </span>
          </div>

          {/* Daily Check-In */}
          <div className="p-6 bg-gray-800 rounded-2xl border border-blue-500 shadow-lg shadow-blue-500/50 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl font-bold mb-2 text-blue-400 drop-shadow-[0_0_6px_rgba(0,150,255,0.8)]">
              Daily Check-In
            </h2>
            <p className="text-gray-400 mb-4">Claim your daily reward and build your streak!</p>
            <button
              onClick={handleDailyCheckIn}
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-black font-bold shadow-md shadow-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Claiming..." : "Claim Reward"}
            </button>
          </div>

          {/* Reward Result */}
          {rewardData && (
            <div className="p-4 bg-gray-900/80 rounded-xl border border-yellow-400 text-gray-300 shadow-md shadow-yellow-400/30">
              <p className="text-green-400 font-semibold">✅ {rewardData.message}</p>
              <p className="text-yellow-300 font-bold">💰 New Coin Balance: {rewardData.newCoinBalance}</p>
              {rewardData.streak && (
                <p className="text-orange-400 font-semibold">🔥 Streak: {rewardData.streak} days</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Redeemable Rewards */}
        <div className="col-span-12 md:col-span-7 p-6 bg-gray-800 rounded-2xl border border-purple-500 shadow-lg shadow-purple-500/40 flex flex-col gap-6">
          <h2 className="text-3xl font-bold mb-4 text-purple-400 drop-shadow-[0_0_8px_rgba(180,0,255,0.7)] text-center">
            🎮 Redeem Rewards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex flex-col justify-between p-4 bg-gray-900/80 rounded-xl border border-purple-400 hover:scale-105 transform transition-transform duration-200 shadow-md shadow-purple-500/30"
              >
                <div>
                  <h3 className="font-semibold text-purple-200">{reward.name}</h3>
                  <p className="text-sm text-gray-400">Cost: {reward.cost} 🪙</p>
                </div>
                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={redeemed.includes(reward.id)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all duration-200 mt-2 ${
                    redeemed.includes(reward.id)
                      ? "bg-green-600 text-white shadow-md shadow-green-500/50"
                      : "bg-purple-500 hover:bg-purple-600 text-black shadow-md shadow-purple-500/40"
                  }`}
                >
                  {redeemed.includes(reward.id) ? "Claimed ✅" : "Redeem"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
