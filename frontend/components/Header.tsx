import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Logo } from './Logo';
import { LogOut, User, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
    const { token, userEmail, logout, level } = useApp();
    const navigate = useNavigate();

    const getLevelLabel = (l: any) => {
        switch (l) {
            case 'Primary School (小学)': return '小学'
            case 'Junior High School (初中)': return '初中'
            case 'Senior High School (高中)': return '高中'
            case 'University (大学/四六级)': return '大学'
            case 'Professional/Study Abroad (雅思/托福/职场)': return '职场'
            default: return null
        }
    }

    const levelLabel = getLevelLabel(level)

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Left: Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group"
                    onClick={() => navigate('/')}
                    title="返回首页"
                >
                    <Logo size="sm" />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {token ? (
                        <>
                            {/* Level Badge Switcher */}
                            {levelLabel && (
                                <button
                                    onClick={() => navigate('/level-select')}
                                    className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gray-50 hover:bg-brand-50 text-gray-600 hover:text-brand-600 rounded-full border border-gray-200 hover:border-brand-200 transition-all text-xs font-semibold group"
                                    title="切换学段/教材"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 group-hover:scale-125 transition-transform"></span>
                                    {levelLabel}
                                    <ChevronDown size={12} className="text-gray-400 group-hover:text-brand-400" />
                                </button>
                            )}

                            {/* User Profile */}
                            <div className="flex items-center gap-3 pl-3 sm:border-l sm:border-gray-200 h-6">
                                {userEmail && (
                                    <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-100 to-indigo-100 flex items-center justify-center text-brand-600 border border-brand-200/50 shadow-sm">
                                            <User size={14} strokeWidth={2.5} />
                                        </div>
                                        <span className="hidden md:inline">{userEmail.split('@')[0]}</span>
                                    </div>
                                )}

                                <button
                                    onClick={async () => { await logout(); navigate('/login'); }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="退出登录"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm font-semibold bg-brand-600 text-white px-5 py-2 rounded-full hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/25 transition-all active:scale-95"
                        >
                            登录
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
