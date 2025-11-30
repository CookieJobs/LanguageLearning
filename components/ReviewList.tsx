import React from 'react';
import { MasteredItem } from '../types';
import { CheckCircle2, Quote } from 'lucide-react';

interface ReviewListProps {
  items: MasteredItem[];
  onBack: () => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({ items, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">已掌握的单词</h2>
        <button onClick={onBack} className="text-indigo-600 hover:underline font-medium">
          返回学习
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">您还没有掌握任何单词。</p>
          <p className="text-gray-400 text-sm mt-2">快去开始学习吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{item.word}</h3>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{item.partOfSpeech}</span>
                </div>
                <CheckCircle2 className="text-emerald-500 opacity-20" size={24} />
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2" title={item.definition}>{item.definition}</p>
              
              <div className="bg-indigo-50 rounded-lg p-3 relative">
                 <Quote size={16} className="absolute top-2 left-2 text-indigo-200" />
                 <p className="text-indigo-900 text-sm italic pl-6 relative z-10">"{item.userSentence}"</p>
              </div>
              <div className="mt-3 text-right">
                <span className="text-xs text-gray-400">掌握时间：{new Date(item.masteredAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};