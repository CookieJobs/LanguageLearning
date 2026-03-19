import React, { useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import { Card } from './Card';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-gray-100 shrink-0">
          <div className="flex-1 pr-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center flex-wrap gap-2">
              <span className="bg-brand-100 text-brand-600 p-2 rounded-xl shrink-0">
                <BookOpen size={18} className="sm:w-5 sm:h-5" />
              </span>
              <span>{label}单词</span>
              <span className="text-xs sm:text-sm font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-gray-100 text-gray-600">
                {words.length}
              </span>
            </h3>
            {description && (
              <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-1 sm:ml-[44px]">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {words.map((item, index) => (
                <Card key={index} className="p-4 border border-gray-100 hover:border-brand-200 shadow-sm transition-colors">
                  <div className="font-bold text-lg text-gray-900 mb-1">
                    {item.word}
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {item.definition}
                  </div>
                  {/* Additional info tags if needed */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.wrongCount !== undefined && item.wrongCount > 0 && category === 'struggling' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-50 text-red-600 font-medium">
                        错误次数: {item.wrongCount}
                      </span>
                    )}
                    {item.stage !== undefined && (category === 'learning' || category === 'toReview') && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 font-medium">
                        记忆阶段: {item.stage}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-gray-300" />
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
