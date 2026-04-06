import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { CalendarModal } from './CalendarModal';

export const StreakStatus: React.FC = () => {
  const { streak } = useApp();
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowCalendar(true)}
        className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-br from-orange-50 to-duo-yellow/10 hover:from-orange-100 hover:to-duo-yellow/20 text-orange-600 rounded-xl border border-orange-200/50 hover:border-orange-200 transition-all group cursor-pointer"
        title="查看打卡日历"
      >
        <Flame size={18} className="fill-orange-500 text-orange-500 animate-pulse-slow" />
        <span className="text-base font-bold text-orange-600">{streak}</span>
      </button>

      <CalendarModal isOpen={showCalendar} onClose={() => setShowCalendar(false)} />
    </>
  );
};
