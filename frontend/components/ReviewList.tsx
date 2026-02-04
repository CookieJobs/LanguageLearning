// input: react, ../types, ../services/geminiService, lucide-react, ./StoryModal
// output: ReviewList (带来源等级展示)
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React, { useEffect, useState } from 'react';
import { MasteredItem, EducationLevel } from '../types';
import { fetchMasteryList, generateStory } from '../services/geminiService';
import { CheckCircle2, Quote, Sparkles, ArrowLeft, BookOpen, Layers } from 'lucide-react';
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
        // 这里的 list 后端已更新 sourceLevel 字段
        const mapped: MasteredItem[] = list.map((x: any) => ({
          word: x.word,
          definition: x.definition,
          partOfSpeech: x.partOfSpeech,
          example: x.example,
          userSentence: x.userSentence,
          masteredAt: x.masteredAt,
          sourceLevel: x.sourceLevel as EducationLevel
        }))
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

  const getSourceLabel = (level?: string) => {
    if (!level) return null;
    const map: any = {
      [EducationLevel.PRIMARY]: '小学',
      [EducationLevel.MIDDLE]: '初中',
      [EducationLevel.HIGH]: '高中',
      [EducationLevel.UNIVERSITY]: '大学',
      [EducationLevel.PROFESSIONAL]: '职场/留学',
      'Primary': '小学', 'Middle': '初中', 'High': '高中', 'University': '大学', 'Professional': '职场'
    };
    return map[level] || level;
  };

  const displayed: MasteredItem[] = serverItems
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in relative z-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">已掌握词汇</h2>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenerateStory}
            disabled={displayed.length === 0}
            className={`flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 via-accent-500 to-brand-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:scale-[1.02] transition-all active:scale-95 ${displayed.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Sparkles size={16} />
            故事模式
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm"
          >
            <ArrowLeft size={16} /> 返回
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
        <div className="text-center py-20 glass-card rounded-3xl border-2 border-dashed border-gray-200">
          <div className="mb-5 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 text-gray-400">
            <BookOpen size={28} />
          </div>
          <p className="text-gray-900 font-bold text-lg">暂无已掌握单词</p>
          <p className="text-gray-500 text-sm mt-2">快去开始学习积累词汇吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.map((item, index) => (
            <div key={index} className="glass-card p-5 rounded-2xl hover:-translate-y-0.5 transition-all duration-300 group cursor-default h-full flex flex-col">
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{item.word}</h3>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-600 px-2 py-0.5 rounded-md border border-brand-100">{item.partOfSpeech}</span>
                    {item.sourceLevel && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md border border-amber-100 flex items-center gap-1">
                        <Layers size={8} />
                        {getSourceLabel(item.sourceLevel)}
                      </span>
                    )}
                  </div>
                </div>
                <CheckCircle2 className="text-emerald-400 group-hover:text-emerald-500 transition-colors" size={20} />
              </div>
              <p className="text-gray-500 text-sm mb-3 line-clamp-2 leading-relaxed flex-1">{item.definition}</p>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3.5 relative border border-gray-100">
                <Quote size={12} className="absolute top-2.5 left-2.5 text-brand-200" />
                <p className="text-gray-700 text-sm italic pl-4 relative z-10">"{item.userSentence}"</p>
              </div>
              <div className="mt-3.5 pt-3 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-medium uppercase tracking-wider">
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
