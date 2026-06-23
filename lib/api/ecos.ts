import type { EcosMetricId } from '@/lib/types/metrics'

interface EcosSeriesConfig {
  statCode: string
  itemCode: string
  itemCode2?: string  // 두 번째 항목코드 (계절조정 등)
  cycle: 'A' | 'Q' | 'M' | 'D'
  needsYoY: boolean
}

// 직접 fetch 지표만 포함 (계산 지표 제외)
export const ECOS_SERIES: Partial<Record<EcosMetricId, EcosSeriesConfig>> = {
  bokRate:        { statCode: '722Y001', itemCode: '0101000',   cycle: 'M', needsYoY: false },
  kr3y:           { statCode: '817Y002', itemCode: '010200000', cycle: 'D', needsYoY: false },
  kr10y:          { statCode: '817Y002', itemCode: '010210000', cycle: 'D', needsYoY: false },
  cpiKr:          { statCode: '901Y009', itemCode: '0',         cycle: 'M', needsYoY: true  },
  unemploymentKr: { statCode: '901Y027', itemCode: 'I61BC', itemCode2: 'I28B', cycle: 'M', needsYoY: false },
  krCorpAA:       { statCode: '817Y002', itemCode: '010300000', cycle: 'D', needsYoY: false },
  krCorpBBB:      { statCode: '817Y002', itemCode: '010320000', cycle: 'D', needsYoY: false },
  krFxReserves:   { statCode: '902Y014', itemCode: 'KR',        cycle: 'M', needsYoY: false },
  gdpKr:          { statCode: '902Y015', itemCode: 'KOR',       cycle: 'Q', needsYoY: false },
  ppiKr:          { statCode: '404Y014', itemCode: '*AA',       cycle: 'M', needsYoY: true  },
  industrialKr:   { statCode: '902Y020', itemCode: 'KOR',       cycle: 'M', needsYoY: false },
  // 환율
  usdKrw:         { statCode: '731Y001', itemCode: '0000001',   cycle: 'D', needsYoY: false },
  eurKrw:         { statCode: '731Y001', itemCode: '0000003',   cycle: 'D', needsYoY: false },
  jpyKrw:         { statCode: '731Y001', itemCode: '0000002',   cycle: 'D', needsYoY: false },
  cnyKrw:         { statCode: '731Y001', itemCode: '0000053',   cycle: 'D', needsYoY: false },
}

// 계산 지표 목록
export const ECOS_CALCULATED = new Set<EcosMetricId>(['krSpread3y10y', 'krIgSpread', 'krHySpread'])
