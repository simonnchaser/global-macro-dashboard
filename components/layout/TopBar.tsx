/**
 * 상단 고정바 - 사용자 핀 지표 표시
 */

'use client';

import { useRef, useState } from 'react';
import { useUserSettings } from '@/lib/store/userSettingsStore';
import { getMetricMeta } from '@/lib/metrics/metricsMeta';
import { useMetricsCurrentValues } from '@/lib/hooks/useMetrics';
import MetricSelectorModal from '@/components/modals/MetricSelectorModal';

export default function TopBar() {
  const { pinnedMetrics, addPinnedMetric, removePinnedMetric } = useUserSettings();
  const metricsData = useMetricsCurrentValues(pinnedMetrics);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSelector, setShowSelector] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-[#161b27] border-b border-[#2d3748] fixed top-0 left-0 right-0 z-50 h-[60px]">
      <div className="relative px-6 h-full flex items-center">
        {/* 좌측 스크롤 버튼 */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#161b27] hover:bg-[#1e2530] p-2 rounded-r border border-l-0 border-[#2d3748]"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 스크롤 가능한 지표 영역 */}
        <div
          ref={scrollRef}
          className="flex items-center gap-6 overflow-x-hidden scroll-smooth px-10"
        >
          {pinnedMetrics.map((metricId) => {
            const meta = getMetricMeta(metricId);
            const rawData = metricsData[metricId];

            if (!meta || !rawData) return null;

            // 이미 성장률/비율로 표시되는 지표는 변화율(%) 제거
            const isPercentageMetric = meta.unit === '%' || meta.unit === '% QoQ' || meta.unit === '% YoY';
            const data = {
              ...rawData,
              changePercent: isPercentageMetric ? undefined : rawData.changePercent,
            };

            // 단순 색상 로직: change 값 기준 (MetricCard와 동일)
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

            return (
              <div key={metricId} className="flex items-center gap-3 flex-shrink-0 group relative pl-6">
                {/* 제거 버튼 (hover시 표시) */}
                <button
                  onClick={() => removePinnedMetric(metricId)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500/90 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg hover:scale-110"
                  title="핀 제거"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="text-xs text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  {meta.label}
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-lg font-mono font-semibold ${valueColor} whitespace-nowrap`}>
                    {data.value.toLocaleString()}{meta.unit}
                  </div>
                  {data.change !== null && (
                    <div className={`text-xs font-mono ${changeColor} whitespace-nowrap flex items-center gap-1`}>
                      <span>{data.change > 0 ? '+' : ''}{data.change.toFixed(meta.decimals ?? 2)}</span>
                      {data.changePercent !== undefined && (
                        <span className={`px-2 py-0.5 rounded font-semibold ${
                          data.changePercent > 0
                            ? 'bg-green-500/30 text-green-300'
                            : data.changePercent < 0
                              ? 'bg-red-500/30 text-red-300'
                              : 'bg-slate-500/30 text-slate-300'
                        }`}>
                          {data.changePercent > 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <button
            onClick={() => setShowSelector(true)}
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 border border-slate-600 rounded flex-shrink-0 whitespace-nowrap hover:border-[#3b82f6] transition-colors"
          >
            + 지표 추가
          </button>
        </div>

        {/* 우측 스크롤 버튼 */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#161b27] hover:bg-[#1e2530] p-2 rounded-l border border-r-0 border-[#2d3748]"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 지표 선택 모달 */}
      {showSelector && (
        <MetricSelectorModal
          title="핀에 추가할 지표 선택"
          onSelect={(metricId) => {
            addPinnedMetric(metricId);
            setShowSelector(false);
          }}
          onClose={() => setShowSelector(false)}
          selectedMetrics={pinnedMetrics}
        />
      )}
    </div>
  );
}
