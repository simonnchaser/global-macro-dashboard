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

  // 단순 색상 로직: change 값 기준
  const valueColor = data.change > 0
    ? 'text-green-400'
    : data.change < 0
    ? 'text-red-400'
    : 'text-slate-200';

  const changeColor = data.change > 0
    ? 'text-green-400'
    : data.change < 0
    ? 'text-red-400'
    : 'text-slate-400';

  // 2Y-10Y Spread 음수일 때 보더 주황색
  const borderColor = metricId === 'spread2y10y' && data.value < 0
    ? 'border-orange-500'
    : 'border-[#2d3748]';

  // 월별/분기별 지표는 날짜 표시
  const monthlyMetrics = ['cpiUs', 'pceUs', 'corePce', 'trimmedPce', 'ppiUs', 'unemployment', 'gdpUs'];
  const showDate = monthlyMetrics.includes(metricId as string);

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
      {showDate && data.updatedAt && (
        <div className="text-[10px] text-slate-500 mt-2">
          {data.updatedAt} 기준
        </div>
      )}
    </div>
  );
}
