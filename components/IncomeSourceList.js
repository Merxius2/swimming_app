/**
 * Reusable income source list with add/update/remove
 */

import { Plus, Trash2 } from 'lucide-react';

export default function IncomeSourceList({
  incomes,
  onAdd,
  onUpdate,
  onRemove,
  getSymbol,
  t,
  headerKey = 'dashboard.incomeHeader',
}) {
  return (
    <div className="card-income p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t(headerKey)}</h2>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 rounded-lg bg-brand-primary text-white px-4 py-2 font-medium hover:bg-brand-primary/90 transition-colors w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus size={18} />
          {t('dashboard.addIncomeBtn')}
        </button>
      </div>

      <div className="space-y-4">
        {incomes.map((income) => (
          <div key={income.id} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                {t('dashboard.sourceLabel')}
              </label>
              <input
                type="text"
                value={income.label}
                onChange={(e) => onUpdate(income.id, 'label', e.target.value)}
                placeholder={t('dashboard.placeholder.salaryFreelance')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                {t('dashboard.amount')} ({getSymbol()})
              </label>
              <input
                type="number"
                value={income.amount}
                onChange={(e) => onUpdate(income.id, 'amount', e.target.value)}
                placeholder={t('dashboard.placeholder.amount')}
                className="amount w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(income.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={t('dashboard.removeIncome')}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {incomes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">{t('dashboard.noIncomeSources')}</p>
        </div>
      )}
    </div>
  );
}
