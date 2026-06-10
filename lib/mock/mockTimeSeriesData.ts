/**
 * 차트용 더미 시계열 데이터
 */

import type { MetricId } from '../metrics/metricsTypes';

export interface TimeSeriesDataPoint {
  time: string; // 'YYYY-MM-DD' format
  value: number;
}

// 3개월치 더미 데이터 생성 헬퍼
const generateDummyTimeSeries = (
  baseValue: number,
  volatility: number = 0.02,
  days: number = 90
): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  const today = new Date('2026-06-10');

  let currentValue = baseValue;

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // 랜덤 변동
    const change = (Math.random() - 0.5) * 2 * volatility * baseValue;
    currentValue += change;

    data.push({
      time: date.toISOString().split('T')[0],
      value: Number(currentValue.toFixed(2)),
    });
  }

  return data;
};

// 2Y-10Y Spread 특수 케이스 (음수 구간 포함)
const generateSpreadTimeSeries = (): TimeSeriesDataPoint[] => {
  const data: TimeSeriesDataPoint[] = [];
  const today = new Date('2026-06-10');
  const days = 90;

  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // 시간에 따라 역전 → 정상화 패턴
    const t = (days - i) / days; // 0 to 1
    let value: number;

    if (t < 0.3) {
      value = 20 - t * 100; // 20 → -10 (역전 진입)
    } else if (t < 0.7) {
      value = -10 - (t - 0.3) * 10; // -10 → -13 (역전 심화)
    } else {
      value = -13 + (t - 0.7) * 5; // -13 → -11.5 (약간 개선)
    }

    value += (Math.random() - 0.5) * 4; // 노이즈

    data.push({
      time: date.toISOString().split('T')[0],
      value: Number(value.toFixed(1)),
    });
  }

  return data;
};

export const mockTimeSeriesData: Record<MetricId, TimeSeriesDataPoint[]> = {
  // 증시
  sp500: generateDummyTimeSeries(4950, 0.015),
  nasdaq: generateDummyTimeSeries(15620, 0.02),
  kospi: generateDummyTimeSeries(2680, 0.018),
  kosdaq: generateDummyTimeSeries(865, 0.025),
  foreignNetBuy: generateDummyTimeSeries(-1000, 0.5),
  foreignOwnership: generateDummyTimeSeries(32.5, 0.003),
  fearGreed: generateDummyTimeSeries(60, 0.1),
  cpRatio: generateDummyTimeSeries(0.68, 0.05),

  // 금리·채권
  fedRate: generateDummyTimeSeries(3.625, 0.001), // 거의 변화 없음
  us2y: generateDummyTimeSeries(4.85, 0.01),
  us10y: generateDummyTimeSeries(4.72, 0.008),
  spread2y10y: generateSpreadTimeSeries(), // 특수 패턴
  bokRate: generateDummyTimeSeries(2.75, 0.001),
  kr10y: generateDummyTimeSeries(3.45, 0.01),
  jp10y: generateDummyTimeSeries(0.72, 0.015),

  // 환율
  usdKrw: generateDummyTimeSeries(1285, 0.012),
  dxy: generateDummyTimeSeries(104.8, 0.008),
  usdJpy: generateDummyTimeSeries(158.3, 0.015),
  eurUsd: generateDummyTimeSeries(1.072, 0.01),

  // 원자재
  wti: generateDummyTimeSeries(82.4, 0.03),
  gold: generateDummyTimeSeries(3150, 0.015),
  silver: generateDummyTimeSeries(31.2, 0.025),

  // 유동성
  fedAssets: generateDummyTimeSeries(6.8, 0.003),
  tga: generateDummyTimeSeries(8200, 0.05),
  rrp: generateDummyTimeSeries(3800, 0.04),
  netLiquidity: generateDummyTimeSeries(5.2, 0.02),

  // 크레딧
  hyOas: generateDummyTimeSeries(420, 0.04),
  igOas: generateDummyTimeSeries(128, 0.03),
  koreaCds: generateDummyTimeSeries(58, 0.05),

  // 경제지표
  cpiUs: generateDummyTimeSeries(3.1, 0.03),
  pceUs: generateDummyTimeSeries(2.8, 0.03),
  trimmedPce: generateDummyTimeSeries(2.4, 0.02),
  ppiUs: generateDummyTimeSeries(2.9, 0.04),
  unemployment: generateDummyTimeSeries(4.1, 0.02),
  pmi: generateDummyTimeSeries(49.8, 0.03),
  gdpUs: generateDummyTimeSeries(2.4, 0.05),
  cpiKr: generateDummyTimeSeries(2.6, 0.03),
};
