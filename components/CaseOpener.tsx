import React, { useState, useRef, useEffect } from 'react';
import { Skin, Rarity } from '../types';
import { SKINS_DB, COLORS, CASE_COST } from '../constants';
import { PackageOpen } from 'lucide-react';

interface CaseOpenerProps {
  gold: number;
  spendGold: (amount: number) => boolean;
  addSkinToInventory: (skin: Skin) => void;
}

const CaseOpener: React.FC<CaseOpenerProps> = ({ gold, spendGold, addSkinToInventory }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rouletteItems, setRouletteItems] = useState<Skin[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [winSkin, setWinSkin] = useState<Skin | null>(null);

  // Helper to get weighted random skin
  const getRandomSkin = (): Skin => {
    const roll = Math.random() * 100;
    let rarity: Rarity;

    if (roll < 0.5) rarity = Rarity.ARCANE;
    else if (roll < 2.5) rarity = Rarity.LEGENDARY;
    else if (roll < 10) rarity = Rarity.EPIC;
    else if (roll < 25) rarity = Rarity.RARE;
    else if (roll < 55) rarity = Rarity.UNCOMMON;
    else rarity = Rarity.COMMON;

    const pool = SKINS_DB.filter(s => s.rarity === rarity);
    // Fallback if pool is empty (shouldn't happen with full DB)
    if (pool.length === 0) return SKINS_DB[0];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleOpenCase = () => {
    if (isSpinning) return;
    if (!spendGold(CASE_COST)) {
      alert("Not enough Gold!");
      return;
    }

    setWinSkin(null);
    setIsSpinning(true);

    // Generate the strip of items
    // We need a lot of items, with the winner at a specific index (e.g., 35)
    const items: Skin[] = [];
    const winner = getRandomSkin();
    const WIN_INDEX = 35;
    
    for (let i = 0; i < 50; i++) {
      if (i === WIN_INDEX) {
        items.push(winner);
      } else {
        items.push(getRandomSkin());
      }
    }
    setRouletteItems(items);

    // Trigger animation after render
    setTimeout(() => {
        if (scrollContainerRef.current) {
            const cardWidth = 160; // 144px width + 16px gap
            // Calculate scroll position to center the winning item
            // Container width / 2
            const containerCenter = scrollContainerRef.current.clientWidth / 2;
            const targetPos = (WIN_INDEX * cardWidth) + (cardWidth / 2) - containerCenter;

            // Add some randomness to land slightly left or right within the card
            const randomOffset = (Math.random() * 100) - 50;

            scrollContainerRef.current.style.transition = 'transform 6s cubic-bezier(0.15, 0, 0.10, 1)';
            scrollContainerRef.current.style.transform = `translateX(-${targetPos + randomOffset}px)`;
        }
    }, 100);

    // Finish Spin
    setTimeout(() => {
        setIsSpinning(false);
        setWinSkin(winner);
        addSkinToInventory(winner);
    }, 6500); // Slightly longer than transition to be safe
  };

  // Reset roulette position when not spinning
  useEffect(() => {
      if (!isSpinning && scrollContainerRef.current && rouletteItems.length === 0) {
          scrollContainerRef.current.style.transition = 'none';
          scrollContainerRef.current.style.transform = 'translateX(0px)';
      }
  }, [isSpinning, rouletteItems]);


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0f1115] pb-20 md:pb-0 pt-10">
      
      {/* Case Preview */}
      <div className="mb-10 text-center">
        <div className="w-64 h-48 bg-gradient-to-br from-slate-800 to-black border border-orange-500/30 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <PackageOpen size={80} className="text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]" />
        </div>
        <h2 className="text-2xl font-bold uppercase tracking-widest">Rival Case</h2>
        <p className="text-orange-400 font-bold mt-1">{CASE_COST} G</p>
      </div>

      {/* Roulette Window */}
      <div className="relative w-full max-w-4xl h-48 bg-[#0a0a0a] border-y-4 border-[#1b1f28] flex items-center overflow-hidden mb-10 roulette-container shadow-inner">
        {/* Center Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-500 z-20 shadow-[0_0_10px_#eab308] transform -translate-x-1/2"></div>
        
        <div 
            ref={scrollContainerRef}
            className="flex items-center gap-4 px-[50%]"
            style={{ willChange: 'transform' }}
        >
            {rouletteItems.length > 0 ? rouletteItems.map((item, index) => (
                <div 
                    key={index} 
                    className="flex-shrink-0 w-36 h-36 bg-[#1b1f28] border-b-4 relative flex flex-col items-center justify-center rounded-sm"
                    style={{ borderColor: COLORS[item.rarity] }}
                >
                    <div 
                        className="w-20 h-20 mb-2 opacity-90"
                        style={{
                            background: `linear-gradient(135deg, ${item.imageColor}, transparent)`,
                            clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'
                        }}
                    />
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{item.weapon}</p>
                    <p className="text-xs text-white truncate max-w-full px-2">{item.name}</p>
                </div>
            )) : (
               <div className="text-slate-600 font-bold uppercase tracking-widest text-xl whitespace-nowrap">
                   Open the case to test your luck
               </div>
            )}
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={handleOpenCase}
        disabled={isSpinning || gold < CASE_COST}
        className={`
            px-12 py-4 text-xl font-bold uppercase tracking-widest clip-path-polygon
            transition-all duration-200
            ${isSpinning 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : gold < CASE_COST 
                    ? 'bg-red-900/50 text-red-400 border border-red-800'
                    : 'bg-orange-600 hover:bg-orange-500 text-white hover:scale-105 shadow-[0_0_20px_rgba(234,88,12,0.4)]'
            }
        `}
        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
      >
        {isSpinning ? 'Opening...' : gold < CASE_COST ? 'Need Gold' : 'Open Case'}
      </button>

      {/* Win Modal (Overlay) */}
      {winSkin && !isSpinning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
              <div className="flex flex-col items-center">
                  <h3 className="text-white text-3xl font-light uppercase tracking-[0.5em] mb-4">You Unboxed</h3>
                  <div className="relative mb-8 group">
                       <div className="absolute inset-0 bg-white/10 blur-xl rounded-full animate-pulse"></div>
                       <div 
                        className="w-64 h-64 bg-slate-900 border-2 relative flex flex-col items-center justify-center transform transition-transform group-hover:scale-105 duration-500"
                        style={{ borderColor: COLORS[winSkin.rarity] }}
                       >
                            <div 
                                className="w-40 h-40 mb-4"
                                style={{
                                    background: `linear-gradient(135deg, ${winSkin.imageColor}, transparent)`,
                                    clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'
                                }}
                            />
                       </div>
                  </div>
                  <h2 
                    className="text-5xl font-black uppercase italic mb-2 drop-shadow-lg"
                    style={{ color: COLORS[winSkin.rarity] }}
                  >
                      {winSkin.name}
                  </h2>
                  <p className="text-xl text-slate-300 uppercase tracking-widest mb-10">{winSkin.weapon} | {winSkin.rarity}</p>
                  
                  <button 
                    onClick={() => setWinSkin(null)}
                    className="bg-white text-black font-bold px-10 py-3 uppercase tracking-widest hover:bg-slate-200 transition-colors"
                  >
                      Collect
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default CaseOpener;
