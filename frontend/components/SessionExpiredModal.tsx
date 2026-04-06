// input: react, lucide-react
// output: SessionExpiredModal
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React from 'react';
import { createPortal } from 'react-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface SessionExpiredModalProps {
  visible: boolean;
  onLogin: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ visible, onLogin }) => {
  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="bg-white rounded-2xl border-2 border-gray-200 border-b-4 shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in flex flex-col">
        <div className="p-8 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-duo-yellow/20 rounded-2xl flex items-center justify-center mb-2 shadow-sm border-2 border-duo-yellow/30 border-b-4">
            <AlertCircle className="w-8 h-8 text-duo-orange" />
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            登录已过期
          </h2>

          <p className="text-gray-500 font-bold text-sm leading-relaxed">
            您的登录状态已失效，为了账号安全，请重新登录以继续使用。
          </p>
        </div>

        <div className="p-6 pt-0">
          <Button
            onClick={onLogin}
            variant="primary"
            className="w-full py-3.5"
          >
            <LogIn size={18} />
            <span>重新登录</span>
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
