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
  // 원화 기준 환율 (ECOS)
  const krwFxMetrics = ['usdKrw', 'eurKrw', 'jpyKrw', 'cnyKrw'] as const;
  // 국제 교차 환율 (FRED)
  const globalFxMetrics = ['dxy', 'eurUsd', 'usdJpy', 'usdCny'] as const;
  // 원자재 (FRED)
  const commodityMetrics = ['gold', 'silver', 'wti', 'brent', 'natgas', 'copper', 'gasPrice'] as const;

  return (
    <div className="pt-4 px-6 pb-8">
      {/* 원화 기준 환율 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">원화 기준 환율</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {krwFxMetrics.map((metricId) => (
            <MetricCard
              key={metricId}
              metricId={metricId}
              onClick={() => onMetricClick(metricId)}
            />
          ))}
        </div>
      </div>

      {/* 국제 환율 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">국제 환율</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {globalFxMetrics.map((metricId) => (
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
            <div>
              <span className="font-semibold">Gold:</span> 실질금리 역함수. 위기 시 안전자산
            </div>
            <div>
              <span className="font-semibold">Silver:</span> 산업 수요 50%. 경기 회복기 금보다 강세
            </div>
            <div>
              <span className="font-semibold">WTI:</span> 미국 원유. 인플레 선행지표
            </div>
            <div>
              <span className="font-semibold">Brent:</span> 글로벌 벤치마크. 중동 리스크 민감
            </div>
            <div>
              <span className="font-semibold">천연가스:</span> 계절성 강함. 겨울/여름 급등
            </div>
            <div>
              <span className="font-semibold">구리:</span> 경제학 박사. 침체 3~6개월 선행
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold">휘발유:</span> 소비자 체감 인플레. $4 초과 시 심리 악화
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
