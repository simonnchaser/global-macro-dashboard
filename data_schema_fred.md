# FRED 데이터 스키마
## Global Macro Dashboard — FRED 지표 전용

---

## 1. 핵심 타입 정의

```typescript
// /lib/types/metrics.ts

// ─────────────────────────────────────────
// FRED로 가져오는 지표 ID만
// ─────────────────────────────────────────
export type FredMetricId =
  // 금리·채권
  | 'fedRate'       // FEDFUNDS
  | 'us2y'          // DGS2
  | 'us10y'         // DGS10
  // 유동성
  | 'fedAssets'     // WALCL
  | 'tga'           // WTREGEN
  | 'rrp'           // WLRRAL
  // 크레딧
  | 'hyOas'         // BAMLH0A0HYM2
  | 'igOas'         // BAMLC0A0CM
  // 경제지표
  | 'cpiUs'         // CPIAUCSL
  | 'pceUs'         // PCEPI
  | 'corePce'       // PCEPILFE
  | 'trimmedPce'    // PCETRIM
  | 'ppiUs'         // PPIACO
  | 'unemployment'  // UNRATE
  | 'gdpUs'         // A191RL1Q225SBEA

// ─────────────────────────────────────────
// 차트 데이터 포인트 — lightweight-charts 요구사항
// ─────────────────────────────────────────
export interface TimeSeriesPoint {
  time: string    // 'YYYY-MM-DD' (EST 기준 고정)
  value: number
}

// ─────────────────────────────────────────
// 카드에 표시되는 현재값 스냅샷
// ─────────────────────────────────────────
export interface MetricSnapshot {
  id: FredMetricId
  value: number           // 변환 후 최종값 (UI 단위)
  change: number          // 전일(또는 직전 포인트) 대비 절대값 변화
  changePercent: number   // 전일 대비 % 변화
  updatedAt: string       // 'YYYY-MM-DD' (마지막 데이터 날짜)
}

// ─────────────────────────────────────────
// API Route 응답 형태 (서버 → 클라이언트)
// ─────────────────────────────────────────
export interface FredApiResponse {
  metricId: FredMetricId
  timeSeries: TimeSeriesPoint[]
  latestValue: number
  latestDate: string
}
```

---

## 2. FRED Series ID + 단위 변환 매핑

```typescript
// /lib/api/fred.ts

// Series ID 매핑
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
  trimmedPce:   'PCETRIM',
  ppiUs:        'PPIACO',
  unemployment: 'UNRATE',
  gdpUs:        'A191RL1Q225SBEA',
}

// units 파라미터 — pc1이 필요한 지표 (지수 → YoY%)
export const FRED_PC1_UNITS = new Set<FredMetricId>([
  'cpiUs', 'pceUs', 'corePce', 'ppiUs'
  // trimmedPce, unemployment, gdpUs는 이미 % 형태 → lin
])

// 단위 변환 함수
export function convertFredValue(id: FredMetricId, raw: number): number {
  switch (id) {
    case 'fedAssets': return raw / 1_000_000  // 백만달러 → 조달러
    case 'tga':       return raw / 10          // 백만달러 → 억달러
    case 'rrp':       return raw / 10          // 백만달러 → 억달러
    case 'hyOas':     return raw * 100         // % → bp
    case 'igOas':     return raw * 100         // % → bp
    default:          return raw               // 그대로
  }
}
```

### 단위 변환 표

