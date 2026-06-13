import { X, Award, Sparkles, Palette } from 'lucide-react';
import { THEMES } from '../lib/appConstants';
import { useSecretSettings } from '../context/FeatureContext';
import { useSwim } from '../context/SwimContext';
import { evaluateAllMedals, getMedalStats } from '../lib/swimMedals';

export default function SecretSettingsModal() {
  const { isSecretSettingsOpen, closeSecretSettings } = useSecretSettings();
  const { sessions, cheats, setAllMedalsUnlocked, setPreviewMonthlyMedals, setAllThemesUnlocked } = useSwim();

  if (!isSecretSettingsOpen) return null;

  const medalStats = getMedalStats(evaluateAllMedals(sessions));
  const allUnlocked = Boolean(cheats?.allMedalsUnlocked);
  const previewMonthly = Boolean(cheats?.previewMonthlyMedals);
  const allThemesUnlocked = Boolean(cheats?.allThemesUnlocked);
  const paidThemeCount = THEMES.filter((t) => t.code !== 'liquid-os').length;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="card bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-purple-400 p-6 md:p-8 max-w-md w-full mx-auto rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-purple-200 flex items-center gap-2">
            <Sparkles size={24} />
            Secret Settings
          </h2>
          <button
            type="button"
            onClick={closeSecretSettings}
            className="text-purple-300 hover:text-purple-100 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-purple-800/50 border border-purple-400/60 rounded-lg p-4">
            <p className="text-purple-100 text-sm font-semibold mb-1">Easter egg unlocked</p>
            <p className="text-purple-200/80 text-xs leading-relaxed">
              Tap the app icon 3× in the sidebar or at the top of Settings on mobile.
            </p>
          </div>

          <div className="bg-indigo-800/50 border border-indigo-400/60 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-indigo-100 text-sm font-semibold mb-1 flex items-center gap-1.5">
                  <Award size={16} />
                  Unlock all medals
                </p>
                <p className="text-indigo-200/80 text-xs leading-relaxed">
                  Show every medal as earned on the Medals page ({medalStats.total} total).
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={allUnlocked}
                onClick={() => setAllMedalsUnlocked(!allUnlocked)}
                className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
                  allUnlocked ? 'bg-green-500' : 'bg-purple-950/80 border border-purple-500/50'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    allUnlocked ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
            {allUnlocked && (
              <p className="text-green-300 text-xs mt-3 font-medium">
                Cheat active — all medals are unlocked for display.
              </p>
            )}
          </div>

          <div className="bg-indigo-800/50 border border-indigo-400/60 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-indigo-100 text-sm font-semibold mb-1 flex items-center gap-1.5">
                  <Palette size={16} />
                  Unlock all themes
                </p>
                <p className="text-indigo-200/80 text-xs leading-relaxed">
                  Make every store theme selectable in Settings ({paidThemeCount} themes).
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={allThemesUnlocked}
                onClick={() => setAllThemesUnlocked(!allThemesUnlocked)}
                className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
                  allThemesUnlocked ? 'bg-green-500' : 'bg-purple-950/80 border border-purple-500/50'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    allThemesUnlocked ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
            {allThemesUnlocked && (
              <p className="text-green-300 text-xs mt-3 font-medium">
                Cheat active — all themes are unlocked for selection.
              </p>
            )}
          </div>

          <div className="bg-indigo-800/50 border border-indigo-400/60 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-indigo-100 text-sm font-semibold mb-1 flex items-center gap-1.5">
                  <Award size={16} />
                  Preview monthly medals
                </p>
                <p className="text-indigo-200/80 text-xs leading-relaxed">
                  Add sample bronze, silver &amp; gold months on the Medals page (last 3 months).
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={previewMonthly}
                onClick={() => setPreviewMonthlyMedals(!previewMonthly)}
                className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
                  previewMonthly ? 'bg-green-500' : 'bg-purple-950/80 border border-purple-500/50'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    previewMonthly ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
            {previewMonthly && (
              <p className="text-green-300 text-xs mt-3 font-medium">
                Cheat active — preview monthly medals shown on Medals page.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={closeSecretSettings}
          className="w-full mt-6 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}
