import { Award } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import MedalCard from '../components/swim/MedalCard';
import MonthlyChallengeHistory from '../components/swim/MonthlyChallengeHistory';
import { useLanguage } from '../context/UserPreferencesContext';
import { useSwim } from '../context/SwimContext';
import { evaluateAllMedals, getMedalStats } from '../lib/swimMedals';
import Link from 'next/link';

const CATEGORIES = ['milestone', 'distance', 'weekly', 'streak', 'monthly', 'seasonal', 'special'];

export default function MedalsPage() {
  const { t } = useLanguage();
  const { sessions, isLoading, cheats } = useSwim();

  const formatPeriods = (periods) => {
    if (!periods?.length) return '';
    return periods
      .map((p) => {
        if (/^\d{4}-\d{2}$/.test(p)) {
          const [y, m] = p.split('-');
          return new Date(parseInt(y, 10), parseInt(m, 10) - 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        }
        const [season, year] = p.split('-');
        return `${t(`medals.seasons.${season}`)} ${year}`;
      })
      .join(' · ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0 flex items-center justify-center">
        <p className="text-ink-soft">{t('common.loading')}</p>
      </div>
    );
  }

  const medals = evaluateAllMedals(sessions, { allMedalsUnlocked: cheats?.allMedalsUnlocked });
  const stats = getMedalStats(medals);

  return (
    <div className="min-h-screen bg-white pb-32 lg:ml-64 md:pb-0">
      <PageHeader icon={Award} titleKey="medals.title" />

      <div className="max-w-4xl mx-auto space-y-6 px-4 py-8 md:px-8">
        <div className="card p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm text-ink-soft">{t('medals.subtitle')}</p>
              <p className="text-3xl font-bold text-ink mt-1">
                {stats.earned}
                <span className="text-lg text-ink-faint font-normal"> / {stats.total}</span>
              </p>
            </div>
            <div className="text-5xl">{stats.earned > 0 ? '🏆' : '🎯'}</div>
          </div>
        </div>

        {!sessions.length && (
          <div className="card p-8 text-center">
            <p className="text-ink-soft mb-4">{t('medals.empty')}</p>
            <Link href="/upload">
              <button
                type="button"
                className="px-6 py-3 rounded-full text-white font-semibold"
                style={{ background: 'linear-gradient(135deg,#3B5BFF 0%, #7B5BFF 100%)' }}
              >
                {t('progress.emptyCta')}
              </button>
            </Link>
          </div>
        )}

        <MonthlyChallengeHistory sessions={sessions} />

        {CATEGORIES.map((category) => {
          const categoryMedals = medals.filter((m) => m.category === category);
          if (!categoryMedals.length) return null;
          const earnedInCat = categoryMedals.filter((m) => m.earned).length;

          return (
            <section key={category}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-soft">
                  {t(`medals.categories.${category}`)}
                </h2>
                <span className="text-xs text-ink-faint">
                  {earnedInCat}/{categoryMedals.length}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {categoryMedals.map((medal) => (
                  <MedalCard
                    key={medal.id}
                    medal={medal}
                    periodLabel={formatPeriods}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
