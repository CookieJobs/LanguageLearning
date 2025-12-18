import React from 'react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps { count: number }

export const StreakBadge: React.FC<StreakBadgeProps> = ({ count }) => {
  return (
    <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full border border-orange-100 transition-colors hover:bg-orange-100/50 cursor-default">
      <Flame size={16} className="fill-current" />
      <span className="text-sm font-semibold tracking-tight">{count} 天</span>
    </div>
  );
};
