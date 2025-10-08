import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import AdminLayout from '../components/AdminLayout';
import {
  Trophy,
  Gamepad2,
  Users,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

// API functions
const fetchDashboardStats = async (token) => {
  try {
    const response = await fetch('/api/admin/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

const fetchRecentActivity = async (token) => {
  try {
    const response = await fetch('/api/admin/dashboard/activity', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch recent activity');
    }
    const data = await response.json();
    return data.activities || [];
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    green: 'text-green-400 bg-green-500/20 border-green-500/30',
    orange: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    purple: 'text-purple-400 bg-purple-500/20 border-purple-500/30'
  };

  return (
    <div className={`bg-zinc-900/50 border rounded-xl p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-current" />
      </div>
    </div>
  );
};

const RecentActivity = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="h-16 w-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <Activity className="h-8 w-8 text-zinc-400" />
          </div>
          <div className="text-center">
            <h4 className="text-lg font-medium text-white mb-2">No Recent Activity</h4>
            <p className="text-zinc-400 text-sm">
              There are no recent activities to display. Start by creating tournaments or managing matches.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${
              activity.type === 'success' ? 'bg-green-500' :
              activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            <div className="flex-1">
              <p className="text-white text-sm">{activity.message}</p>
              <p className="text-zinc-400 text-xs">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { admin, token } = useAdmin();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeMatches: 0,
    totalPlayers: 0,
    upcomingEvents: 0
  });
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const loadDashboardData = async () => {
      if (!token) return; // Don't make API calls if no token

      setLoading(true);
      try {
        // Fetch real data from API
        const [statsData, activitiesData] = await Promise.all([
          fetchDashboardStats(token),
          fetchRecentActivity(token)
        ]);

        setStats(statsData);
        // For now, keep mock activities until we implement the activity endpoint
        // setActivities(activitiesData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Show empty state if API fails
        setStats({
          totalTournaments: 0,
          activeMatches: 0,
          totalPlayers: 0,
          upcomingEvents: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome back, {admin?.username}!
          </h1>
          <p className="text-zinc-300">
            Here's what's happening with your esports platform today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Tournaments"
            value={stats.totalTournaments}
            icon={Trophy}
            color="orange"
          />
          <StatCard
            title="Active Matches"
            value={stats.activeMatches}
            icon={Gamepad2}
            color="blue"
          />
          <StatCard
            title="Registered Players"
            value={stats.totalPlayers}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            icon={Calendar}
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <RecentActivity activities={[]} />
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">


            {/* System Status */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 text-sm">Database</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-xs">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 text-sm">API Services</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-xs">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 text-sm">File Storage</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-xs">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
