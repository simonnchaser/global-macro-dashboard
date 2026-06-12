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
