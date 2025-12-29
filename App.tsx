import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CaseOpener from './components/CaseOpener';
import Inventory from './components/Inventory';
import TrainingMode from './components/TrainingMode';
import { GameView, Skin, InventoryItem, Sticker } from './types';
import { INITIAL_GOLD } from './constants';
import { User, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<GameView>(GameView.CASE_OPENER);
  const [gold, setGold] = useState<number>(INITIAL_GOLD);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  // Store equipped item UIDs per weapon name (e.g., "AKR": "uid-123")
  const [equippedItems, setEquippedItems] = useState<Record<string, string>>({});

  useEffect(() => {
    document.body.classList.add('fade-in');
  }, []);

  const spendGold = (amount: number): boolean => {
    if (gold >= amount) {
      setGold(prev => prev - amount);
      return true;
    }
    return false;
  };

  const addSkinToInventory = (skin: Skin) => {
    const newItem: InventoryItem = {
      ...skin,
      uid: Math.random().toString(36).substr(2, 9),
      acquiredAt: Date.now(),
      stickers: []
    };
    setInventory(prev => [newItem, ...prev]);
  };

  const sellItem = (uid: string, price: number) => {
    setInventory(prev => prev.filter(item => item.uid !== uid));
    setGold(prev => prev + price);
    
    // Unequip if sold
    setEquippedItems(prev => {
      const next = { ...prev };
      for (const key in next) {
        if (next[key] === uid) delete next[key];
      }
      return next;
    });
  };

  const equipItem = (item: InventoryItem) => {
    setEquippedItems(prev => ({
      ...prev,
      [item.weapon]: item.uid
    }));
  };

  const applySticker = (itemUid: string, sticker: Sticker) => {
    setInventory(prev => prev.map(item => {
      if (item.uid === itemUid) {
        const currentStickers = item.stickers || [];
        if (currentStickers.length >= 4) return item;
        return { ...item, stickers: [...currentStickers, sticker] };
      }
      return item;
    }));
  };

  // Helper to get full skin objects for equipped weapons
  const getEquippedSkinsMap = () => {
    const map: Record<string, InventoryItem> = {};
    inventory.forEach(item => {
      if (equippedItems[item.weapon] === item.uid) {
        map[item.weapon] = item;
      }
    });
    return map;
  };

  const renderView = () => {
    switch (currentView) {
      case GameView.MENU:
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#0f1115] text-center p-6">
                <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-600 flex items-center justify-center mb-6">
                    <User size={64} className="text-slate-400" />
                </div>
                <h1 className="text-4xl font-bold uppercase tracking-widest text-white mb-2">Player 1</h1>
                <div className="flex items-center gap-2 text-orange-500 mb-8">
                    <Shield size={20} />
                    <span className="font-bold uppercase tracking-wider">Elite Silver</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="bg-[#1b1f28] p-4 border border-slate-700">
                        <p className="text-slate-400 text-xs uppercase">Inventory Value</p>
                        <p className="text-xl font-bold text-white">
                            {inventory.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()} G
                        </p>
                    </div>
                    <div className="bg-[#1b1f28] p-4 border border-slate-700">
                        <p className="text-slate-400 text-xs uppercase">Skins Owned</p>
                        <p className="text-xl font-bold text-white">{inventory.length}</p>
                    </div>
                </div>
                <button 
                    onClick={() => setGold(1000)} 
                    className="mt-12 text-xs text-slate-600 hover:text-orange-500 underline"
                >
                    DEBUG: Reset Gold
                </button>
            </div>
        );
      case GameView.INVENTORY:
        return (
          <Inventory 
            inventory={inventory} 
            sellItem={sellItem} 
            equippedItems={equippedItems}
            equipItem={equipItem}
            applySticker={applySticker}
          />
        );
      case GameView.CASE_OPENER:
        return <CaseOpener gold={gold} spendGold={spendGold} addSkinToInventory={addSkinToInventory} />;
      case GameView.TRAINING:
        return <TrainingMode equippedSkins={getEquippedSkinsMap()} />;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-slate-200 font-sans selection:bg-orange-500 selection:text-white">
      {renderView()}
      <Navbar currentView={currentView} setView={setCurrentView} gold={gold} />
    </div>
  );
};

export default App;
