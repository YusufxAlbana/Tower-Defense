import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Crosshair, Flame, Zap, Snowflake, Target, Droplet, 
  Sword, Shield, Wind, Sun, Moon, Star, Sparkles,
  Bomb, Rocket, Anchor, Crown, Diamond, Heart,
  Skull, Ghost, Eye, Radio, Wifi, Magnet,
  Tornado, CloudLightning, Waves, Mountain, Gem, Atom
} from 'lucide-react';

// Map Configurations
export const MAPS = {
  FOREST: {
    id: 'FOREST',
    name: 'Forest Path',
    description: 'A winding path through the forest',
    difficulty: 'Easy',
    pathColor: 'bg-amber-800',
    grassColor: 'bg-emerald-800',
    path: [
      { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 2, y: 3 }, { x: 2, y: 2 },
      { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 },
      { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 },
      { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 }, { x: 9, y: 2 },
      { x: 10, y: 2 }, { x: 10, y: 3 }, { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 10, y: 6 },
      { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }
    ]
  },
  DESERT: {
    id: 'DESERT',
    name: 'Desert Canyon',
    description: 'A narrow canyon path',
    difficulty: 'Medium',
    pathColor: 'bg-orange-900',
    grassColor: 'bg-yellow-700',
    path: [
      { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 3, y: 6 },
      { x: 3, y: 5 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
      { x: 7, y: 4 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 }, { x: 9, y: 2 },
      { x: 10, y: 2 }, { x: 11, y: 2 }, { x: 11, y: 3 }, { x: 11, y: 4 }, { x: 11, y: 5 },
      { x: 12, y: 5 }, { x: 13, y: 5 }
    ]
  },
  VOLCANO: {
    id: 'VOLCANO',
    name: 'Volcanic Ridge',
    description: 'A dangerous volcanic path',
    difficulty: 'Hard',
    pathColor: 'bg-red-950',
    grassColor: 'bg-stone-800',
    path: [
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
      { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 5, y: 5 },
      { x: 5, y: 6 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 },
      { x: 9, y: 7 }, { x: 10, y: 7 }, { x: 10, y: 6 }, { x: 10, y: 5 }, { x: 10, y: 4 },
      { x: 11, y: 4 }, { x: 12, y: 4 }, { x: 13, y: 4 }
    ]
  }
};

// Difficulty Multipliers
export const DIFFICULTY_CONFIG = {
  easy: {
    enemyHpMultiplier: 0.7,
    enemySpeedMultiplier: 0.8,
    goldMultiplier: 1.5,
    startingGold: 400,
    startingLives: 25
  },
  normal: {
    enemyHpMultiplier: 1.0,
    enemySpeedMultiplier: 1.0,
    goldMultiplier: 1.0,
    startingGold: 300,
    startingLives: 20
  },
  hard: {
    enemyHpMultiplier: 1.5,
    enemySpeedMultiplier: 1.2,
    goldMultiplier: 0.8,
    startingGold: 250,
    startingLives: 15
  }
};

// Tower Types (for game logic) - 30 Towers
export const TOWER_TYPES = {
  // === STARTER TOWERS (Free) ===
  ARCHER: { 
    id: 'ARCHER', name: 'Ballista', cost: 60, range: 3.5, damage: 15, cooldown: 30, 
    color: 'from-emerald-500 to-teal-600', ringColor: 'text-emerald-500', icon: Crosshair, type: 'physical',
    desc: 'Single Target • High Speed', category: 'starter'
  },
  CANNON: { 
    id: 'CANNON', name: 'Blaster', cost: 100, range: 2.5, damage: 40, cooldown: 90, splashRadius: 1.5,
    color: 'from-orange-500 to-red-600', ringColor: 'text-orange-500', icon: Flame, type: 'explosive',
    desc: 'Area Damage • Heavy', category: 'starter'
  },
  ICE: { 
    id: 'ICE', name: 'Cryo', cost: 150, range: 3.0, damage: 10, cooldown: 40,
    color: 'from-cyan-400 to-blue-500', ringColor: 'text-cyan-400', icon: Snowflake, type: 'ice',
    desc: 'Crowd Control • Slow', category: 'starter'
  },
  
  // === BASIC TOWERS ===
  MAGIC: { 
    id: 'MAGIC', name: 'Arcane', cost: 150, range: 4.0, damage: 25, cooldown: 45,
    color: 'from-violet-500 to-indigo-600', ringColor: 'text-purple-500', icon: Zap, type: 'magic',
    desc: 'Long Range • Pierce', category: 'basic'
  },
  POISON: {
    id: 'POISON', name: 'Toxin', cost: 200, range: 2.8, damage: 8, cooldown: 35,
    color: 'from-lime-500 to-green-600', ringColor: 'text-lime-500', icon: Droplet, type: 'poison',
    desc: 'Damage Over Time', category: 'basic'
  },
  
  // === ADVANCED TOWERS ===
  SNIPER: {
    id: 'SNIPER', name: 'Railgun', cost: 250, range: 6.0, damage: 100, cooldown: 120,
    color: 'from-red-500 to-rose-600', ringColor: 'text-red-500', icon: Target, type: 'physical',
    desc: 'Extreme Range • Crit', category: 'advanced'
  },
  TESLA: {
    id: 'TESLA', name: 'Tesla Coil', cost: 220, range: 3.0, damage: 20, cooldown: 25,
    color: 'from-yellow-400 to-amber-500', ringColor: 'text-yellow-400', icon: CloudLightning, type: 'electric',
    desc: 'Chain Lightning • Fast', category: 'advanced'
  },
  WIND: {
    id: 'WIND', name: 'Gale Force', cost: 180, range: 3.5, damage: 12, cooldown: 20,
    color: 'from-sky-400 to-cyan-500', ringColor: 'text-sky-400', icon: Wind, type: 'wind',
    desc: 'Knockback • Multi-hit', category: 'advanced'
  },
  BOMB: {
    id: 'BOMB', name: 'Demolisher', cost: 280, range: 2.0, damage: 80, cooldown: 150, splashRadius: 2.0,
    color: 'from-gray-600 to-slate-700', ringColor: 'text-gray-400', icon: Bomb, type: 'explosive',
    desc: 'Massive AoE • Slow', category: 'advanced'
  },
  LASER: {
    id: 'LASER', name: 'Beam Cannon', cost: 300, range: 5.0, damage: 5, cooldown: 5,
    color: 'from-red-400 to-pink-500', ringColor: 'text-red-400', icon: Radio, type: 'energy',
    desc: 'Continuous Beam • DPS', category: 'advanced'
  },
  
  // === ELEMENTAL TOWERS ===
  FIRE: {
    id: 'FIRE', name: 'Inferno', cost: 240, range: 2.5, damage: 35, cooldown: 60, splashRadius: 1.2,
    color: 'from-orange-600 to-red-700', ringColor: 'text-orange-500', icon: Flame, type: 'fire',
    desc: 'Burn DoT • AoE', category: 'elemental'
  },
  STORM: {
    id: 'STORM', name: 'Tempest', cost: 320, range: 4.0, damage: 30, cooldown: 80,
    color: 'from-purple-500 to-violet-600', ringColor: 'text-purple-400', icon: Tornado, type: 'storm',
    desc: 'Random Targets • Stun', category: 'elemental'
  },
  EARTH: {
    id: 'EARTH', name: 'Quake', cost: 260, range: 2.0, damage: 50, cooldown: 100, splashRadius: 1.8,
    color: 'from-amber-700 to-yellow-800', ringColor: 'text-amber-600', icon: Mountain, type: 'earth',
    desc: 'Ground Pound • Stun', category: 'elemental'
  },
  WATER: {
    id: 'WATER', name: 'Tsunami', cost: 280, range: 3.5, damage: 25, cooldown: 70,
    color: 'from-blue-500 to-indigo-600', ringColor: 'text-blue-400', icon: Waves, type: 'water',
    desc: 'Wave Attack • Slow', category: 'elemental'
  },
  
  // === SUPPORT TOWERS ===
  BUFF: {
    id: 'BUFF', name: 'War Banner', cost: 200, range: 3.0, damage: 0, cooldown: 0,
    color: 'from-yellow-500 to-orange-500', ringColor: 'text-yellow-400', icon: Crown, type: 'support',
    desc: 'Buff Nearby • +25% DMG', category: 'support'
  },
  SLOW: {
    id: 'SLOW', name: 'Time Warp', cost: 220, range: 3.5, damage: 0, cooldown: 0,
    color: 'from-indigo-400 to-purple-500', ringColor: 'text-indigo-400', icon: Moon, type: 'support',
    desc: 'Slow Aura • -40% Speed', category: 'support'
  },
  GOLD: {
    id: 'GOLD', name: 'Treasury', cost: 350, range: 2.0, damage: 0, cooldown: 0,
    color: 'from-yellow-400 to-amber-500', ringColor: 'text-yellow-300', icon: Diamond, type: 'support',
    desc: 'Gold Generator • +5/wave', category: 'support'
  },
  HEAL: {
    id: 'HEAL', name: 'Sanctuary', cost: 400, range: 0, damage: 0, cooldown: 0,
    color: 'from-pink-400 to-rose-500', ringColor: 'text-pink-400', icon: Heart, type: 'support',
    desc: 'Heal Base • +1 Life/wave', category: 'support'
  },
  
  // === SPECIAL TOWERS ===
  VOID: {
    id: 'VOID', name: 'Void Rift', cost: 400, range: 3.0, damage: 60, cooldown: 100,
    color: 'from-purple-900 to-black', ringColor: 'text-purple-300', icon: Ghost, type: 'void',
    desc: 'Ignore Armor • Teleport', category: 'special'
  },
  SOLAR: {
    id: 'SOLAR', name: 'Sun Spire', cost: 380, range: 4.5, damage: 45, cooldown: 80,
    color: 'from-yellow-300 to-orange-400', ringColor: 'text-yellow-300', icon: Sun, type: 'light',
    desc: 'Blind Enemies • Crit', category: 'special'
  },
  LUNAR: {
    id: 'LUNAR', name: 'Moon Tower', cost: 360, range: 4.0, damage: 35, cooldown: 60,
    color: 'from-slate-300 to-blue-400', ringColor: 'text-slate-300', icon: Moon, type: 'dark',
    desc: 'Night Bonus • Lifesteal', category: 'special'
  },
  STAR: {
    id: 'STAR', name: 'Starfall', cost: 450, range: 5.0, damage: 70, cooldown: 120,
    color: 'from-indigo-300 to-purple-400', ringColor: 'text-indigo-300', icon: Star, type: 'cosmic',
    desc: 'Random Strike • High DMG', category: 'special'
  },
  
  // === LEGENDARY TOWERS ===
  PLASMA: {
    id: 'PLASMA', name: 'Plasma Core', cost: 500, range: 4.0, damage: 55, cooldown: 50,
    color: 'from-cyan-300 to-blue-500', ringColor: 'text-cyan-300', icon: Atom, type: 'plasma',
    desc: 'Penetrate • Chain', category: 'legendary'
  },
  DEATH: {
    id: 'DEATH', name: 'Reaper', cost: 550, range: 3.5, damage: 999, cooldown: 300,
    color: 'from-gray-800 to-black', ringColor: 'text-gray-400', icon: Skull, type: 'death',
    desc: 'Execute <20% HP', category: 'legendary'
  },
  CRYSTAL: {
    id: 'CRYSTAL', name: 'Prism', cost: 480, range: 4.5, damage: 40, cooldown: 40,
    color: 'from-pink-300 to-purple-400', ringColor: 'text-pink-300', icon: Gem, type: 'crystal',
    desc: 'Split Shot • Reflect', category: 'legendary'
  },
  GRAVITY: {
    id: 'GRAVITY', name: 'Singularity', cost: 520, range: 3.0, damage: 30, cooldown: 80, splashRadius: 2.5,
    color: 'from-violet-600 to-purple-900', ringColor: 'text-violet-400', icon: Magnet, type: 'gravity',
    desc: 'Pull Enemies • AoE', category: 'legendary'
  },
  ROCKET: {
    id: 'ROCKET', name: 'Missile Silo', cost: 600, range: 6.0, damage: 120, cooldown: 180, splashRadius: 2.0,
    color: 'from-red-600 to-orange-600', ringColor: 'text-red-500', icon: Rocket, type: 'explosive',
    desc: 'Homing • Massive DMG', category: 'legendary'
  },
  
  // === MYTHIC TOWERS ===
  OMEGA: {
    id: 'OMEGA', name: 'Omega Cannon', cost: 800, range: 5.5, damage: 200, cooldown: 200,
    color: 'from-amber-400 to-yellow-500', ringColor: 'text-amber-300', icon: Sparkles, type: 'ultimate',
    desc: 'Ultimate Power • Nuke', category: 'mythic'
  },
  DIVINE: {
    id: 'DIVINE', name: 'Divine Light', cost: 750, range: 5.0, damage: 80, cooldown: 60,
    color: 'from-yellow-200 to-amber-300', ringColor: 'text-yellow-200', icon: Sun, type: 'holy',
    desc: 'Holy Damage • Heal Ally', category: 'mythic'
  },
  CHAOS: {
    id: 'CHAOS', name: 'Chaos Engine', cost: 700, range: 4.0, damage: 50, cooldown: 30,
    color: 'from-red-500 to-purple-600', ringColor: 'text-red-400', icon: Atom, type: 'chaos',
    desc: 'Random Effects • Wild', category: 'mythic'
  }
};

// Tower Shop Items - 30 Towers
export const SHOP_TOWERS = {
  // === STARTER (Free) ===
  ARCHER: { id: 'ARCHER', name: 'Ballista', price: 0, damage: 15, range: 3.5, cooldown: 30,
    description: 'Fast single-target tower. Great for early waves.', category: 'starter' },
  CANNON: { id: 'CANNON', name: 'Blaster', price: 0, damage: 40, range: 2.5, cooldown: 90,
    description: 'Explosive area damage. Perfect for grouped enemies.', category: 'starter' },
  ICE: { id: 'ICE', name: 'Cryo', price: 0, damage: 10, range: 3.0, cooldown: 40,
    description: 'Slows enemies. Essential for crowd control.', category: 'starter' },
  
  // === BASIC (100-300 coins) ===
  MAGIC: { id: 'MAGIC', name: 'Arcane', price: 100, damage: 25, range: 4.0, cooldown: 45,
    description: 'Long range magic tower. Can hit flying enemies.', category: 'basic' },
  POISON: { id: 'POISON', name: 'Toxin', price: 250, damage: 8, range: 2.8, cooldown: 35,
    description: 'Deals damage over time. Stacks poison effect.', category: 'basic' },
  
  // === ADVANCED (300-500 coins) ===
  SNIPER: { id: 'SNIPER', name: 'Railgun', price: 350, damage: 100, range: 6.0, cooldown: 120,
    description: 'Extreme damage, very long range. Slow fire rate.', category: 'advanced' },
  TESLA: { id: 'TESLA', name: 'Tesla Coil', price: 300, damage: 20, range: 3.0, cooldown: 25,
    description: 'Chain lightning hits multiple enemies.', category: 'advanced' },
  WIND: { id: 'WIND', name: 'Gale Force', price: 280, damage: 12, range: 3.5, cooldown: 20,
    description: 'Knocks back enemies and hits multiple times.', category: 'advanced' },
  BOMB: { id: 'BOMB', name: 'Demolisher', price: 400, damage: 80, range: 2.0, cooldown: 150,
    description: 'Massive explosion radius. Very slow reload.', category: 'advanced' },
  LASER: { id: 'LASER', name: 'Beam Cannon', price: 450, damage: 5, range: 5.0, cooldown: 5,
    description: 'Continuous beam deals constant damage.', category: 'advanced' },
  
  // === ELEMENTAL (400-600 coins) ===
  FIRE: { id: 'FIRE', name: 'Inferno', price: 420, damage: 35, range: 2.5, cooldown: 60,
    description: 'Burns enemies over time. Area damage.', category: 'elemental' },
  STORM: { id: 'STORM', name: 'Tempest', price: 500, damage: 30, range: 4.0, cooldown: 80,
    description: 'Random lightning strikes. Can stun enemies.', category: 'elemental' },
  EARTH: { id: 'EARTH', name: 'Quake', price: 480, damage: 50, range: 2.0, cooldown: 100,
    description: 'Ground pound stuns and damages area.', category: 'elemental' },
  WATER: { id: 'WATER', name: 'Tsunami', price: 460, damage: 25, range: 3.5, cooldown: 70,
    description: 'Wave attack slows all enemies hit.', category: 'elemental' },
  
  // === SUPPORT (350-600 coins) ===
  BUFF: { id: 'BUFF', name: 'War Banner', price: 350, damage: 0, range: 3.0, cooldown: 0,
    description: 'Boosts nearby tower damage by 25%.', category: 'support' },
  SLOW: { id: 'SLOW', name: 'Time Warp', price: 380, damage: 0, range: 3.5, cooldown: 0,
    description: 'Slows all enemies in range by 40%.', category: 'support' },
  GOLD: { id: 'GOLD', name: 'Treasury', price: 500, damage: 0, range: 2.0, cooldown: 0,
    description: 'Generates +5 gold per wave.', category: 'support' },
  HEAL: { id: 'HEAL', name: 'Sanctuary', price: 600, damage: 0, range: 0, cooldown: 0,
    description: 'Restores +1 life per wave.', category: 'support' },
  
  // === SPECIAL (600-800 coins) ===
  VOID: { id: 'VOID', name: 'Void Rift', price: 650, damage: 60, range: 3.0, cooldown: 100,
    description: 'Ignores armor. Can teleport enemies back.', category: 'special' },
  SOLAR: { id: 'SOLAR', name: 'Sun Spire', price: 700, damage: 45, range: 4.5, cooldown: 80,
    description: 'Blinds enemies. High critical chance.', category: 'special' },
  LUNAR: { id: 'LUNAR', name: 'Moon Tower', price: 680, damage: 35, range: 4.0, cooldown: 60,
    description: 'Stronger at night. Heals from damage dealt.', category: 'special' },
  STAR: { id: 'STAR', name: 'Starfall', price: 750, damage: 70, range: 5.0, cooldown: 120,
    description: 'Random powerful strikes from above.', category: 'special' },
  
  // === LEGENDARY (800-1200 coins) ===
  PLASMA: { id: 'PLASMA', name: 'Plasma Core', price: 850, damage: 55, range: 4.0, cooldown: 50,
    description: 'Penetrates enemies and chains damage.', category: 'legendary' },
  DEATH: { id: 'DEATH', name: 'Reaper', price: 1000, damage: 999, range: 3.5, cooldown: 300,
    description: 'Instantly kills enemies below 20% HP.', category: 'legendary' },
  CRYSTAL: { id: 'CRYSTAL', name: 'Prism', price: 900, damage: 40, range: 4.5, cooldown: 40,
    description: 'Splits shots into multiple beams.', category: 'legendary' },
  GRAVITY: { id: 'GRAVITY', name: 'Singularity', price: 950, damage: 30, range: 3.0, cooldown: 80,
    description: 'Pulls enemies together. Massive AoE.', category: 'legendary' },
  ROCKET: { id: 'ROCKET', name: 'Missile Silo', price: 1100, damage: 120, range: 6.0, cooldown: 180,
    description: 'Homing missiles with huge damage.', category: 'legendary' },
  
  // === MYTHIC (1500+ coins) ===
  OMEGA: { id: 'OMEGA', name: 'Omega Cannon', price: 1500, damage: 200, range: 5.5, cooldown: 200,
    description: 'Ultimate weapon. Devastating power.', category: 'mythic' },
  DIVINE: { id: 'DIVINE', name: 'Divine Light', price: 1800, damage: 80, range: 5.0, cooldown: 60,
    description: 'Holy damage heals your base.', category: 'mythic' },
  CHAOS: { id: 'CHAOS', name: 'Chaos Engine', price: 2000, damage: 50, range: 4.0, cooldown: 30,
    description: 'Random powerful effects each shot.', category: 'mythic' }
};

// Enemy Info
export const ENEMY_INFO = {
  GOBLIN: {
    id: 'GOBLIN',
    name: 'Scout',
    hp: 30,
    speed: 'Fast',
    armor: 0,
    reward: 8,
    description: 'Fast but weak. Easy to kill but comes in large numbers.',
    weakness: 'Any tower',
    strength: 'Speed'
  },
  ORC: {
    id: 'ORC',
    name: 'Tank',
    hp: 80,
    speed: 'Slow',
    armor: 5,
    reward: 15,
    description: 'Heavy armor and high HP. Requires sustained damage.',
    weakness: 'High damage towers',
    strength: 'Armor & HP'
  },
  SPIRIT: {
    id: 'SPIRIT',
    name: 'Wraith',
    hp: 40,
    speed: 'Medium',
    armor: 0,
    reward: 12,
    description: 'Flying enemy. Can only be hit by magic towers.',
    weakness: 'Magic towers',
    strength: 'Flying'
  },
  SPEEDY: {
    id: 'SPEEDY',
    name: 'Runner',
    hp: 20,
    speed: 'Very Fast',
    armor: 0,
    reward: 10,
    description: 'Extremely fast. Hard to hit without slow effects.',
    weakness: 'Slow towers',
    strength: 'Speed'
  },
  BOSS: {
    id: 'BOSS',
    name: 'TITAN',
    hp: 500,
    speed: 'Very Slow',
    armor: 10,
    reward: 100,
    description: 'Massive HP and armor. Appears every 5 waves.',
    weakness: 'All towers combined',
    strength: 'HP & Armor'
  }
};

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      // Player Resources
      coins: 0,
      
      // Unlocked Towers (Starter gets 3 free towers)
      unlockedTowers: ['ARCHER', 'CANNON', 'ICE'],
      
      // Active Deck (max 5)
      activeDeck: ['ARCHER', 'CANNON', 'ICE'],
      
      // Stats
      totalGamesPlayed: 0,
      highestWave: 0,
      totalKills: 0,
      
      // Actions
      addCoins: (amount) => set(state => ({ coins: state.coins + amount })),
      
      buyTower: (towerId) => {
        const state = get();
        const tower = SHOP_TOWERS[towerId];
        
        if (state.unlockedTowers.includes(towerId)) {
          return { success: false, message: 'Already unlocked!' };
        }
        
        if (state.coins < tower.price) {
          return { success: false, message: 'Not enough coins!' };
        }
        
        set({
          coins: state.coins - tower.price,
          unlockedTowers: [...state.unlockedTowers, towerId]
        });
        
        return { success: true, message: `${tower.name} unlocked!` };
      },
      
      addToDeck: (towerId) => {
        const state = get();
        
        if (!state.unlockedTowers.includes(towerId)) {
          return { success: false, message: 'Tower not unlocked!' };
        }
        
        if (state.activeDeck.includes(towerId)) {
          return { success: false, message: 'Already in deck!' };
        }
        
        if (state.activeDeck.length >= 5) {
          return { success: false, message: 'Deck is full! (Max 5)' };
        }
        
        set({ activeDeck: [...state.activeDeck, towerId] });
        return { success: true, message: 'Added to deck!' };
      },
      
      removeFromDeck: (towerId) => {
        const state = get();
        
        if (state.activeDeck.length <= 2) {
          return { success: false, message: 'Need at least 2 towers!' };
        }
        
        set({ activeDeck: state.activeDeck.filter(id => id !== towerId) });
        return { success: true, message: 'Removed from deck!' };
      },
      
      updateStats: (wave, kills) => {
        const state = get();
        set({
          totalGamesPlayed: state.totalGamesPlayed + 1,
          highestWave: Math.max(state.highestWave, wave),
          totalKills: state.totalKills + kills
        });
      },

      // Get active deck tower types for game
      getActiveTowerTypes: () => {
        const state = get();
        const activeTowers = {};
        state.activeDeck.forEach(towerId => {
          if (TOWER_TYPES[towerId]) {
            activeTowers[towerId] = TOWER_TYPES[towerId];
          }
        });
        return activeTowers;
      },

      // Set player data from Firebase
      setPlayerData: (data) => {
        set({
          coins: data.coins || 0,
          unlockedTowers: data.unlockedTowers || ['ARCHER', 'CANNON', 'ICE'],
          activeDeck: data.activeDeck || ['ARCHER', 'CANNON', 'ICE'],
          totalGamesPlayed: data.totalGamesPlayed || 0,
          highestWave: data.highestWave || 0,
          totalKills: data.totalKills || 0
        });
      },

      // Get data for Firebase save
      getPlayerData: () => {
        const state = get();
        return {
          coins: state.coins,
          unlockedTowers: state.unlockedTowers,
          activeDeck: state.activeDeck,
          totalGamesPlayed: state.totalGamesPlayed,
          highestWave: state.highestWave,
          totalKills: state.totalKills
        };
      },

      // Reset all progress
      resetData: () => {
        set({
          coins: 0,
          unlockedTowers: ['ARCHER', 'CANNON', 'ICE'],
          activeDeck: ['ARCHER', 'CANNON', 'ICE'],
          totalGamesPlayed: 0,
          highestWave: 0,
          totalKills: 0
        });
        return activeTowers;
      }
    }),
    {
      name: 'player-storage'
    }
  )
);
