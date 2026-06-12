import { Plus, Trash2, X } from 'lucide-react';
import { sumAssetField } from '../../lib/benchmarkCalculator';

export default function AssetsModal({ assets, onUpdate, onAdd, onRemove, onSave, onClose, getSymbol }) {
  const totalAssets = sumAssetField(assets, 'amount');
  const totalDebt = sumAssetField(assets, 'debt');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Breakdown of Assets</h2>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {assets.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-sm">No assets added yet</p>
          ) : (
            assets.map((asset) => (
              <div key={asset.id} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <input
                  type="text"
                  placeholder="Asset name (e.g., House, Savings)"
                  value={asset.name}
                  onChange={(e) => onUpdate(asset.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Worth</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={asset.amount}
                      onChange={(e) => onUpdate(asset.id, 'amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Debt</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={asset.debt}
                      onChange={(e) => onUpdate(asset.id, 'debt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Net Value:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getSymbol()}{((parseFloat(asset.amount) || 0) - (parseFloat(asset.debt) || 0)).toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(asset.id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            ))
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total Assets</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {getSymbol()}{totalAssets.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">Total Debt</span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {getSymbol()}{totalDebt.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
              <span className="font-semibold text-gray-900 dark:text-white">Net Worth</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {getSymbol()}{(totalAssets - totalDebt).toLocaleString('nl-NL', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            type="button"
            onClick={onAdd}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Plus size={18} />
            Add Asset
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
