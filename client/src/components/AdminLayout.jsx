import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import {
  LayoutDashboard,
  Trophy,
  Gamepad2,
  Users,
  LogOut,
  Menu,
  X,
  Shield,
  Settings,
  BarChart3
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/admin/dashboard'
    },
    {
      name: 'Tournaments',
      href: '/admin/tournaments',
      icon: Trophy,
      current: location.pathname === '/admin/tournaments'
    },
    {
      name: 'Matches',
      href: '/admin/matches',
      icon: Gamepad2,
      current: location.pathname === '/admin/matches'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: location.pathname === '/admin/analytics'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname === '/admin/settings'
    }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-stone-950 to-neutral-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={
          "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800 transition-transform duration-300 ease-in-out " +
          "transform lg:transform-none " +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full") +
          " lg:translate-x-0"
        }
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin Portal</h1>
                <p className="text-xs text-zinc-400">Aegis Esports</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Admin Info */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {admin?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {admin?.username}
                </p>
                <p className="text-xs text-zinc-400 capitalize">
                  {admin?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors " +
                    (item.current
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "text-zinc-300 hover:text-white hover:bg-zinc-800/50")
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-zinc-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-white">
                {navigation.find(item => item.current)?.name || 'Admin Portal'}
              </h2>
            </div>

            <div className="text-sm text-zinc-400">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
