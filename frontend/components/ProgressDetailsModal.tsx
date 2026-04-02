import React, { useEffect } from 'react';
import { X, BookOpen, Clock, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { WordProgressBar } from './WordProgressBar';

export interface ProgressWordItem {
  word: string;
  definition: string;
  mastered?: boolean;
  learning?: boolean;
  toReview?: boolean;
  struggling?: boolean;
  masteryCount?: number;
  lastMastered?: string | null;
  stage?: number;
  wrongCount?: number;
  nextReviewAt?: string | null;
  consecutiveCorrect?: number;
  exposureCount?: number;
}

interface ProgressDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  words: ProgressWordItem[];
}

const categoryLabels: Record<string, string> = {
  mastered: '已掌握',
  learning: '学习中',
  new: '新词',
  toReview: '待复习',
  struggling: '易错词',
};

const categoryDescriptions: Record<string, string> = {
  mastered: '你已经完全掌握的单词',
  learning: '正在学习中的单词',
  new: '即将学习的新单词',
  toReview: '根据记忆曲线需要复习的单词',
  struggling: '经常出错需要重点突破的单词',
};

// 分类对应的强调色
const categoryAccents: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  mastered: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', icon: <CheckCircle2 size={16} /> },
  learning: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', icon: <RefreshCw size={16} /> },
  new: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500', icon: <BookOpen size={16} /> },
  toReview: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', icon: <Clock size={16} /> },
  struggling: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', icon: <AlertTriangle size={16} /> },
};

export const ProgressDetailsModal: React.FC<ProgressDetailsModalProps> = ({
  isOpen,
  onClose,
  category,
  words
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const label = categoryLabels[category] || category;
  const description = categoryDescriptions[category] || '';
  const accent = categoryAccents[category] || categoryAccents.new;

  // 计算进度条百分比的辅助函数
  const getStagePercent = (stage: number) => {
    const s = stage ?? 0;
    return [0, 33, 66, 100][Math.min(3, Math.max(0, s))];
  };

  // 格式化下次复习时间
  const formatNextReview = (nextReviewAt: string | null | undefined) => {
    if (!nextReviewAt) return null;
    const date = new Date(nextReviewAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs <= 0) return '待复习';
    if (diffDays > 0) return `${diffDays}天后`;
    if (diffHours > 0) return `${diffHours}小时后`;
    return '即将';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-in overflow-hidden">
        {/* Header */}
        <div className={`flex items-start justify-between p-4 sm:p-6 border-b border-gray-100 shrink-0 ${accent.bg}`}>
          <div className="flex-1 pr-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center flex-wrap gap-2">
              <span className={`${accent.bg} ${accent.text} p-2 rounded-xl shrink-0`}>
                {accent.icon}
              </span>
              <span>{label}单词</span>
              <span className={`text-xs sm:text-sm font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-white ${accent.text} border ${accent.border}`}>
                {words.length}
              </span>
            </h3>
            {description && (
              <p className={`text-xs sm:text-sm mt-2 sm:mt-1 sm:ml-[52px] ${accent.text}`}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
          {words.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {words.map((item, index) => (
                <Card 
                  key={index} 
                  className={`p-4 border-2 ${accent.border} hover:shadow-md transition-all duration-200`}
                >
                  {/* 单词和释义 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-lg text-gray-900 mb-0.5 truncate">
                        {item.word}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {item.definition}
                      </div>
                    </div>
                    
                    {/* 分类图标 */}
                    <div className={`ml-3 p-2 rounded-xl ${accent.bg} shrink-0`}>
                      <span className={accent.text}>{accent.icon}</span>
                    </div>
                  </div>

                  {/* 进度条 - 核心改动 */}
                  <div className="mb-3">
                    <WordProgressBar 
                      stage={item.stage ?? 0} 
                      showLabel={true}
                      height={10}
                      showNodes={true}
                    />
                  </div>

                  {/* 元信息行 */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* 错误次数 */}
                    {item.wrongCount !== undefined && item.wrongCount > 0 && (
                      <span className="text-[11px] px-2 py-1 rounded-lg bg-red-50 text-red-600 font-medium flex items-center gap-1">
                        <AlertTriangle size={10} />
                        错{item.wrongCount}次
                      </span>
                    )}
                    
                    {/* 连续正确次数 */}
                    {item.consecutiveCorrect !== undefined && item.consecutiveCorrect > 0 && (
                      <span className="text-[11px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        连对{item.consecutiveCorrect}
                      </span>
                    )}

                    {/* 学习次数 */}
                    {item.exposureCount !== undefined && item.exposureCount > 0 && (
                      <span className="text-[11px] px-2 py-1 rounded-lg bg-blue-50 text-blue-600 font-medium flex items-center gap-1">
                        <RefreshCw size={10} />
                        学习{item.exposureCount}次
                      </span>
                    )}

                    {/* 下次复习时间 */}
                    {item.nextReviewAt && (
                      <span className={`text-[11px] px-2 py-1 rounded-lg ${
                        formatNextReview(item.nextReviewAt) === '待复习' 
                          ? 'bg-amber-50 text-amber-600' 
                          : 'bg-gray-50 text-gray-500'
                      } font-medium flex items-center gap-1 ml-auto`}>
                        <Clock size={10} />
                        {formatNextReview(item.nextReviewAt)}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className={`w-16 h-16 ${accent.bg} rounded-full flex items-center justify-center mb-4`}>
                <BookOpen className={`w-8 h-8 ${accent.text}`} />
              </div>
              <p className="text-gray-500 font-medium">
                当前分类下没有单词
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressDetailsModal;
