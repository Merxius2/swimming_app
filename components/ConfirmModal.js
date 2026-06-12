/**
 * Reusable confirmation dialog
 */

export default function ConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel, confirmClassName = 'bg-red-600 hover:bg-red-700', children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99]">
      <div className="card p-8 max-w-md mx-auto">
        <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-gray-100">{title}</h3>
        <p className="text-gray-600 mb-6 dark:text-gray-300">{message}</p>
        {children}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-lg px-4 py-2 font-semibold text-white transition-all ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
