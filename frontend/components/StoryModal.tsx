// input: react, lucide-react
// output: StoryModal
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Languages, RefreshCw, X, BookOpen } from 'lucide-react';

interface StoryModalProps {
    story: string | null;
    translation?: string;
    isLoading: boolean;
    onClose: () => void;
    onGenerate: () => void;
    error?: string | null;
}

export const StoryModal: React.FC<StoryModalProps> = ({ story, translation, isLoading, onClose, onGenerate, error }) => {
    const [showTranslation, setShowTranslation] = useState(true);

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in overflow-hidden">
            <div className="bg-white rounded-2xl border-2 border-gray-200 border-b-4 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-brand-50 via-accent-50/50 to-brand-50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                        <div className="p-2 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl text-white shadow-sm">
                            <BookOpen size={16} />
                        </div>
                        故事时间
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-white">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-5">
                            <div className="relative">
                                <div className="w-16 h-16 border-[3px] border-brand-100 rounded-full"></div>
                                <div className="absolute inset-0 w-16 h-16 border-[3px] border-transparent border-t-brand-500 rounded-full animate-spin"></div>
                            </div>
                            <p className="text-gray-500 font-medium text-sm">正在为您编织故事...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                                <BookOpen size={28} />
                            </div>
                            <p className="text-red-500 font-semibold mb-5">{error}</p>
                            <button
                                onClick={onGenerate}
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
                            >
                                重试
                            </button>
                        </div>
                    ) : story ? (
                        <div className="space-y-6">
                            <div className="prose max-w-none">
                                <div className="text-base leading-loose text-gray-700">
                                    {story.split(/(\*\*.*?\*\*)/).map((part, index) =>
                                        part.startsWith('**') && part.endsWith('**') ? (
                                            <span key={index} className="font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-lg border border-brand-100 mx-0.5">
                                                {part.slice(2, -2)}
                                            </span>
                                        ) : (
                                            <span key={index}>{part}</span>
                                        )
                                    )}
                                </div>
                            </div>

                            {translation && (
                                <div className="relative pt-5 border-t border-dashed border-gray-200">
                                    <button
                                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:text-brand-500 transition-colors rounded-full border border-gray-100"
                                        onClick={() => setShowTranslation(!showTranslation)}
                                    >
                                        <Languages size={12} />
                                        {showTranslation ? '隐藏翻译' : '显示翻译'}
                                    </button>
                                    <div className={`transition-all duration-300 overflow-hidden ${showTranslation ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0'}`}>
                                        <p className="text-gray-500 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl mt-2">
                                            {translation}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-14 text-gray-400 font-medium">
                            准备好生成故事了吗？
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/80 flex justify-end gap-2.5">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
                    >
                        关闭
                    </button>
                    {!isLoading && story && (
                        <button
                            onClick={onGenerate}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold hover:from-gray-900 hover:to-black shadow-lg shadow-gray-900/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            <span>生成新故事</span>
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
