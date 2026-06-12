/**
 * Savings goal pots (spaarpotjes) — track progress toward named savings targets
 */

import { Plus, Target, Trash2 } from 'lucide-react';
import { sanitizeNonNegativeInput, parseNonNegativeAmount } from '../lib/amountInput';
import { ThemedInlineIcon } from './ThemedIcon';

function getPotMetrics(pot) {
  const goal = parseNonNegativeAmount(pot.goalAmount);
  const current = parseNonNegativeAmount(pot.currentAmount);
  const monthly = parseNonNegativeAmount(pot.monthlyContribution);
  const remaining = Math.max(0, goal - current);
  const progress = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  const goalReached = goal > 0 && current >= goal;
  const monthsToGoal = !goalReached && monthly > 0 ? Math.ceil(remaining / monthly) : null;

  return { goal, current, monthly, remaining, progress, goalReached, monthsToGoal };
}

export default function SavingsPotsList({
  pots,
  onAdd,
  onUpdate,
  onRemove,
  getSymbol,
  t,
  embedded = false,
}) {
  return (
    <div className={embedded ? 'mt-6 pt-6 border-t border-brand-primary/20' : ''}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-100">
          <ThemedInlineIcon icon={Target} />
          {t('dashboard.savingsPots.title')}
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 rounded-lg bg-brand-primary text-white px-3 py-2 text-sm font-medium hover:bg-brand-primary/90 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          {t('dashboard.savingsPots.addBtn')}
        </button>
      </div>

      <div className="space-y-4">
        {pots.map((pot) => {
          const { goal, current, progress, goalReached, monthsToGoal } = getPotMetrics(pot);

          return (
            <div key={pot.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 p-4">
              <div className="flex gap-3 items-start mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    {t('dashboard.savingsPots.name')}
                  </label>
                  <input
                    type="text"
                    value={pot.name}
                    onChange={(e) => onUpdate(pot.id, 'name', e.target.value)}
                    placeholder={t('dashboard.savingsPots.placeholder.name')}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(pot.id)}
                  className="mt-5 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title={t('dashboard.savingsPots.remove')}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    {t('dashboard.savingsPots.goalAmount')} ({getSymbol()})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pot.goalAmount}
                    onChange={(e) => onUpdate(pot.id, 'goalAmount', sanitizeNonNegativeInput(e.target.value))}
                    placeholder={t('dashboard.placeholder.amount')}
                    className="amount w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    {t('dashboard.savingsPots.currentAmount')} ({getSymbol()})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pot.currentAmount}
                    onChange={(e) => onUpdate(pot.id, 'currentAmount', sanitizeNonNegativeInput(e.target.value))}
                    placeholder={t('dashboard.placeholder.amount')}
                    className="amount w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    {t('dashboard.savingsPots.monthlyContribution')} ({getSymbol()})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pot.monthlyContribution}
                    onChange={(e) => onUpdate(pot.id, 'monthlyContribution', sanitizeNonNegativeInput(e.target.value))}
                    placeholder={t('dashboard.placeholder.amount')}
                    className="amount w-full"
                  />
                </div>
              </div>

              {goal > 0 && (
                <div>
                  <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-300 mb-1">
                    <span>{progress.toFixed(0)}% {t('dashboard.savingsPots.progressSuffix')}</span>
                    <span className="font-mono">
                      {getSymbol()}{Math.floor(current).toLocaleString('en-US')}
                      {' / '}
                      {getSymbol()}{Math.floor(goal).toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${goalReached ? 'bg-green-500' : 'bg-brand-primary'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                    {goalReached
                      ? t('dashboard.savingsPots.goalReached')
                      : monthsToGoal != null
                        ? `${monthsToGoal} ${t('dashboard.savingsPots.monthsToGoal')}`
                        : t('dashboard.savingsPots.setContribution')}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pots.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">{t('dashboard.savingsPots.noPots')}</p>
      )}
    </div>
  );
}
