import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart3, MousePointerClick } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/UserPreferencesContext';
import { useSwim } from '../context/SwimContext';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useChartTheme } from '../hooks/useChartTheme';
import {
  getChartSessions,
  getWeeklyVolumeData,
  getStrokeChartData,
  buildPersonalFeedback,
  buildProgressOverviewMessage,
  getCombinedStats,
  getStatsSessions,
} from '../lib/swimAnalysis';
import { getPersonalRecords } from '../lib/swimRecords';
import MonthlyChallengesCard from '../components/swim/MonthlyChallengesCard';
import CoinBadge from '../components/swim/CoinBadge';
import RecordsSection from '../components/swim/RecordsSection';
import {
  formatPace,
  formatDistance,
  formatDuration,
  formatDateShort,
  getPaceChartDomain,
} from '../lib/swimFormatters';
import DonutChart from '../components/DonutChart';
import { addMovingAverage } from '../lib/chartMovingAverage';
import SessionFeedback from '../components/swim/SessionFeedback';
import MascotCoach from '../components/mascot/MascotCoach';
import { getMascotName, getMascotCoachedLevel, resolveMascotId } from '../lib/mascotConstants';
import { applyMessagePlaceholders } from '../lib/swimProfile';
import { resolveMascotBubbleTone } from '../lib/mascotPresentation';

