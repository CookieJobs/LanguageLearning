// input: react, lucide-react, ../services/geminiService, ./StoryModal
// output: SessionSummary
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React, { useState } from 'react'
import { Sparkles, Trophy, Flame, Home } from 'lucide-react'
import { generateStory } from '../services/geminiService'
import { StoryModal } from './StoryModal'

interface SessionSummaryProps {
  items: Array<{ word: string; userSentence: string; masteredAt: string; partOfSpeech: string }>
  count: number
  streak: number
  streakDelta: number
  onBackHome: () => void
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({ items, count, streak, streakDelta, onBackHome }) => {
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [story, setStory] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | undefined>(undefined);
  const [loadingStory, setLoadingStory] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  const handleGenerateStory = async () => {
    if (items.length === 0) return;

    setLoadingStory(true);
    setStoryError(null);
    setStory(null);
    setTranslation(undefined);
    setShowStoryModal(true);

    try {
      const words = items.map(i => i.word);
      const shuffled = words.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);

      const res = await generateStory(selected);
      setStory(res.story);
      setTranslation(res.translation);
    } catch (e) {
      setStoryError('生成故事失败，请重试。');
    } finally {
      setLoadingStory(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-card rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-scale-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white mb-4 shadow-lg shadow-emerald-500/30">
            <Trophy size={28} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">学习完成！</h3>
          <p className="text-gray-500 font-medium text-sm">本次学习成果：</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 px-6 py-4 rounded-2xl border border-emerald-100 min-w-[110px]">
            <span className="text-3xl font-bold">{count}</span>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70 mt-1">单词数</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 px-6 py-4 rounded-2xl border border-amber-100 min-w-[110px]">
            <div className="flex items-center gap-1.5">
              <Flame size={20} className="text-orange-500" />
              <span className="text-3xl font-bold">{streak}</span>
              {streakDelta > 0 && <span className="text-xs font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full ml-1">+{streakDelta}</span>}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70 mt-1">连续打卡</span>
          </div>
        </div>

        <div className="max-h-52 overflow-y-auto pr-2 mb-6 space-y-2.5">
          {items.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <p className="text-gray-400 font-medium text-sm">本次暂无掌握单词</p>
            </div>
          ) : (
            items.map((it, idx) => (
              <div key={idx} className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors shadow-sm">
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="font-bold text-gray-900">{it.word}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-600 px-2 py-0.5 rounded-md border border-brand-100">{it.partOfSpeech}</span>
                </div>
                <p className="text-sm text-gray-500 italic line-clamp-2">"{it.userSentence}"</p>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3">
          {items.length > 0 && (
            <button
              onClick={handleGenerateStory}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-accent-500 to-brand-500 text-white font-bold hover:shadow-lg hover:shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              <span>生成 AI 故事</span>
            </button>
          )}

          <button
            onClick={onBackHome}
            className="w-full py-3.5 rounded-xl bg-white border-2 border-gray-100 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} />
            <span>返回主页</span>
          </button>
        </div>
      </div>

      {showStoryModal && (
        <StoryModal
          story={story}
          translation={translation}
          isLoading={loadingStory}
          error={storyError}
          onClose={() => setShowStoryModal(false)}
          onGenerate={handleGenerateStory}
        />
      )}
    </div>
  )
}