| MetricId | FRED 단위 | UI 단위 | 변환 | units 파라미터 |
|----------|-----------|---------|------|----------------|
| `fedRate` | % | % | 없음 | lin |
| `us2y` | % | % | 없음 | lin |
| `us10y` | % | % | 없음 | lin |
| `fedAssets` | 백만달러 | 조달러 | ÷ 1,000,000 | lin |
| `tga` | 백만달러 | 억달러 | ÷ 10 | lin |
| `rrp` | 백만달러 | 억달러 | ÷ 10 | lin |
| `hyOas` | % | bp | × 100 | lin |
| `igOas` | % | bp | × 100 | lin |
| `cpiUs` | 지수 | YoY% | FRED가 처리 | **pc1** |
| `pceUs` | 지수 | YoY% | FRED가 처리 | **pc1** |
| `corePce` | 지수 | YoY% | FRED가 처리 | **pc1** |
| `trimmedPce` | % | % | 없음 | lin |
| `ppiUs` | 지수 | YoY% | FRED가 처리 | **pc1** |
| `unemployment` | % | % | 없음 | lin |
| `gdpUs` | % | % | 없음 | lin |

---

## 3. 날짜 변환 규칙

```typescript
// /lib/utils/dateUtils.ts

// FRED 응답: 이미 'YYYY-MM-DD' 문자열 (EST 기준)
// → 변환 없이 그대로 사용

// 기간별 observation_start 계산
export function getObservationStart(period: string): string {
  if (period === 'MAX') return '1900-01-01'

  const months: Record<string, number> = {
    '1M': 1, '3M': 3, '6M': 6,
    '1Y': 12, '3Y': 36, '5Y': 60,
  }

  const now = new Date()
  now.setMonth(now.getMonth() - (months[period] ?? 3))
  return now.toISOString().split('T')[0]
}
```

---

