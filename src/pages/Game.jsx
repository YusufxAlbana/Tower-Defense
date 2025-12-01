import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Heart, Coins, Shield, Zap, Crosshair, Skull, Ghost, Play, Pause,
  RotateCcw, ArrowUpCircle, Target, Flame, Snowflake, TrendingUp,
  XCircle, Info, CheckCircle2, Volume2, VolumeX, Settings, Trophy,
  Swords, Sparkles, Zap as Lightning, Wind
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILS ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- CONSTANTS ---
const GRID_W = 14;
const GRID_H = 9;
const BASE_CELL_SIZE = 64;
const FPS = 60;
const WAVE_INTERVAL = 12;

// Calculate responsive cell size
const getResponsiveCellSize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Mobile portrait
  if (width < 640) {
    return Math.min(
      Math.floor((width - 32) / GRID_W),
      Math.floor((height - 200) / GRID_H)
    );
  }
  // Mobile landscape / Tablet portrait
  if (width < 1024) {
    return Math.min(
      Math.floor((width - 400) / GRID_W),
      Math.floor((height - 160) / GRID_H)
    );
  }
  // Desktop
  return BASE_CELL_SIZE;
};

const CELL_SIZE = getResponsiveCellSize();

const PATH_COORDINATES = [
  { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 2, y: 3 }, { x: 2, y: 2 },
  { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 },
  { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 },
  { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 }, { x: 9, y: 2 },
  { x: 10, y: 2 }, { x: 10, y: 3 }, { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 10, y: 6 },
  { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }
];

const TOWER_TYPES = {
  ARCHER: { 
    id: 'ARCHER', name: 'Ballista', cost: 60, range: 3.5, damage: 15, cooldown: 30, 
    color: 'from-emerald-500 to-teal-600', ringColor: 'text-emerald-500', icon: Crosshair, type: 'physical',
    desc: 'Single Target • High Speed',
    ability: 'MULTISHOT', abilityDesc: 'Shoots 3 arrows at once', abilityCooldown: 180
  },
  CANNON: { 
    id: 'CANNON', name: 'Blaster', cost: 120, range: 2.5, damage: 40, cooldown: 90, splashRadius: 1.5,
    color: 'from-orange-500 to-red-600', ringColor: 'text-orange-500', icon: Flame, type: 'explosive',
    desc: 'Area Damage • Heavy',
    ability: 'NAPALM', abilityDesc: 'Burns ground for 5s', abilityCooldown: 240
  },
  MAGIC: { 
    id: 'MAGIC', name: 'Arcane', cost: 150, range: 4.0, damage: 25, cooldown: 45,
    color: 'from-violet-500 to-indigo-600', ringColor: 'text-purple-500', icon: Zap, type: 'magic',
    desc: 'Long Range • Pierce',
    ability: 'CHAIN_LIGHTNING', abilityDesc: 'Chains to 3 enemies', abilityCooldown: 200
  },
  ICE: { 
    id: 'ICE', name: 'Cryo', cost: 180, range: 3.0, damage: 10, cooldown: 40,
    color: 'from-cyan-400 to-blue-500', ringColor: 'text-cyan-400', icon: Snowflake, type: 'ice',
    desc: 'Crowd Control • Slow',
    ability: 'BLIZZARD', abilityDesc: 'Freezes area for 3s', abilityCooldown: 220
  }
};

const ENEMY_TYPES = {
  GOBLIN: { id: 'GOBLIN', name: 'Scout', hp: 30, speed: 0.045, reward: 8, color: 'bg-green-500', icon: Skull, type: 'ground', armor: 0 },
  ORC: { id: 'ORC', name: 'Tank', hp: 80, speed: 0.025, reward: 15, color: 'bg-red-700', icon: Shield, type: 'ground', armor: 5 },
  SPIRIT: { id: 'SPIRIT', name: 'Wraith', hp: 40, speed: 0.04, reward: 12, color: 'bg-cyan-400', icon: Ghost, type: 'flying', armor: 0 },
  BOSS: { id: 'BOSS', name: 'TITAN', hp: 500, speed: 0.015, reward: 100, color: 'bg-rose-900', icon: Skull, type: 'ground', isBoss: true, armor: 10 },
  SPEEDY: { id: 'SPEEDY', name: 'Runner', hp: 20, speed: 0.065, reward: 10, color: 'bg-yellow-500', icon: Wind, type: 'ground', armor: 0 }
};

const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood', desc: 'Kill your first enemy', icon: Skull },
  { id: 'wave_5', name: 'Survivor', desc: 'Reach wave 5', icon: Shield },
  { id: 'wave_10', name: 'Veteran', desc: 'Reach wave 10', icon: Swords },
  { id: 'wave_20', name: 'Legend', desc: 'Reach wave 20', icon: Trophy },
  { id: 'tower_master', name: 'Tower Master', desc: 'Build 10 towers', icon: Target },
  { id: 'max_tower', name: 'Perfectionist', desc: 'Max upgrade a tower', icon: Sparkles },
  { id: 'rich', name: 'Wealthy', desc: 'Have 1000 gold', icon: Coins },
  { id: 'boss_killer', name: 'Boss Slayer', desc: 'Kill a boss', icon: Lightning }
];

const isPath = (x, y) => PATH_COORDINATES.some(p => p.x === x && p.y === y);
const getDistance = (e1, e2) => Math.sqrt(Math.pow(e1.x - e2.x, 2) + Math.pow(e1.y - e2.y, 2));

// --- SOUND SYSTEM ---
const playSound = (type) => {
  if (!useGameStore.getState().soundEnabled) return;
  const sounds = {
    shoot: () => { const ctx = new AudioContext(); const osc = ctx.createOscillator(); osc.frequency.value = 800; osc.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.05); },
    hit: () => { const ctx = new AudioContext(); const osc = ctx.createOscillator(); osc.frequency.value = 400; osc.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.08); },
    build: () => { const ctx = new AudioContext(); const osc = ctx.createOscillator(); osc.frequency.value = 600; osc.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.1); },
    upgrade: () => { const ctx = new AudioContext(); const osc = ctx.createOscillator(); osc.frequency.value = 1000; osc.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.15); },
    death: () => { const ctx = new AudioContext(); const osc = ctx.createOscillator(); osc.frequency.value = 200; osc.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.2); }
  };
  sounds[type]?.();
};


