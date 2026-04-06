// input: react, ../types, ../services/geminiService, lucide-react, ./StoryModal
// output: ReviewList (带来源等级展示)
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React, { useEffect, useState } from 'react';
import { MasteredItem, EducationLevel } from '../types';
import { fetchMasteryList } from '../services/geminiService';
import { CheckCircle2, Quote, BookOpen, Layers } from 'lucide-react';

interface ReviewListProps { items: MasteredItem[]; }

export const ReviewList: React.FC<ReviewListProps> = ({ items }) => {
  const [serverItems, setServerItems] = useState<MasteredItem[]>(items);

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

  const getSourceLabel = (level?: string) => {
    if (!level) return null;
    const map: any = {
      [EducationLevel.PRIMARY]: '小学',
      [EducationLevel.MIDDLE]: '初中',
      [EducationLevel.HIGH]: '高中',
      [EducationLevel.UNIVERSITY]: '四级',
      [EducationLevel.PROFESSIONAL]: '六级',
      'Primary': '小学', 'Middle': '初中', 'High': '高中', 'University': '四级', 'Professional': '六级'
    };
    return map[level] || level;
  };

  const displayed: MasteredItem[] = serverItems
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in relative z-10">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">已掌握词汇</h2>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-20 bg-white border-2 border-gray-200 border-b-4 rounded-xl">
          <div className="mb-5 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 text-gray-400">
            <BookOpen size={28} />
          </div>
          <p className="text-gray-900 font-bold text-lg">暂无已掌握单词</p>
          <p className="text-gray-500 text-sm mt-2">快去开始学习积累词汇吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.map((item, index) => (
            <div key={index} className="bg-white border-2 border-gray-200 border-b-4 rounded-xl p-4 mb-3 hover:-translate-y-0.5 transition-all duration-300 group cursor-default h-full flex flex-col">
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{item.word}</h3>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-600 px-2 py-0.5 rounded-md border border-brand-100">{item.partOfSpeech}</span>
                    {item.sourceLevel && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-duo-yellow/10 text-duo-orange px-2 py-0.5 rounded-md border border-duo-yellow/20 flex items-center gap-1">
                        <Layers size={8} />
                        {getSourceLabel(item.sourceLevel)}
                      </span>
                    )}
                  </div>
                </div>
                <CheckCircle2 className="text-duo-green group-hover:text-duo-green transition-colors" size={20} />
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
