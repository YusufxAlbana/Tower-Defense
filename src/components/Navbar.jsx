import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Home, ShoppingCart, Layers, Info, Coins } from 'lucide-react';
import { usePlayerStore } from '../store/gameStore';
import { getCurrentUser, isLoggedIn } from '../firebase';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { coins } = usePlayerStore();
  const user = getCurrentUser();

  // Don't show navbar on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  // Don't show if not logged in
  if (!isLoggedIn()) {
    return null;
  }

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/store', label: 'Store', icon: ShoppingCart },
    { path: '/deck', label: 'Deck', icon: Layers },
    { path: '/info', label: 'Intel', icon: Info }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Shield size={20} className="text-white" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-base font-black text-white tracking-wider leading-none">
              DEFENSE<span className="text-indigo-400">GRID</span>
            </h1>
            <span className="text-[8px] font-semibold text-slate-500 tracking-widest">
              COMMAND CENTER
            </span>
          </div>
        </button>

        {/* Nav Items */}
        <div className="flex items-center gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}

          {/* Coins Display */}
          <div className="ml-2 flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700">
            <Coins size={16} className="text-yellow-400" />
            <span className="font-bold text-yellow-400 font-mono text-sm">{coins}</span>
          </div>

          {/* User Menu */}
          <button
            onClick={() => navigate('/settings')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-all ${
              isActive('/settings')
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden md:inline">{user?.username || 'User'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
