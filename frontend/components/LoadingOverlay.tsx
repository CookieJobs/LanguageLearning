// input: react
// output: LoadingOverlay
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white/80 backdrop-blur-md" style={{ opacity, transition: `opacity ${durationMs}ms ease` }}>
      <div className="flex flex-col items-center space-y-5">
        <div className="relative">
          <div className="w-14 h-14 border-[3px] border-brand-100 rounded-full"></div>
          <div className="absolute inset-0 w-14 h-14 border-[3px] border-transparent border-t-brand-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium text-sm">{message || '正在为您准备内容...'}</p>
      </div>
    </div>
  );
};
