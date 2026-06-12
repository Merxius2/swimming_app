import { useState } from 'react';
import { History, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ConfirmModal';
import SessionCalendar from '../components/swim/SessionCalendar';
import { useLanguage } from '../context/UserPreferencesContext';
import { useSwim } from '../context/SwimContext';
import {
  formatDateLong,
  formatDistance,
  formatDuration,
  formatPace,
} from '../lib/swimFormatters';
import CoinBadge from '../components/swim/CoinBadge';
import { sessionTotalCoins } from '../lib/swimCoinClaims';

export default function HistoryPage() {
  const { t } = useLanguage();
  const { sessions, removeSession, isLoading } = useSwim();
  const [expandedId, setExpandedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filtered = selectedDate ? sorted.filter((s) => s.date === selectedDate) : sorted;

  return (
    <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0">
      <PageHeader icon={History} titleKey="history.title" />

      <div className="max-w-3xl mx-auto space-y-4 px-4 py-8 md:px-8">
        {!isLoading && sorted.length > 0 && (
          <SessionCalendar
            sessions={sessions}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        )}

        {selectedDate && (
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-ink-soft">
              {t('history.filterDate').replace('{date}', formatDateLong(selectedDate))}
            </p>
            <button
              type="button"
              onClick={() => setSelectedDate(null)}
              className="text-xs font-medium text-brand"
            >
              {t('history.clearFilter')}
            </button>
          </div>
        )}

        {isLoading && <p className="text-ink-soft">{t('common.loading')}</p>}
        {!isLoading && !sorted.length && (
          <div className="card p-8 text-center text-ink-soft">{t('history.empty')}</div>
        )}
        {!isLoading && sorted.length > 0 && !filtered.length && (
          <div className="card p-6 text-center text-ink-soft text-sm">{t('history.noSessionsOnDate')}</div>
        )}
        {filtered.map((session) => {
          const m = session.metrics || {};
          const isOpen = expandedId === session.id;
          const coins = sessionTotalCoins(session);
          return (
            <div key={session.id} className="card p-4">
              <button
                type="button"
                className="w-full flex items-center justify-between text-left gap-3"
                onClick={() => setExpandedId(isOpen ? null : session.id)}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{formatDateLong(session.date)}</p>
                  <p className="text-sm text-ink-soft">
                    {formatDistance(m.distanceM)} · {formatPace(m.paceSecPer100m)} · {formatDuration(m.durationSec)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {coins > 0 && <CoinBadge amount={coins} size="sm" />}
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-3 text-sm">
                  {coins > 0 && (
                    <div className="col-span-2 flex items-center justify-between rounded-lg bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 px-3 py-2">
                      <span className="text-ink-soft text-xs font-medium">{t('history.coinsEarned')}</span>
                      <CoinBadge amount={coins} size="sm" />
                    </div>
                  )}
                  <div><span className="text-ink-faint">{t('upload.fields.activeKcal')}: </span>{m.activeKcal ?? '—'}</div>
                  <div><span className="text-ink-faint">{t('upload.fields.totalKcal')}: </span>{m.totalKcal ?? '—'}</div>
                  <div><span className="text-ink-faint">{t('upload.fields.heartRate')}: </span>{m.avgHeartRate ?? '—'}</div>
                  <div><span className="text-ink-faint">{t('upload.fields.laps')}: </span>{m.laps ?? '—'}</div>
                  <div><span className="text-ink-faint">{t('upload.fields.location')}: </span>{m.location || '—'}</div>
                  <div><span className="text-ink-faint">{t('upload.fields.timeRange')}: </span>{m.timeRange || '—'}</div>
                  <button
                    type="button"
                    onClick={() => setDeleteId(session.id)}
                    className="col-span-2 mt-2 inline-flex items-center gap-2 text-red-600 text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    {t('history.delete')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {deleteId && (
        <ConfirmModal
          title={t('history.deleteConfirm')}
          message=""
          confirmLabel={t('history.confirm')}
          cancelLabel={t('history.cancel')}
          onConfirm={() => {
            removeSession(deleteId);
            setDeleteId(null);
            if (expandedId === deleteId) setExpandedId(null);
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
