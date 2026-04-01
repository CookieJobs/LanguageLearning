import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { EducationLevel } from '../types';
import { fetchTextbooks } from '../services/geminiService';
import { ArrowLeft, Check, Book } from 'lucide-react';

export const LevelSelectPage: React.FC = () => {
    const { isLoading, level: currentLevel, handleLevelSelect, selectedTextbook: currentTextbook } = useApp();
    const navigate = useNavigate();
    const [primaryTextbooks, setPrimaryTextbooks] = useState<string[]>([]);
    const [middleTextbooks, setMiddleTextbooks] = useState<string[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
    
    // Local state for immediate feedback without triggering global loading
    const [tempLevel, setTempLevel] = useState<EducationLevel | null>(currentLevel);
    const [tempTextbook, setTempTextbook] = useState<string | null>(currentTextbook);

    useEffect(() => {
        if (currentLevel) setTempLevel(currentLevel);
    }, [currentLevel]);

    useEffect(() => {
        setTempTextbook(currentTextbook);
    }, [currentTextbook]);

    useEffect(() => {
        fetchTextbooks('Primary').then(setPrimaryTextbooks).catch(() => { });
        fetchTextbooks('Middle').then(setMiddleTextbooks).catch(() => { });
    }, []);

    const getFilteredPrimaryBooks = () => {
        if (!selectedGrade) return [];
        const gradeChar = ['一', '二', '三', '四', '五', '六'][selectedGrade - 1];
        
        return primaryTextbooks.filter(tb => {
            // Regular expression to match grade patterns like "一年级", "二年级", etc.
            // We want to find the LAST occurrence of a grade in the string, as that usually indicates the target grade.
            // Example: "人教版一年级起点二年级上" -> matches "一年级", "二年级". The last one is "二年级", so this book belongs to Grade 2.
            const gradeMatches = tb.match(/[一二三四五六]年级/g);
            
            if (!gradeMatches || gradeMatches.length === 0) return false;
            
            // Get the last matched grade
            const targetGrade = gradeMatches[gradeMatches.length - 1];
            
            // Check if it matches our selected grade
            return targetGrade === `${gradeChar}年级`;
        });
    };

    const levels = [
        { id: EducationLevel.PRIMARY, label: '小学', icon: '🌱', desc: '基础词汇与日常对话' },
        { id: EducationLevel.MIDDLE, label: '初中', icon: '🚀', desc: '进阶语法与常用表达' },
        { id: EducationLevel.HIGH, label: '高中', icon: '🎓', desc: '高考重点与复杂句式' },
        { id: EducationLevel.UNIVERSITY, label: '四级', icon: '🏛️', desc: '四级词汇 · 核心进阶' },
        { id: EducationLevel.PROFESSIONAL, label: '六级', icon: '💼', desc: '六级词汇 · 高阶提升' },
    ];

    return (
        <div className="pb-16 min-h-screen bg-gray-50/50">
            <main className="max-w-3xl mx-auto px-5 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">选择学习等级</h1>
                        <p className="text-sm text-gray-500 font-medium">挑选适合您的挑战级别</p>
                    </div>
                </div>

                {/* Level List */}
                <div className="grid gap-4">
                    {levels.map((l) => (
                        <div key={l.id} className="relative group">
                            <button
                                onClick={() => {
                                    setTempLevel(l.id);
                                    if (l.id !== EducationLevel.MIDDLE) {
                                        setTempTextbook(null);
                                    }
                                }}
                                disabled={isLoading}
                                className={`
                w-full relative p-5 rounded-2xl border-2 text-left flex items-center gap-5 transition-all duration-300
                ${tempLevel === l.id
                                        ? 'bg-brand-50 border-brand-500 border-b-2 translate-y-1'
                                        : 'bg-white border-gray-200 border-b-4 hover:border-duo-blue active:border-b-2 active:translate-y-1'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
                            >
                                <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110
                ${tempLevel === l.id ? 'bg-white' : 'bg-gray-50 group-hover:bg-brand-50'}
              `}>
                                    {l.icon}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`font-bold text-lg ${tempLevel === l.id ? 'text-brand-700' : 'text-gray-900'}`}>
                                            {l.label}
                                        </span>
                                        {tempLevel === l.id && (
                                            <span className="px-2 py-0.5 rounded-full bg-brand-100/50 text-brand-600 text-xs font-bold uppercase tracking-wider">
                                                当前
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">{l.desc}</p>
                                </div>

                                {tempLevel === l.id && (
                                    <div className="text-brand-500 bg-white p-2 rounded-full shadow-sm">
                                        <Check size={20} strokeWidth={3} />
                                    </div>
                                )}
                            </button>

                            {/* Textbook Selection for Primary School */}
                            {l.id === EducationLevel.PRIMARY && tempLevel === EducationLevel.PRIMARY && (
                                <div className="mt-2 ml-4 pl-4 border-l-2 border-brand-200 animate-slide-down">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Book size={12} /> 选择年级
                                    </p>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {[1, 2, 3, 4, 5, 6].map(g => (
                                            <button
                                                key={g}
                                                onClick={(e) => { e.stopPropagation(); setSelectedGrade(g); setTempTextbook(null); }}
                                                className={`px-3 py-2 text-sm rounded-lg border text-center transition-all ${selectedGrade === g ? 'bg-brand-500 text-white border-brand-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}
                                            >
                                                {['一', '二', '三', '四', '五', '六'][g - 1]}年级
                                            </button>
                                        ))}
                                    </div>

                                    {selectedGrade && (
                                        <>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <Book size={12} /> 选择教材
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setTempTextbook(null); }}
                                                    className={`px-3 py-2 text-sm rounded-lg border text-left transition-all ${!tempTextbook ? 'bg-brand-500 text-white border-brand-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}
                                                >
                                                    默认 (综合词汇)
                                                </button>
                                                {getFilteredPrimaryBooks().map(tb => (
                                                    <button
                                                        key={tb}
                                                        onClick={(e) => { e.stopPropagation(); setTempTextbook(tb); }}
                                                        className={`px-3 py-2 text-sm rounded-lg border text-left truncate transition-all ${tempTextbook === tb ? 'bg-brand-500 text-white border-brand-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}
                                                        title={tb}
                                                    >
                                                        {tb}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Textbook Selection for Middle School */}
                            {l.id === EducationLevel.MIDDLE && tempLevel === EducationLevel.MIDDLE && middleTextbooks.length > 0 && (
                                <div className="mt-2 ml-4 pl-4 border-l-2 border-brand-200 animate-slide-down">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <Book size={12} /> 选择教材 (可选)
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setTempTextbook(null); }}
                                            className={`px-3 py-2 text-sm rounded-lg border text-left transition-all ${!tempTextbook ? 'bg-brand-500 text-white border-brand-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}
                                        >
                                            默认 (综合词汇)
                                        </button>
                                        {middleTextbooks.map(tb => (
                                            <button
                                                key={tb}
                                                onClick={(e) => { e.stopPropagation(); setTempTextbook(tb); }}
                                                className={`px-3 py-2 text-sm rounded-lg border text-left truncate transition-all ${tempTextbook === tb ? 'bg-brand-500 text-white border-brand-500 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}
                                                title={tb}
                                            >
                                                {tb}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {/* Bottom Confirmation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg animate-slide-up z-50">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        {tempLevel && (
                            <span>
                                已选择: <span className="font-bold text-gray-900">{levels.find(l => l.id === tempLevel)?.label}</span>
                                {tempTextbook && <span className="text-gray-400"> • {tempTextbook}</span>}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={async () => {
                            const hasChanges = tempLevel !== currentLevel || tempTextbook !== currentTextbook;
                            if (hasChanges && tempLevel) {
                                await handleLevelSelect(tempLevel, tempTextbook);
                            }
                            navigate('/');
                        }}
                        className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                        完成选择
                    </button>
                </div>
            </div>
        </div>
    );
};
