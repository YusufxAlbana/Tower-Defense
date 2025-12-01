import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowLeft, Plus, X, Zap, Target, Shield, AlertCircle } from 'lucide-react';
import { usePlayerStore, SHOP_TOWERS, TOWER_TYPES } from '../store/gameStore';

const Deck = () => {
  const navigate = useNavigate();
  const { unlockedTowers, activeDeck, addToDeck, removeFromDeck } = usePlayerStore();
  const [notification, setNotification] = useState(null);

  const showNotification = (message, success = true) => {
    setNotification({ message, success });
    setTimeout(() => setNotification(null), 2000);
  };

  const handleAdd = (towerId) => {
    const result = addToDeck(towerId);
    showNotification(result.message, result.success);
  };

  const handleRemove = (towerId) => {
    const result = removeFromDeck(towerId);
    showNotification(result.message, result.success);
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-6 pb-12 min-h-screen pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg font-bold ${
            notification.success ? 'bg-emerald-600' : 'bg-rose-600'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <Layers size={28} className="text-emerald-400" />
            <h1 className="text-3xl md:text-5xl font-black text-white">DECK</h1>
          </div>
          <p className="text-slate-400">
            Select towers for battle • Min 2, Max 5 ({activeDeck.length}/5)
          </p>
        </div>

        {/* Active Deck */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            Active Deck
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 bg-slate-900/50 border-2 border-dashed border-emerald-500/30 rounded-xl p-4">
            {[0, 1, 2, 3, 4].map(index => {
              const towerId = activeDeck[index];
              const tower = towerId ? SHOP_TOWERS[towerId] : null;
              const towerConfig = towerId ? TOWER_TYPES[towerId] : null;

              if (!tower) {
                return (
                  <div key={index} className="aspect-square bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center">
                    <Plus size={24} className="text-slate-600" />
                  </div>
                );
              }

              return (
                <div
                  key={towerId}
                  className="relative bg-slate-800 border-2 border-emerald-500/50 rounded-xl p-2 group hover:scale-105 transition-transform"
                >
                  <button
                    onClick={() => handleRemove(towerId)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 hover:bg-rose-500 rounded-full flex items-center justify-center z-10 shadow-lg"
                  >
                    <X size={12} />
                  </button>

                  <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${towerConfig?.color || 'from-slate-600 to-slate-800'} flex items-center justify-center mb-2`}>
                    {towerConfig?.icon && React.createElement(towerConfig.icon, { size: 24, className: 'text-white' })}
                  </div>
                  <div className="text-center text-xs font-bold truncate">{tower.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning if deck too small */}
        {activeDeck.length < 2 && (
          <div className="mb-6 bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-400" />
            <span className="text-amber-200 text-sm">You need at least 2 towers in your deck to play!</span>
          </div>
        )}

        {/* Available Towers */}
        <div>
          <h2 className="text-lg font-bold mb-3">
            Unlocked Towers ({unlockedTowers.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {unlockedTowers.map(towerId => {
              const tower = SHOP_TOWERS[towerId];
              const towerConfig = TOWER_TYPES[towerId];
              const isInDeck = activeDeck.includes(towerId);

              if (!tower) return null;

              return (
                <div
                  key={towerId}
                  className={`bg-slate-900/80 border-2 rounded-xl p-3 transition-all ${
                    isInDeck
                      ? 'border-emerald-500/50 opacity-60'
                      : 'border-slate-700 hover:border-indigo-500/50'
                  }`}
                >
                  <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${towerConfig?.color || 'from-slate-600 to-slate-800'} flex items-center justify-center mb-2`}>
                    {towerConfig?.icon && React.createElement(towerConfig.icon, { size: 28, className: 'text-white' })}
                  </div>

                  <h3 className="font-bold text-sm text-center mb-1 truncate">{tower.name}</h3>
                  
                  {/* Mini Stats */}
                  <div className="flex justify-center gap-2 mb-2 text-[10px]">
                    <span className="text-rose-400">{tower.damage}⚔</span>
                    <span className="text-blue-400">{tower.range}📍</span>
                  </div>

                  {isInDeck ? (
                    <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 py-1.5 rounded text-center text-xs font-bold">
                      IN DECK
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAdd(towerId)}
                      disabled={activeDeck.length >= 5}
                      className={`w-full py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        activeDeck.length >= 5
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      <Plus size={12} />
                      Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h3 className="font-bold mb-2">Tips</h3>
          <ul className="text-slate-400 text-sm space-y-1">
            <li>• Mix damage and support towers</li>
            <li>• Include slow towers for crowd control</li>
            <li>• Unlock more towers in the Store</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Deck;
