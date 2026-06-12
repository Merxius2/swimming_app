import { Receipt } from 'lucide-react';
import { TaxYearSelector, TaxBracketsTable } from '../TaxYearSettings';
import ThemedIcon from '../ThemedIcon';

export default function TaxSettingsPanel() {
  return (
    <div className="card p-8">
      <div className="flex items-center gap-3 mb-6">
        <ThemedIcon icon={Receipt} variant="section" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tax Calculator Settings</h2>
      </div>
      <div className="space-y-6">
        <TaxYearSelector variant="buttons" />
        <TaxBracketsTable />
      </div>
    </div>
  );
}
