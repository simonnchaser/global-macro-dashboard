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
}

// 계산 지표 목록
export const ECOS_CALCULATED = new Set<EcosMetricId>(['krIgSpread', 'krHySpread'])
