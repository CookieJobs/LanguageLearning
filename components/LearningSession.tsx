import React, { useState, useRef, useEffect } from 'react';
import { WordItem, MasteredItem, FeedbackResponse } from '../types';
import { Button } from './Button';
import { evaluateSentence } from '../services/geminiService';
import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight, Volume2 } from 'lucide-react';

interface LearningSessionProps {
  word: WordItem;
  onSuccess: (word: WordItem, sentence: string) => void;
  onSkip: () => void;
}

export const LearningSession: React.FC<LearningSessionProps> = ({ word, onSuccess, onSkip }) => {
  const [sentence, setSentence] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when word changes
  useEffect(() => {
    setSentence('');
    setFeedback(null);
    setShowHint(false);
    if (inputRef.current) inputRef.current.focus();
  }, [word]);

  const handleSubmit = async () => {
    if (!sentence.trim()) return;
    
    setIsChecking(true);
    setFeedback(null);
    
    try {
      const result = await evaluateSentence(word, sentence);
      setFeedback(result);
    } catch (error) {
      // Error handled in service
    } finally {
      setIsChecking(false);
    }
  };

  const handleNext = () => {
    if (feedback?.isCorrect) {
      onSuccess(word, sentence);
    }
  };

  const playPronunciation = () => {
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-4 animate-fade-in">
      {/* Word Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2 relative z-10 tracking-wide">
              {word.word}
            </h2>
            <div className="flex items-center justify-center space-x-2 text-indigo-100 relative z-10">
              <span className="italic font-medium">{word.partOfSpeech}</span>
              <span>•</span>
              <button 
                onClick={playPronunciation}
                className="hover:text-white transition-colors p-1 rounded-full hover:bg-indigo-500/50"
                title="播放发音"
              >
                <Volume2 size={20} />
              </button>
            </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6 text-center">
            <h3 className="text-gray-500 text-sm uppercase tracking-wider font-semibold mb-1">单词释义</h3>
            <p className="text-xl text-gray-800 font-medium leading-relaxed">{word.definition}</p>
          </div>

          {showHint && (
            <div className="mb-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-sm text-yellow-800 animate-fade-in">
              <span className="font-bold block mb-1">例句参考：</span>
              "{word.example}"
            </div>
          )}

          <div className="flex justify-center mb-6">
            {!showHint && (
              <button 
                onClick={() => setShowHint(true)}
                className="text-indigo-600 text-sm font-medium flex items-center hover:underline"
              >
                <HelpCircle size={16} className="mr-1" /> 需要提示？
              </button>
            )}
          </div>

          <div className="space-y-4">
            <label htmlFor="sentence-input" className="block text-sm font-medium text-gray-700">
              请用 "{word.word}" 造句：
            </label>
            <textarea
              id="sentence-input"
              ref={inputRef}
              className={`
                w-full p-4 rounded-xl border-2 focus:ring-0 focus:outline-none transition-all text-lg resize-none
                ${feedback?.isCorrect 
                  ? 'border-emerald-400 bg-emerald-50 focus:border-emerald-500' 
                  : feedback?.isCorrect === false 
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-gray-200 focus:border-indigo-500 bg-gray-50'
                }
              `}
              rows={3}
              placeholder={`例如：The ${word.word} was...`}
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

            {/* Feedback Area */}
            {feedback && (
              <div className={`rounded-xl p-4 flex items-start space-x-3 animate-fade-in ${
                feedback.isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
              }`}>
                {feedback.isCorrect ? (
                  <CheckCircle2 className="shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="shrink-0 mt-0.5 text-red-600" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{feedback.isCorrect ? '太棒了！' : '再接再厉！'}</p>
                  <p className="text-sm mt-1 leading-relaxed opacity-90">{feedback.feedback}</p>
                  {feedback.improvedSentence && (
                    <div className="mt-2 pt-2 border-t border-black/10">
                      <p className="text-xs uppercase tracking-wider font-bold opacity-70 mb-0.5">更地道的表达：</p>
                      <p className="italic text-sm">"{feedback.improvedSentence}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
           <button 
             onClick={onSkip}
             className="text-gray-400 hover:text-gray-600 text-sm font-medium px-2 py-1"
             disabled={isChecking}
           >
             跳过
           </button>

           <div className="flex space-x-3">
             {!feedback?.isCorrect ? (
               <Button 
                 onClick={handleSubmit} 
                 isLoading={isChecking}
                 disabled={!sentence.trim()}
                 className="w-full md:w-auto"
               >
                 检查句子
               </Button>
             ) : (
                <Button 
                  onClick={handleNext} 
                  variant="secondary"
                  className="animate-bounce-subtle"
                >
                  下一个单词 <ArrowRight size={18} className="ml-2" />
                </Button>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};