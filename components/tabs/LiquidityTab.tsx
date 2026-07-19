/**
 * 유동성·크레딧 탭
 */

'use client';

import type { MetricId } from '@/lib/metrics/metricsTypes';
import MetricCard from '../cards/MetricCard';

interface LiquidityTabProps {
  onMetricClick: (metricId: MetricId) => void;
}

export default function LiquidityTab({ onMetricClick }: LiquidityTabProps) {
  const liquidityMetrics = ['fedAssets', 'tga', 'rrp', 'netLiquidity'] as const;
  const creditMetrics = ['hyOas', 'igOas', 'krIgSpread', 'krHySpread'] as const;
  const koreanMetrics = ['krFxReserves'] as const;

  return (
    <div className="pt-4 px-6 pb-8">
      {/* 유동성 섹션 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">유동성</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {liquidityMetrics.map((metricId) => (
            <MetricCard
              key={metricId}
              metricId={metricId}
              onClick={() => onMetricClick(metricId)}
            />
          ))}
        </div>

        {/* Net Liquidity 공식 설명 */}
        <div className="mt-4 bg-[#1e2530] border border-[#2d3748] rounded-xl p-5 shadow-lg">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">
            Net Liquidity 공식
          </div>
          <div className="text-sm text-slate-300 font-mono">
            Net Liquidity = Fed자산 - TGA - RRP
          </div>
          <div className="text-xs text-slate-500 mt-2">
            S&P500과 강한 상관관계. 선행 지표 역할.
          </div>
        </div>
      </div>

      {/* 크레딧 섹션 */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-slate-200">크레딧</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {creditMetrics.map((metricId) => (
            <MetricCard
              key={metricId}
              metricId={metricId}
              onClick={() => onMetricClick(metricId)}
            />
          ))}
        </div>
      </div>

      {/* 한국 섹션 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">한국</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {koreanMetrics.map((metricId) => (
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
