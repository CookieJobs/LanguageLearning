import React, { useRef, useEffect } from 'react';
import { Question, FeedbackResponse } from '../types';
import { Edit3, Lightbulb, Sparkles } from 'lucide-react';

interface SentenceQuestionProps {
  question: Question;
  sentence: string;
  onSentenceChange: (val: string) => void;
  onSubmit: () => void;
  feedback: FeedbackResponse | null;
  isChecking: boolean;
  showHint: boolean;
  onToggleHint: () => void;
}

export const SentenceQuestion: React.FC<SentenceQuestionProps> = ({
  question,
  sentence,
  onSentenceChange,
  onSubmit,
  feedback,
  isChecking,
  showHint,
  onToggleHint
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const word = question.word;

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [question]);

  return (
    <div className="max-w-xl mx-auto w-full space-y-5 animate-fade-in">
       {/* Sentence Prompt */}
       <div>
          <label htmlFor="sentence-input" className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
             <Edit3 size={14} className="text-brand-500" />
             {question.questionText || "造句练习"}
          </label>

          <div className="relative group">
             <textarea
                id="sentence-input"
                ref={inputRef}
                className={`
               w-full p-5 text-lg md:text-xl font-medium leading-relaxed rounded-2xl border-2 transition-all resize-none min-h-[140px]
               ${feedback?.isCorrect
                      ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 focus:border-emerald-400 ring-2 ring-emerald-500/10'
                      : feedback?.isCorrect === false
                         ? 'border-red-300 bg-red-50/50 text-red-900 focus:border-red-400 ring-2 ring-red-500/10'
                         : 'border-gray-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-500/10 placeholder-gray-300 shadow-sm'}
             `}
                placeholder={`请使用 "${word.word}" 造句...`}
                value={sentence}
                onChange={(e) => onSentenceChange(e.target.value)}
                disabled={!!(feedback?.isCorrect || isChecking)}
                onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!feedback?.isCorrect) onSubmit();
                   }
                }}
             />
             {isChecking && (
                <div className="absolute top-4 right-4">
                   <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
                </div>
             )}
          </div>

          <div className="flex justify-end mt-2">
             <button
                onClick={onToggleHint}
                className="text-xs font-semibold text-gray-400 hover:text-brand-600 flex items-center px-2.5 py-1.5 rounded-lg hover:bg-brand-50 transition-colors gap-1"
             >
                <Lightbulb size={13} />
                {showHint ? '隐藏提示' : '需要提示?'}
             </button>
          </div>
       </div>

       {/* Hint Dropdown */}
       <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showHint ? 'max-h-28 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-4 flex gap-3">
             <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0 h-fit">
                <Sparkles size={16} />
             </div>
             <div>
                <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block mb-1">例句</span>
                <p className="text-amber-900 font-medium italic text-sm">"{word.example}"</p>
             </div>
          </div>
       </div>
    </div>
  );
};
