import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Coins, Lock, CheckCircle, ArrowLeft, X, Zap, Target, Shield } from 'lucide-react';
import { usePlayerStore, SHOP_TOWERS, TOWER_TYPES } from '../store/gameStore';

const CATEGORIES = [
  { id: 'all', name: 'All', color: 'bg-slate-600' },
  { id: 'starter', name: 'Starter', color: 'bg-emerald-600' },
  { id: 'basic', name: 'Basic', color: 'bg-blue-600' },
  { id: 'advanced', name: 'Advanced', color: 'bg-purple-600' },
  { id: 'elemental', name: 'Elemental', color: 'bg-orange-600' },
  { id: 'support', name: 'Support', color: 'bg-pink-600' },
  { id: 'special', name: 'Special', color: 'bg-indigo-600' },
  { id: 'legendary', name: 'Legendary', color: 'bg-yellow-600' },
  { id: 'mythic', name: 'Mythic', color: 'bg-red-600' }
];

const TowerDetailModal = ({ tower, towerConfig, isUnlocked, canAfford, onBuy, onClose }) => {
  if (!tower) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${towerConfig?.color || 'from-slate-600 to-slate-800'} flex items-center justify-center shadow-lg`}>
              {towerConfig?.icon && React.createElement(towerConfig.icon, { size: 32, className: 'text-white' })}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{tower.name}</h2>
              <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${CATEGORIES.find(c => c.id === tower.category)?.color || 'bg-slate-600'}`}>
                {tower.category}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Description */}
        <p className="text-slate-300 mb-6">{tower.description}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatBox icon={Zap} label="Damage" value={tower.damage} color="text-rose-400" />
          <StatBox icon={Target} label="Range" value={tower.range} color="text-blue-400" />
          <StatBox icon={Shield} label="Speed" value={tower.cooldown > 0 ? (60 / tower.cooldown).toFixed(1) : '∞'} color="text-amber-400" />
          <StatBox icon={Coins} label="Build Cost" value={towerConfig?.cost || '-'} color="text-emerald-400" />
        </div>

        {/* Tower Type Info */}
        {towerConfig && (
          <div className="bg-slate-950/50 rounded-lg p-4 mb-6">
            <div className="text-sm text-slate-400 mb-2">Special Ability</div>
            <div className="text-white font-bold">{towerConfig.desc}</div>
          </div>
        )}

        {/* Price & Buy */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins size={24} className="text-yellow-400" />
            <span className="text-2xl font-black text-yellow-400">
              {tower.price === 0 ? 'FREE' : tower.price}
            </span>
          </div>

          {isUnlocked ? (
            <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 px-6 py-3 rounded-lg font-bold flex items-center gap-2">
              <CheckCircle size={20} />
              OWNED
            </div>
          ) : (
            <button
              onClick={() => onBuy(tower.id)}
              disabled={!canAfford}
              className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
                canAfford
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              {canAfford ? <Coins size={18} /> : <Lock size={18} />}
              {canAfford ? 'BUY NOW' : 'NOT ENOUGH'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon: Icon, label, value, color }) => (
  <div className="bg-slate-950/50 p-3 rounded-lg">
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className={color} />
      <span className="text-xs text-slate-500">{label}</span>
    </div>
    <div className={`text-xl font-black ${color}`}>{value}</div>
  </div>
);

const Store = () => {
  const navigate = useNavigate();
  const { coins, unlockedTowers, buyTower } = usePlayerStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTower, setSelectedTower] = useState(null);
  const [notification, setNotification] = useState(null);

  const handleBuy = (towerId) => {
    const result = buyTower(towerId);
    setNotification({ success: result.success, message: result.message });
    setTimeout(() => setNotification(null), 2000);
    if (result.success) {
      setSelectedTower(null);
    }
  };

  const filteredTowers = Object.values(SHOP_TOWERS).filter(
    tower => selectedCategory === 'all' || tower.category === selectedCategory
  );

  const selectedTowerData = selectedTower ? SHOP_TOWERS[selectedTower] : null;
  const selectedTowerConfig = selectedTower ? TOWER_TYPES[selectedTower] : null;

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-6 pb-12 min-h-screen pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </button>
          
          <div className="flex items-center gap-3 bg-slate-800/80 px-6 py-3 rounded-xl border border-slate-700">
            <Coins size={24} className="text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">{coins}</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <ShoppingCart size={28} className="text-indigo-400" />
            <h1 className="text-3xl md:text-5xl font-black text-white">ARMORY</h1>
          </div>
          <p className="text-slate-400">Unlock {Object.keys(SHOP_TOWERS).length} powerful towers • Click for details</p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg font-bold ${notification.success ? 'bg-emerald-600' : 'bg-rose-600'}`}>
            {notification.message}
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? `${cat.color} text-white shadow-lg`
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tower Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredTowers.map(tower => {
            const isUnlocked = unlockedTowers.includes(tower.id);
            const canAfford = coins >= tower.price;
            const towerConfig = TOWER_TYPES[tower.id];

            return (
              <div
                key={tower.id}
                onClick={() => setSelectedTower(tower.id)}
                className={`bg-slate-900/80 border-2 rounded-xl p-3 transition-all cursor-pointer hover:scale-105 ${
                  isUnlocked
                    ? 'border-emerald-500/50'
                    : canAfford
                    ? 'border-slate-700 hover:border-indigo-500/50'
                    : 'border-slate-800 opacity-60'
                }`}
              >
                {/* Icon */}
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${towerConfig?.color || 'from-slate-600 to-slate-800'} flex items-center justify-center`}>
                    {towerConfig?.icon && React.createElement(towerConfig.icon, { size: 20, className: 'text-white' })}
                  </div>
                  {isUnlocked && <CheckCircle size={16} className="text-emerald-400" />}
                </div>

                {/* Info */}
                <h3 className="text-sm font-bold mb-1 truncate">{tower.name}</h3>
                
                {/* Price/Status */}
                <div className="text-xs">
                  {isUnlocked ? (
                    <span className="text-emerald-400 font-bold">OWNED</span>
                  ) : tower.price === 0 ? (
                    <span className="text-blue-400 font-bold">FREE</span>
                  ) : (
                    <span className={`font-bold flex items-center gap-1 ${canAfford ? 'text-yellow-400' : 'text-slate-500'}`}>
                      <Coins size={12} /> {tower.price}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* How to Earn */}
        <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <Coins size={20} className="text-yellow-400" />
            How to Earn Coins
          </h3>
          <ul className="text-slate-400 text-sm space-y-1">
            <li>• Kill enemies: 1 kill = 1 coin</li>
            <li>• Complete waves for bonus</li>
          </ul>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTowerData && (
        <TowerDetailModal
          tower={selectedTowerData}
          towerConfig={selectedTowerConfig}
          isUnlocked={unlockedTowers.includes(selectedTower)}
          canAfford={coins >= selectedTowerData.price}
          onBuy={handleBuy}
          onClose={() => setSelectedTower(null)}
        />
      )}
    </div>
  );
};

export default Store;