## 4. API Route (`/app/api/fred/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import {
  FRED_SERIES,
  FRED_PC1_UNITS,
  convertFredValue,
} from '@/lib/api/fred'
import { getObservationStart } from '@/lib/utils/dateUtils'
import type { FredMetricId, TimeSeriesPoint, FredApiResponse } from '@/lib/types/metrics'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const metricId = searchParams.get('metricId') as FredMetricId
  const period   = searchParams.get('period') || '3M'

  const seriesId = FRED_SERIES[metricId]
  if (!seriesId) {
    return NextResponse.json({ error: `Unknown metricId: ${metricId}` }, { status: 400 })
  }

  const apiKey = process.env.FRED_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'FRED_API_KEY not set' }, { status: 500 })
  }

  const params = new URLSearchParams({
    series_id:         seriesId,
    api_key:           apiKey,
    file_type:         'json',
    sort_order:        'asc',
    observation_start: getObservationStart(period),
    units:             FRED_PC1_UNITS.has(metricId) ? 'pc1' : 'lin',
  })

  try {
    const res = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?${params}`,
      { next: { revalidate: getCacheTime(metricId) } }
    )
    if (!res.ok) throw new Error(`FRED ${res.status}`)

    const data = await res.json()

    // 결측값(".")  제거 + 단위 변환
    const timeSeries: TimeSeriesPoint[] = data.observations
      .filter((o: { date: string; value: string }) => o.value !== '.')
      .map((o: { date: string; value: string }) => ({
        time:  o.date,  // 이미 'YYYY-MM-DD' (EST 기준)
        value: convertFredValue(metricId, parseFloat(o.value)),
      }))

    const latest = timeSeries[timeSeries.length - 1]

    const response: FredApiResponse = {
      metricId,
      timeSeries,
      latestValue: latest?.value ?? 0,
      latestDate:  latest?.time  ?? '',
    }

    return NextResponse.json(response)

  } catch (err) {
    console.error(`FRED fetch error [${metricId}]:`, err)
    return NextResponse.json({ error: 'FRED fetch failed' }, { status: 500 })
  }
}

// 업데이트 주기에 맞는 캐시 시간 (초)
function getCacheTime(id: FredMetricId): number {
  const weekly  = new Set<FredMetricId>(['fedAssets', 'tga', 'rrp'])
  const monthly = new Set<FredMetricId>(['fedRate', 'cpiUs', 'pceUs', 'corePce', 'trimmedPce', 'ppiUs', 'unemployment'])
  const quarterly = new Set<FredMetricId>(['gdpUs'])

  if (weekly.has(id))    return 43200   // 12시간
  if (monthly.has(id))   return 86400   // 24시간
  if (quarterly.has(id)) return 86400   // 24시간
  return 3600                           // 1시간 (일별: us2y, us10y, hyOas, igOas)
}
```

---

## 5. 파이프라인 — API → 훅 → 컴포넌트

```
FRED API
  ↓ observations (date: string, value: string)
/app/api/fred/route.ts
  ↓ 결측값 제거, 단위 변환, 날짜 그대로 사용
FredApiResponse { timeSeries, latestValue, latestDate }
  ↓
useMetrics(id, period)
  ↓ change / changePercent 계산
  ↓ 에러 시 mockData fallback
  ├─ MetricSnapshot   → MetricCard (현재값·변화량 표시)
  └─ TimeSeriesPoint[] → ChartModal / CompareTab (차트)
```

### change 계산 — 훅 안에서 처리

```typescript
// /lib/hooks/useMetrics.ts 내부

function buildSnapshot(
  id: FredMetricId,
  timeSeries: TimeSeriesPoint[]
): MetricSnapshot {
  const latest = timeSeries[timeSeries.length - 1]
  const prev   = timeSeries[timeSeries.length - 2]

  const change        = prev ? latest.value - prev.value : 0
  const changePercent = prev ? (change / prev.value) * 100 : 0

  return {
    id,
    value:         latest.value,
    change:        Math.round(change * 1000) / 1000,
    changePercent: Math.round(changePercent * 100) / 100,
    updatedAt:     latest.time,
  }
}
```

### 컴포넌트에서 사용하는 형태

```typescript
// MetricCard.tsx
const { snapshot, isLoading } = useMetricSnapshot('hyOas', '3M')
// snapshot.value         → 420      (bp)
// snapshot.change        → +15      (bp)
// snapshot.changePercent → +3.7     (%)
// snapshot.updatedAt     → '2026-06-11'

// ChartModal.tsx / CompareTab.tsx
const { timeSeries, isLoading } = useMetricTimeSeries('hyOas', '3M')
// timeSeries → [{ time: '2026-03-11', value: 380 }, ...]
```

---

## 6. 훅 인터페이스

```typescript
// /lib/hooks/useMetrics.ts 가 export할 것들

// 카드용 — 현재값 스냅샷
export function useMetricSnapshot(
  id: FredMetricId,
  period: string
): { snapshot: MetricSnapshot | null; isLoading: boolean; error: string | null }

// 차트용 — 시계열
export function useMetricTimeSeries(
  id: FredMetricId,
  period: string
): { timeSeries: TimeSeriesPoint[]; isLoading: boolean; error: string | null }

// 에러 시 동작:
// 1. console.warn 로그
// 2. mockData에서 해당 id의 값으로 fallback
// 3. isLoading: false, error: '...' 반환
```

---

## 7. mockData 구조 (fallback용)

```typescript
// /lib/mock/mockData.ts

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
}
```

---

## 8. Claude Code 지시사항

```
이 문서 기준으로 FRED 연동 구현.

파일 생성/교체 순서:
1. /lib/types/metrics.ts         → 섹션 1 타입 정의
2. /lib/utils/dateUtils.ts       → 섹션 3 날짜 유틸
3. /lib/api/fred.ts              → 섹션 2 매핑 + 변환 함수
4. /app/api/fred/route.ts        → 섹션 4 Route 구현
5. /lib/mock/mockData.ts         → 섹션 7 더미 데이터
6. /lib/hooks/useMetrics.ts      → 섹션 6 인터페이스대로 구현

규칙:
- FredMetricId 외 id 만들지 말 것
- 컴포넌트에서 mockData 직접 import 금지
- change/changePercent는 훅 안에서 timeSeries 마지막 두 포인트로 계산
- 에러 시 반드시 mockData fallback
- API 키는 서버사이드에서만 (route.ts), 클라이언트 노출 금지
- FRED date는 변환 없이 그대로 사용 ('YYYY-MM-DD')
```
