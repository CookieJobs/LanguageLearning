import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getMasteryCount, fetchProgress } from '../services/geminiService';
import { EducationLevel } from '../types';
import { Trophy, Target, BookOpen, ChevronRight, Zap } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isLoading, streak, startNextSession, level: currentLevel, handleLevelSelect, loadError, selectedTextbook } = useApp();
  const navigate = useNavigate();
  const [masteryCount, setMasteryCount] = useState<number>(0)
  const [contextProgress, setContextProgress] = useState<{ mastered: number, total: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [res, prog] = await Promise.all([
          getMasteryCount(),
          fetchProgress(currentLevel || undefined, selectedTextbook || undefined)
        ])
        setMasteryCount(res.count || 0)
        if (prog) setContextProgress({ mastered: prog.masteredCount, total: prog.totalCount })
      } catch { }
    })()
  }, [currentLevel, selectedTextbook])

  return (
    <div className="pb-16">
      <main className="max-w-5xl mx-auto px-5 py-6">
        <div className="mb-8 animate-fade-in flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">
              准备好学习了吗？
            </h2>
            <p className="text-gray-500 font-medium">挑选您的挑战级别，开始精进</p>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold animate-fade-in">
            {loadError.message}
          </div>
        )}

        {/* Main Action Area (Hero) */}
        <div className="relative group overflow-hidden rounded-3xl shadow-xl animate-scale-in mb-10">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>

          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500 rounded-full blur-[80px] opacity-25 translate-x-1/3 -translate-y-1/3 group-hover:opacity-35 transition-opacity duration-700"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent-500 rounded-full blur-[60px] opacity-20 -translate-x-1/3 translate-y-1/3"></div>

          <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-md text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-xs font-semibold uppercase tracking-wider mb-4">
                <Zap size={12} className="text-amber-300" />
                推荐练习
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight tracking-tight">
                {selectedTextbook ? selectedTextbook.split('2024')[1] || selectedTextbook : `${levelLabelShort(currentLevel)}词汇挑战`}
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed font-medium">
                挑战属于您的单词库，强化记忆链接。
              </p>
            </div>

            <button
              disabled={isLoading}
              onClick={async () => { navigate('/learn'); if (!isLoading) await startNextSession(); }}
              className={`flex items-center gap-3 px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 ${isLoading
                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                : 'bg-white text-gray-900 hover:scale-[1.03] hover:shadow-2xl hover:shadow-white/10 active:scale-[0.98]'
                }`}
            >
              <span>立即开始</span>
              <div className="bg-brand-500 rounded-full p-1 text-white">
                <ChevronRight size={20} />
              </div>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {/* Streak Card */}
          <div className="glass-card p-6 rounded-2xl flex items-center justify-between hover:-translate-y-0.5 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl text-orange-600 shadow-sm group-hover:shadow-md transition-shadow">
                <Target size={24} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{streak} <span className="text-base font-medium text-gray-400">天</span></div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider">连续坚持</div>
              </div>
            </div>
          </div>

          {/* Contextual Progress Card */}
          <div onClick={() => navigate('/review')} className="glass-card p-6 rounded-2xl flex flex-col justify-center hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group hover:border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl text-emerald-600 shadow-sm group-hover:shadow-md group-hover:from-emerald-200 group-hover:to-teal-200 transition-all">
                  <Trophy size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {contextProgress ? contextProgress.mastered : 0}
                    <span className="text-base font-medium text-gray-400"> / {contextProgress ? contextProgress.total : 0} 词</span>
                  </div>
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                    学习进度
                    <span className="text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                      {selectedTextbook ? '当前教材' : '当前学段'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-emerald-600">
                <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${contextProgress ? (contextProgress.mastered / (contextProgress.total || 1)) * 100 : 0}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
};

function levelLabelShort(l: any): string {
  switch (l) {
    case EducationLevel.PRIMARY: return '小学'
    case EducationLevel.MIDDLE: return '初中'
    case EducationLevel.HIGH: return '高中'
    case EducationLevel.UNIVERSITY: return '大学'
    case EducationLevel.PROFESSIONAL: return '职场/留学'
    default: return '外语'
  }
}
