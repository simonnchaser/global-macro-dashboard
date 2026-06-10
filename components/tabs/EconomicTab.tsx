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
  const economicMetrics = ['cpiUs', 'pceUs', 'trimmedPce', 'ppiUs', 'unemployment', 'pmi', 'gdpUs', 'cpiKr'] as const;

  return (
    <div className="pt-4 px-6 pb-8">
      {/* 시장 국면 판단 패널 */}
      <div className="mb-6 bg-red-950 border-l-4 border-red-500 text-red-200 p-5 rounded-xl">
        <div className="text-lg font-semibold mb-3">
          🔴 현재 시장 국면: 과열·긴축 국면
        </div>
        <div className="text-sm mb-3">
          경기↑ 성장 중 | 물가↑ 2% 초과
        </div>
        <div className="text-sm">
          <span className="font-semibold">자산 배치 시사점:</span> 주식↓ / 채권가격↓ / 달러↑ / KOSPI↓
        </div>
      </div>

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
