// input: react, ../types, ./Button, ../services/geminiService, lucide-react
// output: LearningSession
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React, { useState, useRef, useEffect } from 'react';
import { WordItem, FeedbackResponse } from '../types';
import { Button } from './Button';
import { evaluateSentence } from '../services/geminiService';
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Volume2, Sparkles, X, Edit3, Lightbulb } from 'lucide-react';

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

   useEffect(() => {
      const handler = (e: KeyboardEvent) => {
         if (e.key !== 'Enter' || e.shiftKey) return;
         const target = e.target as HTMLElement | null;
         if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable)) {
            return;
         }
         e.preventDefault();
         if (feedback?.isCorrect) {
            handleNext();
         } else {
            if (sentence.trim() && !isChecking) handleSubmit();
         }
      };
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
   }, [feedback?.isCorrect, sentence, isChecking]);

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
      // Use our backend proxy to avoid CORS/Referer blocking
      // If word.audioUrl exists, we could use it, but constructing a clean proxy URL is more reliable
      // const url = `${import.meta.env.VITE_API_BASE}/learning/audio?word=${encodeURIComponent(word.word)}`;
      // However, check if we need full URL or relative. Assuming API_BASE is set.
      // Actually, define API_BASE in config. Let's assume standard /api path for cleaner code if config import is not handy, 
      // or better: utilize logic to use the proxy.

      const audioUrl = `/api/learning/audio?word=${encodeURIComponent(word.word)}`;
      const audio = new Audio(audioUrl);

      audio.play().catch(err => {
         console.warn('Audio playback failed, falling back to synthesis', err);
         speakFallback();
      });
   };

   const speakFallback = () => {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
   }

   const progressPercentage = ((currentIndex + 1) / totalCount) * 100;

   return (
      <div className="flex flex-col md:flex-row h-full w-full bg-white overflow-hidden">

         {/* LEFT COLUMN: Word Display (35%) */}
         <div className="w-full md:w-[38%] h-[32vh] md:h-full bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-8 text-white shadow-2xl z-10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-[0.08] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent-300 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 text-center animate-fade-in-up">
               <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/10 mb-4 text-xs font-semibold tracking-wide uppercase">
                  {word.partOfSpeech}
               </div>
               <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-3 tracking-tight drop-shadow-sm">{word.word}</h1>

               <button
                  onClick={playPronunciation}
                  className="p-3.5 rounded-full bg-white/15 hover:bg-white/25 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/10 mx-auto flex items-center justify-center"
               >
                  <Volume2 size={26} />
               </button>

               <div className="mt-6 max-w-xs mx-auto">
                  <p className="text-lg md:text-xl font-medium text-white/90 leading-relaxed">{word.definition}</p>
               </div>
            </div>
         </div>

         {/* RIGHT COLUMN: Workspace (65%) */}
         <div className="flex-1 h-[68vh] md:h-full flex flex-col relative bg-gradient-to-b from-gray-50/50 to-white">

            {/* Header: Progress & Exit */}
            <div className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-gray-100 bg-white/90 backdrop-blur-sm shrink-0 gap-6">
               <div className="flex flex-col flex-1">
                  <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                     <span>学习进度</span>
                     <span className="text-brand-600">{currentIndex + 1} / {totalCount}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                     />
                  </div>
               </div>

               <button
                  onClick={onExit}
                  className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all shrink-0"
                  title="退出学习"
               >
                  <X size={22} />
               </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 flex flex-col justify-center">
               <div className="max-w-xl mx-auto w-full space-y-5 animate-fade-in">

                  {/* Sentence Prompt */}
                  <div>
                     <label htmlFor="sentence-input" className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <Edit3 size={14} className="text-brand-500" />
                        造句练习
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
                              <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
                           </div>
                        )}
                     </div>

                     <div className="flex justify-end mt-2">
                        <button
                           onClick={() => setShowHint(!showHint)}
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

                  {/* Feedback Display */}
                  {feedback && (
                     <div className={`rounded-2xl p-5 md:p-6 animate-slide-up border ${feedback.isCorrect ? 'bg-emerald-50/80 border-emerald-100' : 'bg-red-50/80 border-red-100'}`}>
                        <div className="flex items-start gap-3">
                           <div className={`p-2.5 rounded-xl shrink-0 ${feedback.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                              {feedback.isCorrect ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                           </div>
                           <div className="space-y-1.5 flex-1">
                              <h3 className={`text-lg font-bold ${feedback.isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
                                 {feedback.isCorrect ? '太棒了！' : '还需要改进'}
                              </h3>
                              <p className="text-gray-600 leading-relaxed text-sm">{feedback.feedback}</p>

                              {feedback.improvedSentence && (
                                 <div className="mt-3 p-3 bg-white/60 rounded-xl border border-black/5">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">优化建议</p>
                                    <p className="text-gray-700 italic text-sm">"{feedback.improvedSentence}"</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  )}

               </div>
            </div>

            {/* Footer: Actions (Sticky) */}
            <div className="p-4 md:p-5 bg-white border-t border-gray-100 shrink-0 flex items-center justify-between">
               <button
                  onClick={onSkip}
                  className="text-gray-400 hover:text-gray-600 font-semibold px-4 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-sm"
                  disabled={isChecking}
               >
                  跳过
               </button>

               {!feedback?.isCorrect ? (
                  <Button
                     onClick={handleSubmit}
                     isLoading={isChecking}
                     disabled={!sentence.trim()}
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
                     className="animate-bounce-subtle"
                  >
                     下一个 <ArrowRight size={18} className="ml-1.5" />
                  </Button>
               )}
            </div>

         </div>
      </div>
   );
};
