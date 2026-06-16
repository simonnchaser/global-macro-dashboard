# ECOS 데이터 스키마
## Global Macro Dashboard — 한국은행 ECOS 지표 전용

---

## 1. 우리가 ECOS로 불러올 지표

### ECOS 직접 fetch 지표

| MetricId | 지표명 | stat_code | item_code | cycle | 단위 | 변환 |
|----------|--------|-----------|-----------|-------|------|------|
| `bokRate` | BOK 기준금리 | `722Y001` | `0101000` | M | % | 없음 |
| `kr3y` | 국고채 3년 | `817Y002` | `010200000` | D | % | 없음 |
| `kr10y` | 국고채 10년 | `817Y002` | `010400000` | D | % | 없음 |
| `cpiKr` | 한국 CPI | `901Y009` | `0` | M | 지수 | YoY% 직접 계산 |
| `unemploymentKr` | 한국 실업률 | `901Y028` | `99988` | M | % | 없음 |
| `krCorpAA` | 회사채 AA- (3년) | `817Y002` | `010501000` | D | % | 없음 |
| `krCorpBBB` | 회사채 BBB- (3년) | `817Y002` | `010502000` | D | % | 없음 |

### 계산 지표 (서버사이드 계산)

| MetricId | 계산식 | 단위 | 의미 |
|----------|--------|------|------|
| `krIgSpread` | (krCorpAA - kr3y) × 100 | bp | 우량기업 신용 프리미엄. 미국 IG OAS 역할 |
| `krHySpread` | (krCorpBBB - kr3y) × 100 | bp | 고위험 신용 프리미엄. 미국 HY OAS 역할 |

> **계산 방식**: kr3y, krCorpAA, krCorpBBB 세 개를 병렬 fetch 후
> 날짜가 일치하는 포인트끼리 매칭해서 계산. spread10y2y와 동일한 패턴.

---

## 2. API URL 구조

```
GET https://ecos.bok.or.kr/api/StatisticSearch
  /{API_KEY}
  /json
  /kr
  /{startNo}/{endNo}
  /{stat_code}
  /{cycle}
  /{startTime}/{endTime}
  /{item_code}
```

### 날짜 형식 — 주기별로 다름

| 주기 | cycle | 날짜 형식 | 예시 |
|------|-------|----------|------|
| 년 | A | YYYY | 2020 |
| 분기 | Q | YYYYQN | 2020Q1 |
| 월 | M | YYYYMM | 202001 |
| 일 | D | YYYYMMDD | 20200101 |

### 실제 요청 URL 예시

```bash
# BOK 기준금리 (월별, 최근 2년)
https://ecos.bok.or.kr/api/StatisticSearch/{KEY}/json/kr/1/100/722Y001/M/202401/202612/0101000

# 국고채 10년 (일별, 최근 6개월)
https://ecos.bok.or.kr/api/StatisticSearch/{KEY}/json/kr/1/500/817Y002/D/20251201/20261231/010400000

# 한국 CPI (월별, YoY% 계산용 — 13개월 필요)
https://ecos.bok.or.kr/api/StatisticSearch/{KEY}/json/kr/1/100/901Y009/M/202501/202612/0
```

---

## 3. 응답 구조

```json
{
  "StatisticSearch": {
    "list_total_count": 100,
    "row": [
      {
        "STAT_CODE": "722Y001",
        "STAT_NAME": "기준금리",
        "ITEM_CODE1": "0101000",
        "ITEM_NAME1": "한국은행 기준금리",
        "TIME": "202601",
        "DATA_VALUE": "2.75",
        "UNIT_NAME": "%"
      }
    ]
  }
}
```

**우리가 쓸 필드: `TIME`, `DATA_VALUE`만**

---

## 4. 타입 정의 추가 (`/lib/types/metrics.ts`)

```typescript
// ECOS 지표 ID — FredMetricId와 분리
export type EcosMetricId =
  // ECOS 직접 fetch
  | 'bokRate'
  | 'kr3y'
  | 'kr10y'
  | 'cpiKr'
  | 'unemploymentKr'
  | 'krCorpAA'
  | 'krCorpBBB'
  // 계산 지표
  | 'krIgSpread'   // (krCorpAA - kr3y) × 100 (bp)
  | 'krHySpread'   // (krCorpBBB - kr3y) × 100 (bp)

// MetricSnapshot은 FRED와 동일한 구조 재사용
// TimeSeriesPoint도 동일 구조 재사용 ('YYYY-MM-DD')
```

---

## 5. 날짜 변환 (`/lib/utils/dateUtils.ts`에 추가)

