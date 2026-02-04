// input: react, ./components/LoadingOverlay, ./components/SessionExpiredModal, lucide-react, react-router-dom, ./contexts/AppContext, ./router/AuthGuard, ./pages/LoginPage, ./pages/HomePage, ./pages/LearnPage, ./pages/ReviewPage, ./components/Logo
// output: AppRouter
// pos: 系统/通用
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React from 'react';
import { LoadingOverlay } from './components/LoadingOverlay';
import { SessionExpiredModal } from './components/SessionExpiredModal';
import { LogOut, User } from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthGuard } from './router/AuthGuard';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { ReviewPage } from './pages/ReviewPage';
import { LevelSelectPage } from './pages/LevelSelectPage';
import { Logo } from './components/Logo';

import { Header } from './components/Header';

const AppRouter: React.FC = () => {
  const Shell: React.FC = () => {
    const { isLoading, token, isSessionExpired, logout } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    React.useEffect(() => {
      if (!token && location.pathname !== '/login') {
        navigate('/login', { replace: true, state: { from: location } });
      }
    }, [token, location.pathname]);

    const showHeader = location.pathname !== '/login';

    return (
      <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-transparent">
        {showHeader && <Header />}
        <main className="flex-grow flex flex-col relative z-0">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<AuthGuard><HomePage /></AuthGuard>} />
            <Route path="/level-select" element={<AuthGuard><LevelSelectPage /></AuthGuard>} />
            <Route path="/learn" element={<AuthGuard><LearnPage /></AuthGuard>} />
            <Route path="/review" element={<AuthGuard><ReviewPage /></AuthGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {showHeader && (
          <footer className="py-6 mt-auto">
            <div className="max-w-5xl mx-auto px-6 text-center text-xs text-gray-400 font-medium">
              <p>© {new Date().getFullYear()} LinguaCraft AI. Designed with <span className="text-red-400">❤</span> for language learners</p>
            </div>
          </footer>
        )}
        <LoadingOverlay visible={isLoading} />
        <SessionExpiredModal
          visible={isSessionExpired}
          onLogin={async () => {
            await logout();
            navigate('/login');
          }}
        />
      </div>
    );
  };
  return (
    <BrowserRouter>
      <AppProvider>
        <Shell />
      </AppProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