export default function ProgressPage() {
  const { t } = useLanguage();
  const {
    sessions,
    isLoading,
    profile,
    totalCoins,
    monthlyChallengeRerolls,
    challengeRerollCredits,
    rerollMonthlyChallenge,
  } = useSwim();
  const { tooltipStyle, tooltipLabelStyle, gridStyle, axisStyle } = useChartTheme();
  const [chartsInteractive, setChartsInteractive] = useState(false);

  const chartSessions = useMemo(() => {
    const base = getChartSessions(sessions).map((session) => ({
      ...session,
      dateLabel: formatDateShort(session.date),
    }));
    return addMovingAverage(
      addMovingAverage(
        addMovingAverage(
          addMovingAverage(base, 'paceSecPer100m', 3, 'paceMa'),
          'distanceM',
          3,
          'distanceMa'
        ),
        'activeKcal',
        3,
        'activeKcalMa'
      ),
      'avgHeartRate',
      3,
      'avgHeartRateMa'
    );
  }, [sessions]);
  const paceDomain = useMemo(
    () => getPaceChartDomain(chartSessions.map((s) => s.paceSecPer100m)),
    [chartSessions]
  );
  const weeklyData = useMemo(
    () => addMovingAverage(getWeeklyVolumeData(sessions), 'distanceM', 3, 'distanceMa'),
    [sessions]
  );
  const combined = useMemo(() => getCombinedStats(sessions), [sessions]);
  const statsSessionCount = useMemo(() => getStatsSessions(sessions).length, [sessions]);
  const records = useMemo(() => getPersonalRecords(sessions), [sessions]);
  const feedback = useMemo(
    () => (sessions.length ? buildPersonalFeedback(sessions[sessions.length - 1], sessions, t, profile) : null),
    [sessions, t, profile]
  );
  const overviewMessage = useMemo(
    () => buildProgressOverviewMessage(sessions, profile, t, { monthlyChallengeRerolls }),
    [sessions, profile, t, monthlyChallengeRerolls]
  );
  const strokeData = useMemo(
    () => (sessions.length ? getStrokeChartData(sessions[sessions.length - 1], t) : []),
    [sessions, t]
  );

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
        <PageHeader icon={BarChart3} titleKey="progress.title" />
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 space-y-6">
          <div className="card p-4 md:p-6">
            <MascotCoach
              message={applyMessagePlaceholders(t('progress.mascotEmpty'), profile, t)}
              mascotId={resolveMascotId(profile, { sessions: [] })}
              level={getMascotCoachedLevel(resolveMascotId(profile, { sessions: [] }))}
              coachName={getMascotName(resolveMascotId(profile, { sessions: [] }), t)}
              bubbleTone="default"
              size={200}
              animated
            />
          </div>
          <div className="text-center">
            <div className="card p-12 max-w-lg mx-auto">
              <BarChart3 size={48} className="mx-auto text-brand mb-4" />
              <h2 className="text-2xl font-bold mb-2">{t('progress.emptyTitle')}</h2>
              <p className="text-ink-soft mb-6">{t('progress.emptyDesc')}</p>
              <Link href="/settings">
                <button type="button" className="px-6 py-3 rounded-full bg-brand text-white font-semibold">
                  {t('progress.emptyCta')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const latest = sessions[sessions.length - 1];
  const excludedCount = sessions.length - statsSessionCount;
  const mascotContext = { sessions, monthlyChallengeRerolls };
  const mascotId = resolveMascotId(profile, mascotContext);
  const mascotLevel = getMascotCoachedLevel(mascotId);
  const overviewTone = resolveMascotBubbleTone({
    message: overviewMessage,
    badges: [],
  });
  const m = latest.metrics || {};

  return (
    <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0">
      <PageHeader icon={BarChart3} titleKey="progress.title" />
      <div className="max-w-7xl mx-auto space-y-6 px-4 py-8 md:px-8">
        <div className="card p-4 md:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-faint mb-3">
            {t('progress.overviewTitle')}
          </p>
          <MascotCoach
            message={overviewMessage}
            mascotId={mascotId}
            level={mascotLevel}
            bubbleTone={overviewTone}
            coachName={getMascotName(mascotId, t)}
            size={220}
            animated
          />
        </div>

        <MonthlyChallengesCard
          sessions={sessions}
          monthlyChallengeRerolls={monthlyChallengeRerolls}
          challengeRerollCredits={challengeRerollCredits}
          onRerollChallenge={rerollMonthlyChallenge}
        />
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
            <h2 className="text-lg font-bold mb-1">{t('progress.allTimeStats')}</h2>
            {excludedCount > 0 && (
              <p className="text-sm text-ink-soft mb-4">
                {t('progress.statsBasedOn').replace('{count}', String(statsSessionCount)).replace('{total}', String(sessions.length))}
              </p>
            )}
            {excludedCount === 0 && <div className="mb-4" />}
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
              <div>
                <p className="text-xs text-ink-faint">{t('coins.label')}</p>
                <div className="mt-1"><CoinBadge amount={totalCoins} /></div>
              </div>
            </div>
          </div>
        )}

        <RecordsSection records={records} />

        <SessionFeedback
          titleKey="progress.sessionFeedbackTitle"
          mascotMood={feedback.mascotMood}
          insights={feedback.insights}
          badges={feedback.badges}
          coachMessage={feedback.coachMessage}
          motivation={feedback.motivation}
          highlights={feedback.highlights}
          tip={feedback.tip}
          benchmarkLevel={feedback.benchmarkLevel}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
            {t('progress.chartsSection')}
          </p>
          <button
            type="button"
            onClick={() => setChartsInteractive((value) => !value)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              chartsInteractive
                ? 'bg-brand-primary text-white'
                : 'bg-gray-100 text-ink-soft dark:bg-gray-800'
            }`}
            aria-pressed={chartsInteractive}
          >
            <MousePointerClick size={14} />
            {chartsInteractive ? t('progress.chartsInteractiveOn') : t('progress.chartsInteractiveOff')}
          </button>
        </div>

        <div
          className="card p-6"
          style={{ touchAction: chartsInteractive ? 'auto' : 'pan-y' }}
        >
          <h3 className="font-bold mb-4">{t('progress.paceChart')}</h3>
          <div style={{ pointerEvents: chartsInteractive ? 'auto' : 'none' }}>
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
                <Tooltip
                  active={chartsInteractive ? undefined : false}
                  contentStyle={tooltipStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(v) => formatPace(v)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="paceSecPer100m"
                  name={t('progress.actual')}
                  stroke="#14B8A6"
                  strokeWidth={2}
                  dot={{ r: 5, strokeWidth: 2, fill: '#14B8A6' }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="paceMa"
                  name={t('progress.movingAverage')}
                  stroke="#6366F1"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6" style={{ touchAction: chartsInteractive ? 'auto' : 'pan-y' }}>
            <h3 className="font-bold mb-4">{t('progress.distanceChart')}</h3>
            <div style={{ pointerEvents: chartsInteractive ? 'auto' : 'none' }}>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={chartSessions}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                  <XAxis dataKey="dateLabel" stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                  <YAxis stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                  <Tooltip
                    active={chartsInteractive ? undefined : false}
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    formatter={(v) => formatDistance(v)}
                  />
                  <Legend />
                  <Bar dataKey="distanceM" name={t('progress.actual')} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="distanceMa"
                    name={t('progress.movingAverage')}
                    stroke="#6366F1"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6" style={{ touchAction: chartsInteractive ? 'auto' : 'pan-y' }}>
            <h3 className="font-bold mb-4">{t('progress.caloriesChart')}</h3>
            <div style={{ pointerEvents: chartsInteractive ? 'auto' : 'none' }}>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={chartSessions}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                  <XAxis dataKey="dateLabel" stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                  <YAxis stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                  <Tooltip active={chartsInteractive ? undefined : false} contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                  <Legend />
                  <Area type="monotone" dataKey="activeKcal" name={t('progress.activeKcal')} stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="totalKcal" name={t('progress.totalKcal')} stroke="#F97316" fill="#F97316" fillOpacity={0.2} />
                  <Line
                    type="monotone"
                    dataKey="activeKcalMa"
                    name={t('progress.movingAverage')}
                    stroke="#6366F1"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6" style={{ touchAction: chartsInteractive ? 'auto' : 'pan-y' }}>
            <h3 className="font-bold mb-4">{t('progress.heartRateChart')}</h3>
            <div style={{ pointerEvents: chartsInteractive ? 'auto' : 'none' }}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartSessions}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                  <XAxis dataKey="dateLabel" stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                  <YAxis stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} domain={['auto', 'auto']} />
                  <Tooltip active={chartsInteractive ? undefined : false} contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="avgHeartRate" name={t('progress.actual')} stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} />
                  <Line
                    type="monotone"
                    dataKey="avgHeartRateMa"
                    name={t('progress.movingAverage')}
                    stroke="#6366F1"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {weeklyData.length > 0 && (
            <div className="card p-6" style={{ touchAction: chartsInteractive ? 'auto' : 'pan-y' }}>
              <h3 className="font-bold mb-4">{t('progress.weeklyVolume')}</h3>
              <div style={{ pointerEvents: chartsInteractive ? 'auto' : 'none' }}>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                    <XAxis dataKey="weekLabel" stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                    <YAxis stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                    <Tooltip
                      active={chartsInteractive ? undefined : false}
                      contentStyle={tooltipStyle}
                      labelStyle={tooltipLabelStyle}
                      formatter={(v) => formatDistance(v)}
                    />
                    <Legend />
                    <Bar dataKey="distanceM" name={t('progress.actual')} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Line
                      type="monotone"
                      dataKey="distanceMa"
                      name={t('progress.movingAverage')}
                      stroke="#6366F1"
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
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