// --- ZUSTAND STORE WITH PERSISTENCE ---
const useGameStore = create(
  persist(
    (set, get) => ({
      // Game State
      gold: 300, lives: 20, wave: 1, isPlaying: false, gameOver: false, waveTimer: 0,
      enemies: [], towers: [], projectiles: [], particles: [], floatingTexts: [], selectedTile: null, score: 0,
      difficulty: 'normal', // easy, normal, hard
      soundEnabled: true,
      
      // Stats & Achievements
      totalKills: 0,
      totalGoldEarned: 0,
      highestWave: 0,
      towersBuilt: 0,
      achievements: [],
      highScores: [],

      // Actions
      toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),
      setDifficulty: (diff) => set({ difficulty: diff }),
      
      unlockAchievement: (id) => {
        const { achievements } = get();
        if (!achievements.includes(id)) {
          set({ achievements: [...achievements, id] });
          get().addFloatingText(GRID_W / 2, GRID_H / 2, '🏆 Achievement!', 'text-yellow-400 font-black text-lg');
        }
      },

      checkAchievements: () => {
        const { totalKills, wave, towersBuilt, gold, towers, unlockAchievement } = get();
        if (totalKills >= 1) unlockAchievement('first_blood');
        if (wave >= 5) unlockAchievement('wave_5');
        if (wave >= 10) unlockAchievement('wave_10');
        if (wave >= 20) unlockAchievement('wave_20');
        if (towersBuilt >= 10) unlockAchievement('tower_master');
        if (towers.some(t => t.level === 3)) unlockAchievement('max_tower');
        if (gold >= 1000) unlockAchievement('rich');
      },

      startGame: () => set({ isPlaying: true }),
      pauseGame: () => set({ isPlaying: false }),
      
      restartGame: () => {
        const { highestWave, wave, score, highScores } = get();
        const newHighest = Math.max(highestWave, wave);
        const newScores = [...highScores, { score, wave, date: Date.now() }]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        
        set({
          gold: 300, lives: 20, wave: 1, isPlaying: true, gameOver: false,
          waveTimer: WAVE_INTERVAL, enemies: [], towers: [], projectiles: [], 
          particles: [], floatingTexts: [], score: 0, selectedTile: null,
          highestWave: newHighest, highScores: newScores
        });
      },

      selectTile: (x, y) => { 
        const c = get().selectedTile; 
        set({ selectedTile: c && c.x === x && c.y === y ? null : { x, y } }); 
      },
      
      deselect: () => set({ selectedTile: null }),
      
      addFloatingText: (x, y, text, color) => set(s => ({ 
        floatingTexts: [...s.floatingTexts, { id: Math.random(), x, y, text, color, life: 50 }] 
      })),

      buildTower: (typeId) => {
        const { gold, selectedTile, towers, towersBuilt } = get();
        if (!selectedTile || isPath(selectedTile.x, selectedTile.y) || towers.some(t => t.x === selectedTile.x && t.y === selectedTile.y)) return;
        const cfg = TOWER_TYPES[typeId];
        if (gold >= cfg.cost) {
          playSound('build');
          set({ 
            gold: gold - cfg.cost, 
            towersBuilt: towersBuilt + 1,
            towers: [...towers, { 
              id: Math.random().toString(36).substr(2, 9), 
              x: selectedTile.x, y: selectedTile.y, type: typeId, level: 1, 
              cooldown: 0, abilityCooldown: 0,
              range: cfg.range, damage: cfg.damage, maxCooldown: cfg.cooldown, 
              stats: { ...cfg },
              kills: 0
            }], 
            selectedTile: null 
          });
          get().checkAchievements();
        }
      },

      upgradeTower: (towerId) => {
        const { towers, gold, addFloatingText } = get();
        const idx = towers.findIndex(t => t.id === towerId);
        if (idx === -1) return;
        const tower = towers[idx];
        const cost = Math.floor(tower.stats.cost * 1.5 * tower.level);
        if (tower.level < 3 && gold >= cost) {
          playSound('upgrade');
          const upgraded = { 
            ...tower, 
            level: tower.level + 1, 
            damage: Math.floor(tower.damage * 1.4), 
            range: tower.range + 0.5, 
            maxCooldown: Math.max(15, Math.floor(tower.maxCooldown * 0.85)) 
          };
          const newTowers = [...towers]; 
          newTowers[idx] = upgraded;
          set({ gold: gold - cost, towers: newTowers });
          addFloatingText(tower.x, tower.y, "⬆ UPGRADED!", "text-cyan-400 font-bold");
          get().checkAchievements();
        }
      },

      sellTower: (towerId) => {
        const { towers, gold } = get();
        const tower = towers.find(t => t.id === towerId);
        if (!tower) return;
        set({ 
          towers: towers.filter(t => t.id !== towerId), 
          gold: gold + Math.floor(tower.stats.cost * 0.6 * tower.level), 
          selectedTile: null 
        });
      },

      spawnEnemy: (enemyType) => {
        const { wave, difficulty } = get();
        const cfg = ENEMY_TYPES[enemyType];
        const diffMultiplier = { easy: 0.8, normal: 1, hard: 1.3 }[difficulty];
        const hp = Math.floor(cfg.hp * Math.pow(1.15, wave - 1) * diffMultiplier);
        set(s => ({ 
          enemies: [...s.enemies, { 
            id: Math.random().toString(36).substr(2, 9), 
            type: enemyType, pathIndex: 0, 
            x: PATH_COORDINATES[0].x, y: PATH_COORDINATES[0].y, progress: 0, 
            maxHp: hp, hp, 
            baseSpeed: cfg.speed, speed: cfg.speed, 
            reward: cfg.reward, frozen: 0, burning: 0,
            armor: cfg.armor || 0
          }] 
        }));
      },

      useAbility: (towerId) => {
        const { towers, enemies, addFloatingText } = get();
        const tower = towers.find(t => t.id === towerId);
        if (!tower || tower.abilityCooldown > 0) return;

        const newTowers = towers.map(t => {
          if (t.id === towerId) {
            return { ...t, abilityCooldown: t.stats.abilityCooldown };
          }
          return t;
        });

        // Execute ability based on type
        switch (tower.stats.ability) {
          case 'MULTISHOT':
            // Shoot 3 arrows
            const targets = enemies
              .filter(e => getDistance(tower, e) <= tower.range)
              .slice(0, 3);
            targets.forEach(target => {
              get().projectiles.push({
                id: Math.random().toString(),
                x: tower.x, y: tower.y,
                targetId: target.id,
                speed: 0.4,
                damage: tower.damage * 0.8,
                type: tower.stats.type,
                isAbility: true
              });
            });
            break;
          
          case 'CHAIN_LIGHTNING':
            addFloatingText(tower.x, tower.y, '⚡ CHAIN!', 'text-purple-400 font-bold');
            break;
          
          case 'BLIZZARD':
            addFloatingText(tower.x, tower.y, '❄ BLIZZARD!', 'text-cyan-400 font-bold');
            break;
          
          case 'NAPALM':
            addFloatingText(tower.x, tower.y, '🔥 NAPALM!', 'text-orange-400 font-bold');
            break;
        }

        set({ towers: newTowers });
        playSound('upgrade');
      },

      updateGame: () => {
        const state = get();
        if (!state.isPlaying || state.gameOver) return;
        
        let { enemies, towers, projectiles, particles, floatingTexts, lives, gold, score, totalKills, totalGoldEarned } = state;
        let newEnemies = [], newLives = lives, newGameOver = false, newScore = score, newGold = gold;
        let newTotalKills = totalKills;

        // Update Enemies
        enemies.forEach(e => {
          const enemy = { ...e };
          
          // Apply status effects
          if (enemy.frozen > 0) { enemy.frozen--; enemy.speed = enemy.baseSpeed * 0.5; }
          else if (enemy.burning > 0) { enemy.burning--; enemy.hp -= 2; }
          else { enemy.speed = enemy.baseSpeed; }

          if (enemy.pathIndex < PATH_COORDINATES.length - 1) {
            enemy.progress += enemy.speed;
            if (enemy.progress >= 1) { enemy.pathIndex++; enemy.progress -= 1; }
            if (enemy.pathIndex < PATH_COORDINATES.length - 1) {
              const curr = PATH_COORDINATES[enemy.pathIndex], next = PATH_COORDINATES[enemy.pathIndex + 1];
              enemy.x = curr.x + (next.x - curr.x) * enemy.progress;
              enemy.y = curr.y + (next.y - curr.y) * enemy.progress;
              newEnemies.push(enemy);
            } else { newLives--; if (newLives <= 0) newGameOver = true; }
          } else { newLives--; if (newLives <= 0) newGameOver = true; }
        });

        // Towers Shooting & Abilities
        let newProjectiles = [...projectiles];
        const newTowers = towers.map(t => {
          const tower = { ...t };
          if (tower.cooldown > 0) tower.cooldown--;
          if (tower.abilityCooldown > 0) tower.abilityCooldown--;
          
          if (tower.cooldown <= 0) {
            const targets = newEnemies
              .filter(e => {
                const dist = getDistance(tower, e);
                if (e.type === 'SPIRIT' && tower.stats.type !== 'magic') return false;
                return dist <= tower.range;
              })
              .sort((a, b) => (b.pathIndex + b.progress) - (a.pathIndex + a.progress));

            if (targets.length > 0) {
              tower.cooldown = tower.maxCooldown;
              playSound('shoot');
              newProjectiles.push({
                id: Math.random().toString(),
                x: tower.x, y: tower.y,
                targetId: targets[0].id,
                speed: 0.35,
                damage: tower.damage,
                type: tower.stats.type,
                splash: tower.stats.splashRadius || 0,
                isIce: tower.stats.type === 'ice',
                towerId: tower.id
              });
            }
          }
          return tower;
        });

        // Projectiles
        let activeProjectiles = [];
        let newParticles = particles.filter(p => p.life > 0).map(p => ({ ...p, life: p.life - 1 }));
        const enemiesMap = new Map(newEnemies.map(e => [e.id, e]));

        newProjectiles.forEach(p => {
          const target = enemiesMap.get(p.targetId);
          if (!target) return;
          
          const dx = target.x - p.x, dy = target.y - p.y, dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < p.speed) {
            playSound('hit');
            const hit = (id) => {
              const e = enemiesMap.get(id);
              if (e) {
                const actualDamage = Math.max(1, p.damage - e.armor);
                e.hp -= actualDamage;
                if (p.isIce) e.frozen = 90;
                
                newParticles.push({ 
                  id: Math.random(), x: e.x, y: e.y, 
                  color: p.isIce ? 'bg-cyan-300' : 'bg-yellow-300', 
                  life: 10, size: 0.3 
                });
                
                if (e.hp <= 0) {
                  playSound('death');
                  newGold += e.reward;
                  newScore += e.reward * 10;
                  newTotalKills++;
                  totalGoldEarned += e.reward;
                  
                  // Update tower kills
                  if (p.towerId) {
                    const towerIdx = newTowers.findIndex(t => t.id === p.towerId);
                    if (towerIdx !== -1) newTowers[towerIdx].kills++;
                  }
                  
                  state.addFloatingText(e.x, e.y, `+${e.reward}💰`, 'text-yellow-300 font-bold text-sm');
                  
                  if (e.type === 'BOSS') state.unlockAchievement('boss_killer');
                  
                  enemiesMap.delete(id);
                }
              }
            };
            
            if (p.splash > 0) {
              newParticles.push({ 
                id: Math.random(), x: target.x, y: target.y, 
                color: 'bg-orange-500', life: 20, size: p.splash 
              });
              enemiesMap.forEach(e => { 
                if (getDistance(e, target) <= p.splash) hit(e.id); 
              });
            } else {
              hit(target.id);
            }
          } else {
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;
            activeProjectiles.push(p);
          }
        });

        newEnemies = Array.from(enemiesMap.values());
        const activeTexts = floatingTexts.filter(t => t.life > 0).map(t => ({ 
          ...t, y: t.y - 0.02, life: t.life - 1 
        }));

        set({ 
          enemies: newEnemies, towers: newTowers, projectiles: activeProjectiles, 
          particles: newParticles, floatingTexts: activeTexts, lives: newLives, 
          gold: newGold, gameOver: newGameOver, score: newScore,
          totalKills: newTotalKills, totalGoldEarned
        });

        get().checkAchievements();
      }
    }),
    {
      name: 'tower-defense-storage',
      partialize: (state) => ({
        highestWave: state.highestWave,
        achievements: state.achievements,
        highScores: state.highScores,
        totalKills: state.totalKills,
        totalGoldEarned: state.totalGoldEarned,
        towersBuilt: state.towersBuilt,
        soundEnabled: state.soundEnabled,
        difficulty: state.difficulty
      })
    }
  )
);


