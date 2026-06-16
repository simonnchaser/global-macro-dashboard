/**
 * 금리·채권 탭
 */

'use client';

import type { MetricId } from '@/lib/metrics/metricsTypes';
import MetricCard from '../cards/MetricCard';

interface BondsTabProps {
  onMetricClick: (metricId: MetricId) => void;
}

export default function BondsTab({ onMetricClick }: BondsTabProps) {
  const bondMetrics = ['fedRate', 'us2y', 'us10y', 'spread2y10y', 'bokRate', 'kr3y', 'kr10y', 'jp10y'] as const;

  return (
    <div className="pt-4 px-6 pb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {bondMetrics.map((metricId) => (
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
