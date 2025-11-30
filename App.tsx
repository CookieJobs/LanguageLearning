import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { LearningSession } from './components/LearningSession';
import { ReviewList } from './components/ReviewList';
import { EducationLevel, WordItem, MasteredItem, Screen } from './types';
import { fetchWordsForLevel } from './services/geminiService';
import { LayoutDashboard, BookOpen, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [level, setLevel] = useState<EducationLevel | null>(null);
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [wordQueue, setWordQueue] = useState<WordItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [masteredItems, setMasteredItems] = useState<MasteredItem[]>(() => {
    const saved = localStorage.getItem('linguaCraft_mastered');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('linguaCraft_mastered', JSON.stringify(masteredItems));
  }, [masteredItems]);

  const handleLevelSelect = async (selectedLevel: EducationLevel) => {
    setIsLoading(true);
    setLevel(selectedLevel);
    
    try {
      // Get initial batch of words
      const existingWords = masteredItems.map(m => m.word);
      const newWords = await fetchWordsForLevel(selectedLevel, existingWords);
      setWordQueue(newWords);
      setCurrentWordIndex(0);
      setScreen('learning');
    } catch (error) {
      alert("启动失败，请检查您的网络连接或 API Key。");
      setLevel(null); // Reset
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordSuccess = (word: WordItem, sentence: string) => {
    const newItem: MasteredItem = {
      ...word,
      userSentence: sentence,
      masteredAt: new Date().toISOString(),
    };
    
    setMasteredItems(prev => [newItem, ...prev]);
    moveToNextWord();
  };

  const handleSkipWord = () => {
    moveToNextWord();
  };

  const moveToNextWord = async () => {
    const nextIndex = currentWordIndex + 1;
    
    // If we are near the end of the queue, fetch more in background? 
    // For simplicity, if we finish the queue, we fetch more then.
    if (nextIndex >= wordQueue.length) {
      setIsLoading(true);
      try {
         if (level) {
             const existingWords = [...masteredItems.map(m => m.word), ...wordQueue.map(w => w.word)];
             const moreWords = await fetchWordsForLevel(level, existingWords);
             setWordQueue(moreWords);
             setCurrentWordIndex(0);
         }
      } catch (e) {
        console.error("Failed to load more words");
      } finally {
        setIsLoading(false);
      }
    } else {
      setCurrentWordIndex(nextIndex);
    }
  };

  // New function to handle returning to home
  const handleReturnHome = () => {
    if (screen === 'onboarding') return;

    if (window.confirm('确定要返回首页重新选择学段吗？当前的临时练习进度将被重置。')) {
      setScreen('onboarding');
      setLevel(null);
      setWordQueue([]);
      setCurrentWordIndex(0);
    }
  };

  // Helper to extract the Chinese label for display in header
  const getLevelLabel = (l: EducationLevel) => {
    return l.match(/\((.*?)\)/)?.[1] || l;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer group" 
            onClick={handleReturnHome}
            title="返回首页"
          >
             <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors">
               <BookOpen className="text-white w-6 h-6" />
             </div>
             <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
               LinguaCraft
             </span>
          </div>
          
          {screen !== 'onboarding' && (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {level && getLevelLabel(level)}
              </div>
              
              <button 
                onClick={() => setScreen(screen === 'learning' ? 'review' : 'learning')}
                className={`p-2 rounded-full transition-colors ${screen === 'review' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'}`}
                title={screen === 'learning' ? "复习单词" : "返回学习"}
              >
                <LayoutDashboard size={20} />
              </button>

              <div className="w-px h-6 bg-gray-200 mx-2 hidden sm:block"></div>

              <button 
                onClick={handleReturnHome}
                className="flex items-center space-x-1 text-gray-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                title="切换学段 / 返回首页"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">退出</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {screen === 'onboarding' && (
          <Onboarding onSelectLevel={handleLevelSelect} isLoading={isLoading} />
        )}

        {screen === 'learning' && (
          <div className="flex-grow flex flex-col justify-center py-8">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center space-y-4">
                 <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                 <p className="text-gray-500 font-medium animate-pulse">AI 导师正在准备教案...</p>
               </div>
            ) : wordQueue.length > 0 ? (
              <>
                 <div className="text-center mb-4">
                   <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">当前学习进度</span>
                   <div className="flex justify-center mt-2 space-x-1">
                      {wordQueue.map((_, idx) => (
                        <div key={idx} className={`h-1.5 w-8 rounded-full transition-colors ${idx === currentWordIndex ? 'bg-indigo-600' : idx < currentWordIndex ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                      ))}
                   </div>
                 </div>
                 <LearningSession 
                   word={wordQueue[currentWordIndex]} 
                   onSuccess={handleWordSuccess}
                   onSkip={handleSkipWord}
                 />
              </>
            ) : (
              <div className="text-center p-10">
                <p>加载单词时出现问题，请刷新页面。</p>
              </div>
            )}
          </div>
        )}

        {screen === 'review' && (
          <ReviewList items={masteredItems} onBack={() => setScreen('learning')} />
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} LinguaCraft AI. 由 Gemini 驱动。</p>
        </div>
      </footer>
    </div>
  );
};

export default App;