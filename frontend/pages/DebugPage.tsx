// input: react, ../services/apiClient, ../components/Button
// output: DebugPage
// pos: 前端/页面
// 若我被更新，请同步更新我的开头注释，以及所属的文件夹的 README。
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiClient';
import { Button } from '../components/Button';
import { usePet } from '../contexts/PetContext';
import { fetchProgress } from '../services/geminiService';
import { useApp } from '../contexts/AppContext';
import { ProgressStats } from '../types';
import { ProgressWordItem } from '../components/ProgressDetailsModal';

export const DebugPage: React.FC = () => {
  const [word, setWord] = useState('');
  const [stage, setStage] = useState(0);
  
  const [petExp, setPetExp] = useState(0);
  const [petLevel, setPetLevel] = useState(1);
  const [petEnergy, setPetEnergy] = useState(100);
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [vocabularyList, setVocabularyList] = useState<ProgressWordItem[]>([]);

  const { refreshPet } = usePet();
  const { level: currentLevel, selectedTextbook } = useApp();

  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        const prog = await fetchProgress(currentLevel || undefined, selectedTextbook || undefined);
        if (prog && prog.list) {
          setVocabularyList(prog.list);
          // Set initial word to the first item in the list if available
          if (prog.list.length > 0 && !word) {
            setWord(prog.list[0].word);
          }
        }
      } catch (error) {
        console.error("Failed to fetch vocabulary list for debug page", error);
      }
    };
    loadVocabulary();
  }, [currentLevel, selectedTextbook]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };


  const handleUpdateWordStage = async () => {
    if (!word) {
      showMessage('请输入单词');
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/api/debug/set-word-stage', {
        method: 'POST',
        body: JSON.stringify({ word, stage }),
      });
      showMessage(`单词 "${word}" 阶段已更新为 ${stage}`);
    } catch (error) {
      console.error(error);
      showMessage('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleResetReviews = async () => {
    if (!confirm('确定要重置所有复习进度吗？这将不可撤销。')) return;
    setLoading(true);
    try {
      await apiFetch('/api/debug/reset-review', {
        method: 'POST',
      });
      showMessage('复习进度已重置');
    } catch (error) {
      console.error(error);
      showMessage('重置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePet = async () => {
    setLoading(true);
    try {
      // Note: Backend controller uses @Post('pet') which maps to /api/debug/pet
      await apiFetch('/api/debug/pet', {
        method: 'POST',
        body: JSON.stringify({
          exp: Number(petExp),
          level: Number(petLevel),
          energy: Number(petEnergy)
        }),
      });
      await refreshPet();
      showMessage('宠物属性已更新');
    } catch (error) {
      console.error(error);
      showMessage('更新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-6 space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center">调试工具 (Debug)</h1>
        
        {message && (
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg text-center text-sm">
            {message}
          </div>
        )}

        {/* 1. Word Stage Update */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">单词进度设置</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">选择单词</label>
              {vocabularyList.length > 0 ? (
                <select
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="" disabled>请选择一个单词</option>
                  {vocabularyList.map((item, index) => (
                    <option key={index} value={item.word}>
                      {item.word} (当前 Stage: {item.stage ?? 0})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="正在加载词汇列表或无数据，可手动输入..."
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">目标阶段 (0-3)</label>
              <select
                value={stage}
                onChange={(e) => setStage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value={0}>0 (New - 新词选择题)</option>
                <option value={1}>1 (Learning - 学习中选择题)</option>
                <option value={2}>2 (Reviewing - 填空题)</option>
                <option value={3}>3 (Mastered - 造句题)</option>
              </select>
            </div>
            <Button 
              onClick={handleUpdateWordStage} 
              disabled={loading || !word}
              className="w-full"
            >
              更新单词阶段
            </Button>
          </div>
        </section>

        {/* 2. Reset Reviews */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">重置数据</h2>
          <Button 
            onClick={handleResetReviews} 
            disabled={loading}
            variant="secondary" // Assuming secondary variant exists, or fallback to default
            className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
          >
            重置所有复习进度
          </Button>
        </section>

        {/* 3. Pet Stats */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">宠物属性修改</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">等级 (Level)</label>
                <span className="text-sm text-gray-500">{petLevel}</span>
              </div>
              <input
                type="number"
                min="1"
                max="50"
                value={petLevel}
                onChange={(e) => setPetLevel(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">经验值 (Exp)</label>
                <span className="text-sm text-gray-500">{petExp}</span>
              </div>
              <input
                type="number"
                value={petExp}
                onChange={(e) => setPetExp(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">能量 (Energy)</label>
                <span className="text-sm text-gray-500">{petEnergy}</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={petEnergy}
                onChange={(e) => setPetEnergy(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <Button 
              onClick={handleUpdatePet} 
              disabled={loading}
              className="w-full"
            >
              更新宠物属性
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DebugPage;
