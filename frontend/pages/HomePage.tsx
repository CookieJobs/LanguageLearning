import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getMasteryCount } from '../services/geminiService';
import { Trophy, Target, BookOpen, ArrowRight, Sparkles, Zap } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isLoading, streak, startNextSession, level } = useApp();
  const navigate = useNavigate();
  const [masteryCount, setMasteryCount] = useState<number>(0)

  useEffect(() => {
    (async () => {
      try {
        const res = await getMasteryCount()
        setMasteryCount(res.count || 0)
      } catch { }
    })()
  }, [])

  return (
    <div className="pb-20">
      <main className="max-w-5xl mx-auto px-6 py-4">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight mb-2">
            准备好学习了吗？
          </h2>
          <p className="text-gray-500 font-medium">每一天都是进步的机会。</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Streak Card */}
          <div className="glass-card p-6 rounded-3xl flex flex-col items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600 shadow-sm">
              <Target size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-900">{streak} <span className="text-lg font-medium text-gray-400">天</span></div>
              <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">连续坚持</div>
            </div>
          </div>

          {/* Mastery Card */}
          <div onClick={() => navigate('/review')} className="glass-card p-6 rounded-3xl flex flex-col items-start gap-4 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group hover:border-emerald-200">
            <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600 shadow-sm group-hover:bg-emerald-200 transition-colors">
              <Trophy size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-gray-900">{masteryCount} <span className="text-lg font-medium text-gray-400">词</span></div>
              <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">已掌握</div>
            </div>
          </div>

          {/* Level Card */}
          <div className="glass-card p-6 rounded-3xl flex flex-col items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="p-3 bg-brand-100 rounded-2xl text-brand-600 shadow-sm">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 truncate max-w-full leading-tight">{levelLabel(level)}</div>
              <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1">当前等级</div>
            </div>
          </div>
        </div>

        {/* Main Action Area */}
        <div className="relative group overflow-hidden rounded-[2rem] shadow-2xl shadow-brand-500/20 animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>

          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-[100px] opacity-30 translate-x-1/3 -translate-y-1/3 group-hover:opacity-40 transition-opacity duration-700"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full blur-[80px] opacity-20 -translate-x-1/3 translate-y-1/3"></div>

          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-bold uppercase tracking-widest mb-6">
                <Sparkles size={12} className="text-yellow-300" />
                每日推荐
              </div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                核心词汇训练
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-2">
                基于艾宾浩斯记忆曲线的个性化练习。
              </p>
            </div>

            <button
              disabled={isLoading}
              onClick={async () => { navigate('/learn'); await startNextSession(); }}
              className={`group/btn relative flex items-center gap-3 px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-300 ${isLoading
                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                : 'bg-white text-gray-900 hover:scale-[1.03] hover:shadow-xl hover:shadow-white/10 active:scale-[0.98]'
                }`}
            >
              <Zap className={`w-5 h-5 ${isLoading ? '' : 'text-yellow-500 group-hover/btn:fill-yellow-500 transition-colors'}`} />
              <span>开始学习</span>
              <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
};

function levelLabel(l: import('../types').EducationLevel): string {
  switch (l) {
    case 'Primary School (小学)': return '小学 (Primary)'
    case 'Junior High School (初中)': return '初中 (Junior High)'
    case 'Senior High School (高中)': return '高中 (Senior High)'
    case 'University (大学/四六级)': return '大学 (University)'
    case 'Professional/Study Abroad (雅思/托福/职场)': return '职场/留学 (Professional)'
    default: return String(l)
  }
}
