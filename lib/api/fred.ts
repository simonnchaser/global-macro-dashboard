import type { FredMetricId } from '@/lib/types/metrics'

// 환율·원자재는 Yahoo Finance로 이전
// FRED는 금리·채권, 유동성, 경제지표만 담당
export const FRED_SERIES: Record<FredMetricId, string> = {
  fedRate:      'FEDFUNDS',
  us2y:         'DGS2',
  us10y:        'DGS10',
  fedAssets:    'WALCL',
  tga:          'WTREGEN',
  rrp:          'WLRRAL',
  hyOas:        'BAMLH0A0HYM2',
  igOas:        'BAMLC0A0CM',
  cpiUs:        'CPIAUCSL',
  pceUs:        'PCEPI',
  corePce:      'PCEPILFE',
  trimmedPce:   'PCETRIM12M159SFRBDAL',
  ppiUs:        'PPIFID',
  unemployment: 'UNRATE',
  gdpUs:        'A191RL1Q225SBEA',
}

export const FRED_PC1_UNITS = new Set<FredMetricId>([
  'cpiUs', 'pceUs', 'corePce', 'ppiUs'
])

export function convertFredValue(id: FredMetricId, raw: number): number {
  switch (id) {
    case 'fedAssets': return raw / 1_000_000  // Millions → Trillions
    case 'tga':       return raw / 100        // Millions → 억달러 (1억 = 100M)
    case 'rrp':       return raw / 100        // Millions → 억달러 (1억 = 100M)
    case 'hyOas':     return raw * 100        // % → bp
    case 'igOas':     return raw * 100        // % → bp
    default:          return raw
  }
}