```typescript
// ECOS 날짜 → 'YYYY-MM-DD'
export function ecosTimeToISO(time: string, cycle: string): string {
  if (cycle === 'D') {
    // 20260110 → 2026-01-10
    return `${time.slice(0,4)}-${time.slice(4,6)}-${time.slice(6,8)}`
  }
  if (cycle === 'M') {
    // 202601 → 2026-01-01 (월의 첫날로 통일)
    return `${time.slice(0,4)}-${time.slice(4,6)}-01`
  }
  if (cycle === 'Q') {
    // 2026Q1 → 2026-01-01
    const quarter = parseInt(time.slice(5))
    const month = String((quarter - 1) * 3 + 1).padStart(2, '0')
    return `${time.slice(0,4)}-${month}-01`
  }
  return time
}

// 기간별 startTime/endTime 계산 — ECOS 형식으로
export function getEcosDateRange(
  period: string,
  cycle: string
): { startTime: string; endTime: string } {
  const now = new Date()
  const endYear = now.getFullYear()
  const endMonth = now.getMonth() + 1

  // 종료날짜
  const endTime = cycle === 'D'
    ? `${endYear}${String(endMonth).padStart(2,'0')}31`
    : cycle === 'M'
    ? `${endYear}${String(endMonth).padStart(2,'0')}`
    : String(endYear)

  // 시작날짜 — period에서 역산
  const monthsBack: Record<string, number> = {
    '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '3Y': 36, '5Y': 60
  }
  const startDate = new Date(now)

  if (period === 'MAX') {
    const startTime = cycle === 'D' ? '19000101'
      : cycle === 'M' ? '190001'
      : '1900'
    return { startTime, endTime }
  }

  // CPI YoY% 계산을 위해 13개월 추가 확보
  const extraMonths = cycle === 'M' ? 13 : 0
  startDate.setMonth(startDate.getMonth() - (monthsBack[period] ?? 3) - extraMonths)

  const sy = startDate.getFullYear()
  const sm = startDate.getMonth() + 1

  const startTime = cycle === 'D'
    ? `${sy}${String(sm).padStart(2,'0')}01`
    : cycle === 'M'
    ? `${sy}${String(sm).padStart(2,'0')}`
    : String(sy)

  return { startTime, endTime }
}
```

---

## 6. ECOS API 매핑 (`/lib/api/ecos.ts`)

```typescript
import type { EcosMetricId } from '@/lib/types/metrics'

interface EcosSeriesConfig {
  statCode: string
  itemCode: string
  cycle: 'A' | 'Q' | 'M' | 'D'
  needsYoY: boolean
}

// 직접 fetch 지표만 포함 (계산 지표 제외)
export const ECOS_SERIES: Partial<Record<EcosMetricId, EcosSeriesConfig>> = {
  bokRate:        { statCode: '722Y001', itemCode: '0101000',   cycle: 'M', needsYoY: false },
  kr3y:           { statCode: '817Y002', itemCode: '010200000', cycle: 'D', needsYoY: false },
  kr10y:          { statCode: '817Y002', itemCode: '010400000', cycle: 'D', needsYoY: false },
  cpiKr:          { statCode: '901Y009', itemCode: '0',         cycle: 'M', needsYoY: true  },
  unemploymentKr: { statCode: '901Y028', itemCode: '99988',     cycle: 'M', needsYoY: false },
  krCorpAA:       { statCode: '817Y002', itemCode: '010501000', cycle: 'D', needsYoY: false },
  krCorpBBB:      { statCode: '817Y002', itemCode: '010502000', cycle: 'D', needsYoY: false },
}

// 계산 지표 목록
export const ECOS_CALCULATED = new Set<EcosMetricId>(['krIgSpread', 'krHySpread'])
```

---

## 7. API Route (`/app/api/ecos/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { ECOS_SERIES } from '@/lib/api/ecos'
import { ecosTimeToISO, getEcosDateRange } from '@/lib/utils/dateUtils'
import type { EcosMetricId, TimeSeriesPoint } from '@/lib/types/metrics'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const metricId = searchParams.get('metricId') as EcosMetricId
  const period   = searchParams.get('period') || '3M'

  const config = ECOS_SERIES[metricId]
  if (!config) {
    return NextResponse.json({ error: `Unknown metricId: ${metricId}` }, { status: 400 })
  }

  const apiKey = process.env.ECOS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ECOS_API_KEY not set' }, { status: 500 })
  }

  const { startTime, endTime } = getEcosDateRange(period, config.cycle)

  const url = [
    'https://ecos.bok.or.kr/api/StatisticSearch',
    apiKey,
    'json',
    'kr',
    '1',
    '10000',               // 충분히 크게 (최대 건수)
    config.statCode,
    config.cycle,
    startTime,
    endTime,
    config.itemCode,
  ].join('/')

  try {
    const res = await fetch(url, {
      next: { revalidate: getCacheTime(metricId) }
    })
    if (!res.ok) throw new Error(`ECOS ${res.status}`)

    const data = await res.json()

    // 에러 응답 처리
    if (data.RESULT) {
      throw new Error(`ECOS error: ${data.RESULT.MESSAGE}`)
    }

    const rows = data.StatisticSearch?.row ?? []

    // 파싱: TIME + DATA_VALUE → TimeSeriesPoint
    let timeSeries: TimeSeriesPoint[] = rows
      .filter((r: any) => r.DATA_VALUE && r.DATA_VALUE !== '')
      .map((r: any) => ({
        time:  ecosTimeToISO(r.TIME, config.cycle),
        value: parseFloat(r.DATA_VALUE),
      }))

    // CPI: 지수 → YoY% 계산
    if (config.needsYoY) {
      timeSeries = calculateYoY(timeSeries)
    }

    const latest = timeSeries[timeSeries.length - 1]

    return NextResponse.json({
      metricId,
      timeSeries,
      latestValue: latest?.value ?? 0,
      latestDate:  latest?.time  ?? '',
    })

  } catch (err) {
    console.error(`ECOS fetch error [${metricId}]:`, err)
    return NextResponse.json({ error: 'ECOS fetch failed' }, { status: 500 })
  }
}

