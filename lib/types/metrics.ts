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

// Yahoo Finance 지표 ID (증시, 국제환율, 원자재)
export type YahooMetricId =
  // 증시
  | 'sp500'
  | 'nasdaq'
  | 'kospi'
  | 'kosdaq'
  // 국제 환율 (FRED에서 Yahoo로 이전)
  | 'dxy'           // 달러인덱스
  | 'eurUsd'        // EUR/USD
  | 'usdJpy'        // USD/JPY
  | 'usdCny'        // USD/CNY
  // 원자재 (FRED에서 Yahoo로 이전)
  | 'gold'          // 금
  | 'silver'        // 은
  | 'wti'           // WTI 원유
  | 'brent'         // 브렌트유
  | 'natgas'        // 천연가스
  | 'copper'        // 구리

export interface TimeSeriesPoint {
  time: string | number  // 일봉: 'YYYY-MM-DD', 1분봉: Unix timestamp
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
  | 'gdpKr'         // 한국 GDP 성장률 (분기)
  | 'ppiKr'         // 한국 생산자물가지수 (월)
  | 'industrialKr'  // 한국 산업생산지수 (월)
  // 환율 (ECOS)
  | 'usdKrw'        // 달러/원 (매매기준율)
  | 'eurKrw'        // 유로/원
  | 'jpyKrw'        // 엔/원 (100엔)
  | 'cnyKrw'        // 위안/원 (매매기준율)
  // 계산 지표
  | 'krSpread3y10y' // (kr10y - kr3y) × 100 (bp)
  | 'krIgSpread'    // (krCorpAA - kr3y) × 100 (bp)
  | 'krHySpread'    // (krCorpBBB - kr3y) × 100 (bp)

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

// Yahoo API 응답
export interface YahooApiResponse {
  metricId: YahooMetricId
  timeSeries: TimeSeriesPoint[]
  latestValue: number      // 전일 종가 (안정적인 데이터)
  latestDate: string       // 전일 날짜
  previousClose: number    // 전전일 종가
  timezone?: string        // 시간대 표시 (예: "KST", "EDT", "UTC")
  realtime?: {             // 실시간 데이터 (모달용)
    price: number          // 현재가
    time: number | null    // Unix timestamp
    isMarketOpen: boolean  // 장중 여부
  }
}
