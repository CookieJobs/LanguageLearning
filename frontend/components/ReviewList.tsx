import React, { useEffect, useState } from 'react';
import { MasteredItem } from '../types';
import { fetchMasteryList, generateStory } from '../services/geminiService';
import { CheckCircle2, Quote, Sparkles, ArrowLeft } from 'lucide-react';
import { StoryModal } from './StoryModal';

interface ReviewListProps { items: MasteredItem[]; onBack: () => void }

export const ReviewList: React.FC<ReviewListProps> = ({ items, onBack }) => {
  const [serverItems, setServerItems] = useState<MasteredItem[]>(items);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [story, setStory] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | undefined>(undefined);
  const [loadingStory, setLoadingStory] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchMasteryList();
        const mapped: MasteredItem[] = list.map((x: any) => ({ word: x.word, definition: x.definition, partOfSpeech: x.partOfSpeech, example: x.example, userSentence: x.userSentence, masteredAt: x.masteredAt }))
        setServerItems(mapped)
      } catch { setServerItems(items) }
    })()
  }, [])

  const handleGenerateStory = async () => {
    if (serverItems.length === 0) return;

    setLoadingStory(true);
    setStoryError(null);
    setStory(null);
    setTranslation(undefined);
    setShowStoryModal(true);

    try {
      // Pick up to 5 random words
      const words = serverItems.map(i => i.word);
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

  const displayed: MasteredItem[] = serverItems
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in relative z-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">已掌握词汇</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateStory}
            disabled={displayed.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full text-sm font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105 transition-all active:scale-95 ${displayed.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Sparkles size={18} className="fill-white/20" />
            故事模式
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} /> 返回主页
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

      {displayed.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-[2rem] border-dashed border-2 border-gray-200">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-400">
            <Quote size={32} />
          </div>
          <p className="text-gray-900 font-bold text-lg">暂无已掌握单词。</p>
          <p className="text-gray-500 text-sm mt-2">快去开始学习积累词汇吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayed.map((item, index) => (
            <div key={index} className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 group">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{item.word}</h3>
                  <span className="text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-2 py-1 rounded-md mt-1 inline-block border border-brand-100">{item.partOfSpeech}</span>
                </div>
                <CheckCircle2 className="text-emerald-400 group-hover:text-emerald-500 transition-colors" size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed" title={item.definition}>{item.definition}</p>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 relative border border-gray-100">
                <Quote size={14} className="absolute top-3 left-3 text-brand-200" />
                <p className="text-gray-800 text-sm italic pl-4 relative z-10 font-medium">"{item.userSentence}"</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-medium uppercase tracking-wider">
                <span>掌握时间</span>
                <span>{new Date(item.masteredAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