// 지수 → YoY% 계산 (12개월 전 대비)
function calculateYoY(timeSeries: TimeSeriesPoint[]): TimeSeriesPoint[] {
  return timeSeries
    .slice(12)  // 앞 12개월은 비교 기준으로만 사용
    .map((point, i) => ({
      time: point.time,
      value: Math.round(
        ((point.value - timeSeries[i].value) / timeSeries[i].value) * 100 * 100
      ) / 100
    }))
}

// 캐시 시간 (초)
function getCacheTime(id: EcosMetricId): number {
  const daily   = new Set<EcosMetricId>(['kr3y', 'kr10y', 'krCorpAA', 'krCorpBBB'])
  const monthly = new Set<EcosMetricId>(['bokRate', 'cpiKr', 'unemploymentKr'])
  if (daily.has(id))   return 3600   // 1시간
  if (monthly.has(id)) return 86400  // 24시간
  return 3600
}
```

---

## 8. 파이프라인 — FRED와 동일 구조

```
ECOS API
  ↓ row[].TIME + DATA_VALUE
/app/api/ecos/route.ts
  ↓ 날짜 변환(ecosTimeToISO) + YoY% 계산(cpiKr만)
EcosApiResponse { timeSeries, latestValue, latestDate }
  ↓
useMetrics(id, period)
  ↓ change/changePercent 계산 (timeSeries[-1] - timeSeries[-2])
  ├─ MetricSnapshot → MetricCard
  └─ TimeSeriesPoint[] → ChartModal / CompareTab
```

---

## 9. FRED vs ECOS 차이 요약

| 구분 | FRED | ECOS |
|------|------|------|
| 엔드포인트 | query string 방식 | URL 경로 방식 |
| 날짜 형식 | `YYYY-MM-DD` (통일) | 주기별 다름 (D/M/Q) |
| 결측값 | `"."` 필터 필요 | 없음 (깔끔하게 옴) |
| YoY% | `units=pc1` 파라미터 | 직접 계산 필요 |
| 응답 키 | `observations[].date/value` | `row[].TIME/DATA_VALUE` |
| 인증 | `?api_key=` | URL 경로에 포함 |

---

## 10. mockData 추가 (`/lib/mock/mockData.ts`에 추가)

```typescript
export const mockEcosSnapshots: Record<EcosMetricId, MetricSnapshot> = {
  bokRate:        { id: 'bokRate',        value: 2.75, change: 0,     changePercent: 0,     updatedAt: '2026-05-01' },
  kr3y:           { id: 'kr3y',           value: 3.20, change: +0.02, changePercent: +0.63, updatedAt: '2026-06-10' },
  kr10y:          { id: 'kr10y',          value: 3.45, change: +0.02, changePercent: +0.58, updatedAt: '2026-06-10' },
  cpiKr:          { id: 'cpiKr',          value: 2.6,  change: +0.1,  changePercent: 0,     updatedAt: '2026-05-01' },
  unemploymentKr: { id: 'unemploymentKr', value: 3.1,  change: 0,     changePercent: 0,     updatedAt: '2026-05-01' },
  krCorpAA:       { id: 'krCorpAA',       value: 3.85, change: +0.01, changePercent: +0.26, updatedAt: '2026-06-10' },
  krCorpBBB:      { id: 'krCorpBBB',      value: 7.20, change: +0.05, changePercent: +0.70, updatedAt: '2026-06-10' },
}
```

---

## 11. Claude Code 지시사항

```
ECOS API 연동 구현. 이 문서 기준으로.

파일 생성/수정 순서:
1. /lib/types/metrics.ts        → EcosMetricId 타입 추가
2. /lib/utils/dateUtils.ts      → ecosTimeToISO, getEcosDateRange 추가
3. /lib/api/ecos.ts             → ECOS_SERIES 매핑 생성
4. /app/api/ecos/route.ts       → ECOS API Route 구현
5. /lib/mock/mockData.ts        → mockEcosSnapshots 추가
6. /lib/hooks/useMetrics.ts     → EcosMetricId도 처리하도록 확장
   (source 분기: EcosMetricId → /api/ecos 호출)

규칙:
- EcosMetricId 외 id 만들지 말 것
- API 키는 서버사이드에서만 (route.ts), 클라이언트 노출 금지
- cpiKr만 needsYoY: true → calculateYoY 적용
- 에러 시 mockEcosSnapshots fallback
- 날짜는 반드시 ecosTimeToISO 통해서 'YYYY-MM-DD'로 변환
- ECOS 에러 응답은 data.RESULT.MESSAGE로 확인
```
