/**
 * 경제지표 탭
 */

'use client';

import type { MetricId } from '@/lib/metrics/metricsTypes';
import MetricCard from '../cards/MetricCard';

interface EconomicTabProps {
  onMetricClick: (metricId: MetricId) => void;
}

export default function EconomicTab({ onMetricClick }: EconomicTabProps) {
  const economicMetrics = ['cpiUs', 'pceUs', 'corePce', 'trimmedPce', 'ppiUs', 'unemployment', 'gdpUs', 'cpiKr', 'unemploymentKr', 'gdpKr', 'ppiKr', 'industrialKr'] as const;

  return (
    <div className="pt-4 px-6 pb-8">
      {/* 경제지표 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {economicMetrics.map((metricId) => (
          <MetricCard
            key={metricId}
            metricId={metricId}
            onClick={() => onMetricClick(metricId)}
          />
        ))}
      </div>

      {/* 시장 국면 설명 */}
      <div className="mt-6 bg-[#1e2530] border border-[#2d3748] rounded-xl p-5 shadow-lg">
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">
          4가지 시장 국면
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <div>🟢 <span className="font-semibold">골디락스:</span> 경기↑ + 물가↓ → 주식↑ KOSPI↑</div>
          <div>🔴 <span className="font-semibold">과열·긴축:</span> 경기↑ + 물가↑ → 주식↓ 달러↑</div>
          <div>🔵 <span className="font-semibold">침체·유동성:</span> 경기↓ + 물가↓ → 초기 급락 후 유동성 장세</div>
          <div>⚫ <span className="font-semibold">스태그플레이션:</span> 경기↓ + 물가↑ → 최악. KOSPI 최약세</div>
        </div>
      </div>
    </div>
  );
}
