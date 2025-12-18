import React, { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  durationMs?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message, durationMs = 250 }) => {
  const [mounted, setMounted] = useState(visible);
  const [opacity, setOpacity] = useState(visible ? 1 : 0);

  useEffect(() => {
    if (visible) { setMounted(true); setOpacity(1); }
    else { setOpacity(0); const t = setTimeout(() => setMounted(false), durationMs); return () => clearTimeout(t); }
  }, [visible, durationMs]);

  if (!mounted) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white/70 backdrop-blur-sm" style={{ opacity, transition: `opacity ${durationMs}ms ease` }}>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium animate-pulse">{message || '正在为您准备内容...'}</p>
      </div>
    </div>
  );
};
