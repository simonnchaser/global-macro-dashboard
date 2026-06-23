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
  const usBondMetrics = ['fedRate', 'us2y', 'us10y', 'spread2y10y'] as const;
  const krBondMetrics = ['bokRate', 'kr3y', 'kr10y', 'krSpread3y10y', 'krCorpAA', 'krCorpBBB'] as const;
  const otherBondMetrics = ['jp10y'] as const;

  return (
    <div className="pt-4 px-6 pb-8">
      {/* 미국 금리 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">미국 금리</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {usBondMetrics.map((metricId) => (
            <MetricCard
              key={metricId}
              metricId={metricId}
              onClick={() => onMetricClick(metricId)}
            />
          ))}
        </div>
      </div>

      {/* 한국 금리 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">한국 금리</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {krBondMetrics.map((metricId) => (
            <MetricCard
              key={metricId}
              metricId={metricId}
              onClick={() => onMetricClick(metricId)}
            />
          ))}
        </div>
      </div>

      {/* 기타 국가 */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-slate-200">기타 국가</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {otherBondMetrics.map((metricId) => (
            <MetricCard
              key={metricId}
              metricId={metricId}
              onClick={() => onMetricClick(metricId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
