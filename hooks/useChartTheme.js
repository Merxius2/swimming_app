/**
 * Chart Theme Hook
 * Provides consistent dark mode colors for all chart components across the app
 * Centralizes theme logic to avoid duplication in multiple chart files
 */

import { useDarkMode } from '../context/UserPreferencesContext';
import { CHART_COLORS } from '../lib/constants';

/**
 * Get chart theme colors based on dark mode preference
 * @returns {object} Theme object with color and style properties for charts
 */
export function useChartTheme() {
  const { isDarkMode } = useDarkMode();

  // Tooltip styling
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB',
    border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB',
    borderRadius: '0.5rem',
    color: isDarkMode ? '#F3F4F6' : '#1F2937'
  };

  const tooltipLabelStyle = {
    color: isDarkMode ? '#F3F4F6' : '#1F2937'
  };

  // Center circle styling (for donut charts)
  const centerCircleStyle = (height = 300) => {
    const circleSize = Math.min(height * 0.55, 200); // 55% of height, max 200px
    return {
      width: `${circleSize}px`,
      height: `${circleSize}px`,
      aspectRatio: '1 / 1',
      boxShadow: isDarkMode 
        ? '0 10px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        : '0 10px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      background: isDarkMode
        ? 'linear-gradient(to bottom, #1f2937, #111827)'
        : 'linear-gradient(to bottom, #f3f4f6, #e5e7eb)'
    };
  };

  // Text colors
  const textColors = {
    title: isDarkMode ? 'text-gray-400' : 'text-gray-600',
    amount: isDarkMode ? 'text-white' : 'text-gray-900',
    label: isDarkMode ? 'text-gray-300' : 'text-gray-700',
    subtext: isDarkMode ? 'text-gray-400' : 'text-gray-600',
  };

  // Grid styling for line/bar charts
  const gridStyle = {
    stroke: isDarkMode ? '#374151' : '#E5E7EB'
  };

  // Axis styling
  const axisStyle = {
    stroke: isDarkMode ? '#6B7280' : '#D1D5DB',
    fill: isDarkMode ? '#9CA3AF' : '#6B7280'
  };

  return {
    isDarkMode,
    colors: CHART_COLORS,
    tooltipStyle,
    tooltipLabelStyle,
    centerCircleStyle,
    textColors,
    gridStyle,
    axisStyle,
  };
}
