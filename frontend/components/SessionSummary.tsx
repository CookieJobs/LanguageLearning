import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'
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
      // Pick up to 5 random words
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
      <div className="glass-card rounded-[2rem] shadow-2xl w-full max-w-lg p-8 animate-scale-in">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-gray-900 mb-1">学习完成！</h3>
          <p className="text-gray-500 font-medium">本次掌握内容：</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="inline-flex flex-col items-center justify-center bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 min-w-[100px]">
            <span className="text-2xl font-black">{count}</span>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">单词数</span>
          </div>
          <div className="inline-flex flex-col items-center justify-center bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl border border-amber-100 min-w-[100px]">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black">{streak}</span>
              {streakDelta > 0 && <span className="text-xs font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">+{streakDelta}</span>}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">连续打卡</span>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto pr-2 mb-8 custom-scrollbar space-y-3">
          {items.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
              <p className="text-gray-400 font-medium">本次暂无掌握单词。</p>
            </div>
          ) : (
            items.map((it, idx) => (
              <div key={idx} className="p-4 bg-white/50 rounded-xl border border-gray-100 hover:bg-white transition-colors">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-gray-900 text-lg">{it.word}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md">{it.partOfSpeech}</span>
                </div>
                <p className="text-sm text-gray-600 italic">"{it.userSentence}"</p>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3">
          {items.length > 0 && (
            <button
              onClick={handleGenerateStory}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Sparkles size={20} className="fill-white/20" />
              <span>生成AI故事 (Story Mode)</span>
            </button>
          )}

          <button
            onClick={onBackHome}
            className="w-full py-3.5 rounded-xl bg-white border-2 border-gray-100 text-gray-600 font-bold text-lg hover:bg-gray-50 hover:border-gray-200 transition-all"
          >
            返回主页
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
