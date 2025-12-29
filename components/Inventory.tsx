import React, { useState } from 'react';
import { InventoryItem, Rarity, WeaponCategory, Sticker } from '../types';
import { COLORS, STICKERS } from '../constants';
import { generateSkinLore } from '../services/geminiService';
import { X, Sparkles, Loader2, Check, Sticker as StickerIcon, Shield } from 'lucide-react';

interface InventoryProps {
  inventory: InventoryItem[];
  sellItem: (uid: string, price: number) => void;
  equippedItems: Record<string, string>; // weaponName -> itemUID
  equipItem: (item: InventoryItem) => void;
  applySticker: (itemUid: string, sticker: Sticker) => void;
}

const Inventory: React.FC<InventoryProps> = ({ inventory, sellItem, equippedItems, equipItem, applySticker }) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [lore, setLore] = useState<string>("");
  const [loadingLore, setLoadingLore] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [previewSticker, setPreviewSticker] = useState<Sticker | null>(null);

  const tabs = ['ALL', ...Object.values(WeaponCategory)];

  const filteredInventory = inventory.filter(item => {
    if (activeTab === 'ALL') return true;
    return item.category === activeTab;
  });

  const handleInspect = async (item: InventoryItem) => {
    setSelectedItem(item);
    setLore(""); 
    setLoadingLore(true);
    setIsCustomizing(false);
    setPreviewSticker(null);
    
    // Call Gemini
    const generatedLore = await generateSkinLore(item.weapon, item.name, item.rarity);
    setLore(generatedLore);
    setLoadingLore(false);
  };

  const closeInspect = () => {
    setSelectedItem(null);
    setLore("");
    setIsCustomizing(false);
    setPreviewSticker(null);
  };

  const handleApplySticker = () => {
    if (selectedItem && previewSticker) {
      applySticker(selectedItem.uid, previewSticker);
      setIsCustomizing(false);
      setPreviewSticker(null);
      // Close to refresh selected item ref from props if needed, or we rely on parent update
      // For simplicity, we just close
      closeInspect(); 
    }
  };

  return (
    <div className="p-4 pb-24 md:pt-24 h-screen overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold border-l-4 border-orange-500 pl-4 uppercase">Armory</h2>
        <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">{inventory.length} Items</span>
      </div>
      
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === tab 
              ? 'bg-orange-600 text-white' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {inventory.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 flex-1">
          <p>Inventory Empty</p>
          <p className="text-sm">Go open some cases!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-20">
          {filteredInventory.map((item) => {
            const isEquipped = equippedItems[item.weapon] === item.uid;
            return (
              <div 
                key={item.uid}
                onClick={() => handleInspect(item)}
                className={`group relative bg-[#1b1f28] border transition-all cursor-pointer rounded-sm overflow-hidden aspect-square flex flex-col items-center justify-center ${
                  isEquipped ? 'border-orange-500' : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <div 
                  className="absolute top-0 left-0 w-full h-1" 
                  style={{ backgroundColor: COLORS[item.rarity] }} 
                />
                
                {isEquipped && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white p-1 rounded-full shadow-lg z-20">
                    <Check size={12} strokeWidth={4} />
                  </div>
                )}

                {/* Skin Image */}
                <div 
                  className="w-24 h-24 mb-2 opacity-80 group-hover:scale-110 transition-transform duration-300 relative"
                  style={{
                    background: `linear-gradient(135deg, ${item.imageColor}40, ${item.imageColor})`,
                    clipPath: 'polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%)'
                  }}
                >
                    {/* Render Stickers Small */}
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-80">
                        {item.stickers?.map((s, idx) => (
                             <span key={idx} className="text-xs drop-shadow-md">{s.icon}</span>
                        ))}
                    </div>
                </div>

                <div className="text-center z-10 w-full">
                  <p className="text-slate-400 text-[10px] font-bold uppercase">{item.weapon}</p>
                  <p className="text-white text-xs font-bold truncate px-2">{item.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect / Customize Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#15171c] w-full max-w-lg border border-slate-600 relative rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Background Glow */}
            <div 
              className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 pointer-events-none"
              style={{ background: `radial-gradient(circle, ${COLORS[selectedItem.rarity]} 0%, transparent 70%)` }}
            />

            <button onClick={closeInspect} className="absolute top-4 right-4 text-slate-400 hover:text-white z-20">
              <X size={24} />
            </button>

            <div className="p-6 relative z-10 flex flex-col items-center text-center overflow-y-auto">
               <h3 className="text-4xl font-black uppercase italic tracking-tighter" style={{ color: COLORS[selectedItem.rarity] }}>
                 {selectedItem.weapon}
               </h3>
               <h4 className="text-2xl text-white font-light uppercase tracking-widest mb-6">
                 {selectedItem.name}
               </h4>

               <div className="relative mb-8 group">
                  <div 
                      className="w-56 h-48 shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${selectedItem.imageColor}, #1a1a1a)`,
                        clipPath: 'polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%)'
                      }}
                  />
                  {/* Sticker Layer */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
                     {selectedItem.stickers?.map((s, idx) => (
                        <div key={idx} className="text-3xl drop-shadow-lg animate-in zoom-in">{s.icon}</div>
                     ))}
                     {previewSticker && (
                        <div className="text-3xl drop-shadow-lg animate-pulse opacity-70">{previewSticker.icon}</div>
                     )}
                  </div>
               </div>

               {/* Customization Mode */}
               {isCustomizing ? (
                 <div className="w-full bg-[#0f1115] border border-slate-700 p-4 rounded mb-6">
                    <h5 className="text-left text-sm font-bold uppercase text-slate-400 mb-3">Select Sticker</h5>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {STICKERS.map(sticker => (
                         <button 
                            key={sticker.id}
                            onClick={() => setPreviewSticker(sticker)}
                            className={`p-2 bg-slate-800 rounded border hover:bg-slate-700 flex flex-col items-center ${previewSticker?.id === sticker.id ? 'border-orange-500' : 'border-slate-600'}`}
                         >
                            <span className="text-2xl">{sticker.icon}</span>
                            <span className="text-[10px] text-slate-400 mt-1">{sticker.name}</span>
                         </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsCustomizing(false)}
                        className="flex-1 py-2 bg-slate-700 text-slate-300 font-bold text-xs uppercase rounded hover:bg-slate-600"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleApplySticker}
                        disabled={!previewSticker}
                        className="flex-1 py-2 bg-orange-600 text-white font-bold text-xs uppercase rounded hover:bg-orange-500 disabled:opacity-50"
                      >
                        Apply Sticker
                      </button>
                    </div>
                 </div>
               ) : (
                 <>
                  {/* Lore Section */}
                   <div className="bg-black/40 border-l-2 border-orange-500 p-4 w-full text-left mb-6 min-h-[60px]">
                      <div className="flex items-center gap-2 mb-1 text-orange-500 text-[10px] font-bold uppercase">
                        <Sparkles size={10} />
                        <span>AI Analysis</span>
                      </div>
                      {loadingLore ? (
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <Loader2 size={12} className="animate-spin" />
                          <span>Decyphering...</span>
                        </div>
                      ) : (
                        <p className="text-slate-300 text-sm italic leading-relaxed">"{lore}"</p>
                      )}
                   </div>

                   {/* Action Buttons */}
                   <div className="grid grid-cols-2 gap-3 w-full">
                     <button 
                      onClick={() => setIsCustomizing(true)}
                      disabled={selectedItem.stickers && selectedItem.stickers.length >= 4}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 uppercase tracking-wider border border-slate-600 transition-colors text-sm flex items-center justify-center gap-2"
                     >
                       <StickerIcon size={16} /> Customize
                     </button>
                     
                     <button 
                       onClick={() => {
                          equipItem(selectedItem);
                          closeInspect();
                       }}
                       className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(234,88,12,0.4)] text-sm flex items-center justify-center gap-2"
                     >
                       <Shield size={16} /> Equip
                     </button>

                     <button 
                      onClick={() => {
                        sellItem(selectedItem.uid, selectedItem.price);
                        closeInspect();
                      }}
                      className="col-span-2 bg-red-900/40 hover:bg-red-900/60 text-red-200 font-bold py-2 uppercase tracking-wider border border-red-900/50 transition-colors text-xs"
                     >
                       Sell for {selectedItem.price} G
                     </button>
                   </div>
                 </>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
