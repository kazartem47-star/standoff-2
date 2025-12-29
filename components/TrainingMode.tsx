import React, { useState, useEffect, useRef } from 'react';
import { BotDifficulty, GameMap, WeaponStats, InventoryItem } from '../types';
import { MAPS, WEAPON_STATS, COLORS } from '../constants';
import { Target, RotateCcw, Settings, Crosshair, Skull, ShieldAlert, Zap } from 'lucide-react';

interface TrainingModeProps {
  equippedSkins: Record<string, InventoryItem>; // Map of WeaponName -> Skin Item
}

interface Bot {
  id: number;
  x: number;
  y: number;
  hp: number;
  scale: number;
  attackTimer: number; // ms until damage
  maxAttackTime: number;
}

const TrainingMode: React.FC<TrainingModeProps> = ({ equippedSkins }) => {
  // Lobby State
  const [phase, setPhase] = useState<'LOBBY' | 'PLAYING' | 'PAUSED' | 'GAMEOVER'>('LOBBY');
  const [selectedMap, setSelectedMap] = useState<GameMap>(MAPS[0]);
  const [botCount, setBotCount] = useState(3);
  const [difficulty, setDifficulty] = useState<BotDifficulty>(BotDifficulty.MEDIUM);
  
  // Game State
  const [activeWeapon, setActiveWeapon] = useState<WeaponStats>(WEAPON_STATS['AKR']);
  const [playerHp, setPlayerHp] = useState(100);
  const [ammo, setAmmo] = useState(30);
  const [score, setScore] = useState(0);
  const [bots, setBots] = useState<Bot[]>([]);
  const [lastShot, setLastShot] = useState(0);
  const [kills, setKills] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // --- Logic ---

  const getDifficultyMultiplier = () => {
    switch (difficulty) {
      case BotDifficulty.EASY: return 1.5;
      case BotDifficulty.MEDIUM: return 1.0;
      case BotDifficulty.HARD: return 0.7;
    }
  };

  const spawnBot = (): Bot => {
    if (!containerRef.current) return { id: 0, x: 0, y: 0, hp: 0, scale: 0, attackTimer: 0, maxAttackTime: 0 };
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    // Random position within 80% of screen center
    const x = 50 + Math.random() * (width - 100);
    const y = 100 + Math.random() * (height - 200);
    
    // Fake depth scale
    const scale = 0.5 + Math.random() * 0.8;
    
    const attackTime = 2000 * getDifficultyMultiplier() * selectedMap.difficultyMod;

    return {
      id: Date.now() + Math.random(),
      x,
      y,
      hp: 100,
      scale,
      attackTimer: attackTime,
      maxAttackTime: attackTime
    };
  };

  const startGame = () => {
    setPhase('PLAYING');
    setPlayerHp(100);
    setScore(0);
    setKills(0);
    setAmmo(activeWeapon.magazine);
    
    const initialBots = [];
    for(let i=0; i<botCount; i++) initialBots.push(spawnBot());
    setBots(initialBots);
    
    lastTimeRef.current = performance.now();
    requestAnimationFrame(gameLoop);
  };

  const resetMatch = () => {
    setPhase('LOBBY');
    cancelAnimationFrame(loopRef.current);
  };

  const changeWeapon = (weaponKey: string) => {
    setActiveWeapon(WEAPON_STATS[weaponKey]);
    setAmmo(WEAPON_STATS[weaponKey].magazine);
    // If paused, stay paused. If playing, continue.
  };

  const gameLoop = (time: number) => {
    if (phase !== 'PLAYING') return;
    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Update Bots
    setBots(prevBots => {
      let newHp = playerHp;
      const updatedBots = prevBots.map(bot => {
        // Decrease attack timer
        const newTimer = bot.attackTimer - delta;
        if (newTimer <= 0) {
          // Bot attacks
          newHp = Math.max(0, newHp - 10); // 10 damage per hit
          // Reset timer slightly faster
          return { ...bot, attackTimer: bot.maxAttackTime * 0.8 };
        }
        return { ...bot, attackTimer: newTimer };
      });

      if (newHp < playerHp) setPlayerHp(newHp);
      return updatedBots;
    });

    if (playerHp <= 0) {
      setPhase('GAMEOVER');
    } else {
      loopRef.current = requestAnimationFrame(gameLoop);
    }
  };

  // Re-sync HP state check (workaround for closure staleness in loop, 
  // though functional update of bots handles the decrement, setting state triggers re-render)
  useEffect(() => {
    if (playerHp <= 0 && phase === 'PLAYING') {
      setPhase('GAMEOVER');
      cancelAnimationFrame(loopRef.current);
    }
  }, [playerHp]);


  const handleShoot = (e: React.MouseEvent | React.TouchEvent, botId?: number) => {
    if (phase !== 'PLAYING') return;
    
    // Fire Rate Check
    const now = Date.now();
    if (now - lastShot < activeWeapon.fireRate) return;
    
    // Ammo Check
    if (ammo <= 0) {
      // Reload sound/anim trigger could go here
      return; 
    }

    setLastShot(now);
    setAmmo(p => p - 1);

    // Hit Logic
    if (botId) {
      setBots(prev => prev.map(bot => {
        if (bot.id === botId) {
          const damage = activeWeapon.damage;
          const remainingHp = bot.hp - damage;
          if (remainingHp <= 0) {
            setScore(s => s + 100);
            setKills(k => k + 1);
            // Respawn this bot
            return spawnBot();
          }
          return { ...bot, hp: remainingHp };
        }
        return bot;
      }));
    }
  };

  const handleReload = () => {
    setAmmo(activeWeapon.magazine);
  };

  // Get current skin for weapon
  const currentSkinItem = equippedSkins[activeWeapon.name];

  return (
    <div className="relative h-screen bg-[#0f1115] text-white flex flex-col">
      
      {/* LOBBY SCREEN */}
      {phase === 'LOBBY' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in">
           <div className="text-center">
             <h2 className="text-4xl font-black uppercase italic tracking-widest text-orange-500">Training Lobby</h2>
             <p className="text-slate-400">Configure your simulation parameters</p>
           </div>

           <div className="w-full max-w-md bg-[#1b1f28] p-6 rounded border border-slate-700 space-y-6">
              {/* Map Select */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Map Environment</label>
                <div className="grid grid-cols-3 gap-2">
                  {MAPS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMap(m)}
                      className={`p-2 border rounded text-xs font-bold uppercase transition-all ${
                        selectedMap.id === m.id 
                        ? 'bg-orange-600 border-orange-500 text-white' 
                        : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                 <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Bot AI Level</label>
                 <div className="flex bg-slate-800 rounded p-1 border border-slate-600">
                    {Object.values(BotDifficulty).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficulty(diff)}
                        className={`flex-1 py-1 rounded text-xs font-bold uppercase transition-colors ${
                          difficulty === diff ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Bot Count */}
              <div>
                 <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold uppercase text-slate-500">Hostiles</label>
                    <span className="text-xs font-bold text-orange-500">{botCount} Bots</span>
                 </div>
                 <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  value={botCount} 
                  onChange={(e) => setBotCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                 />
              </div>

              <button 
                onClick={startGame}
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all transform hover:scale-105"
              >
                Start Simulation
              </button>
           </div>
        </div>
      )}

      {/* GAME SCREEN */}
      {(phase === 'PLAYING' || phase === 'GAMEOVER' || phase === 'PAUSED') && (
        <div className="relative flex-1 overflow-hidden cursor-crosshair">
           
           {/* Background */}
           <div 
             className="absolute inset-0 z-0 transition-colors duration-1000"
             style={{ backgroundColor: selectedMap.color }}
           >
              {/* Grid overlay for tactical feel */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}
              />
           </div>

           {/* Game Container */}
           <div 
            ref={containerRef}
            className="absolute inset-0 z-10"
            onMouseDown={(e) => handleShoot(e)}
           >
              {bots.map(bot => (
                <div
                  key={bot.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleShoot(e, bot.id);
                  }}
                  className="absolute flex flex-col items-center justify-end transform -translate-x-1/2 -translate-y-full select-none"
                  style={{
                    left: bot.x,
                    top: bot.y,
                    transform: `translate(-50%, -100%) scale(${bot.scale})`,
                    zIndex: Math.floor(bot.scale * 100)
                  }}
                >
                    {/* Health Bar of Bot */}
                    <div className="w-16 h-2 bg-black/50 border border-white/20 mb-1 rounded-full overflow-hidden">
                       <div className="h-full bg-red-500" style={{ width: `${bot.hp}%` }} />
                    </div>

                    {/* Bot Sprite (Simplified) */}
                    <div className="relative group">
                       <div className="w-24 h-48 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center shadow-xl relative overflow-hidden">
                          {/* Bot Visuals */}
                          <div className="absolute top-0 w-full h-1/3 bg-slate-700 rounded-b-xl" />
                          <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center">
                             <Skull className="text-red-400" size={32} />
                          </div>
                          {/* Attack Indicator */}
                          {bot.attackTimer < 500 && (
                            <div className="absolute inset-0 border-4 border-red-500 animate-pulse" />
                          )}
                       </div>
                    </div>
                </div>
              ))}
           </div>

           {/* HUD */}
           <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6">
              {/* Top Bar */}
              <div className="flex justify-between items-start">
                  <div className="bg-black/60 backdrop-blur p-2 rounded border-l-4 border-orange-500">
                     <p className="text-[10px] text-slate-400 uppercase font-bold">Kills</p>
                     <p className="text-2xl font-black">{kills}</p>
                  </div>

                  {/* Player HP */}
                  <div className="flex flex-col items-center w-64">
                     <div className="w-full h-4 bg-slate-900 border border-slate-600 rounded-full overflow-hidden shadow-[0_0_10px_black]">
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: `${playerHp}%`,
                            backgroundColor: playerHp > 50 ? '#22c55e' : playerHp > 20 ? '#eab308' : '#ef4444' 
                          }}
                        />
                     </div>
                     <span className="text-xs font-bold uppercase mt-1 drop-shadow-md text-white">{playerHp} HP</span>
                  </div>

                  <div className="bg-black/60 backdrop-blur p-2 rounded border-r-4 border-orange-500 text-right">
                     <p className="text-[10px] text-slate-400 uppercase font-bold">Score</p>
                     <p className="text-2xl font-black">{score}</p>
                  </div>
              </div>

              {/* Bottom Bar (Weapon) */}
              <div className="flex items-end justify-between">
                  <div className="pointer-events-auto flex flex-col gap-2">
                     <button 
                        onClick={() => setPhase(p => p === 'PAUSED' ? 'PLAYING' : 'PAUSED')} 
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600"
                     >
                        <Settings size={20} />
                     </button>
                  </div>

                  {/* Weapon Card */}
                  <div className="flex items-center gap-4">
                     {/* Loadout Switcher (pointer events auto) */}
                     <div className="pointer-events-auto flex flex-col gap-1 mr-4">
                        <span className="text-[10px] uppercase font-bold text-slate-500 text-right mb-1">Loadout</span>
                        <div className="flex gap-1">
                          {['AKR', 'M4', 'AWM', 'USP', 'Deagle', 'Knife'].map(w => (
                            <button 
                              key={w}
                              onClick={() => changeWeapon(w)}
                              className={`p-2 border rounded transition-all ${
                                activeWeapon.name === w 
                                ? 'bg-orange-600 border-orange-400 text-white' 
                                : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white'
                              }`}
                            >
                               <span className="text-xs font-bold">{w}</span>
                            </button>
                          ))}
                        </div>
                     </div>

                     <div className="bg-gradient-to-t from-black/80 to-transparent p-4 rounded-t-xl border-x border-t border-slate-700 min-w-[200px] flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="text-right">
                              <h3 
                                className="text-xl font-black uppercase italic leading-none"
                                style={{ color: currentSkinItem ? COLORS[currentSkinItem.rarity] : 'white' }}
                              >
                                {currentSkinItem ? currentSkinItem.name : 'Default'}
                              </h3>
                              <p className="text-xs text-slate-400 font-bold">{activeWeapon.name}</p>
                           </div>
                           {/* Weapon Icon / Skin Preview */}
                           <div 
                              className="w-12 h-12 border border-slate-600 bg-slate-800 rounded flex items-center justify-center overflow-hidden"
                              style={{ 
                                backgroundColor: currentSkinItem ? currentSkinItem.imageColor : '#333'
                              }}
                           >
                              {currentSkinItem?.stickers?.length ? (
                                <span className="text-xs">{currentSkinItem.stickers[0].icon}</span>
                              ) : <Crosshair size={20} />}
                           </div>
                        </div>

                        {/* Ammo */}
                        <div className="flex items-center gap-2">
                           <button 
                            onClick={handleReload}
                            className="pointer-events-auto text-[10px] bg-slate-700 px-2 py-1 rounded hover:bg-slate-600 uppercase font-bold"
                           >
                             [R] Reload
                           </button>
                           <p className={`text-4xl font-black tracking-tighter ${ammo < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                              {ammo} <span className="text-lg text-slate-500">/ {activeWeapon.magazine}</span>
                           </p>
                        </div>
                     </div>
                  </div>
              </div>
           </div>

           {/* Pause/GameOver Overlay */}
           {(phase === 'PAUSED' || phase === 'GAMEOVER') && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                 <div className="text-center">
                    {phase === 'GAMEOVER' && (
                      <div className="mb-6">
                        <h2 className="text-5xl font-black text-red-500 uppercase italic mb-2">Eliminated</h2>
                        <p className="text-xl text-white">Final Score: {score}</p>
                      </div>
                    )}
                    {phase === 'PAUSED' && (
                      <h2 className="text-4xl font-bold text-white uppercase tracking-widest mb-8">Paused</h2>
                    )}
                    
                    <div className="flex flex-col gap-4 min-w-[200px]">
                       <button 
                        onClick={phase === 'GAMEOVER' ? startGame : () => setPhase('PLAYING')}
                        className="py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold uppercase tracking-widest rounded"
                       >
                         {phase === 'GAMEOVER' ? 'Retry' : 'Resume'}
                       </button>
                       <button 
                        onClick={resetMatch}
                        className="py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2"
                       >
                         <RotateCcw size={16} /> Return to Lobby
                       </button>
                    </div>
                 </div>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default TrainingMode;
