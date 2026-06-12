/**
 * Shared tax year selector and brackets display (used in tax page and settings)
 */

import { useTax } from '../context/TaxContext';
import { useLanguage } from '../context/UserPreferencesContext';

export function TaxYearSelector({ variant = 'select' }) {
  const { selectedYear, changeYear, isEstimatedYear } = useTax();
  const { t } = useLanguage();

  if (variant === 'buttons') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('tax.year')}
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {['2024', '2025', '2026'].map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => changeYear(year)}
              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                selectedYear === year
                  ? 'bg-brand-primary text-white shadow-lg'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100'
              }`}
            >
              {year}
              {year === '2026' && (
                <span className="block text-xs font-normal mt-1 opacity-75">{t('tax.estimated')}</span>
              )}
            </button>
          ))}
        </div>
        {isEstimatedYear() && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ {t('tax.brackets2026Warning')}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="taxYear" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t('tax.year')}
      </label>
      <select
        id="taxYear"
        value={selectedYear}
        onChange={(e) => changeYear(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <option value="2024">2024</option>
        <option value="2025">2025</option>
        <option value="2026">2026 ({t('tax.estimated')})</option>
      </select>
      {isEstimatedYear() && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ {t('tax.brackets2026Warning')}
          </p>
        </div>
      )}
    </div>
  );
}

export function TaxBracketsTable() {
  const { selectedYear, TAX_BRACKETS } = useTax();

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Tax Brackets for {selectedYear}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Income Range</th>
              <th className="text-right px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Tax Rate</th>
            </tr>
          </thead>
          <tbody>
            {TAX_BRACKETS[selectedYear]?.map((bracket, idx) => (
              <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                  €{bracket.min.toLocaleString('en-US')} - {bracket.max === Infinity ? '∞' : `€${bracket.max.toLocaleString('en-US')}`}
                </td>
                <td className="text-right px-4 py-2 text-gray-900 dark:text-gray-100">{bracket.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        Note: To modify tax brackets, please contact support. Current brackets are based on official Belastingdienst rates.
      </p>
    </div>
  );
}
