export default function BenchmarkBadgeRanking({ label, percentile, vsMedian, t }) {
  const isAbove = vsMedian === 'above';
  const badgeText = isAbove ? t('benchmark.badges.aboveMedian') : t('benchmark.badges.belowMedian');

  return (
    <div className="card p-6 mb-4">
      <p className="text-sm font-medium text-ink-soft mb-2">{label}</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-ink">{percentile}%</p>
          <p className={`text-sm ${isAbove ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {badgeText}
          </p>
        </div>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white ${
          isAbove ? 'bg-green-500' : 'bg-amber-500'
        }`}>
          {percentile}%
        </div>
      </div>
    </div>
  );
}
