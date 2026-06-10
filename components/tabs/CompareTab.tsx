/**
 * 차트 비교 탭 - 최대 6개 차트를 2x3 그리드로 표시
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, LineSeries } from 'lightweight-charts';
import { useUserSettings } from '@/lib/store/userSettingsStore';
import { getMetricMeta } from '@/lib/metrics/metricsMeta';
import { useMetricTimeSeries, useMetricCurrentValue } from '@/lib/hooks/useMetrics';
import MetricSelectorModal from '@/components/modals/MetricSelectorModal';
import ChartModal from '@/components/modals/ChartModal';
import type { MetricId } from '@/lib/metrics/metricsTypes';

// 개별 차트 컴포넌트
function CompareChartItem({
  metricId,
  onRemove,
  onClick
}: {
  metricId: MetricId;
  onRemove: () => void;
  onClick: () => void;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');

  const meta = getMetricMeta(metricId);
  const currentData = useMetricCurrentValue(metricId);
  const timeSeriesData = useMetricTimeSeries(metricId);

  useEffect(() => {
    if (!chartContainerRef.current || !meta) return;

    const filterDataByPeriod = (data: typeof timeSeriesData, period: string) => {
      const days = period === '1M' ? 30 : period === '3M' ? 90 : period === '6M' ? 180 : 365;
      return data.slice(-days);
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f1117' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e2530' },
        horzLines: { color: '#1e2530' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 200,
      timeScale: {
        borderColor: '#2d3748',
      },
      rightPriceScale: {
        borderColor: '#2d3748',
      },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: meta.chartConfig.color,
      lineWidth: 2,
    });

    const filteredData = filterDataByPeriod(timeSeriesData, period);
    lineSeries.setData(filteredData);

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [metricId, meta, timeSeriesData, period]);

  if (!meta || !currentData) return null;

  const isPositive = currentData.change !== null && currentData.change > 0;
  const valueColor = meta.positiveIsGood
    ? isPositive
      ? 'text-[#22c55e]'
      : 'text-[#ef4444]'
    : isPositive
    ? 'text-[#ef4444]'
    : 'text-[#22c55e]';

  return (
    <div className="bg-[#1e2530] border border-[#2d3748] rounded-xl p-4 shadow-lg relative group">
      {/* 삭제 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 z-10 text-slate-400 hover:text-red-400 transition-colors"
        title="비교에서 제거"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 확대 아이콘 (hover 시 표시) */}
      <button
        onClick={onClick}
        className="absolute top-2 right-10 z-10 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-[#3b82f6]"
        title="확대해서 보기"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </button>

      {/* 지표 이름 + 현재값 */}
      <div
        className="mb-3 cursor-pointer"
        onClick={onClick}
      >
        <div className="text-sm font-semibold text-slate-200">{meta.label}</div>
        <div className="flex items-baseline gap-2 mt-1">
          <div className={`text-lg font-mono font-semibold ${valueColor}`}>
            {currentData.value.toLocaleString()}{meta.unit}
          </div>
          {currentData.change !== null && (
            <div className={`text-xs font-mono ${valueColor}`}>
              {currentData.change > 0 ? '+' : ''}{currentData.change.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* 기간 선택 */}
      <div className="flex gap-1 mb-3">
        {(['1M', '3M', '6M', '1Y'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              period === p
                ? 'bg-[#3b82f6] text-white'
                : 'bg-[#0f1117] text-slate-400 hover:text-slate-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 차트 */}
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}

// 빈 슬롯 (차트 추가 버튼)
function EmptySlot({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-[#1e2530] border-2 border-dashed border-[#2d3748] rounded-xl p-4 shadow-lg hover:border-[#3b82f6] transition-colors flex items-center justify-center min-h-[280px]"
    >
      <div className="text-center">
        <div className="text-4xl text-slate-400 mb-2">+</div>
        <div className="text-sm text-slate-400">차트 추가</div>
      </div>
    </button>
  );
}

export default function CompareTab() {
  const { compareCharts, removeCompareChart, addCompareChart } = useUserSettings();
  const [showSelector, setShowSelector] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricId | null>(null);

  // 6개 슬롯 생성 (빈 슬롯 포함)
  const slots = Array.from({ length: 6 }, (_, i) => compareCharts[i] || null);

  return (
    <div className="pt-4 px-6 pb-8">
      {/* 안내 메시지 */}
      <div className="mb-6 bg-[#1e2530] border border-[#2d3748] rounded-xl p-5 shadow-lg">
        <div className="text-sm text-slate-300">
          💡 <span className="font-semibold">최대 6개</span>의 차트를 동시에 비교할 수 있습니다.
          차트 모달에서 "차트 비교에 추가" 버튼을 누르거나, 아래 빈 슬롯을 클릭해서 추가하세요.
        </div>
      </div>

      {/* 차트 그리드 (2x3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((metricId, index) =>
          metricId ? (
            <CompareChartItem
              key={metricId}
              metricId={metricId}
              onRemove={() => removeCompareChart(metricId)}
              onClick={() => setSelectedMetric(metricId)}
            />
          ) : (
            <EmptySlot key={`empty-${index}`} onClick={() => setShowSelector(true)} />
          )
        )}
      </div>

      {/* 지표 선택 모달 */}
      {showSelector && (
        <MetricSelectorModal
          title="비교할 차트 선택"
          onSelect={(metricId) => {
            addCompareChart(metricId);
            setShowSelector(false);
          }}
          onClose={() => setShowSelector(false)}
          selectedMetrics={compareCharts}
        />
      )}

      {/* 차트 확대 모달 */}
      {selectedMetric && (
        <ChartModal
          metricId={selectedMetric}
          onClose={() => setSelectedMetric(null)}
        />
      )}
    </div>
  );
}
