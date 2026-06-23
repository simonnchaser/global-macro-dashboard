import type { FredMetricId, MetricSnapshot, EcosMetricId, EcosMetricSnapshot, YahooMetricId } from '@/lib/types/metrics'

export const mockSnapshots: Record<FredMetricId, MetricSnapshot> = {
  fedRate:      { id: 'fedRate',      value: 3.625, change: 0,     changePercent: 0,     updatedAt: '2026-06-11' },
  us2y:         { id: 'us2y',         value: 4.85,  change: +0.03, changePercent: +0.62, updatedAt: '2026-06-11' },
  us10y:        { id: 'us10y',        value: 4.72,  change: +0.01, changePercent: +0.21, updatedAt: '2026-06-11' },
  fedAssets:    { id: 'fedAssets',    value: 6.8,   change: -0.05, changePercent: -0.73, updatedAt: '2026-06-11' },
  tga:          { id: 'tga',          value: 8200,  change: +320,  changePercent: +4.06, updatedAt: '2026-06-11' },
  rrp:          { id: 'rrp',          value: 3800,  change: -150,  changePercent: -3.80, updatedAt: '2026-06-11' },
  hyOas:        { id: 'hyOas',        value: 420,   change: +15,   changePercent: +3.70, updatedAt: '2026-06-11' },
  igOas:        { id: 'igOas',        value: 128,   change: +4,    changePercent: +3.23, updatedAt: '2026-06-11' },
  cpiUs:        { id: 'cpiUs',        value: 3.1,   change: -0.1,  changePercent: 0,     updatedAt: '2026-06-11' },
  pceUs:        { id: 'pceUs',        value: 2.8,   change: -0.1,  changePercent: 0,     updatedAt: '2026-06-11' },
  corePce:      { id: 'corePce',      value: 2.6,   change: 0,     changePercent: 0,     updatedAt: '2026-06-11' },
  trimmedPce:   { id: 'trimmedPce',   value: 2.4,   change: 0,     changePercent: 0,     updatedAt: '2026-06-11' },
  ppiUs:        { id: 'ppiUs',        value: 2.9,   change: +0.2,  changePercent: 0,     updatedAt: '2026-06-11' },
  unemployment: { id: 'unemployment', value: 4.1,   change: +0.1,  changePercent: 0,     updatedAt: '2026-06-11' },
  gdpUs:        { id: 'gdpUs',        value: 2.4,   change: -0.1,  changePercent: 0,     updatedAt: '2026-06-11' },
  spread2y10y:  { id: 'spread2y10y',  value: -0.13, change: -0.02, changePercent: 0,     updatedAt: '2026-06-11' },
  netLiquidity: { id: 'netLiquidity', value: 5.58,  change: +0.05, changePercent: +0.90, updatedAt: '2026-06-11' },
}

// Yahoo Finance 지표 mock data (증시, 국제환율, 원자재)
export const mockYahooSnapshots: Record<YahooMetricId, MetricSnapshot> = {
  // 증시
  sp500:   { id: 'sp500',   value: 5234.2,  change: +44.9,  changePercent: +0.87, updatedAt: '2026-06-17' },
  nasdaq:  { id: 'nasdaq',  value: 16340.8, change: +125.3, changePercent: +0.77, updatedAt: '2026-06-17' },
  kospi:   { id: 'kospi',   value: 2680.5,  change: +18.2,  changePercent: +0.68, updatedAt: '2026-06-17' },
  kosdaq:  { id: 'kosdaq',  value: 840.3,   change: +6.5,   changePercent: +0.78, updatedAt: '2026-06-17' },
  // 국제 환율
  dxy:     { id: 'dxy',     value: 105.8,   change: +0.6,   changePercent: +0.57, updatedAt: '2026-06-17' },
  eurUsd:  { id: 'eurUsd',  value: 1.0745,  change: -0.0055, changePercent: -0.51, updatedAt: '2026-06-17' },
  usdJpy:  { id: 'usdJpy',  value: 158.2,   change: +0.7,   changePercent: +0.44, updatedAt: '2026-06-17' },
  usdCny:  { id: 'usdCny',  value: 7.28,    change: +0.02,  changePercent: +0.28, updatedAt: '2026-06-17' },
  // 원자재
  gold:    { id: 'gold',    value: 2348.5,  change: +8.5,   changePercent: +0.36, updatedAt: '2026-06-17' },
  silver:  { id: 'silver',  value: 29.85,   change: +0.35,  changePercent: +1.19, updatedAt: '2026-06-17' },
  wti:     { id: 'wti',     value: 78.2,    change: -0.3,   changePercent: -0.38, updatedAt: '2026-06-17' },
  brent:   { id: 'brent',   value: 82.1,    change: -0.2,   changePercent: -0.24, updatedAt: '2026-06-17' },
  natgas:  { id: 'natgas',  value: 2.92,    change: +0.07,  changePercent: +2.46, updatedAt: '2026-06-17' },
  copper:  { id: 'copper',  value: 9920,    change: +70,    changePercent: +0.71, updatedAt: '2026-06-17' },
}

