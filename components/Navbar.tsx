import React from 'react';
import { GameView } from '../types';
import { ShoppingBag, Crosshair, User, LayoutGrid } from 'lucide-react';

interface NavbarProps {
  currentView: GameView;
  setView: (view: GameView) => void;
  gold: number;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, gold }) => {
  const navItems = [
    { view: GameView.MENU, label: 'Profile', icon: User },
    { view: GameView.INVENTORY, label: 'Inventory', icon: LayoutGrid },
    { view: GameView.CASE_OPENER, label: 'Market / Cases', icon: ShoppingBag },
    { view: GameView.TRAINING, label: 'Training', icon: Crosshair },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#1b1f28] border-t border-slate-700 h-16 flex items-center justify-around z-50 md:top-0 md:bottom-auto md:h-20 md:px-10 md:justify-between">
      
      {/* Mobile Logo / Currency */}
      <div className="hidden md:flex items-center gap-4">
         <h1 className="text-2xl font-bold tracking-widest text-white italic">STANDOFF<span className="text-orange-500">SIM</span></h1>
         <div className="bg-slate-800 px-4 py-1 rounded border border-slate-600 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
            <span className="font-bold text-yellow-500">{gold.toLocaleString()} G</span>
         </div>
      </div>

      {/* Nav Items */}
      <div className="flex w-full md:w-auto justify-around md:gap-8">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                isActive ? 'text-orange-500 scale-110' : 'text-slate-400 hover:text-white'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] uppercase font-bold tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Currency Display */}
      <div className="absolute top-[-40px] right-4 md:hidden bg-slate-800/90 px-3 py-1 rounded-full border border-slate-600 flex items-center gap-2 backdrop-blur-sm">
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <span className="font-bold text-sm text-yellow-500">{gold} G</span>
      </div>
    </div>
  );
};

export default Navbar;
