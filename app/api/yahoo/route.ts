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

  // 시장별 타임존 오프셋 및 라벨 결정
  const getTimezoneInfo = (symbol: string): { offset: number; label: string } => {
    // 한국 증시: UTC → KST (+9시간)
    if (symbol === '^KS11' || symbol === '^KQ11') {
      return { offset: 9 * 3600, label: 'KST' }
    }
    // 미국 증시: UTC → EDT (-4시간, 일광절약시간 기준)
    if (symbol === '^GSPC' || symbol === '^IXIC') {
      return { offset: -4 * 3600, label: 'EDT' }
    }
    // 중국 증시: UTC → CST (+8시간)
    if (symbol === '000001.SS') {
      return { offset: 8 * 3600, label: 'CST' }
    }
    // 원화 환율: UTC → KST (+9시간)
    if (symbol === 'KRW=X' || symbol === 'EURKRW=X' || symbol === 'JPYKRW=X' || symbol === 'CNYKRW=X') {
      return { offset: 9 * 3600, label: 'KST' }
    }
    // 원자재 및 국제 FX: UTC 그대로 (국제 시장)
    // DX-Y.NYB, EURUSD=X, JPY=X, CNY=X, GC=F, SI=F, CL=F, BZ=F, NG=F, HG=F
    return { offset: 0, label: 'UTC' }
  }

  const { offset: timezoneOffset, label: timezoneLabel } = getTimezoneInfo(symbol)

  // 1D일 때: 오늘 1분봉 + 과거 일봉 혼합
  const is1D = period === '1D'
  const range = periodToYahooRange(period)

  try {
    let finalSeries: TimeSeriesPoint[] = []
    let previousClose = 0
    let regularMarketPrice = 0
    let regularMarketTime = null
    let isMarketOpen = false

    if (is1D) {
      // 1D: 오늘 1분봉만 표시 (과거 일봉은 제외)

      // 1분봉 데이터 가져오기
      const intradayUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`
      const intradayRes = await fetch(intradayUrl, {
        headers: { 'User-Agent': USER_AGENT },
        next: { revalidate: 60 },  // 1분마다 갱신
      })

      if (intradayRes.ok) {
        const intradayData = await intradayRes.json()
        const intradayResult = intradayData.chart?.result?.[0]

        if (intradayResult) {
          const intradayTimestamps: number[] = intradayResult.timestamp ?? []
          const intradayCloses: (number|null)[] = intradayResult.indicators?.quote?.[0]?.close ?? []

          // 디버깅: 1분봉 데이터 범위 확인
          console.log(`[${metricId}] 1D mode - Intraday data count: ${intradayTimestamps.length}`)
          if (intradayTimestamps.length > 0) {
            const firstDate = new Date((intradayTimestamps[0] + timezoneOffset) * 1000).toISOString()
            const lastDate = new Date((intradayTimestamps[intradayTimestamps.length - 1] + timezoneOffset) * 1000).toISOString()
            console.log(`[${metricId}] 1D mode - Intraday range: ${firstDate} to ${lastDate}`)
          }

          // 1분봉 데이터를 Unix timestamp로 변환 (시장별 타임존 적용)
          const intradaySeries = intradayTimestamps
            .map((ts, i) => ({
              time: ts + timezoneOffset,
              value: intradayCloses[i],
            }))
            .filter((p): p is { time: number; value: number } =>
              p.value !== null && !isNaN(p.value)
            )

          // 1D 모드: 1분봉만 사용
          finalSeries = intradaySeries

          previousClose = intradayResult.meta?.chartPreviousClose ?? 0
          regularMarketPrice = intradayResult.meta?.regularMarketPrice ?? previousClose
          regularMarketTime = intradayResult.meta?.regularMarketTime ?? null
          isMarketOpen = intradaySeries.length > 0
        }
      }
    } else {
      // 다른 기간: 기존처럼 일봉만 가져오기
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}`
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        next: { revalidate: 300 }, // 5분마다 갱신 (기존 1시간 → 5분)
      })
      if (!res.ok) throw new Error(`Yahoo ${res.status}`)

      const data = await res.json()
      const result = data.chart?.result?.[0]
      if (!result) throw new Error('No result from Yahoo')

      const timestamps: number[] = result.timestamp ?? []
      const closes: (number|null)[] = result.indicators?.quote?.[0]?.close ?? []

      // 날짜로 변환
      const timeSeries: TimeSeriesPoint[] = timestamps
        .map((ts, i) => ({
          time: yahooTimestampToDate(ts, false),
          value: closes[i],
        }))
        .filter((p): p is TimeSeriesPoint => p.value !== null && !isNaN(p.value))

      // 중복 날짜 제거
      const deduped = new Map<string | number, number>()
      timeSeries.forEach(p => {
        const key = typeof p.time === 'string' ? p.time : p.time.toString()
        deduped.set(key, p.value)
      })
      finalSeries = Array.from(deduped.entries())
        .map(([time, value]) => ({ time, value }))
        .sort((a, b) => {
          const aTime = typeof a.time === 'string' ? a.time : a.time.toString()
          const bTime = typeof b.time === 'string' ? b.time : b.time.toString()
          return aTime.localeCompare(bTime)
        })

      previousClose = result.meta?.chartPreviousClose ?? finalSeries[finalSeries.length - 1]?.value ?? 0
      regularMarketPrice = result.meta?.regularMarketPrice ?? previousClose
      regularMarketTime = result.meta?.regularMarketTime ?? null
    }

    const latestValue = finalSeries[finalSeries.length - 1]?.value ?? previousClose
    const latestTime = finalSeries[finalSeries.length - 1]?.time
    const latestDate = typeof latestTime === 'string' ? latestTime : ''

    const response: YahooApiResponse = {
      metricId,
      timeSeries: finalSeries,
      latestValue,
      latestDate,
      previousClose,
      timezone: timezoneLabel,  // 타임존 정보 추가
      // 실시간 데이터 추가
      realtime: {
        price: regularMarketPrice,
        time: regularMarketTime,
        isMarketOpen,
      }
    }

    return NextResponse.json(response)

  } catch (err) {
    console.error(`Yahoo fetch error [${metricId}]:`, err)
    return NextResponse.json({ error: 'Yahoo fetch failed' }, { status: 500 })
  }
}
