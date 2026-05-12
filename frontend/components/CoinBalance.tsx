import React from 'react';
import { usePet } from '../contexts/PetContext';
import { Coins } from 'lucide-react';

const CoinBalance: React.FC = () => {
  const { wallet, loading } = usePet();

  if (loading || !wallet) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-xl border border-gray-200">
        <Coins size={18} className="text-gray-400" />
        <span className="text-gray-400 font-bold">...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-br from-yellow-50 to-duo-yellow/10 hover:from-yellow-100 hover:to-duo-yellow/20 text-duo-orange rounded-xl border border-yellow-200/50 hover:border-yellow-200 transition-all shadow-sm group cursor-default">
      <Coins size={18} className="fill-yellow-500 text-yellow-600 group-hover:scale-110 transition-transform" />
      <span className="text-base font-bold text-duo-orange">{wallet.balance}</span>
    </div>
  );
};

export default CoinBalance;
