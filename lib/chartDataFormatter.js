/**
 * Chart Data Formatter Utilities
 * Provides functions to prepare and format data for chart rendering
 */

/**
 * Prepare pie chart data from expenses
 * Filters out zero values and adds remaining amount
 * @param {object} expenseData - Expense object {category: amount}
 * @param {number} remainingAmount - Amount left after expenses (can be negative)
 * @returns {array} Array of objects {name, value} suitable for pie chart
 */
export function preparePieChartData(expenseData = {}, remainingAmount = 0) {
  const data = Object.entries(expenseData)
    .map(([name, value]) => ({
      name,
      value: Math.max(0, parseFloat(value) || 0)
    }))
    .filter(item => item.value > 0);
  
  if (remainingAmount > 0) {
    data.push({ name: 'Remaining', value: remainingAmount });
  }
  
  return data;
}
