# Yahoo Finance 데이터 스키마
## Global Macro Dashboard — Yahoo Finance 지표 전용

---

## 1. 우리가 Yahoo Finance로 불러올 지표

### 증시

| MetricId | 지표명 | Yahoo 심볼 | 단위 |
|----------|--------|-----------|------|
| `sp500` | S&P 500 | `^GSPC` | pt |
| `nasdaq` | NASDAQ | `^IXIC` | pt |
| `kospi` | KOSPI | `^KS11` | pt |
| `kosdaq` | KOSDAQ | `^KQ11` | pt |

### 국제 환율 (FRED에서 Yahoo로 전환)

| MetricId | 지표명 | Yahoo 심볼 | 단위 | 비고 |
|----------|--------|-----------|------|------|
| `dxy` | DXY 달러 인덱스 | `DX-Y.NYB` | pt | FRED DTWEXBGS → Yahoo |
| `eurUsd` | EUR/USD | `EURUSD=X` | $ | FRED DEXUSEU → Yahoo |
| `usdJpy` | USD/JPY | `JPY=X` | 엔 | FRED DEXJPUS → Yahoo |
| `usdCny` | USD/CNY | `CNY=X` | 위안 | FRED DEXCHUS → Yahoo |

### 원자재 (FRED에서 Yahoo로 전환)

| MetricId | 지표명 | Yahoo 심볼 | 단위 | 비고 |
|----------|--------|-----------|------|------|
| `gold` | 금 | `GC=F` | $/oz | FRED 제거됨 → Yahoo |
| `silver` | 은 | `SI=F` | $/oz | FRED → Yahoo |
| `wti` | WTI 원유 | `CL=F` | $/bbl | Yahoo가 더 최신 |
| `brent` | 브렌트유 | `BZ=F` | $/bbl | Yahoo |
| `natgas` | 천연가스 | `NG=F` | $/MMBtu | Yahoo |
| `copper` | 구리 | `HG=F` | $/lb | Yahoo |

> **원화 기준 환율 (usdKrw, eurKrw, jpyKrw, cnyKrw)은 ECOS에서 가져옴**
> Yahoo의 KRW=X는 정확도가 낮아 ECOS 731Y001이 더 신뢰할 수 있음

---

## 2. API 엔드포인트

```
GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
  ?interval=1d
  &range={range}

또는 기간을 Unix timestamp로:
  ?interval=1d
  &period1={startTimestamp}
  &period2={endTimestamp}
```

### range 파라미터 — period 매핑

| 대시보드 period | Yahoo range | 비고 |
|----------------|-------------|------|
| `1M` | `1mo` | |
| `3M` | `3mo` | |
| `6M` | `6mo` | |
| `1Y` | `1y` | |
| `3Y` | `3y` | |
| `5Y` | `5y` | |
| `MAX` | `max` | |

### 필수 헤더

```typescript
headers: {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}
// User-Agent 없으면 403 에러 발생
```

---

## 3. 응답 구조

```json
{
  "chart": {
    "result": [{
      "meta": {
        "symbol": "^GSPC",
        "regularMarketPrice": 5234.18,
        "chartPreviousClose": 5189.26,
        "currency": "USD"
      },
      "timestamp": [1709251200, 1709337600, ...],
      "indicators": {
        "quote": [{
          "open":   [5180.1, 5190.2, ...],
          "high":   [5240.3, 5210.1, ...],
          "low":    [5175.2, 5185.0, ...],
          "close":  [5234.5, 5189.3, ...],
          "volume": [3234000, 2890000, ...]
        }],
        "adjclose": [{
          "adjclose": [5234.5, 5189.3, ...]
        }]
      }
    }],
    "error": null
  }
}
```

**우리가 쓸 필드:**
- `meta.regularMarketPrice` → 현재 실시간 가격 (snapshot.value)
- `meta.chartPreviousClose` → 전일 종가 (change 계산용)
- `timestamp[]` → Unix timestamp 배열
- `indicators.quote[0].close[]` → 종가 배열 (시계열)

---

## 4. 타입 정의 추가 (`/lib/types/metrics.ts`)

```typescript
// Yahoo Finance 지표 ID
export type YahooMetricId =
  // 증시
  | 'sp500'
  | 'nasdaq'
  | 'kospi'
  | 'kosdaq'
  // 국제 환율 (FRED에서 이전)
  | 'dxy'
  | 'eurUsd'
  | 'usdJpy'
  | 'usdCny'
  // 원자재 (FRED에서 이전)
  | 'gold'
  | 'silver'
  | 'wti'
  | 'brent'
  | 'natgas'
  | 'copper'

// Yahoo API Route 응답
export interface YahooApiResponse {
  metricId: YahooMetricId
  timeSeries: TimeSeriesPoint[]
  latestValue: number
  latestDate: string
  previousClose: number
}
```

