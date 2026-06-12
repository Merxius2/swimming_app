/**
 * Modal for managing itemized Insurance / Subscriptions expenses
 */

import { Plus, Trash2, X } from 'lucide-react';
import { sanitizeNonNegativeInput } from '../lib/amountInput';
import { calculateLineItemsTotal } from '../lib/expenseLineItems';

export default function ExpenseLineItemsModal({
  category,
  items,
  onAdd,
  onUpdate,
  onRemove,
  onClose,
  getSymbol,
  t,
}) {
  const total = calculateLineItemsTotal(items);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="card w-full sm:max-w-lg max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t(`dashboard.expenseCategories.${category}`)}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={t('dashboard.expenseLineItems.close')}
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-2 items-end">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {t('dashboard.expenseLineItems.itemName')}
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
                  placeholder={t('dashboard.expenseLineItems.placeholder.name')}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                />
              </div>
              <div className="w-28 sm:w-32 shrink-0">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {t('dashboard.expenseLineItems.itemAmount')} ({getSymbol()})
                </label>
                <input
                  type="number"
                  min="0"
                  value={item.amount}
                  onChange={(e) => onUpdate(item.id, 'amount', sanitizeNonNegativeInput(e.target.value))}
                  placeholder="0"
                  className="amount w-full"
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="p-2 mb-0.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
                title={t('dashboard.expenseLineItems.removeItem')}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
              {t('dashboard.expenseLineItems.empty')}
            </p>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {t('dashboard.expenseLineItems.total')}
            </span>
            <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
              {getSymbol()}{Math.floor(total).toLocaleString('en-US')}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onAdd}
              className="flex items-center justify-center gap-2 rounded-lg border border-brand-primary/30 bg-white px-4 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/5 dark:border-brand-primary/50 dark:bg-[rgba(20,20,23,0.75)] dark:text-brand-primary dark:hover:bg-brand-primary/15 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors"
            >
              <Plus size={16} />
              {t('dashboard.expenseLineItems.addItem')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors"
            >
              {t('dashboard.expenseLineItems.done')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
