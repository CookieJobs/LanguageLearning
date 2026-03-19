import React from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface MultipleChoiceQuestionProps {
  question: Question;
  selectedOptionId: string | null;
  onSelect: (id: string) => void;
  showFeedback: boolean;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  selectedOptionId,
  onSelect,
  showFeedback
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto animate-fade-in">
       <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-2 leading-relaxed">
         {question.questionText}
       </h2>
       
       <div className="grid grid-cols-1 gap-3 md:gap-4">
          {question.options?.map((opt, index) => {
             const isSelected = selectedOptionId === opt.id;
             const isCorrect = opt.isCorrect;
             
             let className = "p-4 md:p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between group ";
             
             if (showFeedback) {
                if (isCorrect) {
                   className += "border-duo-green bg-green-50 text-green-900 shadow-none border-b-4 border-[#46a302]";
                } else if (isSelected) {
                   className += "border-duo-red bg-red-50 text-red-900 shadow-none border-b-4 border-[#ea2b2b]";
                } else {
                   className += "border-gray-100 text-gray-400 opacity-60 border-b-2";
                }
             } else {
                if (isSelected) {
                   className += "border-duo-blue bg-sky-50 text-sky-900 ring-2 ring-duo-blue/20 border-b-4 border-[#1899d6] active:border-b-0 active:translate-y-1 active:ring-0";
                } else {
                   className += "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 border-b-4 border-gray-200 active:border-b-0 active:translate-y-1";
                }
             }

             return (
               <button
                 key={opt.id}
                 onClick={() => !showFeedback && onSelect(opt.id)}
                 disabled={showFeedback}
                 className={className}
               >
                 <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold border ${showFeedback ? 'border-transparent bg-black/5 text-black/40' : 'border-gray-200 bg-gray-50 text-gray-500 group-hover:bg-white'}`}>
                        {index + 1}
                    </span>
                    <span className="font-medium text-lg md:text-xl text-left">{opt.text}</span>
                 </div>
                 <div className="ml-auto flex items-center">
                    {showFeedback && isCorrect && <CheckCircle2 className="text-duo-green shrink-0" size={24} />}
                    {showFeedback && isSelected && !isCorrect && <XCircle className="text-duo-red shrink-0" size={24} />}
                    {!showFeedback && isSelected && <div className="w-6 h-6 rounded-full border-[6px] border-duo-blue shrink-0"></div>}
                    {!showFeedback && !isSelected && <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-duo-blue shrink-0"></div>}
                 </div>
               </button>
             )
          })}
       </div>
    </div>
  );
};
