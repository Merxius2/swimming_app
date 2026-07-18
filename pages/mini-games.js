import { Gamepad2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import WheelOfFortune from '../components/swim/WheelOfFortune';
import CoinFlipGame from '../components/swim/CoinFlipGame';
import PacePickGame from '../components/swim/PacePickGame';
import LaneTimerGame from '../components/swim/LaneTimerGame';
import { useLanguage } from '../context/UserPreferencesContext';

export default function MiniGamesPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pb-32 lg:ml-64 md:pb-8">
      <PageHeader icon={Gamepad2} titleKey="miniGames.title" eyebrow="Swim · Games" />
      <div className="px-4 md:px-8 max-w-7xl mx-auto pb-8 space-y-8">
        <p className="text-sm text-ink-soft max-w-md mx-auto text-center -mt-2">
          {t('miniGames.subtitle')}
        </p>
        <WheelOfFortune />
        <div className="grid gap-6 lg:grid-cols-2">
          <PacePickGame />
          <CoinFlipGame />
        </div>
        <LaneTimerGame />
      </div>
    </div>
  );
}
