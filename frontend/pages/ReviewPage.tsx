import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProgress, fetchTextbooks } from '../services/geminiService';
import { EducationLevel, ProgressStats, MasteredItem } from '../types';
import { ArrowLeft, BookOpen, Filter, CheckCircle2 } from 'lucide-react';
import { ReviewList } from '../components/ReviewList';

import { useApp } from '../contexts/AppContext';

export const ReviewPage: React.FC = () => {
  const { level: contextLevel, selectedTextbook } = useApp();
  const navigate = useNavigate();
  const [level, setLevel] = useState<EducationLevel | string>(contextLevel || 'Primary');
  const [textbook, setTextbook] = useState<string>(selectedTextbook || '');
  const [textbooks, setTextbooks] = useState<string[]>([]);
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTextbooks().then(setTextbooks).catch(() => { });
  }, []);

  useEffect(() => {
    loadProgress();
  }, [level, textbook]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const data = await fetchProgress(level, textbook || undefined);
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const levelOptions = [
    { value: 'Primary', label: '小学' },
    { value: 'Middle', label: '初中' },
    { value: 'High', label: '高中' },
    { value: 'University', label: '四级' },
    { value: 'Professional', label: '六级' },
  ];

  // Convert stats list to MasteredItem format for ReviewList
  const reviewItems: MasteredItem[] = stats?.list.filter(w => w.mastered).map(w => ({
    word: w.word,
    definition: w.definition,
    partOfSpeech: '', // Backend doesn't return POS in progress list yet, maybe update service? Or just optional
    example: '',
    userSentence: '已掌握',
    masteredAt: w.lastMastered || new Date().toISOString(),
    sourceLevel: level
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">学习进度</h1>
            <div className="w-8" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {levelOptions.map(l => (
              <button
                key={l.value}
                onClick={() => { setLevel(l.value); if (l.value !== 'Middle') setTextbook(''); }}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${level === l.value
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {level === 'Middle' && textbooks.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setTextbook('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${!textbook ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-gray-200 text-gray-500'
                  }`}
              >
                全部教材
              </button>
              {textbooks.map(t => (
                <button
                  key={t}
                  onClick={() => setTextbook(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${textbook === t ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-gray-200 text-gray-500'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress Card */}
        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-brand-900/10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BookOpen size={120} />
          </div>
          <div className="relative z-10">
            <div className="text-brand-100 font-medium mb-1 flex items-center gap-2">
              <Filter size={14} />
              {levelOptions.find(l => l.value === level)?.label} {textbook ? `• ${textbook}` : ''}
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold">{stats?.masteredCount || 0}</span>
              <span className="text-brand-200">/ {stats?.totalCount || 0} 词</span>
            </div>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-white/90 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats?.totalCount ? Math.min(100, (stats.masteredCount / stats.totalCount) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Word List */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" size={20} />
                已掌握 ({reviewItems.length})
              </h3>
              {reviewItems.length > 0 ? (
                <ReviewList items={reviewItems} onBack={() => { }} />
              ) : (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 text-gray-400 text-sm">
                  还没有掌握本阶段的单词
                </div>
              )}
            </div>

            {/* Optional: Show unmastered words list? 
                    The user asked to see "what words represent this level".
                    Let's show unmastered words as a simple list.
                */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 text-gray-400">
                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                未掌握 ({params(stats?.totalCount || 0) - (stats?.masteredCount || 0)})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {stats?.list.filter(w => !w.mastered).slice(0, 50).map((w, i) => (
                  <div key={i} className="p-3 bg-white border border-gray-100 rounded-xl text-gray-500 opacity-60">
                    <div className="font-bold text-sm">{w.word}</div>
                    <div className="text-xs truncate">{w.definition}</div>
                  </div>
                ))}
                {(stats?.list.filter(w => !w.mastered).length || 0) > 50 && (
                  <div className="col-span-full text-center text-xs text-gray-400 py-2">
                    ... 还有 {(stats?.list.filter(w => !w.mastered).length || 0) - 50} 个单词
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function params(n: number) { return n }
