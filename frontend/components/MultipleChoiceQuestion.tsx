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
                   className += "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md shadow-emerald-500/10";
                } else if (isSelected) {
                   className += "border-red-500 bg-red-50 text-red-900";
                } else {
                   className += "border-gray-100 text-gray-400 opacity-60";
                }
             } else {
                if (isSelected) {
                   className += "border-brand-500 bg-brand-50 text-brand-900 shadow-lg shadow-brand-500/10 ring-1 ring-brand-500/20 scale-[1.01]";
                } else {
                   className += "border-gray-200 hover:border-brand-300 hover:bg-gray-50 text-gray-700 hover:shadow-sm active:scale-[0.99]";
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
                    {showFeedback && isCorrect && <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />}
                    {showFeedback && isSelected && !isCorrect && <XCircle className="text-red-500 shrink-0" size={24} />}
                    {!showFeedback && isSelected && <div className="w-6 h-6 rounded-full border-[6px] border-brand-500 shrink-0"></div>}
                    {!showFeedback && !isSelected && <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-brand-300 shrink-0"></div>}
                 </div>
               </button>
             )
          })}
       </div>
    </div>
  );
};