---

## 5. 심볼 매핑 (`/lib/api/yahoo.ts`)

```typescript
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
```

---

## 6. 날짜 변환 (`/lib/utils/dateUtils.ts`에 추가)

```typescript
// EST = UTC-5 고정
// Yahoo Finance 심볼은 미국 시장 기준 (EST)
// KOSPI 등 한국 심볼도 Yahoo가 EST 기준 timestamp로 줌
// → 모든 Yahoo timestamp를 EST 기준으로 변환해서 통일

const EST_OFFSET = -5 * 60 * 60 * 1000  // UTC-5

export function yahooTimestampToDate(timestamp: number): string {
  const estDate = new Date(timestamp * 1000 + EST_OFFSET)
  return estDate.toISOString().split('T')[0]  // 'YYYY-MM-DD'
}
```

---

## 7. API Route (`/app/api/yahoo/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { YAHOO_SYMBOLS, periodToYahooRange } from '@/lib/api/yahoo'
import { yahooTimestampToDate } from '@/lib/utils/dateUtils'
import type { YahooMetricId, TimeSeriesPoint, YahooApiResponse } from '@/lib/types/metrics'

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const metricId = searchParams.get('metricId') as YahooMetricId
  const period   = searchParams.get('period') || '3M'

  const symbol = YAHOO_SYMBOLS[metricId]
  if (!symbol) {
    return NextResponse.json({ error: `Unknown metricId: ${metricId}` }, { status: 400 })
  }

  const range = periodToYahooRange(period)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}`

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      next: { revalidate: 3600 },  // 1시간 캐시
    })
    if (!res.ok) throw new Error(`Yahoo ${res.status}`)

    const data = await res.json()

    const result = data.chart?.result?.[0]
    if (!result) throw new Error('No result from Yahoo')

    const timestamps: number[]  = result.timestamp ?? []
    const closes: (number|null)[] = result.indicators?.quote?.[0]?.close ?? []

    // null 제거 + timestamp → EST 날짜 변환
    const timeSeries: TimeSeriesPoint[] = timestamps
      .map((ts, i) => ({
        time:  yahooTimestampToDate(ts),
        value: closes[i],
      }))
      .filter((p): p is TimeSeriesPoint => p.value !== null && !isNaN(p.value))

    // 중복 날짜 제거 (같은 날짜면 마지막 값 유지)
    const deduped = new Map<string, number>()
    timeSeries.forEach(p => deduped.set(p.time, p.value))
    const finalSeries: TimeSeriesPoint[] = Array.from(deduped.entries())
      .map(([time, value]) => ({ time, value }))
      .sort((a, b) => a.time.localeCompare(b.time))

    const latestValue   = result.meta?.regularMarketPrice ?? finalSeries[finalSeries.length - 1]?.value ?? 0
    const previousClose = result.meta?.chartPreviousClose ?? finalSeries[finalSeries.length - 2]?.value ?? 0
    const latestDate    = finalSeries[finalSeries.length - 1]?.time ?? ''

    const response: YahooApiResponse = {
      metricId,
      timeSeries: finalSeries,
      latestValue,
      latestDate,
      previousClose,
    }

    return NextResponse.json(response)

  } catch (err) {
    console.error(`Yahoo fetch error [${metricId}]:`, err)
    return NextResponse.json({ error: 'Yahoo fetch failed' }, { status: 500 })
  }
}
```

---

## 8. 파이프라인 — FRED/ECOS와 동일 구조

```
Yahoo Finance API
  ↓ timestamp[] + close[] + meta.regularMarketPrice
/app/api/yahoo/route.ts
  ↓ null 제거 + EST 날짜 변환 + 중복 제거
YahooApiResponse { timeSeries, latestValue, previousClose, latestDate }
  ↓
useMetrics(id, period)
  ↓ change = latestValue - previousClose
  ↓ changePercent = (change / previousClose) × 100
  ├─ MetricSnapshot → MetricCard
  └─ TimeSeriesPoint[] → ChartModal / CompareTab
```

### change 계산 — Yahoo는 previousClose 직접 제공

```typescript
// FRED/ECOS: timeSeries[-1] - timeSeries[-2]
// Yahoo:     regularMarketPrice - chartPreviousClose (더 정확)

const change        = latestValue - previousClose
const changePercent = (change / previousClose) * 100
```

---

## 9. mockData (`/lib/mock/mockData.ts`에 추가)

