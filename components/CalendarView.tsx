
import React, { useState } from 'react';
import { ParishEvent } from '../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarViewProps {
  events: ParishEvent[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onAddEvent: (date?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  events, 
  selectedDate,
  onDateChange,
  onAddEvent
}) => {
  const [viewDate, setViewDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthYear = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const hasEventsOnDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.some(e => e.dataInicio === dateStr);
  };

  const isSelected = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDate === dateStr;
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateChange(dateStr);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col font-sans h-full">
      {/* Header do Calendário Compacto */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">{monthYear}</h2>
        <div className="flex gap-1">
          <button onClick={handlePrevMonth} className="text-slate-400 hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={handleNextMonth} className="text-slate-400 hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grade de Dias Compacta */}
      <div className="p-4">
        <div className="grid grid-cols-7 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
            <div key={day} className="text-slate-300 text-[9px] font-black text-center tracking-widest py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} className="h-8 w-full"></div>;
            
            const active = isSelected(day);
            const hasEvents = hasEventsOnDay(day);

            return (
              <div key={idx} className="flex items-center justify-center h-8 w-full relative">
                <button 
                  onClick={() => handleDayClick(day)}
                  className={`
                    w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all relative z-10
                    ${active 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  {day}
                </button>
                {hasEvents && !active && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></div>
                )}
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => onAddEvent(selectedDate)}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-slate-100 border-dashed"
        >
          <Plus size={12} /> Novo Evento
        </button>
      </div>
    </div>
  );
};
