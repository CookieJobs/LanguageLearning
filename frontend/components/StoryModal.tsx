// input: react, lucide-react
// output: StoryModal
// pos: 前端/组件层
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React, { useState } from 'react';
import { Languages } from 'lucide-react';

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-violet-50 to-indigo-50">
                    <h2 className="text-xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                        <span>📖</span> ✨ 故事时间
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-md transition-all">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-xl">✨</div>
                            </div>
                            <p className="text-gray-500 font-medium animate-pulse">正在为您编织故事...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4 grayscale opacity-50">😿</div>
                            <p className="text-red-500 font-bold mb-6">{error}</p>
                            <button
                                onClick={onGenerate}
                                className="px-6 py-2.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 font-bold transition-colors"
                            >
                                重试
                            </button>
                        </div>
                    ) : story ? (
                        <div className="space-y-8">
                            <div className="prose max-w-none">
                                <div className="text-lg leading-loose text-gray-800 font-medium">
                                    {story.split(/(\*\*.*?\*\*)/).map((part, index) =>
                                        part.startsWith('**') && part.endsWith('**') ? (
                                            <span key={index} className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-lg border border-indigo-100 mx-0.5 shadow-sm">
                                                {part.slice(2, -2)}
                                            </span>
                                        ) : (
                                            <span key={index}>{part}</span>
                                        )
                                    )}
                                </div>
                            </div>

                            {translation && (
                                <div className="relative pt-6 border-t border-dashed border-gray-200">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-white text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:text-indigo-500 transition-colors" onClick={() => setShowTranslation(!showTranslation)}>
                                        <Languages size={14} />
                                        {showTranslation ? '隐藏翻译' : '显示翻译'}
                                    </div>
                                    <div className={`transition-all duration-300 overflow-hidden ${showTranslation ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0'}`}>
                                        <p className="text-gray-500 leading-loose text-base bg-gray-50 p-4 rounded-xl">
                                            {translation}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-400 font-medium">
                            准备好生成故事了吗？
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-colors"
                    >
                        关闭
                    </button>
                    {!isLoading && story && (
                        <button
                            onClick={onGenerate}
                            className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold hover:bg-black shadow-lg shadow-gray-900/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <span>🔄</span> 生成新故事
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
