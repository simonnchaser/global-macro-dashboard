/**
 * 더미 데이터 (2026.06 기준)
 */

import type { MetricValue, MetricId } from '../metrics/metricsTypes';

export const mockMetricsData: Record<MetricId, MetricValue> = {
  // 증시
  sp500:            { value: 4950.5,  change: +0.92 },
  nasdaq:           { value: 15620.3, change: +0.81 },
  kospi:            { value: 2680.5,  change: -0.46 },
  kosdaq:           { value: 865.2,   change: -0.59 },
  foreignNetBuy:    { value: -1250,   change: null },   // 억원
  foreignOwnership: { value: 32.5,    change: -0.3 },   // %
  fearGreed:        { value: 62,      change: +4 },     // 중립
  cpRatio:          { value: 0.68,    change: -0.05 },

  // 금리·채권
  fedRate:          { value: 3.625,   change: 0 },
  us2y:             { value: 4.85,    change: +0.03 },
  us10y:            { value: 4.72,    change: +0.01 },
  spread2y10y:      { value: -13,     change: -2 },     // bp, 음수=역전
  bokRate:          { value: 2.75,    change: 0 },
  kr10y:            { value: 3.45,    change: +0.02 },
  jp10y:            { value: 0.72,    change: +0.04 },

  // 환율
  usdKrw:           { value: 1285.5,  change: +8.5 },
  dxy:              { value: 104.8,   change: +0.3 },
  usdJpy:           { value: 158.3,   change: +0.8 },
  eurUsd:           { value: 1.072,   change: -0.003 },

  // 원자재
  wti:              { value: 82.4,    change: -0.8 },
  gold:             { value: 3150,    change: +12 },
  silver:           { value: 31.2,    change: +0.4 },

  // 유동성
  fedAssets:        { value: 6.8,     change: -0.05 },  // 조달러
  tga:              { value: 8200,    change: +320 },   // 억달러
  rrp:              { value: 3800,    change: -150 },   // 억달러
  netLiquidity:     { value: 5.2,     change: -0.15 },  // 조달러

  // 크레딧
  hyOas:            { value: 420,     change: +15 },    // bp
  igOas:            { value: 128,     change: +4 },     // bp
  koreaCds:         { value: 58,      change: +2 },     // bp

  // 경제지표
  cpiUs:            { value: 3.1,     change: -0.1 },
  pceUs:            { value: 2.8,     change: -0.1 },
  trimmedPce:       { value: 2.4,     change: 0 },
  ppiUs:            { value: 2.9,     change: +0.2 },
  unemployment:     { value: 4.1,     change: +0.1 },
  pmi:              { value: 49.8,    change: -0.5 },   // 50 기준선
  gdpUs:            { value: 2.4,     change: -0.1 },
  cpiKr:            { value: 2.6,     change: +0.1 },
};
