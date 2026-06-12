/**
 * Reusable two-option mode toggle (shared/separate, manual/dynamic, etc.)
 */

export default function ModeToggle({ label, options, value, onChange }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {label}
        </label>
      )}
      <div className="flex gap-4">
        {options.map(({ id, label: optionLabel }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
              value === id
                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-soft'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}
