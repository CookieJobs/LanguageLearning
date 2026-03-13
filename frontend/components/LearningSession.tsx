import React, { useState, useEffect } from 'react';
import { Question, FeedbackResponse } from '../types';
import { Button } from './Button';
import { evaluateSentence } from '../services/geminiService';
import { ArrowRight, Volume2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { SentenceQuestion } from './SentenceQuestion';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';

interface LearningSessionProps {
   question: Question;
   currentIndex: number;
   totalCount: number;
   onSuccess: (question: Question, answer: any) => void;
   onSkip: () => void;
   onExit: () => void;
   onReady?: () => void;
}

export const LearningSession: React.FC<LearningSessionProps> = ({
   question,
   currentIndex,
   totalCount,
   onSuccess,
   onSkip,
   onExit,
   onReady
}) => {
   const [sentence, setSentence] = useState('');
   const [selectedOption, setSelectedOption] = useState<string | null>(null);
   const [isChecking, setIsChecking] = useState(false);
   const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
   const [showHint, setShowHint] = useState(false);
   
   const word = question.word;

   useEffect(() => {
      setSentence('');
      setSelectedOption(null);
      setFeedback(null);
      setShowHint(false);
   }, [question]);

   // Determine if submit is disabled
   const isSubmitDisabled = question.type === 'sentence' ? !sentence.trim() : !selectedOption;

   useEffect(() => {
      const t = setTimeout(() => { onReady?.(); }, 150);
      return () => clearTimeout(t);
   }, []);

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === 'Enter') {
            if (feedback?.isCorrect) {
               handleNext();
            } else if (!isSubmitDisabled && !isChecking) {
               handleSubmit();
            }
         } else if (question.type !== 'sentence' && !feedback && ['1', '2', '3', '4'].includes(e.key)) {
            const idx = parseInt(e.key) - 1;
            const targetOption = question.options?.[idx];
            if (targetOption) setSelectedOption(targetOption.id);
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [question, feedback, isSubmitDisabled, isChecking]);

   const handleSubmit = async () => {
      setIsChecking(true);
      setFeedback(null);

      try {
          if (question.type === 'sentence') {
             if (!sentence.trim()) return;
             const result = await evaluateSentence(word, sentence);
             setFeedback(result);
          } else {
             // Choice / Quiz
             if (!selectedOption) return;
             const correctOpt = question.options?.find(o => o.isCorrect);
             const isCorrect = selectedOption === correctOpt?.id;
             setFeedback({
                isCorrect,
                feedback: isCorrect ? 'Correct!' : `The correct answer is ${correctOpt?.text}`
             });
          }
      } catch {
         // Error handling
      } finally {
         setIsChecking(false);
      }
   };

   const handleNext = () => { 
       if (feedback?.isCorrect) {
           const answer = question.type === 'sentence' ? sentence : selectedOption;
           onSuccess(question, answer); 
       }
   };

   const playPronunciation = () => {
      const audioUrl = `/api/learning/audio?word=${encodeURIComponent(word.word)}`;
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
         const utterance = new SpeechSynthesisUtterance(word.word);
         utterance.lang = 'en-US';
         window.speechSynthesis.speak(utterance);
      });
   };

   const progressPercentage = ((currentIndex + 1) / totalCount) * 100;

   return (
      <div className="flex flex-col md:flex-row h-full w-full bg-white overflow-hidden">
         {/* LEFT COLUMN: Word/Question Display (35%) */}
         <div className="w-full md:w-[38%] h-[32vh] md:h-full bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-8 text-white shadow-2xl z-10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-[0.08] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent-300 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10 text-center animate-fade-in-up">
               <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/10 mb-4 text-xs font-semibold tracking-wide uppercase">
                  {word.partOfSpeech}
               </div>
               
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-3 tracking-tight drop-shadow-sm break-words max-w-full">
                   {question.type === 'sentence' ? word.word : question.questionText}
               </h1>

               <button
                  onClick={playPronunciation}
                  className="p-3.5 rounded-full bg-white/15 hover:bg-white/25 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/10 mx-auto flex items-center justify-center"
               >
                  <Volume2 size={26} />
               </button>

               {question.type === 'sentence' && (
                   <div className="mt-6 max-w-xs mx-auto">
                      <p className="text-lg md:text-xl font-medium text-white/90 leading-relaxed">{word.definition}</p>
                   </div>
               )}
            </div>
         </div>

         {/* RIGHT COLUMN: Workspace (65%) */}
         <div className="flex-1 h-[68vh] md:h-full flex flex-col relative bg-gradient-to-b from-gray-50/50 to-white">
            {/* Header */}
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
               <button onClick={onExit} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all shrink-0"><X size={22} /></button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 flex flex-col justify-center">
                {question.type === 'sentence' ? (
                    <SentenceQuestion 
                        question={question}
                        sentence={sentence}
                        onSentenceChange={setSentence}
                        onSubmit={handleSubmit}
                        feedback={feedback}
                        isChecking={isChecking}
                        showHint={showHint}
                        onToggleHint={() => setShowHint(!showHint)}
                    />
                ) : (
                    <MultipleChoiceQuestion 
                        question={{...question, questionText: ''}} // Hide question text as it is shown in left column
                        selectedOptionId={selectedOption}
                        onSelect={setSelectedOption}
                        showFeedback={!!feedback}
                    />
                )}
                
                {feedback && (
                     <div className={`mt-6 rounded-2xl p-5 md:p-6 animate-slide-up border max-w-xl mx-auto w-full ${feedback.isCorrect ? 'bg-emerald-50/80 border-emerald-100' : 'bg-red-50/80 border-red-100'}`}>
                        <div className="flex items-start gap-3">
                           <div className={`p-2.5 rounded-xl shrink-0 ${feedback.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                              {feedback.isCorrect ? <CheckCircle2 size={22}/> : <AlertCircle size={22}/>} 
                           </div>
                           <div className="space-y-1.5 flex-1">
                              <h3 className={`text-lg font-bold ${feedback.isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>
                                 {feedback.isCorrect ? 'Correct!' : 'Incorrect'}
                              </h3>
                              <p className="text-gray-600 leading-relaxed text-sm">{feedback.feedback}</p>
                              {feedback.improvedSentence && (
                                 <div className="mt-3 p-3 bg-white/60 rounded-xl border border-black/5">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Suggestion</p>
                                    <p className="text-gray-700 italic text-sm">"{feedback.improvedSentence}"</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 md:p-5 bg-white border-t border-gray-100 shrink-0 flex items-center justify-between">
               <button onClick={onSkip} className="text-gray-400 hover:text-gray-600 font-semibold px-4 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-sm" disabled={isChecking}>Skip</button>

               {!feedback?.isCorrect ? (
                  <Button
                     onClick={handleSubmit}
                     isLoading={isChecking}
                     disabled={isSubmitDisabled}
                     variant="primary"
                     size="lg"
                  >
                     Check Answer (Enter)
                  </Button>
               ) : (
                  <Button
                     onClick={handleNext}
                     variant="secondary"
                     size="lg"
                     className="animate-bounce-subtle"
                  >
                     Next (Enter) <ArrowRight size={18} className="ml-1.5" />
                  </Button>
               )}
            </div>
         </div>
      </div>
   );
}
