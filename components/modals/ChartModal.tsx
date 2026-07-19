/**
 * 차트 모달 - lightweight-charts 시계열 + 지표 설명
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, LineSeries, AreaSeries, type UTCTimestamp } from 'lightweight-charts';
import type { MetricId } from '@/lib/metrics/metricsTypes';
import { getMetricMeta } from '@/lib/metrics/metricsMeta';
import { useMetricTimeSeries, useMetricCurrentValue } from '@/lib/hooks/useMetrics';
import { useUserSettings } from '@/lib/store/userSettingsStore';
import { getChangeColor } from '@/lib/utils/colorUtils';
import AlarmModal from './AlarmModal';

interface ChartModalProps {
  metricId: MetricId;
  onClose: () => void;
}

export default function ChartModal({ metricId, onClose }: ChartModalProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const meta = getMetricMeta(metricId);

  // 지표 주기에 따라 사용 가능한 기간 필터링
  const yahooMetrics = [
    'sp500', 'nasdaq', 'kospi', 'kosdaq', 'sse',
    'dxy', 'eurUsd', 'usdJpy', 'usdCny', 'usdKrw', 'eurKrw', 'jpyKrw', 'cnyKrw',
    'gold', 'silver', 'wti', 'brent', 'natgas', 'copper'
  ];
  const isYahooMetric = yahooMetrics.includes(metricId as string);

  const getAvailablePeriods = (): Array<'1D' | '1M' | '3M' | '6M' | '1Y' | 'MAX'> => {
    if (!meta) return ['1M', '3M', '6M', '1Y', 'MAX'];

    const allPeriods: Array<'1D' | '1M' | '3M' | '6M' | '1Y' | 'MAX'> = ['1M', '3M', '6M', '1Y', 'MAX'];

    if (isYahooMetric) {
      allPeriods.unshift('1D');
    }

    switch (meta.frequency) {
      case 'quarterly':
        return allPeriods.filter(p => !['1D', '1M', '3M'].includes(p));
      case 'yearly':
        return allPeriods.filter(p => !['1D', '1M', '3M', '6M'].includes(p));
      case 'monthly':
        return allPeriods.filter(p => p !== '1D');
      default:
        return allPeriods;
    }
  };

  const availablePeriods = getAvailablePeriods();
  const defaultPeriod = availablePeriods.includes('6M') ? '6M' : availablePeriods[0];

  const [period, setPeriod] = useState<'1D' | '1M' | '3M' | '6M' | '1Y' | 'MAX'>(defaultPeriod);
  const [showAlarmModal, setShowAlarmModal] = useState(false);

  const { timeSeries: timeSeriesData, timezone } = useMetricTimeSeries(metricId as any, period);

  // 현재값은 항상 최신 실시간 데이터 사용 (기간과 무관)
  const realtimeData = useMetricCurrentValue(metricId);

  // 현재값 포맷팅 - 이미 성장률/비율로 표시되는 지표는 변화율(%) 제거
  const currentData = realtimeData ? (() => {
    // GDP, 금리, 실업률 등 이미 %로 표시되는 지표는 변화율 의미 없음
    const isPercentageMetric = meta?.unit === '%' || meta?.unit === '% QoQ' || meta?.unit === '% YoY';

    return {
      ...realtimeData,
      changePercent: isPercentageMetric ? undefined : realtimeData.changePercent,
    };
  })() : null;

  const { compareCharts, addCompareChart, addAlarm } = useUserSettings();

  // 이미 차트 비교에 추가되어 있는지 확인
  const isInCompare = compareCharts.includes(metricId);
  const canAddToCompare = compareCharts.length < 6; // 최대 6개

  // 모달이 열렸을 때 배경 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);


  useEffect(() => {
    if (!chartContainerRef.current || !meta || !timeSeriesData.length) return;

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
      height: 400,
      timeScale: {
        borderColor: '#2d3748',
        timeVisible: period === '1D',  // 1D일 때만 시간 표시
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2d3748',
      },
    });

    // 라인 시리즈 추가 (v5 API)
    const lineSeries = chart.addSeries(LineSeries, {
      color: meta.chartConfig.color,
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: meta.decimals ?? 2,
      },
    });

    // 데이터 형식 변환: 모두 동일한 타입으로 통일
    const chartData = timeSeriesData.map(d => {
      let time: UTCTimestamp | string;

      if (typeof d.time === 'number') {
        // 1분봉: 이미 UTC timestamp
        time = d.time as UTCTimestamp;
      } else {
        // 일봉: 문자열을 그대로 사용 (lightweight-charts가 자동 처리)
        time = d.time;
      }

      return { time, value: d.value };
    });

    // 데이터가 혼합 타입인지 확인
    const hasNumericTime = timeSeriesData.some(d => typeof d.time === 'number');
    const hasStringTime = timeSeriesData.some(d => typeof d.time === 'string');

    if (hasNumericTime && hasStringTime) {
      // 혼합 타입: 모두 UTC timestamp로 변환
      const unifiedData = timeSeriesData.map(d => {
        let timestamp: number;

        if (typeof d.time === 'number') {
          timestamp = d.time;
        } else {
          // 문자열을 UTC timestamp로 변환 후 KST로 조정 (+9시간)
          timestamp = Math.floor(new Date(d.time + 'T00:00:00Z').getTime() / 1000) + 9 * 3600;
        }

        return {
          time: timestamp as UTCTimestamp,
          value: d.value,
        };
      });

      lineSeries.setData(unifiedData);
    } else if (hasStringTime) {
      // 일봉만 있는 경우: 날짜 문자열을 KST 기준 timestamp로 변환
      const convertedData = timeSeriesData.map(d => {
        const timestamp = Math.floor(new Date(d.time + 'T00:00:00Z').getTime() / 1000) + 9 * 3600;
        return {
          time: timestamp as UTCTimestamp,
          value: d.value,
        };
      });
      lineSeries.setData(convertedData);
    } else {
      // 숫자만 있는 경우: 그대로 사용
      lineSeries.setData(chartData as any);
    }

    // 2Y-10Y Spread인 경우 음수 구간 음영 처리
    if (metricId === 'spread2y10y' && meta.chartConfig.negativeZoneColor) {
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: 'transparent',
        bottomColor: meta.chartConfig.negativeZoneColor,
        lineColor: 'transparent',
      });

      // 음수인 부분만 음영
      let negativeData;
      if (hasNumericTime && hasStringTime) {
        // 혼합 타입
        negativeData = timeSeriesData.map(d => {
          let timestamp: number;
          if (typeof d.time === 'number') {
            timestamp = d.time;
          } else {
            timestamp = Math.floor(new Date(d.time + 'T00:00:00Z').getTime() / 1000) + 9 * 3600;
          }
          return {
            time: timestamp as UTCTimestamp,
            value: d.value < 0 ? d.value : 0,
          };
        });
      } else if (hasStringTime) {
        // 일봉만
        negativeData = timeSeriesData.map(d => {
          const timestamp = Math.floor(new Date(d.time as string + 'T00:00:00Z').getTime() / 1000) + 9 * 3600;
          return {
            time: timestamp as UTCTimestamp,
            value: d.value < 0 ? d.value : 0,
          };
        });
      } else {
        // 숫자만
        negativeData = chartData.map(d => ({
          time: d.time,
          value: d.value < 0 ? d.value : 0,
        }));
      }
      areaSeries.setData(negativeData as any);
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
        <div className="p-6 border-b border-[#2d3748]">
          <div className="flex items-start justify-between gap-6 mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-slate-200 mb-2">{meta.label}</h2>
              <div className="text-sm text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                {currentData ? (
                  <>
                    <span className="whitespace-nowrap">현재값: <span className="font-mono text-slate-200">{currentData.value.toLocaleString()}{meta.unit}</span></span>
                    {currentData.change !== null && (
                      <>
                        <span className={`font-mono whitespace-nowrap ${getChangeColor(currentData.change)}`}>
                          {currentData.change > 0 ? '+' : ''}{currentData.change.toFixed(meta.decimals ?? 2)}
                        </span>
                        {currentData.changePercent !== undefined && (
                          <span className={`px-2 py-0.5 rounded font-mono font-semibold whitespace-nowrap ${
                            currentData.changePercent > 0
                              ? 'bg-green-500/30 text-green-300'
                              : currentData.changePercent < 0
                                ? 'bg-red-500/30 text-red-300'
                                : 'bg-slate-500/30 text-slate-300'
                          }`}>
                            {currentData.changePercent > 0 ? '+' : ''}{currentData.changePercent.toFixed(2)}%
                          </span>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-slate-500">Loading...</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* 기간 선택 - 지표 주기에 따라 동적으로 표시 */}
            {availablePeriods.map((p) => (
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
          </div>
        </div>

        {/* 차트 영역 */}
        <div className="p-6">
          <div ref={chartContainerRef} className="w-full" />
          {/* 타임존 표시 (1D 탭이고 timezone 정보가 있을 때만) */}
          {period === '1D' && timezone && (
            <div className="text-xs text-slate-500 mt-2 text-right">
              시간대: {timezone}
            </div>
          )}
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
