import { DollarSign } from 'lucide-react';
import { useCurrency, useLanguage } from '../../context/UserPreferencesContext';
import { CURRENCY_OPTIONS } from '../../lib/appConstants';
import ThemedIcon from '../ThemedIcon';

export default function CurrencySettings() {
  const { t } = useLanguage();
  const { currency, changeCurrency } = useCurrency();

  return (
    <div className="card p-8">
      <div className="flex items-center gap-3 mb-6">
        <ThemedIcon icon={DollarSign} variant="section" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings.currency')}</h2>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{t('settings.currencyDesc')}</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {CURRENCY_OPTIONS.map((curr) => (
          <button
            key={curr.code}
            type="button"
            onClick={() => changeCurrency(curr.code)}
            className={`flex flex-col items-center gap-3 rounded-lg p-6 transition-all ${
              currency === curr.code
                ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-lg'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-4xl font-bold">{curr.symbol}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
