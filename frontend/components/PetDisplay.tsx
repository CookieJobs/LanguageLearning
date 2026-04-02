import React, { useState, useEffect } from 'react';
import { usePet } from '../contexts/PetContext';
import { Heart, Zap, Sparkles, Coins, Info, Utensils, Gamepad2 } from 'lucide-react';
import { AnimatedPet } from './AnimatedPet';

const PetDisplay: React.FC = () => {
  const { pet, wallet, loading, error, feedPet, interactPet } = usePet();
  const [isFeeding, setIsFeeding] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 animate-pulse flex flex-col items-center space-y-4 h-full">
        <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
        <div className="w-24 h-6 bg-gray-200 rounded"></div>
        <div className="w-full space-y-2">
          <div className="w-full h-3 bg-gray-200 rounded"></div>
          <div className="w-full h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-100 flex items-center justify-center h-full text-red-500 text-sm">
        {error || 'No pet found.'}
      </div>
    );
  }

  const expNeeded = pet.level * 100;
  const expPercentage = Math.min(100, (pet.exp / expNeeded) * 100);
  
  // Map backend color to CSS color
  const getPetColor = () => {
    const colorMap: Record<string, string> = {
      'green': '#10b981',
      'blue': '#3b82f6',
      'red': '#ef4444',
      'purple': '#8b5cf6',
      'orange': '#f97316'
    };
    return colorMap[pet.appearance?.color] || '#6366f1';
  };
  
  const handleFeed = async () => {
    if (wallet && wallet.balance < 10) return; 
    try {
      setIsFeeding(true);
      await feedPet();
    } finally {
      setTimeout(() => setIsFeeding(false), 800);
    }
  };

  const handlePlay = async () => {
    if (cooldown > 0) return;
    try {
      setIsPlaying(true);
      await interactPet();
      setCooldown(60); 
    } finally {
      setTimeout(() => setIsPlaying(false), 1000);
    }
  };

  const canAffordFeed = (wallet?.balance || 0) >= 10;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col items-center relative overflow-hidden h-full">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-50 to-transparent"></div>
      
      <div className="relative z-10 w-full flex justify-between items-start mb-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">{pet.name}</h2>
          <div className="inline-flex items-center gap-1 bg-brand-100 text-brand-700 px-2 py-0.5 rounded-md text-xs font-bold mt-1">
            <Sparkles size={12} />
            等级 (Lv.) {pet.level}
          </div>
        </div>
        <div className="text-right">
           <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">经验 (EXP)</div>
           <div className="text-sm font-bold text-gray-700">{pet.exp} <span className="text-gray-400 font-normal">/ {expNeeded}</span></div>
        </div>
      </div>
      
      {/* EXP Bar */}
      <div className="relative z-10 w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${expPercentage}%` }}
        />
      </div>

      {/* Pet Avatar (Dynamic SVG) */}
      <div className="relative z-10 mb-4 flex justify-center w-full">
        <div className="relative">
          <AnimatedPet 
            type={pet.appearance?.type}
            color={getPetColor()}
            level={pet.level}
            hunger={pet.hunger}
            isFeeding={isFeeding}
            isPlaying={isPlaying}
            size={140}
          />
          {/* Floating elements on action */}
          {isFeeding && <div className="absolute top-4 right-0 text-2xl animate-fade-in-up drop-shadow-md">🍎</div>}
          {isPlaying && <div className="absolute top-4 left-0 text-2xl animate-fade-in-up drop-shadow-md">✨</div>}
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 w-full space-y-4 mb-8">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-gray-600">
            <span className="flex items-center gap-1.5"><Zap size={14} className="text-amber-500"/> 能量 (Energy)</span>
            <span>{pet.energy}/100</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${pet.energy}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-gray-600">
            <span className="flex items-center gap-1.5"><Heart size={14} className="text-rose-500"/> 饥饿 (Hunger)</span>
            <span>{pet.hunger}/100</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-rose-400 to-rose-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${pet.hunger}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="relative z-10 w-full flex gap-3 mt-auto">
        {/* Feed Button */}
        <div className="flex-1 relative group">
          <button
            onClick={handleFeed}
            disabled={!canAffordFeed || isFeeding}
            className={`w-full flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
              canAffordFeed 
                ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100 hover:border-rose-200 active:scale-95' 
                : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center gap-1.5 font-bold mb-0.5">
              <Utensils size={16} />
              喂食 (Feed)
            </span>
            <span className="text-[10px] font-semibold opacity-80 flex items-center gap-0.5">
              -10 <Coins size={10} />
            </span>
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-20">
            <div className="font-bold mb-1 border-b border-gray-700 pb-1">喂食 (Feed)</div>
            <div className="flex items-center gap-3">
              <span className="text-red-400 flex items-center gap-1">-10 <Coins size={10}/></span>
              <span className="text-green-400 flex items-center gap-1">+20 <Heart size={10}/></span>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>

        {/* Play Button */}
        <div className="flex-1 relative group">
          <button
            onClick={handlePlay}
            disabled={cooldown > 0 || isPlaying}
            className={`w-full flex flex-col items-center justify-center py-2.5 rounded-xl border-2 transition-all ${
              cooldown === 0 
                ? 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 hover:border-blue-200 active:scale-95' 
                : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center gap-1.5 font-bold mb-0.5">
              <Gamepad2 size={16} />
              {cooldown > 0 ? `${cooldown}s` : '玩耍 (Play)'}
            </span>
            <span className="text-[10px] font-semibold opacity-80 flex items-center gap-0.5">
              免费 (Free)
            </span>
          </button>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-20">
            <div className="font-bold mb-1 border-b border-gray-700 pb-1">互动 (Play)</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-gray-300">免费 (Free)</span>
                <span className="text-green-400 flex items-center gap-1">+5 <Sparkles size={10}/></span>
              </div>
              <div className="text-gray-400 text-[10px] flex items-center gap-1">
                <Info size={10} /> 冷却 (Cooldown): 1分钟
              </div>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDisplay;
