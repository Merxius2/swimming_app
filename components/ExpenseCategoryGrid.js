/**
 * Reusable expense category input grid
 */

import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { CATEGORY_ICONS } from '../lib/constants';
import { calculateLineItemsTotal } from '../lib/expenseLineItems';
import ExpenseLineItemsModal from './ExpenseLineItemsModal';
import { ThemedInlineIcon } from './ThemedIcon';

export default function ExpenseCategoryGrid({
  categories,
  expenses,
  onChange,
  t,
  gridClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
  manageableCategories = [],
  lineItems = {},
  onLineItemsChange,
  getSymbol,
  onAddLineItem,
  onUpdateLineItem,
  onRemoveLineItem,
}) {
  const [openCategory, setOpenCategory] = useState(null);

  const isManageable = (category) => manageableCategories.includes(category);

  const getDisplayTotal = (category) => {
    const items = lineItems[category];
    if (items?.length) {
      return calculateLineItemsTotal(items);
    }
    return parseFloat(expenses[category]) || 0;
  };

  const handleCloseModal = () => {
    if (openCategory && onLineItemsChange) {
      onLineItemsChange(openCategory, lineItems[openCategory] || []);
    }
    setOpenCategory(null);
  };

  return (
    <>
      <div className={gridClass}>
        {categories.map((category) => {
          const IconComponent = CATEGORY_ICONS[category];
          const managed = isManageable(category);

          return (
            <div key={category} className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-100">
                <ThemedInlineIcon icon={IconComponent} />
                {t(`dashboard.expenseCategories.${category}`)}
              </label>
              {managed ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      getDisplayTotal(category) > 0
                        ? Math.floor(getDisplayTotal(category)).toLocaleString('en-US')
                        : ''
                    }
                    placeholder="0"
                    className="amount w-full bg-gray-50 dark:bg-[rgba(20,20,23,0.55)] dark:border-white/10 cursor-default"
                    tabIndex={-1}
                  />
                  <button
                    type="button"
                    onClick={() => setOpenCategory(category)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/15 dark:bg-[rgba(20,20,23,0.75)] dark:text-gray-100 dark:hover:bg-[rgba(32,32,40,0.95)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors shrink-0"
                  >
                    <ThemedInlineIcon icon={Settings2} />
                    {t('dashboard.expenseLineItems.manage')}
                  </button>
                </div>
              ) : (
                <input
                  type="number"
                  min="0"
                  value={expenses[category] || ''}
                  onChange={(e) => onChange(category, e.target.value)}
                  placeholder="0"
                  className="amount w-full"
                />
              )}
            </div>
          );
        })}
      </div>

      {openCategory && onAddLineItem && (
        <ExpenseLineItemsModal
          category={openCategory}
          items={lineItems[openCategory] || []}
          onAdd={() => onAddLineItem(openCategory)}
          onUpdate={(id, field, value) => onUpdateLineItem(openCategory, id, field, value)}
          onRemove={(id) => onRemoveLineItem(openCategory, id)}
          onClose={handleCloseModal}
          getSymbol={getSymbol}
          t={t}
        />
      )}
    </>
  );
}
