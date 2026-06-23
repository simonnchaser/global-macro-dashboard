import { NextRequest, NextResponse } from 'next/server'
import { ECOS_SERIES, ECOS_CALCULATED } from '@/lib/api/ecos'
import { ecosTimeToISO, getEcosDateRange } from '@/lib/utils/dateUtils'
import type { EcosMetricId, TimeSeriesPoint, EcosApiResponse } from '@/lib/types/metrics'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const metricId = searchParams.get('metricId') as EcosMetricId
  const period   = searchParams.get('period') || '3M'

  const apiKey = process.env.ECOS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ECOS_API_KEY not set' }, { status: 500 })
  }

  // Handle calculated metrics: krSpread3y10y, krIgSpread, krHySpread
  if (metricId === 'krSpread3y10y') {
    return handleKrSpread3y10y(period, apiKey)
  }
  if (metricId === 'krIgSpread' || metricId === 'krHySpread') {
    return handleKrSpread(metricId, period, apiKey)
  }

  const config = ECOS_SERIES[metricId]
  if (!config) {
    return NextResponse.json({ error: `Unknown metricId: ${metricId}` }, { status: 400 })
  }

  try {
    const timeSeries = await fetchEcosSeries(metricId, period, apiKey, config)
    const latest = timeSeries[timeSeries.length - 1]

    const response: EcosApiResponse = {
      metricId,
      timeSeries,
      latestValue: latest?.value ?? 0,
      latestDate:  latest?.time  ?? '',
    }

    return NextResponse.json(response)

  } catch (err) {
    console.error(`ECOS fetch error [${metricId}]:`, err)
    return NextResponse.json({ error: 'ECOS fetch failed' }, { status: 500 })
  }
}

// ECOS 시리즈 fetch 헬퍼
async function fetchEcosSeries(
  metricId: EcosMetricId,
  period: string,
  apiKey: string,
  config?: typeof ECOS_SERIES[keyof typeof ECOS_SERIES]
): Promise<TimeSeriesPoint[]> {
  const seriesConfig = config ?? ECOS_SERIES[metricId]
  if (!seriesConfig) throw new Error(`No config for ${metricId}`)

  const { startTime, endTime } = getEcosDateRange(period, seriesConfig.cycle)

  const urlParts = [
    'https://ecos.bok.or.kr/api/StatisticSearch',
    apiKey,
    'json',
    'kr',
    '1',
    '10000',               // 충분히 크게 (최대 건수)
    seriesConfig.statCode,
    seriesConfig.cycle,
    startTime,
    endTime,
    seriesConfig.itemCode,
  ]

  // itemCode2가 있으면 추가 (계절조정 등)
  if (seriesConfig.itemCode2) {
    urlParts.push(seriesConfig.itemCode2)
  }

  const url = urlParts.join('/')

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
    .map((r: any) => {
      let value = parseFloat(r.DATA_VALUE)

      // 외환보유액: 백만달러 → 억달러 변환
      if (metricId === 'krFxReserves') {
        value = Math.round(value / 100) // 백만달러를 100으로 나누면 억달러
      }

      return {
        time: ecosTimeToISO(r.TIME, seriesConfig.cycle),
        value: value,
      }
    })

  // CPI: 지수 → YoY% 계산
  if (seriesConfig.needsYoY) {
    timeSeries = calculateYoY(timeSeries)
  }

  return timeSeries
}

// krSpread3y10y 처리 (kr10y - kr3y)
async function handleKrSpread3y10y(period: string, apiKey: string) {
  try {
    // kr3y + kr10y 병렬 fetch
    const [kr3yData, kr10yData] = await Promise.all([
      fetchEcosSeries('kr3y', period, apiKey),
      fetchEcosSeries('kr10y', period, apiKey),
    ])

    // 날짜 매칭 후 계산
    const kr3yMap = new Map(kr3yData.map(p => [p.time, p.value]))

    const timeSeries = kr10yData
      .filter(p => kr3yMap.has(p.time))
      .map(p => ({
        time: p.time,
        value: Math.round((p.value - kr3yMap.get(p.time)!) * 100 * 10) / 10
        // (10Y - 3Y) × 100 = bp, 소수점 1자리
      }))

    const latest = timeSeries[timeSeries.length - 1]

    const response: EcosApiResponse = {
      metricId: 'krSpread3y10y',
      timeSeries,
      latestValue: latest?.value ?? 0,
      latestDate: latest?.time ?? '',
    }

    return NextResponse.json(response)

  } catch (err) {
    console.error('ECOS krSpread3y10y calculation error:', err)
    return NextResponse.json({ error: 'Spread calculation failed' }, { status: 500 })
  }
}

// krIgSpread, krHySpread 처리
async function handleKrSpread(
  metricId: 'krIgSpread' | 'krHySpread',
  period: string,
  apiKey: string
) {
  try {
    // kr3y + (krCorpAA 또는 krCorpBBB) 병렬 fetch
    const corpId: EcosMetricId = metricId === 'krIgSpread' ? 'krCorpAA' : 'krCorpBBB'

    const [kr3yData, corpData] = await Promise.all([
      fetchEcosSeries('kr3y', period, apiKey),
      fetchEcosSeries(corpId, period, apiKey),
    ])

    // 날짜 매칭 후 계산
    const kr3yMap = new Map(kr3yData.map(p => [p.time, p.value]))

    const timeSeries = corpData
      .filter(p => kr3yMap.has(p.time))
      .map(p => ({
        time: p.time,
        value: Math.round((p.value - kr3yMap.get(p.time)!) * 100 * 10) / 10
        // (회사채 - 국고채) × 100 = bp, 소수점 1자리
      }))

    const latest = timeSeries[timeSeries.length - 1]

    const response: EcosApiResponse = {
      metricId,
      timeSeries,
      latestValue: latest?.value ?? 0,
      latestDate: latest?.time ?? '',
    }

    return NextResponse.json(response)

  } catch (err) {
    console.error(`ECOS spread calculation error [${metricId}]:`, err)
    return NextResponse.json({ error: 'Spread calculation failed' }, { status: 500 })
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
