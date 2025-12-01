import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info as InfoIcon, ArrowLeft, X, Shield, Zap, Heart, TrendingUp, Skull, Ghost, Wind } from 'lucide-react';
import { ENEMY_INFO } from '../store/gameStore';

const ENEMY_ICONS = {
  GOBLIN: Skull,
  ORC: Shield,
  SPIRIT: Ghost,
  SPEEDY: Wind,
  BOSS: Skull
};

const ENEMY_COLORS = {
  GOBLIN: 'bg-green-500',
  ORC: 'bg-red-700',
  SPIRIT: 'bg-cyan-400',
  SPEEDY: 'bg-yellow-500',
  BOSS: 'bg-rose-900'
};

const Info = () => {
  const navigate = useNavigate();
  const [selectedEnemy, setSelectedEnemy] = useState(null);

  const enemy = selectedEnemy ? ENEMY_INFO[selectedEnemy] : null;
  const EnemyIcon = enemy ? ENEMY_ICONS[enemy.id] : null;

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 pb-12 min-h-screen pt-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <InfoIcon size={32} className="text-rose-400" />
            <h1 className="text-5xl font-black text-white">ENEMY INTEL</h1>
          </div>
          <p className="text-slate-400 text-lg">Know your enemy to defeat them</p>
        </div>

        {/* Enemy Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.values(ENEMY_INFO).map(enemyData => {
            const Icon = ENEMY_ICONS[enemyData.id];
            const color = ENEMY_COLORS[enemyData.id];

            return (
              <button
                key={enemyData.id}
                onClick={() => setSelectedEnemy(enemyData.id)}
                className="bg-slate-900/80 border-2 border-slate-700 hover:border-rose-500/50 rounded-xl p-4 transition-all hover:scale-105 group"
              >
                <div
                  className={`w-full aspect-square rounded-full ${color} flex items-center justify-center mb-3 shadow-lg border-2 border-slate-900/50 group-hover:scale-110 transition-transform ${
                    enemyData.id === 'BOSS' ? 'animate-pulse' : ''
                  }`}
                >
                  <Icon size={enemyData.id === 'BOSS' ? 40 : 32} className="text-white" />
                </div>
                <h3 className="font-bold text-center">{enemyData.name}</h3>
                <p className="text-xs text-slate-500 text-center mt-1">
                  HP: {enemyData.hp}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEnemy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl max-w-md w-full p-6 relative animate-in zoom-in duration-200">
            <button
              onClick={() => setSelectedEnemy(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-800 hover:bg-rose-600 rounded-full flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>

            {/* Enemy Icon */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-20 h-20 rounded-full ${ENEMY_COLORS[enemy.id]} flex items-center justify-center shadow-xl border-4 border-slate-950 ${
                  enemy.id === 'BOSS' ? 'animate-pulse' : ''
                }`}
              >
                <EnemyIcon size={enemy.id === 'BOSS' ? 48 : 40} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black">{enemy.name}</h2>
                <p className="text-sm text-slate-400 uppercase tracking-wider">
                  {enemy.id}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-slate-300 mb-6 leading-relaxed border-l-4 border-rose-500 pl-4 italic">
              {enemy.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-950/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-rose-400 mb-1">
                  <Heart size={16} />
                  <span className="text-xs font-bold uppercase">Health</span>
                </div>
                <div className="text-2xl font-black">{enemy.hp}</div>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <Zap size={16} />
                  <span className="text-xs font-bold uppercase">Speed</span>
                </div>
                <div className="text-2xl font-black text-sm">{enemy.speed}</div>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-amber-400 mb-1">
                  <Shield size={16} />
                  <span className="text-xs font-bold uppercase">Armor</span>
                </div>
                <div className="text-2xl font-black">{enemy.armor}</div>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <TrendingUp size={16} />
                  <span className="text-xs font-bold uppercase">Reward</span>
                </div>
                <div className="text-2xl font-black">{enemy.reward}</div>
              </div>
            </div>

            {/* Weakness & Strength */}
            <div className="space-y-3">
              <div className="bg-emerald-900/20 border border-emerald-700/50 p-3 rounded-lg">
                <div className="text-xs font-bold text-emerald-400 uppercase mb-1">
                  Weakness
                </div>
                <div className="text-sm text-emerald-300">{enemy.weakness}</div>
              </div>

              <div className="bg-rose-900/20 border border-rose-700/50 p-3 rounded-lg">
                <div className="text-xs font-bold text-rose-400 uppercase mb-1">
                  Strength
                </div>
                <div className="text-sm text-rose-300">{enemy.strength}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Info;
