/**
 * 증시 탭
 */

'use client';

import type { MetricId } from '@/lib/metrics/metricsTypes';
import MetricCard from '../cards/MetricCard';

interface StocksTabProps {
  onMetricClick: (metricId: MetricId) => void;
}

export default function StocksTab({ onMetricClick }: StocksTabProps) {
  const stockMetrics = ['sp500', 'nasdaq', 'kospi', 'kosdaq'] as const;

  return (
    <div className="pt-4 px-6 pb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stockMetrics.map((metricId) => (
          <MetricCard
            key={metricId}
            metricId={metricId}
            onClick={() => onMetricClick(metricId)}
          />
        ))}
      </div>
    </div>
  );
}
