/**
 * SharedModeSection Component
 * Main content for shared (household) mode dashboard
 */

import { PiggyBank } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../lib/constants';
import { sanitizeNonNegativeInput } from '../lib/amountInput';
import DonutChart from './DonutChart';
import IncomeSourceList from './IncomeSourceList';
import ExpenseCategoryGrid from './ExpenseCategoryGrid';
import { syncExpenseCategoryFromLineItems } from '../lib/expenseLineItems';
import SavingsPotsList from './SavingsPotsList';
import { ThemedInlineIcon } from './ThemedIcon';

export default function SharedModeSection({
  incomes,
  addIncome,
  updateIncome,
  removeIncome,
  savings,
  setSavings,
  includeSavingsInCalculations,
  setIncludeSavingsInCalculations,
  expenses,
  setExpenses,
  getSymbol,
  t,
  pieData,
  leftover,
  totalExpenses,
  totalIncome,
  potsMonthlyTotal = 0,
  savingsPots,
  addSavingsPot,
  updateSavingsPot,
  removeSavingsPot,
  expenseLineItems,
  manageableExpenseCategories,
  onAddExpenseLineItem,
  onUpdateExpenseLineItem,
  onRemoveExpenseLineItem,
}) {
  const totalPieValue = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 py-8 md:px-8">
      <IncomeSourceList
        incomes={incomes}
        onAdd={addIncome}
        onUpdate={updateIncome}
        onRemove={removeIncome}
        getSymbol={getSymbol}
        t={t}
      />

      <div className="card-savings p-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-100 mb-3">
          <ThemedInlineIcon icon={PiggyBank} />
          {t('dashboard.savingsAmount')}
        </label>
        <input
          type="number"
          min="0"
          value={savings}
          onChange={(e) => setSavings(sanitizeNonNegativeInput(e.target.value))}
          placeholder={t('dashboard.placeholder.amount')}
          className="mt-3 amount-large w-full border-0 bg-transparent text-gray-900 focus:ring-0"
        />
        <label className="flex items-center gap-2 mt-4 text-sm text-gray-700 dark:text-gray-100">
          <input
            type="checkbox"
            checked={includeSavingsInCalculations}
            onChange={(e) => setIncludeSavingsInCalculations(e.target.checked)}
            className="rounded border-gray-300"
          />
          {t('dashboard.includeSavingsInCalc')}
        </label>
        {includeSavingsInCalculations && potsMonthlyTotal > 0 && (
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {t('dashboard.savingsPots.inCalcTotal')}: +{getSymbol()}{Math.floor(potsMonthlyTotal).toLocaleString('en-US')}
          </p>
        )}
        <SavingsPotsList
          pots={savingsPots}
          onAdd={addSavingsPot}
          onUpdate={updateSavingsPot}
          onRemove={removeSavingsPot}
          getSymbol={getSymbol}
          t={t}
          embedded
        />
      </div>

      <div className="card-expenses p-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('dashboard.expenses')}</h2>
        <ExpenseCategoryGrid
          categories={EXPENSE_CATEGORIES}
          expenses={expenses}
          onChange={(category, value) => setExpenses({ ...expenses, [category]: value })}
          manageableCategories={manageableExpenseCategories}
          lineItems={expenseLineItems}
          onLineItemsChange={(category, items) => {
            setExpenses(syncExpenseCategoryFromLineItems(expenses, category, items));
          }}
          onAddLineItem={onAddExpenseLineItem}
          onUpdateLineItem={onUpdateExpenseLineItem}
          onRemoveLineItem={onRemoveExpenseLineItem}
          getSymbol={getSymbol}
          t={t}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('dashboard.totalIncome')}</p>
          <p className="font-mono text-3xl font-bold text-brand-primary">{getSymbol()}{Math.floor(totalIncome).toLocaleString('en-US')}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('dashboard.totalExpenses')}</p>
          <p className="font-mono text-3xl font-bold text-red-600 dark:text-red-400">-{getSymbol()}{Math.floor(totalExpenses).toLocaleString('en-US')}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('dashboard.remaining')}</p>
          <p className={`font-mono text-3xl font-bold ${leftover >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {getSymbol()}{Math.floor(leftover).toLocaleString('en-US')}
          </p>
        </div>
      </div>

      {totalPieValue > 0 && (
        <div className="card p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('dashboard.expenseBreakdown')}</h2>
          <DonutChart
            data={pieData}
            totalAmount={totalPieValue}
            getSymbol={getSymbol}
            height={300}
            title="BREAKDOWN"
          />
        </div>
      )}
    </div>
  );
}
