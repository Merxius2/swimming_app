/**
 * Reusable Donut Chart Component
 * Features:
 * - Donut chart with center content display
 * - Total label and amount in the center circle
 * - Vibrant segment colors with white strokes
 * - Legend below the chart
 * - Mobile responsive
 */

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useChartTheme } from '../hooks/useChartTheme';

export default function DonutChart({ 
  data, 
  totalAmount, 
  getSymbol, 
  isMobile,
  title = 'TOTAL',
  height = 300,
  innerRadius = '70%',
  outerRadius = '90%'
}) {
  const { isDarkMode, colors, tooltipStyle, tooltipLabelStyle, centerCircleStyle, textColors } = useChartTheme();
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const filteredData = data.filter(item => item.value > 0);

  // Center circle styling based on theme
  const centerStyle = centerCircleStyle(height);

  return (
    <div className="w-full">
      <div className="relative mx-auto" style={{ width: '100%', maxWidth: `${height}px`, aspectRatio: '1 / 1' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey="value"
              label={false}
            >
              {filteredData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${getSymbol()}${Math.floor(value).toLocaleString('en-US')}`}
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center content circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div 
            className="flex flex-col items-center justify-center rounded-full"
            style={centerStyle}
          >
            <p className={`text-sm font-semibold uppercase tracking-widest ${textColors.title}`}>
              {title}
            </p>
            <p className={`text-xl sm:text-2xl font-bold mt-2 font-mono ${textColors.amount}`}>
              {getSymbol()}{Math.floor(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={`mt-6 ${isMobile ? 'space-y-2' : 'grid grid-cols-1 gap-3'}`}>
        {filteredData.map((entry, index) => {
          const percentage = totalValue > 0 ? ((entry.value / totalValue) * 100).toFixed(1) : 0;
          return (
            <div 
              key={`legend-${index}`} 
              className="flex items-center gap-3 text-sm"
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0 border border-gray-300 dark:border-gray-600" 
                style={{
                  backgroundColor: colors[index % colors.length]
                }} 
              />
              <span className={`${textColors.label} flex-1`}>
                <span className="font-medium">{entry.name}:</span>
                <span className="ml-2 font-mono">{getSymbol()}{Math.floor(entry.value).toLocaleString('en-US')}</span>
                <span className={`ml-2 ${textColors.subtext}`}>({percentage}%)</span>
              </span>
            </div>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <div className="h-32 flex items-center justify-center">
          <p className={`text-sm ${textColors.subtext}`}>No data to display</p>
        </div>
      )}
    </div>
  );
}
