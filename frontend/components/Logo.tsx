import React from 'react'
import { BookOpen } from 'lucide-react'

interface LogoProps { size?: 'sm' | 'md' | 'lg'; withText?: boolean; className?: string }

export const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true, className }) => {
  const iconSize = size === 'sm' ? 18 : size === 'md' ? 24 : 32
  const textSize = size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-2xl'
  const boxClass = size === 'sm' ? 'p-1.5 rounded-md' : size === 'md' ? 'p-2 rounded-lg' : 'p-2.5 rounded-xl'

  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <div className={`bg-black text-white ${boxClass} flex items-center justify-center shadow-sm`}>
        <BookOpen size={iconSize} strokeWidth={2.5} />
      </div>
      {withText && (
        <span className={`${textSize} font-bold tracking-tight text-gray-900`}>
          LinguaCraft
        </span>
      )}
    </div>
  )
}

export default Logo
