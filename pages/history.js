import { useState } from 'react';
import { History, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ConfirmModal';
import { useLanguage } from '../context/UserPreferencesContext';
import { useSwim } from '../context/SwimContext';
import {
  formatDateLong,
  formatDistance,
  formatDuration,
  formatPace,
} from '../lib/swimFormatters';

export default function HistoryPage() {
  const { t } = useLanguage();
  const { sessions, removeSession, isLoading } = useSwim();
  const [expandedId, setExpandedId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0">
      <PageHeader icon={History} titleKey="history.title" />

      <div className="max-w-3xl mx-auto space-y-4 px-4 py-8 md:px-8">
        {isLoading && <p className="text-ink-soft">{t('common.loading')}</p>}
        {!isLoading && !sorted.length && (
          <div className="card p-8 text-center text-ink-soft">{t('history.empty')}</div>
        )}
        {sorted.map((session) => {
          const m = session.metrics || {};
          const isOpen = expandedId === session.id;
          return (
            <div key={session.id} className="card p-4">
              <button
                type="button"
                className="w-full flex items-center justify-between text-left"
                onClick={() => setExpandedId(isOpen ? null : session.id)}
              >
                <div>
                  <p className="font-semibold text-ink">{formatDateLong(session.date)}</p>
                  <p className="text-sm text-ink-soft">
                    {formatDistance(m.distanceM)} · {formatPace(m.paceSecPer100m)} · {formatDuration(m.durationSec)}
                  </p>
                </div>
                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-3 text-sm">
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
