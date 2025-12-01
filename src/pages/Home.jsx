import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Cpu, Map as MapIcon, Zap, Shield, Flame, Trophy, Mountain, Trees, Flame as VolcanoIcon } from 'lucide-react';
import { MAPS } from '../store/gameStore';

const HomePage = () => {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('normal');
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showMapSelect, setShowMapSelect] = useState(false);
  const [selectedMap, setSelectedMap] = useState(null);

  const difficulties = [
    { id: 'easy', name: 'Easy', desc: 'Relaxed gameplay • More gold', icon: Shield, color: 'from-emerald-500 to-teal-500', border: 'border-emerald-500' },
    { id: 'normal', name: 'Normal', desc: 'Balanced challenge', icon: Zap, color: 'from-indigo-500 to-purple-500', border: 'border-indigo-500' },
    { id: 'hard', name: 'Hard', desc: 'Intense battle • More enemies', icon: Flame, color: 'from-orange-500 to-red-500', border: 'border-red-500' }
  ];

  const handleDifficultyNext = () => {
    setShowMapSelect(true);
  };

  const handleStart = () => {
    if (!selectedMap) return;
    localStorage.setItem('tower-defense-difficulty', difficulty);
    localStorage.setItem('tower-defense-map', selectedMap);
    navigate('/game');
  };

  const mapIcons = {
    FOREST: Trees,
    DESERT: Mountain,
    VOLCANO: VolcanoIcon
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#020617] text-white font-sans pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:64px_64px] opacity-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] opacity-80 pointer-events-none"></div>

      {/* Ambient Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/15 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/15 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center min-h-full py-12 px-6 overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-md mb-6 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
              <span className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                System Online v2.0
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 tracking-tight mb-4 leading-none animate-in fade-in slide-in-from-bottom-4 duration-700">
              DEFENSE
            </h1>
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 tracking-tight mb-6 leading-none animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '100ms' }}>
              GRID
            </h1>

            <p className="text-slate-400 text-base md:text-lg font-medium max-w-xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '200ms' }}>
              Deploy tactical units. Defend against the relentless swarm in this strategic simulation.
            </p>
          </div>

          {/* Difficulty & Map Selector */}
          {!showDifficulty ? (
            <button
              onClick={() => setShowDifficulty(true)}
              className="group relative px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300 active:scale-95 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700" 
              style={{ animationDelay: '300ms' }}
            >
              <span className="relative flex items-center gap-3">
                <Play size={18} /> Start Game
              </span>
            </button>
          ) : !showMapSelect ? (
            <div className="mb-12 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Select Difficulty
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {difficulties.map(diff => (
                  <button
                    key={diff.id}
                    onClick={() => setDifficulty(diff.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      difficulty === diff.id
                        ? `${diff.border} bg-slate-800/80 scale-105 shadow-lg`
                        : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br ${diff.color} flex items-center justify-center`}>
                      <diff.icon size={24} className="text-white" />
                    </div>
                    <div className="text-sm font-bold text-white mb-1">{diff.name}</div>
                    <div className="text-xs text-slate-500">{diff.desc}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleDifficultyNext}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg hover:scale-[1.02] transition-all"
              >
                Next: Select Map
              </button>
            </div>
          ) : (
            <div className="mb-12 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                Select Map
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Object.values(MAPS).map(map => {
                  const MapIcon = mapIcons[map.id];
                  return (
                    <button
                      key={map.id}
                      onClick={() => setSelectedMap(map.id)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        selectedMap === map.id
                          ? 'border-indigo-500 bg-slate-800/80 scale-105 shadow-lg shadow-indigo-900/30'
                          : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-lg ${map.grassColor} flex items-center justify-center border-2 ${map.pathColor.replace('bg-', 'border-')}`}>
                        <MapIcon size={32} className="text-white" />
                      </div>
                      <div className="text-base font-bold text-white mb-1">{map.name}</div>
                      <div className="text-xs text-slate-500 mb-2">{map.description}</div>
                      <div className="text-xs text-slate-400 font-semibold">{map.difficulty}</div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMapSelect(false)}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg hover:scale-[1.02] transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleStart}
                  disabled={!selectedMap}
                  className={`flex-1 py-4 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg hover:scale-[1.02] transition-all ${
                    selectedMap
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white'
                      : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Play size={18} className="inline mr-2" />
                  Start Game
                </button>
              </div>
            </div>
          )}

          {/* Quick Access Menu */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '400ms' }}>
            <MenuCard
              icon={Shield}
              title="Play"
              description="Start mission"
              color="indigo"
              onClick={() => setShowDifficulty(true)}
            />
            <MenuCard
              icon={MapIcon}
              title="Store"
              description="Buy towers"
              color="emerald"
              onClick={() => navigate('/store')}
            />
            <MenuCard
              icon={Cpu}
              title="Deck"
              description="Manage loadout"
              color="purple"
              onClick={() => navigate('/deck')}
            />
            <MenuCard
              icon={Trophy}
              title="Intel"
              description="Enemy info"
              color="rose"
              onClick={() => navigate('/info')}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-[10px] text-slate-600 font-semibold tracking-widest uppercase">
          Version 2.0.4 • Secure Connection
        </div>
      </div>
    </div>
  );
};

const MenuCard = ({ icon: Icon, title, description, color, onClick }) => {
  const colorClasses = {
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:border-indigo-500',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-500',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:border-rose-500',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:border-purple-500',
  };

  return (
    <button
      onClick={onClick}
      className={`bg-slate-900/50 backdrop-blur-sm border-2 p-6 rounded-2xl hover:bg-slate-800/50 transition-all group hover:scale-105 cursor-pointer ${colorClasses[color]}`}
    >
      <div
        className={`w-12 h-12 ${colorClasses[color].split(' ')[0]} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto`}
      >
        <Icon size={24} />
      </div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </button>
  );
};

export default HomePage;
