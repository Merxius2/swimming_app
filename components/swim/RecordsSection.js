import { Trophy } from 'lucide-react';
import { useLanguage } from '../../context/UserPreferencesContext';
import { formatDuration, formatPace, formatDistance } from '../../lib/swimFormatters';
import { formatRecordDate } from '../../lib/swimRecords';

const RECORD_CONFIG = [
  { key: 'longestDistance', labelKey: 'records.longestDistance', format: (v) => formatDistance(v), color: 'text-blue-500' },
  { key: 'fastestPace', labelKey: 'records.fastestPace', format: (v) => formatPace(v), color: 'text-teal-500' },
  { key: 'mostActiveCalories', labelKey: 'records.mostCalories', format: (v) => `${v?.toLocaleString()} kcal`, color: 'text-red-500' },
  { key: 'mostTotalCalories', labelKey: 'records.mostTotalCalories', format: (v) => `${v?.toLocaleString()} kcal`, color: 'text-orange-500' },
  { key: 'mostLaps', labelKey: 'records.mostLaps', format: (v) => String(v), color: 'text-purple-500' },
  { key: 'longestDuration', labelKey: 'records.longestDuration', format: (v) => formatDuration(v), color: 'text-amber-500' },
  { key: 'highestHeartRate', labelKey: 'records.highestHeartRate', format: (v, t) => `${v} ${t('common.bpm')}`, color: 'text-rose-500' },
];

export default function RecordsSection({ records }) {
  const { t } = useLanguage();

  if (!records) return null;

  const entries = RECORD_CONFIG.map((cfg) => ({
    ...cfg,
    record: records[cfg.key],
  })).filter((e) => e.record);

  if (!entries.length) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={22} className="text-amber-500" />
        <h2 className="text-lg font-bold text-ink dark:text-gray-100">{t('records.title')}</h2>
      </div>
      <p className="text-sm text-ink-soft mb-5">{t('records.subtitle')}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(({ key, labelKey, format, color, record }) => (
          <div
            key={key}
            className="rounded-lg border border-gray-100 dark:border-gray-800 bg-black/[0.02] dark:bg-white/[0.03] p-4 record-tile"
          >
            <p className="text-xs text-ink-faint mb-1">{t(labelKey)}</p>
            <p className={`text-xl font-bold ${color}`}>
              {format(record.value, t)}
            </p>
            <p className="text-xs text-ink-soft mt-2">{formatRecordDate(record.date)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