```typescript
export const mockYahooSnapshots: Record<YahooMetricId, MetricSnapshot> = {
  // 증시
  sp500:   { id: 'sp500',   value: 5234.2,  change: +44.9,  changePercent: +0.87, updatedAt: '2026-06-17' },
  nasdaq:  { id: 'nasdaq',  value: 16420.3, change: +125.6, changePercent: +0.77, updatedAt: '2026-06-17' },
  kospi:   { id: 'kospi',   value: 2680.5,  change: -12.3,  changePercent: -0.46, updatedAt: '2026-06-17' },
  kosdaq:  { id: 'kosdaq',  value: 865.2,   change: -5.1,   changePercent: -0.59, updatedAt: '2026-06-17' },
  // 국제 환율
  dxy:     { id: 'dxy',     value: 119.5,   change: -0.61,  changePercent: -0.51, updatedAt: '2026-06-17' },
  eurUsd:  { id: 'eurUsd',  value: 1.157,   change: +0.01,  changePercent: +0.87, updatedAt: '2026-06-17' },
  usdJpy:  { id: 'usdJpy',  value: 160.24,  change: -0.27,  changePercent: -0.17, updatedAt: '2026-06-17' },
  usdCny:  { id: 'usdCny',  value: 6.763,   change: -0.01,  changePercent: -0.15, updatedAt: '2026-06-17' },
  // 원자재 (실제 현재가 기준)
  gold:    { id: 'gold',    value: 4337.0,  change: +12.0,  changePercent: +0.28, updatedAt: '2026-06-17' },
  silver:  { id: 'silver',  value: 71.2,    change: +1.4,   changePercent: +2.00, updatedAt: '2026-06-17' },
  wti:     { id: 'wti',     value: 81.0,    change: -0.8,   changePercent: -0.98, updatedAt: '2026-06-17' },
  brent:   { id: 'brent',   value: 83.5,    change: -0.7,   changePercent: -0.83, updatedAt: '2026-06-17' },
  natgas:  { id: 'natgas',  value: 3.1,     change: +0.05,  changePercent: +1.64, updatedAt: '2026-06-17' },
  copper:  { id: 'copper',  value: 4.85,    change: +0.02,  changePercent: +0.41, updatedAt: '2026-06-17' },
}
```

---

## 10. FRED / ECOS / Yahoo 비교 요약

| 구분 | FRED | ECOS | Yahoo |
|------|------|------|-------|
| 인증 | API 키 (서버) | API 키 (서버) | 없음 (User-Agent 필요) |
| 날짜 형식 | `YYYY-MM-DD` | `YYYYMMDD` / `YYYYMM` | Unix timestamp |
| 날짜 변환 | 그대로 | `ecosTimeToISO()` | `yahooTimestampToDate()` (EST) |
| 결측값 | `"."` 필터 | 없음 | `null` 필터 |
| change 계산 | timeSeries[-1] - [-2] | timeSeries[-1] - [-2] | regularMarketPrice - chartPreviousClose |
| 캐시 | 지표별 차등 | 지표별 차등 | 1시간 고정 |
| 중복 날짜 | 없음 | 없음 | 발생 가능 → 중복 제거 필요 |

---

## 11. Claude Code 지시사항

```
Yahoo Finance 연동 구현. 이 문서 기준으로.

파일 생성/수정 순서:
1. /lib/types/metrics.ts
   - YahooMetricId 타입 교체 (14개)
   - FredMetricId에서 dxy, eurUsd, usdJpy, usdCny, gold, silver, wti, brent, natgas, copper 제거
   - YahooApiResponse 타입 추가

2. /lib/utils/dateUtils.ts
   - yahooTimestampToDate() 추가 (EST 기준)

3. /lib/api/yahoo.ts
   - YAHOO_SYMBOLS (14개 심볼) 구현
   - periodToYahooRange() 구현

4. /app/api/yahoo/route.ts
   - Yahoo API Route 구현

5. /lib/api/fred.ts
   - FRED_SERIES에서 국제환율·원자재 제거
   - (dxy, eurUsd, usdJpy, usdCny, gold, silver, wti, brent, natgas, copper)

6. /lib/mock/mockData.ts
   - mockYahooSnapshots 추가 (14개)

7. /lib/hooks/useMetrics.ts
   - isYahooMetric() 함수에 14개 id 포함
   - YahooMetricId → /api/yahoo 호출

규칙:
- User-Agent 헤더 반드시 포함
- timestamp → EST 기준 날짜 변환 (yahooTimestampToDate 사용)
- null 값 반드시 필터링
- 중복 날짜 제거 (같은 날짜 마지막 값 유지)
- change = regularMarketPrice - chartPreviousClose
- 에러 시 mockYahooSnapshots fallback
- 캐시: 1시간 (next: { revalidate: 3600 })
```
