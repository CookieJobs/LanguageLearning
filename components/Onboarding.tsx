import React from 'react';
import { EducationLevel } from '../types';
import { Button } from './Button';
import { GraduationCap, BookOpen, School, Brain, Briefcase } from 'lucide-react';

interface OnboardingProps {
  onSelectLevel: (level: EducationLevel) => void;
  isLoading: boolean;
}

const levels = [
  { value: EducationLevel.PRIMARY, label: "小学", subLabel: "基础词汇", icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
  { value: EducationLevel.MIDDLE, label: "初中", subLabel: "中考必备", icon: School, color: 'text-green-500', bg: 'bg-green-50' },
  { value: EducationLevel.HIGH, label: "高中", subLabel: "高考冲刺", icon: GraduationCap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { value: EducationLevel.UNIVERSITY, label: "大学", subLabel: "四六级 / 考研", icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
  { value: EducationLevel.PROFESSIONAL, label: "职场 / 留学", subLabel: "雅思 / 托福 / 商务", icon: Briefcase, color: 'text-slate-600', bg: 'bg-slate-50' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onSelectLevel, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          欢迎使用 <span className="text-indigo-600">LinguaCraft</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-lg mx-auto">
          请选择您目前的学习阶段，我们将为您量身定制英语词汇学习计划。
          通过实际造句练习，帮助您真正掌握每一个单词。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {levels.map((level) => {
          const Icon = level.icon;
          return (
            <button
              key={level.value}
              onClick={() => onSelectLevel(level.value)}
              disabled={isLoading}
              className={`
                relative group flex flex-col items-center p-6 rounded-2xl border-2 border-transparent
                transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                bg-white shadow-sm
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-100'}
              `}
            >
              <div className={`p-4 rounded-full mb-4 ${level.bg} ${level.color} transition-transform group-hover:scale-110`}>
                <Icon size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{level.label}</h3>
              <p className="text-sm text-gray-400 mt-1">{level.subLabel}</p>
            </button>
          );
        })}
      </div>
      
      {isLoading && (
        <div className="mt-8 text-center text-gray-500 animate-pulse">
          正在为您定制学习计划...
        </div>
      )}
    </div>
  );
};