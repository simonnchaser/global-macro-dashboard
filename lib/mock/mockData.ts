import type { FredMetricId, MetricSnapshot } from '@/lib/types/metrics'

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
