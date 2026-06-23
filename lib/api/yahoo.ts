import type { YahooMetricId } from '@/lib/types/metrics'

export const YAHOO_SYMBOLS: Record<YahooMetricId, string> = {
  // 증시
  sp500:   '^GSPC',
  nasdaq:  '^IXIC',
  kospi:   '^KS11',
  kosdaq:  '^KQ11',
  // 국제 환율 (FRED에서 이전)
  dxy:     'DX-Y.NYB',
  eurUsd:  'EURUSD=X',
  usdJpy:  'JPY=X',
  usdCny:  'CNY=X',
  // 원자재 (FRED에서 이전)
  gold:    'GC=F',
  silver:  'SI=F',
  wti:     'CL=F',
  brent:   'BZ=F',
  natgas:  'NG=F',
  copper:  'HG=F',
}

// period → Yahoo range 변환
export function periodToYahooRange(period: string): string {
  const map: Record<string, string> = {
    '1M': '1mo',
    '3M': '3mo',
    '6M': '6mo',
    '1Y': '1y',
    '3Y': '3y',
    '5Y': '5y',
    'MAX': 'max',
  }
  return map[period] ?? '3mo'
}
