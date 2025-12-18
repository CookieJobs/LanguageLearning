import React from 'react';
import { LoadingOverlay } from './components/LoadingOverlay';
import { LogOut, User } from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthGuard } from './router/AuthGuard';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { ReviewPage } from './pages/ReviewPage';
import { Logo } from './components/Logo';

const HeaderBar: React.FC = () => {
  const { token, userEmail, logout, level } = useApp();
  const navigate = useNavigate();

  // Helper to get level label
  const getLevelLabel = (l: any) => {
    switch (l) {
      case 'Primary School (小学)': return '小学英语'
      case 'Junior High School (初中)': return '初中英语'
      case 'Senior High School (高中)': return '高中英语'
      case 'University (大学/四六级)': return '大学英语'
      case 'Professional/Study Abroad (雅思/托福/职场)': return '职场/留学英语'
      default: return null
    }
  }

  const levelLabel = getLevelLabel(level)

  return (
    <div className="sticky top-4 z-50 px-4 mb-4">
      <header className="glass mx-auto max-w-5xl rounded-2xl px-6 h-16 flex items-center justify-between shadow-sm">
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2"
          onClick={() => { navigate('/'); }}
          title="返回首页"
        >
          <Logo size="md" />
        </div>

        <div className="flex items-center gap-4">
          {token ? (
            <>
              {levelLabel && (
                <div className="hidden sm:flex text-xs font-bold px-3 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-100 uppercase tracking-wide">
                  {levelLabel}
                </div>
              )}

              <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-gray-200">
                {userEmail && (
                  <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                    <User size={14} className="text-gray-400" />
                    {userEmail.split('@')[0]}
                  </div>
                )}
                <button
                  onClick={async () => { await logout(); navigate('/login'); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-110"
                  title="退出登录"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-bold bg-brand-600 text-white px-5 py-2 rounded-full hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/30 transition-all active:scale-95"
            >
              登录
            </button>
          )}
        </div>
      </header>
    </div>
  );
};

const AppRouter: React.FC = () => {
  const Shell: React.FC = () => {
    const { isLoading, token } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    React.useEffect(() => {
      if (!token && location.pathname !== '/login') {
        navigate('/login', { replace: true, state: { from: location } });
      }
    }, [token, location.pathname]);

    // Don't show header on login page
    const showHeader = location.pathname !== '/login';

    return (
      <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-transparent">
        {showHeader && <HeaderBar />}
        <main className="flex-grow flex flex-col relative z-0">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<AuthGuard><HomePage /></AuthGuard>} />
            <Route path="/learn" element={<AuthGuard><LearnPage /></AuthGuard>} />
            <Route path="/review" element={<AuthGuard><ReviewPage /></AuthGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {showHeader && (
          <footer className="py-8 mt-auto">
            <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-400">
              <p>© {new Date().getFullYear()} LinguaCraft AI. Designed with <span className="text-red-400 animate-pulse">❤</span></p>
            </div>
          </footer>
        )}
        <LoadingOverlay visible={isLoading} />
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
