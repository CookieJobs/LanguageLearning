import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendar } from '../services/geminiService';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
  const [dates, setDates] = useState<Set<string>>(new Set());
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      getCalendar().then(data => {
        // data is array of ISO strings. We only care about YYYY-MM-DD
        const s = new Set(data.map(d => d.split('T')[0]));
        setDates(s);
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isChecked = (d: Date) => {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return dates.has(key);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-800">打卡日历</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
            <span className="font-bold text-gray-700 text-lg">{year}年 {month + 1}月</span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((d, i) => {
              if (!d) return <div key={`empty-${i}`} />;
              const checked = isChecked(d);
              const isToday = new Date().toDateString() === d.toDateString();
              return (
                <div key={d.toISOString()} className="flex items-center justify-center aspect-square">
                  <div className={`
                    w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all
                    ${checked ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'text-gray-700 hover:bg-gray-100'}
                    ${isToday && !checked ? 'border-2 border-orange-500 text-orange-600' : ''}
                  `}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
