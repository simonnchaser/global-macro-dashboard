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

// Yahoo Finance 지표 ID (증시, 환율, 원자재)
export type YahooMetricId =
  // 증시
  | 'sp500'
  | 'nasdaq'
  | 'kospi'
  | 'kosdaq'
  | 'sse'          // 상해종합지수 (Shanghai Composite)
  // 국제 환율
  | 'dxy'           // 달러인덱스
  | 'eurUsd'        // EUR/USD
  | 'usdJpy'        // USD/JPY
  | 'usdCny'        // USD/CNY
  // 원화 환율 (ECOS에서 Yahoo로 이전)
  | 'usdKrw'        // USD/KRW
  | 'eurKrw'        // EUR/KRW
  | 'jpyKrw'        // JPY/KRW (100엔)
  | 'cnyKrw'        // CNY/KRW
  // 원자재
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
  id: FredMetricId | YahooMetricId | EcosMetricId
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
  // 원화 환율은 Yahoo로 이전 (usdKrw, eurKrw, jpyKrw, cnyKrw 제거)
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
