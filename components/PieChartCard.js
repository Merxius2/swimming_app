/**
 * PieChartCard Component
 * Renders a donut chart with title and data
 */

import DonutChart from './DonutChart';

export default function PieChartCard({ title, data, getSymbol, isMobile }) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card p-6">
      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h4>
      {totalValue > 0 ? (
        <DonutChart 
          data={data.filter(item => item.value > 0)}
          totalAmount={totalValue}
          getSymbol={getSymbol}
          isMobile={isMobile}
          title={title === '(No Title)' ? 'TOTAL' : 'BREAKDOWN'}
          height={200}
        />
      ) : (
        <div className="h-48 flex items-center justify-center text-gray-500">
          <p className="text-center">No data to display</p>
        </div>
      )}
    </div>
  );
}
