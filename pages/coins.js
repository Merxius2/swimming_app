import { Coins } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SwimCoinStore from '../components/swim/SwimCoinStore';
import { useLanguage } from '../context/UserPreferencesContext';

export default function CoinsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pb-32 lg:ml-64 md:pb-8">
      <PageHeader icon={Coins} titleKey="coins.store.title" eyebrow="Swim · Store" />
      <div className="px-4 md:px-8 max-w-7xl mx-auto pb-8">
        <p className="text-sm text-ink-soft mb-8 max-w-md mx-auto text-center">
          {t('coins.store.subtitle')}
        </p>
        <SwimCoinStore embedded />
      </div>
    </div>
  );
}
