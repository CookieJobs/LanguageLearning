import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import PetDisplay from '../components/PetDisplay';
import { getMasteryCount, fetchProgress } from '../services/geminiService';
import { EducationLevel, ProgressStats } from '../types';
import { ChevronRight, Zap } from 'lucide-react';
import { DashboardProgress } from '../components/DashboardProgress';
import { ProgressDetailsModal, ProgressWordItem } from '../components/ProgressDetailsModal';

export const HomePage: React.FC = () => {
  const { isLoading, startNextSession, level: currentLevel, loadError, selectedTextbook } = useApp();
  const navigate = useNavigate();
  const [masteryCount, setMasteryCount] = useState<number>(0)
  const [contextProgress, setContextProgress] = useState<{ mastered: number, total: number } | null>(null);
  const [fullProgressStats, setFullProgressStats] = useState<ProgressStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalWords, setModalWords] = useState<ProgressWordItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setIsStatsLoading(true);
        const [res, prog] = await Promise.all([
          getMasteryCount(),
          fetchProgress(currentLevel || undefined, selectedTextbook || undefined)
        ])
        setMasteryCount(res.count || 0)
        if (prog) {
          setContextProgress({ mastered: prog.masteredCount, total: prog.totalCount });
          setFullProgressStats(prog);
        }
      } catch (err) {
        console.error("Failed to fetch progress", err);
      } finally {
        setIsStatsLoading(false);
      }
    })()
  }, [currentLevel, selectedTextbook])

  return (
    <div className="pb-16 bg-gray-50/50 min-h-screen">
      <main className="max-w-6xl mx-auto px-5 py-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Actions and Stats */}
          <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-8">
            
            {/* Main Action Area (Hero) */}
            <div className="relative group overflow-hidden rounded-3xl bg-duo-blue border-b-8 border-duo-blue-dark animate-scale-in">
              <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-md text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/20 text-white text-xs font-bold uppercase tracking-wider mb-4">
                    <Zap size={14} className="text-duo-yellow fill-current" />
                    推荐练习
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-sm">
                    {selectedTextbook ? selectedTextbook.split('2024')[1] || selectedTextbook : `${levelLabelShort(currentLevel)}词汇挑战`}
                  </h3>
                  <p className="text-blue-100 text-lg leading-relaxed font-bold">
                    挑战属于您的单词库，强化记忆链接。
                  </p>
                </div>

                <Button
                  disabled={isLoading}
                  onClick={async () => { navigate('/learn'); if (!isLoading) await startNextSession(); }}
                  variant="duo-primary"
                  className="px-10 py-5 text-xl h-auto"
                >
                  <span className="flex items-center gap-3">
                    <span>立即开始</span>
                    <div className="bg-white/20 rounded-lg p-1">
                        <ChevronRight size={24} strokeWidth={3} />
                    </div>
                  </span>
                </Button>
              </div>
            </div>

            {/* Dashboard Progress Component */}
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <DashboardProgress 
                stats={fullProgressStats} 
                isLoading={isStatsLoading} 
                onClick={() => navigate('/review')}
                onCategoryClick={(category) => {
                  if (fullProgressStats && fullProgressStats.list) {
                    let filtered: ProgressWordItem[] = [];
                    switch (category) {
                      case 'mastered':
                        filtered = fullProgressStats.list.filter(w => w.mastered);
                        break;
                      case 'learning':
                        filtered = fullProgressStats.list.filter(w => w.learning);
                        break;
                      case 'toReview':
                        filtered = fullProgressStats.list.filter(w => w.toReview);
                        break;
                      case 'struggling':
                        filtered = fullProgressStats.list.filter(w => w.struggling);
                        break;
                      case 'new':
                        filtered = fullProgressStats.list.filter(w => !w.mastered && !w.learning);
                        break;
                      default:
                        filtered = [];
                    }
                    setModalWords(filtered);
                    setSelectedCategory(category);
                    setIsModalOpen(true);
                  }
                }} 
              />
            </div>

          </div>

          {/* Right Column: Pet Display */}
          <div className="lg:col-span-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <PetDisplay />
          </div>
        </div>

      </main>

      <ProgressDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        words={modalWords}
      />
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
