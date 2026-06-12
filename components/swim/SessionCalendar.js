import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';

const pad2 = (n) => String(n).padStart(2, '0');

const toDateKey = (year, month, day) => `${year}-${pad2(month + 1)}-${pad2(day)}`;

const buildMonthGrid = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first

  const cells = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, dateKey: toDateKey(year, month, day) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

const levelClass = (count) => {
  if (!count) return 'session-cal-day-empty';
  if (count === 1) return 'session-cal-day-1';
  if (count === 2) return 'session-cal-day-2';
  return 'session-cal-day-3';
};

export default function SessionCalendar({ sessions, selectedDate, onSelectDate }) {
  const { t, language } = useLanguage();
  const locale = language === 'nl' ? 'nl-NL' : language === 'ru' ? 'ru-RU' : language === 'tr' ? 'tr-TR' : 'en-US';

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const sessionsByDate = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      if (!s.date) return;
      map[s.date] = (map[s.date] || 0) + 1;
    });
    return map;
  }, [sessions]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const weekdays = useMemo(() => {
    const monday = new Date(2024, 0, 1); // Monday
    return Array.from({ length: 7 }, (_, i) =>
      new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i).toLocaleDateString(locale, {
        weekday: 'short',
      })
    );
  }, [locale]);

  const cells = buildMonthGrid(viewYear, viewMonth);

  const shiftMonth = (delta) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const monthSessionCount = Object.entries(sessionsByDate).filter(([dateKey]) => {
    const [y, m] = dateKey.split('-').map(Number);
    return y === viewYear && m === viewMonth + 1;
  }).reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="card p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">{t('history.calendarTitle')}</h2>
          <p className="text-xs text-ink-soft mt-0.5">
            {monthSessionCount > 0
              ? t('history.calendarMonthCount').replace('{count}', String(monthSessionCount))
              : t('history.calendarEmpty')}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-ink-soft"
            aria-label={t('history.calendarPrev')}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-ink min-w-[9rem] text-center capitalize">{monthLabel}</span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="p-1.5 rounded-md hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-ink-soft"
            aria-label={t('history.calendarNext')}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {weekdays.map((label) => (
          <div key={label} className="text-[10px] font-medium text-ink-faint text-center py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} className="aspect-square" aria-hidden="true" />;
          }

          const count = sessionsByDate[cell.dateKey] || 0;
          const isSelected = selectedDate === cell.dateKey;
          const isToday = cell.dateKey === toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <button
              key={cell.dateKey}
              type="button"
              title={count ? t('history.calendarDaySessions').replace('{count}', String(count)) : undefined}
              onClick={() => onSelectDate?.(isSelected ? null : cell.dateKey)}
              className={[
                'session-cal-day aspect-square rounded-md flex items-center justify-center text-[11px] font-medium transition-all',
                levelClass(count),
                isSelected ? 'ring-2 ring-brand ring-offset-1 dark:ring-offset-gray-900' : '',
                isToday ? 'font-bold' : '',
                count ? 'cursor-pointer hover:scale-105' : 'cursor-default',
              ].join(' ')}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <span className="text-[10px] text-ink-faint">{t('history.calendarLegend')}</span>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="session-cal-legend session-cal-day-empty" />
          <span className="session-cal-legend session-cal-day-1" />
          <span className="session-cal-legend session-cal-day-2" />
          <span className="session-cal-legend session-cal-day-3" />
        </div>
      </div>
    </div>
  );
}
