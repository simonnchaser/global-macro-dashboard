/**
 * 환율·원자재 탭
 */

'use client';

import type { MetricId } from '@/lib/metrics/metricsTypes';
import MetricCard from '../cards/MetricCard';

interface FxCommoditiesTabProps {
  onMetricClick: (metricId: MetricId) => void;
}

export default function FxCommoditiesTab({ onMetricClick }: FxCommoditiesTabProps) {
  const fxMetrics = ['usdKrw', 'dxy', 'usdJpy', 'eurUsd'] as const;
  const commodityMetrics = ['wti', 'gold', 'silver'] as const;

  return (
    <div className="pt-4 px-6 pb-8">
      {/* 환율 섹션 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">환율</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fxMetrics.map((metricId) => (
            <MetricCard
              key={metricId}
              metricId={metricId}
              onClick={() => onMetricClick(metricId)}
            />
          ))}
        </div>
      </div>

      {/* 원자재 섹션 */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-slate-200">원자재</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {commodityMetrics.map((metricId) => (
            <MetricCard
              key={metricId}
              metricId={metricId}
              onClick={() => onMetricClick(metricId)}
            />
          ))}
        </div>

        {/* 원자재 해석 패널 */}
        <div className="mt-6 bg-[#1e2530] border border-[#2d3748] rounded-xl p-5 shadow-lg">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">
            원자재 해석
          </div>
          <div className="space-y-2 text-sm text-slate-300">
            <div>
              <span className="font-semibold">WTI:</span> 경기 온도계. 상승 원인 파악 필수 (수요↑ vs 공급충격)
            </div>
            <div>
              <span className="font-semibold">Gold:</span> 실질금리 역함수. 위기 시 안전자산
            </div>
            <div>
              <span className="font-semibold">Silver:</span> Gold/Silver Ratio로 상대 가치 평가
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
