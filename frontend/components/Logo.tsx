// input: react, lucide-react
// output: Logo
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React from 'react'
import { BookOpen } from 'lucide-react'

interface LogoProps { size?: 'sm' | 'md' | 'lg'; withText?: boolean; className?: string }

export const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true, className }) => {
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 22 : 28
  const textSize = size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-2xl'
  const boxClass = size === 'sm'
    ? 'p-1.5 rounded-lg'
    : size === 'md'
      ? 'p-2.5 rounded-xl'
      : 'p-3 rounded-2xl'

  return (
    <div className={`flex items-center gap-3 group ${className || ''}`}>
      <div className={`bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 text-white ${boxClass} flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-all duration-300 group-hover:scale-105`}>
        <BookOpen size={iconSize} strokeWidth={2.5} />
      </div>
      {withText && (
        <span className={`${textSize} font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent`}>
          LinguaCraft
        </span>
      )}
    </div>
  )
}

export default Logo
