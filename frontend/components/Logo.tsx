// input: react, lucide-react
// output: Logo
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React from 'react';
import { BookOpen } from 'lucide-react';

interface LogoProps { size?: 'sm' | 'md' | 'lg'; withText?: boolean; className?: string }

export const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true, className }) => {
  const sizes = {
    sm: { icon: 18, box: 'w-8 h-8 rounded-xl', text: 'text-lg' },
    md: { icon: 24, box: 'w-10 h-10 rounded-2xl', text: 'text-2xl' },
    lg: { icon: 32, box: 'w-14 h-14 rounded-3xl', text: 'text-4xl' }
  }[size];

  return (
    <div className={`flex items-center gap-2.5 group cursor-pointer select-none ${className || ''}`}>
      <div className={`
        relative flex items-center justify-center 
        ${sizes.box}
        bg-gradient-to-br from-brand-50 to-duo-blue/10
        border border-brand-200/50
        group-hover:from-brand-100 group-hover:to-duo-blue/20 group-hover:border-brand-200
        group-hover:scale-110
        transition-all duration-300 ease-out
        shadow-sm
      `}>
        <BookOpen 
          size={sizes.icon} 
          strokeWidth={2.5} 
          className="text-brand-600 fill-brand-500 relative z-10 group-hover:rotate-[-8deg] transition-transform duration-300" 
        />
      </div>

      {withText && (
        <span className={`
          font-black tracking-tight
          text-gray-900 group-hover:text-brand-600
          transition-colors duration-300
          ${sizes.text}
        `}>
          LinguaCraft
        </span>
      )}
    </div>
  );
};

export default Logo;
