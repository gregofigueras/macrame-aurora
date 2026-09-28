import React, { useState } from 'react';
import type { Workshop } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Clock } from 'lucide-react';


interface CalendarGridProps {
  workshops: Workshop[];
  onSelectWorkshop: (workshop: Workshop) => void;
  onOpenCreateWithDate: (dateStr: string) => void;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  workshops,
  onSelectWorkshop,
  onOpenCreateWithDate,
  selectedDate,
  setSelectedDate,
}) => {
  // Current calendar view month/year
  const [currentDate, setCurrentDate] = useState(() => {
    // Look at first upcoming workshop or fallback to current date
    if (workshops.length > 0) {
      const sorted = [...workshops].sort((a, b) => a.date.localeCompare(b.date));
      const first = sorted[0];
      const [y, m] = first.date.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0 = Sun, 1 = Mon...)
  const firstDay = new Date(year, month, 1);
  const startingDayIndex = (firstDay.getDay() + 6) % 7; // Monday = 0

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Workshop mapping by date (YYYY-MM-DD)
  const workshopsByDate: Record<string, Workshop[]> = {};
  workshops.forEach(w => {
    if (!workshopsByDate[w.date]) {
      workshopsByDate[w.date] = [];
    }
    workshopsByDate[w.date].push(w);
  });

  // Calendar cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = startingDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dayNumber: d, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dayNumber: d, dateStr, isCurrentMonth: true });
  }

  // Next month leading days
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells && calendarCells.length % 7 !== 0; d++) {
    const m = month === 11 ? 1 : month + 2;
    const y = month === 11 ? year + 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ dayNumber: d, dateStr, isCurrentMonth: false });
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="bg-white rounded-3xl border border-[#EBE3D7] shadow-2xs overflow-hidden">
      
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-[#F2ECE4] bg-[#FAF7F2] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FDF0EB] text-[#C86D51] flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif-aurora text-2xl font-bold text-[#2D231E]">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-[#7D6E63]">
              Selecciona una fecha para ver o programar talleres
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 rounded-lg border border-[#DFCBB9] bg-white text-xs font-semibold text-[#5C4F47] hover:bg-[#FAF7F2] transition-colors"
          >
            Hoy
          </button>
          <div className="flex items-center rounded-xl border border-[#DFCBB9] bg-white p-0.5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-[#FAF7F2] text-[#5C4F47] transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-[#FAF7F2] text-[#5C4F47] transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 border-b border-[#F2ECE4] bg-[#F7F2EB] text-center text-xs font-bold text-[#7D6E63] py-2.5">
        <span>Lun</span>
        <span>Mar</span>
        <span>Mié</span>
        <span>Jue</span>
        <span>Vie</span>
        <span className="text-[#C86D51]">Sáb</span>
        <span className="text-[#C86D51]">Dom</span>
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-[#F2ECE4]">
        {calendarCells.map((cell, idx) => {
          const dayWorkshops = workshopsByDate[cell.dateStr] || [];
          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDate;

          return (
            <div
              key={idx}
              onClick={() => setSelectedDate(cell.dateStr === selectedDate ? null : cell.dateStr)}
              className={`min-h-[105px] sm:min-h-[120px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                !cell.isCurrentMonth
                  ? 'bg-[#FAF8F5]/50 text-[#C4B7AC]'
                  : isSelected
                  ? 'bg-[#FDF0EB] ring-2 ring-inset ring-[#C86D51]'
                  : 'bg-white hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                    isToday
                      ? 'bg-[#C86D51] text-white shadow-2xs'
                      : cell.isCurrentMonth
                      ? 'text-[#2D231E]'
                      : 'text-[#C4B7AC]'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {cell.isCurrentMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCreateWithDate(cell.dateStr);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-[#8E7E73] hover:text-[#C86D51] hover:bg-[#EFE7DE] transition-opacity"
                    title={`Crear taller el ${cell.dateStr}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Workshops badges for this day */}
              <div className="space-y-1 mt-1 overflow-hidden">
                {dayWorkshops.map(ws => {
                  const booked = ws.reservations.length;
                  const isFull = booked >= ws.maxCapacity;

                  return (
                    <div
                      key={ws.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWorkshop(ws);
                      }}
                      className={`p-1 sm:p-1.5 rounded-lg text-[10px] font-medium border leading-tight transition-all hover:scale-[1.02] shadow-2xs ${
                        isFull
                          ? 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]'
                          : booked > 0
                          ? 'bg-[#FFF8E1] text-[#B78103] border-[#FFE082]'
                          : 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]'
                      }`}
                      title={`${ws.title} (${ws.time} hs) - ${booked}/${ws.maxCapacity} cupos`}
                    >
                      <div className="font-bold truncate flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 shrink-0" />
                        <span>{ws.time}</span>
                        <span className="truncate">{ws.title}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5 font-semibold text-[9px]">
                        <span>{booked}/{ws.maxCapacity} cupos</span>
                        {isFull && <span className="font-bold">Lleno</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div />
            </div>
          );
        })}
      </div>

    </div>
  );
};
