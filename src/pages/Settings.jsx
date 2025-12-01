import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, ArrowLeft, User, Lock, LogOut, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { usePlayerStore } from '../store/gameStore';
import { changePassword, logoutUser, getCurrentUser, savePlayerData } from '../firebase';

const Settings = () => {
  const navigate = useNavigate();
  const { coins, totalGamesPlayed, highestWave, totalKills, resetData, getPlayerData } = usePlayerStore();
  const user = getCurrentUser();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  const showNotification = (message, success = true) => {
    setNotification({ message, success });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', false);
      return;
    }
    if (newPassword.length < 4) {
      showNotification('Password must be at least 4 characters', false);
      return;
    }
    
    setLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      showNotification('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showNotification(result.error, false);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    // Save data before logout
    const data = getPlayerData();
    savePlayerData(data);
    
    logoutUser();
    navigate('/login');
  };

  const handleResetProgress = async () => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
      resetData();
      const data = getPlayerData();
      await savePlayerData(data);
      showNotification('Progress reset successfully!');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-6 pb-12 min-h-screen pt-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg font-bold flex items-center gap-2 ${
            notification.success ? 'bg-emerald-600' : 'bg-rose-600'
          }`}>
            {notification.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {notification.message}
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <SettingsIcon size={28} className="text-slate-400" />
            <h1 className="text-3xl md:text-4xl font-black text-white">Settings</h1>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold">{user?.username || 'User'}</h3>
              <p className="text-sm text-slate-400">Commander</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Coins" value={coins} />
          <StatCard label="Games" value={totalGamesPlayed} />
          <StatCard label="Best Wave" value={highestWave} />
          <StatCard label="Total Kills" value={totalKills} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="Profile" />
          <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={Lock} label="Security" />
        </div>

        {/* Tab Content */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Profile Info</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-slate-400"
                />
                <p className="text-xs text-slate-500 mt-1">Username cannot be changed</p>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <h4 className="font-bold mb-2">Account Created</h4>
                <p className="text-slate-400 text-sm">Your progress is saved automatically</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Change Password</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loading || !currentPassword || !newPassword}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                Change Password
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-rose-950/30 border border-rose-900/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-rose-400 mb-4">Danger Zone</h3>
          
          <div className="space-y-3">
            <button
              onClick={handleResetProgress}
              className="w-full bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600/50 text-rose-400 font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Reset All Progress
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-center">
    <div className="text-xl font-black text-white">{value}</div>
    <div className="text-xs text-slate-500">{label}</div>
  </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${
      active ? 'bg-indigo-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
    }`}
  >
    <Icon size={16} />
    {label}
  </button>
);

export default Settings;
