// input: react, lucide-react, ../services/geminiService, ./StoryModal
// output: SessionSummary
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Sparkles, Trophy, Flame, Home } from 'lucide-react'
import { generateStory } from '../services/geminiService'
import { StoryModal } from './StoryModal'
import { usePet } from '../contexts/PetContext'

import { Button } from './Button'

interface SessionSummaryProps {
  items: Array<{ word: string; stage: 'new' | 'familiar' | 'mastered' }>
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
  
  const { refreshPet } = usePet();
  const [showEnergyRestored, setShowEnergyRestored] = useState(false);

  useEffect(() => {
    refreshPet();
    const timer = setTimeout(() => setShowEnergyRestored(true), 800);
    return () => clearTimeout(timer);
  }, [refreshPet]);

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

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in overflow-hidden">
      <div className="bg-white rounded-3xl border-2 border-gray-200 border-b-4 shadow-xl w-full max-w-lg p-8 animate-scale-in">
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 text-duo-green mb-4 border-2 border-duo-green border-b-4">
            <Trophy size={28} />
            {showEnergyRestored && (
                <div className="absolute -top-3 -right-16 bg-duo-yellow text-yellow-900 text-xs font-extrabold px-2 py-1 rounded-lg border-2 border-yellow-500 animate-bounce shadow-sm whitespace-nowrap z-10">
                    Energy Restored!
                </div>
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">学习成果</h3>
          <p className="text-gray-500 font-bold text-sm">本次学习情况：</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex flex-col items-center justify-center bg-gray-50 text-gray-700 px-6 py-4 rounded-2xl border-2 border-gray-200 border-b-4 min-w-[110px]">
            <span className="text-3xl font-extrabold">{count}</span>
            <span className="text-xs font-bold uppercase tracking-wider opacity-70 mt-1">单词数</span>
          </div>
          <div className="flex flex-col items-center justify-center bg-gray-50 text-gray-700 px-6 py-4 rounded-2xl border-2 border-gray-200 border-b-4 min-w-[110px]">
            <div className="flex items-center gap-1.5">
              <Flame size={20} className="text-orange-500 fill-orange-500" />
              <span className="text-3xl font-extrabold">{streak}</span>
              {streakDelta > 0 && <span className="text-xs font-bold bg-duo-yellow/30 text-duo-orange px-1.5 py-0.5 rounded-full ml-1">+{streakDelta}</span>}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-70 mt-1">连续打卡</span>
          </div>
        </div>

        <div className="max-h-52 overflow-y-auto pr-2 mb-6 space-y-2.5">
          {items.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <p className="text-gray-400 font-bold text-sm">本次暂无学习单词</p>
            </div>
          ) : (
            items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200 border-b-4 hover:border-gray-300 transition-colors">
                <span className="font-bold text-gray-900 text-lg">{it.word}</span>
                <div className="flex-shrink-0">
                  {it.stage === 'new' && <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">🌱 初识</span>}
                  {it.stage === 'familiar' && <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200">🌿 熟悉</span>}
                  {it.stage === 'mastered' && <span className="text-xs font-bold text-duo-orange bg-duo-yellow/20 px-2.5 py-1 rounded-full border border-duo-yellow/30">🌳 掌握</span>}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3">
          {items.length > 0 && (
            <Button
              onClick={handleGenerateStory}
              variant="secondary"
              className="w-full py-3.5"
            >
              <Sparkles size={18} />
              <span>生成 AI 故事</span>
            </Button>
          )}

          <Button
            onClick={onBackHome}
            variant="primary"
            className="w-full py-3.5"
          >
            <Home size={18} />
            <span>返回主页</span>
          </Button>
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
    </div>,
    document.body
  )
}
