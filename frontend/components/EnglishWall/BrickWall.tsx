import React, { useEffect, useRef, useState, useMemo } from 'react';
import { WordItem } from './types';

interface BrickWallProps {
  words: WordItem[];
  onBrickClick: (word: WordItem) => void;
  onBrickHover?: (word: WordItem, event: React.MouseEvent) => void;
  onBrickHoverOut?: () => void;
}

export const BrickWall: React.FC<BrickWallProps> = ({ words, onBrickClick, onBrickHover, onBrickHoverOut }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  const GAP = 8;
  const BRICK_HEIGHT = 44;
  const ITEM_HEIGHT = BRICK_HEIGHT + GAP;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setContainerWidth(entry.contentRect.width);
          setContainerHeight(entry.contentRect.height);
        }
      }
    });
    observer.observe(containerRef.current);
    
    // Initial size set
    if (containerRef.current.clientWidth > 0) {
      setContainerWidth(containerRef.current.clientWidth);
      setContainerHeight(containerRef.current.clientHeight);
    }
    
    return () => observer.disconnect();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Dynamically calculate columns and brick width to perfectly fill the container
  const targetBrickWidth = 100; // slightly smaller target to fit more columns on mobile
  const columns = Math.max(2, Math.floor(containerWidth / (targetBrickWidth + GAP)));
  
  // We need space for `columns` items + half an item for the staggered offset
  const ITEM_WIDTH = containerWidth > 0 ? containerWidth / (columns + 0.5) : targetBrickWidth + GAP;
  const BRICK_WIDTH = ITEM_WIDTH - GAP;

  const rows = Math.ceil(words.length / columns);
  
  // Extra padding at bottom/top for visuals
  const verticalPadding = 40;
  const totalHeight = rows * ITEM_HEIGHT + verticalPadding * 2;

  const startX = 0; // Now we perfectly fill the width, so start at 0

  // Scroll to bottom on mount or when words load
  useEffect(() => {
    // Adding a slight delay to ensure DOM is fully calculated
    const timer = setTimeout(() => {
      if (containerRef.current && totalHeight > containerHeight && containerHeight > 0) {
        if (!initialScrollDone || scrollTop === 0) {
          const targetScroll = totalHeight - containerHeight;
          containerRef.current.scrollTo({ top: targetScroll, behavior: 'auto' });
          setScrollTop(targetScroll);
          setInitialScrollDone(true);
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [totalHeight, containerHeight, initialScrollDone, words.length]);

  // Virtualization logic
  // Since we have vertical padding, adjust scroll calculations
  const adjustedScrollTop = Math.max(0, scrollTop - verticalPadding);
  const startRowFromTop = Math.floor(adjustedScrollTop / ITEM_HEIGHT);
  const endRowFromTop = Math.min(rows - 1, Math.ceil((adjustedScrollTop + containerHeight) / ITEM_HEIGHT));

  const buffer = 4; // Render extra rows to avoid blank flashes
  const safeStart = Math.max(0, startRowFromTop - buffer);
  const safeEnd = Math.min(rows - 1, endRowFromTop + buffer);

  // We want to sort words such that mastered words are at the beginning of the list,
  // which visually places them at the bottom of the wall (rBottom = 0, 1, 2...)
  // We also want the initial view to show the bottom of the wall where the mastered words are.
  const sortedWords = useMemo(() => {
    return [...words].sort((a, b) => {
      // We want mastered words to appear at the bottom (rBottom = 0)
      // The wordIndex is calculated as `rBottom * columns + c`
      // So smaller indices (0, 1, 2) correspond to smaller rBottom (0, 1) -> bottom of the wall
      // Therefore, mastered words MUST have SMALLER indices to appear at the bottom.
      // Additionally, we might want to sort by firstLearnTime or something, but for now just mastered status
      if (a.mastered && !b.mastered) return -1;
      if (!a.mastered && b.mastered) return 1;
      return 0; // maintain original relative order within same status
    });
  }, [words]);

  const visibleBricks = [];
  for (let rTop = safeStart; rTop <= safeEnd; rTop++) {
    const rBottom = rows - 1 - rTop; // 0-indexed row from bottom (0 = lowest row)
    const isStaggered = rBottom % 2 !== 0;
    const xOffset = isStaggered ? BRICK_WIDTH / 2 : 0;
    // We want the Y position to go up as rBottom goes up
    // So top row (rTop=0) has the smallest Y (highest visually), and bottom row (rTop=rows-1) has the largest Y (lowest visually)
    const yPos = rTop * ITEM_HEIGHT + verticalPadding;

    for (let c = 0; c < columns; c++) {
      // We fill from left to right.
      // We want to fill the bottom row first, so rBottom=0 should use wordIndex 0, 1, 2...
      const wordIndex = rBottom * columns + c;
      if (wordIndex < sortedWords.length) {
        const word = sortedWords[wordIndex];
        
        // Ensure unmastered words are stacked ON TOP of mastered words.
        // With mastered having lower indices, they will be at lower rBottom.
        // This correctly creates the visual "building up from the bottom".
        const xPos = startX + c * ITEM_WIDTH + xOffset;
        
        visibleBricks.push(
          <button
            key={word.id}
            data-testid={`brick-${word.id}`}
            style={{
              position: 'absolute',
              top: yPos,
              left: xPos,
              width: BRICK_WIDTH,
              height: BRICK_HEIGHT,
            }}
            className={`cursor-pointer transition-all duration-300 flex items-center justify-center rounded-xl border-2 shadow-sm select-none ${
              word.mastered
                ? 'bg-[#ffc800] text-amber-950 border-[#e5b400] font-bold shadow-[0_4px_0_#e5b400] hover:bg-[#ffd12e] hover:shadow-[0_2px_0_#e5b400] hover:translate-y-[2px] z-10'
                : 'bg-[#37464f] text-[#a5b0b5] border-[#29363d] font-bold shadow-[0_4px_0_#29363d] hover:bg-[#4b5962] hover:shadow-[0_2px_0_#29363d] hover:translate-y-[2px] z-10'
            }`}
            onClick={() => onBrickClick(word)}
            onMouseEnter={(e) => onBrickHover?.(word, e)}
            onMouseLeave={() => onBrickHoverOut?.()}
          >
            <span className="truncate px-3 w-full text-center text-sm pointer-events-none">{word.word}</span>
          </button>
        );
      }
    }
  }

  return (
    <div 
      ref={containerRef} 
      onScroll={handleScroll}
      className="w-full h-full overflow-y-auto overflow-x-hidden relative scroll-smooth"
      style={{
        backgroundColor: '#131f24',
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: `${ITEM_WIDTH}px ${ITEM_HEIGHT}px`,
        backgroundPosition: `center top ${verticalPadding}px`
      }}
    >
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        {visibleBricks}
      </div>
    </div>
  );
};
