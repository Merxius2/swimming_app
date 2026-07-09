import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import PageHeader from '../components/PageHeader';
import BenchmarkBadgeRanking from '../components/benchmark/BenchmarkBadgeRanking';
import { useLanguage } from '../context/UserPreferencesContext';
import { useSwim } from '../context/SwimContext';
import { useChartTheme } from '../hooks/useChartTheme';
import {
  getBenchmarkForProfile,
  getSwimLevel,
  computePacePercentile,
  paceVsMedian,
  getAgeGroup,
} from '../lib/swimBenchmarks';
import { getStatsSessions } from '../lib/swimAnalysis';
import { formatPace } from '../lib/swimFormatters';

const BAR_COLORS = {
  advanced: '#10B981',
  intermediate: '#3B82F6',
  median: '#8B5CF6',
  beginner: '#F59E0B',
  you: '#EF4444',
};

export default function BenchmarkPage() {
  const { t } = useLanguage();
  const { sessions, profile, isLoading } = useSwim();
  const { tooltipStyle, tooltipLabelStyle, gridStyle, axisStyle } = useChartTheme();
  const [activeBar, setActiveBar] = useState(null);

  const statsSessions = getStatsSessions(sessions);
  const latest = statsSessions.length ? statsSessions[statsSessions.length - 1] : null;
  const pace = latest?.metrics?.paceSecPer100m;
  const hasProfile = profile?.sex && profile?.age;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0 flex items-center justify-center">
        <p className="text-ink-soft">{t('common.loading')}</p>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0">
        <PageHeader icon={TrendingUp} titleKey="benchmark.title" />
        <div className="max-w-2xl mx-auto px-4 py-8 md:px-8">
          <div className="card p-8 text-center">
            <p className="text-ink-soft mb-4">{t('benchmark.profileRequired')}</p>
            <Link href="/settings">
              <button type="button" className="px-6 py-3 rounded-full bg-brand text-white font-semibold">
                {t('benchmark.goSettings')}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const benchmark = getBenchmarkForProfile(profile.sex, profile.age);
  const level = getSwimLevel(pace, benchmark);
  const percentile = computePacePercentile(pace, benchmark);
  const vsMedian = paceVsMedian(pace, benchmark);
  const ageGroup = getAgeGroup(profile.age);

  const chartData = [
    { name: t('benchmark.levels.advanced'), value: benchmark.advanced, key: 'advanced' },
    { name: t('benchmark.levels.intermediate'), value: benchmark.intermediate, key: 'intermediate' },
    { name: t('benchmark.median'), value: benchmark.median, key: 'median' },
    { name: t('benchmark.levels.beginner'), value: benchmark.beginner, key: 'beginner' },
    ...(pace != null ? [{ name: t('benchmark.yourPace'), value: pace, key: 'you' }] : []),
  ];

  const handleBarInteraction = (entry) => {
    if (!entry?.key) return;
    setActiveBar((current) => (current === entry.key ? null : entry.key));
  };

  return (
    <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0">
      <PageHeader icon={TrendingUp} titleKey="benchmark.title" />

      <div className="max-w-4xl mx-auto space-y-6 px-4 py-8 md:px-8">
        <p className="text-sm text-ink-soft">{t('benchmark.subtitle')}</p>

        {pace == null ? (
          <div className="card p-8 text-center text-ink-soft">
            Upload a session to compare your pace.
          </div>
        ) : (
          <>
            <BenchmarkBadgeRanking
              label={`${t('benchmark.yourPace')} (${ageGroup})`}
              percentile={percentile}
              vsMedian={vsMedian}
              t={t}
            />

            <div className="card p-6">
              <p className="text-sm text-ink-soft mb-1">{t('benchmark.level')}</p>
              <p className="text-2xl font-bold capitalize">{t(`benchmark.levels.${level}`)}</p>
              <p className="text-lg text-teal-600 mt-2">{formatPace(pace)}</p>
            </div>

            <div className="card p-6">
              <h3 className="font-bold mb-4">{t('benchmark.chartTitle')}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 20, right: 48 }}
                  onMouseLeave={() => setActiveBar(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStyle.stroke} />
                  <XAxis type="number" stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={100} stroke={axisStyle.stroke} tick={{ fill: axisStyle.fill, fontSize: 11 }} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    formatter={(v) => formatPace(v)}
                    cursor={{ fill: 'rgba(59, 91, 255, 0.08)' }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                    isAnimationActive={false}
                    onClick={(_, index) => handleBarInteraction(chartData[index])}
                    onMouseEnter={(_, index) => handleBarInteraction(chartData[index])}
                    cursor="pointer"
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={BAR_COLORS[entry.key] || '#3B82F6'}
                        opacity={activeBar == null || activeBar === entry.key ? 1 : 0.35}
                        stroke={activeBar === entry.key ? '#0F172A' : 'none'}
                        strokeWidth={activeBar === entry.key ? 1.5 : 0}
                      />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="right"
                      formatter={(v) => formatPace(v)}
                      style={{ fill: axisStyle.fill, fontSize: 11, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                {chartData.map((entry) => (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => handleBarInteraction(entry)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-opacity ${
                      activeBar == null || activeBar === entry.key ? 'opacity-100' : 'opacity-45'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: BAR_COLORS[entry.key] || '#3B82F6' }}
                    />
                    <span className="text-ink-soft">{entry.name}</span>
                    <span className="text-ink font-semibold">{formatPace(entry.value)}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <p className="text-xs text-ink-faint leading-relaxed px-1">{t('benchmark.methodology')}</p>
      </div>
    </div>
  );
}