// --- COMPONENTS ---
const GameEntity = ({ x, y, children, className, zIndex = 20, cellSize = CELL_SIZE }) => (
  <div className={cn("absolute top-0 left-0 flex items-center justify-center pointer-events-none transition-transform duration-100", className)} 
    style={{ width: cellSize, height: cellSize, transform: `translate3d(${x * cellSize}px, ${y * cellSize}px, 0)`, zIndex }}>
    {children}
  </div>
);

const GridCell = ({ x, y, isPathCell, onClick, isSelected, hasTower }) => (
  <div onClick={() => onClick(x, y)} 
    className={cn(
      "w-full h-full relative flex items-center justify-center transition-all duration-200 group",
      isPathCell 
        ? "bg-slate-800/40 border border-slate-700/20" 
        : "bg-slate-900/30 hover:bg-slate-800/50 border border-slate-800/30 hover:border-indigo-500/40 cursor-pointer", 
      isSelected && !isPathCell && "ring-2 ring-indigo-400 ring-inset bg-indigo-500/20 z-10 shadow-[inset_0_0_30px_rgba(99,102,241,0.2)]",
      hasTower && "cursor-pointer"
    )}>
    {isPathCell && (
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(99,102,241,0.08)_0%,_transparent_70%)] opacity-60" />
    )}
    {!isPathCell && !hasTower && (
      <div className={cn(
        "w-1.5 h-1.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-40",
        isSelected ? "bg-indigo-400 scale-150 opacity-80 shadow-[0_0_8px_rgba(99,102,241,0.6)]" : "bg-slate-600"
      )} />
    )}
  </div>
);

