import React from 'react';

interface AnimatedPetProps {
  type?: string;      // 'dragon', 'dog', 'blob'
  color?: string;
  level?: number;
  hunger?: number;
  isFeeding?: boolean;
  isPlaying?: boolean;
  size?: number;
}

export const AnimatedPet: React.FC<AnimatedPetProps> = ({
  type = 'blob',
  color = '#6366f1',
  level = 1,
  hunger = 50,
  isFeeding = false,
  isPlaying = false,
  size = 128
}) => {
  // 根据饥饿度决定表情
  const isSad = hunger < 30;
  
  // 根据等级决定进化特征
  const showWings = level >= 5;
  const showAntenna = level >= 10;
  const showHalo = level >= 15;

  return (
    <div className={`relative flex items-center justify-center pointer-events-none`} style={{ width: size, height: size }}>
      {/* 注入专属动画样式 */}
      <style>{`
        @keyframes pet-breath {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.02, 0.98) translateY(-2px); }
        }
        @keyframes pet-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes pet-shadow {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.1); opacity: 0.1; }
        }
        @keyframes pet-jump {
          0%, 100% { transform: translateY(0) scale(1); }
          40% { transform: translateY(-20px) scale(0.9, 1.1); }
          60% { transform: translateY(-20px) scale(0.95, 1.05); }
          80% { transform: translateY(0) scale(1.1, 0.9); }
        }
        @keyframes pet-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        .animate-pet-breath { 
          animation: pet-breath 3s ease-in-out infinite; 
          transform-origin: center bottom;
        }
        .animate-pet-blink { 
          animation: pet-blink 4s infinite; 
          transform-origin: center 50%;
        }
        .animate-pet-shadow { 
          animation: pet-shadow 3s ease-in-out infinite; 
          transform-origin: center;
        }
        .action-jump { 
          animation: pet-jump 0.8s cubic-bezier(0.28, 0.84, 0.42, 1); 
          transform-origin: center bottom;
        }
        .action-wiggle { 
          animation: pet-wiggle 0.5s ease-in-out 2; 
          transform-origin: center bottom;
        }
      `}</style>

      {/* SVG 画布 */}
      <svg 
        viewBox="0 0 100 100" 
        className={`w-full h-full overflow-visible ${isFeeding ? 'action-jump' : ''} ${isPlaying ? 'action-wiggle' : ''}`}
      >
        {/* 底部阴影 */}
        <ellipse cx="50" cy="90" rx="25" ry="5" fill="black" className="animate-pet-shadow" />
        
        {/* 身体容器 - 包含呼吸动画 */}
        <g className="animate-pet-breath">
          
          {/* 光环 (Lv.15+) */}
          {showHalo && (
            <ellipse cx="50" cy="15" rx="20" ry="6" fill="none" stroke="#fbbf24" strokeWidth="3" opacity="0.8" />
          )}

          {/* 翅膀 (Lv.5+) */}
          {showWings && (
            <g fill={color} opacity="0.7">
              {/* 左翅膀 */}
              <path d="M 30 50 Q 10 30 15 55 Q 25 60 30 50" />
              {/* 右翅膀 */}
              <path d="M 70 50 Q 90 30 85 55 Q 75 60 70 50" />
            </g>
          )}

          {/* 头顶触角 (Lv.10+) */}
          {showAntenna && (
            <g stroke={color} strokeWidth="3" fill="none" strokeLinecap="round">
              <path d="M 50 30 Q 50 15 60 20" />
              <circle cx="60" cy="20" r="3" fill={color} />
            </g>
          )}

          {/* 主身体 (类似水滴/豆子形状) */}
          <path 
            d="M 25 50 C 25 25, 75 25, 75 50 C 75 80, 65 85, 50 85 C 35 85, 25 80, 25 50 Z" 
            fill={color} 
          />

          {/* 肚皮高光 */}
          <path 
            d="M 35 45 C 35 30, 65 30, 65 45 C 65 65, 55 70, 50 70 C 45 70, 35 65, 35 45 Z" 
            fill="white" 
            opacity="0.15" 
          />

          {/* 面部 */}
          <g>
            {/* 眼睛 */}
            <g className="animate-pet-blink">
              {isSad ? (
                // 难过/饥饿时的眼睛 (><)
                <g stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none">
                  <path d="M 36 46 L 42 50 L 36 54" />
                  <path d="M 64 46 L 58 50 L 64 54" />
                </g>
              ) : isPlaying || isFeeding ? (
                // 开心时的眼睛 (^^)
                <g stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none">
                  <path d="M 36 52 Q 39 46 42 52" />
                  <path d="M 58 52 Q 61 46 64 52" />
                </g>
              ) : (
                // 正常眼睛
                <g fill="#1f2937">
                  <circle cx="39" cy="50" r="4" />
                  <circle cx="61" cy="50" r="4" />
                  {/* 眼神高光 */}
                  <circle cx="40" cy="48" r="1.5" fill="white" />
                  <circle cx="62" cy="48" r="1.5" fill="white" />
                </g>
              )}
            </g>

            {/* 腮红 */}
            <circle cx="32" cy="56" r="3.5" fill="#f43f5e" opacity="0.4" />
            <circle cx="68" cy="56" r="3.5" fill="#f43f5e" opacity="0.4" />

            {/* 嘴巴 */}
            {isSad ? (
              // 难过嘴巴
              <path d="M 46 64 Q 50 60 54 64" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
            ) : isFeeding ? (
              // 吃饭/开心嘴巴 (张开)
              <path d="M 45 60 Q 50 68 55 60 Z" fill="#1f2937" />
            ) : (
              // 正常微笑
              <path d="M 46 60 Q 50 64 54 60" fill="none" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </g>

        </g>
      </svg>
    </div>
  );
};
