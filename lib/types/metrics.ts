export type FredMetricId =
  | 'fedRate'
  | 'us2y'
  | 'us10y'
  | 'fedAssets'
  | 'tga'
  | 'rrp'
  | 'hyOas'
  | 'igOas'
  | 'cpiUs'
  | 'pceUs'
  | 'corePce'
  | 'trimmedPce'
  | 'ppiUs'
  | 'unemployment'
  | 'gdpUs'
  | 'spread2y10y'
  | 'netLiquidity'

export interface TimeSeriesPoint {
  time: string
  value: number
}

export interface MetricSnapshot {
  id: FredMetricId
  value: number
  change: number
  changePercent: number
  updatedAt: string
}

export interface FredApiResponse {
  metricId: FredMetricId
  timeSeries: TimeSeriesPoint[]
  latestValue: number
  latestDate: string
}

// ECOS 지표 ID
export type EcosMetricId =
  // ECOS 직접 fetch
  | 'bokRate'
  | 'kr3y'
  | 'kr10y'
  | 'cpiKr'
  | 'unemploymentKr'
  | 'krCorpAA'
  | 'krCorpBBB'
  | 'krFxReserves'  // 한국 외환보유액
  // 계산 지표
  | 'krIgSpread'   // (krCorpAA - kr3y) × 100 (bp)
  | 'krHySpread'   // (krCorpBBB - kr3y) × 100 (bp)

export interface EcosMetricSnapshot {
  id: EcosMetricId
  value: number
  change: number
  changePercent: number
  updatedAt: string
}

export interface EcosApiResponse {
  metricId: EcosMetricId
  timeSeries: TimeSeriesPoint[]
  latestValue: number
  latestDate: string
}