const StatPill = ({ icon: Icon, label, value, colorClass, iconColorClass }) => (
  <div className="flex items-center gap-3 bg-slate-900/90 px-5 py-2.5 rounded-xl border border-slate-800/80 shadow-lg min-w-[130px] justify-between hover:scale-105 transition-transform">
    <div className={cn("p-2 rounded-lg", iconColorClass.replace('text-', 'bg-') + '/20')}>
      <Icon size={16} className={iconColorClass} />
    </div>
    <div className="flex flex-col items-end">
      <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">{label}</span>
      <span className={cn("text-xl font-black font-mono leading-none", colorClass)}>{value}</span>
    </div>
  </div>
);

const MobileStatPill = ({ icon: Icon, value, colorClass }) => (
  <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1.5 rounded-lg border border-slate-800/80 shadow-lg">
    <Icon size={12} className={colorClass} />
    <span className={cn("text-sm font-black font-mono leading-none", colorClass)}>{value}</span>
  </div>
);

const TopBar = () => {
  const { gold, lives, wave, score, soundEnabled, toggleSound } = useGameStore();
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="fixed top-0 left-0 right-0 h-16 md:h-20 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl">
      <div className="max-w-[1800px] mx-auto px-3 md:px-6 h-full flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Shield size={isMobile ? 16 : 20} className="text-white" />
          </div>
          {!isMobile && (
            <div>
              <h1 className="text-sm md:text-base font-black text-white tracking-wider">
                DEFENSE<span className="text-indigo-400">GRID</span>
              </h1>
              <span className="text-[7px] md:text-[8px] font-semibold text-slate-500 tracking-widest">COMMAND CENTER</span>
            </div>
          )}
        </button>
        
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="bg-slate-800/60 px-2 md:px-4 py-1.5 md:py-2 rounded-lg border border-slate-700/50 hover:scale-105 transition-transform">
            <div className="text-[7px] md:text-[8px] text-slate-400 font-semibold uppercase tracking-wider text-center">Wave</div>
            <div className="text-lg md:text-2xl font-black text-white leading-none text-center font-mono">{wave}</div>
          </div>
          
          {isMobile ? (
            <>
              <MobileStatPill icon={Coins} value={gold} colorClass="text-yellow-400" />
              <MobileStatPill icon={Heart} value={lives} colorClass="text-rose-400" />
            </>
          ) : (
            <>
              <StatPill icon={Coins} label="Funds" value={gold} colorClass="text-yellow-400" iconColorClass="text-yellow-400" />
              <StatPill icon={Heart} label="Lives" value={lives} colorClass="text-rose-400" iconColorClass="text-rose-400" />
              <StatPill icon={TrendingUp} label="Score" value={score} colorClass="text-emerald-400" iconColorClass="text-emerald-400" />
            </>
          )}
          
          <button 
            onClick={toggleSound}
            className="w-8 h-8 md:w-10 md:h-10 bg-slate-800/80 hover:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-700/50 transition-all hover:scale-110"
          >
            {soundEnabled ? <Volume2 size={isMobile ? 14 : 18} className="text-slate-300" /> : <VolumeX size={isMobile ? 14 : 18} className="text-slate-500" />}
          </button>
          
          {!isMobile && (
            <button 
              onClick={() => setShowStats(!showStats)}
              className="w-10 h-10 bg-slate-800/80 hover:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-700/50 transition-all hover:scale-110"
            >
              <Trophy size={18} className="text-yellow-400" />
            </button>
          )}
        </div>
      </div>
      
      {showStats && (
        <div className="absolute top-full right-6 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl p-4 shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400" /> Achievements
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {ACHIEVEMENTS.map(ach => {
              const unlocked = useGameStore.getState().achievements.includes(ach.id);
              return (
                <div key={ach.id} className={cn("flex items-center gap-3 p-2 rounded-lg", unlocked ? "bg-slate-800/80" : "bg-slate-800/30 opacity-50")}>
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", unlocked ? "bg-yellow-500/20" : "bg-slate-700/50")}>
                    <ach.icon size={16} className={unlocked ? "text-yellow-400" : "text-slate-600"} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white">{ach.name}</div>
                    <div className="text-[10px] text-slate-500">{ach.desc}</div>
                  </div>
                  {unlocked && <CheckCircle2 size={16} className="text-emerald-400" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


const ControlPanel = () => {
  const { selectedTile, towers, buildTower, upgradeTower, sellTower, gold, isPlaying, startGame, pauseGame, restartGame, gameOver, waveTimer, useAbility } = useGameStore();
  const selectedTower = selectedTile ? towers.find(t => t.x === selectedTile.x && t.y === selectedTile.y) : null;
  const canBuild = selectedTile && !selectedTower && !isPath(selectedTile.x, selectedTile.y);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile: Show as bottom sheet
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800/50 shadow-2xl z-40 backdrop-blur-xl max-h-[50vh] flex flex-col">
        <div className="flex-none px-4 py-3 border-b border-slate-800/50 bg-slate-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isPlaying ? "bg-emerald-500" : "bg-amber-500")}></div>
            <span className={cn("text-xs font-bold", isPlaying ? "text-emerald-400" : "text-amber-400")}>
              {isPlaying ? "ACTIVE" : "STANDBY"}
            </span>
          </div>
          {waveTimer > 0 && !isPlaying && (
            <div className="text-right">
              <span className="text-xs text-slate-500 mr-2">Next:</span>
              <span className="text-lg font-mono text-white font-black">{waveTimer}s</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
          {!selectedTile && (
            <div className="text-center py-6 opacity-50">
              <Target size={32} className="mx-auto mb-2 text-slate-500" />
              <p className="text-xs text-slate-500">Select a tile to build</p>
            </div>
          )}

          {canBuild && (
            <div className="grid grid-cols-2 gap-2">
              {Object.values(TOWER_TYPES).map(t => {
                const canAfford = gold >= t.cost;
                return (
                  <button 
                    key={t.id} 
                    disabled={!canAfford} 
                    onClick={() => buildTower(t.id)} 
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                      canAfford 
                        ? "bg-slate-900/80 border-slate-800/80 hover:border-indigo-500/40" 
                        : "bg-slate-900/30 border-slate-800/30 opacity-40"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", t.color)}>
                      <t.icon size={18} className="text-white" />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-white">{t.name}</div>
                      <div className={cn("text-[10px] font-mono font-bold", canAfford ? "text-yellow-400" : "text-red-400")}>
                        {t.cost}G
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {selectedTower && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800/50">
                <div className={cn("w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center", selectedTower.stats.color)}>
                  {React.createElement(selectedTower.stats.icon, { size: 20, className: "text-white" })}
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-white">{selectedTower.stats.name}</h2>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>Lvl {selectedTower.level}</span>
                    <span>•</span>
                    <span>{selectedTower.kills} 💀</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedTower.level < 3 ? (
                  <button 
                    onClick={() => upgradeTower(selectedTower.id)} 
                    disabled={gold < Math.floor(selectedTower.stats.cost * 1.5 * selectedTower.level)} 
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-bold"
                  >
                    Upgrade ({Math.floor(selectedTower.stats.cost * 1.5 * selectedTower.level)}G)
                  </button>
                ) : (
                  <div className="flex-1 py-2.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg text-xs font-bold text-center">
                    MAX
                  </div>
                )}
                <button 
                  onClick={() => sellTower(selectedTower.id)} 
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
                >
                  Sell
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-none p-3 border-t border-slate-800/50">
          {gameOver ? (
            <button 
              onClick={restartGame} 
              className="w-full bg-rose-600 hover:bg-rose-500 text-white h-11 rounded-lg font-bold text-xs uppercase"
            >
              Restart
            </button>
          ) : (
            <button 
              onClick={isPlaying ? pauseGame : startGame} 
              className={cn(
                "w-full h-11 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2",
                isPlaying 
                  ? "bg-slate-800 hover:bg-slate-700 text-white" 
                  : "bg-emerald-500 hover:bg-emerald-400 text-white"
              )}
            >
              {isPlaying ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Desktop: Show as sidebar
  return (
    <div className="w-[360px] min-w-[360px] bg-slate-950/95 border-l border-slate-800/50 flex flex-col shadow-2xl relative z-40 h-full backdrop-blur-xl">
      <div className="flex-none h-16 px-5 border-b border-slate-800/50 bg-slate-900/30 flex items-center justify-between">
        <div>
          <div className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Status</div>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isPlaying ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-amber-500 shadow-[0_0_8px_#f59e0b]")}></div>
            <span className={cn("text-xs font-bold", isPlaying ? "text-emerald-400" : "text-amber-400")}>
              {isPlaying ? "ACTIVE" : "STANDBY"}
            </span>
          </div>
        </div>
        {waveTimer > 0 && !isPlaying && (
          <div className="text-right">
            <div className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest">Next Wave</div>
            <div className="text-xl font-mono text-white font-black animate-pulse">{waveTimer}s</div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24 custom-scrollbar">
        {!selectedTile && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center mb-4 animate-pulse">
              <Target size={24} className="text-slate-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-300 mb-1">Select a Tile</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Click on an empty tile to build towers</p>
          </div>
        )}

        {canBuild && (
          <div className="animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpCircle size={12} className="text-indigo-400" />
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Build Tower</h3>
            </div>
            <div className="space-y-2">
              {Object.values(TOWER_TYPES).map(t => {
                const canAfford = gold >= t.cost;
                return (
                  <button 
                    key={t.id} 
                    disabled={!canAfford} 
                    onClick={() => buildTower(t.id)} 
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left group relative overflow-hidden",
                      canAfford 
                        ? "bg-slate-900/80 border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-800/80 hover:scale-[1.02]" 
                        : "bg-slate-900/30 border-slate-800/30 opacity-40 cursor-not-allowed"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex-shrink-0 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform", t.color)}>
                      <t.icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-slate-200 text-sm">{t.name}</span>
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-mono font-bold flex items-center gap-1",
                          canAfford ? "bg-slate-950/80 text-yellow-400" : "text-red-400"
                        )}>
                          <Coins size={8} />{t.cost}
                        </div>
                      </div>
                      <div className="text-[9px] font-medium text-slate-500 uppercase">{t.desc}</div>
                      <div className="text-[8px] text-indigo-400 mt-1 flex items-center gap-1">
                        <Sparkles size={8} /> {t.abilityDesc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedTower && (
          <div className="animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Info size={12} className="text-indigo-400" />
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tower Info</h3>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 space-y-4">
              {/* Tower Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800/50">
                <div className={cn("w-12 h-12 rounded-lg bg-gradient-to-br flex-shrink-0 flex items-center justify-center shadow-lg relative", selectedTower.stats.color)}>
                  {React.createElement(selectedTower.stats.icon, { size: 20, className: "text-white" })}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-950 border border-slate-700 rounded-full flex items-center justify-center text-[8px] font-bold text-white">
                    {selectedTower.level}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-white">{selectedTower.stats.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-1.5 py-0.5 bg-slate-800/80 rounded text-[8px] font-bold text-slate-400 uppercase">
                      Lvl {selectedTower.level}
                    </span>
                    <span className="text-[8px] font-semibold text-slate-500 uppercase">
                      {selectedTower.stats.type}
                    </span>
                    <span className="text-[8px] font-semibold text-emerald-400 ml-auto">
                      {selectedTower.kills} 💀
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                {[
                  { l: 'Damage', v: selectedTower.damage, m: 100, c: 'bg-rose-500', icon: Swords },
                  { l: 'Range', v: selectedTower.range.toFixed(1), m: 6, c: 'bg-blue-500', icon: Target },
                  { l: 'Speed', v: (60 / selectedTower.maxCooldown).toFixed(1), m: 3, c: 'bg-amber-500', icon: Zap }
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[8px] font-semibold text-slate-500 uppercase mb-1">
                      <span className="flex items-center gap-1">
                        <s.icon size={10} /> {s.l}
                      </span>
                      <span className="text-slate-300 font-mono">{s.v}</span>
                    </div>
                    <div className="h-1.5 bg-slate-950/80 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", s.c)} 
                        style={{ width: `${Math.min(100, (parseFloat(s.v) / s.m) * 100)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Ability */}
              <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-indigo-400" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Ability</span>
                  </div>
                  {selectedTower.abilityCooldown > 0 && (
                    <span className="text-[9px] font-mono text-amber-400">
                      {Math.ceil(selectedTower.abilityCooldown / FPS)}s
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-slate-500 mb-2">{selectedTower.stats.abilityDesc}</p>
                <button
                  onClick={() => useAbility(selectedTower.id)}
                  disabled={selectedTower.abilityCooldown > 0}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all disabled:cursor-not-allowed"
                >
                  {selectedTower.abilityCooldown > 0 ? 'Cooldown...' : 'Use Ability'}
                </button>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {selectedTower.level < 3 ? (
                  <button 
                    onClick={() => upgradeTower(selectedTower.id)} 
                    disabled={gold < Math.floor(selectedTower.stats.cost * 1.5 * selectedTower.level)} 
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white rounded-lg text-[10px] font-bold flex items-center justify-between px-4 transition-all hover:scale-[1.02]"
                  >
                    <span className="flex items-center gap-2 uppercase">
                      <TrendingUp size={12} /> Upgrade
                    </span>
                    <span className="font-mono bg-black/20 px-2 py-0.5 rounded">
                      {Math.floor(selectedTower.stats.cost * 1.5 * selectedTower.level)}G
                    </span>
                  </button>
                ) : (
                  <div className="w-full py-2.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 text-yellow-400 rounded-lg text-[10px] font-bold text-center uppercase flex items-center justify-center gap-2">
                    <Sparkles size={10} /> Max Level
                  </div>
                )}
                
                <button 
                  onClick={() => sellTower(selectedTower.id)} 
                  className="w-full py-2 bg-transparent hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 border border-slate-800/50 hover:border-rose-500/30 rounded-lg text-[10px] font-bold flex items-center justify-center gap-2 uppercase transition-all"
                >
                  <XCircle size={10} /> Sell (+{Math.floor(selectedTower.stats.cost * 0.6 * selectedTower.level)}G)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-slate-800/50 bg-slate-950/95 backdrop-blur-xl">
        {gameOver ? (
          <button 
            onClick={restartGame} 
            className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white h-11 rounded-lg font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 hover:scale-[1.02] transition-all"
          >
            <RotateCcw size={14} /> Restart Game
          </button>
        ) : (
          <button 
            onClick={isPlaying ? pauseGame : startGame} 
            className={cn(
              "w-full h-11 rounded-lg font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02]",
              isPlaying 
                ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/50" 
                : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-900/30"
            )}
          >
            {isPlaying ? <><Pause size={14} /> Pause Game</> : <><Play size={14} /> Start Wave</>}
          </button>
        )}
      </div>
    </div>
  );
};


const GameLoop = () => {
  const store = useGameStore();
  const waveTimerRef = useRef(0);
  const animationRef = useRef();

  useEffect(() => {
    const loop = () => {
      store.updateGame();
      
      if (store.isPlaying && !store.gameOver) {
        if (store.enemies.length === 0 && waveTimerRef.current <= 0) {
          waveTimerRef.current = WAVE_INTERVAL * FPS;
        }
        
        if (waveTimerRef.current > 0) {
          waveTimerRef.current--;
          if (waveTimerRef.current % 60 === 0) {
            useGameStore.setState({ waveTimer: Math.ceil(waveTimerRef.current / 60) });
          }
          
          if (waveTimerRef.current === 0) {
            const nextWave = store.wave + 1;
            useGameStore.setState({ wave: nextWave, waveTimer: 0 });
            
            const count = 5 + Math.floor(nextWave * 1.5);
            const enemies = [];
            
            for (let i = 0; i < count; i++) {
              let type = 'GOBLIN';
              const rand = Math.random();
              
              if (nextWave >= 2 && rand > 0.7) type = 'ORC';
              if (nextWave >= 3 && rand > 0.85) type = 'SPEEDY';
              if (nextWave >= 4 && rand > 0.9) type = 'SPIRIT';
              if (nextWave >= 5 && nextWave % 5 === 0 && i === count - 1) type = 'BOSS';
              
              enemies.push(type);
            }
            
            enemies.forEach((type, idx) => {
              setTimeout(() => {
                if (!useGameStore.getState().gameOver) {
                  useGameStore.getState().spawnEnemy(type);
                }
              }, idx * 700);
            });
          }
        }
      }
      
      animationRef.current = requestAnimationFrame(loop);
    };
    
    if (store.isPlaying) loop();
    return () => cancelAnimationFrame(animationRef.current);
  }, [store.isPlaying, store.gameOver]);

  return null;
};

// --- MAIN GAME PAGE ---
const GamePage = () => {
  const { enemies, towers, projectiles, particles, floatingTexts, selectedTile, selectTile, gameOver, restartGame, deselect, score, wave } = useGameStore();
  const navigate = useNavigate();
  const [cellSize, setCellSize] = useState(CELL_SIZE);

  useEffect(() => {
    const handleResize = () => {
      const newSize = getResponsiveCellSize();
      setCellSize(newSize);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-screen bg-[#020617] flex flex-col font-sans select-none overflow-hidden text-slate-200">
      <GameLoop />
      <TopBar />

      <div className="flex-1 flex overflow-hidden pt-16 md:pt-20 pb-0 lg:pb-0">
        <div className="flex-1 relative flex items-center justify-center overflow-hidden p-2 md:p-4 lg:p-6" onClick={deselect}>
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_90%)] opacity-80 pointer-events-none"></div>
          
          {/* Ambient Glow */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

          {/* Game Board */}
          <div 
            className="relative shadow-[0_0_100px_-20px_rgba(99,102,241,0.3)] bg-[#0f172a] border border-slate-800 md:border-2 rounded-lg md:rounded-2xl overflow-hidden ring-1 ring-slate-700/50 transition-all duration-300 hover:shadow-[0_0_120px_-20px_rgba(99,102,241,0.4)]" 
            style={{ 
              width: GRID_W * cellSize, 
              height: GRID_H * cellSize,
              maxWidth: '100%',
              maxHeight: '100%'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grid Layer */}
            <div 
              className="relative z-10 grid" 
              style={{ 
                gridTemplateColumns: `repeat(${GRID_W}, ${cellSize}px)`, 
                gridTemplateRows: `repeat(${GRID_H}, ${cellSize}px)` 
              }}
            >
              {Array.from({ length: GRID_H }).map((_, y) => 
                Array.from({ length: GRID_W }).map((_, x) => (
                  <GridCell 
                    key={`${x}-${y}`} 
                    x={x} y={y} 
                    isPathCell={isPath(x, y)} 
                    isSelected={selectedTile?.x === x && selectedTile?.y === y} 
                    hasTower={towers.some(t => t.x === x && t.y === y)} 
                    onClick={selectTile} 
                  />
                ))
              )}
            </div>

            {/* Towers */}
            {towers.map(tower => {
              const isSelected = selectedTile?.x === tower.x && selectedTile?.y === tower.y;
              const Icon = tower.stats.icon;
              const towerSize = Math.max(32, cellSize * 0.75);
              return (
                <GameEntity key={tower.id} x={tower.x} y={tower.y} zIndex={15} cellSize={cellSize}>
                  <div 
                    onClick={(e) => { e.stopPropagation(); selectTile(tower.x, tower.y); }} 
                    className={cn(
                      "rounded-lg md:rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 bg-gradient-to-br border cursor-pointer relative hover:-translate-y-1 hover:shadow-xl",
                      tower.stats.color,
                      isSelected ? "border-white ring-2 md:ring-4 ring-white/30 scale-110 z-20 shadow-2xl" : "border-white/20 hover:border-white/40"
                    )}
                    style={{ width: towerSize, height: towerSize }}
                  >
                    <Icon size={Math.max(16, towerSize * 0.5)} className="text-white drop-shadow-lg" />
                    <div 
                      className="absolute -top-1 md:-top-2 -right-1 md:-right-2 bg-slate-950 border border-slate-700 md:border-2 rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-bold text-white shadow-md"
                      style={{ width: Math.max(16, towerSize * 0.3), height: Math.max(16, towerSize * 0.3) }}
                    >
                      {tower.level}
                    </div>
                    {tower.abilityCooldown === 0 && tower.level >= 2 && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                        <Sparkles size={Math.max(8, cellSize * 0.2)} className="text-yellow-400 animate-pulse" />
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div 
                      className={cn("absolute rounded-full border border-white/40 md:border-2 bg-white/5 animate-pulse pointer-events-none", tower.stats.ringColor)} 
                      style={{ 
                        width: tower.range * 2 * cellSize, 
                        height: tower.range * 2 * cellSize, 
                        zIndex: -1 
                      }} 
                    />
                  )}
                </GameEntity>
              );
            })}

            {/* Enemies */}
            {enemies.map(enemy => {
              const enemySize = enemy.type === 'BOSS' ? Math.max(36, cellSize * 0.75) : Math.max(24, cellSize * 0.5);
              return (
              <GameEntity key={enemy.id} x={enemy.x} y={enemy.y} zIndex={20} cellSize={cellSize}>
                <div className="relative">
                  {/* HP Bar */}
                  <div 
                    className="absolute left-1/2 -translate-x-1/2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-sm"
                    style={{ 
                      top: -Math.max(8, cellSize * 0.15), 
                      width: Math.max(24, cellSize * 0.6), 
                      height: Math.max(3, cellSize * 0.08) 
                    }}
                  >
                    <div 
                      className={cn(
                        "h-full transition-all duration-200",
                        (enemy.hp / enemy.maxHp) > 0.6 ? "bg-emerald-500" : 
                        (enemy.hp / enemy.maxHp) > 0.3 ? "bg-yellow-500" : "bg-rose-500"
                      )} 
                      style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} 
                    />
                  </div>
                  
                  {/* Enemy Icon */}
                  <div 
                    className={cn(
                      "rounded-full flex items-center justify-center shadow-lg border border-slate-900/50 md:border-2 relative transition-all",
                      enemy.type === 'BOSS' ? "animate-pulse" : "",
                      enemy.frozen > 0 ? "ring-1 md:ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]" : "",
                      enemy.burning > 0 ? "ring-1 md:ring-2 ring-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.6)]" : "",
                      ENEMY_TYPES[enemy.type].color
                    )}
                    style={{ width: enemySize, height: enemySize }}
                  >
                    {React.createElement(ENEMY_TYPES[enemy.type].icon, { 
                      size: Math.max(12, enemySize * 0.5), 
                      className: "text-white drop-shadow-md" 
                    })}
                    {enemy.frozen > 0 && <Snowflake size={Math.max(8, cellSize * 0.15)} className="absolute -right-1 -bottom-1 text-cyan-200 animate-spin" />}
                    {enemy.burning > 0 && <Flame size={Math.max(8, cellSize * 0.15)} className="absolute -right-1 -bottom-1 text-orange-400 animate-pulse" />}
                    {enemy.armor > 0 && (
                      <div 
                        className="absolute -top-1 -left-1 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700"
                        style={{ width: Math.max(12, enemySize * 0.3), height: Math.max(12, enemySize * 0.3) }}
                      >
                        <Shield size={Math.max(6, enemySize * 0.2)} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
              </GameEntity>
            );
            })}

            {/* Projectiles */}
            {projectiles.map(p => (
              <GameEntity key={p.id} x={p.x} y={p.y} zIndex={30} className="w-0 h-0" cellSize={cellSize}>
                <div 
                  className={cn(
                    "rounded-full shadow-lg transition-all",
                    p.isIce ? "bg-cyan-300 shadow-cyan-500/60" : 
                    p.isAbility ? "bg-purple-400 shadow-purple-500/60" :
                    "bg-yellow-300 shadow-orange-500/60"
                  )} 
                  style={{ 
                    width: Math.max(6, cellSize * (p.isAbility ? 0.15 : 0.12)), 
                    height: Math.max(6, cellSize * (p.isAbility ? 0.15 : 0.12)) 
                  }} 
                />
              </GameEntity>
            ))}

            {/* Particles */}
            {particles.map(p => (
              <GameEntity key={p.id} x={p.x} y={p.y} zIndex={35} className="w-0 h-0" cellSize={cellSize}>
                <div 
                  className={cn("rounded-full animate-ping opacity-75 absolute", p.color)} 
                  style={{ 
                    width: (p.size || 0.5) * cellSize, 
                    height: (p.size || 0.5) * cellSize 
                  }} 
                />
              </GameEntity>
            ))}

            {/* Floating Texts */}
            {floatingTexts.map(t => (
              <div 
                key={t.id} 
                className={cn("absolute z-50 pointer-events-none font-bold drop-shadow-lg", t.color)} 
                style={{ 
                  left: t.x * cellSize + cellSize / 2, 
                  top: t.y * cellSize, 
                  transform: 'translate(-50%, -100%)', 
                  opacity: t.life / 50,
                  fontSize: t.text.includes('🏆') ? `${Math.max(12, cellSize * 0.25)}px` : `${Math.max(10, cellSize * 0.18)}px`
                }}
              >
                {t.text}
              </div>
            ))}
          </div>

          {/* Game Over Modal */}
          {gameOver && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center animate-in fade-in duration-500 p-4">
              <div className="text-center space-y-4 md:space-y-6 max-w-md w-full">
                <h2 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-rose-500 via-rose-600 to-rose-900 drop-shadow-2xl animate-pulse">
                  DEFEAT
                </h2>
                <div className="text-slate-400 text-sm md:text-base font-medium tracking-[0.2em] uppercase">
                  Defense System Offline
                </div>
                
                {/* Final Stats */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 md:p-6 space-y-3">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-slate-500">Final Wave</span>
                    <span className="text-white font-bold">{wave}</span>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-slate-500">Final Score</span>
                    <span className="text-emerald-400 font-bold">{score}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button 
                    onClick={restartGame} 
                    className="flex-1 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs md:text-sm tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg shadow-indigo-900/30"
                  >
                    <RotateCcw size={14} className="inline mr-2" />
                    RESTART
                  </button>
                  <button 
                    onClick={() => navigate('/')} 
                    className="flex-1 px-6 md:px-8 py-3 md:py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs md:text-sm tracking-widest rounded-xl hover:scale-105 transition-all"
                  >
                    HOME
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {window.innerWidth >= 1024 && <ControlPanel />}
      </div>
      
      {window.innerWidth < 1024 && <ControlPanel />}
    </div>
  );
};

export default GamePage;
