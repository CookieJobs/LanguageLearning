import React from 'react';
import { Card } from './Card';
import { ProgressStats } from '../types';
import { Book, RefreshCw, AlertCircle, ChevronRight, Trophy } from 'lucide-react';

export interface DashboardProgressProps {
  /** 用户的进度统计数据 */
  stats?: ProgressStats | null;
  /** 数据是否正在加载中 */
  isLoading?: boolean;
  /** 点击具体分类时的回调函数 */
  onCategoryClick?: (category: string) => void;
  /** 整体点击时的回调函数（用于跳转） */
  onClick?: () => void;
}

export const DashboardProgress: React.FC<DashboardProgressProps> = ({
  stats,
  isLoading,
  onCategoryClick,
  onClick
}) => {
  const handleCategoryClick = (e: React.MouseEvent, category: string) => {
    if (onClick) {
      e.stopPropagation();
    }
    onCategoryClick?.(category);
  };

  // Skeleton Loader
  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6 w-full animate-pulse">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
        </div>
        
        {/* Progress Bar Skeleton */}
        <div className="h-4 w-full bg-gray-200 rounded-full mb-4"></div>
        
        {/* Legend Skeleton */}
        <div className="flex gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Action Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </Card>
    );
  }

  // Empty State
  if (!stats || stats.totalCount === 0) {
    return (
      <Card className="p-6 sm:p-8 w-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Book className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-2">暂无学习数据</h3>
        <p className="text-sm sm:text-base text-gray-500 max-w-sm">
          开始你的第一次学习旅程，探索新单词并记录你的进度！
        </p>
      </Card>
    );
  }

  // Calculations
  const total = stats.totalCount;
  const masteredPercent = Math.round((stats.mastered / total) * 100) || 0;
  const learningPercent = Math.round((stats.learning / total) * 100) || 0;
  // Ensure the sum doesn't exceed 100% due to rounding, and calculate new percent
  const newPercent = Math.max(0, 100 - masteredPercent - learningPercent);

  return (
    <Card 
      className="p-4 sm:p-6 w-full group"
      onClick={onClick}
      hoverable={!!onClick}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-400 fill-current" size={24} />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">学习进度</h2>
          {onClick && (
            <div className="text-duo-green bg-green-50 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
               <ChevronRight size={18} strokeWidth={3} />
            </div>
          )}
        </div>
        <span className="self-start sm:self-auto text-xs sm:text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          总词汇: {total}
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="relative h-4 w-full bg-gray-100 rounded-full mb-4 overflow-hidden flex">
        {masteredPercent > 0 && (
          <div 
            className="h-full bg-duo-green transition-all duration-500 border-r border-white/20 last:border-r-0 cursor-pointer hover:brightness-110" 
            style={{ width: `${masteredPercent}%` }}
            title={`已掌握: ${stats.mastered}`}
            onClick={(e) => handleCategoryClick(e, 'mastered')}
          />
        )}
        {learningPercent > 0 && (
          <div 
            className="h-full bg-duo-blue transition-all duration-500 border-r border-white/20 last:border-r-0 cursor-pointer hover:brightness-110" 
            style={{ width: `${learningPercent}%` }}
            title={`学习中: ${stats.learning}`}
            onClick={(e) => handleCategoryClick(e, 'learning')}
          />
        )}
        {newPercent > 0 && (
          <div 
            className="h-full bg-gray-200 transition-all duration-500 cursor-pointer hover:brightness-95" 
            style={{ width: `${newPercent}%` }}
            title={`新词: ${stats.new}`}
            onClick={(e) => handleCategoryClick(e, 'new')}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm">
        <div 
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => handleCategoryClick(e, 'mastered')}
        >
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-duo-green"></div>
          <span className="font-medium text-gray-700">已掌握 ({masteredPercent}%)</span>
        </div>
        <div 
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => handleCategoryClick(e, 'learning')}
        >
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-duo-blue"></div>
          <span className="font-medium text-gray-700">学习中 ({learningPercent}%)</span>
        </div>
        <div 
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => handleCategoryClick(e, 'new')}
        >
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-300"></div>
          <span className="font-medium text-gray-700">新词 ({newPercent}%)</span>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card 
          hoverable 
          className={`p-4 border-2 ${stats.toReview > 0 ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50'} shadow-none`}
          onClick={(e) => handleCategoryClick(e, 'toReview')}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className={`w-4 h-4 ${stats.toReview > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className={`font-bold ${stats.toReview > 0 ? 'text-orange-700' : 'text-gray-500'}`}>
                  待复习
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">巩固记忆曲线</p>
            </div>
            <span className={`text-2xl font-black ${stats.toReview > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
              {stats.toReview}
            </span>
          </div>
        </Card>

        <Card 
          hoverable 
          className={`p-4 border-2 ${stats.struggling > 0 ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'} shadow-none`}
          onClick={(e) => handleCategoryClick(e, 'struggling')}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className={`w-4 h-4 ${stats.struggling > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                <span className={`font-bold ${stats.struggling > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                  易错词
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">重点突破难点</p>
            </div>
            <span className={`text-2xl font-black ${stats.struggling > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {stats.struggling}
            </span>
          </div>
        </Card>
      </div>
    </Card>
  );
};

export default DashboardProgress;
