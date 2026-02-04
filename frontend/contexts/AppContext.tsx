// input: react, ../types, ../services/geminiService, ../services/apiClient
// output: AppProvider, useApp（含学习加载错误状态）
// pos: 前端/上下文层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { EducationLevel, MasteredItem, WordItem } from '../types';
import { addMastery, fetchWordsForLevel, getMe, logout as apiLogout, getStats, updateMe, fetchMasteryList } from '../services/geminiService';
import { SESSION_EXPIRED_EVENT } from '../services/apiClient';

type AppContextType = {
  token: string | null;
  setToken: (t: string | null) => void;
  userEmail: string | null;
  level: EducationLevel | null;
  meLoaded: boolean;
  wordQueue: WordItem[];
  currentWordIndex: number;
  masteredItems: MasteredItem[];
  sessionMastered: MasteredItem[];
  isLoading: boolean;
  streak: number;
  streakAtSessionStart: number;
  sessionProgress: number;
  loadError: { code: string; message: string } | null;
  handleLevelSelect: (selectedLevel: EducationLevel) => Promise<void>;
  handleWordSuccess: (word: WordItem, sentence: string) => Promise<void>;
  handleSkipWord: () => void;
  moveToNextWord: () => void;
  resetToHome: () => void;
  exitLearning: () => void;
  showSummary: boolean;
  startNextSession: () => Promise<void>;
  dismissSummary: () => void;
  logout: () => Promise<void>;
  isSessionExpired: boolean;
  selectedTextbook: string | null;
  handleTextbookSelect: (t: string | null) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [level, setLevel] = useState<EducationLevel | null>(EducationLevel.PRIMARY);
  const [selectedTextbook, setSelectedTextbook] = useState<string | null>(null);
  const [meLoaded, setMeLoaded] = useState(false);
  const [wordQueue, setWordQueue] = useState<WordItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [masteredItems, setMasteredItems] = useState<MasteredItem[]>(() => {
    const saved = localStorage.getItem('linguaCraft_mastered');
    return saved ? JSON.parse(saved) : [];
  });
  const [sessionMastered, setSessionMastered] = useState<MasteredItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('linguaCraft_token'));
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('linguaCraft_streak');
      if (!raw) return 0;
      const s = JSON.parse(raw);
      return typeof s?.count === 'number' ? s.count : 0;
    } catch { return 0; }
  });
  const [sessionProgress, setSessionProgress] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [streakAtSessionStart, setStreakAtSessionStart] = useState<number>(0);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [loadError, setLoadError] = useState<{ code: string; message: string } | null>(null);

  useEffect(() => {
    localStorage.setItem('linguaCraft_mastered', JSON.stringify(masteredItems));
  }, [masteredItems]);

  useEffect(() => {
    const load = async () => {
      if (!token) { setUserEmail(null); setStreak(0); setMeLoaded(true); return; }
      try {
        const me = await getMe();
        setUserEmail(me.email);
        if (me.educationLevel) setLevel(me.educationLevel as EducationLevel);
        if (me.textbook) setSelectedTextbook(me.textbook);
        try { const s = await getStats(); setStreak(s.currentStreak || 0) } catch { }
      } catch {
        setUserEmail(null);
      }
      setMeLoaded(true)
    };
    load();
  }, [token]);

  useEffect(() => {
    const onForceLogout = () => {
      setTokenState(null);
      setLevel(null);
      setWordQueue([]);
      setCurrentWordIndex(0);
      setSessionProgress(0);
      setIsSessionExpired(false);
      setLoadError(null);
    };

    const onSessionExpired = () => {
      setIsSessionExpired(true);
    };

    window.addEventListener('force-logout', onForceLogout);
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => {
      window.removeEventListener('force-logout', onForceLogout);
      window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
    };
  }, []);

  const handleLevelSelect = async (selectedLevel: EducationLevel) => {
    setIsLoading(true);
    setLoadError(null);
    setLevel(selectedLevel);
    // Persist to backend
    if (token) {
      updateMe({ educationLevel: selectedLevel }).catch(() => { });
    }
    try {
      let exclude: string[] = masteredItems.map(m => m.word)
      try {
        const list = await fetchMasteryList()
        exclude = Array.from(new Set([...exclude, ...list.map((x: any) => String(x.word || ''))]))
      } catch { }
      let newWords = await fetchWordsForLevel(selectedLevel, exclude, selectedTextbook || undefined);
      if (!newWords || newWords.length === 0) {
        try { newWords = await fetchWordsForLevel(selectedLevel, []) } catch { }
      }
      setWordQueue(newWords || []);
      setCurrentWordIndex(0);
      setSessionProgress(0);
      setSessionMastered([]);
      setShowSummary(false);
      setStreakAtSessionStart(streak || 0);
      setIsLoading(false);
    } catch (error) {
      setLoadError(toLoadError(error));
      setIsLoading(false);
    }
  };

  const handleWordSuccess = async (word: WordItem, sentence: string) => {
    const newItem: MasteredItem = {
      ...word,
      userSentence: sentence,
      masteredAt: new Date().toISOString(),
      sourceLevel: level || EducationLevel.PRIMARY,
    };
    setMasteredItems(prev => [newItem, ...prev]);
    setSessionMastered(prev => [newItem, ...prev]);
    setSessionProgress(p => p + 1);
    try { await addMastery(word, sentence, newItem.masteredAt, newItem.sourceLevel) } catch { }
    try {
      const today = new Date();
      const toStr = (d: Date) => {
        const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
      };
      const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
      const todayStr = toStr(today);
      const raw = localStorage.getItem('linguaCraft_streak');
      let next = 1; let lastDateStr: string | null = null;
      if (raw) {
        try {
          const s = JSON.parse(raw); lastDateStr = s?.lastDate || null; const last = lastDateStr ? parse(lastDateStr) : null;
          if (lastDateStr === todayStr) next = s?.count || 1;
          else if (last) { const diffDays = Math.floor((today.getTime() - last.getTime()) / 86400000); next = diffDays === 1 ? (s?.count || 0) + 1 : 1; }
        } catch { next = 1; }
      }
      localStorage.setItem('linguaCraft_streak', JSON.stringify({ count: next, lastDate: todayStr }));
      setStreak(next);
    } catch { }
    moveToNextWord();
  };

  const handleSkipWord = () => { moveToNextWord(); };

  const moveToNextWord = async () => {
    const nextIndex = currentWordIndex + 1;
    if (nextIndex >= wordQueue.length) {
      setShowSummary(true);
    } else {
      setCurrentWordIndex(nextIndex);
    }
  };

  const resetToHome = () => {
    setWordQueue([]);
    setCurrentWordIndex(0);
    setSessionProgress(0);
    setLoadError(null);
  };

  const exitLearning = () => {
    setWordQueue([]);
    setCurrentWordIndex(0);
    setSessionProgress(0);
    setLoadError(null);
  };

  const startNextSession = async () => {
    setIsLoading(true)
    setLoadError(null)
    const currentLevel = level || EducationLevel.PRIMARY;
    try {
      let exclude: string[] = [...masteredItems.map(m => m.word)]
      try {
        const list = await fetchMasteryList()
        exclude = Array.from(new Set([...exclude, ...list.map((x: any) => String(x.word || ''))]))
      } catch { }
      let moreWords = await fetchWordsForLevel(currentLevel, exclude, selectedTextbook || undefined)
      if (!moreWords || moreWords.length === 0) {
        try { moreWords = await fetchWordsForLevel(currentLevel, []) } catch { }
      }
      setWordQueue(moreWords || [])
      setCurrentWordIndex(0)
      setSessionMastered([])
      setSessionProgress(0)
      setShowSummary(false)
      setStreakAtSessionStart(streak || 0)
    } catch (error) {
      setLoadError(toLoadError(error))
    }
    setIsLoading(false)
  }

  const dismissSummary = () => { setShowSummary(false) }

  const logout = async () => {
    try { await apiLogout() } catch { }
    localStorage.removeItem('linguaCraft_token');
    localStorage.removeItem('linguaCraft_refresh');
    setTokenState(null);
    setLevel(null);
    setWordQueue([]);
    setCurrentWordIndex(0);
    setSessionProgress(0);
    setIsSessionExpired(false);
    setLoadError(null);
  };

  const setToken = (t: string | null) => { setTokenState(t); };

  function normalizeLevel(level: EducationLevel): string {
    switch (level) {
      case EducationLevel.PRIMARY: return 'Primary'
      case EducationLevel.MIDDLE: return 'Middle'
      case EducationLevel.HIGH: return 'High'
      case EducationLevel.UNIVERSITY: return 'University'
      case EducationLevel.PROFESSIONAL: return 'Professional'
      default: return String(level)
    }
  }

  function toLoadError(error: any): { code: string; message: string } {
    const code = String(error?.code || error?.message || 'unknown')
    if (code === 'unauthorized' || code === 'TOKEN_EXPIRED' || code === '401') {
      return { code: 'TOKEN_EXPIRED', message: '登录已过期，请重新登录。' }
    }
    if (code === 'VOCAB_EMPTY') {
      return { code: 'VOCAB_EMPTY', message: '词库未初始化或正在导入，请稍后再试。' }
    }
    if (code === 'DB_NOT_READY') {
      return { code: 'DB_NOT_READY', message: '数据库未就绪，请稍后重试。' }
    }
    return { code: 'UNKNOWN', message: '加载失败，请检查后端服务或网络连接。' }
  }

  const value = useMemo<AppContextType>(() => ({
    token,
    setToken,
    userEmail,
    level,
    meLoaded,
    wordQueue,
    currentWordIndex,
    masteredItems,
    sessionMastered,
    isLoading,
    streak,
    streakAtSessionStart,
    sessionProgress,
    loadError,
    handleLevelSelect,
    handleWordSuccess,
    handleSkipWord,
    moveToNextWord,
    resetToHome,
    exitLearning,
    showSummary,
    startNextSession,
    dismissSummary,
    logout,
    isSessionExpired,
    selectedTextbook,
    handleTextbookSelect: (t) => {
      setSelectedTextbook(t);
      if (token) {
        updateMe({ textbook: t || '' }).catch(() => { });
      }
    }
  }), [token, userEmail, level, meLoaded, wordQueue, currentWordIndex, masteredItems, sessionMastered, isLoading, streak, streakAtSessionStart, sessionProgress, showSummary, isSessionExpired, loadError, selectedTextbook]);

  return (<AppContext.Provider value={value}>{children}</AppContext.Provider>);
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('AppContext not found');
  return ctx;
};
