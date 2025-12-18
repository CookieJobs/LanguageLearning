import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LearningSession } from '../components/LearningSession';
import { SessionSummary } from '../components/SessionSummary';
import { useApp } from '../contexts/AppContext';

export const LearnPage: React.FC = () => {
  const { wordQueue, currentWordIndex, handleWordSuccess, handleSkipWord, exitLearning, showSummary, sessionMastered, startNextSession, streak, streakAtSessionStart, isLoading } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (wordQueue.length === 0) { startNextSession(); }
  }, []);

  return (
    <div className="flex-grow flex flex-col h-[calc(100vh-64px)] animate-fade-in relative overflow-hidden">
      {wordQueue.length > 0 && !showSummary ? (
        <LearningSession
          word={wordQueue[currentWordIndex]}
          currentIndex={currentWordIndex}
          totalCount={wordQueue.length}
          onSuccess={handleWordSuccess}
          onSkip={handleSkipWord}
          onExit={() => { exitLearning(); navigate('/'); }}
          onReady={() => { }}
        />
      ) : showSummary ? (
        <SessionSummary
          items={sessionMastered.map(i => ({ word: i.word, userSentence: i.userSentence, masteredAt: i.masteredAt, partOfSpeech: i.partOfSpeech }))}
          count={sessionMastered.length}
          streak={streak}
          streakDelta={Math.max(0, (streak || 0) - (streakAtSessionStart || 0))}
          onBackHome={() => { exitLearning(); navigate('/'); }}
        />
      ) : (
        <div className="text-center p-10 glass-card max-w-md mx-auto rounded-3xl animate-pulse-slow">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">正在为你准备个性化学习内容...</p>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-gray-600">加载单词失败</p>
              <button
                onClick={() => { startNextSession(); }}
                className="px-6 py-2 rounded-full bg-brand-600 text-white font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-transform active:scale-95"
              >
                重试
              </button>
            </div>
          )}
        </div>
      )
      }
    </div >
  );
};

// 学段选择已移除，学习流程固定为小学
