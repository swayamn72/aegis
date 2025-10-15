import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Shield, PlusCircle, Trash2, Edit2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

// API functions
const fetchRewards = async (token) => {
  try {
    const res = await fetch('http://localhost:5000/api/admin/rewards', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch rewards');
    return await res.json();
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return [];
  }
};

const addReward = async (token, reward) => {
  try {
    const res = await fetch('http://localhost:5000/api/admin/rewards', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reward),
    });
    if (!res.ok) throw new Error('Failed to add reward');
    return await res.json();
  } catch (error) {
    console.error('Error adding reward:', error);
    throw error;
  }
};

const deleteReward = async (token, rewardId) => {
  try {
    const res = await fetch(`http://localhost:5000/api/admin/rewards/${rewardId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete reward');
    return await res.json();
  } catch (error) {
    console.error('Error deleting reward:', error);
    throw error;
  }
};

const AdminRewards = () => {
  const { token } = useAdmin();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReward, setNewReward] = useState({ name: '', points: '' });
  const [saving, setSaving] = useState(false);

  // Load rewards on mount
  useEffect(() => {
    const loadRewards = async () => {
      setLoading(true);
      const data = await fetchRewards(token);
      setRewards(data);
      setLoading(false);
    };
    loadRewards();
  }, [token]);

  const handleAddReward = async (e) => {
    e.preventDefault();
    if (!newReward.name || !newReward.points) return;
    setSaving(true);
    try {
      const added = await addReward(token, {
        name: newReward.name,
        points: parseInt(newReward.points),
      });
      setRewards([...rewards, added]);
      setNewReward({ name: '', points: '' });
    } catch (err) {
      alert('Failed to add reward');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReward = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;
    try {
      await deleteReward(token, id);
      setRewards(rewards.filter((r) => r._id !== id));
    } catch (err) {
      alert('Failed to delete reward');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Manage Rewards</h1>

        {/* Add Reward Form */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> Add New Reward
          </h2>
          <form className="flex flex-col md:flex-row gap-4" onSubmit={handleAddReward}>
            <input
              type="text"
              placeholder="Reward Name"
              className="flex-1 p-2 rounded-lg bg-zinc-800 text-white border border-zinc-700"
              value={newReward.name}
              onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Points"
              className="w-32 p-2 rounded-lg bg-zinc-800 text-white border border-zinc-700"
              value={newReward.points}
              onChange={(e) => setNewReward({ ...newReward, points: e.target.value })}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Add Reward'}
            </button>
          </form>
        </div>

        {/* Rewards List */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Existing Rewards</h2>
          {loading ? (
            <p className="text-zinc-400">Loading...</p>
          ) : rewards.length === 0 ? (
            <p className="text-zinc-400">No rewards added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-zinc-300 text-sm border-b border-zinc-700">
                    <th className="p-2">Name</th>
                    <th className="p-2">Points</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((reward) => (
                    <tr key={reward._id} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                      <td className="p-2 text-white">{reward.name}</td>
                      <td className="p-2 text-zinc-300">{reward.points}</td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() => handleDeleteReward(reward._id)}
                          className="flex items-center gap-1 px-2 py-1 text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                        {/* Optional: Edit button */}
                        {/* <button className="flex items-center gap-1 px-2 py-1 text-blue-400 hover:text-blue-500">
                          <Edit2 className="w-4 h-4" /> Edit
                        </button> */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRewards;
