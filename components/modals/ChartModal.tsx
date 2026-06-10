/**
 * 차트 모달 - lightweight-charts 시계열 + 지표 설명
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, LineSeries, AreaSeries } from 'lightweight-charts';
import type { MetricId } from '@/lib/metrics/metricsTypes';
import { getMetricMeta } from '@/lib/metrics/metricsMeta';
import { useMetricCurrentValue, useMetricTimeSeries } from '@/lib/hooks/useMetrics';
import { useUserSettings } from '@/lib/store/userSettingsStore';
import AlarmModal from './AlarmModal';

interface ChartModalProps {
  metricId: MetricId;
  onClose: () => void;
}

export default function ChartModal({ metricId, onClose }: ChartModalProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [showAlarmModal, setShowAlarmModal] = useState(false);

  const meta = getMetricMeta(metricId);
  const currentData = useMetricCurrentValue(metricId);
  const timeSeriesData = useMetricTimeSeries(metricId);

  const { compareCharts, addCompareChart, addAlarm } = useUserSettings();

  // 이미 차트 비교에 추가되어 있는지 확인
  const isInCompare = compareCharts.includes(metricId);
  const canAddToCompare = compareCharts.length < 6; // 최대 6개

  useEffect(() => {
    if (!chartContainerRef.current || !meta) return;

    // 기간별 데이터 필터링
    const filterDataByPeriod = (data: typeof timeSeriesData, period: string) => {
      const days = period === '1M' ? 30 : period === '3M' ? 90 : period === '6M' ? 180 : 365;
      return data.slice(-days);
    };

    // 차트 생성
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
      height: 300,
      timeScale: {
        borderColor: '#2d3748',
      },
      rightPriceScale: {
        borderColor: '#2d3748',
      },
    });

    // 라인 시리즈 추가 (v5 API)
    const lineSeries = chart.addSeries(LineSeries, {
      color: meta.chartConfig.color,
      lineWidth: 2,
    });

    // 기간에 따라 데이터 필터링
    const filteredData = filterDataByPeriod(timeSeriesData, period);
    lineSeries.setData(filteredData);

    // 2Y-10Y Spread인 경우 음수 구간 음영 처리
    if (metricId === 'spread2y10y' && meta.chartConfig.negativeZoneColor) {
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: 'transparent',
        bottomColor: meta.chartConfig.negativeZoneColor,
        lineColor: 'transparent',
      });

      // 음수인 부분만 음영
      const negativeData = filteredData.map((d) => ({
        time: d.time,
        value: d.value < 0 ? d.value : 0,
      }));
      areaSeries.setData(negativeData);
    }

    // 기준선 추가 (PMI 50, CPI 2% 등)
    if (meta.chartConfig.referenceLines) {
      meta.chartConfig.referenceLines.forEach((value) => {
        lineSeries.createPriceLine({
          price: value,
          color: '#64748b',
          lineWidth: 1,
          lineStyle: 2, // dashed
          axisLabelVisible: true,
          title: `${value}`,
        });
      });
    }

    chart.timeScale().fitContent();

    // 리사이즈 핸들러
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

  if (!meta) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-[#1e2530] rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-[#2d3748]">
          <div>
            <h2 className="text-xl font-semibold text-slate-200">{meta.label}</h2>
            <div className="text-sm text-slate-400 mt-1">
              현재값: <span className="font-mono text-slate-200">{currentData.value.toLocaleString()}{meta.unit}</span>
              {currentData.change !== null && (
                <span className={`ml-2 font-mono ${currentData.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {currentData.change > 0 ? '+' : ''}{currentData.change.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* 기간 선택 */}
            {(['1M', '3M', '6M', '1Y'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-[#0f1117] text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 ml-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 차트 영역 */}
        <div className="p-6">
          <div ref={chartContainerRef} className="w-full" />
        </div>

        {/* 지표 설명 */}
        <div className="p-6 border-t border-[#2d3748] space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">이 지표가 의미하는 것</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{meta.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">해석 방법</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{meta.interpretation}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">관련 지표와의 관계</h3>
            <ul className="text-sm text-slate-400 space-y-1">
              {meta.relationships.map((rel, i) => (
                <li key={i}>• {rel}</li>
              ))}
            </ul>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                if (!isInCompare && canAddToCompare) {
                  addCompareChart(metricId);
                }
              }}
              disabled={isInCompare || !canAddToCompare}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                isInCompare
                  ? 'bg-green-900 text-green-300 cursor-not-allowed'
                  : !canAddToCompare
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
              }`}
            >
              {isInCompare ? '✓ 비교 중' : !canAddToCompare ? '최대 6개' : '차트 비교에 추가'}
            </button>
            <button
              onClick={() => setShowAlarmModal(true)}
              className="px-4 py-2 bg-[#1e2530] hover:bg-[#0f1117] text-slate-300 border border-[#2d3748] rounded text-sm font-medium"
            >
              내 알람 설정
            </button>
          </div>
        </div>
      </div>

      {/* 알람 설정 모달 */}
      {showAlarmModal && (
        <AlarmModal
          onSave={(newAlarm) => {
            addAlarm(newAlarm);
            setShowAlarmModal(false);
          }}
          onClose={() => setShowAlarmModal(false)}
        />
      )}
    </div>
  );
}
