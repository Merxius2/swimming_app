/**
 * Sanitize amount input so values cannot be negative.
 * Allows empty string and partial decimal input (e.g. "12.").
 */
export function sanitizeNonNegativeInput(value) {
  if (value === '' || value === '.') return value;

  const withoutMinus = value.replace(/-/g, '');
  if (withoutMinus === '' || withoutMinus === '.') return withoutMinus;

  const num = parseFloat(withoutMinus);
  if (Number.isNaN(num)) return '';
  if (num < 0) return '0';

  return withoutMinus;
}

/**
 * Parse a stored amount string as a non-negative number.
 */
export function parseNonNegativeAmount(value) {
  return Math.max(0, parseFloat(value) || 0);
}
