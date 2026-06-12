/**
 * SeparateModeSection Component
 * Main content for separate (two-person) mode dashboard
 */

import { SHARED_EXPENSE_CATEGORIES } from '../lib/constants';
import { syncExpenseCategoryFromLineItems } from '../lib/expenseLineItems';
import { useIsMobile } from '../hooks/useIsMobile';
import PersonSection from './PersonSection';
import PieChartCard from './PieChartCard';
import ExpenseCategoryGrid from './ExpenseCategoryGrid';
import DonutChart from './DonutChart';

export default function SeparateModeSection({
  person1Name,
  setPerson1Name,
  person2Name,
  setPerson2Name,
  person1Incomes,
  setPerson1Incomes,
  person1Savings,
  setPerson1Savings,
  person1Expenses,
  setPerson1Expenses,
  person2Incomes,
  setPerson2Incomes,
  person2Savings,
  setPerson2Savings,
  person2Expenses,
  setPerson2Expenses,
  sharedExpenses,
  setSharedExpenses,
  includeSavingsInCalculations,
  setIncludeSavingsInCalculations,
  getSymbol,
  t,
  person1Contribution,
  person2Contribution,
  person1Ratio,
  person2Ratio,
  person1PersonalExpenses,
  person2PersonalExpenses,
  person1PotsMonthly,
  person2PotsMonthly,
  person1SavingsInCalc,
  person2SavingsInCalc,
  totalIncome,
  totalHouseholdExpenses,
  householdLeftover,
  pieData,
  person1SavingsPots,
  addPerson1SavingsPot,
  updatePerson1SavingsPot,
  removePerson1SavingsPot,
  person2SavingsPots,
  addPerson2SavingsPot,
  updatePerson2SavingsPot,
  removePerson2SavingsPot,
  person1ExpenseLineItems,
  person1ManageableExpenseCategories,
  onAddPerson1ExpenseLineItem,
  onUpdatePerson1ExpenseLineItem,
  onRemovePerson1ExpenseLineItem,
  person2ExpenseLineItems,
  person2ManageableExpenseCategories,
  onAddPerson2ExpenseLineItem,
  onUpdatePerson2ExpenseLineItem,
  onRemovePerson2ExpenseLineItem,
  sharedExpenseLineItems,
  sharedManageableExpenseCategories,
  onAddSharedExpenseLineItem,
  onUpdateSharedExpenseLineItem,
  onRemoveSharedExpenseLineItem,
}) {
  const isMobile = useIsMobile();
  const totalPieValue = pieData.reduce((sum, item) => sum + item.value, 0);

  const person1Income = person1Incomes.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
  const person2Income = person2Incomes.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 py-8 md:px-8">
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {/* Person 1 Section */}
        <div>
          <input
            type="text"
            value={person1Name}
            onChange={(e) => setPerson1Name(e.target.value)}
            className="w-full text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-brand-primary focus:outline-none px-0 py-2 transition-colors"
          />
          <PersonSection
            personLabel={person1Name}
            incomes={person1Incomes}
            setIncomes={setPerson1Incomes}
            savings={person1Savings}
            setSavings={setPerson1Savings}
            expenses={person1Expenses}
            setExpenses={setPerson1Expenses}
            getSymbol={getSymbol}
            t={t}
            contribution={person1Contribution}
            showContribution={true}
            potsMonthlyTotal={person1PotsMonthly}
            savingsPots={person1SavingsPots}
            addSavingsPot={addPerson1SavingsPot}
            updateSavingsPot={updatePerson1SavingsPot}
            removeSavingsPot={removePerson1SavingsPot}
            includeSavingsInCalculations={includeSavingsInCalculations}
            setIncludeSavingsInCalculations={setIncludeSavingsInCalculations}
            showIncludeSavingsToggle={true}
            expenseLineItems={person1ExpenseLineItems}
            manageableExpenseCategories={person1ManageableExpenseCategories}
            onAddExpenseLineItem={onAddPerson1ExpenseLineItem}
            onUpdateExpenseLineItem={onUpdatePerson1ExpenseLineItem}
            onRemoveExpenseLineItem={onRemovePerson1ExpenseLineItem}
          />
        </div>

        {/* Person 2 Section */}
        <div>
          <input
            type="text"
            value={person2Name}
            onChange={(e) => setPerson2Name(e.target.value)}
            className="w-full text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-brand-primary focus:outline-none px-0 py-2 transition-colors"
          />
          <PersonSection
            personLabel={person2Name}
            incomes={person2Incomes}
            setIncomes={setPerson2Incomes}
            savings={person2Savings}
            setSavings={setPerson2Savings}
            expenses={person2Expenses}
            setExpenses={setPerson2Expenses}
            getSymbol={getSymbol}
            t={t}
            contribution={person2Contribution}
            showContribution={true}
            potsMonthlyTotal={person2PotsMonthly}
            savingsPots={person2SavingsPots}
            addSavingsPot={addPerson2SavingsPot}
            updateSavingsPot={updatePerson2SavingsPot}
            removeSavingsPot={removePerson2SavingsPot}
            includeSavingsInCalculations={includeSavingsInCalculations}
            setIncludeSavingsInCalculations={setIncludeSavingsInCalculations}
            showIncludeSavingsToggle={true}
            expenseLineItems={person2ExpenseLineItems}
            manageableExpenseCategories={person2ManageableExpenseCategories}
            onAddExpenseLineItem={onAddPerson2ExpenseLineItem}
            onUpdateExpenseLineItem={onUpdatePerson2ExpenseLineItem}
            onRemoveExpenseLineItem={onRemovePerson2ExpenseLineItem}
          />
        </div>
      </div>

      {/* Shared Account Section */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('dashboard.sharedAccount')}</h2>

        {/* Shared Expenses */}
        <div className="card-expenses p-8 mb-6">
          <h3 className="mb-6 text-xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.sharedExpensesBreakdown')}</h3>
          <ExpenseCategoryGrid
            categories={SHARED_EXPENSE_CATEGORIES}
            expenses={sharedExpenses}
            onChange={(category, value) => setSharedExpenses({ ...sharedExpenses, [category]: value })}
            manageableCategories={sharedManageableExpenseCategories}
            lineItems={sharedExpenseLineItems}
            onLineItemsChange={(category, items) => {
              setSharedExpenses(syncExpenseCategoryFromLineItems(sharedExpenses, category, items));
            }}
            onAddLineItem={onAddSharedExpenseLineItem}
            onUpdateLineItem={onUpdateSharedExpenseLineItem}
            onRemoveLineItem={onRemoveSharedExpenseLineItem}
            getSymbol={getSymbol}
            t={t}
          />
        </div>

        {/* Contributions Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="card p-3 sm:p-4 md:p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('dashboard.incomeRatio')}</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-200 font-medium">{person1Name}:</span>
                <span className="font-mono text-lg font-bold text-brand-primary">{(person1Ratio * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-200 font-medium">{person2Name}:</span>
                <span className="font-mono text-lg font-bold text-brand-primary">{(person2Ratio * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="card p-3 sm:p-4 md:p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{person1Name}: {t('dashboard.contribution')}</p>
            <p className="font-mono text-2xl font-bold text-green-600 dark:text-green-400">{getSymbol()}{Math.floor(person1Contribution).toLocaleString('en-US')}</p>
          </div>

          <div className="card p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{person2Name}: {t('dashboard.contribution')}</p>
            <p className="font-mono text-2xl font-bold text-green-600 dark:text-green-400">{getSymbol()}{Math.floor(person2Contribution).toLocaleString('en-US')}</p>
          </div>
        </div>

        {/* Pie Charts */}
        <div className={`grid gap-6 mt-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {/* Person 1 Pie Chart */}
          <PieChartCard
            title={person1Name}
            data={[
              { name: t('dashboard.totalExpenses'), value: person1PersonalExpenses },
              { name: t('dashboard.contribution'), value: person1Contribution },
              { name: t('dashboard.savingsAmount'), value: person1SavingsInCalc },
              { name: t('dashboard.remaining'), value: Math.max(person1Income - person1PersonalExpenses - person1SavingsInCalc - person1Contribution, 0) }
            ]}
            getSymbol={getSymbol}
            isMobile={isMobile}
          />

          {/* Person 2 Pie Chart */}
          <PieChartCard
            title={person2Name}
            data={[
              { name: t('dashboard.totalExpenses'), value: person2PersonalExpenses },
              { name: t('dashboard.contribution'), value: person2Contribution },
              { name: t('dashboard.savingsAmount'), value: person2SavingsInCalc },
              { name: t('dashboard.remaining'), value: Math.max(person2Income - person2PersonalExpenses - person2SavingsInCalc - person2Contribution, 0) }
            ]}
            getSymbol={getSymbol}
            isMobile={isMobile}
          />

          {/* Shared Account Pie Chart */}
          <PieChartCard
            title={t('dashboard.sharedAccount')}
            data={Object.entries(sharedExpenses).map(([category, value]) => ({
              name: t(`dashboard.expenseCategories.${category}`),
              value: parseFloat(value) || 0
            })).filter(item => item.value > 0)}
            getSymbol={getSymbol}
            isMobile={isMobile}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('dashboard.totalIncome')}</p>
          <p className="font-mono text-3xl font-bold text-brand-primary">{getSymbol()}{Math.floor(totalIncome).toLocaleString('en-US')}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('dashboard.totalExpenses')}</p>
          <p className="font-mono text-3xl font-bold text-red-600 dark:text-red-400">-{getSymbol()}{Math.floor(totalHouseholdExpenses).toLocaleString('en-US')}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('dashboard.remaining')}</p>
          <p className={`font-mono text-3xl font-bold ${householdLeftover >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {getSymbol()}{Math.floor(householdLeftover).toLocaleString('en-US')}
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
