import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BrickWall } from './BrickWall';
import { WordItem } from './types';
import { fetchProgress } from '../../services/geminiService';
import { useApp } from '../../contexts/AppContext';

export const EnglishWall: React.FC = () => {
  const navigate = useNavigate();
  const { level, selectedTextbook } = useApp();
  const [words, setWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Skeleton state for the modal
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);

  // Hover state
  const [hoveredWord, setHoveredWord] = useState<WordItem | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Edge detection for tooltip
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  // Milestone tracking
  const [milestone, setMilestone] = useState<string | null>(null);

  // Touch detection for mobile
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  useEffect(() => {
    const loadWords = async () => {
      setLoading(true);
      try {
        const stats = await fetchProgress(level || undefined, selectedTextbook || undefined);
        const mappedWords: WordItem[] = stats.list.map((w: any, index: number) => ({
          id: String(index),
          word: w.word,
          mastered: w.mastered,
          definition: w.definition,
          phonetic: w.phonetic || '',
          pos: w.partOfSpeech || '',
          example: w.example || '',
          firstLearnTime: w.lastMastered || '',
          reviewCount: w.exposureCount || 0,
        }));
        setWords(mappedWords);

        // Milestone Check (SubTask 5.3)
        const masteredCount = mappedWords.filter(w => w.mastered).length;
        const milestones = [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
        
        // Find the highest milestone achieved
        const reachedMilestone = milestones.slice().reverse().find(m => masteredCount >= m);
        if (reachedMilestone) {
          // In a real app, we would check if this milestone was already shown from local storage or backend
          const lastShown = localStorage.getItem('english_wall_milestone');
          if (lastShown !== String(reachedMilestone)) {
            setMilestone(`达成里程碑：已掌握 ${reachedMilestone} 个单词！`);
            localStorage.setItem('english_wall_milestone', String(reachedMilestone));
            setTimeout(() => setMilestone(null), 6000);
          }
        }
      } catch (error) {
        console.error('Failed to fetch words for English Wall:', error);
      } finally {
        setLoading(false);
      }
    };
    loadWords();
  }, [level, selectedTextbook]);

  useEffect(() => {
    if (hoverPosition && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = hoverPosition.x + 15;
      let top = hoverPosition.y + 15;

      // Adjust if it goes off the right edge
      if (left + tooltipRect.width > viewportWidth) {
        left = hoverPosition.x - tooltipRect.width - 15;
      }

      // Adjust if it goes off the bottom edge
      if (top + tooltipRect.height > viewportHeight) {
        top = hoverPosition.y - tooltipRect.height - 15;
      }

      setTooltipStyle({
        left: `${left}px`,
        top: `${top}px`,
        opacity: 1,
        transform: 'translate(0, 0) scale(1)',
      });
    } else {
      setTooltipStyle({ opacity: 0, transform: 'translate(0, 10px) scale(0.95)', pointerEvents: 'none' });
    }
  }, [hoverPosition, hoveredWord]);

  const closeModal = () => setSelectedWord(null);

  const handleBrickHover = (word: WordItem, e: any) => {
    if (isTouchDevice) return;
    setHoveredWord(word);
    setHoverPosition({ x: e.clientX, y: e.clientY });
  };

  const handleBrickHoverOut = () => {
    if (isTouchDevice) return;
    setHoveredWord(null);
    setHoverPosition(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#131f24] relative overflow-hidden">
      {/* Duolingo Style Header */}
      <div className="w-full h-16 shrink-0 flex items-center px-4 z-20 relative bg-[#131f24] border-b-2 border-[#37464f]">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-[#a5b0b5] hover:text-white transition-colors"
        >
          <ArrowLeft size={28} />
        </button>
        
        {/* Progress Bar in Header */}
        <div className="flex-1 mx-4 flex items-center justify-center">
          <div className="w-full max-w-xl bg-[#37464f] h-4 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-[#58cc02] rounded-full transition-all duration-500 ease-out absolute left-0 top-0"
              style={{ width: `${words.length > 0 ? (words.filter(w => w.mastered).length / words.length) * 100 : 0}%` }}
            />
            <div 
              className="h-1 bg-white/30 rounded-full absolute left-2 top-1 transition-all duration-500 ease-out"
              style={{ width: `calc(${words.length > 0 ? (words.filter(w => w.mastered).length / words.length) * 100 : 0}% - 16px)` }}
            />
          </div>
        </div>

        <div className="w-auto min-w-[3rem] text-right text-sm font-bold text-[#58cc02] whitespace-nowrap">
          {words.filter(w => w.mastered).length} / {words.length}
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#131f24]/90 backdrop-blur-sm">
          <div className="text-[#1cb0f6] font-bold text-xl animate-pulse flex items-center gap-3">
            <div className="w-6 h-6 rounded-full border-4 border-[#1cb0f6] border-t-transparent animate-spin"></div>
            正在砌墙...
          </div>
        </div>
      )}

      {/* Milestone Notification */}
      {milestone && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-amber-500/20 animate-bounce">
          🏆 {milestone}
        </div>
      )}

      {/* 2D Wall Container */}
      <div className="flex-1 relative z-0 w-full overflow-hidden">
        {!loading && (
          <BrickWall 
            words={words} 
            onBrickClick={setSelectedWord} 
            onBrickHover={handleBrickHover}
            onBrickHoverOut={handleBrickHoverOut}
          />
        )}
      </div>

      {/* Hover Tooltip (Task 3) */}
      <div 
        ref={tooltipRef}
        className="fixed z-40 bg-[#202f36] border-2 border-[#37464f] p-4 rounded-2xl shadow-xl max-w-xs transition-all duration-200 pointer-events-none"
        style={{
          ...tooltipStyle,
          position: 'fixed',
          visibility: hoveredWord ? 'visible' : 'hidden'
        }}
      >
        {hoveredWord && (
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-lg font-bold text-white">{hoveredWord.word}</span>
              {hoveredWord.phonetic && <span className="text-sm text-[#a5b0b5] font-mono">{hoveredWord.phonetic}</span>}
            </div>
            <div className="text-sm text-[#ffc800] mb-2 font-bold">{hoveredWord.pos} <span className="text-white font-normal">{hoveredWord.definition}</span></div>
            {hoveredWord.example && (
              <div className="text-xs text-[#a5b0b5] border-t border-[#37464f] pt-2 mt-2">
                "{hoveredWord.example}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Skeleton (Task 4) */}
      {selectedWord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131f24] rounded-2xl w-full max-w-md p-6 border-2 border-[#37464f] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-[#a5b0b5] hover:text-white transition-colors"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{selectedWord.word}</h2>
              {selectedWord.phonetic && (
                <span className="text-[#a5b0b5] font-mono bg-[#202f36] px-2 py-1 rounded-lg text-sm border-b-2 border-[#37464f]">
                  {selectedWord.phonetic}
                </span>
              )}
              {/* Audio Play Button Placeholder */}
              <button className="text-[#1cb0f6] hover:text-[#1899d6] transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <span className="inline-block px-2 py-1 bg-[#ffc800]/10 text-[#ffc800] font-bold text-xs rounded-lg border-b-2 border-[#ffc800]/20 mr-2">
                {selectedWord.pos || 'noun'}
              </span>
              <span className="text-white font-medium">{selectedWord.definition}</span>
            </div>

            {selectedWord.example && (
              <div className="bg-[#202f36] rounded-xl p-4 mb-6 border-2 border-[#37464f]">
                <p className="text-sm text-white font-medium mb-1">"{selectedWord.example}"</p>
                <p className="text-xs text-[#a5b0b5]">这是一句测试例句的中文翻译。</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#202f36] rounded-xl p-3 flex flex-col items-center justify-center border-2 border-[#37464f]">
                <span className="text-xs text-[#a5b0b5] font-bold mb-1">首次学习</span>
                <span className="text-sm text-[#1cb0f6] font-bold">{selectedWord.firstLearnTime || 'N/A'}</span>
              </div>
              <div className="bg-[#202f36] rounded-xl p-3 flex flex-col items-center justify-center border-2 border-[#37464f]">
                <span className="text-xs text-[#a5b0b5] font-bold mb-1">复习次数</span>
                <span className="text-sm text-[#ffc800] font-bold">{selectedWord.reviewCount || 0} 次</span>
              </div>
            </div>

            {/* Chart placeholder using Recharts style div */}
            <div className="h-32 bg-[#202f36] rounded-xl flex items-center justify-center text-[#a5b0b5] font-bold text-sm mb-6 border-2 border-[#37464f] relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end gap-1 px-2 opacity-50">
                {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#58cc02] rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <span className="z-10 relative">记忆曲线图表 (Mock)</span>
            </div>

            <div className="flex gap-3">
              <button 
                className="flex-1 bg-[#37464f] hover:bg-[#4b5962] text-[#a5b0b5] hover:text-white font-bold py-3 rounded-xl transition-all border-b-4 border-[#29363d] active:border-b-0 active:translate-y-[4px]"
                onClick={() => {
                  setWords(prev => prev.map(w => w.id === selectedWord.id ? { ...w, mastered: false } : w));
                  closeModal();
                }}
              >
                标为未掌握
              </button>
              <button 
                onClick={closeModal}
                className="flex-1 bg-[#58cc02] hover:bg-[#58d102] text-white font-bold py-3 rounded-xl transition-all border-b-4 border-[#58a700] active:border-b-0 active:translate-y-[4px]"
              >
                继续复习
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
