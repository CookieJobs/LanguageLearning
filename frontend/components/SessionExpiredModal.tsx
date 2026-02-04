// input: react, lucide-react
// output: SessionExpiredModal
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React from 'react';
import { LogIn, AlertCircle } from 'lucide-react';

interface SessionExpiredModalProps {
  visible: boolean;
  onLogin: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ visible, onLogin }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in flex flex-col">
        <div className="p-8 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mb-2 shadow-sm">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            登录已过期
          </h2>

          <p className="text-gray-500 font-medium leading-relaxed text-sm">
            您的登录状态已失效，为了账号安全，请重新登录以继续使用。
          </p>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={onLogin}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold text-base shadow-lg shadow-brand-500/25 hover:shadow-brand-500/35 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            <span>重新登录</span>
          </button>
        </div>
      </div>
    </div>
  );
};
