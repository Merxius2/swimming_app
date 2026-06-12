/**
 * PersonSection Component
 * Renders income, savings, and expenses section for one person in separate mode
 */

import { PiggyBank } from 'lucide-react';
import { PERSONAL_EXPENSE_CATEGORIES } from '../lib/constants';
import { sanitizeNonNegativeInput, parseNonNegativeAmount } from '../lib/amountInput';
import { syncExpenseCategoryFromLineItems } from '../lib/expenseLineItems';
import IncomeSourceList from './IncomeSourceList';
import ExpenseCategoryGrid from './ExpenseCategoryGrid';
import SavingsPotsList from './SavingsPotsList';
import { ThemedInlineIcon } from './ThemedIcon';

export default function PersonSection({
  personLabel,
  incomes,
  setIncomes,
  savings,
  setSavings,
  expenses,
  setExpenses,
  getSymbol,
  t,
  contribution = 0,
  showContribution = false,
  potsMonthlyTotal = 0,
  savingsPots = [],
  addSavingsPot,
  updateSavingsPot,
  removeSavingsPot,
  includeSavingsInCalculations = true,
  setIncludeSavingsInCalculations,
  showIncludeSavingsToggle = false,
  expenseLineItems = {},
  manageableExpenseCategories = [],
  onAddExpenseLineItem,
  onUpdateExpenseLineItem,
  onRemoveExpenseLineItem,
}) {
  const addIncome = () => {
    setIncomes([...incomes, { id: Date.now().toString(), label: `${personLabel} Income ${incomes.length + 1}`, amount: '' }]);
  };

  const updateIncome = (id, field, value) => {
    setIncomes(incomes.map((income) => (income.id === id ? { ...income, [field]: value } : income)));
  };

  const removeIncome = (id) => {
    setIncomes(incomes.filter((income) => income.id !== id));
  };

  const totalIncome = incomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
  const totalExpenses = Object.values(expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const savingsNum = parseNonNegativeAmount(savings);
  const totalSavings = savingsNum + potsMonthlyTotal;
  const savingsInCalc = includeSavingsInCalculations ? totalSavings : 0;
  const balance = totalIncome - savingsInCalc - totalExpenses;

  return (
    <div className="space-y-6">
      <IncomeSourceList
        incomes={incomes}
        onAdd={addIncome}
        onUpdate={updateIncome}
        onRemove={removeIncome}
        getSymbol={getSymbol}
        t={t}
        headerKey="dashboard.income"
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
        {showIncludeSavingsToggle && setIncludeSavingsInCalculations && (
          <label className="flex items-center gap-2 mt-4 text-sm text-gray-700 dark:text-gray-100">
            <input
              type="checkbox"
              checked={includeSavingsInCalculations}
              onChange={(e) => setIncludeSavingsInCalculations(e.target.checked)}
              className="rounded border-gray-300"
            />
            {t('dashboard.includeSavingsInCalc')}
          </label>
        )}
        {includeSavingsInCalculations && potsMonthlyTotal > 0 && (
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {t('dashboard.savingsPots.inCalcTotal')}: +{getSymbol()}{Math.floor(potsMonthlyTotal).toLocaleString('en-US')}
          </p>
        )}
        {addSavingsPot && (
          <SavingsPotsList
            pots={savingsPots}
            onAdd={addSavingsPot}
            onUpdate={updateSavingsPot}
            onRemove={removeSavingsPot}
            getSymbol={getSymbol}
            t={t}
            embedded
          />
        )}
      </div>

      <div className="card-expenses p-8">
        <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.expenses')}</h3>
        <ExpenseCategoryGrid
          categories={PERSONAL_EXPENSE_CATEGORIES}
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
          gridClass="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2"
        />
      </div>

      <div className="card p-6 border-l-4 border-brand-primary">
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{t('dashboard.summary')}</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">{t('dashboard.totalIncome')}</span>
            <span className="font-mono font-bold text-brand-primary">{getSymbol()}{Math.floor(totalIncome).toLocaleString('en-US')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">{t('dashboard.totalExpenses')}</span>
            <span className="font-mono font-bold text-red-600 dark:text-red-400">-{getSymbol()}{Math.floor(totalExpenses).toLocaleString('en-US')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">{t('dashboard.savingsAmount')}</span>
            <span className="font-mono font-bold text-gray-900 dark:text-gray-100">-{getSymbol()}{Math.floor(totalSavings).toLocaleString('en-US')}</span>
          </div>
          {potsMonthlyTotal > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pl-2">
              <span>{t('dashboard.savingsPots.inCalcBreakdown')}</span>
              <span className="font-mono">-{getSymbol()}{Math.floor(potsMonthlyTotal).toLocaleString('en-US')}</span>
            </div>
          )}
          <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 flex justify-between items-center text-sm font-medium">
            <span className="text-gray-700 dark:text-gray-300">{t('dashboard.balance')}</span>
            <span className={`font-mono ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{getSymbol()}{Math.floor(balance).toLocaleString('en-US')}</span>
          </div>
          {showContribution && (
            <>
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{t('dashboard.contribution')}</span>
                <span className="font-mono font-bold text-gray-900 dark:text-gray-100">-{getSymbol()}{Math.floor(contribution).toLocaleString('en-US')}</span>
              </div>
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-gray-100">{t('dashboard.personalBalance')}</span>
                <span className={`font-mono text-lg font-bold ${(balance - contribution) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {getSymbol()}{Math.floor(balance - contribution).toLocaleString('en-US')}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
