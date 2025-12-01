import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Skull, Coins, TrendingUp, Home, RotateCcw } from 'lucide-react';
import { usePlayerStore } from '../store/gameStore';
import { savePlayerData, getCurrentUser } from '../firebase';

const GameStats = ({ stats, onRestart, onHome }) => {
  const { wave, kills, goldEarned, difficulty, mapName } = stats;
  const { addCoins, updateStats, getPlayerData } = usePlayerStore();

  useEffect(() => {
    // Add coins and update stats
    addCoins(goldEarned);
    updateStats(wave, kills);
    
    // Save to Firebase
    const user = getCurrentUser();
    if (user) {
      setTimeout(() => {
        const data = getPlayerData();
        savePlayerData(user.uid, data);
      }, 500);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/90 border-2 border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">GAME OVER</h2>
          <p className="text-slate-400">Mission Complete</p>
        </div>

        <div className="space-y-4 mb-6">
          <StatRow icon={TrendingUp} label="Waves Survived" value={wave} color="text-indigo-400" />
          <StatRow icon={Skull} label="Enemies Killed" value={kills} color="text-rose-400" />
          <StatRow icon={Coins} label="Gold Earned" value={goldEarned} color="text-yellow-400" />
          
          <div className="pt-4 border-t border-slate-800">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Difficulty:</span>
              <span className="text-white font-bold capitalize">{difficulty}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-slate-500">Map:</span>
              <span className="text-white font-bold">{mapName}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onHome}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Home
          </button>
          <button
            onClick={onRestart}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Restart
          </button>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center justify-between bg-slate-950/50 p-4 rounded-lg">
    <div className="flex items-center gap-3">
      <Icon size={20} className={color} />
      <span className="text-slate-300">{label}</span>
    </div>
    <span className={`text-2xl font-black font-mono ${color}`}>{value}</span>
  </div>
);

export default GameStats;
