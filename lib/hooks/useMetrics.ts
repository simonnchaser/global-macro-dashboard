/**
 * 지표 데이터 훅
 *
 * 현재: mockData에서 데이터 읽기
 * 향후: API(FRED, Yahoo Finance 등)에서 fetch
 *
 * 중요: 컴포넌트는 이 훅을 통해서만 데이터에 접근해야 함
 * mockData를 직접 import하면 안 됨!
 */

'use client';

import { useMemo } from 'react';
import type { MetricId } from '@/lib/metrics/metricsTypes';
import { mockMetricsData } from '@/lib/mock/mockData';
import { mockTimeSeriesData } from '@/lib/mock/mockTimeSeriesData';

/**
 * 현재값 + 변화량 데이터
 */
export function useMetricCurrentValue(metricId: MetricId) {
  return useMemo(() => {
    return mockMetricsData[metricId];
  }, [metricId]);
}

/**
 * 시계열 데이터
 */
export function useMetricTimeSeries(metricId: MetricId) {
  return useMemo(() => {
    return mockTimeSeriesData[metricId];
  }, [metricId]);
}

/**
 * 모든 지표의 현재값 (TopBar 등에서 사용)
 */
export function useAllMetricsCurrentValues() {
  return useMemo(() => {
    return mockMetricsData;
  }, []);
}

/**
 * 여러 지표의 현재값 가져오기 (핀 목록 등)
 */
export function useMetricsCurrentValues(metricIds: MetricId[]) {
  return useMemo(() => {
    const result: Record<string, typeof mockMetricsData[MetricId]> = {};
    metricIds.forEach((id) => {
      result[id] = mockMetricsData[id];
    });
    return result;
  }, [metricIds]);
}
