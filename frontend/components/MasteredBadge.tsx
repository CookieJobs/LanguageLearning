// input: react, lucide-react
// output: MasteredBadge
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface MasteredBadgeProps { disabled?: boolean; onClick: () => void }

export const MasteredBadge: React.FC<MasteredBadgeProps> = ({ disabled, onClick }) => {
  const base = "inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border text-sm font-semibold transition-colors";
  const theme = "bg-emerald-50 text-emerald-700 border-emerald-200";
  const state = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-emerald-100";
  return (
    <div role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled} onClick={() => { if (!disabled) onClick(); }} onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) onClick(); }} className={`${base} ${theme} ${state}`} title="已掌握单词">
      <CheckCircle2 size={16} className="text-emerald-600" />
      <span>已掌握单词</span>
    </div>
  );
};
