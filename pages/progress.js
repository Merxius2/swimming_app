import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/UserPreferencesContext';
import { useSwim } from '../context/SwimContext';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useChartTheme } from '../hooks/useChartTheme';
import {
  getChartSessions,
  getWeeklyVolumeData,
  getStrokeChartData,
  buildPersonalFeedback,
  getCombinedStats,
} from '../lib/swimAnalysis';
import { getPersonalRecords } from '../lib/swimRecords';
import MonthlyChallengesCard from '../components/swim/MonthlyChallengesCard';
import RecordsSection from '../components/swim/RecordsSection';
import {
  formatPace,
  formatDistance,
  formatDuration,
  formatDateShort,
  getPaceChartDomain,
} from '../lib/swimFormatters';
import DonutChart from '../components/DonutChart';
import SessionFeedback from '../components/swim/SessionFeedback';

export default function ProgressPage() {
  const { t } = useLanguage();
  const { sessions, isLoading, profile } = useSwim();
  const { tooltipStyle, tooltipLabelStyle, gridStyle, axisStyle } = useChartTheme();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0 flex items-center justify-center">
        <p className="text-ink-soft">{t('common.loading')}</p>
      </div>
    );
  }

  if (!sessions.length) {
    return (
      <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-16 md:px-8 text-center">
          <div className="card p-12 max-w-lg mx-auto">
            <BarChart3 size={48} className="mx-auto text-brand mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('progress.emptyTitle')}</h2>
            <p className="text-ink-soft mb-6">{t('progress.emptyDesc')}</p>
            <Link href="/upload">
              <button type="button" className="px-6 py-3 rounded-full bg-brand text-white font-semibold">
                {t('progress.emptyCta')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const chartSessions = getChartSessions(sessions).map((s) => ({
    ...s,
    dateLabel: formatDateShort(s.date),
  }));
  const paceDomain = getPaceChartDomain(chartSessions.map((s) => s.paceSecPer100m));
  const weeklyData = getWeeklyVolumeData(sessions);
  const latest = sessions[sessions.length - 1];
  const strokeData = getStrokeChartData(latest, t);
  const combined = getCombinedStats(sessions);
  const records = getPersonalRecords(sessions);
  const feedback = buildPersonalFeedback(latest, sessions, t, profile);
  const m = latest.metrics || {};

  return (
    <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0">
      <PageHeader icon={BarChart3} titleKey="progress.title" />
      <div className="max-w-7xl mx-auto space-y-6 px-4 py-8 md:px-8">
        <MonthlyChallengesCard sessions={sessions} />
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4">{t('progress.latestSession')}</h2>
          <p className="text-sm text-ink-soft mb-4">{formatDateShort(latest.date)}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-ink-faint">{t('upload.fields.distance')}</p>
              <p className="text-xl font-bold text-blue-500">{formatDistance(m.distanceM)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-faint">{t('upload.fields.duration')}</p>
              <p className="text-xl font-bold text-amber-500">{formatDuration(m.durationSec)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-faint">{t('upload.fields.pace')}</p>
              <p className="text-xl font-bold text-teal-500">{formatPace(m.paceSecPer100m)}</p>
            </div>
            <div>
              <p className="text-xs text-ink-faint">{t('upload.fields.heartRate')}</p>
              <p className="text-xl font-bold text-orange-500">{m.avgHeartRate ?? '—'} {t('common.bpm')}</p>
            </div>
          </div>
        </div>

        {combined && (
          <div className="card p-6">
            <h2 className="text-lg font-bold mb-4">{t('progress.allTimeStats')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-ink-faint">{t('progress.totalSessions')}</p>
                <p className="text-xl font-bold text-ink">{combined.sessionCount}</p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">{t('progress.totalDistance')}</p>
                <p className="text-xl font-bold text-blue-500">{formatDistance(combined.totalDistanceM)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">{t('progress.totalTime')}</p>
                <p className="text-xl font-bold text-amber-500">{formatDuration(combined.totalDurationSec)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">{t('progress.avgPace')}</p>
                <p className="text-xl font-bold text-teal-500">{formatPace(combined.avgPaceSecPer100m)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">{t('progress.bestPace')}</p>
                <p className="text-xl font-bold text-green-500">{formatPace(combined.bestPaceSecPer100m)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">{t('progress.totalCalories')}</p>
                <p className="text-xl font-bold text-red-500">{combined.totalActiveKcal.toLocaleString()} {t('common.kcal')}</p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">{t('progress.totalLaps')}</p>
                <p className="text-xl font-bold text-purple-500">{combined.totalLaps}</p>
              </div>
              <div>
                <p className="text-xs text-ink-faint">{t('progress.avgHeartRate')}</p>
                <p className="text-xl font-bold text-orange-500">
                  {combined.avgHeartRate ?? '—'} {t('common.bpm')}
                </p>
              </div>
            </div>
          </div>
        )}

        <RecordsSection records={records} />

        <SessionFeedback
          insights={feedback.insights}
          badges={feedback.badges}
          coachMessage={feedback.coachMessage}
          motivation={feedback.motivation}
        />

        <div className="card p-6">
          <h3 className="font-bold mb-4">{t('progress.paceChart')}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartSessions}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
              <XAxis dataKey="dateLabel" stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
              <YAxis
                stroke={axisStyle.stroke}
                tick={{ fill: axisStyle.fill, fontSize: 11 }}
                tickFormatter={(v) => formatPace(v).replace('/100m', '')}
                domain={paceDomain}
                reversed
                allowDataOverflow
              />
              <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} formatter={(v) => formatPace(v)} />
              <Line
                type="monotone"
                dataKey="paceSecPer100m"
                stroke="#14B8A6"
                strokeWidth={2}
                dot={{ r: 5, strokeWidth: 2, fill: '#14B8A6' }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h3 className="font-bold mb-4">{t('progress.distanceChart')}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartSessions}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                <XAxis dataKey="dateLabel" stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                <YAxis stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} formatter={(v) => formatDistance(v)} />
                <Bar dataKey="distanceM" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="font-bold mb-4">{t('progress.caloriesChart')}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartSessions}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                <XAxis dataKey="dateLabel" stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                <YAxis stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                <Legend />
                <Area type="monotone" dataKey="activeKcal" name={t('progress.activeKcal')} stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                <Area type="monotone" dataKey="totalKcal" name={t('progress.totalKcal')} stroke="#F97316" fill="#F97316" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <h3 className="font-bold mb-4">{t('progress.heartRateChart')}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartSessions}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                <XAxis dataKey="dateLabel" stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                <YAxis stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                <Line type="monotone" dataKey="avgHeartRate" stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {weeklyData.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold mb-4">{t('progress.weeklyVolume')}</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                  <XAxis dataKey="weekLabel" stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                  <YAxis stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} formatter={(v) => formatDistance(v)} />
                  <Bar dataKey="distanceM" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {strokeData.length > 0 && (
          <div className="card p-6">
            <h3 className="font-bold mb-4">{t('progress.strokeMix')}</h3>
            <DonutChart
              data={strokeData}
              totalAmount={strokeData.reduce((s, d) => s + d.value, 0)}
              getSymbol={() => ''}
              title="M"
              height={280}
            />
          </div>
        )}
      </div>
    </div>
  );
}
