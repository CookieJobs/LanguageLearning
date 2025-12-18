import React, { useEffect, useRef, useState } from 'react';

interface TransitionSwitchProps<K extends string> { activeKey: K; views: Record<K, React.ReactNode>; durationMs?: number }

export function TransitionSwitch<K extends string>({ activeKey, views, durationMs = 250 }: TransitionSwitchProps<K>) {
  const [prevKey, setPrevKey] = useState<K>(activeKey);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevOpacityRef = useRef(1);
  const currOpacityRef = useRef(1);
  const [prevOpacity, setPrevOpacity] = useState(1);
  const [currOpacity, setCurrOpacity] = useState(1);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeKey === prevKey) return;
    setPrevKey(prevKey);
    setIsTransitioning(true);
    setPrevOpacity(1);
    setCurrOpacity(0);
    prevOpacityRef.current = 1;
    currOpacityRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setPrevOpacity(0);
      setCurrOpacity(1);
      prevOpacityRef.current = 0;
      currOpacityRef.current = 1;
    });
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => { setIsTransitioning(false); timerRef.current = null; }, durationMs);
  }, [activeKey]);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <div className="relative flex-grow">
      {isTransitioning && (
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: prevOpacity, transition: `opacity ${durationMs}ms ease` }}>{views[prevKey]}</div>
      )}
      <div style={{ opacity: isTransitioning ? currOpacity : 1, transition: `opacity ${durationMs}ms ease` }}>{views[activeKey]}</div>
    </div>
  );
}
