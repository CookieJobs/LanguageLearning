// WordProgressBar - 单词进度条组件
// 用进度条替代四色标签，直观展示单词从新词到掌握的全流程
// Stage 0 = 0%, Stage 1 = 33%, Stage 2 = 66%, Stage 3 = 100%

import React from 'react';

export interface WordProgressBarProps {
  /** 当前 stage (0-3) */
  stage: number;
  /** 是否显示标签 */
  showLabel?: boolean;
  /** 高度 */
  height?: number;
  /** 是否显示节点标记 */
  showNodes?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 进度条填充的百分比 (0-100)，默认根据 stage 计算 */
  percent?: number;
}

const STAGE_CONFIG = {
  0: { label: '新词', color: '#d1d5db', bgColor: '#f3f4f6', textColor: '#6b7280', marker: '#9ca3af' },
  1: { label: '学过', color: '#60a5fa', bgColor: '#eff6ff', textColor: '#3b82f6', marker: '#3b82f6' },
  2: { label: '进阶', color: '#a78bfa', bgColor: '#f5f3ff', textColor: '#8b5cf6', marker: '#8b5cf6' },
  3: { label: '掌握', color: '#34d399', bgColor: '#ecfdf5', textColor: '#059669', marker: '#059669' },
};

export const WordProgressBar: React.FC<WordProgressBarProps> = ({
  stage,
  showLabel = true,
  height = 8,
  showNodes = true,
  className = '',
  percent: customPercent,
}) => {
  const clampedStage = Math.max(0, Math.min(3, stage));
  const config = STAGE_CONFIG[clampedStage as keyof typeof STAGE_CONFIG];
  
  // 计算百分比: stage 0=0%, 1=33%, 2=66%, 3=100%
  const defaultPercent = [0, 33, 66, 100][clampedStage];
  const percent = customPercent ?? defaultPercent;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 进度条主体 */}
      <div className="flex-1 relative">
        {/* 背景轨道 */}
        <div 
          className="w-full rounded-full overflow-hidden relative"
          style={{ height: `${height}px`, backgroundColor: '#e5e7eb' }}
        >
          {/* 填充 */}
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${percent}%`, 
              backgroundColor: config.color,
            }}
          />
        </div>

        {/* 节点标记 */}
        {showNodes && (
          <div className="absolute inset-0 flex items-center justify-between px-0" style={{ height: `${height}px` }}>
            {[0, 1, 2, 3].map((nodeStage) => (
              <div
                key={nodeStage}
                className="relative"
                style={{
                  width: `${height + 4}px`,
                  height: `${height + 4}px`,
                  transform: 'translateY(-50%)',
                  top: '50%',
                  left: nodeStage === 0 ? '0' : nodeStage === 3 ? 'calc(100% - 12px)' : `${(nodeStage / 3) * 100}%`,
                  marginLeft: nodeStage === 0 ? '0' : nodeStage === 3 ? '0' : '-6px',
                }}
              >
                <div
                  className={`w-full h-full rounded-full border-2 transition-all duration-300 ${
                    nodeStage <= clampedStage 
                      ? 'border-transparent' 
                      : 'border-gray-300 bg-white'
                  }`}
                  style={{
                    backgroundColor: nodeStage <= clampedStage ? STAGE_CONFIG[nodeStage as keyof typeof STAGE_CONFIG].marker : undefined,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 标签 */}
      {showLabel && (
        <div 
          className="text-xs font-bold px-2 py-0.5 rounded-md shrink-0"
          style={{ 
            backgroundColor: config.bgColor, 
            color: config.textColor,
            minWidth: '44px',
            textAlign: 'center',
          }}
        >
          {config.label}
        </div>
      )}
    </div>
  );
};

export default WordProgressBar;