export const mockEcosSnapshots: Record<EcosMetricId, EcosMetricSnapshot> = {
  bokRate:        { id: 'bokRate',        value: 2.75,  change: 0,     changePercent: 0,     updatedAt: '2026-05-01' },
  kr3y:           { id: 'kr3y',           value: 3.20,  change: +0.02, changePercent: +0.63, updatedAt: '2026-06-10' },
  kr10y:          { id: 'kr10y',          value: 3.45,  change: +0.02, changePercent: +0.58, updatedAt: '2026-06-10' },
  cpiKr:          { id: 'cpiKr',          value: 2.6,   change: +0.1,  changePercent: 0,     updatedAt: '2026-05-01' },
  unemploymentKr: { id: 'unemploymentKr', value: 3.1,   change: 0,     changePercent: 0,     updatedAt: '2026-05-01' },
  krCorpAA:       { id: 'krCorpAA',       value: 3.85,  change: +0.01, changePercent: +0.26, updatedAt: '2026-06-10' },
  krCorpBBB:      { id: 'krCorpBBB',      value: 7.20,  change: +0.05, changePercent: +0.70, updatedAt: '2026-06-10' },
  krFxReserves:   { id: 'krFxReserves',   value: 4150,  change: -12,   changePercent: -0.29, updatedAt: '2026-04-01' },
  gdpKr:          { id: 'gdpKr',          value: 1.831, change: +1.94, changePercent: 0,     updatedAt: '2026-01-01' },  // 2026Q1
  ppiKr:          { id: 'ppiKr',          value: 6.9,   change: +2.75, changePercent: 0,     updatedAt: '2026-04-01' },
  industrialKr:   { id: 'industrialKr',   value: 125.1, change: -0.9,  changePercent: -0.71, updatedAt: '2026-04-01' },
  // 환율 (ECOS)
  usdKrw:         { id: 'usdKrw',         value: 1466,  change: +15.2, changePercent: +1.05, updatedAt: '2026-06-11' },
  eurKrw:         { id: 'eurKrw',         value: 1585,  change: +8.5,  changePercent: +0.54, updatedAt: '2026-06-11' },
  jpyKrw:         { id: 'jpyKrw',         value: 930,   change: -5.3,  changePercent: -0.57, updatedAt: '2026-06-11' },  // 100엔
  cnyKrw:         { id: 'cnyKrw',         value: 228,   change: +3.6,  changePercent: +1.60, updatedAt: '2026-06-08' },
  // 계산 지표
  krSpread3y10y:  { id: 'krSpread3y10y',  value: 45.1,  change: +0.5,  changePercent: +1.12, updatedAt: '2026-06-10' },
  krIgSpread:     { id: 'krIgSpread',     value: 65,    change: +1,    changePercent: +1.56, updatedAt: '2026-06-10' },
  krHySpread:     { id: 'krHySpread',     value: 395,   change: +5,    changePercent: +1.28, updatedAt: '2026-06-10' },
}
