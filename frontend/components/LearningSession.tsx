import React, { useState, useRef, useEffect } from 'react';
import { WordItem, FeedbackResponse } from '../types';
import { Button } from './Button';
import { evaluateSentence } from '../services/geminiService';
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Volume2, Sparkles, X, Edit3 } from 'lucide-react';

interface LearningSessionProps {
   word: WordItem;
   currentIndex: number;
   totalCount: number;
   onSuccess: (word: WordItem, sentence: string) => void;
   onSkip: () => void;
   onExit: () => void;
   onReady?: () => void;
}

export const LearningSession: React.FC<LearningSessionProps> = ({
   word,
   currentIndex,
   totalCount,
   onSuccess,
   onSkip,
   onExit,
   onReady
}) => {
   const [sentence, setSentence] = useState('');
   const [isChecking, setIsChecking] = useState(false);
   const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
   const [showHint, setShowHint] = useState(false);
   const inputRef = useRef<HTMLTextAreaElement>(null);

   useEffect(() => {
      setSentence('');
      setFeedback(null);
      setShowHint(false);
      const t = setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 200);
      return () => clearTimeout(t);
   }, [word]);


   useEffect(() => {
      const t = setTimeout(() => { onReady?.(); }, 150);
      return () => clearTimeout(t);
   }, []);

   const handleSubmit = async () => {
      if (!sentence.trim()) return;
      setIsChecking(true);
      setFeedback(null);
      try {
         const result = await evaluateSentence(word, sentence);
         setFeedback(result);
      } catch {
      } finally {
         setIsChecking(false);
      }
   };

   const handleNext = () => { if (feedback?.isCorrect) onSuccess(word, sentence); };

   const playPronunciation = () => {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
   };

   const progressPercentage = ((currentIndex + 1) / totalCount) * 100;

   return (
      <div className="flex flex-col md:flex-row h-full w-full bg-white overflow-hidden">

         {/* LEFT COLUMN: Immersive Context (40%) */}
         <div className="w-full md:w-5/12 h-[35vh] md:h-full bg-gradient-to-br from-brand-600 to-brand-800 relative overflow-hidden flex flex-col items-center justify-center p-8 text-white shadow-2xl z-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 text-center animate-fade-in-up">
               <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6 text-sm font-medium tracking-wide">
                  {word.partOfSpeech}
               </div>
               <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tight drop-shadow-sm">{word.word}</h1>

               <div className="flex items-center justify-center gap-4 mt-2">
                  <button
                     onClick={playPronunciation}
                     className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
                  >
                     <Volume2 size={32} />
                  </button>
               </div>

               <div className="mt-8 max-w-sm mx-auto">
                  <p className="text-xl md:text-2xl font-medium text-brand-50 leading-relaxed">{word.definition}</p>
               </div>
            </div>
         </div>

         {/* RIGHT COLUMN: Workspace (60%) */}
         <div className="flex-1 h-[65vh] md:h-full flex flex-col relative bg-gray-50/50">

            {/* Header: Progress & Exit */}
            <div className="h-20 flex items-center justify-between px-8 border-b border-gray-100 bg-white/80 backdrop-blur-sm shrink-0 gap-8">
               <div className="flex flex-col flex-1">
                  <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                     <span>学习进度</span>
                     <span className="text-brand-600">{currentIndex + 1} / {totalCount}</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                     <div
                        className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{ width: `${progressPercentage}%` }}
                     />
                  </div>
               </div>

               <button
                  onClick={onExit}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all hover:rotate-90 shrink-0"
                  title="退出学习"
               >
                  <X size={28} />
               </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar flex flex-col justify-center">
               <div className="max-w-2xl mx-auto w-full space-y-8 animate-fade-in">

                  {/* Sentence Prompt */}
                  <div>
                     <label htmlFor="sentence-input" className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                        <Edit3 size={16} className="text-brand-500" />
                        造句练习
                     </label>

                     <div className="relative group">
                        <textarea
                           id="sentence-input"
                           ref={inputRef}
                           className={`
                          w-full p-6 text-xl md:text-2xl font-medium leading-relaxed rounded-2xl border-2 transition-all resize-none shadow-sm min-h-[160px]
                          ${feedback?.isCorrect
                                 ? 'border-emerald-200 bg-emerald-50/30 text-emerald-900 focus:border-emerald-500 ring-4 ring-emerald-500/10'
                                 : feedback?.isCorrect === false
                                    ? 'border-red-200 bg-red-50/30 text-red-900 focus:border-red-400 ring-4 ring-red-500/10'
                                    : 'border-gray-200 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 placeholder-gray-300'}
                        `}
                           placeholder={`请使用 "${word.word}" 造句...`}
                           value={sentence}
                           onChange={(e) => setSentence(e.target.value)}
                           disabled={feedback?.isCorrect || isChecking}
                           onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                 e.preventDefault();
                                 if (!feedback?.isCorrect) handleSubmit();
                                 else handleNext();
                              }
                           }}
                        />
                        {isChecking && (
                           <div className="absolute top-4 right-4">
                              <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                           </div>
                        )}
                     </div>

                     <div className="flex justify-end mt-2">
                        <button
                           onClick={() => setShowHint(!showHint)}
                           className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
                        >
                           <HelpCircle size={14} className="mr-1.5" />
                           {showHint ? '隐藏提示' : '需要提示?'}
                        </button>
                     </div>
                  </div>

                  {/* Hint Dropdown */}
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showHint ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                     <div className="bg-amber-50 border border-amber-100/50 rounded-xl p-4 flex gap-4">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0 h-fit">
                           <Sparkles size={18} />
                        </div>
                        <div>
                           <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">例句</span>
                           <p className="text-amber-900 font-medium italic">"{word.example}"</p>
                        </div>
                     </div>
                  </div>

                  {/* Feedback Display */}
                  {feedback && (
                     <div className={`rounded-2xl p-6 md:p-8 animate-slide-up shadow-sm border ${feedback.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex items-start gap-4">
                           <div className={`p-3 rounded-xl shrink-0 ${feedback.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                              {feedback.isCorrect ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
                           </div>
                           <div className="space-y-2">
                              <h3 className={`text-xl font-bold ${feedback.isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
                                 {feedback.isCorrect ? '太棒了！' : '还需要改进'}
                              </h3>
                              <p className="text-gray-700 leading-relaxed font-medium">{feedback.feedback}</p>

                              {feedback.improvedSentence && (
                                 <div className="mt-4 p-4 bg-white/50 rounded-xl border border-black/5">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">优化建议</p>
                                    <p className="text-gray-800 italic font-medium">"{feedback.improvedSentence}"</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  )}

               </div>
            </div>

            {/* Footer: Actions (Sticky) */}
            <div className="p-6 bg-white border-t border-gray-100 shrink-0 flex items-center justify-between">
               <button
                  onClick={onSkip}
                  className="text-gray-400 hover:text-gray-600 font-bold px-6 py-3 hover:bg-gray-50 rounded-xl transition-colors"
                  disabled={isChecking}
               >
                  跳过
               </button>

               {!feedback?.isCorrect ? (
                  <Button
                     onClick={handleSubmit}
                     isLoading={isChecking}
                     disabled={!sentence.trim()}
                     className="shadow-lg shadow-brand-500/20 px-8 py-3 text-lg"
                     variant="primary"
                     size="lg"
                  >
                     检查答案
                  </Button>
               ) : (
                  <Button
                     onClick={handleNext}
                     variant="secondary"
                     size="lg"
                     className="animate-bounce-subtle shadow-lg shadow-emerald-500/20 px-8 py-3 text-lg"
                  >
                     下一个 <ArrowRight size={20} className="ml-2" />
                  </Button>
               )}
            </div>

         </div>
      </div>
   );
};
