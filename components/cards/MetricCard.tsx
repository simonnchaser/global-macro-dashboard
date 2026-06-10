/**
 * 클릭 가능한 지표 카드
 */

'use client';

import type { MetricId } from '@/lib/metrics/metricsTypes';
import { getMetricMeta } from '@/lib/metrics/metricsMeta';
import { useMetricCurrentValue } from '@/lib/hooks/useMetrics';

interface MetricCardProps {
  metricId: MetricId;
  onClick?: () => void;
}

export default function MetricCard({ metricId, onClick }: MetricCardProps) {
  const meta = getMetricMeta(metricId);
  const data = useMetricCurrentValue(metricId);

  if (!meta || !data) return null;

  const isPositive = data.change !== null && data.change > 0;
  const isNegative = data.change !== null && data.change < 0;

  // positiveIsGood에 따라 색상 결정
  const valueColor = meta.positiveIsGood
    ? isPositive
      ? 'text-[#22c55e]'
      : isNegative
      ? 'text-[#ef4444]'
      : 'text-slate-200'
    : isPositive
    ? 'text-[#ef4444]'  // 상승이 나쁜 지표
    : isNegative
    ? 'text-[#22c55e]'
    : 'text-slate-200';

  const changeColor = meta.positiveIsGood
    ? isPositive
      ? 'text-[#22c55e]'
      : 'text-[#ef4444]'
    : isPositive
    ? 'text-[#ef4444]'
    : 'text-[#22c55e]';

  // 2Y-10Y Spread 음수일 때 보더 주황색
  const borderColor = metricId === 'spread2y10y' && data.value < 0
    ? 'border-orange-500'
    : 'border-[#2d3748]';

  return (
    <div
      onClick={onClick}
      className={`bg-[#1e2530] border ${borderColor} rounded-xl p-5 shadow-lg cursor-pointer hover:border-[#3b82f6] transition-colors`}
    >
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">
        {meta.label}
      </div>
      <div className={`text-2xl font-mono font-semibold ${valueColor} mb-1`}>
        {data.value.toLocaleString()}{meta.unit}
      </div>
      {data.change !== null && (
        <div className={`text-xs font-mono ${changeColor}`}>
          {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}
        </div>
      )}
    </div>
  );
}
